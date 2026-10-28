/* 全量回归校验：所有城市 × 多组参数 */
import { CITY_PACKS } from '../src/data/index'
import { generateTrip, type TripRequest } from '../src/engine/itinerary'
import type { BudgetStyle, Pace, Tag } from '../src/data/types'

const STYLES: BudgetStyle[] = ['thrifty', 'balanced', 'premium']
const PACES: Pace[] = ['packed', 'balanced', 'relaxed']
const PREF_SETS: Tag[][] = [
  [],
  ['food', 'history'],
  ['nature', 'photo', 'mountain'],
  ['family', 'indoor', 'relax'],
  ['night', 'shopping', 'local'],
]

let issues = 0
const issuesLog: string[] = []

function fail(msg: string) {
  issues++
  if (issuesLog.length < 30) issuesLog.push(msg)
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

let cases = 0

for (const pack of CITY_PACKS) {
  for (const days of [1, 2, 3, 5, 7, 10]) {
    for (const style of STYLES) {
      for (const pace of PACES) {
        for (const prefs of PREF_SETS) {
          cases++
          const REQ: TripRequest = {
            cityId: pack.city.id,
            origin: '上海',
            days,
            budget: 8000,
            travelers: 2,
            style,
            pace,
            month: 6,
            prefs,
            includeTransport: true,
          }
          const plan = generateTrip(pack, REQ)
          const tag = `${pack.city.name}/${days}天/${style}/${pace}`

          // 1) 时间轴单调
          for (const d of plan.days) {
            let prev = -1
            for (const it of d.items) {
              const t = parseTime(it.startTime)
              if (t < prev - 0.01) fail(`${tag} D${d.day} 时间倒流 ${it.startTime}`)
              if (t < 0 || t > 23.99) fail(`${tag} D${d.day} 时间越界 ${it.startTime}`)
              prev = t
              const e = parseTime(it.endTime)
              if (e < t) fail(`${tag} D${d.day} 结束早于开始`)
              if (e > 23.99) fail(`${tag} D${d.day} 结束越界 ${it.endTime}`)
            }
          }

          // 2) 同一天不能有重复景点
          for (const d of plan.days) {
            const ids = d.items.map((i) => i.attraction.id)
            if (new Set(ids).size !== ids.length) fail(`${tag} D${d.day} 重复景点`)
          }

          // 3) 同一天内任意两点距离不超过 15km（这是引擎的真实约束）
          for (const d of plan.days) {
            for (let i = 0; i < d.items.length; i++) {
              for (let j = i + 1; j < d.items.length; j++) {
                const a = d.items[i].attraction
                const b = d.items[j].attraction
                const dd = Math.hypot(a.x - b.x, a.y - b.y)
                if (dd > 15.01) {
                  fail(`${tag} D${d.day} 同日间距 ${dd.toFixed(1)}km > 15km`)
                }
              }
            }
          }

          // 4) 每天夜间点不超过 1
          for (const d of plan.days) {
            const ev = d.items.filter((i) => i.attraction.bestTime === 'evening').length
            if (ev > 1) fail(`${tag} D${d.day} 夜间点 ${ev} 个`)
          }

          // 5) 每天点位数不超过上限
          const cap = { packed: 5, balanced: 3, relaxed: 2 }[pace]
          for (const d of plan.days) {
            if (d.items.length > cap) fail(`${tag} D${d.day} 点位数 ${d.items.length} > ${cap}`)
          }

          // 6) 交通费用非负
          for (const d of plan.days) {
            if (d.transitCost < 0) fail(`${tag} 负交通费`)
            for (const it of d.items) {
              if (it.transit && (it.transit.cost < 0 || it.transit.minutes < 0)) {
                fail(`${tag} 交通数据异常`)
              }
            }
          }

          // 7) 住宿推荐存在
          if (!plan.lodging.hotel.name) fail(`${tag} 无住宿推荐`)

          // 8) 预算明细合计接近总额
          const sum = plan.budgetItems.reduce((s, b) => s + b.amount, 0)
          if (Math.abs(sum - plan.totalBudget) > plan.totalBudget * 0.06) {
            fail(`${tag} 预算偏差 ${sum} vs ${plan.totalBudget}`)
          }

          // 9) 允许个别空天（间距约束下宁可留白也不硬排）
          //    但不能连续两天都空
          for (let d = 0; d < plan.days.length; d++) {
            if (plan.days[d].items.length === 0) {
              const prevEmpty =
                d > 0 && plan.days[d - 1].items.length === 0
              if (prevEmpty) fail(`${tag} D${d.day} 连续空天`)
            }
          }
        }
      }
    }
  }
}

console.log(`运行 ${cases} 组参数 × ${CITY_PACKS.length} 城市`)
if (issues === 0) {
  console.log('✅ 全部通过，无异常')
} else {
  console.log(`❌ ${issues} 个问题：`)
  issuesLog.forEach((m) => console.log('  - ' + m))
}

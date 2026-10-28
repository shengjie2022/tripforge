import { useEffect, useMemo, useState } from 'react'
import { getCityPack } from './data'
import { findOrigin } from './data/origins'
import type { BudgetStyle, Pace, Tag } from './data/types'
import { generateTrip, type TripRequest } from './engine/itinerary'
import { haversine } from './engine/geo'
import { CityPicker, OriginPicker } from './components/CityPicker'
import { TripForm } from './components/TripForm'
import { TripResult } from './components/TripResult'
import { AIEnhance } from './components/AIEnhance'
import './styles.css'

const DEFAULTS: TripRequest = {
  cityId: 'chengdu',
  origin: '上海',
  days: 4,
  budget: 6000,
  travelers: 2,
  style: 'balanced',
  pace: 'balanced',
  month: 10,
  prefs: ['food', 'history'],
  includeTransport: true,
}

function loadFromUrl(): TripRequest {
  const p = new URLSearchParams(window.location.search)
  const num = (k: string, d: number) => {
    const v = Number(p.get(k))
    return Number.isFinite(v) && v > 0 ? v : d
  }
  return {
    cityId: p.get('city') || DEFAULTS.cityId,
    origin: p.get('from') || DEFAULTS.origin,
    days: Math.min(15, num('d', DEFAULTS.days)),
    budget: num('b', DEFAULTS.budget),
    travelers: Math.min(10, num('p', DEFAULTS.travelers)),
    style: (p.get('s') as BudgetStyle) || DEFAULTS.style,
    pace: (p.get('pace') as Pace) || DEFAULTS.pace,
    month: Math.min(12, num('m', DEFAULTS.month)),
    prefs: (p.get('prefs')?.split(',').filter(Boolean) as Tag[]) || DEFAULTS.prefs,
    includeTransport: p.get('t') !== '0',
  }
}

export default function App() {
  const [req, setReq] = useState<TripRequest>(loadFromUrl)
  const [copied, setCopied] = useState(false)

  const pack = useMemo(() => getCityPack(req.cityId), [req.cityId])

  const plan = useMemo(() => {
    if (!pack) return null
    return generateTrip(pack, req)
  }, [pack, req])

  // 同步到 URL，方便分享
  useEffect(() => {
    const p = new URLSearchParams()
    p.set('city', req.cityId)
    if (req.origin) p.set('from', req.origin)
    p.set('d', String(req.days))
    p.set('b', String(req.budget))
    p.set('p', String(req.travelers))
    p.set('s', req.style)
    p.set('pace', req.pace)
    p.set('m', String(req.month))
    if (req.prefs.length) p.set('prefs', req.prefs.join(','))
    if (!req.includeTransport) p.set('t', '0')
    window.history.replaceState(null, '', `?${p.toString()}`)
  }, [req])

  const patch = (part: Partial<TripRequest>) => setReq((r) => ({ ...r, ...part }))

  const share = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('复制这个链接分享给朋友：', url)
    }
  }

  const print = () => window.print()

  // 出发地与目的地的直线距离，用于交通方案提示
  const originInfo = useMemo(() => {
    if (!pack) return null
    const o = findOrigin(req.origin)
    if (!o) return null
    const km = haversine(o.coordinates, pack.city.coordinates)
    return { km: Math.round(km), city: o.name }
  }, [req.origin, pack])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✈</span>
          <span>
            行迹 · TripForge
            <small>输入条件，自动生成可执行的旅行方案</small>
          </span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={print}>
            打印 / 存 PDF
          </button>
          <button className="btn" onClick={share}>
            {copied ? '✓ 链接已复制' : '复制分享链接'}
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <CityPicker
            value={req.cityId}
            onChange={(id) => patch({ cityId: id })}
          />
          <OriginPicker
            value={req.origin}
            onChange={(v) => patch({ origin: v })}
          />
          <TripForm
            days={req.days}
            onDays={(v) => patch({ days: v })}
            budget={req.budget}
            onBudget={(v) => patch({ budget: v })}
            travelers={req.travelers}
            onTravelers={(v) => patch({ travelers: v })}
            style={req.style}
            onStyle={(v) => patch({ style: v })}
            pace={req.pace}
            onPace={(v) => patch({ pace: v })}
            month={req.month}
            onMonth={(v) => patch({ month: v })}
            prefs={req.prefs}
            onPrefs={(v) => patch({ prefs: v })}
            includeTransport={req.includeTransport}
            onIncludeTransport={(v) => patch({ includeTransport: v })}
          />
          <div className="form-foot">
            <button
              className="btn btn-primary"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              已生成 · 查看方案 ↓
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setReq(DEFAULTS)}
            >
              重置为默认条件
            </button>
          </div>
        </aside>

        <main className="main">
          {plan && pack ? (
            <>
              {originInfo && (
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'var(--text-faint)',
                    padding: '0 2px',
                  }}
                >
                  📍 {originInfo.city} → {pack.city.name} 直线约{' '}
                  {originInfo.km.toLocaleString()} km
                  {pack.city.overseas
                    ? ' · 需国际航班'
                    : originInfo.km > 1200
                      ? ' · 建议直飞'
                      : originInfo.km > 500
                        ? ' · 高铁或直飞均可'
                        : ' · 高铁优先'}
                </div>
              )}
              <TripResult plan={plan} pack={pack} />
              <AIEnhance plan={plan} pack={pack} />
            </>
          ) : (
            <div className="card">
              <div className="empty">
                <div className="empty-icon">🧭</div>
                <h3>还没有选择目的地</h3>
                <p>在左侧选择一个城市，右侧会立刻生成逐日路线图、交通方式与住宿建议。</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

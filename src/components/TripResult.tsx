import { HOTEL_TIER_LABELS, TIME_SLOT_LABELS, TRANSIT_LABELS, type CityPack } from '../data/types'
import type { DayPlan, TripPlan } from '../engine/itinerary'

const MODE_ICON: Record<string, string> = {
  walk: '🚶',
  metro: '🚇',
  bus: '🚌',
  taxi: '🚕',
  bike: '🚲',
  car: '🚗',
}

const BUDGET_COLORS = ['#4ade80', '#38bdf8', '#a78bfa', '#fbbf24', '#f472b6']

export function TripResult({
  plan,
  pack,
}: {
  plan: TripPlan
  pack: CityPack
}) {
  const { city } = pack
  return (
    <>
      {/* ---------- 概览 ---------- */}
      <div className="hero">
        <h1>
          {city.name} · {plan.request.days} 天
        </h1>
        <div className="hero-tag">
          {city.tagline} · {city.enName}
        </div>
        <div className="hero-desc">{city.intro}</div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-k">人均预算</div>
            <div className="stat-v">{plan.perPersonBudget.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-k">日均预算</div>
            <div className="stat-v">{plan.perDayBudget.toLocaleString()}</div>
          </div>
          <div className="stat">
            <div className="stat-k">推荐住宿片区</div>
            <div className="stat-v plain">{plan.lodging.hotel.zone || '—'}</div>
          </div>
          <div className="stat">
            <div className="stat-k">行程覆盖景点</div>
            <div className="stat-v plain">
              {plan.days.reduce((s, d) => s + d.items.length, 0)} 个
            </div>
          </div>
        </div>

        <div className="highlights">
          {city.highlights.map((h, i) => (
            <div className="highlight-item" key={i}>
              <span className="dot">▸</span>
              <span>{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- 最佳出行窗口 ---------- */}
      <div className="card">
        <div className="card-head">
          <div className="card-icon">🗓</div>
          <div className="card-title">出行时机</div>
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-dim)' }}>
          {plan.bestWindow}
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: 'var(--text-faint)',
            marginTop: 8,
            lineHeight: 1.6,
          }}
        >
          {city.climate}
        </div>
        <div className="tag-cloud" style={{ marginTop: 12 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <span
              key={m}
              className={`tag-chip${m === plan.request.month ? ' on' : ''}`}
              style={
                city.bestMonths.includes(m) && m !== plan.request.month
                  ? { borderColor: 'rgba(74,222,128,0.35)', color: 'var(--accent)' }
                  : undefined
              }
            >
              {m}月
            </span>
          ))}
        </div>
      </div>

      {/* ---------- 交通方案 ---------- */}
      <div className="card">
        <div className="card-head">
          <div className="card-icon">🚄</div>
          <div className="card-title">交通方案</div>
          <div className="card-sub">
            {plan.request.origin
              ? `从${plan.request.origin}出发`
              : '未指定出发地'}
          </div>
        </div>
        <div className="transport-grid">
          <div className="transport-box">
            <div className="tk">抵达方式</div>
            <div className="tv">{plan.transitPlan.arrival.mode}</div>
            <div className="tn">{plan.transitPlan.arrival.note}</div>
            <div className="tn" style={{ marginTop: 6, color: 'var(--accent)' }}>
              预估 {plan.transitPlan.arrival.cost.toLocaleString()} 元 ·{' '}
              {plan.transitPlan.arrival.duration}
            </div>
          </div>
          <div className="transport-box">
            <div className="tk">离开方式</div>
            <div className="tv">{plan.transitPlan.departure.mode}</div>
            <div className="tn">{plan.transitPlan.departure.note}</div>
          </div>
          <div className="transport-box">
            <div className="tk">市内主推交通</div>
            <div className="tv">
              {MODE_ICON[plan.transitPlan.cityTransit.mode]}{' '}
              {plan.transitPlan.cityTransit.label}
            </div>
            <div className="tn">{plan.transitPlan.cityTransit.note}</div>
            <div className="tn" style={{ marginTop: 6, color: 'var(--accent)' }}>
              约 {plan.transitPlan.cityTransit.dailyCost} 元/人/天
            </div>
          </div>
        </div>
      </div>

      {/* ---------- 每日行程 ---------- */}
      <div className="card">
        <div className="card-head">
          <div className="card-icon">🗺</div>
          <div className="card-title">每日路线</div>
          <div className="card-sub">共 {plan.days.length} 天</div>
        </div>
        {plan.days.map((day) => (
          <DayView key={day.day} day={day} />
        ))}
      </div>

      {/* ---------- 住宿 ---------- */}
      <div className="card">
        <div className="card-head">
          <div className="card-icon">🏨</div>
          <div className="card-title">建议住宿</div>
          <div className="card-sub">
            {plan.lodging.nights} 晚 ·{' '}
            {HOTEL_TIER_LABELS[plan.lodging.hotel.tier ?? 'comfort']}
          </div>
        </div>
        {plan.lodging.hotel.name ? (
          <>
            <div className="stay-main">
              <div>
                <div className="stay-name">{plan.lodging.hotel.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                  {plan.lodging.hotel.desc}
                </div>
                <div className="tag-cloud" style={{ marginTop: 8 }}>
                  {plan.lodging.hotel.tags.map((t) => (
                    <span className="pill" key={t}>
                      {t}
                    </span>
                  ))}
                  <span className="pill">评分 {plan.lodging.hotel.rating}</span>
                </div>
              </div>
              <div className="stay-price">
                {plan.lodging.hotel.price}
                <small> 元/晚</small>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 400 }}>
                  合计 {plan.lodging.totalCost.toLocaleString()} 元
                </div>
              </div>
            </div>
            <div className="stay-reason">{plan.lodging.reason}</div>
            {plan.lodging.alternatives.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: 12.5,
                    color: 'var(--text-faint)',
                    margin: '14px 0 8px',
                    fontWeight: 600,
                  }}
                >
                  其他备选
                </div>
                <div className="alt-hotels">
                  {plan.lodging.alternatives.map((h) => (
                    <div className="alt-hotel" key={h.id}>
                      <div className="n">{h.name}</div>
                      <div className="p">
                        {h.price} 元/晚 · {HOTEL_TIER_LABELS[h.tier]}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: 'var(--text-faint)',
                          marginTop: 3,
                        }}
                      >
                        {h.zone}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={{ color: 'var(--text-faint)' }}>暂无住宿数据</div>
        )}
      </div>

      {/* ---------- 预算 ---------- */}
      <div className="card">
        <div className="card-head">
          <div className="card-icon">💰</div>
          <div className="card-title">预算分配</div>
          <div className="card-sub">
            合计 {plan.totalBudget.toLocaleString()} 元
          </div>
        </div>
        <div className="budget-list">
          {plan.budgetItems.map((b, i) => (
            <div className="budget-row" key={b.key}>
              <div className="budget-label">{b.label}</div>
              <div className="budget-bar">
                <div
                  className="budget-fill"
                  style={{
                    width: `${Math.min(100, b.ratio * 100)}%`,
                    background: BUDGET_COLORS[i % BUDGET_COLORS.length],
                  }}
                />
              </div>
              <div className="budget-amt">{b.amount.toLocaleString()} 元</div>
              <div className="budget-detail">{b.detail}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid var(--border-soft)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13.5,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span style={{ color: 'var(--text-dim)' }}>
            按行程实际估算的花费合计
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>
            {plan.estimatedCost.toLocaleString()} 元
          </span>
        </div>
      </div>

      {/* ---------- 美食 ---------- */}
      {pack.foods.length > 0 && (
        <div className="card">
          <div className="card-head">
            <div className="card-icon">🍜</div>
            <div className="card-title">必吃清单</div>
            <div className="card-sub">{pack.foods.length} 种</div>
          </div>
          <div className="food-grid">
            {pack.foods.map((f) => (
              <div className="food-item" key={f.name}>
                <div className="food-name">
                  {f.name}
                  {f.price && <span className="food-price">{f.price}</span>}
                </div>
                <div className="food-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- 贴士 ---------- */}
      <div className="card">
        <div className="card-head">
          <div className="card-icon">💡</div>
          <div className="card-title">实用贴士</div>
        </div>
        <div className="tip-list">
          {plan.tips.map((t, i) => (
            <div className="tip-item" key={i}>
              <span style={{ flexShrink: 0 }}>▸</span>
              <span>{t}</span>
            </div>
          ))}
          {plan.warnings.map((w, i) => (
            <div className="tip-item warn-item" key={`w${i}`}>
              <span style={{ flexShrink: 0 }}>⚠</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function DayView({ day }: { day: DayPlan }) {
  if (!day.items.length) {
    return (
      <div className="day">
        <div className="day-head">
          <div className="day-num">{day.day}</div>
          <div className="day-zone">{day.title}</div>
          <div className="day-meta">
            <span>自由安排</span>
          </div>
        </div>
        <div className="day-body">
          <div className="day-note" style={{ margin: '4px 0 12px' }}>
            {day.note}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="day">
      <div className="day-head">
        <div className="day-num">{day.day}</div>
        <div className="day-zone">{day.title}</div>
        <div className="day-meta">
          <span>
            共 <b>{day.hours}</b> h
          </span>
          <span>
            门票 <b>{day.ticketCost}</b> 元
          </span>
          <span>
            交通 <b>{day.transitCost}</b> 元
          </span>
        </div>
      </div>
      <div className="day-body">
        {day.items.map((item, i) => (
          <div key={item.attraction.id}>
            {item.transit && (
              <div className="leg">
                <span className="leg-icon">
                  {MODE_ICON[item.transit.mode]}{' '}
                  {TRANSIT_LABELS[item.transit.mode]}
                </span>
                <span>{item.transit.minutes} 分钟</span>
                <span>· {item.transit.distanceKm} km</span>
                <span>· {item.transit.cost} 元</span>
              </div>
            )}
            <div className="stop">
              <div className="stop-rail">
                <div className="stop-time">
                  {item.startTime}
                  <small>{item.endTime}</small>
                </div>
                <div className="stop-dot" />
                {i < day.items.length - 1 && <div className="stop-line" />}
              </div>
              <div className="stop-main">
                <div className="stop-name">
                  {item.attraction.name}
                  {item.attraction.signature && <span className="pill sig">必去</span>}
                </div>
                <div className="stop-desc">{item.attraction.desc}</div>
                {item.attraction.tip && (
                  <div className="stop-tip">💡 {item.attraction.tip}</div>
                )}
                <div className="stop-meta">
                  <span className="pill">
                    {TIME_SLOT_LABELS[item.attraction.bestTime]}
                  </span>
                  <span className="pill">建议 {item.attraction.hours} 小时</span>
                  <span className="pill ticket">
                    {item.attraction.ticket > 0
                      ? `门票 ${item.attraction.ticket} 元`
                      : '免费'}
                  </span>
                  <span className="pill">{item.attraction.openTime}</span>
                  <span className="pill">评分 {item.attraction.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {day.note && (
        <div className="day-note" style={{ margin: '0 0 14px' }}>
          {day.note}
        </div>
      )}
    </div>
  )
}

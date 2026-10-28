import { useEffect, useMemo, useRef, useState } from 'react'
import { CITY_OPTIONS, searchCities, type CityOption } from '../data'
import { ORIGIN_CITIES } from '../data/origins'

interface Props {
  value: string
  onChange: (id: string) => void
}

export function CityPicker({ value, onChange }: Props) {
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => CITY_OPTIONS.find((c) => c.id === value) ?? null,
    [value]
  )
  const results = useMemo(() => searchCities(keyword), [keyword])

  // 点击外部关闭下拉
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (c: CityOption) => {
    onChange(c.id)
    setOpen(false)
    setKeyword('')
  }

  return (
    <div className="form-group" ref={boxRef}>
      <div className="label">目的地城市</div>
      <div className="city-search">
        {selected && !open ? (
          <button className="input" style={{ textAlign: 'left' }} onClick={() => setOpen(true)}>
            <span style={{ fontWeight: 600 }}>{selected.name}</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 13, marginLeft: 8 }}>
              {selected.enName}
            </span>
          </button>
        ) : (
          <input
            className="input"
            autoFocus
            placeholder="输入城市名，如 成都 / 京都 / bangkok"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
          />
        )}

        {open && (
          <div className="city-dropdown">
            {results.length === 0 && (
              <div className="city-option" style={{ color: 'var(--text-faint)' }}>
                没有匹配的城市
              </div>
            )}
            {results.map((c) => (
              <button
                key={c.id}
                className={`city-option${c.id === value ? ' sel' : ''}`}
                onClick={() => pick(c)}
              >
                <span className="city-opt-name">{c.name}</span>
                <span className="city-opt-meta">{c.enName}</span>
                {c.overseas && <span className="badge">境外</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface OriginProps {
  value: string
  onChange: (v: string) => void
}

export function OriginPicker({ value, onChange }: OriginProps) {
  return (
    <div className="form-group">
      <div className="label">出发地</div>
      <select
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">未指定（仅按目的地估算）</option>
        {ORIGIN_CITIES.map((o) => (
          <option key={o.id} value={o.name}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  )
}

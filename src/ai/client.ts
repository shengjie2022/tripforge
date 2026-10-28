/**
 * 可选的 AI 增强层
 *
 * 设计原则：**默认完全不用**。用户不填 Key，整个站点就是纯本地规则引擎，
 * 零网络请求、零配置、离线可用。
 *
 * 填了 Key 之后，额外做两件事：
 *   1. 让大模型基于已算好的行程数据，写一段更有人味的「出行提示」
 *   2. 让大模型为某个具体景点补一条本地化的额外提醒
 *
 * Key 只保存在浏览器 localStorage，不会上传到任何第三方服务器；
 * 请求由浏览器直接发往用户自己填的 baseUrl。
 */

export interface AIConfig {
  baseUrl: string
  apiKey: string
  model: string
}

const STORAGE_KEY = 'tripforge.ai.config'

export function loadAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const cfg = JSON.parse(raw) as AIConfig
    if (!cfg?.apiKey || !cfg?.baseUrl) return null
    return cfg
  } catch {
    return null
  }
}

export function saveAIConfig(cfg: AIConfig | null) {
  try {
    if (!cfg) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
  } catch {
    /* localStorage 不可用时静默降级 */
  }
}

export function clearAIConfig() {
  saveAIConfig(null)
}

/** 调用 OpenAI 兼容的 chat/completions 接口 */
export async function chat(
  cfg: AIConfig,
  system: string,
  user: string,
  signal?: AbortSignal
): Promise<string> {
  const url = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.7,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`接口返回 ${res.status} ${res.statusText}${body ? `：${body.slice(0, 200)}` : ''}`)
  }

  const json = await res.json()
  const content = json?.choices?.[0]?.message?.content
  if (typeof content !== 'string') throw new Error('返回格式不符合预期')
  return content.trim()
}

/**
 * 根据行程数据，请模型写一份「出行提示」。
 * 只传入已计算好的结构化事实，避免模型编造事实性的门票/交通信息。
 */
export async function generateTravelNote(
  cfg: AIConfig,
  payload: {
    city: string
    days: number
    month: number
    budget: number
    travelers: number
    pace: string
    style: string
    prefs: string[]
    highlights: string[]
    route: string
    warnings: string[]
  },
  signal?: AbortSignal
): Promise<string> {
  const system = `你是一位资深旅行规划师。用户已经有一套由本地规则引擎算好的行程数据，
你的任务是**基于给定事实**写一段 150-250 字的出行提示，帮他们把行程执行好。

严格规则：
- 只能使用给定的事实，不得编造票价、开放时间、具体店名或交通班次
- 不要重复罗列景点清单（用户已经能看到），要讲"怎么执行"层面的事：时间怎么分配、注意什么、怎么避坑
- 语气实用、具体、不说空话，不要用"总而言之""值得注意的是"这类套话
- 直接输出正文，不要标题、不要 markdown 语法、不要前后缀说明

只输出正文段落。`

  const user = `目的地：${payload.city}
天数：${payload.days} 天｜出行月份：${payload.month} 月｜人数：${payload.travelers} 人
总预算：${payload.budget} 元｜节奏：${payload.pace}｜消费风格：${payload.style}
兴趣偏好：${payload.prefs.join('、') || '均衡'}

城市亮点：
${payload.highlights.map((h) => `- ${h}`).join('\n')}

行程主线：
${payload.route}

已识别的风险提示：
${payload.warnings.map((w) => `- ${w}`).join('\n') || '（无）'}

请基于以上信息写一段出行提示。`

  return chat(cfg, system, user, signal)
}

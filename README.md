# 行迹 TripForge · 旅游攻略定制

> 在线体验：**<https://shengjie2022.github.io/tripforge/>**

输入**目的地、天数、预算、同行人数、消费风格、行程节奏、出行月份、兴趣偏好**，自动生成一份可执行的旅行方案：

- 逐日路线图（按片区聚类 + 最近邻排序，附每段交通方式/耗时/花费）
- 往返大交通与市内交通方案
- 住宿建议（按预算推导档位，按行程几何中心选位置）
- 预算分配明细与实际花费估算
- 必吃清单、实用贴士与风险提醒

**纯前端、零后端、零 API Key**，所有推荐逻辑在浏览器本地运行，离线也能用。

已内置 **16 座城市**：成都、西安、杭州、大理、厦门、长沙、青岛、重庆、北京、丽江、
京都、曼谷、新加坡、巴黎、巴厘岛、首尔。

---

## 快速开始

```bash
npm install
npm run dev      # 本地开发 http://localhost:5173
npm run build    # 产出 dist/
npm run preview  # 预览构建结果
```

跑一遍参数回归（4320 组参数 × 16 城市）：

```bash
npx tsx scripts/regression.ts
```

---

## 部署到 GitHub Pages

本项目已包含 `.github/workflows/deploy.yml`，推送到 `main` 分支即自动构建并发布。

### 1. 建仓并推送

```bash
git init -b main
git add .
git commit -m "feat: 旅游攻略定制站"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 2. 开启 Pages

仓库 → **Settings** → **Pages** → Source 选 **GitHub Actions**。

之后每次 push 到 `main` 会自动发布，网址形如：

```
https://<你的用户名>.github.io/<仓库名>/
```

### 3.（可选）自定义域名

Settings → Pages → Custom domain 填入你的域名，并在域名商处加一条 CNAME 指向
`<你的用户名>.github.io`。

> `vite.config.ts` 里用的是 `base: './'`（相对路径），所以项目站点和自定义域名都不用改配置。

### 推送失败时

如果 `git push` 报 `Failed to connect to 127.0.0.1 port 7890`，说明本机 git 的全局代理
（`http.proxy`）指向了一个没在运行的代理软件。两个办法：

```bash
# 办法 A：只对本仓库绕过代理（已写进本仓库的 .git/config）
git config --local http.proxy ""
git config --local https.proxy ""
git config --local http.version HTTP/1.1

# 办法 B：全局清除失效代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

若直连 443 也超时，是本地网络到 GitHub 的链路问题，配置代理软件后再试。

---

## 目录结构

```
src/
├── data/
│   ├── types.ts        # 全部类型定义（Tag / City / Attraction / Hotel ...）
│   ├── cities/         # 各城市数据包，一个城市一个文件
│   │   └── chengdu.ts  # 基准样板，新增城市照抄它的结构
│   ├── origins.ts      # 出发地候选（48 个，用于算往返大交通）
│   └── index.ts        # 城市注册表 + 搜索
├── engine/
│   ├── geo.ts          # 距离计算、交通方式选择、景点/住宿打分
│   └── itinerary.ts    # 行程生成主逻辑
├── ai/
│   └── client.ts       # 可选的大模型文案增强（OpenAI 兼容接口）
├── components/
│   ├── CityPicker.tsx  # 城市搜索 + 出发地选择
│   ├── TripForm.tsx    # 条件输入表单
│   ├── TripResult.tsx  # 结果展示
│   └── AIEnhance.tsx   # AI 增强面板
├── App.tsx
└── styles.css
scripts/
└── regression.ts       # 参数回归校验
```

### 坐标约定

每个城市内部使用**本地公里网格**：原点 `(0,0)` = 城市核心商圈中心，`x` 轴正东、`y` 轴正北，单位 km。
用于估算市内通勤时间，不做真实地理投影。**新增城市时务必按真实方位布点**，否则交通时长会失真。

---

## 新增一个城市

1. 复制 `src/data/cities/chengdu.ts` 为 `src/data/cities/<拼音>.ts`
2. 改导出名与内容：8-16 个景点、6-8 家酒店（覆盖三个档次）、4-5 种市内交通、8-10 种美食
3. 在 `src/data/index.ts` 里 import 并加入 `CITY_PACKS` 数组
4. 如需做出发地，在 `src/data/origins.ts` 补一条

引擎会自动把它纳入搜索和推荐，无需改其他文件。

---

## 推荐逻辑说明

| 环节 | 做法 |
| --- | --- |
| 选点 | 标签命中加分、评分加权、最佳月份匹配、标志景点保底 |
| 聚类 | **完全链接凝聚聚类**（MERGE_DIST = 8km），避免单链聚合把远郊点串进市区簇 |
| 分天 | 同日任意两点 ≤ **15km** 硬约束；离中心 > 18km 的远郊点当天只排远郊点；远郊簇最多占 `days-1` 天 |
| 天内排序 | 从片区重心最远的点出发走最近邻路径，减少折返 |
| 时间轴 | 按 `bestTime`（上午/下午/晚间）落到对应时段，自动避开饭点；最晚 22:30 收工 |
| 夜间配额 | 每天最多 1 个夜间景点，避免「连续三晚夜市」 |
| 交通 | 按距离选步行/骑行/地铁/公交/打车，用「时间 vs 花费」加权平衡 |
| 住宿 | 预算 → 档次（<320 经济 / <780 舒适 / 高端），再按行程几何中心筛位置 |
| 预算 | 按消费风格分配比例，住宿 = 档位 × 晚数，门票 = 行程实际合计 |

> 行程质量优先于景点数量：实在排不进当天的点会被直接放弃，不硬塞，允许个别空白天。

---

## 可选：接入大模型增强

不接也能用——默认全靠本地规则引擎。填入自己的 API Key 后，页面会额外生成一段
「贴心提示」，Key 只存在浏览器 `localStorage`，不会发给任何第三方：

- 接口地址：任意 OpenAI 兼容端点（填到 `/v1` 即可）
- 模型：填具体模型名
- Key：填自己的密钥

大模型只负责润色文案，**不允许编造事实**（票价、开放时间以数据文件与官方公告为准）。

---

## 技术栈

React 19 · TypeScript · Vite 8 · 零运行时依赖（无 UI 库、无图表库、无状态库）

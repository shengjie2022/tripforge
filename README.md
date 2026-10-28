# 行迹 TripForge · 旅游攻略定制

输入**目的地、天数、预算、同行人数、消费风格、行程节奏、出行月份、兴趣偏好**，自动生成一份可执行的旅行方案：

- 逐日路线图（按片区聚类 + 最近邻排序，附每段交通方式/耗时/花费）
- 往返大交通与市内交通方案
- 住宿建议（按预算推导档位，按行程几何中心选位置）
- 预算分配明细与实际花费估算
- 必吃清单、实用贴士与风险提醒

**纯前端、零后端、零 API Key**，所有推荐逻辑在浏览器本地运行，离线也能用。

---

## 快速开始

```bash
npm install
npm run dev      # 本地开发 http://localhost:5173
npm run build    # 产出 dist/
npm run preview  # 预览构建结果
```

---

## 部署到 GitHub Pages

本项目已包含 `.github/workflows/deploy.yml`，推送到 `main` 分支即自动构建并发布。

### 1. 建仓并推送

```bash
git init
git add .
git commit -m "feat: 旅游攻略定制站"
git branch -M main
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

---

## 目录结构

```
src/
├── data/
│   ├── types.ts        # 全部类型定义（Tag / City / Attraction / Hotel ...）
│   ├── cities/         # 各城市数据包，一个城市一个文件
│   │   └── chengdu.ts  # 基准样板，新增城市照抄它的结构
│   ├── origins.ts      # 出发地候选（用于算往返大交通）
│   └── index.ts        # 城市注册表 + 搜索
├── engine/
│   ├── geo.ts          # 距离计算、交通方式选择、景点/住宿打分
│   └── itinerary.ts    # 行程生成主逻辑
├── components/
│   ├── CityPicker.tsx  # 城市搜索选择器
│   ├── TripForm.tsx    # 条件输入表单
│   └── TripResult.tsx  # 结果展示
└── App.tsx
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
| 选点 | 标签命中 +34 分、评分 ×10、最佳月份匹配 ±8、标志景点保底 +22 |
| 分天 | 按 `zone` 片区聚类分天，片区过长再拆分，保证同一天点位地理集中 |
| 天内排序 | 从片区重心最远的点出发走最近邻路径，减少折返 |
| 时间轴 | 按 `bestTime`（上午/下午/晚间）落到对应时段，自动避开饭点 |
| 交通 | 按距离选步行/骑行/地铁/公交/打车，用「时间 vs 花费」加权平衡 |
| 住宿 | 预算 → 档次（<320 经济 / <780 舒适 / 高端），再按行程几何中心筛位置 |
| 预算 | 按消费风格分配比例，住宿=档位×晚数，门票=行程实际合计 |

---

## 技术栈

React 19 · TypeScript · Vite 8 · 零运行时依赖（无 UI 库、无图表库、无状态库）

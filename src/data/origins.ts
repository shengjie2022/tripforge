import type { City } from './types'

/**
 * 出发地候选列表 —— 用于估算往返大交通（飞行距离 / 铁路时长）
 * 只收录主要客源地，覆盖全国主要区域
 */
export interface OriginCity extends Pick<City, 'id' | 'name' | 'coordinates'> {
  /** 是否有高铁直达（影响推荐飞机还是高铁） */
  hasHsr?: boolean
}

export const ORIGIN_CITIES: OriginCity[] = [
  { id: 'beijing', name: '北京', coordinates: [116.4074, 39.9042], hasHsr: true },
  { id: 'shanghai', name: '上海', coordinates: [121.4737, 31.2304], hasHsr: true },
  { id: 'guangzhou', name: '广州', coordinates: [113.2644, 23.1291], hasHsr: true },
  { id: 'shenzhen', name: '深圳', coordinates: [114.0579, 22.5431], hasHsr: true },
  { id: 'hangzhou', name: '杭州', coordinates: [120.1551, 30.2741], hasHsr: true },
  { id: 'chengdu', name: '成都', coordinates: [104.0665, 30.5728], hasHsr: true },
  { id: 'chongqing', name: '重庆', coordinates: [106.5516, 29.5630], hasHsr: true },
  { id: 'xian', name: '西安', coordinates: [108.9398, 34.3416], hasHsr: true },
  { id: 'nanjing', name: '南京', coordinates: [118.7969, 32.0603], hasHsr: true },
  { id: 'wuhan', name: '武汉', coordinates: [114.3055, 30.5928], hasHsr: true },
  { id: 'zhengzhou', name: '郑州', coordinates: [113.6254, 34.7466], hasHsr: true },
  { id: 'changsha', name: '长沙', coordinates: [112.9388, 28.2282], hasHsr: true },
  { id: 'jinan', name: '济南', coordinates: [117.1201, 36.6512], hasHsr: true },
  { id: 'tianjin', name: '天津', coordinates: [117.2008, 39.0842], hasHsr: true },
  { id: 'suzhou', name: '苏州', coordinates: [120.5853, 31.2989], hasHsr: true },
  { id: 'qingdao', name: '青岛', coordinates: [120.3826, 36.0671], hasHsr: true },
  { id: 'xiamen', name: '厦门', coordinates: [118.0894, 24.4798], hasHsr: true },
  { id: 'fuzhou', name: '福州', coordinates: [119.2965, 26.0745], hasHsr: true },
  { id: 'nanchang', name: '南昌', coordinates: [115.8581, 28.6820], hasHsr: true },
  { id: 'hefei', name: '合肥', coordinates: [117.2272, 31.8206], hasHsr: true },
  { id: 'guiyang', name: '贵阳', coordinates: [106.6302, 26.6477], hasHsr: true },
  { id: 'kunming', name: '昆明', coordinates: [102.8329, 24.8801], hasHsr: true },
  { id: 'lijiang', name: '丽江', coordinates: [100.2330, 26.8721], hasHsr: true },
  { id: 'dali', name: '大理', coordinates: [100.2676, 25.6065], hasHsr: true },
  { id: 'lanzhou', name: '兰州', coordinates: [103.8343, 36.0611], hasHsr: true },
  { id: 'xining', name: '西宁', coordinates: [101.7782, 36.6171], hasHsr: true },
  { id: 'urumqi', name: '乌鲁木齐', coordinates: [87.6168, 43.8256], hasHsr: true },
  { id: 'harbin', name: '哈尔滨', coordinates: [126.5349, 45.8038], hasHsr: true },
  { id: 'shenyang', name: '沈阳', coordinates: [123.4315, 41.8057], hasHsr: true },
  { id: 'dalian', name: '大连', coordinates: [121.6147, 38.9140], hasHsr: true },
  { id: 'taiyuan', name: '太原', coordinates: [112.5489, 37.8706], hasHsr: true },
  { id: 'hohhot', name: '呼和浩特', coordinates: [111.7519, 40.8414], hasHsr: true },
  { id: 'yinchuan', name: '银川', coordinates: [106.2789, 38.4872], hasHsr: true },
  { id: 'nanning', name: '南宁', coordinates: [108.3669, 22.8170], hasHsr: true },
  { id: 'haikou', name: '海口', coordinates: [110.1999, 20.0444], hasHsr: true },
  { id: 'sanya', name: '三亚', coordinates: [109.5083, 18.2479], hasHsr: false },
  { id: 'wuxi', name: '无锡', coordinates: [120.3119, 31.4912], hasHsr: true },
  { id: 'ningbo', name: '宁波', coordinates: [121.5497, 29.8683], hasHsr: true },
  { id: 'dongguan', name: '东莞', coordinates: [113.7518, 23.0207], hasHsr: true },
  { id: 'foshan', name: '佛山', coordinates: [113.1220, 23.0288], hasHsr: true },
  { id: 'yantai', name: '烟台', coordinates: [121.4479, 37.4638], hasHsr: true },
  { id: 'luoyang', name: '洛阳', coordinates: [112.4344, 34.6630], hasHsr: true },
  { id: 'nanyang', name: '南阳', coordinates: [112.5293, 32.9991], hasHsr: true },
  { id: 'mianyang', name: '绵阳', coordinates: [104.6796, 31.4675], hasHsr: true },
  { id: 'leshan', name: '乐山', coordinates: [103.7613, 29.5820], hasHsr: true },
  { id: 'yanbian', name: '延吉', coordinates: [129.5088, 42.8912], hasHsr: true },
  { id: 'chengde', name: '承德', coordinates: [117.9624, 40.9541], hasHsr: true },
  { id: 'hongkong', name: '香港', coordinates: [114.1694, 22.3193], hasHsr: true },
  { id: 'macau', name: '澳门', coordinates: [113.5439, 22.1987], hasHsr: true },
]

export function findOrigin(name: string): OriginCity | undefined {
  const kw = name.trim()
  if (!kw) return undefined
  return ORIGIN_CITIES.find((o) => o.name === kw)
}

const tencentMapLocalConfig = (() => {
  if (typeof require !== 'function') {
    return {};
  }
  try {
    return require('./config/tencent-map.js') || {};
  } catch (error) {
    return {};
  }
})();

App({
  globalData: {
    appName: '春日出游',
    slogan: '轻松规划每一次出发',
    trips: [
      {
        id: 'shanghai',
        city: '上海',
        dateRange: '7月3日 - 7月4日',
        startDate: '2026-07-03',
        daysLeft: 29,
        coverTheme: 'city',
        traffic: '高铁 G7012',
        trafficTime: '08:20 - 10:05',
        duration: '1小时45分',
        packed: 6,
        total: 17,
        tip: '提前整理证件和充电设备，出发当天更从容。',
        attractions: [
          { time: '09:30', name: '外滩', note: '先看江景和万国建筑群' },
          { time: '11:00', name: '南京路步行街', note: '步行衔接，适合午餐和购物' },
          { time: '14:00', name: '豫园', note: '下午避开早高峰，体验老城厢' },
          { time: '19:00', name: '陆家嘴', note: '夜景收尾，地铁返回方便' }
        ],
        routeHint: '推荐顺序：外滩 -> 南京路步行街 -> 豫园 -> 陆家嘴。路线以步行和地铁为主，减少往返折返。'
      },
      {
        id: 'hangzhou',
        city: '杭州',
        dateRange: '7月9日 - 7月10日',
        startDate: '2026-07-09',
        daysLeft: 35,
        coverTheme: 'lake',
        traffic: '动车 D3145',
        trafficTime: '09:10 - 11:36',
        duration: '2小时26分',
        packed: 9,
        total: 18,
        tip: '西湖步行较多，建议准备轻便鞋和防晒用品。',
        attractions: [
          { time: '10:00', name: '断桥残雪', note: '上午光线柔和，适合拍照' },
          { time: '11:00', name: '白堤', note: '沿湖步行，节奏轻松' },
          { time: '14:30', name: '灵隐寺', note: '下午乘车前往，预留排队时间' },
          { time: '18:00', name: '湖滨银泰', note: '晚餐和返程补给方便' }
        ],
        routeHint: '推荐顺序：断桥残雪 -> 白堤 -> 灵隐寺 -> 湖滨银泰。先湖边后景区，体力分配更均衡。'
      },
      {
        id: 'suzhou',
        city: '苏州',
        dateRange: '7月16日 - 7月17日',
        startDate: '2026-07-16',
        daysLeft: 42,
        coverTheme: 'garden',
        traffic: '城际列车 C3856',
        trafficTime: '07:55 - 08:40',
        duration: '45分钟',
        packed: 4,
        total: 16,
        tip: '园林游览适合轻装，雨伞和充电宝建议随身携带。',
        attractions: [
          { time: '09:00', name: '拙政园', note: '热门景点建议早到' },
          { time: '11:00', name: '苏州博物馆', note: '与拙政园距离近' },
          { time: '14:00', name: '平江路', note: '午后散步和小吃' },
          { time: '17:30', name: '山塘街', note: '傍晚看河街灯光' }
        ],
        routeHint: '推荐顺序：拙政园 -> 苏州博物馆 -> 平江路 -> 山塘街。相邻景点先串联，再去夜游街区。'
      }
    ],
    categories: [
      {
        id: 'docs',
        name: '证件',
        icon: '🪪',
        art: '/assets/icons/docs.svg',
        color: '#F7B267',
        items: [
          { id: 'idcard', name: '身份证', count: 1, icon: '🪪' },
          { id: 'passport', name: '护照', count: 1, icon: '📕' },
          { id: 'ticket', name: '车票/机票', count: 1, icon: '🎫' },
          { id: 'hotel', name: '酒店预订信息', count: 1, icon: '🏨' }
        ]
      },
      {
        id: 'electronics',
        name: '电子产品',
        icon: '🔌',
        art: '/assets/icons/electronics.svg',
        color: '#4A9FE8',
        items: [
          { id: 'phone', name: '手机', count: 1, icon: '📱' },
          { id: 'charger', name: '充电器', count: 1, icon: '🔌' },
          { id: 'powerbank', name: '充电宝', count: 1, icon: '🔋' },
          { id: 'earphone', name: '耳机', count: 1, icon: '🎧' },
          { id: 'camera', name: '相机', count: 1, icon: '📷' }
        ]
      },
      {
        id: 'clothes',
        name: '衣物',
        icon: '👕',
        art: '/assets/icons/clothes.svg',
        color: '#54C7B8',
        items: [
          { id: 'coat', name: '外套', count: 1, icon: '🧥' },
          { id: 'tshirt', name: '短袖', count: 2, icon: '👕' },
          { id: 'pants', name: '长裤', count: 1, icon: '👖' },
          { id: 'shoes', name: '轻便鞋', count: 1, icon: '👟' }
        ]
      },
      {
        id: 'travel',
        name: '旅行用品',
        icon: '🎒',
        art: '/assets/icons/travel.svg',
        color: '#9CCB86',
        items: [
          { id: 'bag', name: '随身包', count: 1, icon: '👜' },
          { id: 'backpack', name: '背包', count: 1, icon: '🎒' },
          { id: 'bottle', name: '水杯', count: 1, icon: '🥤' },
          { id: 'umbrella', name: '雨伞', count: 1, icon: '🌂' },
          { id: 'pillow', name: '颈枕', count: 1, icon: '🧣' }
        ]
      },
      {
        id: 'wash',
        name: '洗漱用品',
        icon: '🧴',
        art: '/assets/icons/wash.svg',
        color: '#8BC6EC',
        items: [
          { id: 'toothbrush', name: '牙刷牙膏', count: 1, icon: '🪥' },
          { id: 'towel', name: '毛巾', count: 1, icon: '🧺' },
          { id: 'cleanser', name: '洗面奶', count: 1, icon: '🫧' },
          { id: 'sunscreen', name: '防晒霜', count: 1, icon: '🧴' }
        ]
      },
      {
        id: 'medicine',
        name: '药品',
        icon: '💊',
        art: '/assets/icons/medicine.svg',
        color: '#F4978E',
        items: [
          { id: 'cold', name: '感冒药', count: 1, icon: '💊' },
          { id: 'bandage', name: '创可贴', count: 1, icon: '🩹' },
          { id: 'motion', name: '晕车药', count: 1, icon: '🚗' },
          { id: 'mask', name: '口罩', count: 3, icon: '😷' }
        ]
      }
    ],
    templates: [
      { id: 'business', name: '商务出行', desc: '证件、电脑、正装、会议资料优先检查', icon: '💼', art: '/assets/icons/template-business.svg', tags: ['效率', '正式', '轻装'] },
      { id: 'weekend', name: '周末短途', desc: '适合 1-2 天游玩，主打轻便和应急用品', icon: '🌿', art: '/assets/icons/template-weekend.svg', tags: ['短途', '放松', '轻便'] },
      { id: 'graduate', name: '毕业旅行', desc: '兼顾拍照、游玩、交通票据和住宿信息', icon: '🎓', art: '/assets/icons/template-graduate.svg', tags: ['青春', '打卡', '纪念'] },
      { id: 'family', name: '亲子旅行', desc: '加入常用药、换洗衣物和孩子随身用品', icon: '🧸', art: '/assets/icons/template-family.svg', tags: ['家庭', '安全', '细致'] }
    ]
  },

  onLaunch() {
    if (!wx.getStorageSync('packedIds')) {
      wx.setStorageSync('packedIds', this.getDefaultPackedIds());
    }
  },

  getDefaultPackedIds() {
    return ['phone', 'charger', 'powerbank', 'bag', 'backpack', 'bottle'];
  },

  getPackedIds() {
    return wx.getStorageSync('packedIds') || [];
  },

  setPackedIds(ids) {
    wx.setStorageSync('packedIds', Array.from(new Set(ids)));
  },

  getTodayDate(input) {
    const date = input ? new Date(input) : new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  },

  calculateDaysLeft(startDate, todayInput) {
    const parts = String(startDate || '').split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return 0;
    }
    const target = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = this.getTodayDate(todayInput);
    return Math.max(0, Math.ceil((target - today) / 86400000));
  },

  withComputedTrip(trip, todayInput) {
    return {
      ...trip,
      daysLeft: trip.startDate ? this.calculateDaysLeft(trip.startDate, todayInput) : trip.daysLeft
    };
  },

  getTrips() {
    const customTrips = wx.getStorageSync('customTrips') || [];
    const overrides = wx.getStorageSync('tripOverrides') || {};
    return this.globalData.trips.concat(customTrips)
      .map(trip => this.withComputedTrip({
        ...trip,
        ...(overrides[trip.id] || {})
      }));
  },

  getCategories() {
    const customItems = wx.getStorageSync('customItems') || [];
    return this.globalData.categories.map(category => {
      const extraItems = customItems.filter(item => item.categoryId === category.id);
      return {
        ...category,
        items: category.items.concat(extraItems)
      };
    });
  },

  getAllItems() {
    return this.getCategories().reduce((list, category) => {
      return list.concat(category.items.map(item => ({ ...item, categoryId: category.id, categoryName: category.name })));
    }, []);
  },

  getCategoryProgress(category) {
    const packedIds = this.getPackedIds();
    const packed = category.items.filter(item => packedIds.includes(item.id)).length;
    return {
      packed,
      total: category.items.length,
      percent: category.items.length ? Math.round((packed / category.items.length) * 100) : 0
    };
  },

  getOverallProgress() {
    const items = this.getAllItems();
    const packedIds = this.getPackedIds();
    const packed = items.filter(item => packedIds.includes(item.id)).length;
    return {
      packed,
      total: items.length,
      percent: items.length ? Math.round((packed / items.length) * 100) : 0
    };
  },

  getRouteStrategies() {
    return [
      { id: 'time', name: '时间优先', icon: '⏱', desc: '按景点建议时间排序，适合有预约或固定场次的行程。' },
      { id: 'transfer', name: '少换乘', icon: '🧭', desc: '优先串联相邻区域，减少来回折返和跨区换乘。' },
      { id: 'distance', name: '距离优先', icon: '📍', desc: '用近邻顺序连接景点，适合步行和短途移动。' }
    ];
  },

  getTencentMapConfig() {
    return {
      key: tencentMapLocalConfig.key || '',
      geocoderUrl: 'https://apis.map.qq.com/ws/geocoder/v1/',
      directionBaseUrl: 'https://apis.map.qq.com/ws/direction/v1/'
    };
  },

  buildTencentRouteTargets(trip, strategyId = 'time') {
    const routePlan = this.buildRoutePlan(trip, strategyId);
    return routePlan.orderedAttractions.map(item => ({
      ...item,
      address: `${trip.city || ''}${item.name}`
    }));
  },

  buildTencentGeocoderRequest(city, attraction) {
    const config = this.getTencentMapConfig();
    return {
      url: config.geocoderUrl,
      data: {
        key: config.key,
        address: attraction.address || `${city || ''}${attraction.name}`
      }
    };
  },

  buildTencentDirectionRequest(from, to, mode) {
    const config = this.getTencentMapConfig();
    const routeType = mode === '步行' ? 'walking' : 'driving';
    return {
      url: `${config.directionBaseUrl}${routeType}/`,
      data: {
        key: config.key,
        from: `${from.lat},${from.lng}`,
        to: `${to.lat},${to.lng}`,
        output: 'json'
      }
    };
  },

  normalizeTencentCoordinate(value) {
    const number = Number(value) || 0;
    return Math.abs(number) > 1000 ? number / 1000000 : number;
  },

  normalizeTencentDelta(value) {
    const number = Number(value) || 0;
    return Math.abs(number) > 1 ? number / 1000000 : number;
  },

  roundCoordinate(value) {
    return Number(value.toFixed(6));
  },

  decodeTencentPolyline(polyline) {
    if (!Array.isArray(polyline) || polyline.length < 2) {
      return [];
    }

    let latitude = this.normalizeTencentCoordinate(polyline[0]);
    let longitude = this.normalizeTencentCoordinate(polyline[1]);
    const points = [{
      latitude: this.roundCoordinate(latitude),
      longitude: this.roundCoordinate(longitude)
    }];

    for (let index = 2; index < polyline.length - 1; index += 2) {
      latitude += this.normalizeTencentDelta(polyline[index]);
      longitude += this.normalizeTencentDelta(polyline[index + 1]);
      points.push({
        latitude: this.roundCoordinate(latitude),
        longitude: this.roundCoordinate(longitude)
      });
    }

    return points;
  },

  requestTencentMap(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: options.url,
        data: options.data,
        success: res => {
          if (res.data && res.data.status === 0) {
            resolve(res.data);
            return;
          }
          reject(new Error((res.data && res.data.message) || '腾讯地图接口返回异常'));
        },
        fail: error => {
          reject(new Error(error.errMsg || '腾讯地图请求失败'));
        }
      });
    });
  },

  async geocodeTencentAttraction(city, attraction) {
    const request = this.buildTencentGeocoderRequest(city, attraction);
    const data = await this.requestTencentMap(request);
    const location = data.result && data.result.location;
    if (!location) {
      throw new Error(`未找到景点坐标：${attraction.name}`);
    }
    return {
      ...attraction,
      lat: location.lat,
      lng: location.lng,
      address: request.data.address
    };
  },

  async requestTencentDirection(from, to, localSegment) {
    const request = this.buildTencentDirectionRequest(from, to, localSegment.mode);
    const data = await this.requestTencentMap(request);
    const route = data.result && data.result.routes && data.result.routes[0];
    if (!route) {
      throw new Error(`未找到路线：${from.name} 到 ${to.name}`);
    }
    return {
      ...localSegment,
      source: 'tencent',
      distance: route.distance || 0,
      distanceText: route.distance ? `${(route.distance / 1000).toFixed(1)}公里` : '距离待估',
      minutes: Number(route.duration) || localSegment.minutes,
      polylinePoints: this.decodeTencentPolyline(route.polyline),
      desc: `${localSegment.mode}约${Number(route.duration) || localSegment.minutes}分钟，腾讯地图估算距离${route.distance ? `${(route.distance / 1000).toFixed(1)}公里` : '待估'}。`
    };
  },

  formatTencentRouteError(error) {
    const message = error && error.message ? error.message : '';
    if (message.includes('每日调用量') || message.includes('达到上限')) {
      return '腾讯路线今日配额已用完，已切换本地推荐路线。';
    }
    if (message.includes('domain list')) {
      return '腾讯路线请求域名未放行，已切换本地推荐路线。';
    }
    if (message.includes('key')) {
      return `腾讯路线暂不可用：${message}，已切换本地推荐路线。`;
    }
    return message ? `腾讯路线暂不可用：${message}，已切换本地推荐路线。` : '腾讯地图路线暂不可用，已切换本地推荐路线。';
  },

  async buildTencentRoutePlan(trip, strategyId = 'time') {
    const localPlan = this.buildRoutePlan(trip, strategyId);
    try {
      if (!this.getTencentMapConfig().key) {
        throw new Error('腾讯地图 Key 未配置');
      }
      const targets = this.buildTencentRouteTargets(trip, strategyId);
      const located = [];
      for (const target of targets) {
        located.push(await this.geocodeTencentAttraction(trip.city, target));
      }
      const segments = [];
      for (let index = 0; index < located.length - 1; index += 1) {
        const localSegment = localPlan.segments[index];
        segments.push(await this.requestTencentDirection(located[index], located[index + 1], localSegment));
      }
      const transitMinutes = segments.reduce((sum, item) => sum + item.minutes, 0);
      const totalMinutes = localPlan.stayMinutes + transitMinutes;
      const transferCount = segments.filter(item => item.mode !== '步行').length;
      return {
        ...localPlan,
        source: 'tencent',
        orderedAttractions: located,
        segments,
        transitMinutes,
        totalMinutes,
        totalText: this.formatMinutes(totalMinutes),
        transferCount,
        summary: `腾讯地图路线：${localPlan.routeNames}。${localPlan.strategyName}预计游玩 ${this.formatMinutes(totalMinutes)}，交通约${transitMinutes}分钟，非步行换乘 ${transferCount} 次。`
      };
    } catch (error) {
      return {
        ...localPlan,
        source: 'local',
        errorMessage: this.formatTencentRouteError(error)
      };
    }
  },

  getAttractionMeta(name) {
    const metaMap = {
      '外滩': { area: '黄浦江畔', x: 1, y: 2, stayMinutes: 70, bestPeriod: '上午' },
      '南京路步行街': { area: '黄浦江畔', x: 2, y: 2, stayMinutes: 80, bestPeriod: '中午' },
      '豫园': { area: '黄浦老城', x: 3, y: 3, stayMinutes: 90, bestPeriod: '下午' },
      '陆家嘴': { area: '浦东滨江', x: 8, y: 2, stayMinutes: 90, bestPeriod: '夜晚' },
      '断桥残雪': { area: '西湖北线', x: 1, y: 2, stayMinutes: 45, bestPeriod: '上午' },
      '白堤': { area: '西湖北线', x: 2, y: 2, stayMinutes: 70, bestPeriod: '上午' },
      '灵隐寺': { area: '西湖西线', x: 6, y: 4, stayMinutes: 100, bestPeriod: '下午' },
      '湖滨银泰': { area: '湖滨商圈', x: 3, y: 1, stayMinutes: 90, bestPeriod: '夜晚' },
      '拙政园': { area: '姑苏老城', x: 2, y: 2, stayMinutes: 90, bestPeriod: '上午' },
      '苏州博物馆': { area: '姑苏老城', x: 3, y: 2, stayMinutes: 80, bestPeriod: '上午' },
      '平江路': { area: '姑苏老城', x: 3, y: 3, stayMinutes: 80, bestPeriod: '下午' },
      '山塘街': { area: '古城西北', x: 6, y: 2, stayMinutes: 90, bestPeriod: '夜晚' },
      '夫子庙': { area: '秦淮河畔', x: 2, y: 3, stayMinutes: 90, bestPeriod: '上午' },
      '中山陵': { area: '钟山风景区', x: 7, y: 4, stayMinutes: 120, bestPeriod: '下午' }
    };
    return metaMap[name] || {};
  },

  parseTimeToMinutes(time) {
    const matched = String(time || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!matched) {
      return 9 * 60;
    }
    return Number(matched[1]) * 60 + Number(matched[2]);
  },

  formatMinutes(minutes) {
    if (!minutes || minutes <= 0) {
      return '约0分钟';
    }
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (!hours) {
      return `约${rest}分钟`;
    }
    return rest ? `约${hours}小时${rest}分` : `约${hours}小时`;
  },

  normalizeAttractions(attractions) {
    return (attractions || []).map((item, index) => {
      const meta = this.getAttractionMeta(item.name);
      return {
        ...item,
        order: Number(item.order ?? index),
        area: item.area || meta.area || `区域${index + 1}`,
        x: Number(item.x ?? meta.x ?? index * 2),
        y: Number(item.y ?? meta.y ?? index),
        stayMinutes: Number(item.stayMinutes || meta.stayMinutes || 80),
        bestPeriod: item.bestPeriod || meta.bestPeriod || '灵活',
        timeValue: this.parseTimeToMinutes(item.time)
      };
    });
  },

  distanceBetween(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  estimateTransit(from, to) {
    const distance = this.distanceBetween(from, to);
    if (from.area === to.area || distance <= 1.8) {
      return { mode: '步行', minutes: 12, tip: '两个景点相邻，建议步行衔接。' };
    }
    if (distance <= 4.5) {
      return { mode: '地铁/公交', minutes: 25, tip: '距离适中，优先公共交通，减少等车成本。' };
    }
    return { mode: '地铁/打车', minutes: 38, tip: '跨区域移动，建议提前查看实时路况。' };
  },

  getTransitOptions(from, to) {
    const distance = Math.max(this.distanceBetween(from, to), 0.8);
    const nearby = from.area === to.area || distance <= 1.8;
    return [
      {
        mode: '步行',
        minutes: nearby ? 12 : Math.round(18 + distance * 7),
        cost: 0,
        tip: nearby ? '两个景点相邻，适合步行衔接。' : '距离略长，适合边走边逛时选择。'
      },
      {
        mode: '地铁',
        minutes: Math.round(16 + distance * 4),
        cost: distance > 4.5 ? 6 : 4,
        tip: '适合跨区域移动，时间稳定。'
      },
      {
        mode: '公交',
        minutes: Math.round(20 + distance * 6),
        cost: 2,
        tip: '适合预算优先，注意预留等车时间。'
      },
      {
        mode: '打车',
        minutes: Math.round(8 + distance * 5),
        cost: Math.round(12 + distance * 8),
        tip: '更省体力，适合赶时间或多人同行。'
      },
      {
        mode: '自驾',
        minutes: Math.round(10 + distance * 5),
        cost: Math.round(8 + distance * 5),
        tip: '适合自驾或租车行程，注意停车位置。'
      },
      {
        mode: '骑行',
        minutes: Math.round(10 + distance * 6),
        cost: 0,
        tip: '适合天气好、距离适中的路段。'
      }
    ];
  },

  getRouteSegmentKey(from, to) {
    return `${from}->${to}`;
  },

  getRouteSegmentModes(tripId) {
    const allModes = wx.getStorageSync('routeSegmentModes') || {};
    return allModes[tripId] || {};
  },

  updateRouteSegmentMode(tripId, from, to, mode) {
    const allModes = wx.getStorageSync('routeSegmentModes') || {};
    const tripModes = allModes[tripId] || {};
    const key = this.getRouteSegmentKey(from, to);
    wx.setStorageSync('routeSegmentModes', {
      ...allModes,
      [tripId]: {
        ...tripModes,
        [key]: mode
      }
    });
  },

  sortByNearest(attractions) {
    const rest = attractions.slice().sort((a, b) => a.timeValue - b.timeValue);
    const result = rest.length ? [rest.shift()] : [];
    while (rest.length) {
      const current = result[result.length - 1];
      let bestIndex = 0;
      rest.forEach((item, index) => {
        const best = rest[bestIndex];
        const currentDistance = this.distanceBetween(current, item);
        const bestDistance = this.distanceBetween(current, best);
        if (currentDistance < bestDistance || (currentDistance === bestDistance && item.timeValue < best.timeValue)) {
          bestIndex = index;
        }
      });
      result.push(rest.splice(bestIndex, 1)[0]);
    }
    return result;
  },

  sortByTransfer(attractions) {
    const areaOrder = {};
    attractions.forEach((item, index) => {
      if (areaOrder[item.area] === undefined) {
        areaOrder[item.area] = index;
      }
    });
    return attractions.slice().sort((a, b) => {
      if (a.area === b.area) {
        return a.order - b.order;
      }
      return areaOrder[a.area] - areaOrder[b.area];
    });
  },

  buildRoutePlan(trip, strategyId = 'time') {
    const strategies = this.getRouteStrategies();
    const strategy = strategyId === 'manual'
      ? { id: 'manual', name: '手动顺序' }
      : (strategies.find(item => item.id === strategyId) || strategies[0]);
    const attractions = this.normalizeAttractions(trip.attractions || []);
    let orderedAttractions = attractions.slice();

    if (strategy.id === 'time') {
      orderedAttractions.sort((a, b) => a.timeValue - b.timeValue);
    } else if (strategy.id === 'distance') {
      orderedAttractions = this.sortByNearest(attractions);
    } else if (strategy.id === 'transfer') {
      orderedAttractions = this.sortByTransfer(attractions);
    }

    const segmentModes = trip.id ? this.getRouteSegmentModes(trip.id) : {};
    const segments = orderedAttractions.slice(0, -1).map((item, index) => {
      const next = orderedAttractions[index + 1];
      const transit = this.estimateTransit(item, next);
      const options = this.getTransitOptions(item, next);
      const defaultMode = transit.mode.includes('打车')
        ? '打车'
        : transit.mode.includes('地铁') || transit.mode.includes('公交')
          ? '地铁'
          : transit.mode;
      const selectedMode = segmentModes[this.getRouteSegmentKey(item.name, next.name)];
      const selectedOption = options.find(option => option.mode === selectedMode)
        || options.find(option => option.mode === defaultMode)
        || transit;
      return {
        from: item.name,
        to: next.name,
        mode: selectedOption.mode,
        minutes: selectedOption.minutes,
        cost: Number(selectedOption.cost) || 0,
        tip: selectedOption.tip,
        options,
        title: `${item.name} -> ${next.name}`,
        desc: `${selectedOption.mode}约${selectedOption.minutes}分钟，${selectedOption.tip}`
      };
    });
    const stayMinutes = orderedAttractions.reduce((sum, item) => sum + item.stayMinutes, 0);
    const transitMinutes = segments.reduce((sum, item) => sum + item.minutes, 0);
    const transportBudget = segments.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    const transferCount = segments.filter(item => item.mode !== '步行').length;
    const routeNames = orderedAttractions.map(item => item.name).join(' -> ');
    const totalMinutes = stayMinutes + transitMinutes;

    return {
      strategyId: strategy.id,
      strategyName: strategy.name,
      orderedAttractions,
      routeNames,
      segments,
      stayMinutes,
      transitMinutes,
      transportBudget,
      totalMinutes,
      totalText: this.formatMinutes(totalMinutes),
      transferCount,
      summary: `推荐顺序：${routeNames}。${strategy.name}预计游玩 ${this.formatMinutes(totalMinutes)}，交通约${transitMinutes}分钟，非步行换乘 ${transferCount} 次，交通预算约 ¥${transportBudget}。`
    };
  },

  addTrip(data) {
    const customTrips = wx.getStorageSync('customTrips') || [];
    const city = (data.city || '').trim();
    const dateRange = (data.dateRange || '').trim() || '待定日期';
    const note = (data.note || '').trim();
    const attractions = this.parseAttractions(data.attractionsText);
    const routePlan = this.buildRoutePlan({ city, attractions }, 'time');
    const newTrip = {
      id: `custom-${Date.now()}`,
      city,
      dateRange,
      daysLeft: 15,
      coverTheme: 'lake',
      traffic: data.traffic && data.traffic.trim() ? data.traffic.trim() : '自定义交通',
      trafficTime: data.trafficTime && data.trafficTime.trim() ? data.trafficTime.trim() : '待填写',
      duration: data.duration && data.duration.trim() ? data.duration.trim() : '待估算',
      packed: 0,
      total: this.getAllItems().length,
      tip: note || '出发前检查证件、充电设备和天气变化。',
      attractions,
      routePlan,
      routeHint: `${routePlan.summary} 后续可接入地图服务生成真实导航路线。`
    };
    wx.setStorageSync('customTrips', customTrips.concat(newTrip));
    return newTrip;
  },

  getTripDayCount(trip) {
    if (Array.isArray(trip.itineraryDays) && trip.itineraryDays.length) {
      return trip.itineraryDays.length;
    }
    const matched = String(trip.dateRange || '').match(/(\d+)月(\d+)日\s*-\s*(?:(\d+)月)?(\d+)日/);
    if (!matched) {
      return 1;
    }
    const startMonth = Number(matched[1]);
    const startDay = Number(matched[2]);
    const endMonth = Number(matched[3] || matched[1]);
    const endDay = Number(matched[4]);
    if (!startMonth || !startDay || !endMonth || !endDay) {
      return 1;
    }
    const start = new Date(2026, startMonth - 1, startDay);
    const end = new Date(2026, endMonth - 1, endDay);
    return Math.max(1, Math.round((end - start) / 86400000) + 1);
  },

  getTripDays(trip) {
    const savedDays = Array.isArray(trip.itineraryDays) ? trip.itineraryDays : [];
    const dayCount = Math.max(this.getTripDayCount(trip), savedDays.length, 1);
    return Array.from({ length: dayCount }).map((_, index) => {
      const savedDay = savedDays[index] || {};
      const attractions = savedDay.attractions || (index === 0 ? (trip.attractions || []) : []);
      return {
        id: savedDay.id || `day-${index + 1}`,
        title: savedDay.title || `第${index + 1}天`,
        dateLabel: savedDay.dateLabel || '',
        attractions
      };
    });
  },

  getTripForDay(tripId, dayIndex = 0) {
    const trip = typeof tripId === 'string' ? this.getTripById(tripId) : tripId;
    const days = this.getTripDays(trip);
    const index = Math.min(Math.max(Number(dayIndex) || 0, 0), days.length - 1);
    const day = days[index] || days[0];
    return {
      ...trip,
      selectedDayIndex: index,
      activeDayTitle: day.title,
      dayTabs: days,
      attractions: day.attractions || []
    };
  },

  getTripById(id) {
    return this.getTrips().find(item => item.id === id) || this.getTrips()[0];
  },

  saveTripPatch(id, patch) {
    const overrides = wx.getStorageSync('tripOverrides') || {};
    wx.setStorageSync('tripOverrides', {
      ...overrides,
      [id]: {
        ...(overrides[id] || {}),
        ...patch
      }
    });
    return this.getTripById(id);
  },

  updateCustomTrip(id, patch) {
    const customTrips = wx.getStorageSync('customTrips') || [];
    const nextTrips = customTrips.map(item => {
      if (item.id !== id) {
        return item;
      }
      return {
        ...item,
        ...patch
      };
    });
    wx.setStorageSync('customTrips', nextTrips);
    return nextTrips.find(item => item.id === id) || this.getTripById(id);
  },

  moveTripSpot(tripId, index, delta, dayIndex = 0) {
    const trip = this.getTripForDay(tripId, dayIndex);
    const attractions = (trip.attractions || []).slice();
    const fromIndex = Number(index);
    const toIndex = fromIndex + Number(delta);
    if (fromIndex < 0 || fromIndex >= attractions.length || toIndex < 0 || toIndex >= attractions.length) {
      return trip;
    }
    const moved = attractions.splice(fromIndex, 1)[0];
    attractions.splice(toIndex, 0, moved);
    return this.saveTripAttractions(tripId, attractions, '已按手动顺序重新估算。', dayIndex);
  },

  normalizeTripSpot(data, index) {
    const name = (data.name || '').trim() || `景点${index + 1}`;
    const meta = this.getAttractionMeta(name);
    return {
      time: data.time || this.addMinutesToTime('09:00', index * 150),
      name,
      note: data.note || '按当天体力和交通情况灵活调整',
      area: data.area || meta.area || '',
      stayMinutes: Number(data.stayMinutes || meta.stayMinutes) || 80,
      bestPeriod: data.bestPeriod || meta.bestPeriod || '灵活',
      x: data.x ?? meta.x,
      y: data.y ?? meta.y,
      lat: data.lat,
      lng: data.lng
    };
  },

  saveTripAttractions(tripId, attractions, message, dayIndex = 0) {
    const trip = this.getTripById(tripId);
    const days = this.getTripDays(trip);
    const activeDayIndex = Math.min(Math.max(Number(dayIndex) || 0, 0), days.length - 1);
    const normalized = attractions.map((item, index) => this.normalizeTripSpot(item, index));
    const routePlan = this.buildRoutePlan({ ...trip, attractions: normalized }, 'manual');
    const itineraryDays = days.map((day, index) => ({
      ...day,
      attractions: index === activeDayIndex ? normalized : (day.attractions || [])
    }));
    const patch = {
      itineraryDays,
      routePlan,
      routeHint: `${routePlan.summary} ${message}`,
      routeMode: 'manual'
    };
    if (activeDayIndex === 0) {
      patch.attractions = normalized;
    }
    return this.saveTripPatch(tripId, {
      ...patch
    });
  },

  addTripSpot(tripId, data, dayIndex = 0) {
    const trip = this.getTripForDay(tripId, dayIndex);
    const attractions = (trip.attractions || []).slice();
    attractions.push(this.normalizeTripSpot(data || {}, attractions.length));
    return this.saveTripAttractions(tripId, attractions, '已新增景点。', dayIndex);
  },

  updateTripSpot(tripId, index, data, dayIndex = 0) {
    const trip = this.getTripForDay(tripId, dayIndex);
    const spotIndex = Number(index);
    const attractions = (trip.attractions || []).slice();
    if (spotIndex < 0 || spotIndex >= attractions.length) {
      return trip;
    }
    attractions[spotIndex] = this.normalizeTripSpot({
      ...attractions[spotIndex],
      ...(data || {})
    }, spotIndex);
    return this.saveTripAttractions(tripId, attractions, '已更新景点。', dayIndex);
  },

  removeTripSpot(tripId, index, dayIndex = 0) {
    const trip = this.getTripForDay(tripId, dayIndex);
    const spotIndex = Number(index);
    const attractions = (trip.attractions || []).slice();
    if (spotIndex < 0 || spotIndex >= attractions.length) {
      return trip;
    }
    attractions.splice(spotIndex, 1);
    return this.saveTripAttractions(tripId, attractions, '已删除景点。', dayIndex);
  },

  addMinutesToTime(time, minutes) {
    const base = this.parseTimeToMinutes(time);
    const next = base + Number(minutes || 0);
    const hours = Math.floor(next / 60) % 24;
    const rest = next % 60;
    return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
  },

  buildEditableTimeline(trip) {
    const normalized = this.normalizeAttractions(trip.attractions || []);
    let cursor = normalized[0] ? normalized[0].time : '09:00';
    const items = normalized.map((item, index) => {
      const startTime = index === 0 ? (item.time || cursor) : cursor;
      const endTime = this.addMinutesToTime(startTime, item.stayMinutes);
      const next = normalized[index + 1];
      const transit = next ? this.estimateTransit(item, next) : null;
      const nextStartTime = transit ? this.addMinutesToTime(endTime, transit.minutes) : endTime;
      cursor = nextStartTime;
      return {
        ...item,
        startTime,
        endTime,
        timeRange: `${startTime} - ${endTime}`,
        transportToNext: transit ? {
          mode: transit.mode,
          minutes: transit.minutes,
          tip: transit.tip
        } : null
      };
    });
    const routePlan = this.buildRoutePlan({ ...trip, attractions: normalized }, 'manual');
    const endTime = items.length ? items[items.length - 1].endTime : '待定';
    const conflicts = [];
    if (routePlan.totalMinutes > 10 * 60) {
      conflicts.push('这天安排偏满，建议减少 1 个景点或缩短停留时间。');
    }
    if (routePlan.segments.some(item => item.minutes >= 35)) {
      conflicts.push('存在距离较远的景点，建议确认交通方式或调整顺序。');
    }
    return {
      items,
      endTime,
      conflicts,
      summary: `预计 ${endTime} 结束，游玩 ${this.formatMinutes(routePlan.stayMinutes)}，交通约${routePlan.transitMinutes}分钟。`
    };
  },

  parseAttractions(text) {
    const lines = (text || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      return [
        { time: '09:00', name: '景点一', note: '建议安排在上午，体力更充足' },
        { time: '14:00', name: '景点二', note: '下午衔接交通，减少折返' },
        { time: '19:00', name: '夜景/美食街', note: '晚间放松收尾' }
      ];
    }

    return lines.map((line, index) => {
      const matched = line.match(/^(\d{1,2}:\d{2})\s+(.+)$/);
      const time = matched ? matched[1] : `${String(9 + index * 3).padStart(2, '0')}:00`;
      const content = matched ? matched[2] : line;
      const parts = content.split(/\s*-\s*/);
      return {
        time,
        name: parts[0] || `景点${index + 1}`,
        note: parts[1] || '按当天体力和交通情况灵活调整'
      };
    });
  },

  getBills(tripId) {
    const bills = wx.getStorageSync('tripBills') || [];
    return bills.filter(item => item.tripId === tripId);
  },

  addBill(tripId, data) {
    const bills = wx.getStorageSync('tripBills') || [];
    const bill = {
      id: `bill-${Date.now()}-${bills.length}`,
      tripId,
      title: (data.title || '旅行花费').trim(),
      category: data.category || '其他',
      amount: Number(data.amount) || 0,
      type: data.type === 'budget' ? 'budget' : 'actual',
      date: data.date || '',
      placeName: data.placeName || '',
      note: data.note || '',
      payment: data.payment || '未填写',
      paid: data.paid !== false
    };
    wx.setStorageSync('tripBills', bills.concat(bill));
    return bill;
  },

  updateBill(id, patch) {
    const bills = wx.getStorageSync('tripBills') || [];
    let updated = null;
    const nextBills = bills.map(item => {
      if (item.id !== id) {
        return item;
      }
      updated = {
        ...item,
        ...patch,
        amount: patch.amount !== undefined ? Number(patch.amount) || 0 : item.amount
      };
      return updated;
    });
    wx.setStorageSync('tripBills', nextBills);
    return updated;
  },

  removeBill(id) {
    const bills = wx.getStorageSync('tripBills') || [];
    wx.setStorageSync('tripBills', bills.filter(item => item.id !== id));
  },

  getBillSummary(tripId) {
    const bills = this.getBills(tripId);
    const names = ['交通', '住宿', '餐饮', '门票', '购物', '其他'];
    const budgetTotal = bills.filter(item => item.type === 'budget').reduce((sum, item) => sum + item.amount, 0);
    const actualTotal = bills.filter(item => item.type !== 'budget').reduce((sum, item) => sum + item.amount, 0);
    const categories = names.map(name => {
      const related = bills.filter(item => item.category === name);
      return {
        name,
        budget: related.filter(item => item.type === 'budget').reduce((sum, item) => sum + item.amount, 0),
        actual: related.filter(item => item.type !== 'budget').reduce((sum, item) => sum + item.amount, 0)
      };
    }).filter(item => item.budget || item.actual);
    const warnings = categories
      .filter(item => item.budget > 0 && item.actual > item.budget)
      .map(item => `${item.name}已超预算 ¥${item.actual - item.budget}，建议控制一下。`);
    return {
      budgetTotal,
      actualTotal,
      leftBudget: budgetTotal - actualTotal,
      categories,
      bills,
      warnings
    };
  },

  getFavoritePlaces(options = {}) {
    const saved = wx.getStorageSync('favoritePlaces');
    const places = saved && saved.length ? saved : [
      { id: 'fav-fuzimiao', name: '夫子庙', city: '南京', tag: '夜景', budget: 80, stayMinutes: 90, bestPeriod: '晚上', status: '想去', note: '秦淮河边适合散步拍照' },
      { id: 'fav-museum', name: '南京博物院', city: '南京', tag: '博物馆', budget: 0, stayMinutes: 120, bestPeriod: '下午', status: '想去', note: '建议提前预约' },
      { id: 'fav-xinjiekou', name: '新街口', city: '南京', tag: '美食', budget: 120, stayMinutes: 90, bestPeriod: '晚上', status: '想去', note: '晚餐和购物方便' }
    ];
    const filter = options.filter || '全部';
    if (!filter || filter === '全部') {
      return places;
    }
    return places.filter(item => item.status === filter || item.tag === filter || item.city === filter);
  },

  getFavoritePlaceFilters() {
    const dynamicTags = this.getFavoritePlaces().map(item => item.tag).filter(Boolean);
    return ['全部', '想去', '已安排', '美食', '酒店', '拍照点'].concat(dynamicTags)
      .filter((item, index, list) => list.indexOf(item) === index);
  },

  addFavoritePlace(data) {
    const places = this.getFavoritePlaces();
    const place = {
      id: `fav-${Date.now()}-${places.length}`,
      name: (data.name || '').trim(),
      city: data.city || '',
      tag: data.tag || '想去',
      budget: Number(data.budget) || 0,
      stayMinutes: Number(data.stayMinutes) || 80,
      bestPeriod: data.bestPeriod || '灵活',
      status: data.status || '想去',
      note: data.note || ''
    };
    wx.setStorageSync('favoritePlaces', places.concat(place));
    return place;
  },

  updateFavoritePlace(id, patch) {
    const places = this.getFavoritePlaces();
    let updated = null;
    const nextPlaces = places.map(item => {
      if (item.id !== id) {
        return item;
      }
      updated = {
        ...item,
        ...patch,
        budget: patch.budget !== undefined ? Number(patch.budget) || 0 : item.budget,
        stayMinutes: patch.stayMinutes !== undefined ? Number(patch.stayMinutes) || 80 : item.stayMinutes
      };
      return updated;
    });
    wx.setStorageSync('favoritePlaces', nextPlaces);
    return updated;
  },

  removeFavoritePlace(id) {
    const places = this.getFavoritePlaces();
    wx.setStorageSync('favoritePlaces', places.filter(item => item.id !== id));
  },

  addFavoritePlaceToTrip(placeId, tripId, dayIndex = 0) {
    const places = this.getFavoritePlaces();
    const place = places.find(item => item.id === placeId);
    const trip = this.getTripForDay(tripId, dayIndex);
    if (!place || !trip) {
      return trip;
    }
    const attractions = (trip.attractions || []).concat({
      time: this.addMinutesToTime('09:00', (trip.attractions || []).length * 150),
      name: place.name,
      note: place.note || `${place.tag} · 建议停留 ${place.stayMinutes} 分钟`,
      stayMinutes: place.stayMinutes,
      bestPeriod: place.bestPeriod
    });
    const nextPlaces = places.map(item => item.id === placeId ? { ...item, status: '已安排' } : item);
    wx.setStorageSync('favoritePlaces', nextPlaces);
    return this.saveTripAttractions(tripId, attractions, '已加入收藏地点。', dayIndex);
  },

  getMemos(tripId) {
    const memos = wx.getStorageSync('tripMemos') || [];
    return memos.filter(item => item.tripId === tripId);
  },

  getMemoCategories() {
    return ['出发前', '路上', '入住', '游玩', '返程', '重要事项'];
  },

  addMemo(tripId, data) {
    const memos = wx.getStorageSync('tripMemos') || [];
    const memo = {
      id: `memo-${Date.now()}-${memos.length}`,
      tripId,
      content: (data.content || '').trim(),
      category: data.category || '重要事项',
      date: data.date || '',
      remindTime: data.remindTime || '',
      placeName: data.placeName || '',
      transportId: data.transportId || '',
      done: Boolean(data.done)
    };
    wx.setStorageSync('tripMemos', memos.concat(memo));
    return memo;
  },

  updateMemo(id, patch) {
    const memos = wx.getStorageSync('tripMemos') || [];
    let updated = null;
    const nextMemos = memos.map(item => {
      if (item.id !== id) {
        return item;
      }
      updated = {
        ...item,
        ...patch,
        content: patch.content !== undefined ? String(patch.content).trim() : item.content
      };
      return updated;
    });
    wx.setStorageSync('tripMemos', nextMemos);
    return updated;
  },

  toggleMemoDone(id) {
    const memos = wx.getStorageSync('tripMemos') || [];
    let updated = null;
    const nextMemos = memos.map(item => {
      if (item.id !== id) {
        return item;
      }
      updated = {
        ...item,
        done: !item.done
      };
      return updated;
    });
    wx.setStorageSync('tripMemos', nextMemos);
    return updated;
  },

  removeMemo(id) {
    const memos = wx.getStorageSync('tripMemos') || [];
    wx.setStorageSync('tripMemos', memos.filter(item => item.id !== id));
  },

  getMemoSummary(tripId) {
    const memos = this.getMemos(tripId);
    const done = memos.filter(item => item.done).length;
    const byCategory = this.getMemoCategories().map(name => ({
      name,
      total: memos.filter(item => item.category === name).length,
      done: memos.filter(item => item.category === name && item.done).length
    })).filter(item => item.total);
    return {
      total: memos.length,
      done,
      undone: memos.length - done,
      byCategory,
      memos
    };
  },

  normalizeTransportCard(card, trip) {
    const type = card.type || '交通';
    return {
      ...card,
      role: card.role || '主要交通',
      type,
      icon: type.includes('飞机') || type.includes('航班') ? '✈️' : type.includes('自驾') ? '🚗' : type.includes('大巴') ? '🚌' : '🚄',
      code: card.code || card.title || '待填写班次',
      from: card.from || '出发地',
      to: card.to || (trip && trip.city) || '目的地',
      departTime: card.departTime || '待定',
      arriveTime: card.arriveTime || '待定',
      seat: card.seat || '座位待填',
      price: Number(card.price) || 0,
      remindMinutes: Number(card.remindMinutes) || 60,
      remindText: `出发前 ${Number(card.remindMinutes) || 60} 分钟提醒`,
      note: card.note || ''
    };
  },

  getSavedTransportCards(tripId) {
    const cards = wx.getStorageSync('tripTransports') || [];
    return cards.filter(item => item.tripId === tripId);
  },

  addTransportCard(tripId, data) {
    const cards = wx.getStorageSync('tripTransports') || [];
    const card = this.normalizeTransportCard({
      id: `transport-${Date.now()}-${cards.length}`,
      tripId,
      role: data.role || '去程',
      type: data.type || '高铁',
      code: (data.code || '').trim(),
      from: data.from || '',
      to: data.to || '',
      departTime: data.departTime || '',
      arriveTime: data.arriveTime || '',
      seat: data.seat || '',
      price: data.price,
      remindMinutes: data.remindMinutes,
      note: data.note || ''
    }, this.getTripById(tripId));
    wx.setStorageSync('tripTransports', cards.concat(card));
    return card;
  },

  updateTransportCard(id, patch) {
    const cards = wx.getStorageSync('tripTransports') || [];
    let updated = null;
    const nextCards = cards.map(item => {
      if (item.id !== id) {
        return item;
      }
      updated = this.normalizeTransportCard({ ...item, ...patch }, this.getTripById(item.tripId));
      return updated;
    });
    wx.setStorageSync('tripTransports', nextCards);
    return updated;
  },

  removeTransportCard(id) {
    const cards = wx.getStorageSync('tripTransports') || [];
    wx.setStorageSync('tripTransports', cards.filter(item => item.id !== id));
  },

  getTransportCards(trip) {
    const savedCards = this.getSavedTransportCards(trip.id);
    if (savedCards.length) {
      return savedCards.map(card => this.normalizeTransportCard(card, trip));
    }
    const text = trip.traffic || '自定义交通';
    const matched = text.match(/(飞机|航班|高铁|动车|火车|大巴|自驾)?\s*([A-Z]{1,3}\d{2,5}|G\d{1,5}|D\d{1,5}|C\d{1,5})?/i);
    const type = matched && matched[1] ? matched[1] : (text.includes('高铁') || text.includes('动车') ? '高铁' : '交通');
    const code = matched && matched[2] ? matched[2] : text;
    const parts = String(trip.trafficTime || '').split(/\s*-\s*/);
    return [this.normalizeTransportCard({
      id: `${trip.id}-transport-main`,
      tripId: trip.id,
      generated: true,
      role: '主要交通',
      type,
      code,
      from: trip.from || '出发地',
      to: trip.city || '目的地',
      departTime: parts[0] || '待定',
      arriveTime: parts[1] || '待定',
      seat: trip.seat || '座位待填',
      price: Number(trip.price) || 0,
      remindMinutes: 60
    }, trip)];
  },

  getCityMapCenter(city) {
    const centers = {
      '上海': { latitude: 31.2304, longitude: 121.4737 },
      '杭州': { latitude: 30.2741, longitude: 120.1551 },
      '苏州': { latitude: 31.2989, longitude: 120.5853 },
      '南京': { latitude: 32.0603, longitude: 118.7969 }
    };
    return centers[city] || { latitude: 31.2304, longitude: 121.4737 };
  },

  sameMapPoint(a, b) {
    return a && b && a.latitude === b.latitude && a.longitude === b.longitude;
  },

  getRouteLinePoints(routePlan, markerPoints) {
    const segments = (routePlan && routePlan.segments) || [];
    const routePoints = segments.reduce((list, segment) => {
      (segment.polylinePoints || []).forEach(point => {
        if (!this.sameMapPoint(list[list.length - 1], point)) {
          list.push(point);
        }
      });
      return list;
    }, []);

    if (routePoints.length) {
      return routePoints;
    }

    return markerPoints.map(item => ({
      latitude: item.latitude,
      longitude: item.longitude
    }));
  },

  getMapCenter(points, fallback) {
    if (!points.length) {
      return fallback;
    }
    const total = points.reduce((sum, point) => ({
      latitude: sum.latitude + point.latitude,
      longitude: sum.longitude + point.longitude
    }), { latitude: 0, longitude: 0 });

    return {
      latitude: this.roundCoordinate(total.latitude / points.length),
      longitude: this.roundCoordinate(total.longitude / points.length)
    };
  },

  getMapScale(points) {
    if (points.length < 2) {
      return 13;
    }
    const latitudes = points.map(point => point.latitude);
    const longitudes = points.map(point => point.longitude);
    const span = Math.max(
      Math.max(...latitudes) - Math.min(...latitudes),
      Math.max(...longitudes) - Math.min(...longitudes)
    );
    if (span > 0.12) {
      return 10;
    }
    if (span > 0.04) {
      return 11;
    }
    return 13;
  },

  buildRouteMapPreview(trip, routePlan) {
    const center = this.getCityMapCenter(trip.city);
    const attractions = routePlan && routePlan.orderedAttractions ? routePlan.orderedAttractions : this.normalizeAttractions(trip.attractions || []);
    const points = attractions.map((item, index) => ({
      latitude: Number(item.latitude || item.lat || (center.latitude + (4 - item.y) * 0.008)),
      longitude: Number(item.longitude || item.lng || (center.longitude + (item.x - 4) * 0.01)),
      name: item.name,
      order: index + 1
    }));
    const linePoints = this.getRouteLinePoints(routePlan, points);
    const mapCenter = this.getMapCenter(linePoints, center);
    return {
      latitude: mapCenter.latitude,
      longitude: mapCenter.longitude,
      scale: this.getMapScale(linePoints),
      markers: points.map(item => ({
        id: item.order,
        latitude: item.latitude,
        longitude: item.longitude,
        width: 28,
        height: 28,
        callout: {
          content: `${item.order}. ${item.name}`,
          color: '#1F2D3D',
          fontSize: 12,
          borderRadius: 12,
          bgColor: '#FFFFFF',
          padding: 6,
          display: 'ALWAYS'
        }
      })),
      polyline: linePoints.length > 1 ? [{
        points: linePoints,
        color: '#4A9FE8',
        width: 5,
        dottedLine: false,
        arrowLine: true
      }] : []
    };
  },

  getTripDetail(tripId) {
    const trip = this.getTripById(tripId);
    const routePlan = this.buildRoutePlan(trip, trip.routeMode === 'manual' ? 'manual' : 'time');
    const billSummary = this.getBillSummary(trip.id);
    const memoSummary = this.getMemoSummary(trip.id);
    const packingSummary = this.getOverallProgress();
    const transportCards = this.getTransportCards(trip);
    return {
      trip,
      routePlan,
      transportCards,
      memoSummary,
      billSummary,
      packingSummary,
      modules: [
        { id: 'route', name: '行程路线', desc: routePlan.totalText, url: '/pages/plan/plan' },
        { id: 'transport', name: '交通卡片', desc: transportCards[0].code, url: `/pages/detail/detail?id=${trip.id}` },
        { id: 'memo', name: '旅行备忘', desc: `${memoSummary.undone} 条待办`, url: `/pages/detail/detail?id=${trip.id}` },
        { id: 'bill', name: '账单预算', desc: `已花费 ${billSummary.actualTotal}`, url: `/pages/bills/bills?id=${trip.id}` },
        { id: 'packing', name: '行李清单', desc: `${packingSummary.packed}/${packingSummary.total}`, url: '/pages/checklist/checklist' },
        { id: 'favorite', name: '地点收藏', desc: '素材库', url: `/pages/favorites/favorites?id=${trip.id}` }
      ]
    };
  },

  getPackingLibraries() {
    return [
      {
        id: 'short',
        name: '短途旅行推荐',
        desc: '1-2 天轻装出发，重点补齐随身与电子用品。',
        icon: '🌿',
        items: [
          { categoryId: 'travel', name: '折叠购物袋', count: 1 },
          { categoryId: 'electronics', name: '备用数据线', count: 1 },
          { categoryId: 'wash', name: '旅行装洗护', count: 1 },
          { categoryId: 'medicine', name: '肠胃药', count: 1 }
        ]
      },
      {
        id: 'beach',
        name: '海边旅行推荐',
        desc: '适合海边、岛屿、亲水活动，补充防晒与防水物品。',
        icon: '🏖',
        items: [
          { categoryId: 'travel', name: '防水手机袋', count: 1 },
          { categoryId: 'clothes', name: '泳衣', count: 1 },
          { categoryId: 'wash', name: '晒后修护', count: 1 },
          { categoryId: 'travel', name: '沙滩拖鞋', count: 1 }
        ]
      },
      {
        id: 'family',
        name: '亲子旅行推荐',
        desc: '兼顾孩子用品、常用药和路上安抚物。',
        icon: '🧸',
        items: [
          { categoryId: 'medicine', name: '儿童退烧贴', count: 1 },
          { categoryId: 'travel', name: '湿纸巾', count: 2 },
          { categoryId: 'clothes', name: '备用衣物', count: 2 },
          { categoryId: 'travel', name: '小零食', count: 1 }
        ]
      },
      {
        id: 'business',
        name: '商务出行推荐',
        desc: '会议、差旅、短期办公常用物品。',
        icon: '💼',
        items: [
          { categoryId: 'electronics', name: '笔记本电脑', count: 1 },
          { categoryId: 'electronics', name: '电脑充电器', count: 1 },
          { categoryId: 'docs', name: '会议资料', count: 1 },
          { categoryId: 'clothes', name: '正装衬衫', count: 1 }
        ]
      },
      {
        id: 'camping',
        name: '露营旅行推荐',
        desc: '户外过夜、轻露营和野餐场景。',
        icon: '⛺',
        items: [
          { categoryId: 'travel', name: '头灯', count: 1 },
          { categoryId: 'travel', name: '野餐垫', count: 1 },
          { categoryId: 'medicine', name: '驱蚊用品', count: 1 },
          { categoryId: 'clothes', name: '防风外套', count: 1 }
        ]
      }
    ];
  },

  applyPackingLibrary(libraryId) {
    const library = this.getPackingLibraries().find(item => item.id === libraryId);
    if (!library) {
      return { added: 0, skipped: 0 };
    }
    let added = 0;
    let skipped = 0;
    library.items.forEach(item => {
      const result = this.addItem({
        categoryId: item.categoryId,
        name: item.name,
        count: item.count || 1,
        note: library.name
      }, { unique: true });
      if (result) {
        added += 1;
      } else {
        skipped += 1;
      }
    });
    return { added, skipped };
  },

  addItem(data, options = {}) {
    const customItems = wx.getStorageSync('customItems') || [];
    if (options.unique) {
      const exists = this.getAllItems().some(item => {
        return item.categoryId === data.categoryId && item.name === data.name.trim();
      });
      if (exists) {
        return null;
      }
    }
    const item = {
      id: `custom-item-${Date.now()}-${customItems.length}`,
      categoryId: data.categoryId,
      name: data.name.trim(),
      count: Number(data.count) || 1,
      note: data.note ? data.note.trim() : '',
      custom: true,
      icon: '✦'
    };
    wx.setStorageSync('customItems', customItems.concat(item));
    return item;
  },

  removeCustomItem(id) {
    const customItems = wx.getStorageSync('customItems') || [];
    wx.setStorageSync('customItems', customItems.filter(item => item.id !== id));
    const packedIds = this.getPackedIds().filter(itemId => itemId !== id);
    this.setPackedIds(packedIds);
  },

  packCategory(categoryId) {
    const category = this.getCategories().find(item => item.id === categoryId);
    if (!category) {
      return;
    }
    this.setPackedIds(this.getPackedIds().concat(category.items.map(item => item.id)));
  },

  unpackCategory(categoryId) {
    const category = this.getCategories().find(item => item.id === categoryId);
    if (!category) {
      return;
    }
    const categoryIds = category.items.map(item => item.id);
    this.setPackedIds(this.getPackedIds().filter(id => !categoryIds.includes(id)));
  },

  unpackAll() {
    this.setPackedIds([]);
  },

  removeCustomTrip(id) {
    const customTrips = wx.getStorageSync('customTrips') || [];
    wx.setStorageSync('customTrips', customTrips.filter(item => item.id !== id));
  },

  resetUserData() {
    wx.setStorageSync('customItems', []);
    wx.setStorageSync('customTrips', []);
    wx.setStorageSync('tripOverrides', {});
    wx.setStorageSync('tripBills', []);
    wx.setStorageSync('tripMemos', []);
    wx.setStorageSync('tripTransports', []);
    wx.setStorageSync('routeSegmentModes', {});
    wx.setStorageSync('favoritePlaces', []);
    wx.setStorageSync('preferredCategoryId', '');
    wx.setStorageSync('selectedTripId', '');
    this.setPackedIds(this.getDefaultPackedIds());
  }
});

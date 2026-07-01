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

const reminderLocalConfig = (() => {
  if (typeof require !== 'function') {
    return {};
  }
  try {
    return require('./config/reminder.js') || {};
  } catch (error) {
    return {};
  }
})();

App({
  globalData: {
    appName: '春日出游',
    slogan: '轻松规划每一次出发',
    reminderTemplateIds: reminderLocalConfig.templateIds || [],
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

  parseDateInput(value, todayInput) {
    const text = String(value || '').trim();
    const fullDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (fullDate) {
      return new Date(Number(fullDate[1]), Number(fullDate[2]) - 1, Number(fullDate[3]));
    }
    const shortDate = text.match(/(\d{1,2})月(\d{1,2})日/);
    if (!shortDate) {
      return null;
    }
    const base = todayInput ? new Date(todayInput) : new Date();
    return new Date(base.getFullYear(), Number(shortDate[1]) - 1, Number(shortDate[2]));
  },

  formatDateLabel(value) {
    const date = this.parseDateInput(value);
    if (!date) {
      return '';
    }
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  formatTripDateRange(startDate, endDate, fallback = '') {
    if (fallback && startDate && !endDate) {
      return fallback;
    }
    const start = this.formatDateLabel(startDate);
    const end = this.formatDateLabel(endDate);
    if (start && end && start !== end) {
      return `${start} - ${end}`;
    }
    return start || end || fallback || '待定日期';
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

  calculateTripStatus(startDate, endDate, todayInput) {
    const start = this.parseDateInput(startDate, todayInput);
    const end = this.parseDateInput(endDate || startDate, todayInput);
    const today = this.getTodayDate(todayInput);
    if (!start) {
      return '未出发';
    }
    if (today < start) {
      return '未出发';
    }
    if (end && today > end) {
      return '已结束';
    }
    return '旅行中';
  },

  withComputedTrip(trip, todayInput) {
    return {
      ...trip,
      dateRange: this.formatTripDateRange(trip.startDate, trip.endDate, trip.dateRange),
      daysLeft: trip.startDate ? this.calculateDaysLeft(trip.startDate, todayInput) : trip.daysLeft,
      status: this.calculateTripStatus(trip.startDate, trip.endDate, todayInput)
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
      directionBaseUrl: 'https://apis.map.qq.com/ws/direction/v1/',
      placeSearchUrl: 'https://apis.map.qq.com/ws/place/v1/search'
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

  getTencentDirectionMode(mode) {
    const text = String(mode || '');
    if (text.includes('步行')) {
      return { routeType: 'walking' };
    }
    if (text.includes('骑行')) {
      return { routeType: 'bicycling' };
    }
    if (text.includes('地铁') || text.includes('公交')) {
      return { routeType: 'transit', policy: 'LEAST_TIME' };
    }
    return { routeType: 'driving' };
  },

  buildTencentDirectionRequest(from, to, mode) {
    const config = this.getTencentMapConfig();
    const directionMode = this.getTencentDirectionMode(mode);
    const data = {
      key: config.key,
      from: `${from.lat},${from.lng}`,
      to: `${to.lat},${to.lng}`,
      output: 'json'
    };
    if (directionMode.policy) {
      data.policy = directionMode.policy;
    }
    return {
      url: `${config.directionBaseUrl}${directionMode.routeType}/`,
      data
    };
  },

  buildTencentPoiSearchRequest(keyword, city) {
    const config = this.getTencentMapConfig();
    return {
      url: config.placeSearchUrl,
      data: {
        key: config.key,
        keyword: String(keyword || '').trim(),
        boundary: `region(${city || '全国'},0)`,
        page_size: 10,
        page_index: 1
      }
    };
  },

  normalizeTencentPoi(poi) {
    const location = poi.location || {};
    return {
      name: poi.title || poi.name || '',
      address: poi.address || '',
      city: (poi.ad_info && poi.ad_info.city) || poi.city || '',
      lat: Number(location.lat || poi.lat) || 0,
      lng: Number(location.lng || poi.lng) || 0
    };
  },

  normalizePlaceName(name) {
    return String(name || '').replace(/[\s·,，。;；、-]/g, '');
  },

  findMatchingPoi(attraction, pois) {
    const targetName = this.normalizePlaceName(attraction.name);
    if (!targetName) {
      return null;
    }
    return (pois || []).find(item => {
      const poiName = this.normalizePlaceName(item.name || item.title);
      return poiName === targetName || poiName.includes(targetName) || targetName.includes(poiName);
    }) || null;
  },

  matchAttractionWithPoi(attraction, poi) {
    const matched = this.normalizeTencentPoi(poi || {});
    return {
      ...attraction,
      address: matched.address || attraction.address || '',
      city: matched.city || attraction.city || '',
      lat: matched.lat || attraction.lat,
      lng: matched.lng || attraction.lng
    };
  },

  matchAttractionsWithPois(attractions, pois) {
    return (attractions || []).map(attraction => {
      const poi = this.findMatchingPoi(attraction, pois);
      return poi ? this.matchAttractionWithPoi(attraction, poi) : attraction;
    });
  },

  async searchTencentPois(keyword, city) {
    const request = this.buildTencentPoiSearchRequest(keyword, city);
    const data = await this.requestTencentMap(request);
    return (data.data || []).map(item => this.normalizeTencentPoi(item));
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

  parseTencentDirectionData(data, localSegment) {
    const route = data.result && data.result.routes && data.result.routes[0];
    if (!route) {
      throw new Error(`未找到路线：${localSegment.from} 到 ${localSegment.to}`);
    }

    const steps = route.steps || [];
    const stepPoints = steps.reduce((points, step) => {
      return points.concat(this.decodeTencentPolyline(step.polyline));
    }, []);
    const transitLines = steps.reduce((lines, step) => {
      const stepLines = step.lines || [];
      return lines.concat(stepLines.map(item => item.title || item.name).filter(Boolean));
    }, []);
    const polylinePoints = this.decodeTencentPolyline(route.polyline);
    const minutes = Number(route.duration) || localSegment.minutes;
    const distance = Number(route.distance) || 0;
    const distanceText = distance ? `${(distance / 1000).toFixed(1)}公里` : '距离待估';
    const lineText = transitLines.length ? `，${transitLines.join(' / ')}` : '';

    return {
      ...localSegment,
      source: 'tencent',
      distance,
      distanceText,
      minutes,
      transitLines,
      polylinePoints: polylinePoints.length ? polylinePoints : stepPoints,
      desc: `${localSegment.mode}约${minutes}分钟，腾讯地图估算距离${distanceText}${lineText}。`
    };
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
    return this.parseTencentDirectionData(data, localSegment);
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
      '外滩': { area: '黄浦江畔', x: 1, y: 2, stayMinutes: 70, bestPeriod: '上午', address: '中山东一路', openingHours: '全天开放', ticketPrice: 0, reservation: '无需预约' },
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

  getAttractionDetail(spot) {
    const meta = this.getAttractionMeta(spot.name);
    const price = Number(spot.ticketPrice ?? meta.ticketPrice ?? 0);
    return {
      ...spot,
      address: spot.address || meta.address || '地址待补充',
      openingHours: spot.openingHours || meta.openingHours || '开放时间待确认',
      ticketPrice: price,
      ticketText: price ? `¥${price}` : '免费',
      reservation: spot.reservation || meta.reservation || '预约状态待确认',
      actionText: '加入收藏 / 加入行程'
    };
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
    const startDate = (data.startDate || '').trim();
    const endDate = (data.endDate || startDate).trim();
    const dateRange = this.formatTripDateRange(startDate, endDate, (data.dateRange || '').trim());
    const note = (data.note || '').trim();
    const dayGroups = Array.isArray(data.attractions) && data.attractions.length
      ? []
      : this.parseAttractionDays(data.attractionsText);
    const attractions = dayGroups.length
      ? dayGroups[0].attractions
      : Array.isArray(data.attractions) && data.attractions.length
        ? data.attractions.map(item => ({ ...item }))
        : this.parseAttractions(data.attractionsText);
    const routePlan = this.buildRoutePlan({ city, attractions }, 'time');
    const newTrip = {
      id: `custom-${Date.now()}`,
      city,
      dateRange,
      startDate,
      endDate,
      daysLeft: startDate ? this.calculateDaysLeft(startDate) : 15,
      status: this.calculateTripStatus(startDate, endDate),
      coverTheme: 'lake',
      traffic: data.traffic && data.traffic.trim() ? data.traffic.trim() : '自定义交通',
      trafficTime: data.trafficTime && data.trafficTime.trim() ? data.trafficTime.trim() : '待填写',
      duration: data.duration && data.duration.trim() ? data.duration.trim() : '待估算',
      packed: 0,
      total: this.getAllItems().length,
      tip: note || '出发前检查证件、充电设备和天气变化。',
      attractions,
      itineraryDays: dayGroups.length ? dayGroups : undefined,
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

  reorderTripSpot(tripId, fromIndex, toIndex, dayIndex = 0) {
    const trip = this.getTripForDay(tripId, dayIndex);
    const attractions = (trip.attractions || []).slice();
    const from = Number(fromIndex);
    const to = Number(toIndex);
    if (from < 0 || from >= attractions.length || to < 0 || to >= attractions.length || from === to) {
      return trip;
    }
    const moved = attractions.splice(from, 1)[0];
    attractions.splice(to, 0, moved);
    return this.saveTripAttractions(tripId, attractions, '已拖动调整顺序。', dayIndex);
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
      lat: data.lat !== undefined ? Number(data.lat) : undefined,
      lng: data.lng !== undefined ? Number(data.lng) : undefined,
      address: data.address || ''
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

    if (lines.length === 1 && /[，,、；;]/.test(lines[0])) {
      return this.parseNaturalAttractions(lines[0]);
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

  parseNaturalAttractions(text) {
    const timeMap = [
      { label: '上午', time: '09:00' },
      { label: '中午', time: '12:00' },
      { label: '下午', time: '14:30' },
      { label: '晚上', time: '19:00' },
      { label: '夜晚', time: '19:00' }
    ];
    return String(text || '')
      .split(/[，,、；;]/)
      .map(item => item.trim())
      .filter(Boolean)
      .map((item, index) => {
        const period = timeMap.find(option => item.includes(option.label));
        const dayMatched = item.match(/第[一二三四五六七八九十\d]+天/);
        const name = item
          .replace(/第[一二三四五六七八九十\d]+天/g, '')
          .replace(/上午|中午|下午|晚上|夜晚/g, '')
          .trim();
        return {
          time: period ? period.time : this.addMinutesToTime('09:00', index * 150),
          name: name || `景点${index + 1}`,
          note: `${dayMatched ? dayMatched[0] : '当天'}${period ? period.label : ''}导入`
        };
      });
  },

  parseDayNumber(value) {
    const numeric = Number(value);
    if (numeric) {
      return numeric;
    }
    const map = {
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
      十: 10
    };
    if (value === '十') {
      return 10;
    }
    if (value.startsWith('十')) {
      return 10 + (map[value.slice(1)] || 0);
    }
    if (value.includes('十')) {
      const parts = value.split('十');
      return (map[parts[0]] || 0) * 10 + (map[parts[1]] || 0);
    }
    return map[value] || 1;
  },

  parseAttractionDays(text) {
    const source = String(text || '').trim();
    const matcher = /第\s*([一二三四五六七八九十\d]+)\s*天/g;
    const matches = [];
    let matched = matcher.exec(source);
    while (matched) {
      matches.push({
        value: matched[1],
        index: matched.index
      });
      matched = matcher.exec(source);
    }
    if (!matches.length) {
      return [];
    }
    return matches.map((item, index) => {
      const next = matches[index + 1];
      const content = source.slice(item.index, next ? next.index : source.length);
      const dayNumber = this.parseDayNumber(item.value);
      return {
        id: `day-${dayNumber}`,
        title: `第${dayNumber}天`,
        dateLabel: '',
        attractions: this.parseNaturalAttractions(content)
      };
    }).filter(day => day.attractions.length);
  },

  getBills(tripId) {
    const bills = wx.getStorageSync('tripBills') || [];
    return bills
      .filter(item => item.tripId === tripId)
      .map(item => {
        const members = this.parseBillMembers(item.members);
        return {
          ...item,
          members,
          memberText: item.memberText || members.join('、')
        };
      });
  },

  parseBillMembers(value) {
    if (Array.isArray(value)) {
      return value.map(item => String(item).trim()).filter(Boolean);
    }
    return String(value || '')
      .split(/[,，、\s]+/)
      .map(item => item.trim())
      .filter(Boolean);
  },

  normalizeBillShare(data) {
    const payer = String(data.payer || '').trim();
    const members = this.parseBillMembers(data.members);
    if (payer && members.length && !members.includes(payer)) {
      members.push(payer);
    }
    return {
      payer,
      members,
      participants: Math.max(1, Number(data.participants) || 1, members.length || 0)
    };
  },

  addBill(tripId, data) {
    const bills = wx.getStorageSync('tripBills') || [];
    const share = this.normalizeBillShare(data);
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
      paid: data.paid !== false,
      participants: share.participants,
      payer: share.payer,
      members: share.members
    };
    bill.shareAmount = Math.round((bill.amount / (share.members.length || bill.participants)) * 100) / 100;
    bill.memberText = share.members.join('、');
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
      const share = this.normalizeBillShare({
        participants: patch.participants !== undefined ? patch.participants : item.participants,
        payer: patch.payer !== undefined ? patch.payer : item.payer,
        members: patch.members !== undefined ? patch.members : item.members
      });
      updated = {
        ...item,
        ...patch,
        amount: patch.amount !== undefined ? Number(patch.amount) || 0 : item.amount,
        participants: share.participants,
        payer: share.payer,
        members: share.members
      };
      updated.shareAmount = Math.round((updated.amount / (share.members.length || updated.participants)) * 100) / 100;
      updated.memberText = share.members.join('、');
      return updated;
    });
    wx.setStorageSync('tripBills', nextBills);
    return updated;
  },

  removeBill(id) {
    const bills = wx.getStorageSync('tripBills') || [];
    wx.setStorageSync('tripBills', bills.filter(item => item.id !== id));
  },

  buildAASettlements(bills) {
    return bills.reduce((list, bill) => {
      const share = this.normalizeBillShare(bill);
      const payer = share.payer;
      const members = share.members;
      const participantCount = members.length || share.participants;
      const shareAmount = Math.round((Number(bill.amount || 0) / participantCount) * 100) / 100;
      if (!payer || participantCount <= 1) {
        return list;
      }
      const debtors = members.length ? members.filter(name => name !== payer) : [];
      return list.concat(debtors.map(name => ({
        billId: bill.id,
        billTitle: bill.title,
        from: name,
        to: payer,
        amount: shareAmount,
        text: `${name}欠${payer} ¥${shareAmount}`
      })));
    }, []);
  },

  getBillSummary(tripId) {
    const bills = this.getBills(tripId);
    const names = ['交通', '住宿', '餐饮', '门票', '购物', '其他'];
    const budgetTotal = bills.filter(item => item.type === 'budget').reduce((sum, item) => sum + item.amount, 0);
    const actualTotal = bills.filter(item => item.type !== 'budget').reduce((sum, item) => sum + item.amount, 0);
    const routeBudget = bills
      .filter(item => item.type === 'budget' && item.category === '交通' && item.title.includes('市内交通预算'))
      .reduce((sum, item) => sum + item.amount, 0);
    const trafficActual = bills
      .filter(item => item.type !== 'budget' && item.category === '交通')
      .reduce((sum, item) => sum + item.amount, 0);
    const trafficDelta = trafficActual - routeBudget;
    const aaBills = bills.filter(item => {
      return item.type !== 'budget' && (Number(item.participants) > 1 || this.parseBillMembers(item.members).length > 1);
    });
    const aaTotal = aaBills.reduce((sum, item) => sum + item.amount, 0);
    const aaParticipants = aaBills.reduce((max, item) => {
      return Math.max(max, this.parseBillMembers(item.members).length || Number(item.participants) || 1);
    }, 0);
    const aaSettlements = this.buildAASettlements(aaBills);
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
    if (routeBudget > 0 && trafficActual > routeBudget) {
      warnings.push(`路线交通已超预估 ¥${trafficDelta}，建议核对打车或换乘花费。`);
    }
    return {
      budgetTotal,
      actualTotal,
      leftBudget: budgetTotal - actualTotal,
      routeBudget,
      trafficActual,
      trafficDelta,
      aaSummary: {
        total: aaTotal,
        participants: aaParticipants,
        average: aaParticipants ? Math.round((aaTotal / aaParticipants) * 100) / 100 : 0,
        settlements: aaSettlements
      },
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
      note: data.note || '',
      address: data.address || '',
      lat: data.lat !== undefined && data.lat !== '' ? Number(data.lat) : undefined,
      lng: data.lng !== undefined && data.lng !== '' ? Number(data.lng) : undefined
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
        stayMinutes: patch.stayMinutes !== undefined ? Number(patch.stayMinutes) || 80 : item.stayMinutes,
        lat: patch.lat !== undefined && patch.lat !== '' ? Number(patch.lat) : item.lat,
        lng: patch.lng !== undefined && patch.lng !== '' ? Number(patch.lng) : item.lng
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
      bestPeriod: place.bestPeriod,
      address: place.address || '',
      lat: place.lat,
      lng: place.lng
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

  getTripDayOverview(dayTrip, routePlan, memoSummary) {
    return {
      title: dayTrip.activeDayTitle || '第1天',
      spotCount: (dayTrip.attractions || []).length,
      routeText: routePlan.routeNames || '还没有景点',
      totalText: routePlan.totalText,
      transitMinutes: routePlan.transitMinutes,
      transportBudget: routePlan.transportBudget || 0,
      memoUndone: memoSummary.undone
    };
  },

  buildDayAssistantMemos(dayTrip, routePlan) {
    const spots = routePlan.orderedAttractions || [];
    const dayTitle = dayTrip.activeDayTitle || '当天';
    if (!spots.length) {
      return [];
    }
    const firstSpot = spots[0];
    const lastSpot = spots[spots.length - 1];
    const memos = [
      {
        content: `确认${dayTitle}交通和集合时间`,
        category: '路上',
        date: dayTitle,
        remindTime: firstSpot.time || '08:30',
        placeName: firstSpot.name,
        transportId: dayTrip.traffic || ''
      },
      {
        content: `确认${firstSpot.name}预约和开放时间`,
        category: '游玩',
        date: dayTitle,
        remindTime: '前一天20:00',
        placeName: firstSpot.name
      }
    ];
    if (spots.length > 1) {
      memos.push({
        content: `确认${lastSpot.name}后返程方式`,
        category: '返程',
        date: dayTitle,
        remindTime: lastSpot.time || '',
        placeName: lastSpot.name
      });
    }
    return memos;
  },

  applyDayAssistant(tripId, dayIndex = 0, currentRoutePlan) {
    const dayTrip = this.getTripForDay(tripId, dayIndex);
    const routePlan = currentRoutePlan || this.buildRoutePlan(dayTrip, 'manual');
    const dayTitle = dayTrip.activeDayTitle || `第${Number(dayIndex) + 1}天`;
    const memos = this.buildDayAssistantMemos(dayTrip, routePlan);
    const budget = Math.round(Number(routePlan.transportBudget) || 0);
    const bills = budget > 0 ? [
      {
        title: `${dayTitle}市内交通预算`,
        category: '交通',
        amount: budget,
        type: 'budget',
        date: dayTitle,
        note: routePlan.routeNames || ''
      }
    ] : [];
    const countAdded = (list, add) => {
      let added = 0;
      let skipped = 0;
      list.forEach(item => {
        if (add(item)) {
          added += 1;
        } else {
          skipped += 1;
        }
      });
      return { added, skipped };
    };
    const memoResult = countAdded(memos, item => this.addMemoOnce(dayTrip.id, item));
    const billResult = countAdded(bills, item => this.addBillOnce(dayTrip.id, item));
    return {
      dayTitle,
      memos: memoResult,
      bills: billResult,
      totalAdded: memoResult.added + billResult.added
    };
  },

  getTripDetail(tripId, dayIndex = 0) {
    const baseTrip = this.getTripById(tripId);
    const trip = this.getTripForDay(baseTrip.id, dayIndex);
    const routePlan = this.buildRoutePlan(trip, trip.routeMode === 'manual' ? 'manual' : 'time');
    const billSummary = this.getBillSummary(trip.id);
    const memoSummary = this.getMemoSummary(trip.id);
    const packingSummary = this.getOverallProgress();
    const transportCards = this.getTransportCards(trip);
    const dayOverview = this.getTripDayOverview(trip, routePlan, memoSummary);
    return {
      trip,
      dayTabs: trip.dayTabs || [],
      selectedDayIndex: trip.selectedDayIndex || 0,
      dayOverview,
      routePlan,
      transportCards,
      memoSummary,
      billSummary,
      packingSummary,
      modules: [
        { id: 'route', name: '行程路线', desc: `${dayOverview.spotCount} 个景点 · ${routePlan.totalText}`, url: '/pages/plan/plan' },
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

  getWeatherPackingLibraries() {
    return [
      {
        id: 'rain',
        name: '雨天出行',
        desc: '下雨、潮湿或台风季，优先补防水和替换用品。',
        icon: '☔',
        items: [
          { categoryId: 'travel', name: '防水鞋套', count: 1 },
          { categoryId: 'travel', name: '雨衣', count: 1 },
          { categoryId: 'electronics', name: '防水收纳袋', count: 1 },
          { categoryId: 'clothes', name: '备用袜子', count: 2 }
        ]
      },
      {
        id: 'sunny',
        name: '晴热天气',
        desc: '高温和强日照场景，补防晒、遮阳和补水用品。',
        icon: '☀️',
        items: [
          { categoryId: 'clothes', name: '遮阳帽', count: 1 },
          { categoryId: 'wash', name: '补涂防晒', count: 1 },
          { categoryId: 'travel', name: '便携小风扇', count: 1 },
          { categoryId: 'travel', name: '电解质饮料', count: 1 }
        ]
      },
      {
        id: 'cold',
        name: '降温天气',
        desc: '早晚温差或冷空气，补保暖和常用药。',
        icon: '🧣',
        items: [
          { categoryId: 'clothes', name: '薄羽绒/外套', count: 1 },
          { categoryId: 'clothes', name: '围巾', count: 1 },
          { categoryId: 'medicine', name: '感冒冲剂', count: 1 }
        ]
      }
    ];
  },

  applyWeatherPacking(libraryId) {
    const library = this.getWeatherPackingLibraries().find(item => item.id === libraryId);
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

  getTripTemplatePacks() {
    return [
      {
        id: 'business',
        items: [
          { categoryId: 'electronics', name: '笔记本电脑', count: 1 },
          { categoryId: 'docs', name: '会议资料', count: 1 },
          { categoryId: 'clothes', name: '正装', count: 1 }
        ],
        memos: [
          { content: '确认会议地址和参会资料', category: '出发前', remindTime: '09:00' },
          { content: '提前预约打车或接驳车', category: '路上', remindTime: '07:30' }
        ],
        bills: [
          { title: '商务交通预算', category: '交通', amount: 300, type: 'budget', note: '高铁、打车和接驳' },
          { title: '商务住宿预算', category: '住宿', amount: 500, type: 'budget', note: '差旅住宿' }
        ],
        places: [
          { name: '会议地点', tag: '商务', budget: 0, stayMinutes: 120, bestPeriod: '上午', note: '确认楼层和签到方式' }
        ]
      },
      {
        id: 'weekend',
        items: [
          { categoryId: 'travel', name: '墨镜', count: 1 },
          { categoryId: 'travel', name: '折叠雨衣', count: 1 },
          { categoryId: 'wash', name: '小样护肤品', count: 1 }
        ],
        memos: [
          { content: '确认周末目的地营业时间', category: '出发前', remindTime: '20:00' },
          { content: '提前查看天气和闭园时间', category: '出发前', remindTime: '21:00' }
        ],
        bills: [
          { title: '周末餐饮预算', category: '餐饮', amount: 180, type: 'budget', note: '两天餐饮和咖啡' },
          { title: '周末门票预算', category: '门票', amount: 120, type: 'budget', note: '展览或景区门票' }
        ],
        places: [
          { name: '周末打卡点', tag: '拍照点', budget: 50, stayMinutes: 90, bestPeriod: '下午', note: '适合轻松拍照和散步' }
        ]
      },
      {
        id: 'graduate',
        items: [
          { categoryId: 'electronics', name: '自拍杆', count: 1 },
          { categoryId: 'clothes', name: '拍照穿搭', count: 2 },
          { categoryId: 'travel', name: '纪念册', count: 1 }
        ],
        memos: [
          { content: '整理拍照路线和集合时间', category: '游玩', remindTime: '08:30' },
          { content: '备份同学证件和车票信息', category: '重要事项', remindTime: '19:30' }
        ],
        bills: [
          { title: '毕业旅行拍照预算', category: '其他', amount: 260, type: 'budget', note: '服装、道具和照片打印' },
          { title: '毕业旅行餐饮预算', category: '餐饮', amount: 240, type: 'budget', note: '聚餐和小吃' }
        ],
        places: [
          { name: '纪念合影点', tag: '拍照点', budget: 0, stayMinutes: 80, bestPeriod: '傍晚', note: '适合拍集体照和日落照' }
        ]
      },
      {
        id: 'family',
        items: [
          { categoryId: 'medicine', name: '儿童常用药', count: 1 },
          { categoryId: 'clothes', name: '备用换洗衣物', count: 2 },
          { categoryId: 'travel', name: '湿巾纸巾', count: 1 }
        ],
        memos: [
          { content: '确认儿童证件和常用药', category: '出发前', remindTime: '19:00' },
          { content: '预留午休和补给时间', category: '游玩', remindTime: '12:00' }
        ],
        bills: [
          { title: '亲子餐饮预算', category: '餐饮', amount: 260, type: 'budget', note: '正餐、零食和饮水' },
          { title: '亲子交通预算', category: '交通', amount: 220, type: 'budget', note: '打车和市内交通' }
        ],
        places: [
          { name: '亲子休息点', tag: '亲子', budget: 30, stayMinutes: 60, bestPeriod: '中午', note: '适合补给、午休和整理随身物品' }
        ]
      }
    ];
  },

  addMemoOnce(tripId, data) {
    const content = (data.content || '').trim();
    const exists = this.getMemos(tripId).some(item => item.content === content);
    return content && !exists ? this.addMemo(tripId, { ...data, content }) : null;
  },

  addBillOnce(tripId, data) {
    const title = (data.title || '').trim();
    const type = data.type === 'budget' ? 'budget' : 'actual';
    const exists = this.getBills(tripId).some(item => {
      return item.title === title && item.category === data.category && item.type === type;
    });
    return title && !exists ? this.addBill(tripId, { ...data, title, type }) : null;
  },

  addFavoritePlaceOnce(data) {
    const name = (data.name || '').trim();
    const city = data.city || '';
    const exists = this.getFavoritePlaces().some(item => item.name === name && item.city === city);
    return name && !exists ? this.addFavoritePlace({ ...data, name, city }) : null;
  },

  applyTripTemplate(templateId, tripId) {
    const pack = this.getTripTemplatePacks().find(item => item.id === templateId);
    const template = this.globalData.templates.find(item => item.id === templateId);
    const empty = { added: 0, skipped: 0 };
    if (!pack || !tripId) {
      return {
        template,
        items: empty,
        memos: empty,
        bills: empty,
        places: empty,
        totalAdded: 0
      };
    }

    const applyGroup = (list, add) => {
      let added = 0;
      let skipped = 0;
      list.forEach(item => {
        if (add(item)) {
          added += 1;
        } else {
          skipped += 1;
        }
      });
      return { added, skipped };
    };
    const trip = this.getTripById(tripId);
    const city = trip ? trip.city : '';
    const items = applyGroup(pack.items, item => this.addItem({
      ...item,
      note: template ? template.name : '旅行模板'
    }, { unique: true }));
    const memos = applyGroup(pack.memos, item => this.addMemoOnce(tripId, item));
    const bills = applyGroup(pack.bills, item => this.addBillOnce(tripId, item));
    const places = applyGroup(pack.places, item => this.addFavoritePlaceOnce({
      ...item,
      city: item.city || city
    }));

    return {
      template,
      items,
      memos,
      bills,
      places,
      totalAdded: items.added + memos.added + bills.added + places.added
    };
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

  getBackupKeys() {
    return [
      'customItems',
      'customTrips',
      'tripOverrides',
      'tripBills',
      'tripMemos',
      'tripTransports',
      'routeSegmentModes',
      'favoritePlaces',
      'packedIds',
      'preferredCategoryId',
      'selectedTripId',
      'selectedTripDayIndex'
    ];
  },

  exportBackup() {
    const data = this.getBackupKeys().reduce((result, key) => ({
      ...result,
      [key]: wx.getStorageSync(key)
    }), {});
    return JSON.stringify({
      appName: this.globalData.appName,
      version: 1,
      exportedAt: new Date().toISOString(),
      data
    }, null, 2);
  },

  validateBackup(text) {
    let backup;
    try {
      backup = JSON.parse(text);
    } catch (error) {
      throw new Error('备份格式不正确');
    }
    if (!backup || typeof backup !== 'object' || !backup.data || typeof backup.data !== 'object') {
      throw new Error('备份格式不正确');
    }
    if (backup.version !== 1) {
      throw new Error('备份版本不兼容');
    }
    return backup;
  },

  restoreBackup(backup) {
    const data = backup.data;
    this.getBackupKeys().forEach(key => {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        wx.setStorageSync(key, data[key]);
      }
    });
    return { imported: true, version: backup.version };
  },

  importBackup(text) {
    return this.restoreBackup(this.validateBackup(text));
  },

  buildMemoCalendarReminder(tripId, memoId) {
    const trip = this.getTripById(tripId);
    const memo = this.getMemos(tripId).find(item => item.id === memoId);
    if (!memo) {
      return null;
    }
    const date = this.parseDateInput(memo.date) || this.parseDateInput(trip.startDate) || this.getTodayDate();
    const matched = String(memo.remindTime || '').match(/^(\d{1,2}):(\d{2})$/);
    const hours = matched ? Number(matched[1]) : 9;
    const minutes = matched ? Number(matched[2]) : 0;
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
    return {
      title: `${this.globalData.appName}：${memo.content}`,
      location: memo.placeName || trip.city || '',
      description: `${trip.city || ''} · ${memo.category || '旅行提醒'}`,
      startTime: Math.floor(start.getTime() / 1000),
      endTime: Math.floor((start.getTime() + 30 * 60000) / 1000),
      alarmOffset: 15 * 60
    };
  },

  getReminderTemplateIds() {
    return this.globalData.reminderTemplateIds || [];
  },

  getReminderConfigStatus() {
    const count = this.getReminderTemplateIds().length;
    return {
      configured: count > 0,
      count,
      text: count ? `已配置 ${count} 个订阅消息模板` : '未配置订阅消息模板，将使用手机日历兜底'
    };
  },

  formatReminderResult(result) {
    const messages = {
      subscribe: { title: '订阅提醒已设置', icon: 'success' },
      calendar: { title: '已改用日历提醒', icon: 'success' },
      none: { title: '当前环境不支持提醒', icon: 'none' }
    };
    const base = messages[result.channel] || messages.none;
    if (result.reason === 'missing-template') {
      return { title: '未配置订阅模板，已改用日历', icon: base.icon };
    }
    if (result.reason === 'subscribe-denied') {
      return { title: '未授权订阅，已改用日历', icon: base.icon };
    }
    return base;
  },

  scheduleMemoReminder(tripId, memoId) {
    const reminder = this.buildMemoCalendarReminder(tripId, memoId);
    if (!reminder) {
      return Promise.resolve({ channel: 'none', reason: 'missing-memo' });
    }
    const templateIds = this.getReminderTemplateIds();
    const fallbackToCalendar = reason => new Promise(resolve => {
      if (typeof wx.addPhoneCalendar !== 'function') {
        resolve({ channel: 'none', reason });
        return;
      }
      wx.addPhoneCalendar({
        ...reminder,
        success() {
          resolve({ channel: 'calendar', reason });
        },
        fail() {
          resolve({ channel: 'none', reason });
        }
      });
    });

    if (!templateIds.length || typeof wx.requestSubscribeMessage !== 'function') {
      return fallbackToCalendar('missing-template');
    }

    return new Promise(resolve => {
      wx.requestSubscribeMessage({
        tmplIds: templateIds,
        success: result => {
          const accepted = templateIds.some(id => result[id] === 'accept');
          if (accepted) {
            resolve({ channel: 'subscribe', reason: 'accepted' });
            return;
          }
          fallbackToCalendar('subscribe-denied').then(resolve);
        },
        fail() {
          fallbackToCalendar('subscribe-failed').then(resolve);
        }
      });
    });
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

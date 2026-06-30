const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');

function loadMiniProgram() {
  const storage = {};
  const pages = {};
  const navCalls = [];
  let appInstance;

  const wx = {
    getStorageSync(key) {
      return storage[key];
    },
    setStorageSync(key, value) {
      storage[key] = value;
    },
    setNavigationBarTitle() {},
    showToast() {},
    switchTab(options) {
      navCalls.push({ type: 'switchTab', url: options.url });
      if (options.success) {
        options.success();
      }
    },
    navigateTo(options) {
      navCalls.push({ type: 'navigateTo', url: options.url });
    }
  };

  const context = {
    console,
    Date,
    setTimeout(fn) {
      fn();
    },
    wx,
    App(config) {
      appInstance = config;
      if (config.onLaunch) {
        config.onLaunch();
      }
    },
    getApp() {
      return appInstance;
    },
    Page(config) {
      pages.current = config;
    }
  };
  vm.createContext(context);

  function run(file) {
    const code = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInContext(code, context, { filename: file });
    return pages.current;
  }

  run('app.js');
  return { app: appInstance, wx, storage, navCalls, run };
}

function createPage(pageConfig, options = {}) {
  const data = JSON.parse(JSON.stringify(pageConfig.data || {}));
  return {
    ...pageConfig,
    data,
    setData(patch) {
      this.data = { ...this.data, ...patch };
    },
    triggerLoad() {
      if (this.onLoad) {
        this.onLoad(options);
      }
    },
    triggerShow() {
      if (this.onShow) {
        this.onShow();
      }
    }
  };
}

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

test('新增物品后分类详情页重新显示最新物品', () => {
  const env = loadMiniProgram();
  const categoryConfig = env.run('pages/category/category.js');
  const page = createPage(categoryConfig, { id: 'travel' });
  page.triggerLoad();
  assert.strictEqual(page.data.items.some(item => item.name === '墨镜'), false);

  env.app.addItem({ categoryId: 'travel', name: '墨镜', count: 1 });
  assert.strictEqual(typeof page.onShow, 'function', '分类详情页需要 onShow 重新读取本地数据');
  page.triggerShow();

  assert.strictEqual(page.data.items.some(item => item.name === '墨镜'), true);
});

test('新增页保存物品后进入对应分类详情', () => {
  const env = loadMiniProgram();
  const addConfig = env.run('pages/add/add.js');
  const page = createPage(addConfig);
  page.onLoad();
  page.setData({
    type: 'item',
    name: '墨镜',
    categoryIndex: 3,
    count: 1
  });

  page.saveDraft();

  assert.deepStrictEqual(env.navCalls.slice(-2), [
    { type: 'switchTab', url: '/pages/checklist/checklist' },
    { type: 'navigateTo', url: '/pages/category/category?id=travel' }
  ]);
});

test('新增行程保存交通和景点安排', () => {
  const env = loadMiniProgram();

  const trip = env.app.addTrip({
    city: '南京',
    dateRange: '8月5日 - 8月6日',
    traffic: '高铁 G12',
    trafficTime: '08:00 - 09:30',
    duration: '1小时30分',
    note: '带好学生证',
    attractionsText: '09:30 夫子庙 - 上午先逛秦淮河\n14:00 中山陵 - 下午避开人流'
  });

  assert.strictEqual(trip.traffic, '高铁 G12');
  assert.strictEqual(trip.trafficTime, '08:00 - 09:30');
  assert.strictEqual(trip.duration, '1小时30分');
  assert.strictEqual(JSON.stringify(trip.attractions), JSON.stringify([
    { time: '09:30', name: '夫子庙', note: '上午先逛秦淮河' },
    { time: '14:00', name: '中山陵', note: '下午避开人流' }
  ]));
});

test('路线推荐会根据策略生成不同顺序和交通摘要', () => {
  const env = loadMiniProgram();
  const trip = {
    city: '上海',
    attractions: [
      { time: '14:00', name: '豫园', note: '下午游览老城厢', area: '黄浦', stayMinutes: 80, x: 2, y: 2 },
      { time: '09:30', name: '外滩', note: '上午看江景', area: '黄浦', stayMinutes: 70, x: 1, y: 1 },
      { time: '19:00', name: '陆家嘴', note: '晚上看夜景', area: '浦东', stayMinutes: 90, x: 8, y: 2 }
    ]
  };

  const timePlan = env.app.buildRoutePlan(trip, 'time');
  const transferPlan = env.app.buildRoutePlan(trip, 'transfer');

  assert.deepStrictEqual(timePlan.orderedAttractions.map(item => item.name), ['外滩', '豫园', '陆家嘴']);
  assert.strictEqual(timePlan.strategyName, '时间优先');
  assert.strictEqual(timePlan.segments.length, 2);
  assert.ok(timePlan.summary.includes('预计'));
  assert.ok(timePlan.summary.includes('外滩 -> 豫园 -> 陆家嘴'));
  assert.deepStrictEqual(transferPlan.orderedAttractions.map(item => item.name), ['豫园', '外滩', '陆家嘴']);
  assert.ok(transferPlan.transferCount <= timePlan.transferCount);
});

test('行程计划页切换策略会刷新推荐路线', () => {
  const env = loadMiniProgram();
  env.wx.setStorageSync('customTrips', [
    {
      id: 'custom-route',
      city: '策略测试',
      dateRange: '8月8日',
      daysLeft: 7,
      traffic: '地铁',
      trafficTime: '09:00 - 20:00',
      duration: '全天',
      packed: 0,
      total: 0,
      tip: '测试路线策略',
      attractions: [
        { time: '14:00', name: '豫园', note: '下午游览老城厢', area: '黄浦', x: 2, y: 2 },
        { time: '09:30', name: '外滩', note: '上午看江景', area: '黄浦', x: 1, y: 1 },
        { time: '19:00', name: '陆家嘴', note: '晚上看夜景', area: '浦东', x: 8, y: 2 }
      ]
    }
  ]);
  const planConfig = env.run('pages/plan/plan.js');
  const page = createPage(planConfig, { id: 'custom-route' });
  page.triggerLoad();

  assert.strictEqual(page.data.routePlan.strategyName, '时间优先');
  const timeRoute = page.data.routePlan.routeNames;

  page.chooseStrategy({ currentTarget: { dataset: { id: 'transfer' } } });

  assert.strictEqual(page.data.routePlan.strategyName, '少换乘');
  assert.notStrictEqual(page.data.routePlan.routeNames, timeRoute);
  assert.ok(page.data.routeSteps.length > 0);
});

test('景点上移下移后会保存顺序并重新估算时间轴', () => {
  const env = loadMiniProgram();
  const trip = env.app.addTrip({
    city: '南京',
    dateRange: '8月5日',
    note: '',
    attractionsText: '09:00 夫子庙 - 上午逛秦淮河\n11:30 老门东 - 午餐\n14:00 中山陵 - 下午游览'
  });

  const movedTrip = env.app.moveTripSpot(trip.id, 2, -1);
  const timeline = env.app.buildEditableTimeline(movedTrip);

  assert.strictEqual(JSON.stringify(movedTrip.attractions.map(item => item.name)), JSON.stringify(['夫子庙', '中山陵', '老门东']));
  assert.strictEqual(timeline.items[0].timeRange, '09:00 - 10:30');
  assert.ok(timeline.items[1].startTime >= '10:');
  assert.ok(timeline.summary.includes('预计'));
  assert.strictEqual(Array.isArray(timeline.conflicts), true);
});

test('预设行程手动调整和收藏加入会持久保存', () => {
  const env = loadMiniProgram();

  const movedTrip = env.app.moveTripSpot('shanghai', 3, -3);
  const savedTrip = env.app.getTripById('shanghai');
  const detail = env.app.getTripDetail('shanghai');

  assert.strictEqual(movedTrip.routeMode, 'manual');
  assert.strictEqual(savedTrip.attractions[0].name, '陆家嘴');
  assert.strictEqual(detail.routePlan.strategyId, 'manual');
  assert.ok(detail.routePlan.routeNames.startsWith('陆家嘴'));

  const place = env.app.addFavoritePlace({
    name: '上海博物馆',
    city: '上海',
    tag: '博物馆',
    budget: 0,
    stayMinutes: 90,
    bestPeriod: '下午',
    note: '适合雨天备用'
  });
  env.app.addFavoritePlaceToTrip(place.id, 'shanghai');

  assert.strictEqual(env.app.getTripById('shanghai').attractions.some(item => item.name === '上海博物馆'), true);
});

test('行程景点可以新增编辑删除并持久保存', () => {
  const env = loadMiniProgram();

  const addedTrip = env.app.addTripSpot('shanghai', {
    time: '16:30',
    name: '上海博物馆',
    note: '雨天备用展馆',
    area: '人民广场',
    stayMinutes: 90,
    bestPeriod: '下午'
  });

  assert.strictEqual(addedTrip.routeMode, 'manual');
  assert.strictEqual(env.app.getTripById('shanghai').attractions.some(item => item.name === '上海博物馆'), true);

  env.app.updateTripSpot('shanghai', 4, {
    time: '17:00',
    name: '上海博物馆东馆',
    note: '看特展后再去晚餐',
    stayMinutes: 120
  });
  const editedTrip = env.app.getTripById('shanghai');

  assert.strictEqual(editedTrip.attractions[4].name, '上海博物馆东馆');
  assert.strictEqual(editedTrip.attractions[4].time, '17:00');
  assert.strictEqual(editedTrip.attractions[4].stayMinutes, 120);

  env.app.removeTripSpot('shanghai', 4);
  assert.strictEqual(env.app.getTripById('shanghai').attractions.some(item => item.name === '上海博物馆东馆'), false);
});

test('路线页可以通过表单新增编辑删除景点', () => {
  const env = loadMiniProgram();
  const planConfig = env.run('pages/plan/plan.js');
  const page = createPage(planConfig, { id: 'shanghai' });
  page.triggerLoad();

  page.onSpotInput({ currentTarget: { dataset: { field: 'time' } }, detail: { value: '16:20' } });
  page.onSpotInput({ currentTarget: { dataset: { field: 'name' } }, detail: { value: '上海博物馆' } });
  page.onSpotInput({ currentTarget: { dataset: { field: 'note' } }, detail: { value: '雨天备用展馆' } });
  page.onSpotInput({ currentTarget: { dataset: { field: 'area' } }, detail: { value: '人民广场' } });
  page.onSpotInput({ currentTarget: { dataset: { field: 'stayMinutes' } }, detail: { value: '90' } });
  page.onSpotInput({ currentTarget: { dataset: { field: 'bestPeriod' } }, detail: { value: '下午' } });
  page.saveSpot();

  assert.strictEqual(page.data.routeSpots.some(item => item.name === '上海博物馆'), true);

  const index = page.data.trip.attractions.findIndex(item => item.name === '上海博物馆');
  page.editSpot({ currentTarget: { dataset: { index } } });
  page.onSpotInput({ currentTarget: { dataset: { field: 'name' } }, detail: { value: '上海博物馆东馆' } });
  page.saveSpot();

  assert.strictEqual(env.app.getTripById('shanghai').attractions[index].name, '上海博物馆东馆');

  page.deleteSpot({ currentTarget: { dataset: { index } } });
  assert.strictEqual(env.app.getTripById('shanghai').attractions.some(item => item.name === '上海博物馆东馆'), false);
});

test('行程可以按第几天分别管理景点', () => {
  const env = loadMiniProgram();
  const days = env.app.getTripDays(env.app.getTripById('shanghai'));

  assert.strictEqual(days.length, 2);
  assert.strictEqual(days[0].title, '第1天');
  assert.strictEqual(days[1].title, '第2天');

  env.app.addTripSpot('shanghai', {
    time: '10:00',
    name: '上海迪士尼',
    note: '安排整天游玩',
    area: '浦东',
    stayMinutes: 360,
    bestPeriod: '全天'
  }, 1);

  const firstDay = env.app.getTripForDay('shanghai', 0);
  const secondDay = env.app.getTripForDay('shanghai', 1);

  assert.strictEqual(firstDay.attractions.some(item => item.name === '上海迪士尼'), false);
  assert.strictEqual(secondDay.attractions.some(item => item.name === '上海迪士尼'), true);

  env.app.updateTripSpot('shanghai', 0, { name: '迪士尼小镇', stayMinutes: 120 }, 1);
  assert.strictEqual(env.app.getTripForDay('shanghai', 1).attractions[0].name, '迪士尼小镇');

  env.app.removeTripSpot('shanghai', 0, 1);
  assert.strictEqual(env.app.getTripForDay('shanghai', 1).attractions.length, 0);
});

test('路线页切换日期后会把景点保存到当前天', () => {
  const env = loadMiniProgram();
  const planConfig = env.run('pages/plan/plan.js');
  const page = createPage(planConfig, { id: 'shanghai' });
  page.triggerLoad();

  assert.strictEqual(page.data.dayTabs.length, 2);
  page.chooseDay({ currentTarget: { dataset: { index: 1 } } });
  assert.strictEqual(page.data.selectedDayIndex, 1);

  page.onSpotInput({ currentTarget: { dataset: { field: 'time' } }, detail: { value: '10:00' } });
  page.onSpotInput({ currentTarget: { dataset: { field: 'name' } }, detail: { value: '上海迪士尼' } });
  page.onSpotInput({ currentTarget: { dataset: { field: 'note' } }, detail: { value: '安排整天游玩' } });
  page.onSpotInput({ currentTarget: { dataset: { field: 'stayMinutes' } }, detail: { value: '360' } });
  page.saveSpot();

  assert.strictEqual(env.app.getTripForDay('shanghai', 0).attractions.some(item => item.name === '上海迪士尼'), false);
  assert.strictEqual(env.app.getTripForDay('shanghai', 1).attractions.some(item => item.name === '上海迪士尼'), true);
  assert.strictEqual(page.data.routeSpots.some(item => item.name === '上海迪士尼'), true);
});

test('详情页模块卡片会跳转到对应功能页', () => {
  const env = loadMiniProgram();
  const detailConfig = env.run('pages/detail/detail.js');
  const page = createPage(detailConfig, { id: 'shanghai' });
  page.triggerLoad();
  page.triggerShow();

  page.openModule({ currentTarget: { dataset: { id: 'route' } } });
  page.openModule({ currentTarget: { dataset: { id: 'bill' } } });
  page.openModule({ currentTarget: { dataset: { id: 'packing' } } });
  page.openModule({ currentTarget: { dataset: { id: 'favorite' } } });

  assert.deepStrictEqual(env.navCalls.slice(-4), [
    { type: 'switchTab', url: '/pages/plan/plan' },
    { type: 'switchTab', url: '/pages/bills/bills' },
    { type: 'switchTab', url: '/pages/checklist/checklist' },
    { type: 'navigateTo', url: '/pages/favorites/favorites?id=shanghai' }
  ]);
});

test('旅行备忘支持新增编辑完成删除和关联信息', () => {
  const env = loadMiniProgram();
  const memo = env.app.addMemo('shanghai', {
    content: '提前预约上海博物馆',
    category: '游玩',
    date: '7月3日',
    remindTime: '08:30',
    placeName: '上海博物馆',
    transportId: 'G7012'
  });

  env.app.updateMemo(memo.id, { content: '提前预约上海博物馆门票', category: '出发前' });
  env.app.toggleMemoDone(memo.id);
  const summary = env.app.getMemoSummary('shanghai');

  assert.strictEqual(summary.total, 1);
  assert.strictEqual(summary.done, 1);
  assert.strictEqual(summary.byCategory.find(item => item.name === '出发前').total, 1);
  assert.strictEqual(summary.memos[0].content, '提前预约上海博物馆门票');
  assert.strictEqual(summary.memos[0].placeName, '上海博物馆');
  assert.strictEqual(summary.memos[0].transportId, 'G7012');

  env.app.removeMemo(memo.id);
  assert.strictEqual(env.app.getMemoSummary('shanghai').total, 0);
});

test('详情页旅行待办表单可以保存、勾选和删除', () => {
  const env = loadMiniProgram();
  const detailConfig = env.run('pages/detail/detail.js');
  const page = createPage(detailConfig, { id: 'shanghai' });
  page.triggerLoad();
  page.triggerShow();

  page.onMemoInput({ currentTarget: { dataset: { field: 'content' } }, detail: { value: '确认酒店入住时间' } });
  page.onMemoInput({ currentTarget: { dataset: { field: 'category' } }, detail: { value: '入住' } });
  page.onMemoInput({ currentTarget: { dataset: { field: 'remindTime' } }, detail: { value: '15:00' } });
  page.saveMemo();

  const memo = env.app.getMemos('shanghai')[0];
  assert.strictEqual(memo.content, '确认酒店入住时间');
  assert.strictEqual(page.data.detail.memoSummary.total, 1);

  page.toggleMemo({ currentTarget: { dataset: { id: memo.id } } });
  assert.strictEqual(env.app.getMemos('shanghai')[0].done, true);

  page.deleteMemo({ currentTarget: { dataset: { id: memo.id } } });
  assert.strictEqual(env.app.getMemos('shanghai').length, 0);
});

test('账单统计会区分预算和实际花费', () => {
  const env = loadMiniProgram();
  const trip = env.app.addTrip({ city: '南京', dateRange: '8月5日', note: '' });

  env.app.addBill(trip.id, { title: '高铁票', category: '交通', amount: 139, type: 'actual' });
  env.app.addBill(trip.id, { title: '酒店预算', category: '住宿', amount: 300, type: 'budget' });
  env.app.addBill(trip.id, { title: '午餐', category: '餐饮', amount: 68, type: 'actual' });
  const summary = env.app.getBillSummary(trip.id);

  assert.strictEqual(summary.budgetTotal, 300);
  assert.strictEqual(summary.actualTotal, 207);
  assert.strictEqual(summary.leftBudget, 93);
  assert.strictEqual(summary.categories.find(item => item.name === '交通').actual, 139);
});

test('账单可以编辑删除并给出超支提醒', () => {
  const env = loadMiniProgram();
  const trip = env.app.addTrip({ city: '南京', dateRange: '8月5日', note: '' });

  env.app.addBill(trip.id, { title: '餐饮预算', category: '餐饮', amount: 100, type: 'budget' });
  const bill = env.app.addBill(trip.id, {
    title: '午餐',
    category: '餐饮',
    amount: 88,
    type: 'actual',
    date: '8月5日',
    placeName: '夫子庙',
    payment: '微信',
    note: '鸭血粉丝汤'
  });

  env.app.updateBill(bill.id, { amount: 138, payment: '支付宝' });
  const summary = env.app.getBillSummary(trip.id);

  assert.strictEqual(summary.actualTotal, 138);
  assert.strictEqual(summary.bills[1].placeName, '夫子庙');
  assert.strictEqual(summary.bills[1].payment, '支付宝');
  assert.ok(summary.warnings.some(item => item.includes('餐饮已超预算 ¥38')));

  env.app.removeBill(bill.id);
  assert.strictEqual(env.app.getBillSummary(trip.id).actualTotal, 0);
});

test('收藏地点可以一键加入当前行程', () => {
  const env = loadMiniProgram();
  const trip = env.app.addTrip({ city: '南京', dateRange: '8月5日', note: '', attractionsText: '09:00 夫子庙' });

  const place = env.app.addFavoritePlace({
    name: '南京博物院',
    city: '南京',
    tag: '博物馆',
    budget: 0,
    stayMinutes: 120,
    bestPeriod: '下午',
    note: '需要提前预约'
  });
  const nextTrip = env.app.addFavoritePlaceToTrip(place.id, trip.id);

  assert.strictEqual(nextTrip.attractions.some(item => item.name === '南京博物院'), true);
  assert.strictEqual(env.app.getFavoritePlaces().find(item => item.id === place.id).status, '已安排');
});

test('收藏地点可以加入指定第几天行程', () => {
  const env = loadMiniProgram();
  const place = env.app.addFavoritePlace({
    name: '上海迪士尼',
    city: '上海',
    tag: '主题乐园',
    budget: 399,
    stayMinutes: 360,
    bestPeriod: '全天',
    note: '适合单独安排一天'
  });

  env.app.addFavoritePlaceToTrip(place.id, 'shanghai', 1);

  assert.strictEqual(env.app.getTripForDay('shanghai', 0).attractions.some(item => item.name === '上海迪士尼'), false);
  assert.strictEqual(env.app.getTripForDay('shanghai', 1).attractions.some(item => item.name === '上海迪士尼'), true);
});

test('收藏夹页面会把地点加入当前选择的日期', () => {
  const env = loadMiniProgram();
  const favoritesConfig = env.run('pages/favorites/favorites.js');
  const page = createPage(favoritesConfig, { id: 'shanghai' });
  page.triggerLoad();
  page.triggerShow();

  const place = env.app.addFavoritePlace({
    name: '上海迪士尼',
    city: '上海',
    tag: '主题乐园',
    budget: 399,
    stayMinutes: 360,
    bestPeriod: '全天',
    note: '适合单独安排一天'
  });
  page.loadPlaces();
  page.chooseDay({ currentTarget: { dataset: { index: 1 } } });
  page.addToTrip({ currentTarget: { dataset: { id: place.id } } });

  assert.strictEqual(env.app.getTripForDay('shanghai', 0).attractions.some(item => item.name === '上海迪士尼'), false);
  assert.strictEqual(env.app.getTripForDay('shanghai', 1).attractions.some(item => item.name === '上海迪士尼'), true);
});

test('收藏夹支持筛选新增编辑和删除地点', () => {
  const env = loadMiniProgram();

  const place = env.app.addFavoritePlace({
    name: '先锋书店',
    city: '南京',
    tag: '拍照点',
    budget: 30,
    stayMinutes: 60,
    bestPeriod: '下午',
    note: '适合拍照和买明信片'
  });
  env.app.updateFavoritePlace(place.id, { tag: '美食', budget: 45 });

  assert.strictEqual(env.app.getFavoritePlaces({ filter: '美食' }).some(item => item.id === place.id), true);
  assert.strictEqual(env.app.getFavoritePlaces().find(item => item.id === place.id).budget, 45);

  env.app.removeFavoritePlace(place.id);
  assert.strictEqual(env.app.getFavoritePlaces().some(item => item.id === place.id), false);
});

test('结构化交通卡片支持新增编辑并出现在详情页', () => {
  const env = loadMiniProgram();

  const go = env.app.addTransportCard('shanghai', {
    role: '去程',
    type: '高铁',
    code: 'G7012',
    from: '南京南',
    to: '上海虹桥',
    departTime: '08:20',
    arriveTime: '10:05',
    seat: '03车 08A',
    price: 139,
    remindMinutes: 60,
    note: '提前取票'
  });
  env.app.addTransportCard('shanghai', {
    role: '返程',
    type: '高铁',
    code: 'G7045',
    from: '上海虹桥',
    to: '南京南',
    departTime: '19:10',
    arriveTime: '20:58',
    seat: '05车 12F',
    price: 139
  });
  env.app.updateTransportCard(go.id, { seat: '02车 06A', price: 149 });

  const cards = env.app.getTripDetail('shanghai').transportCards;

  assert.strictEqual(cards.length, 2);
  assert.strictEqual(cards[0].role, '去程');
  assert.strictEqual(cards[0].seat, '02车 06A');
  assert.strictEqual(cards[0].price, 149);
  assert.strictEqual(cards[1].code, 'G7045');
});

test('编辑默认交通卡会保存成结构化交通记录', () => {
  const env = loadMiniProgram();
  const detailConfig = env.run('pages/detail/detail.js');
  const page = createPage(detailConfig, { id: 'hangzhou' });
  page.triggerLoad();
  page.triggerShow();

  assert.strictEqual(page.data.detail.transportCards[0].generated, true);

  page.editTransport({ currentTarget: { dataset: { id: 'hangzhou-transport-main' } } });
  page.onTransportInput({ currentTarget: { dataset: { field: 'seat' } }, detail: { value: '06车 09A' } });
  page.saveTransport();

  const cards = env.app.getSavedTransportCards('hangzhou');

  assert.strictEqual(cards.length, 1);
  assert.strictEqual(cards[0].seat, '06车 09A');
  assert.strictEqual(env.app.getTripDetail('hangzhou').transportCards[0].generated, undefined);
});

test('路线页会生成地图 marker 和路线预览', () => {
  const env = loadMiniProgram();
  const planConfig = env.run('pages/plan/plan.js');
  const page = createPage(planConfig, { id: 'shanghai' });
  page.triggerLoad();

  assert.strictEqual(page.data.mapPreview.markers.length, page.data.routeSpots.length);
  assert.strictEqual(page.data.mapPreview.markers[0].callout.content.includes('1.'), true);
  assert.strictEqual(page.data.mapPreview.polyline[0].points.length, page.data.routeSpots.length);
  assert.ok(page.data.mapPreview.latitude);
  assert.ok(page.data.mapPreview.longitude);
});

test('每段路线可以选择交通方式并重算时间和预算', () => {
  const env = loadMiniProgram();
  const beforePlan = env.app.buildRoutePlan(env.app.getTripById('shanghai'), 'time');
  const firstSegment = beforePlan.segments[0];

  env.app.updateRouteSegmentMode('shanghai', firstSegment.from, firstSegment.to, '打车');
  const afterPlan = env.app.buildRoutePlan(env.app.getTripById('shanghai'), 'time');
  const updatedSegment = afterPlan.segments[0];

  assert.strictEqual(updatedSegment.mode, '打车');
  assert.ok(updatedSegment.options.some(item => item.mode === '地铁'));
  assert.ok(updatedSegment.options.some(item => item.mode === '公交'));
  assert.ok(updatedSegment.options.some(item => item.mode === '自驾'));
  assert.ok(updatedSegment.cost > 0);
  assert.ok(afterPlan.transportBudget >= updatedSegment.cost);
  assert.ok(afterPlan.summary.includes('交通预算'));
});

test('腾讯地图 polyline 会解析成地图真实线路点', () => {
  const env = loadMiniProgram();
  const points = env.app.decodeTencentPolyline([
    31230000,
    121470000,
    1000,
    2000,
    -500,
    -1000
  ]);

  assert.strictEqual(JSON.stringify(points), JSON.stringify([
    { latitude: 31.23, longitude: 121.47 },
    { latitude: 31.231, longitude: 121.472 },
    { latitude: 31.2305, longitude: 121.471 }
  ]));
});

test('地图预览优先使用腾讯路线返回的 polyline', () => {
  const env = loadMiniProgram();
  const trip = env.app.getTripById('shanghai');
  const routePlan = {
    orderedAttractions: [
      { name: '外滩', lat: 31.239, lng: 121.499 },
      { name: '南京路步行街', lat: 31.235, lng: 121.475 }
    ],
    segments: [
      {
        polylinePoints: [
          { latitude: 31.239, longitude: 121.499 },
          { latitude: 31.236, longitude: 121.486 },
          { latitude: 31.235, longitude: 121.475 }
        ]
      }
    ]
  };

  const mapPreview = env.app.buildRouteMapPreview(trip, routePlan);

  assert.strictEqual(mapPreview.polyline[0].points.length, 3);
  assert.strictEqual(mapPreview.polyline[0].points[1].longitude, 121.486);
  assert.strictEqual(mapPreview.markers.length, 2);
  assert.strictEqual(mapPreview.latitude, 31.236667);
});

test('路线页切换分段交通方式会刷新路线步骤', () => {
  const env = loadMiniProgram();
  const planConfig = env.run('pages/plan/plan.js');
  const page = createPage(planConfig, { id: 'shanghai' });
  page.triggerLoad();
  const first = page.data.routePlan.segments[0];

  page.chooseSegmentMode({
    currentTarget: {
      dataset: {
        from: first.from,
        to: first.to,
        mode: '打车'
      }
    }
  });

  assert.strictEqual(page.data.routePlan.segments[0].mode, '打车');
  assert.ok(page.data.routeSteps[0].desc.includes('打车'));
});

test('推荐物品库可以一键加入清单且避免重复', () => {
  const env = loadMiniProgram();
  const beforeCount = env.app.getAllItems().length;
  const result = env.app.applyPackingLibrary('beach');
  const secondResult = env.app.applyPackingLibrary('beach');

  assert.ok(result.added > 0);
  assert.strictEqual(secondResult.added, 0);
  assert.ok(env.app.getAllItems().length > beforeCount);
  assert.ok(env.app.getCategories().find(item => item.id === 'travel').items.some(item => item.name === '防水手机袋'));
});

test('清单页可以展示并应用推荐物品库', () => {
  const env = loadMiniProgram();
  const checklistConfig = env.run('pages/checklist/checklist.js');
  const page = createPage(checklistConfig);
  page.triggerShow();

  assert.ok(page.data.packingLibraries.length >= 3);
  page.applyLibrary({ currentTarget: { dataset: { id: 'business' } } });

  assert.ok(env.app.getAllItems().some(item => item.name === '笔记本电脑'));
  assert.ok(page.data.categories.some(category => category.items.some(item => item.name === '笔记本电脑')));
});

test('点击地图点会显示对应景点详情提示', () => {
  const env = loadMiniProgram();
  const planConfig = env.run('pages/plan/plan.js');
  const page = createPage(planConfig, { id: 'shanghai' });
  page.triggerLoad();

  page.tapMapMarker({ markerId: 1 });

  assert.ok(page.data.activeMapSpot.name);
  assert.ok(page.data.activeMapSpot.note);
});

test('旅行详情会聚合路线、交通、备忘、账单和清单入口', () => {
  const env = loadMiniProgram();
  const trip = env.app.addTrip({
    city: '南京',
    dateRange: '8月5日',
    note: '',
    traffic: '高铁 G7012',
    trafficTime: '08:20 - 10:05',
    attractionsText: '09:00 夫子庙'
  });
  env.app.addMemo(trip.id, { content: '预约博物馆', category: '游玩' });
  env.app.addBill(trip.id, { title: '门票', category: '门票', amount: 80, type: 'actual' });

  const detail = env.app.getTripDetail(trip.id);

  assert.strictEqual(detail.modules.length, 6);
  assert.strictEqual(detail.modules.some(item => item.id === 'favorite'), true);
  assert.strictEqual(detail.transportCards[0].code, 'G7012');
  assert.strictEqual(detail.memoSummary.total, 1);
  assert.strictEqual(detail.billSummary.actualTotal, 80);
  assert.ok(detail.packingSummary.total > 0);
});

test('旅行详情可以按第几天展示路线总览', () => {
  const env = loadMiniProgram();
  env.app.addTripSpot('shanghai', {
    time: '10:00',
    name: '上海迪士尼',
    note: '安排整天游玩',
    area: '浦东',
    stayMinutes: 360,
    bestPeriod: '全天'
  }, 1);

  const firstDay = env.app.getTripDetail('shanghai', 0);
  const secondDay = env.app.getTripDetail('shanghai', 1);

  assert.strictEqual(secondDay.dayTabs.length, 2);
  assert.strictEqual(firstDay.selectedDayIndex, 0);
  assert.strictEqual(secondDay.selectedDayIndex, 1);
  assert.strictEqual(firstDay.dayOverview.spotCount, 4);
  assert.strictEqual(secondDay.dayOverview.spotCount, 1);
  assert.strictEqual(secondDay.routePlan.routeNames, '上海迪士尼');
  assert.ok(secondDay.modules.find(item => item.id === 'route').desc.includes('1 个景点'));
});

test('详情页切换日期后打开路线会记住当前日期', () => {
  const env = loadMiniProgram();
  const detailConfig = env.run('pages/detail/detail.js');
  const page = createPage(detailConfig, { id: 'shanghai' });
  page.triggerLoad();
  page.triggerShow();

  page.chooseDay({ currentTarget: { dataset: { index: 1 } } });
  page.openRoute();

  assert.strictEqual(page.data.selectedDayIndex, 1);
  assert.strictEqual(env.storage.selectedTripDayIndex, 1);
  assert.deepStrictEqual(env.navCalls.slice(-1), [
    { type: 'switchTab', url: '/pages/plan/plan' }
  ]);
});

test('腾讯地图请求会带 key 并按路线段选择接口', () => {
  const env = loadMiniProgram();
  const trip = {
    city: '上海',
    attractions: [
      { time: '09:30', name: '外滩', note: '上午看江景' },
      { time: '11:00', name: '南京路步行街', note: '步行衔接' },
      { time: '19:00', name: '陆家嘴', note: '晚上看夜景' }
    ]
  };

  const targets = env.app.buildTencentRouteTargets(trip, 'time');
  const geocoderRequest = env.app.buildTencentGeocoderRequest('上海', targets[0]);
  const walkingRequest = env.app.buildTencentDirectionRequest(
    { lat: 31.239, lng: 121.499 },
    { lat: 31.235, lng: 121.475 },
    '步行'
  );
  const drivingRequest = env.app.buildTencentDirectionRequest(
    { lat: 31.239, lng: 121.499 },
    { lat: 31.236, lng: 121.502 },
    '地铁/打车'
  );

  assert.strictEqual(targets[0].address, '上海外滩');
  assert.strictEqual(geocoderRequest.url, 'https://apis.map.qq.com/ws/geocoder/v1/');
  assert.strictEqual(Object.prototype.hasOwnProperty.call(geocoderRequest.data, 'key'), true);
  assert.strictEqual(geocoderRequest.data.address, '上海外滩');
  assert.strictEqual(walkingRequest.url, 'https://apis.map.qq.com/ws/direction/v1/walking/');
  assert.strictEqual(drivingRequest.url, 'https://apis.map.qq.com/ws/direction/v1/driving/');
  assert.strictEqual(walkingRequest.data.from, '31.239,121.499');
  assert.strictEqual(
    env.app.formatTencentRouteError(new Error('此key每日调用量已达到上限')),
    '腾讯路线今日配额已用完，已切换本地推荐路线。'
  );
});

test('分类详情加号会记住当前新增分类', () => {
  const env = loadMiniProgram();
  const categoryConfig = env.run('pages/category/category.js');
  const page = createPage(categoryConfig, { id: 'medicine' });
  page.triggerLoad();

  page.addItem();

  assert.strictEqual(env.storage.preferredCategoryId, 'medicine');
  assert.deepStrictEqual(env.navCalls.slice(-1), [
    { type: 'navigateTo', url: '/pages/add/add' }
  ]);
});

test('可以删除自定义物品并刷新分类统计', () => {
  const env = loadMiniProgram();
  const added = env.app.addItem({ categoryId: 'travel', name: '墨镜', count: 1 });
  assert.strictEqual(env.app.getCategories().find(item => item.id === 'travel').items.some(item => item.id === added.id), true);

  env.app.removeCustomItem(added.id);

  assert.strictEqual(env.app.getCategories().find(item => item.id === 'travel').items.some(item => item.id === added.id), false);
});

test('可以按分类打包和清空打包状态', () => {
  const env = loadMiniProgram();
  const travel = env.app.getCategories().find(item => item.id === 'travel');

  env.app.unpackCategory('travel');
  assert.strictEqual(env.app.getCategoryProgress(travel).packed, 0);

  env.app.packCategory('travel');
  assert.strictEqual(env.app.getCategoryProgress(travel).packed, travel.items.length);

  env.app.unpackAll();
  assert.strictEqual(env.app.getOverallProgress().packed, 0);
});

test('模板物品重复套用时不会重复添加同名物品', () => {
  const env = loadMiniProgram();

  env.app.addItem({ categoryId: 'travel', name: '墨镜', count: 1 }, { unique: true });
  env.app.addItem({ categoryId: 'travel', name: '墨镜', count: 1 }, { unique: true });

  const travelItems = env.app.getCategories().find(item => item.id === 'travel').items;
  assert.strictEqual(travelItems.filter(item => item.name === '墨镜').length, 1);
});

test('可以删除自定义行程并保留预设行程', () => {
  const env = loadMiniProgram();
  const trip = env.app.addTrip({
    city: '南京',
    dateRange: '8月5日 - 8月6日',
    note: '测试行程'
  });

  assert.strictEqual(env.app.getTrips().some(item => item.id === trip.id), true);
  env.app.removeCustomTrip(trip.id);

  assert.strictEqual(env.app.getTrips().some(item => item.id === trip.id), false);
  assert.strictEqual(env.app.getTrips().some(item => item.id === 'shanghai'), true);
});

test('重置用户数据会清空自定义内容并恢复默认打包状态', () => {
  const env = loadMiniProgram();
  env.app.addItem({ categoryId: 'travel', name: '墨镜', count: 1 });
  env.app.addTrip({ city: '南京', dateRange: '8月5日 - 8月6日', note: '测试行程' });
  env.wx.setStorageSync('preferredCategoryId', 'travel');
  env.app.unpackAll();

  env.app.resetUserData();

  assert.strictEqual(JSON.stringify(env.wx.getStorageSync('customItems')), '[]');
  assert.strictEqual(JSON.stringify(env.wx.getStorageSync('customTrips')), '[]');
  assert.strictEqual(env.wx.getStorageSync('preferredCategoryId'), '');
  assert.strictEqual(JSON.stringify(env.app.getPackedIds()), JSON.stringify(env.app.getDefaultPackedIds()));
});

test('页面总数不超过十页且路线账单使用不同导航图标', () => {
  const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  const routeTab = appJson.tabBar.list.find(item => item.text === '路线');
  const billTab = appJson.tabBar.list.find(item => item.text === '账单');

  assert.strictEqual(appJson.pages.length, 10);
  assert.ok(routeTab.iconPath.includes('route'));
  assert.ok(billTab.iconPath.includes('bill'));
  assert.notStrictEqual(routeTab.iconPath, billTab.iconPath);
  assert.notStrictEqual(routeTab.selectedIconPath, billTab.selectedIconPath);
});

test('示例行程倒计时会根据 startDate 自动计算', () => {
  const env = loadMiniProgram();
  const today = new Date(2026, 5, 23);

  assert.strictEqual(env.app.calculateDaysLeft('2026-07-03', today), 10);
  assert.strictEqual(env.app.calculateDaysLeft('2026-07-09', today), 16);
  assert.strictEqual(env.app.calculateDaysLeft('2026-07-16', today), 23);
  assert.strictEqual(env.app.withComputedTrip({ city: '上海', startDate: '2026-07-03', daysLeft: 29 }, today).daysLeft, 10);
});

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');

function loadMiniProgram() {
  const storage = {};
  const pages = {};
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
      if (options.success) {
        options.success();
      }
    },
    navigateTo() {}
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
  return { app: appInstance, run };
}

function createPage(pageConfig, options = {}) {
  return {
    ...pageConfig,
    data: JSON.parse(JSON.stringify(pageConfig.data || {})),
    setData(patch) {
      this.data = { ...this.data, ...patch };
    },
    triggerLoad() {
      if (this.onLoad) {
        this.onLoad(options);
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

test('imported attractions can be matched with Tencent POI coordinates', () => {
  const env = loadMiniProgram();
  const spots = env.app.parseAttractions('\u7b2c\u4e00\u5929\u4e0a\u5348\u5916\u6ee9\uff0c\u4e2d\u5348\u5357\u4eac\u8def');
  assert.strictEqual(typeof env.app.matchAttractionsWithPois, 'function');

  const matched = env.app.matchAttractionsWithPois(spots, [
    {
      name: '\u5916\u6ee9',
      address: '\u4e2d\u5c71\u4e1c\u4e00\u8def',
      city: '\u4e0a\u6d77\u5e02',
      lat: 31.239,
      lng: 121.499
    },
    {
      name: '\u5357\u4eac\u8def\u6b65\u884c\u8857',
      address: '\u5357\u4eac\u4e1c\u8def',
      city: '\u4e0a\u6d77\u5e02',
      lat: 31.235,
      lng: 121.475
    }
  ]);

  assert.strictEqual(matched[0].address, '\u4e2d\u5c71\u4e1c\u4e00\u8def');
  assert.strictEqual(matched[0].lat, 31.239);
  assert.strictEqual(matched[1].lng, 121.475);
});

test('add page saves imported POI coordinates into custom trip', () => {
  const env = loadMiniProgram();
  const addConfig = env.run('pages/add/add.js');
  const page = createPage(addConfig);
  page.onLoad();
  page.setData({
    type: 'trip',
    name: '\u4e0a\u6d77\u5bfc\u5165',
    startDate: '2026-07-08',
    endDate: '2026-07-09',
    attractionsText: '\u7b2c\u4e00\u5929\u4e0a\u5348\u5916\u6ee9',
    importedSpots: [
      {
        time: '09:00',
        name: '\u5916\u6ee9',
        note: '\u7b2c\u4e00\u5929\u4e0a\u5348',
        address: '\u4e2d\u5c71\u4e1c\u4e00\u8def',
        lat: 31.239,
        lng: 121.499
      }
    ]
  });

  page.saveDraft();

  const trip = env.app.getTrips().find(item => item.city === '\u4e0a\u6d77\u5bfc\u5165');
  assert.strictEqual(trip.attractions[0].lat, 31.239);
  assert.strictEqual(trip.attractions[0].lng, 121.499);
  assert.strictEqual(trip.attractions[0].address, '\u4e2d\u5c71\u4e1c\u4e00\u8def');
});

test('route map active spot can be saved as favorite place', () => {
  const env = loadMiniProgram();
  const planConfig = env.run('pages/plan/plan.js');
  const page = createPage(planConfig, { id: 'shanghai' });
  page.triggerLoad();
  page.tapMapMarker({ markerId: 1 });
  assert.strictEqual(typeof page.favoriteActiveSpot, 'function');

  page.favoriteActiveSpot();

  assert.strictEqual(env.app.getFavoritePlaces().some(item => item.name === page.data.activeMapSpot.name), true);
});

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');

function loadMiniProgram() {
  const storage = {};
  const pages = {};
  const modalCalls = [];
  const calendarCalls = [];
  const subscribeCalls = [];
  const toastCalls = [];
  let subscribeResponse = null;
  let appInstance;

  const wx = {
    getStorageSync(key) {
      return storage[key];
    },
    setStorageSync(key, value) {
      storage[key] = value;
    },
    setNavigationBarTitle() {},
    showToast(options) {
      toastCalls.push(options);
    },
    showModal(options) {
      modalCalls.push(options);
      if (options.success) {
        options.success({ confirm: true });
      }
    },
    requestSubscribeMessage(options) {
      subscribeCalls.push(options);
      if (subscribeResponse && options.success) {
        options.success(subscribeResponse);
        return;
      }
      if (options.fail) {
        options.fail({ errMsg: 'no template' });
      }
    },
    addPhoneCalendar(options) {
      calendarCalls.push(options);
      if (options.success) {
        options.success({ errMsg: 'addPhoneCalendar:ok' });
      }
    },
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
  return {
    app: appInstance,
    run,
    storage,
    modalCalls,
    calendarCalls,
    subscribeCalls,
    toastCalls,
    setSubscribeResponse(response) {
      subscribeResponse = response;
    }
  };
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
    const result = fn();
    if (result && typeof result.then === 'function') {
      result
        .then(() => {
          console.log(`PASS ${name}`);
        })
        .catch(error => {
          console.error(`FAIL ${name}`);
          console.error(error.message);
          process.exitCode = 1;
        });
      return;
    }
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

test('Tencent transit route response is parsed from nested line data', () => {
  const env = loadMiniProgram();
  const parsed = env.app.parseTencentDirectionData({
    result: {
      routes: [
        {
          distance: 3200,
          duration: 28,
          steps: [
            {
              lines: [
                { title: '\u5730\u94c110\u53f7\u7ebf' }
              ],
              polyline: [31239000, 121499000, 10, 10]
            },
            {
              instruction: '\u6b65\u884c\u81f3\u8c6b\u56ed',
              polyline: [31240000, 121500000, 20, 20]
            }
          ]
        }
      ]
    }
  }, {
    mode: '\u5730\u94c1',
    minutes: 35,
    cost: 4,
    from: '\u9646\u5bb6\u5634',
    to: '\u8c6b\u56ed'
  });

  assert.strictEqual(parsed.source, 'tencent');
  assert.strictEqual(parsed.minutes, 28);
  assert.strictEqual(parsed.distanceText, '3.2\u516c\u91cc');
  assert.strictEqual(JSON.stringify(parsed.transitLines), JSON.stringify(['\u5730\u94c110\u53f7\u7ebf']));
  assert.ok(parsed.polylinePoints.length > 0);
});

test('backup import validates format and version before writing storage', () => {
  const env = loadMiniProgram();
  env.app.addItem({ categoryId: 'travel', name: '\u58a8\u955c', count: 1 });
  const before = JSON.stringify(env.storage.customItems);

  assert.throws(() => env.app.importBackup('not json'), /\u5907\u4efd\u683c\u5f0f\u4e0d\u6b63\u786e/);
  assert.throws(() => env.app.importBackup(JSON.stringify({ version: 2, data: {} })), /\u7248\u672c/);
  assert.strictEqual(JSON.stringify(env.storage.customItems), before);
});

test('profile asks before overwriting data during backup import', () => {
  const env = loadMiniProgram();
  const profileConfig = env.run('pages/profile/profile.js');
  const page = createPage(profileConfig);
  page.triggerLoad = function triggerLoad() {};
  page.onBackupInput({ detail: { value: env.app.exportBackup() } });

  page.importBackup();

  assert.strictEqual(env.modalCalls.length, 1);
  assert.ok(env.modalCalls[0].content.includes('\u8986\u76d6'));
});

test('AA settlement shows who owes the payer', () => {
  const env = loadMiniProgram();
  env.app.addBill('shanghai', {
    title: '\u5348\u9910',
    category: '\u9910\u996e',
    amount: 120,
    type: 'actual',
    participants: 3,
    payer: '\u5c0f\u660e',
    members: '\u5c0f\u660e,\u5c0f\u7ea2,\u5c0f\u674e'
  });

  const summary = env.app.getBillSummary('shanghai');

  assert.strictEqual(summary.aaSummary.average, 40);
  assert.strictEqual(JSON.stringify(summary.aaSummary.settlements.map(item => item.text)), JSON.stringify([
    '\u5c0f\u7ea2\u6b20\u5c0f\u660e \u00a540',
    '\u5c0f\u674e\u6b20\u5c0f\u660e \u00a540'
  ]));
});

test('AA settlement includes payer when payer is missing from member list', () => {
  const env = loadMiniProgram();
  const bill = env.app.addBill('shanghai', {
    title: '\u6253\u8f66',
    category: '\u4ea4\u901a',
    amount: 120,
    type: 'actual',
    participants: 2,
    payer: '\u5c0f\u660e',
    members: '\u5c0f\u7ea2,\u5c0f\u674e'
  });

  const summary = env.app.getBillSummary('shanghai');

  assert.strictEqual(JSON.stringify(bill.members), JSON.stringify(['\u5c0f\u7ea2', '\u5c0f\u674e', '\u5c0f\u660e']));
  assert.strictEqual(bill.participants, 3);
  assert.strictEqual(bill.shareAmount, 40);
  assert.strictEqual(JSON.stringify(summary.aaSummary.settlements.map(item => item.text)), JSON.stringify([
    '\u5c0f\u7ea2\u6b20\u5c0f\u660e \u00a540',
    '\u5c0f\u674e\u6b20\u5c0f\u660e \u00a540'
  ]));
});

test('natural language import can split attractions into different trip days', () => {
  const env = loadMiniProgram();
  const trip = env.app.addTrip({
    city: '\u4e0a\u6d77\u591a\u65e5',
    startDate: '2026-07-08',
    endDate: '2026-07-09',
    attractionsText: '\u7b2c\u4e00\u5929\u4e0a\u5348\u5916\u6ee9\uff0c\u4e0b\u5348\u8c6b\u56ed\uff1b\u7b2c\u4e8c\u5929\u4e0a\u5348\u4e0a\u6d77\u535a\u7269\u9986\uff0c\u4e0b\u5348\u8fea\u58eb\u5c3c'
  });

  assert.strictEqual(trip.itineraryDays.length, 2);
  assert.strictEqual(JSON.stringify(trip.itineraryDays[0].attractions.map(item => item.name)), JSON.stringify(['\u5916\u6ee9', '\u8c6b\u56ed']));
  assert.strictEqual(JSON.stringify(trip.itineraryDays[1].attractions.map(item => item.name)), JSON.stringify(['\u4e0a\u6d77\u535a\u7269\u9986', '\u8fea\u58eb\u5c3c']));
});

test('natural language import with one day marker still creates a day group', () => {
  const env = loadMiniProgram();
  const trip = env.app.addTrip({
    city: '\u4e0a\u6d77\u5355\u65e5',
    startDate: '2026-07-08',
    endDate: '2026-07-08',
    attractionsText: '\u7b2c\u4e00\u5929\u4e0a\u5348\u5916\u6ee9\uff0c\u4e0b\u5348\u8c6b\u56ed'
  });

  assert.strictEqual(trip.itineraryDays.length, 1);
  assert.strictEqual(trip.itineraryDays[0].title, '\u7b2c1\u5929');
  assert.strictEqual(JSON.stringify(trip.itineraryDays[0].attractions.map(item => item.name)), JSON.stringify(['\u5916\u6ee9', '\u8c6b\u56ed']));
});

test('reminder status reports missing subscription template configuration', () => {
  const env = loadMiniProgram();
  const status = env.app.getReminderConfigStatus();

  assert.strictEqual(status.configured, false);
  assert.ok(status.text.includes('\u672a\u914d\u7f6e'));
});

test('memo reminder explains missing subscription template fallback', () => {
  const env = loadMiniProgram();
  const memo = env.app.addMemo('shanghai', {
    content: '\u68c0\u67e5\u8bc1\u4ef6',
    category: '\u51fa\u53d1\u524d',
    date: '2026-07-03',
    remindTime: '08:30'
  });

  return env.app.scheduleMemoReminder('shanghai', memo.id).then(result => {
    assert.strictEqual(result.channel, 'calendar');
    assert.strictEqual(result.reason, 'missing-template');
    assert.strictEqual(env.subscribeCalls.length, 0);
    assert.strictEqual(env.calendarCalls.length, 1);
  });
});

test('memo reminder explains denied subscription fallback', () => {
  const env = loadMiniProgram();
  const memo = env.app.addMemo('shanghai', {
    content: '\u68c0\u67e5\u8bc1\u4ef6',
    category: '\u51fa\u53d1\u524d',
    date: '2026-07-03',
    remindTime: '08:30'
  });
  env.app.globalData.reminderTemplateIds = ['mock-template-id'];
  env.setSubscribeResponse({ 'mock-template-id': 'reject' });

  return env.app.scheduleMemoReminder('shanghai', memo.id).then(result => {
    const message = env.app.formatReminderResult(result);
    assert.strictEqual(result.channel, 'calendar');
    assert.strictEqual(result.reason, 'subscribe-denied');
    assert.ok(message.title.includes('\u65e5\u5386'));
  });
});

test('memo reminder tries subscription and falls back to phone calendar', () => {
  const env = loadMiniProgram();
  const memo = env.app.addMemo('shanghai', {
    content: '\u68c0\u67e5\u8bc1\u4ef6',
    category: '\u51fa\u53d1\u524d',
    date: '2026-07-03',
    remindTime: '08:30'
  });
  env.app.globalData.reminderTemplateIds = ['mock-template-id'];

  return env.app.scheduleMemoReminder('shanghai', memo.id).then(result => {
    assert.strictEqual(result.channel, 'calendar');
    assert.strictEqual(env.subscribeCalls.length, 1);
    assert.strictEqual(env.calendarCalls.length, 1);
  });
});

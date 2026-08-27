/* ===========================================================
   SMITTEDROP — спільні дані гри (кейси, предмети, шанси).
   Використовується і на клієнті (браузер), і на сервері (Node),
   щоб дропи в дуелі рахувались ОДНАКОВО і чесно для обох гравців.
=========================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GameData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  const RARITY = {
    common:    { label: 'Звичайний',   color: '#9ca3af' },
    uncommon:  { label: 'Незвичайний', color: '#4d8dff' },
    rare:      { label: 'Рідкісний',   color: '#a259ff' },
    epic:      { label: 'Епічний',     color: '#ff4dd8' },
    mythic:    { label: 'Міфічний',    color: '#ff2d2d' },
    legendary: { label: 'Золотий',     color: '#ffb800' },
  };
  const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'mythic', 'legendary'];

  const COLLECTIONS = {
    desert:   { name: 'Колекція Пустелі',    emoji: '🏜️' },
    jungle:   { name: 'Колекція Джунглів',   emoji: '🌴' },
    arctic:   { name: 'Колекція Арктики',    emoji: '❄️' },
    inferno:  { name: 'Колекція Пекла',      emoji: '🔥' },
    cosmos:   { name: 'Колекція Космосу',    emoji: '🌌' },
    ocean:    { name: 'Колекція Океану',     emoji: '🌊' },
    cyber:    { name: 'Колекція Кіберпанку', emoji: '🤖' },
    medieval: { name: 'Колекція Середньовіччя', emoji: '🏰' },
    egypt:    { name: 'Колекція Єгипту',     emoji: '🐫' },
    samurai:  { name: 'Колекція Самураїв',   emoji: '🎌' },
    special:  { name: 'Унікальний предмет',  emoji: '⚡' },
  };

  // База: значення (value) підібрані так, щоб плавно рости від рівня до рівня.
  const TIERS = {
    common:    12,
    uncommon:  75,
    rare:      260,
    epic:      800,
    mythic:    1800,
    legendary: 3600,
  };

  function mk(name, rarity, ic, collection, mult) {
    return { name, rarity, ic, collection, value: Math.round(TIERS[rarity] * (mult || 1)) };
  }

  const ITEMS = [
    // ---- Desert ----
    mk('Пісочний Клинок',      'common',    '🗡️', 'desert', 1.0),
    mk('Барханний Спис',       'uncommon',  '🔱', 'desert', 0.95),
    mk('Оазисний Клинок',      'rare',      '💧', 'desert', 0.92),
    mk('Скорпіонячий Ужал',    'epic',      '🦂', 'desert', 0.88),
    mk('Вогняна Буря',         'mythic',    '🌪️', 'desert', 0.9),
    mk('Сфінксовий Скіпетр',   'legendary', '🗿', 'desert', 0.9),

    // ---- Jungle ----
    mk('Ліановий Ніж',         'common',    '🌿', 'jungle', 1.1),
    mk('Змієне Ікло',          'uncommon',  '🐍', 'jungle', 1.05),
    mk('Смарагдовий Клинок',   'rare',      '🐊', 'jungle', 1.0),
    mk('Ягуарова Лють',        'epic',      '🐆', 'jungle', 1.0),
    mk('Отруйний Розквіт',     'mythic',    '🍄', 'jungle', 0.97),
    mk('Дух Джунглів',         'legendary', '🦍', 'jungle', 1.0),

    // ---- Arctic ----
    mk('Крижаний Скол',        'common',    '🧊', 'arctic', 0.95),
    mk('Морозний Різак',       'uncommon',  '❄️', 'arctic', 1.0),
    mk('Полярне Сяйво',        'rare',      '🌠', 'arctic', 0.96),
    mk('Крижаний Шторм',       'epic',      '🌨️', 'arctic', 0.94),
    mk('Лавина Гніву',         'mythic',    '🏔️', 'arctic', 0.94),
    mk('Володар Хуртовини',    'legendary', '🐻‍❄️', 'arctic', 0.95),

    // ---- Inferno ----
    mk('Тліюча Скалка',        'common',    '🪨', 'inferno', 1.05),
    mk('Сірчаний Клинок',      'uncommon',  '🌋', 'inferno', 1.08),
    mk('Пекельний Спис',       'rare',      '😈', 'inferno', 1.02),
    mk('Демонічний Розлом',    'epic',      '👹', 'inferno', 1.02),
    mk("Полум'яний Апокаліпсис",'mythic',   '🔥', 'inferno', 1.0),
    mk('Володар Пекла',        'legendary', '👺', 'inferno', 1.05),

    // ---- Cosmos ----
    mk('Зоряний Пил',          'common',    '✨', 'cosmos', 1.15),
    mk('Метеоритний Скол',     'uncommon',  '☄️', 'cosmos', 1.2),
    mk('Галактичний Клинок',   'rare',      '🌌', 'cosmos', 1.15),
    mk('Чорна Діра',           'epic',      '🕳️', 'cosmos', 1.12),
    mk('Наднова',              'mythic',    '💥', 'cosmos', 1.1),
    mk('Владика Всесвіту',     'legendary', '🌟', 'cosmos', 1.25),

    // ---- Ocean ----
    mk('Кораловий Різак',      'common',    '🐚', 'ocean', 0.9),
    mk('Акулячий Зуб',         'uncommon',  '🦈', 'ocean', 0.92),
    mk('Трезубець Глибин',     'rare',      '🔱', 'ocean', 0.95),
    mk('Кракенів Щупальце',    'epic',      '🐙', 'ocean', 0.96),
    mk('Цунамі',               'mythic',    '🌊', 'ocean', 0.95),
    mk('Володар Океану',       'legendary', '🧜', 'ocean', 0.92),

    // ---- Cyber ----
    mk('Чіп-Різак',            'common',    '💾', 'cyber', 1.2),
    mk('Неоновий Клинок',      'uncommon',  '🌐', 'cyber', 1.15),
    mk('Кібер-Катана',         'rare',      '🦾', 'cyber', 1.2),
    mk('Дрон-Вбивця',          'epic',      '🛸', 'cyber', 1.18),
    mk('Вірус Судного Дня',    'mythic',    '☣️', 'cyber', 1.15),
    mk('Штучний Розум',        'legendary', '🧠', 'cyber', 1.3),

    // ---- Medieval ----
    mk('Іржавий Кинджал',      'common',    '🔪', 'medieval', 0.85),
    mk('Лицарський Меч',       'uncommon',  '⚔️', 'medieval', 0.9),
    mk('Королівська Булава',   'rare',      '🔨', 'medieval', 0.88),
    mk('Драконобій',           'epic',      '🐉', 'medieval', 0.9),
    mk('Екскалібур',           'mythic',    '🗡️', 'medieval', 0.92),
    mk('Корона Королів',       'legendary', '👑', 'medieval', 0.95),

    // ---- Egypt ----
    mk('Піщаний Серп',         'common',    '🌙', 'egypt', 1.0),
    mk('Скарабей Долі',        'uncommon',  '🪲', 'egypt', 1.02),
    mk('Анкх Життя',           'rare',      '☥', 'egypt', 1.0),
    mk('Прокляття Фараона',    'epic',      '🐍', 'egypt', 1.05),
    mk('Око Ра',               'mythic',    '👁️', 'egypt', 1.05),
    mk('Маска Тутанхамона',    'legendary', '🎭', 'egypt', 1.1),

    // ---- Samurai ----
    mk('Танто Учня',           'common',    '🔪', 'samurai', 1.0),
    mk('Катана Ронінa',        'uncommon',  '⚔️', 'samurai', 1.0),
    mk('Клинок Бусідо',        'rare',      '🎋', 'samurai', 1.05),
    mk('Дух Сьогуна',          'epic',      '🏯', 'samurai', 1.05),
    mk('Гнів Оні',             'mythic',    '👹', 'samurai', 1.0),
    mk('Клинок Тисячі Літ',    'legendary', '🌸', 'samurai', 1.05),
  ];

  // Ультра-рідкісні унікальні предмети — маленький шанс замість звичайного золотого скіна.
  const UNIQUES = [
    { name: 'Клинок Творця',     rarity: 'legendary', value: 10000, ic: '⚔️', collection: 'special' },
    { name: 'Сльоза Дракона',    rarity: 'legendary', value: 8000,  ic: '🩸', collection: 'special' },
    { name: 'Корона Богів',      rarity: 'legendary', value: 12000, ic: '👑', collection: 'special' },
    { name: 'Серце Всесвіту',    rarity: 'legendary', value: 16000, ic: '💠', collection: 'special' },
    { name: 'Останній Промінь',  rarity: 'legendary', value: 20000, ic: '☀️', collection: 'special' },
    { name: 'Артефакт Хаосу',    rarity: 'legendary', value: 30000, ic: '🌀', collection: 'special' },
  ];

  // Кейси різних цінових категорій — від копійчаних до преміальних.
  const CASES = [
    { id: 'penny',    name: 'Копійчаний кейс',   price: 25,     ic: '🪙', color: '#9ca3af',
      odds: { common: .70, uncommon: .22, rare: .06,  epic: .017,  mythic: .0025, legendary: .0005 } },
    { id: 'starter',  name: 'Стартовий кейс',    price: 100,    ic: '📦', color: '#9ca3af',
      odds: { common: .55, uncommon: .29, rare: .12,  epic: .03,   mythic: .008,  legendary: .002 } },
    { id: 'hunter',   name: 'Кейс Мисливця',     price: 300,    ic: '🎯', color: '#4d8dff',
      odds: { common: .28, uncommon: .38, rare: .22,  epic: .09,   mythic: .025,  legendary: .005 } },
    { id: 'chaos',    name: 'Кейс Хаосу',        price: 800,    ic: '🌪️', color: '#a259ff',
      odds: { common: .08, uncommon: .22, rare: .33,  epic: .27,   mythic: .08,   legendary: .02 } },
    { id: 'elite',    name: 'Елітний кейс',      price: 1500,   ic: '💎', color: '#4d8dff',
      odds: { common: .03, uncommon: .12, rare: .30,  epic: .35,   mythic: .16,   legendary: .04 } },
    { id: 'legend',   name: 'Кейс Легенди',      price: 2500,   ic: '🏆', color: '#ffb800',
      odds: { common: .01, uncommon: .06, rare: .20,  epic: .35,   mythic: .25,   legendary: .13 } },
    { id: 'premium',  name: 'Преміум кейс',      price: 5000,   ic: '🎖️', color: '#ff4dd8',
      odds: { common: .0,  uncommon: .02, rare: .12,  epic: .33,   mythic: .35,   legendary: .18 } },
    { id: 'mythical', name: 'Міфічний кейс',     price: 10000,  ic: '🔮', color: '#ff2d2d',
      odds: { common: .0,  uncommon: .0,  rare: .06,  epic: .22,   mythic: .42,   legendary: .30 } },
    { id: 'royal',    name: 'Королівський кейс', price: 25000,  ic: '👑', color: '#ffb800',
      odds: { common: .0,  uncommon: .0,  rare: .0,   epic: .12,   mythic: .38,   legendary: .50 } },
    { id: 'ultimate', name: 'Абсолютний кейс',   price: 50000,  ic: '🌌', color: '#ffb800',
      odds: { common: .0,  uncommon: .0,  rare: .0,   epic: .0,    mythic: .30,   legendary: .70 } },
  ];

  function pickWeightedRarity(odds) {
    const r = Math.random();
    let cum = 0;
    for (const key of RARITY_ORDER) {
      cum += odds[key] || 0;
      if (r <= cum) return key;
    }
    return 'common';
  }

  // Шанс дропнути унікальний предмет замість звичайного legendary зростає для дорожчих кейсів.
  function randomItemOfRarity(rarity, uniqueChance) {
    if (rarity === 'legendary' && Math.random() < (uniqueChance != null ? uniqueChance : 0.08)) {
      return UNIQUES[Math.floor(Math.random() * UNIQUES.length)];
    }
    const pool = ITEMS.filter(i => i.rarity === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function rollCase(caseObj) {
    const rarity = pickWeightedRarity(caseObj.odds);
    const uniqueChance = 0.04 + (caseObj.price / 50000) * 0.16; // 4%..20%
    return randomItemOfRarity(rarity, uniqueChance);
  }

  function rarityByValue(v) {
    if (v >= 3000) return 'legendary';
    if (v >= 1500) return 'mythic';
    if (v >= 650) return 'epic';
    if (v >= 200) return 'rare';
    if (v >= 60) return 'uncommon';
    return 'common';
  }

  function getCase(id) {
    return CASES.find(c => c.id === id);
  }

  return {
    RARITY, RARITY_ORDER, COLLECTIONS, ITEMS, UNIQUES, CASES,
    pickWeightedRarity, randomItemOfRarity, rollCase, rarityByValue, getCase,
  };
});

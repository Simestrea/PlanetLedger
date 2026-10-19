const CONFIG = {
  appName: '有序星球',
  recordKey: 'slh.records.v1',
  budgetKey: 'slh.budgets.v1',
  categoryKey: 'slh.categories.v1',
  incomeCategoryKey: 'slh.incomeCategories.v1',
  defaultBudget: 1500,
};

const DEFAULT_CATEGORIES = [
  { id: 'food',       name: '饮食',     color: '#B8823F' },
  { id: 'daily',      name: '生活用品', color: '#6E7E92' },
  { id: 'stationery', name: '文具',     color: '#7B6B9E' },
  { id: 'party',      name: '聚会',     color: '#A85E52' },
  { id: 'gift',       name: '礼物',     color: '#A85E52' },
  { id: 'study',      name: '学习',     color: '#4E7B80' },
  { id: 'transport',  name: '交通',     color: '#5C7A5C' },
];

const DEFAULT_INCOME_CATEGORIES = [
  { id: 'living',      name: '生活费',   color: '#5C7A5C' },
  { id: 'parttime',    name: '兼职',     color: '#4E7B80' },
  { id: 'scholarship', name: '奖学金',   color: '#B8823F' },
  { id: 'redpacket',   name: '红包',     color: '#A85E52' },
  { id: 'other-in',    name: '其他收入', color: '#6E7E92' },
];

const COLOR_PALETTE = [
  '#B8823F', '#6E7E92', '#7B6B9E', '#A85E52',
  '#A85E52', '#4E7B80', '#5C7A5C', '#8B8478',
  '#C08997', '#C29A4A', '#7A8A6E', '#5C7A6A',
];

function createCategoryStore(storageKey, defaults) {
  return {
    list: [],

    widthOf: function (c) {
      const len = Array.from((c && c.name) || '').length;
      return len >= 3 ? 2 : 1;
    },

    init: function () {
      const saved = Storage.read(storageKey, null);
      if (Array.isArray(saved) && saved.length > 0) {
        this.list = saved;
      } else {
        this.list = defaults.map(function (c) {
          return Object.assign({}, c);
        });
      }
      this.reorder();
      this.save();
    },

    reorder: function () {
      const self = this;
      this.list = this.list
        .map(function (c, i) { return { c: c, i: i }; })
        .sort(function (a, b) {
          const aOther = a.c.id === 'other' || a.c.id === 'other-in';
          const bOther = b.c.id === 'other' || b.c.id === 'other-in';
          if (aOther) return 1;
          if (bOther) return -1;
          const wa = self.widthOf(a.c);
          const wb = self.widthOf(b.c);
          if (wa !== wb) return wb - wa;
          return a.i - b.i;
        })
        .map(function (x) { return x.c; });
    },

    save: function () {
      Storage.write(storageKey, this.list);
    },

    get: function (id) {
      return this.list.find(function (c) { return c.id === id; })
          || this.list[0]
          || { id: '', name: '未分类', color: '#A8A2B0' };
    },

    add: function (name) {
      const trimmed = String(name || '').trim();
      if (!trimmed) return { ok: false, msg: '请填写分类名' };
      if (Array.from(trimmed).length > 6) {
        return { ok: false, msg: '分类名最多 6 个字' };
      }
      if (this.list.some(function (c) { return c.name === trimmed; })) {
        return { ok: false, msg: '已经有同名分类了' };
      }

      const id = 'c' + Date.now().toString(36)
               + Math.random().toString(36).slice(2, 4);
      const color = COLOR_PALETTE[this.list.length % COLOR_PALETTE.length];

      this.list.push({ id: id, name: trimmed, color: color });
      this.reorder();
      this.save();
      return { ok: true, id: id };
    },

    remove: function (id) {
      const cat = this.list.find(function (c) { return c.id === id; });
      if (!cat) return { ok: false, msg: '分类不存在' };
      if (this.list.length <= 1) return { ok: false, msg: '至少保留一个分类' };

      this.list = this.list.filter(function (c) { return c.id !== id; });
      this.save();
      return { ok: true };
    },

    setLimit: function (id, value) {
      const cat = this.list.find(function (c) { return c.id === id; });
      if (!cat) return false;

      const num = Number(value);
      if (num > 0) {
        cat.limit = num;
      } else {
        delete cat.limit;
      }
      this.save();
      return true;
    },
  };
}

const Categories = createCategoryStore(CONFIG.categoryKey, DEFAULT_CATEGORIES);
const IncomeCategories = createCategoryStore(CONFIG.incomeCategoryKey, DEFAULT_INCOME_CATEGORIES);

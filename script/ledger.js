const Ledger = {
  records: [],
  budgets: {},

  init: function () {
    const records = Storage.read(CONFIG.recordKey, []);
    const budgets = Storage.read(CONFIG.budgetKey, {});
    this.records = Array.isArray(records) ? records : [];
    this.budgets = (budgets && typeof budgets === 'object') ? budgets : {};

    // 旧数据没有 type 的，视为支出
    this.records.forEach(function (r) {
      if (!r.type) r.type = 'expense';
    });

    // V3.4.1 脏数据修复：
    // 早期版本 IncomeCategories 未初始化时保存的收入记录 categoryId 可能为空，
    // 重新分配到一个有效分类，避免渲染时读到 undefined。
    (function repairIncomeCategoryId(self) {
      if (typeof IncomeCategories === 'undefined') return;
      if (!Array.isArray(IncomeCategories.list) || IncomeCategories.list.length === 0) return;
      const fallback = IncomeCategories.list[0].id;
      let dirty = false;
      self.records.forEach(function (r) {
        if (r.type !== 'income') return;
        const valid = IncomeCategories.list.some(function (c) {
          return c.id === r.categoryId;
        });
        if (!valid) {
          r.categoryId = fallback;
          dirty = true;
        }
      });
      if (dirty) self.saveRecords();
    })(this);

    // 一次性迁移：旧版存钱罐正数金额 → 收入记录
    const savings = Storage.read('slh.savings.v1', []);
    if (Array.isArray(savings) && savings.length > 0) {
      const self = this;
      let migrated = false;
      savings.forEach(function (s) {
        if (s.amount > 0) {
          const d = new Date(s.createdAt);
          const pad = function (n) { return String(n).padStart(2, '0'); };
          const date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
          self.records.push({
            id: s.id,
            type: 'income',
            amount: Number(s.amount),
            categoryId: 'other-in',
            note: s.note || '',
            date: date,
            createdAt: s.createdAt,
          });
          migrated = true;
        }
      });
      if (migrated) {
        this.saveRecords();
        Storage.write('slh.savings.v1', []);
      }
    }
  },

  formatDate: function (d) {
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  },

  today: function () { return this.formatDate(new Date()); },
  todayMonth: function () { return this.today().slice(0, 7); },

  add: function (payload) {
    const record = {
      id: Date.now() + '-' + Math.random().toString(16).slice(2, 8),
      type: payload.type === 'income' ? 'income' : 'expense',
      amount: Number(payload.amount),
      categoryId: payload.categoryId,
      note: (payload.note || '').trim(),
      date: payload.date,
      createdAt: Date.now(),
    };
    this.records.push(record);
    this.saveRecords();
    return record;
  },

  remove: function (id) {
    this.records = this.records.filter(function (r) { return r.id !== id; });
    this.saveRecords();
  },

  saveRecords: function () {
    Storage.write(CONFIG.recordKey, this.records);
  },

  byMonth: function (month, type) {
    const t = type || 'expense';
    return this.records.filter(function (r) {
      return typeof r.date === 'string' &&
             r.date.indexOf(month) === 0 &&
             (r.type || 'expense') === t;
    });
  },

  byYear: function (year, type) {
    const t = type || 'expense';
    return this.records.filter(function (r) {
      return typeof r.date === 'string' &&
             r.date.indexOf(year) === 0 &&
             (r.type || 'expense') === t;
    });
  },

  recent: function (limit, type) {
    const t = type || 'expense';
    return this.records
      .filter(function (r) { return (r.type || 'expense') === t; })
      .slice()
      .sort(function (a, b) { return b.createdAt - a.createdAt; })
      .slice(0, limit || 10);
  },

  sum: function (list) {
    return list.reduce(function (total, r) { return total + r.amount; }, 0);
  },

  byCategory: function (list, type) {
    const store = type === 'income' ? IncomeCategories : Categories;
    const total = this.sum(list);
    const map = new Map();
    list.forEach(function (r) {
      map.set(r.categoryId, (map.get(r.categoryId) || 0) + r.amount);
    });
    return Array.from(map.entries())
      .map(function (entry) {
        const cat = store.get(entry[0]);
        return {
          id: cat.id,
          name: cat.name,
          color: cat.color,
          amount: entry[1],
          percent: total > 0 ? entry[1] / total : 0,
        };
      })
      .sort(function (a, b) { return b.amount - a.amount; });
  },

  dailyData: function (month, type) {
    const t = type || 'expense';
    const parts = month.split('-');
    const year = Number(parts[0]);
    const mon  = Number(parts[1]);
    const daysInMonth = new Date(year, mon, 0).getDate();

    const map = {};
    this.byMonth(month, t).forEach(function (r) {
      const day = Number(r.date.slice(8, 10));
      map[day] = (map[day] || 0) + r.amount;
    });

    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, amount: map[d] || 0 });
    }
    return result;
  },

  monthlyByYear: function (year, categoryId, type) {
    const t = type || 'expense';
    const result = [];
    for (let m = 1; m <= 12; m++) {
      const month = year + '-' + String(m).padStart(2, '0');
      let list = this.byMonth(month, t);
      if (categoryId) {
        list = list.filter(function (r) { return r.categoryId === categoryId; });
      }
      result.push({
        month: m,
        monthStr: month,
        amount: this.sum(list),
        count: list.length,
      });
    }
    return result;
  },

  prevMonth: function (month) {
    const parts = month.split('-');
    let y = Number(parts[0]);
    let m = Number(parts[1]);
    if (m === 1) { y--; m = 12; } else { m--; }
    return y + '-' + String(m).padStart(2, '0');
  },

  prevYear: function (year) {
    return String(Number(year) - 1);
  },

  countByCategory: function (categoryId, type) {
    const t = type || 'expense';
    return this.records.filter(function (r) {
      return r.categoryId === categoryId && (r.type || 'expense') === t;
    }).length;
  },

  reassignCategory: function (fromId, toId) {
    let moved = 0;
    this.records.forEach(function (r) {
      if (r.categoryId === fromId) { r.categoryId = toId; moved++; }
    });
    if (moved > 0) this.saveRecords();
    return moved;
  },

  getBudget: function (month) {
    const value = this.budgets[month];
    return (typeof value === 'number' && value > 0) ? value : 0;
  },

  setBudget: function (month, value) {
    const num = Number(value);
    if (!num || num <= 0) {
      delete this.budgets[month];
    } else {
      this.budgets[month] = num;
    }
    Storage.write(CONFIG.budgetKey, this.budgets);
  },

  /* ---------- 净收入（收入 - 支出） ---------- */
  netByMonth: function (month) {
    const income  = this.sum(this.byMonth(month, 'income'));
    const expense = this.sum(this.byMonth(month, 'expense'));
    return { income: income, expense: expense, net: income - expense };
  },

  dailyNetData: function (month) {
    const parts = month.split('-');
    const year = Number(parts[0]);
    const mon  = Number(parts[1]);
    const daysInMonth = new Date(year, mon, 0).getDate();

    const incMap = {};
    const expMap = {};
    this.byMonth(month, 'income').forEach(function (r) {
      const d = Number(r.date.slice(8, 10));
      incMap[d] = (incMap[d] || 0) + r.amount;
    });
    this.byMonth(month, 'expense').forEach(function (r) {
      const d = Number(r.date.slice(8, 10));
      expMap[d] = (expMap[d] || 0) + r.amount;
    });

    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const inc = incMap[d] || 0;
      const exp = expMap[d] || 0;
      result.push({ day: d, income: inc, expense: exp, net: inc - exp });
    }
    return result;
  },

  monthlyNetByYear: function (year) {
    const result = [];
    for (let m = 1; m <= 12; m++) {
      const month = year + '-' + String(m).padStart(2, '0');
      const income  = this.sum(this.byMonth(month, 'income'));
      const expense = this.sum(this.byMonth(month, 'expense'));
      result.push({
        month: m,
        monthStr: month,
        income: income,
        expense: expense,
        net: income - expense,
      });
    }
    return result;
  },
};

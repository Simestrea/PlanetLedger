const UI = {
  els: {},
  selectedCategoryId: 'food',
  selectedIncomeCategoryId: '',
  toastTimer: null,

  chartType: 'bars',

  statMode: 'month',
  statType: 'expense',
  statPeriod: '',
  statCategoryId: '',
  statCompare: true,
  comparePeriod: '',

  init: function () {
    const $ = function (id) { return document.getElementById(id); };

    this.els = {
      monthPicker:   $('monthPicker'),
      monthExpense:  $('monthExpense'),
      monthLeft:     $('monthLeft'),
      monthLeftLabel:$('monthLeftLabel'),
      budgetFill:    $('budgetFill'),

      catGrid:       $('catGrid'),
      amountInput:   $('amountInput'),
      splitInput:    $('splitInput'),
      amountPreview: $('amountPreview'),
      noteInput:     $('noteInput'),
      dateInput:     $('dateInput'),
      submitBtn:     $('submitBtn'),

      incomeCatGrid:       $('incomeCatGrid'),
      incomeAmountInput:   $('incomeAmountInput'),
      incomeSplitInput:    $('incomeSplitInput'),
      incomeAmountPreview: $('incomeAmountPreview'),
      incomeNoteInput:     $('incomeNoteInput'),
      incomeDateInput:     $('incomeDateInput'),
      incomeSubmitBtn:     $('incomeSubmitBtn'),
      incomeRecentList:    $('incomeRecentList'),
      incomeRecentEmpty:   $('incomeRecentEmpty'),

      recentList:    $('recentList'),
      recentEmpty:   $('recentEmpty'),

      recordList:    $('recordList'),
      listEmpty:     $('listEmpty'),

      statTypeSeg:      $('statTypeSeg'),
      statModeSeg:      $('statModeSeg'),
      statCompareToggle:$('statCompareToggle'),
      statComparePeriodBtn:$('statComparePeriodBtn'),
      statPeriodBtn:    $('statPeriodBtn'),
      statPeriodLabel:  $('statPeriodLabel'),
      statCatSelect:    $('statCatSelect'),
      statCatFakeLabel: $('statCatFakeLabel'),
      statSummary:      $('statSummary'),

      chartTitle:    $('chartTitle'),
      chartTabs:     $('chartTabs'),
      chart:         $('chart'),
      chartEmpty:    $('chartEmpty'),

      catManageList: $('catManageList'),
      newCatInput:   $('newCatInput'),
      addCatBtn:     $('addCatBtn'),

      tabs:  Array.prototype.slice.call(document.querySelectorAll('.tab')),
      pages: Array.prototype.slice.call(document.querySelectorAll('.page')),
      toast: $('toast'),
    };

    if (Categories.list.length > 0) {
      this.selectedCategoryId = Categories.list[0].id;
    }
    if (IncomeCategories.list.length > 0) {
      this.selectedIncomeCategoryId = IncomeCategories.list[0].id;
    } else {
      this.selectedIncomeCategoryId = '';
    }

    this.statPeriod = Ledger.todayMonth();

    this.renderCategories();
    this.renderIncomeCategories();
    this.renderStatFilter();

    const self = this;
    requestAnimationFrame(function () { self.updateAllThumbs(); });
  },

  getSplitCount: function (input) {
    const el = input || this.els.splitInput;
    const n = Math.floor(Number(el.value));
    return (isNaN(n) || n < 1) ? 1 : n;
  },

  updateSegThumb: function () {
    const self = this;
    Array.prototype.forEach.call(document.querySelectorAll('.seg'), function (seg) {
      const active = seg.querySelector('.seg__btn.is-active');
      if (!active) return;
      const sRect = seg.getBoundingClientRect();
      const aRect = active.getBoundingClientRect();
      if (aRect.width === 0) return;
      seg.style.setProperty('--seg-thumb-x', (aRect.left - sRect.left) + 'px');
      seg.style.setProperty('--seg-thumb-w', aRect.width + 'px');
      self.markReady(seg);
    });
  },

  updateChartTabsThumb: function () {
    const tabs = this.els.chartTabs;
    if (!tabs) return;
    const active = tabs.querySelector('.chart-tab.is-active:not([hidden])');
    if (!active) return;
    const tRect = tabs.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    if (aRect.width === 0) return;
    tabs.style.setProperty('--tabs-thumb-x', (aRect.left - tRect.left) + 'px');
    tabs.style.setProperty('--tabs-thumb-w', aRect.width + 'px');
    this.markReady(tabs);
  },

  updateTabbarThumb: function () {
    const bar = document.querySelector('.tabbar');
    if (!bar) return;
    const active = bar.querySelector('.tab.is-active');
    if (!active) return;
    const bRect = bar.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    if (aRect.width === 0) return;
    const centerX = aRect.left - bRect.left + aRect.width / 2;
    bar.style.setProperty('--tab-thumb-x', centerX + 'px');
    this.markReady(bar);
  },

  markReady: function (el) {
    if (!el || el.classList.contains('is-ready')) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-ready');
      });
    });
  },

  updateAllThumbs: function () {
    this.updateSegThumb();
    this.updateChartTabsThumb();
    this.updateTabbarThumb();
  },

  formatRecordTime: function (r) {
    if (!r.createdAt) return r.date;
    const d = new Date(r.createdAt);
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return r.date + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  },

  escapeHtml: function (str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;',
      }[ch];
    });
  },

  showToast: function (message) {
    const el = this.els.toast;
    el.textContent = message;
    el.classList.add('is-show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(function () {
      el.classList.remove('is-show');
    }, 1600);
  },

  updateHeader: function (month) {
    const activeTab = document.querySelector('.tab.is-active');
    const currentPage = activeTab ? activeTab.dataset.page : 'page-home';
    const label = document.getElementById('headerAmountLabel');
    const amountEl = this.els.monthExpense;
    const budgetBlock = document.getElementById('headerBudgetBlock');
    const budgetBar = document.getElementById('headerBudgetBar');

    // 决定当前应该显示什么类型的数据
    let showType = 'expense';
    if (currentPage === 'page-savings') {
      showType = 'income';
    } else if (currentPage === 'page-chart') {
      showType = this.statType; // expense / income / net
    } else if (currentPage === 'page-list') {
      showType = 'net'; // 明细页显示净收入
    }

    if (showType === 'expense') {
      if (label) label.textContent = '本月支出';
      if (budgetBlock) budgetBlock.style.display = '';
      if (budgetBar) budgetBar.style.display = '';
      this.renderOverview(month);
    } else {
      if (budgetBlock) budgetBlock.style.display = 'none';
      if (budgetBar) budgetBar.style.display = 'none';

      if (showType === 'income') {
        if (label) label.textContent = '本月收入';
        const income = Ledger.sum(Ledger.byMonth(month, 'income'));
        if (amountEl) amountEl.textContent = '￥' + income.toFixed(2);
      } else if (showType === 'net') {
        if (label) label.textContent = '本月净收入';
        const income = Ledger.sum(Ledger.byMonth(month, 'income'));
        const expense = Ledger.sum(Ledger.byMonth(month, 'expense'));
        const net = income - expense;
        const sign = net < 0 ? '-￥' : '￥';
        if (amountEl) amountEl.textContent = sign + Math.abs(net).toFixed(2);
      }
    }
  },


  renderAll: function (month) {
    this.updateHeader(month);
    this.renderRecent();
    this.renderIncomeRecent();
    this.renderRecords(month);
    this.renderStatAll();
    this.renderCatManage(month);
  },

  renderOverview: function (month) {
    const list = Ledger.byMonth(month, 'expense');
    const expense = Ledger.sum(list);
    const budget = Ledger.getBudget(month);

    this.els.monthExpense.textContent = '￥' + expense.toFixed(2);

    if (budget > 0) {
      const left = budget - expense;
      this.els.monthLeftLabel.textContent = '剩余预算';
      this.els.monthLeft.textContent =
        (left < 0 ? '-￥' : '￥') + Math.abs(left).toFixed(2);
      const percent = Math.min(100, (expense / budget) * 100);
      this.els.budgetFill.style.width = percent + '%';
      this.els.budgetFill.classList.toggle('is-over', expense > budget);
      this.els.budgetFill.parentElement.style.opacity = '1';
    } else {
      this.els.monthLeftLabel.textContent = '本月预算';
      this.els.monthLeft.textContent = '未设置';
      this.els.budgetFill.style.width = '0%';
      this.els.budgetFill.classList.remove('is-over');
      this.els.budgetFill.parentElement.style.opacity = '.35';
    }
  },



  renderCatGrid: function (container, store, selectedId) {
    if (!container) return;
    const html = store.list.map(function (c) {
      const active = c.id === selectedId ? ' is-active' : '';
      const nameLen = Array.from(c.name).length;
      const wide = nameLen >= 3 ? ' cat--wide' : '';
      const delBtn = '<button type="button" class="cat__del"'
        + ' data-cat-del="' + c.id + '"'
        + ' aria-label="删除分类">×</button>';

      return '<div class="cat' + wide + active + '"'
           + ' data-cat="' + c.id + '"'
           + ' style="--cat-color:' + c.color + '">'
           +   '<span class="cat__name">' + UI.escapeHtml(c.name) + '</span>'
           +   delBtn
           + '</div>';
    }).join('');

    const addBtn = '<button type="button" class="cat cat--add" data-cat-add>'
                 +   '<span class="cat__name">+ 添加</span>'
                 + '</button>';

    container.innerHTML = html + addBtn;
  },

  renderCategories: function () {
    const self = this;
    const exists = Categories.list.some(function (c) {
      return c.id === self.selectedCategoryId;
    });
    if (!exists && Categories.list.length > 0) {
      self.selectedCategoryId = Categories.list[0].id;
    }
    this.renderCatGrid(this.els.catGrid, Categories, this.selectedCategoryId);
  },

  renderIncomeCategories: function () {
    const self = this;
    const exists = IncomeCategories.list.some(function (c) {
      return c.id === self.selectedIncomeCategoryId;
    });
    if (!exists && IncomeCategories.list.length > 0) {
      self.selectedIncomeCategoryId = IncomeCategories.list[0].id;
    }
    this.renderCatGrid(this.els.incomeCatGrid, IncomeCategories, this.selectedIncomeCategoryId);
  },

  selectCategory: function (id) {
    this.selectedCategoryId = id;
    Array.prototype.forEach.call(
      this.els.catGrid.querySelectorAll('.cat'),
      function (btn) {
        btn.classList.toggle('is-active', btn.dataset.cat === id);
      }
    );
  },

  selectIncomeCategory: function (id) {
    this.selectedIncomeCategoryId = id;
    Array.prototype.forEach.call(
      this.els.incomeCatGrid.querySelectorAll('.cat'),
      function (btn) {
        btn.classList.toggle('is-active', btn.dataset.cat === id);
      }
    );
  },

  renderRecent: function () {
    const list = Ledger.recent(8, 'expense');
    this.els.recentEmpty.hidden = list.length > 0;

    this.els.recentList.innerHTML = list.map(function (r) {
      const cat = Categories.get(r.categoryId);
      const note = r.note ? ' · ' + UI.escapeHtml(r.note) : '';
      return '<li class="record" data-id="' + r.id + '">'
           +   '<span class="record__dot" style="background:' + cat.color + '"></span>'
           +   '<div class="record__main">'
           +     '<p class="record__name">' + UI.escapeHtml(cat.name) + note + '</p>'
           +     '<p class="record__date">' + UI.formatRecordTime(r) + '</p>'
           +   '</div>'
           +   '<span class="record__amount">-￥' + r.amount.toFixed(2) + '</span>'
           +   '<button class="record__del" type="button" data-del="' + r.id + '">✕</button>'
           + '</li>';
    }).join('');
  },

  renderIncomeRecent: function () {
    if (!this.els.incomeRecentList) return;
    const list = Ledger.recent(8, 'income');
    this.els.incomeRecentEmpty.hidden = list.length > 0;

    this.els.incomeRecentList.innerHTML = list.map(function (r) {
      const cat = IncomeCategories.get(r.categoryId)
                || { name: '未分类', color: '#A8A2B0' };
      const catName = cat.name || '未分类';
      const catColor = cat.color || '#A8A2B0';
      const note = r.note ? ' · ' + UI.escapeHtml(r.note) : '';
      return '<li class="record" data-id="' + r.id + '">'
           +   '<span class="record__dot" style="background:' + catColor + '"></span>'
           +   '<div class="record__main">'
           +     '<p class="record__name">' + UI.escapeHtml(catName) + note + '</p>'
           +     '<p class="record__date">' + UI.formatRecordTime(r) + '</p>'
           +   '</div>'
           +   '<span class="record__amount record__amount--income">+￥' + r.amount.toFixed(2) + '</span>'
           +   '<button class="record__del" type="button" data-del="' + r.id + '">✕</button>'
           + '</li>';
    }).join('');
  },

  renderRecords: function (month) {
    // 获取当月所有的收支记录，并按照日期、创建时间倒序排列
    const list = Ledger.records.filter(function (r) {
      return typeof r.date === 'string' && r.date.indexOf(month) === 0;
    }).sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.createdAt - a.createdAt;
    });

    this.els.listEmpty.hidden = list.length > 0;

    this.els.recordList.innerHTML = list.map(function (r) {
      const isIncome = r.type === 'income';
      // 根据类型从不同的分类库里取数据
      const store = isIncome ? IncomeCategories : Categories;
      const cat = store.get(r.categoryId) || { name: '未分类', color: '#A8A2B0' };
      
      const note = r.note ? ' · ' + UI.escapeHtml(r.note) : '';
      const sign = isIncome ? '+' : '-';
      // 复用已存在的收入绿色 class
      const amtCls = isIncome ? ' record__amount--income' : '';

      return '<li class="record" data-id="' + r.id + '">'
           +   '<span class="record__dot" style="background:' + cat.color + '"></span>'
           +   '<div class="record__main">'
           +     '<p class="record__name">' + UI.escapeHtml(cat.name) + note + '</p>'
           +     '<p class="record__date">' + UI.formatRecordTime(r) + '</p>'
           +   '</div>'
           +   '<span class="record__amount' + amtCls + '">' + sign + '￥' + r.amount.toFixed(2) + '</span>'
           +   '<button class="record__del" type="button" data-del="' + r.id + '">✕</button>'
           + '</li>';
    }).join('');
  },

  renderStatFilter: function () {
    const self = this;

    Array.prototype.forEach.call(
      this.els.statTypeSeg.querySelectorAll('.seg__btn'),
      function (btn) {
        btn.classList.toggle('is-active', btn.dataset.type === self.statType);
      }
    );
    Array.prototype.forEach.call(
      this.els.statModeSeg.querySelectorAll('.seg__btn'),
      function (btn) {
        btn.classList.toggle('is-active', btn.dataset.mode === self.statMode);
      }
    );

    this.els.statPeriodLabel.textContent =
      this.getPeriodLabel(this.statPeriod, this.statMode);

    // 净收入模式：隐藏分类下拉
    const wrap = this.els.statCatSelect.parentElement;
    if (this.statType === 'net') {
      wrap.style.display = 'none';
      this.els.statCatSelect.innerHTML = '<option value="">收支相抵</option>';
      if (this.els.statCatFakeLabel) this.els.statCatFakeLabel.textContent = '收支相抵';
    } else {
      wrap.style.display = '';
      const store = this.statType === 'income' ? IncomeCategories : Categories;
      const allLabel = this.statType === 'income' ? '全部来源' : '全部分类';
      const opts = ['<option value="" data-color="">' + allLabel + '</option>'];
      store.list.forEach(function (c) {
        const sel = c.id === self.statCategoryId ? ' selected' : '';
        opts.push('<option value="' + c.id + '" data-color="' + c.color + '"' + sel + '>'
                + self.escapeHtml(c.name) + '</option>');
      });
      this.els.statCatSelect.innerHTML = opts.join('');

      const selectedOpt = this.els.statCatSelect.options[this.els.statCatSelect.selectedIndex];
      let fakeText = selectedOpt ? selectedOpt.textContent : '全部';
      if (fakeText.indexOf('全部') === 0) fakeText = '全部';
      if (this.els.statCatFakeLabel) this.els.statCatFakeLabel.textContent = fakeText;
    }

    this.els.statCompareToggle.checked = this.statCompare;
        // 「管理分类与额度」卡片仅在「支出」模式下显示
        const catManageCard = document.getElementById('catManageCard');
        if (catManageCard) {
          catManageCard.hidden = (this.statType !== 'expense');
        }
    this.updateSegThumb();
  },

  getPeriodLabel: function (period, mode) {
    if (mode === 'year') return period + ' 年';
    const parts = period.split('-');
    return parts[0] + ' 年 ' + Number(parts[1]) + ' 月';
  },

  getShortPeriodLabel: function (period, mode) {
    if (mode === 'year') return period + '年';
    const parts = period.split('-');
    return Number(parts[1]) + '月';
  },

  getCatLabel: function () {
    if (!this.statCategoryId) {
      return this.statType === 'income' ? '全部收入' : '全部支出';
    }
    const store = this.statType === 'income' ? IncomeCategories : Categories;
    const cat = store.get(this.statCategoryId);
    return cat ? (cat.name || '未分类') : '未分类';
  },

  setStatType: function (type) {
    if (this.statType === type) return;
    this.statType = type;
    this.statCategoryId = '';
    this.comparePeriod = '';

    // ★ 联动顶栏
    this.updateHeader(this.statPeriod);

    if (this.statMode === 'year') {
      this.chartType = 'monthly';
    } else {
      this.chartType = (type === 'net') ? 'daily' : 'bars';
    }

    if (this.els.chartTabs) {
      this.els.chartTabs.classList.remove('is-ready');
    }

    this.renderStatAll();
    const self = this;
    requestAnimationFrame(function () { self.updateSegThumb(); });
  },

  setStatMode: function (mode) {
    if (this.statMode === mode) return;

    if (this.els.chartTabs) {
      this.els.chartTabs.classList.remove('is-ready');
    }

    this.statMode = mode;

    if (mode === 'year') {
      this.statPeriod = this.statPeriod.slice(0, 4);
      this.chartType = 'monthly';
    } else {
      const today = Ledger.todayMonth();
      if (today.slice(0, 4) === this.statPeriod) {
        this.statPeriod = today;
      } else {
        this.statPeriod = this.statPeriod + '-01';
      }
      this.chartType = (this.statType === 'net') ? 'daily' : 'bars';
    }

    this.renderStatAll();
    const self = this;
    requestAnimationFrame(function () { self.updateSegThumb(); });
  },

  setChartType: function (type) {
    this.chartType = type;
    this.renderStatAll();
  },

  renderStatAll: function () {
    if (this.els.chartTitle) {
      this.els.chartTitle.textContent =
        this.statType === 'income' ? '📊 收入图表'
        : this.statType === 'net' ? '📊 净收入图表'
        : '📊 支出图表';
    }
    this.renderStatFilter();
    this.renderStatSummary();
    this.renderChart();
  },

  /* 通用：按 statType 计算总额（net 走独立分支） */
  getStatTotal: function (period, mode) {
    if (this.statType === 'net') {
      const income = mode === 'year'
        ? Ledger.sum(Ledger.byYear(period, 'income'))
        : Ledger.sum(Ledger.byMonth(period, 'income'));
      const expense = mode === 'year'
        ? Ledger.sum(Ledger.byYear(period, 'expense'))
        : Ledger.sum(Ledger.byMonth(period, 'expense'));
      return income - expense;
    }
    const records = this.getStatRecords(period, mode, this.statCategoryId);
    return Ledger.sum(records);
  },

  renderStatSummary: function () {
    if (this.statType === 'net') {
      this.renderNetSummary();
      return;
    }

    const current = this.getStatRecords(this.statPeriod, this.statMode, this.statCategoryId);
    const currentTotal = Ledger.sum(current);

    let html = '<div class="stat-main">'
             +   '<span class="stat-main__label">'
             +     this.getPeriodLabel(this.statPeriod, this.statMode)
             +     ' · ' + this.getCatLabel()
             +   '</span>'
             +   '<strong class="stat-main__value">￥' + currentTotal.toFixed(2) + '</strong>'
             + '</div>';

    if (this.statCompare) {
      let prevPeriod = this.comparePeriod;
      if (!prevPeriod) {
        prevPeriod = this.statMode === 'year'
          ? Ledger.prevYear(this.statPeriod)
          : Ledger.prevMonth(this.statPeriod);
      }
      const prev = this.getStatRecords(prevPeriod, this.statMode, this.statCategoryId);
      const prevTotal = Ledger.sum(prev);

      const max = Math.max(currentTotal, prevTotal, 1);
      const curPct = (currentTotal / max * 100).toFixed(1);
      const prevPct = (prevTotal / max * 100).toFixed(1);

      const curLabel = this.comparePeriod
        ? this.getShortPeriodLabel(this.statPeriod, this.statMode)
        : '本期';

      html += '<div class="stat-compare-bar">'
           +    '<div class="stat-compare-row">'
           +      '<span class="stat-compare-row__label">' + curLabel + '</span>'
           +      '<div class="stat-compare-row__bar">'
           +        '<div class="stat-compare-row__fill" style="width:' + curPct
           +          '%;background:linear-gradient(90deg,var(--c-primary),var(--c-primary-light))"></div>'
           +      '</div>'
           +      '<span class="stat-compare-row__value">￥' + currentTotal.toFixed(2) + '</span>'
           +    '</div>'
           +    '<div class="stat-compare-row">'
           +      '<span class="stat-compare-row__label">'
           +        this.getShortPeriodLabel(prevPeriod, this.statMode)
           +      '</span>'
           +      '<div class="stat-compare-row__bar">'
           +        '<div class="stat-compare-row__fill" style="width:' + prevPct
           +          '%;background:var(--c-border)"></div>'
           +      '</div>'
           +      '<span class="stat-compare-row__value">￥' + prevTotal.toFixed(2) + '</span>'
           +    '</div>'
           +  '</div>';

      const diff = currentTotal - prevTotal;
      const diffPct = prevTotal > 0 ? (diff / prevTotal * 100) : 0;
      let cls = 'stat-diff--same';
      let arrow = '—';
      let txt;

      if (Math.abs(diff) < 0.01) {
        txt = '与' + this.getShortPeriodLabel(prevPeriod, this.statMode) + '持平';
      } else if (diff > 0) {
        cls = 'stat-diff--up';
        arrow = '↑';
        txt = '比' + this.getShortPeriodLabel(prevPeriod, this.statMode)
            + '多 ￥' + diff.toFixed(2)
            + '（+' + diffPct.toFixed(1) + '%）';
      } else {
        cls = 'stat-diff--down';
        arrow = '↓';
        txt = '比' + this.getShortPeriodLabel(prevPeriod, this.statMode)
            + '少 ￥' + Math.abs(diff).toFixed(2)
            + '（' + diffPct.toFixed(1) + '%）';
      }

      html += '<div class="stat-diff ' + cls + '">'
           +    '<span>' + arrow + '</span>'
           +    '<span>' + txt + '</span>'
           +  '</div>';
    }

    if (this.statMode === 'year') {
      const monthly = Ledger.monthlyByYear(
        this.statPeriod,
        this.statCategoryId || null,
        this.statType
      );
      const withData = monthly.filter(function (m) { return m.amount > 0; });
      const avg = withData.length > 0 ? currentTotal / withData.length : 0;
      const peak = monthly.reduce(function (max, m) {
        return m.amount > max.amount ? m : max;
      }, { amount: 0, month: 0 });

      const label1 = this.statType === 'income' ? '有收入' : '有支出';

      html += '<div class="stat-mini-row">'
           +    '<div class="stat-mini">'
           +      '<span class="stat-mini__label">' + label1 + '</span>'
           +      '<strong class="stat-mini__value">' + withData.length + ' 个月</strong>'
           +    '</div>'
           +    '<div class="stat-mini">'
           +      '<span class="stat-mini__label">月均</span>'
           +      '<strong class="stat-mini__value">￥' + avg.toFixed(0) + '</strong>'
           +    '</div>'
           +    '<div class="stat-mini">'
           +      '<span class="stat-mini__label">最高月</span>'
           +      '<strong class="stat-mini__value">'
           +        (peak.month ? peak.month + ' 月' : '—')
           +      '</strong>'
           +    '</div>'
           +  '</div>';
    }

    this.els.statSummary.innerHTML = html;
  },

  /* ---------- 净收入摘要 ---------- */
  renderNetSummary: function () {
    const currentTotal = this.getStatTotal(this.statPeriod, this.statMode);
    const label = this.getPeriodLabel(this.statPeriod, this.statMode);

    let valueClass = '';
    let valueText;
    if (currentTotal > 0.001) {
      valueClass = ' is-positive';
      valueText = '+￥' + currentTotal.toFixed(2);
    } else if (currentTotal < -0.001) {
      valueClass = ' is-negative';
      valueText = '-￥' + Math.abs(currentTotal).toFixed(2);
    } else {
      valueText = '￥0.00';
    }

    let html = '<div class="stat-main">'
             +   '<span class="stat-main__label">' + label + ' · 净收入（收入 - 支出）</span>'
             +   '<strong class="stat-main__value' + valueClass + '">' + valueText + '</strong>'
             + '</div>';

    if (this.statCompare) {
      let prevPeriod = this.comparePeriod;
      if (!prevPeriod) {
        prevPeriod = this.statMode === 'year'
          ? Ledger.prevYear(this.statPeriod)
          : Ledger.prevMonth(this.statPeriod);
      }
      const prevTotal = this.getStatTotal(prevPeriod, this.statMode);

      const maxAbs = Math.max(Math.abs(currentTotal), Math.abs(prevTotal), 1);
      const curPct = Math.min(100, Math.abs(currentTotal) / maxAbs * 100).toFixed(1);
      const prevPct = Math.min(100, Math.abs(prevTotal) / maxAbs * 100).toFixed(1);

      const curLabel = this.comparePeriod
        ? this.getShortPeriodLabel(this.statPeriod, this.statMode)
        : '本期';

      const curColor = currentTotal >= 0 ? '#5C7A6A' : '#A85E52';
      const prevColor = prevTotal >= 0 ? '#5C7A6A' : '#A85E52';

      const curText = (currentTotal >= 0 ? '+' : '-') + '￥' + Math.abs(currentTotal).toFixed(2);
      const prevText = (prevTotal >= 0 ? '+' : '-') + '￥' + Math.abs(prevTotal).toFixed(2);

      html += '<div class="stat-compare-bar">'
           +    '<div class="stat-compare-row">'
           +      '<span class="stat-compare-row__label">' + curLabel + '</span>'
           +      '<div class="stat-compare-row__bar">'
           +        '<div class="stat-compare-row__fill" style="width:' + curPct
           +          '%;background:' + curColor + '"></div>'
           +      '</div>'
           +      '<span class="stat-compare-row__value">' + curText + '</span>'
           +    '</div>'
           +    '<div class="stat-compare-row">'
           +      '<span class="stat-compare-row__label">'
           +        this.getShortPeriodLabel(prevPeriod, this.statMode)
           +      '</span>'
           +      '<div class="stat-compare-row__bar">'
           +        '<div class="stat-compare-row__fill" style="width:' + prevPct
           +          '%;background:' + prevColor + '"></div>'
           +      '</div>'
           +      '<span class="stat-compare-row__value">' + prevText + '</span>'
           +    '</div>'
           +  '</div>';

      const diff = currentTotal - prevTotal;
      const diffPct = Math.abs(prevTotal) > 0.01
        ? (diff / Math.abs(prevTotal) * 100)
        : 0;

      let cls = 'stat-diff--same';
      let arrow = '—';
      let txt;

      if (Math.abs(diff) < 0.01) {
        txt = '与' + this.getShortPeriodLabel(prevPeriod, this.statMode) + '持平';
      } else {
        // 净收入变多是好事 → 用绿色（stat-diff--down），变少用红色
        cls = diff > 0 ? 'stat-diff--down' : 'stat-diff--up';
        arrow = diff > 0 ? '↑' : '↓';
        const absDiff = Math.abs(diff).toFixed(2);
        const absPct = Math.abs(diffPct).toFixed(1);
        txt = '比' + this.getShortPeriodLabel(prevPeriod, this.statMode)
            + (diff > 0 ? '多' : '少') + ' ￥' + absDiff
            + '（' + (diff > 0 ? '+' : '-') + absPct + '%）';
      }

      html += '<div class="stat-diff ' + cls + '">'
           +    '<span>' + arrow + '</span>'
           +    '<span>' + txt + '</span>'
           +  '</div>';
    }

    if (this.statMode === 'year') {
      const monthly = Ledger.monthlyNetByYear(this.statPeriod);
      const withData = monthly.filter(function (m) {
        return m.income > 0 || m.expense > 0;
      });
      const positiveMonths = monthly.filter(function (m) { return m.net > 0; });
      const avg = withData.length > 0 ? currentTotal / withData.length : 0;
      const peak = monthly.reduce(function (max, m) {
        return m.net > max.net ? m : max;
      }, { net: -Infinity, month: 0 });

      const avgText = (avg >= 0 ? '+' : '-') + '￥' + Math.abs(avg).toFixed(0);
      const peakText = (peak.month && peak.net > -Infinity)
        ? (peak.month + ' 月')
        : '—';

      html += '<div class="stat-mini-row">'
           +    '<div class="stat-mini">'
           +      '<span class="stat-mini__label">盈余月</span>'
           +      '<strong class="stat-mini__value">' + positiveMonths.length + ' 个月</strong>'
           +    '</div>'
           +    '<div class="stat-mini">'
           +      '<span class="stat-mini__label">月均净收入</span>'
           +      '<strong class="stat-mini__value">' + avgText + '</strong>'
           +    '</div>'
           +    '<div class="stat-mini">'
           +      '<span class="stat-mini__label">最高月</span>'
           +      '<strong class="stat-mini__value">' + peakText + '</strong>'
           +    '</div>'
           +  '</div>';
    }

    this.els.statSummary.innerHTML = html;
  },

  getStatRecords: function (period, mode, categoryId) {
    let list = mode === 'year'
      ? Ledger.byYear(period, this.statType)
      : Ledger.byMonth(period, this.statType);
    if (categoryId) {
      list = list.filter(function (r) { return r.categoryId === categoryId; });
    }
    return list;
  },

  renderChart: function () {
    /* ---------- 净收入图表 ---------- */
    if (this.statType === 'net') {
      this.syncChartTabs();

      const allowed = this.statMode === 'year'
        ? ['monthly']
        : ['daily', 'line'];
      if (allowed.indexOf(this.chartType) < 0) {
        this.chartType = allowed[0];
      }

      const isYear = this.statMode === 'year';
      const hasData = isYear
        ? Ledger.monthlyNetByYear(this.statPeriod).some(function (m) {
            return m.income > 0 || m.expense > 0;
          })
        : Ledger.dailyNetData(this.statPeriod).some(function (d) {
            return d.income > 0 || d.expense > 0;
          });

      if (!hasData) {
        this.els.chart.innerHTML = '';
        this.els.chartEmpty.hidden = false;
        return;
      }
      this.els.chartEmpty.hidden = true;

      if (isYear) {
        this.els.chart.innerHTML =
          this.renderNetMonthly(Ledger.monthlyNetByYear(this.statPeriod));
      } else if (this.chartType === 'line') {
        this.els.chart.innerHTML = this.renderNetLine(this.statPeriod);
      } else {
        this.els.chart.innerHTML = this.renderNetDaily(this.statPeriod);
      }
      return;
    }

    /* ---------- 支出 / 收入图表 ---------- */
    const records = this.getStatRecords(this.statPeriod, this.statMode, this.statCategoryId);

    this.syncChartTabs();

    if (records.length === 0) {
      this.els.chart.innerHTML = '';
      this.els.chartEmpty.hidden = false;
      return;
    }
    this.els.chartEmpty.hidden = true;

    if (this.statMode === 'year') {
      this.renderYearChart(records);
    } else {
      this.renderMonthChart(records);
    }
  },

  syncChartTabs: function () {
    const self = this;
    const isYear = this.statMode === 'year';
    const isNet = this.statType === 'net';

    Array.prototype.forEach.call(
      this.els.chartTabs.querySelectorAll('.chart-tab'),
      function (btn) {
        const type = btn.dataset.chart;

        if (isNet) {
          const allowed = isYear
            ? (type === 'monthly')
            : (type === 'daily' || type === 'line');
          btn.hidden = !allowed;
          if (allowed) btn.classList.toggle('is-active', type === self.chartType);
          return;
        }

        const monthOnly = (type === 'bars' || type === 'daily' || type === 'line');
        const yearOnly  = (type === 'monthly');

        if (isYear && monthOnly) { btn.hidden = true; return; }
        if (!isYear && yearOnly) { btn.hidden = true; return; }

        btn.hidden = false;
        btn.classList.toggle('is-active', type === self.chartType);
      }
    );
    this.updateChartTabsThumb();
  },

  renderMonthChart: function (records) {
    const t = this.statType;
    switch (this.chartType) {
      case 'pie':
        this.els.chart.innerHTML = this.renderPie(Ledger.byCategory(records, t), false);
        break;
      case 'daily':
        this.els.chart.innerHTML = this.renderDaily(this.statPeriod, t);
        break;
      case 'line':
        this.els.chart.innerHTML = this.renderLine(this.statPeriod, t);
        break;
      default:
        this.els.chart.innerHTML = this.renderBars(Ledger.byCategory(records, t));
    }
  },

  renderYearChart: function (records) {
    const t = this.statType;
    if (this.chartType === 'pie') {
      this.els.chart.innerHTML = this.renderPie(Ledger.byCategory(records, t), false);
      return;
    }
    const monthly = Ledger.monthlyByYear(
      this.statPeriod,
      this.statCategoryId || null,
      t
    );
    this.els.chart.innerHTML = this.renderMonthly(monthly);
  },

  renderMonthly: function (monthly) {
    let max = 0;
    monthly.forEach(function (m) { if (m.amount > max) max = m.amount; });
    if (max === 0) max = 1;

    const bars = monthly.map(function (m) {
      const h = m.amount > 0 ? Math.max(6, (m.amount / max) * 100) : 4;
      const cls = m.amount === 0
        ? ' is-empty'
        : (m.amount === max ? ' is-peak' : '');
      return '<div class="monthly-col">'
           +   '<div class="monthly-bar-wrap">'
           +     '<div class="monthly-bar' + cls + '" style="height:' + h + '%"'
           +       ' title="' + m.month + '月 ￥' + m.amount.toFixed(2) + '"></div>'
           +   '</div>'
           +   '<span class="monthly-label">' + m.month + '</span>'
           + '</div>';
    }).join('');

    return '<div class="monthly-chart">' + bars + '</div>'
         + '<p class="chart-hint">全年最高：￥' + max.toFixed(2) + '</p>';
  },

  renderBars: function (groups) {
    return groups.map(function (g) {
      const width = Math.max(2, Math.round(g.percent * 100));
      return '<div class="bar">'
           +   '<div class="bar__head">'
           +     '<span class="bar__name" style="--bar-color:' + g.color + '">'
           +       UI.escapeHtml(g.name) + '</span>'
           +     '<span class="bar__value">￥' + g.amount.toFixed(2)
           +       ' · ' + (g.percent * 100).toFixed(1) + '%</span>'
           +   '</div>'
           +   '<div class="bar__track">'
           +     '<div class="bar__fill" style="width:' + width
           +       '%;background:' + g.color + '"></div>'
           +   '</div>'
           + '</div>';
    }).join('');
  },

  renderPie: function (groups, isDonut) {
    const total = groups.reduce(function (s, g) { return s + g.amount; }, 0);
    const cx = 100, cy = 100;
    const rOuter = 92;
    const rInner = isDonut ? 56 : 0;

    let body = '';

    if (groups.length === 1) {
      if (isDonut) {
        const mid = (rOuter + rInner) / 2;
        body = '<circle cx="' + cx + '" cy="' + cy + '"'
             + ' r="' + mid + '" fill="none"'
             + ' stroke="' + groups[0].color + '"'
             + ' stroke-width="' + (rOuter - rInner) + '"/>';
      } else {
        body = '<circle cx="' + cx + '" cy="' + cy + '"'
             + ' r="' + rOuter + '" fill="' + groups[0].color + '"/>';
      }
    } else {
      let start = -Math.PI / 2;
      body = groups.map(function (g) {
        const sweep = (g.amount / total) * Math.PI * 2;
        const end = start + sweep;
        const d = UI.arcPath(cx, cy, rOuter, rInner, start, end);
        start = end;
        return '<path d="' + d + '" fill="' + g.color + '"/>';
      }).join('');
    }

    const centerText = isDonut
      ? '<text x="' + cx + '" y="' + (cy - 4) + '"'
      + ' class="pie-center-label" text-anchor="middle">合计</text>'
      + '<text x="' + cx + '" y="' + (cy + 18) + '"'
      + ' class="pie-center-value" text-anchor="middle">￥'
      + total.toFixed(0) + '</text>'
      : '';

    return '<div class="pie-wrap">'
         +   '<svg class="pie-svg" viewBox="0 0 200 200">'
         +     body + centerText
         +   '</svg>'
         + '</div>'
         + this.renderLegend(groups);
  },

  arcPath: function (cx, cy, rOuter, rInner, start, end) {
    const x1 = cx + rOuter * Math.cos(start);
    const y1 = cy + rOuter * Math.sin(start);
    const x2 = cx + rOuter * Math.cos(end);
    const y2 = cy + rOuter * Math.sin(end);

    const largeArc = (end - start) > Math.PI ? 1 : 0;

    if (rInner === 0) {
      return 'M ' + cx + ' ' + cy
           + ' L ' + x1 + ' ' + y1
           + ' A ' + rOuter + ' ' + rOuter + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2
           + ' Z';
    }

    const x3 = cx + rInner * Math.cos(end);
    const y3 = cy + rInner * Math.sin(end);
    const x4 = cx + rInner * Math.cos(start);
    const y4 = cy + rInner * Math.sin(start);

    return 'M ' + x1 + ' ' + y1
         + ' A ' + rOuter + ' ' + rOuter + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2
         + ' L ' + x3 + ' ' + y3
         + ' A ' + rInner + ' ' + rInner + ' 0 ' + largeArc + ' 0 ' + x4 + ' ' + y4
         + ' Z';
  },

  renderLegend: function (groups) {
    return '<ul class="chart-legend">'
         + groups.map(function (g) {
             return '<li class="legend-item">'
                  +   '<span class="legend-dot" style="background:' + g.color + '"></span>'
                  +   '<span class="legend-name">' + UI.escapeHtml(g.name) + '</span>'
                  +   '<span class="legend-value">￥' + g.amount.toFixed(2)
                  +     ' · ' + (g.percent * 100).toFixed(1) + '%</span>'
                  + '</li>';
           }).join('')
         + '</ul>';
  },

  renderDaily: function (month, type) {
    const data = Ledger.dailyData(month, type);
    let max = 0;
    data.forEach(function (d) { if (d.amount > max) max = d.amount; });
    if (max === 0) max = 1;

    const bars = data.map(function (d) {
      const h = d.amount > 0 ? Math.max(4, (d.amount / max) * 100) : 3;
      const cls = d.amount === 0
        ? ' is-empty'
        : (d.amount === max ? ' is-peak' : '');
      return '<div class="daily-col">'
           +   '<div class="daily-bar-wrap">'
           +     '<div class="daily-bar' + cls + '" style="height:' + h + '%"'
           +       ' title="' + d.day + '日 ￥' + d.amount.toFixed(2) + '"></div>'
           +   '</div>'
           +   '<span class="daily-label">' + d.day + '</span>'
           + '</div>';
    }).join('');

    const label = type === 'income' ? '每日收入' : '每日支出';
    return '<div class="daily-chart">' + bars + '</div>'
         + '<p class="chart-hint">' + label + '，最高 ￥' + max.toFixed(2) + '</p>';
  },

  renderLine: function (month, type) {
    const data = Ledger.dailyData(month, type);
    let max = 0;
    data.forEach(function (d) { if (d.amount > max) max = d.amount; });
    if (max === 0) max = 1;

    const W = 360, H = 180;
    const padL = 34, padR = 12, padT = 16, padB = 26;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    const n = data.length;
    const points = data.map(function (d, i) {
      const x = n > 1 ? padL + (i / (n - 1)) * innerW : padL + innerW / 2;
      const y = padT + innerH - (d.amount / max) * innerH;
      return [x, y];
    });

    const grid = [0, 0.25, 0.5, 0.75, 1].map(function (t) {
      const y = padT + innerH * (1 - t);
      const val = Math.round(max * t);
      return '<line x1="' + padL + '" y1="' + y + '"'
           +   ' x2="' + (padL + innerW) + '" y2="' + y + '"'
           +   ' stroke="#E5E1D9" stroke-width="1" stroke-dasharray="3 3"/>'
           + '<text x="' + (padL - 6) + '" y="' + (y + 3) + '"'
           +   ' class="line-axis-label" text-anchor="end">' + val + '</text>';
    }).join('');

    const linePoints = points.map(function (p) {
      return p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ');

    const areaD = 'M ' + padL + ' ' + (padT + innerH)
                + ' L ' + points.map(function (p) {
                    return p[0].toFixed(1) + ' ' + p[1].toFixed(1);
                  }).join(' L ')
                + ' L ' + (padL + innerW) + ' ' + (padT + innerH) + ' Z';

    const dots = points.map(function (p, i) {
      if (data[i].amount === 0) return '';
      return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '"'
           +   ' r="2.8" fill="#7B6B9E" stroke="#fff" stroke-width="1.2"/>';
    }).join('');

    const xLabels = [1, 8, 15, 22, n].filter(function (d, i, arr) {
      return d <= n && arr.indexOf(d) === i;
    }).map(function (d) {
      const i = d - 1;
      const x = n > 1 ? padL + (i / (n - 1)) * innerW : padL + innerW / 2;
      return '<text x="' + x.toFixed(1) + '" y="' + (H - 8) + '"'
           +   ' class="line-axis-label" text-anchor="middle">' + d + '日</text>';
    }).join('');

    const label = type === 'income' ? '本月每日收入趋势' : '本月每日支出趋势';

    return '<svg class="line-svg" viewBox="0 0 ' + W + ' ' + H + '"'
         +   ' preserveAspectRatio="xMidYMid meet">'
         +   '<defs>'
         +     '<linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">'
         +       '<stop offset="0%" stop-color="#7B6B9E" stop-opacity="0.45"/>'
         +       '<stop offset="100%" stop-color="#7B6B9E" stop-opacity="0"/>'
         +     '</linearGradient>'
         +   '</defs>'
         +   grid
         +   '<path d="' + areaD + '" fill="url(#lineGrad)"/>'
         +   '<polyline points="' + linePoints + '"'
         +     ' fill="none" stroke="#7B6B9E" stroke-width="2.2"'
         +     ' stroke-linejoin="round" stroke-linecap="round"/>'
         +   dots
         +   xLabels
         + '</svg>'
         + '<p class="chart-hint">' + label + '，最高 ￥' + max.toFixed(2) + '</p>';
  },

  /* ---------- 净收入图表：按天 ---------- */
  renderNetDaily: function (month) {
    const data = Ledger.dailyNetData(month);
    let maxAbs = 0;
    data.forEach(function (d) {
      const v = Math.abs(d.net);
      if (v > maxAbs) maxAbs = v;
    });
    if (maxAbs === 0) maxAbs = 1;

    const bars = data.map(function (d) {
      const posH = d.net > 0 ? Math.max(4, (d.net / maxAbs) * 100) : 0;
      const negH = d.net < 0 ? Math.max(4, (-d.net / maxAbs) * 100) : 0;
      const tip = '第' + d.day + '日 收￥' + d.income.toFixed(2)
                + ' 支￥' + d.expense.toFixed(2)
                + ' 净' + (d.net >= 0 ? '+' : '-') + '￥' + Math.abs(d.net).toFixed(2);

      return '<div class="net-daily-col">'
           +   '<div class="net-daily-top">'
           +     (posH > 0
                  ? '<div class="net-daily-bar net-daily-bar--pos" style="height:' + posH + '%" title="' + tip + '"></div>'
                  : '')
           +   '</div>'
           +   '<div class="net-daily-bottom">'
           +     (negH > 0
                  ? '<div class="net-daily-bar net-daily-bar--neg" style="height:' + negH + '%" title="' + tip + '"></div>'
                  : '')
           +   '</div>'
           +   '<span class="net-daily-label">' + d.day + '</span>'
           + '</div>';
    }).join('');

    return '<div class="net-daily-chart">' + bars + '</div>'
         + '<p class="chart-hint">每日净收入（绿↑盈余 / 红↓赤字），最大 ￥' + maxAbs.toFixed(2) + '</p>';
  },

  /* ---------- 净收入图表：按月 ---------- */
  renderNetMonthly: function (monthly) {
    let maxAbs = 0;
    monthly.forEach(function (m) {
      const v = Math.abs(m.net);
      if (v > maxAbs) maxAbs = v;
    });
    if (maxAbs === 0) maxAbs = 1;

    const bars = monthly.map(function (m) {
      const posH = m.net > 0 ? Math.max(4, (m.net / maxAbs) * 100) : 0;
      const negH = m.net < 0 ? Math.max(4, (-m.net / maxAbs) * 100) : 0;
      const tip = m.month + '月 收￥' + m.income.toFixed(2)
                + ' 支￥' + m.expense.toFixed(2)
                + ' 净' + (m.net >= 0 ? '+' : '-') + '￥' + Math.abs(m.net).toFixed(2);

      return '<div class="net-monthly-col">'
           +   '<div class="net-monthly-top">'
           +     (posH > 0
                  ? '<div class="net-monthly-bar net-monthly-bar--pos" style="height:' + posH + '%" title="' + tip + '"></div>'
                  : '')
           +   '</div>'
           +   '<div class="net-monthly-bottom">'
           +     (negH > 0
                  ? '<div class="net-monthly-bar net-monthly-bar--neg" style="height:' + negH + '%" title="' + tip + '"></div>'
                  : '')
           +   '</div>'
           +   '<span class="net-monthly-label">' + m.month + '</span>'
           + '</div>';
    }).join('');

    return '<div class="net-monthly-chart">' + bars + '</div>'
         + '<p class="chart-hint">每月净收入（绿↑盈余 / 红↓赤字），最大 ￥' + maxAbs.toFixed(2) + '</p>';
  },

  /* ---------- 净收入图表：趋势 ---------- */
  renderNetLine: function (month) {
    const data = Ledger.dailyNetData(month);
    let maxAbs = 0;
    data.forEach(function (d) {
      const v = Math.abs(d.net);
      if (v > maxAbs) maxAbs = v;
    });
    if (maxAbs === 0) maxAbs = 1;

    const W = 360, H = 200;
    const padL = 40, padR = 12, padT = 16, padB = 26;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const midY = padT + innerH / 2;

    const n = data.length;
    const points = data.map(function (d, i) {
      const x = n > 1 ? padL + (i / (n - 1)) * innerW : padL + innerW / 2;
      const y = midY - (d.net / maxAbs) * (innerH / 2);
      return [x, y];
    });

    const grid = [-1, -0.5, 0.5, 1].map(function (t) {
      const y = midY - t * (innerH / 2);
      const val = (maxAbs * t).toFixed(0);
      return '<line x1="' + padL + '" y1="' + y + '"'
           +   ' x2="' + (padL + innerW) + '" y2="' + y + '"'
           +   ' stroke="#E5E1D9" stroke-width="1" stroke-dasharray="3 3"/>'
           + '<text x="' + (padL - 6) + '" y="' + (y + 3) + '"'
           +   ' class="line-axis-label" text-anchor="end">' + val + '</text>';
    }).join('');

    const zeroLine = '<line x1="' + padL + '" y1="' + midY + '"'
                   + ' x2="' + (padL + innerW) + '" y2="' + midY + '"'
                   + ' stroke="#A8A2B0" stroke-width="1.2"/>';

    const linePoints = points.map(function (p) {
      return p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }).join(' ');

    const dots = points.map(function (p, i) {
      if (data[i].net === 0) return '';
      const isPos = data[i].net > 0;
      return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '"'
           +   ' r="2.8" fill="' + (isPos ? '#5C7A6A' : '#A85E52')
           +   '" stroke="#fff" stroke-width="1.2"/>';
    }).join('');

    const xLabels = [1, 8, 15, 22, n].filter(function (d, i, arr) {
      return d <= n && arr.indexOf(d) === i;
    }).map(function (d) {
      const i = d - 1;
      const x = n > 1 ? padL + (i / (n - 1)) * innerW : padL + innerW / 2;
      return '<text x="' + x.toFixed(1) + '" y="' + (H - 8) + '"'
           +   ' class="line-axis-label" text-anchor="middle">' + d + '日</text>';
    }).join('');

    return '<svg class="line-svg" viewBox="0 0 ' + W + ' ' + H + '"'
         +   ' preserveAspectRatio="xMidYMid meet">'
         +   grid
         +   zeroLine
         +   '<polyline points="' + linePoints + '"'
         +     ' fill="none" stroke="#7B6B9E" stroke-width="2.2"'
         +     ' stroke-linejoin="round" stroke-linecap="round"/>'
         +   dots
         +   xLabels
         + '</svg>'
         + '<p class="chart-hint">本月每日净收入趋势（零线为平衡点），最大 ￥' + maxAbs.toFixed(2) + '</p>';
  },

  renderCatManage: function (month) {
    const targetMonth = month || Ledger.todayMonth();
    const monthList = Ledger.byMonth(targetMonth, 'expense');

    this.els.catManageList.innerHTML = Categories.list.map(function (c) {
      const spent = monthList
        .filter(function (r) { return r.categoryId === c.id; })
        .reduce(function (s, r) { return s + r.amount; }, 0);

      let limitCls = 'cat-manage__limit';
      let limitText = '设额度';

      if (c.limit && c.limit > 0) {
        limitText = '￥' + c.limit;
        const ratio = spent / c.limit;
        if (ratio >= 1)        limitCls += ' is-over';
        else if (ratio >= 0.5) limitCls += ' is-warn';
        else                   limitCls += ' has-limit';
      }

      return '<li class="cat-manage__item">'
           +   '<span class="cat-manage__dot" style="background:' + c.color + '"></span>'
           +   '<span class="cat-manage__name">' + UI.escapeHtml(c.name) + '</span>'
           +   '<span class="' + limitCls + '" data-cat-limit="' + c.id + '">' + limitText + '</span>'
           +   '<button class="cat-manage__del" type="button"'
           +     ' data-cat-del="' + c.id + '">'
           +     '✕'
           +   '</button>'
           + '</li>';
    }).join('');
  },
};

/**
 * 自定义日历组件
 * 支持三种模式：
 *   mode = 'date'  → 选择具体日期（YYYY-MM-DD）
 *   mode = 'month' → 选择年月（YYYY-MM）
 *   mode = 'year'  → 选择年份（YYYY）
 */

const Calendar = {
  panel: null,
  mode: 'date',
  triggerEl: null,
  onChange: null,

  viewYear: 0,
  viewMonth: 0,
  selectedDate: '',
  selectedMonth: '',
  selectedYear: '',
  isOpen: false,

  init: function () {
    const self = this;

    const panel = document.createElement('div');
    panel.className = 'calendar-panel';
    panel.style.display = 'none';
    document.body.appendChild(panel);
    this.panel = panel;

        document.addEventListener('click', function (e) {
      if (!self.isOpen) return;
      if (self.panel.contains(e.target)) return;
      
      // 如果点击的是触发按钮，正常情况下阻止冒泡，交回给 main.js 处理
      if (self.triggerEl && self.triggerEl.contains(e.target)) {
        // 如果此时 triggerEl 已经为空，说明刚刚被 close 掉了，允许冒泡
        // 如果 main.js 里的逻辑是 Toggle，由于我们这里直接返回，它会再执行一次 open
        // 最好的方案是：让 main.js 去决定，但为了防止事件冲突，这里强制交给 main.js
        return; 
      }
      
      self.close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.isOpen) self.close();
    });

    panel.addEventListener('click', function (e) {
      e.stopPropagation();
      self.handleClick(e);
    });

    window.addEventListener('resize', function () {
      if (self.isOpen && self.triggerEl) self.position(self.triggerEl);
    });
    window.addEventListener('scroll', function () {
      if (self.isOpen && self.triggerEl) self.position(self.triggerEl);
    }, true);
  },

  open: function (triggerEl, mode, currentValue, onChange) {
    this.mode = mode;
    this.triggerEl = triggerEl;
    this.onChange = onChange || null;

    let baseDate = new Date();

    if (currentValue) {
      if (mode === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(currentValue)) {
        baseDate = new Date(currentValue + 'T00:00:00');
      } else if (mode === 'month' && /^\d{4}-\d{2}$/.test(currentValue)) {
        baseDate = new Date(currentValue + '-01T00:00:00');
      } else if (mode === 'year' && /^\d{4}$/.test(currentValue)) {
        baseDate = new Date(currentValue + '-01-01T00:00:00');
      }
    }

    this.viewYear = baseDate.getFullYear();
    this.viewMonth = baseDate.getMonth();

    this.selectedDate  = mode === 'date'  ? (currentValue || '') : '';
    this.selectedMonth = mode === 'month' ? (currentValue || '') : '';
    this.selectedYear  = mode === 'year'  ? (currentValue || '') : '';

    this.render();
    this.panel.style.display = 'block';
    this.isOpen = true;

    this.position(triggerEl);
  },

  close: function () {
    this.panel.style.display = 'none';
    this.isOpen = false;
    this.triggerEl = null;
  },

  position: function (triggerEl) {
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const pw = this.panel.offsetWidth || 300;
    const ph = this.panel.offsetHeight || 360;

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    let left = rect.left + rect.width / 2 - pw / 2;
    if (left < 8) left = 8;
    if (left + pw > winW - 8) left = winW - pw - 8;

    // 获取顶栏底部坐标
    const headerEl = document.querySelector('.header');
    const headerBottom = headerEl ? headerEl.getBoundingClientRect().bottom : 0;
    const safeTop = headerBottom + 8;

    // 判断触发元素是否在顶栏内
    const isHeaderTrigger = headerEl && headerEl.contains(triggerEl);

    let top = rect.bottom + 8;

    if (isHeaderTrigger) {
      // 顶栏触发：空间不够可以向上弹，但绝对不进入顶栏区域
      if (top + ph > winH - 8) {
        const topAbove = rect.top - ph - 8;
        if (topAbove >= safeTop) {
          top = topAbove;
        } else {
          top = safeTop;
        }
      }
    } else {
      // 其他页面触发：强制向下弹！
      if (top + ph > winH - 8) {
        top = winH - ph - 8;
      }
      if (top < safeTop) {
        top = safeTop;
      }
    }

    this.panel.style.left = (left + window.scrollX) + 'px';
    this.panel.style.top  = (top  + window.scrollY) + 'px';
  },

  reposition: function () {
    const self = this;
    if (!this.triggerEl) return;
    requestAnimationFrame(function () {
      if (self.isOpen && self.triggerEl) self.position(self.triggerEl);
    });
  },

  render: function () {
    if (this.mode === 'month') {
      this.panel.innerHTML = this.renderMonthMode();
    } else if (this.mode === 'year') {
      this.panel.innerHTML = this.renderYearMode();
    } else {
      this.panel.innerHTML = this.renderDateMode();
    }
  },

  renderDateMode: function () {
    const y = this.viewYear;
    const m = this.viewMonth;
    const today = this.todayStr();

    const firstDay = new Date(y, m, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();

    const cells = [];

    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const pm = m === 0 ? 11 : m - 1;
      const py = m === 0 ? y - 1 : y;
      cells.push({ d: d, m: pm, y: py, other: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ d: d, m: m, y: y, other: false });
    }
    let n = 1;
    while (cells.length < 42) {
      const nm = m === 11 ? 0 : m + 1;
      const ny = m === 11 ? y + 1 : y;
      cells.push({ d: n++, m: nm, y: ny, other: true });
    }

    const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

    const daysHtml = cells.map(function (c) {
      const dateStr = c.y + '-'
        + String(c.m + 1).padStart(2, '0') + '-'
        + String(c.d).padStart(2, '0');

      const cls = ['calendar-day'];
      if (c.other) cls.push('is-other');
      if (dateStr === today) cls.push('is-today');
      if (dateStr === Calendar.selectedDate) cls.push('is-selected');

      return '<button type="button" class="' + cls.join(' ') + '"'
           + ' data-date="' + dateStr + '">' + c.d + '</button>';
    }).join('');

    return ''
      + '<div class="calendar-panel__header">'
      +   '<button type="button" class="calendar-nav" data-nav="prev">‹</button>'
      +   '<div class="calendar-panel__title">' + y + ' 年 ' + (m + 1) + ' 月</div>'
      +   '<button type="button" class="calendar-nav" data-nav="next">›</button>'
      + '</div>'
      + '<div class="calendar-weekdays">'
      +   weekdays.map(function (w) {
            return '<span class="calendar-weekday">' + w + '</span>';
          }).join('')
      + '</div>'
      + '<div class="calendar-days">' + daysHtml + '</div>'
      + '<div class="calendar-foot">'
      +   '<button type="button" class="calendar-today-btn" data-today>回到今天</button>'
      + '</div>';
  },

  renderMonthMode: function () {
    const y = this.viewYear;
    const months = ['1月', '2月', '3月', '4月', '5月', '6月',
                    '7月', '8月', '9月', '10月', '11月', '12月'];

    const monthButtons = months.map(function (name, i) {
      const monthStr = y + '-' + String(i + 1).padStart(2, '0');
      const sel = monthStr === Calendar.selectedMonth ? ' is-selected' : '';
      return '<button type="button" class="calendar-month' + sel + '"'
           + ' data-month="' + i + '">' + name + '</button>';
    }).join('');

    return ''
      + '<div class="calendar-panel__header">'
      +   '<button type="button" class="calendar-nav" data-nav="prev-year">‹</button>'
      +   '<div class="calendar-panel__title">' + y + ' 年</div>'
      +   '<button type="button" class="calendar-nav" data-nav="next-year">›</button>'
      + '</div>'
      + '<div class="calendar-months">' + monthButtons + '</div>';
  },

  renderYearMode: function () {
    const curYear = new Date().getFullYear();
    const center = this.viewYear || curYear;

    const years = [];
    for (let i = center - 5; i <= center + 6; i++) {
      years.push(i);
    }

    const buttons = years.map(function (y) {
      const sel = String(y) === Calendar.selectedYear ? ' is-selected' : '';
      const cur = y === curYear ? ' is-today' : '';
      return '<button type="button" class="calendar-year' + sel + cur + '"'
           + ' data-year="' + y + '">' + y + '</button>';
    }).join('');

    return ''
      + '<div class="calendar-panel__header">'
      +   '<button type="button" class="calendar-nav" data-nav="prev-decade">‹</button>'
      +   '<div class="calendar-panel__title">' + center + ' 年前后</div>'
      +   '<button type="button" class="calendar-nav" data-nav="next-decade">›</button>'
      + '</div>'
      + '<div class="calendar-years">' + buttons + '</div>';
  },

  handleClick: function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;

    const nav = btn.dataset.nav;

    if (nav === 'prev') {
      this.viewMonth--;
      if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
      this.render();
      this.reposition();
      return;
    }
    if (nav === 'next') {
      this.viewMonth++;
      if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
      this.render();
      this.reposition();
      return;
    }

    if (nav === 'prev-year') {
      this.viewYear--;
      this.render();
      this.reposition();
      return;
    }
    if (nav === 'next-year') {
      this.viewYear++;
      this.render();
      this.reposition();
      return;
    }

    if (nav === 'prev-decade') {
      this.viewYear = (this.viewYear || new Date().getFullYear()) - 10;
      this.render();
      this.reposition();
      return;
    }
    if (nav === 'next-decade') {
      this.viewYear = (this.viewYear || new Date().getFullYear()) + 10;
      this.render();
      this.reposition();
      return;
    }

    if (btn.dataset.date) {
      this.selectedDate = btn.dataset.date;
      if (this.onChange) this.onChange(this.selectedDate);
      this.close();
      return;
    }

    if (btn.dataset.month !== undefined) {
      const m = Number(btn.dataset.month);
      this.selectedMonth = this.viewYear + '-'
        + String(m + 1).padStart(2, '0');
      if (this.onChange) this.onChange(this.selectedMonth);
      this.close();
      return;
    }

    if (btn.dataset.year) {
      this.selectedYear = btn.dataset.year;
      if (this.onChange) this.onChange(this.selectedYear);
      this.close();
      return;
    }

    if (btn.hasAttribute('data-today')) {
      const t = new Date();
      this.viewYear = t.getFullYear();
      this.viewMonth = t.getMonth();
      this.selectedDate = this.todayStr();
      if (this.onChange) this.onChange(this.selectedDate);
      this.render();
      this.reposition();
      return;
    }
  },

  todayStr: function () {
    const d = new Date();
    return d.getFullYear() + '-'
         + String(d.getMonth() + 1).padStart(2, '0') + '-'
         + String(d.getDate()).padStart(2, '0');
  },
};

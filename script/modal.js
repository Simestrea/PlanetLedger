/**
 * 前端弹窗组件
 * 提供三个方法（都返回 Promise）：
 *   Modal.alert(opts)    → Promise<true>
 *   Modal.confirm(opts)  → Promise<boolean>   true=确定，false=取消
 *   Modal.prompt(opts)   → Promise<string|null>  字符串=确定，null=取消
 *
 * opts 通用字段：
 *   type     'info' | 'warn' | 'danger' | 'success'
 *   title    标题
 *   message  纯文本内容（会转义）
 *   html     富文本内容（不转义，调用方自己保证安全）
 *   input    { placeholder, value, type, maxLength }
 *   actions  [{ text, value, primary, danger }]
 */

const Modal = {
  root: null,
  currentResolve: null,
  onCancel: null,

  init: function () {
    if (this.root) return;

    // 全局点击记录（捕获阶段），用于捕获弹窗弹出的初始位置
    if (!window._lastPointerTargetInit) {
      window._lastPointerTargetInit = true;
      document.addEventListener('pointerdown', function(e) {
        if (e.target.closest('.modal-overlay, .calendar-panel, .cat-modal-overlay, .sub-modal-overlay, .checkin-popup, input, textarea, select')) {
          return;
        }
        window._lastPointerTarget = e.target.closest('button, .btn, .cat, .record__del, .quick-chip, .cat-manage__limit, .theme-item, .glass-mode__btn') || e.target;
      }, { capture: true, passive: true });
    }

    const root = document.createElement('div');
    root.className = 'modal-overlay';
    root.innerHTML = ''
      + '<div class="modal" role="dialog" aria-modal="true">'
      +   '<div class="modal__icon"></div>'
      +   '<h3 class="modal__title"></h3>'
      +   '<div class="modal__message"></div>'
      +   '<input class="modal__input" type="text">'
      +   '<div class="modal__actions"></div>'
      + '</div>';
    document.body.appendChild(root);

    const self = this;

    /* 点遮罩（不是点内容区）视为取消 */
    root.addEventListener('click', function (e) {
      if (e.target === root) self._cancel();
    });

    /* ESC 视为取消 */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') self._cancel();
    });

    this.root = root;
  },

  _cancel: function () {
    if (!this.root || !this.root.classList.contains('is-show')) return;
    if (this.onCancel) this.onCancel();
  },

  _close: function (value) {
    if (!this.root.classList.contains('is-show')) return;
    const self = this;
    const modalEl = this.root.querySelector('.modal');
    const trigger = this._triggerEl;

    if (trigger && modalEl && !this.root.classList.contains('no-anim')) {
      const tr = trigger.getBoundingClientRect();
      const mr = modalEl.getBoundingClientRect();

      if (mr.width > 10 && tr.width > 10 && tr.top > -200) { // 避免页面滚动过深时错乱
        const tx = tr.left + tr.width / 2 - (mr.left + mr.width / 2);
        const ty = tr.top + tr.height / 2 - (mr.top + mr.height / 2);
        const scale = Math.max(0.15, Math.min(tr.height / mr.height, tr.width / mr.width));

        modalEl.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s var(--ease)';
        modalEl.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        modalEl.style.opacity = '0';
        
        this.root.classList.add('is-closing');
        this.root.classList.remove('is-show');

        setTimeout(function () {
          modalEl.style.transition = '';
          modalEl.style.transform = '';
          modalEl.style.opacity = '';
          self.root.classList.remove('is-closing');
        }, 300);
      } else {
        this.root.classList.remove('is-show');
        modalEl.style.transform = '';
        modalEl.style.opacity = '';
      }
    } else {
      this.root.classList.remove('is-show');
      if (modalEl) {
         modalEl.style.transform = '';
         modalEl.style.opacity = '';
      }
    }

    document.body.style.overflow = '';

    const resolve = this.currentResolve;
    this.currentResolve = null;
    this.onCancel = null;

    if (resolve) resolve(value);
  },

  open: function (opts) {
    this.init();
    const self = this;
    // 记录触发弹窗的元素，用于缩放动画
    this._triggerEl = window._lastPointerTarget;

    return new Promise(function (resolve) {
      self.currentResolve = resolve;

      const iconEl    = self.root.querySelector('.modal__icon');
      const titleEl   = self.root.querySelector('.modal__title');
      const msgEl     = self.root.querySelector('.modal__message');
      const inputEl   = self.root.querySelector('.modal__input');
      const actionsEl = self.root.querySelector('.modal__actions');

      /* 图标 */
      const type = opts.type || 'info';
      if (type === 'none') {
        iconEl.style.display = 'none';
      } else {
        iconEl.style.display = 'flex';
        iconEl.className = 'modal__icon modal__icon--' + type;
        
        const iconSvgs = {
          info: '<svg class="modal-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
          warn: '<svg class="modal-icon-svg" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
          danger: '<svg class="modal-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
          success: '<svg class="modal-icon-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        };
        iconEl.innerHTML = iconSvgs[type] || iconSvgs.info;
      }

      /* 标题 */
      titleEl.innerHTML = opts.title || '';
      titleEl.hidden = !opts.title;

      /* 内容 */
      if (opts.html) {
        msgEl.innerHTML = opts.html;
        msgEl.hidden = false;
      } else if (opts.message) {
        msgEl.textContent = opts.message;
        msgEl.hidden = false;
      } else {
        msgEl.innerHTML = '';
        msgEl.hidden = true;
      }

      /* 输入框 */
      if (opts.input) {
        inputEl.hidden = false;
        inputEl.type = opts.input.type || 'text';
        inputEl.placeholder = opts.input.placeholder || '';
        inputEl.value = opts.input.value || '';
        if (opts.input.maxLength) inputEl.maxLength = opts.input.maxLength;
        setTimeout(function () {
          inputEl.focus();
          inputEl.select();
        }, 80);
      } else {
        inputEl.hidden = true;
        inputEl.value = '';
      }

      /* 按钮 */
      actionsEl.innerHTML = '';
      const actions = opts.actions || [
        { text: '知道了', value: true, primary: true },
      ];

      actions.forEach(function (a) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'modal__btn'
                      + (a.primary ? ' modal__btn--primary' : '')
                      + (a.danger  ? ' modal__btn--danger'  : '');
        btn.textContent = a.text;

        btn.addEventListener('click', function () {
          let value = a.value;
          if (value === '__input__') value = inputEl.value;
          self._close(value);
        });

        actionsEl.appendChild(btn);
      });

      /* 输入框回车 = 点主按钮 */
      inputEl.onkeydown = function (e) {
        if (e.key === 'Enter') {
          const primary = actionsEl.querySelector('.modal__btn--primary');
          if (primary) primary.click();
        }
      };

      /* 取消回调（点遮罩或按 ESC） */
      self.onCancel = function () {
        self._close(opts.input ? null : false);
      };

      /* 显示 */
      self.root.classList.add('is-show');
      document.body.style.overflow = 'hidden';

      // --- 新增：从点击元素放大弹出的动画 ---
      const modalEl = self.root.querySelector('.modal');
      const trigger = self._triggerEl;

      if (trigger && modalEl) {
        const tr = trigger.getBoundingClientRect();
        
        // 先清除内联样式，获取当前正常大小
        modalEl.style.transition = 'none';
        modalEl.style.transform = 'none';
        modalEl.style.opacity = '1';

        const mr = modalEl.getBoundingClientRect();
        
        if (mr.width > 10 && tr.width > 10) {
          const tx = tr.left + tr.width / 2 - (mr.left + mr.width / 2);
          const ty = tr.top + tr.height / 2 - (mr.top + mr.height / 2);
          const scale = Math.max(0.15, Math.min(tr.height / mr.height, tr.width / mr.width));

          modalEl.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
          modalEl.style.opacity = '0';

          void modalEl.offsetWidth;

          // 弹性动画（稍微带回弹，更接近苹果原生效果）
          modalEl.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.2s ease-out';
          modalEl.style.transform = '';
          modalEl.style.opacity = '';

          setTimeout(function () {
            modalEl.style.transition = '';
            modalEl.style.transform = '';
            modalEl.style.opacity = '';
          }, 350);
        } else {
          modalEl.style.transition = '';
          modalEl.style.transform = '';
          modalEl.style.opacity = '';
        }
      }
    });
  },

  /* ---------------- 三个便捷方法 ---------------- */

  alert: function (opts) {
    if (typeof opts === 'string') opts = { message: opts };
    return this.open({
      type: opts.type || 'info',
      title: opts.title,
      message: opts.message,
      html: opts.html,
      actions: [{
        text: opts.buttonText || '知道了',
        value: true,
        primary: true,
      }],
    });
  },

  confirm: function (opts) {
    if (typeof opts === 'string') opts = { message: opts };
    return this.open({
      type: opts.type || 'warn',
      title: opts.title || '请确认',
      message: opts.message,
      html: opts.html,
      actions: [
        { text: opts.cancelText || '取消', value: false },
        { text: opts.okText || '确定', value: true, primary: true, danger: opts.danger },
      ],
    });
  },

  prompt: function (opts) {
    if (typeof opts === 'string') opts = { title: opts };
    return this.open({
      type: opts.type || 'info',
      title: opts.title || '请输入',
      message: opts.message,
      input: opts.input || {},
      actions: [
        { text: '取消', value: null },
        { text: '确定', value: '__input__', primary: true },
      ],
    });
  },
};

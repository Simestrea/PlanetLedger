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
    this.root.classList.remove('is-show');
    document.body.style.overflow = '';

    const resolve = this.currentResolve;
    this.currentResolve = null;
    this.onCancel = null;

    if (resolve) resolve(value);
  },

  open: function (opts) {
    this.init();
    const self = this;

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
        iconEl.textContent = {
          info:    'i',
          warn:    '!',
          danger:  '!',
          success: '✓',
        }[type] || 'i';
      }

      /* 标题 */
      titleEl.textContent = opts.title || '';
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

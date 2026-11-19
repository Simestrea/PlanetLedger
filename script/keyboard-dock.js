/**
 * 键盘与底部 dock 联动。
 *
 * 只有会弹出软键盘的文本控件才进入 keyboard-open 状态。
 * 复选框、单选、文件、颜色等控件虽然也是 <input>，但不会弹出键盘。
 */
(function() {
    const TEXT_INPUT_TYPES = new Set([
        '',
        'text',
        'search',
        'email',
        'password',
        'tel',
        'url',
        'number',
        'date',
        'datetime-local',
        'month',
        'time',
        'week'
    ]);
    const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';

    const opensKeyboard = function (el) {
        if (!el || el.disabled || el.readOnly) return false;
        if (el.matches('textarea')) return true;
        if (el.matches('[contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]')) return true;
        if (el.matches('select')) return false;
        if (!el.matches('input')) return false;
        return TEXT_INPUT_TYPES.has((el.getAttribute('type') || 'text').toLowerCase());
    };

    const isEditable = function (el) {
        return !!(el && el.matches && el.matches(EDITABLE_SELECTOR));
    };

    const syncDock = function () {
        document.body.classList.toggle('keyboard-open', opensKeyboard(document.activeElement));
    };

    // 页面刷新、切页、弹窗关闭或浏览器自动恢复焦点时，主动校准一次状态。
    void document.body.offsetWidth;
    syncDock();
    window.addEventListener('pageshow', syncDock);
    window.addEventListener('focus', syncDock);
    window.addEventListener('blur', function () {
        setTimeout(syncDock, 0);
    });
    document.addEventListener('visibilitychange', syncDock);

    document.addEventListener('focusin', syncDock);
    document.addEventListener('focusout', function () {
        // 等浏览器完成焦点交接后再判断，避免点输入框之间切换时 dock 闪烁。
        setTimeout(syncDock, 0);
    });

    // 点击非编辑区域时主动收起软键盘和 dock，但不阻止复选框、按钮等控件自身的默认行为。
    document.addEventListener('pointerdown', function (e) {
        const active = document.activeElement;
        if (!opensKeyboard(active)) return;
        if (e.target instanceof Element && e.target.closest('.modal-overlay, .calendar-panel, .cat-modal-overlay, .sub-modal-overlay, .checkin-popup')) return;
        if (isEditable(e.target)) return;
        active.blur();
    }, { capture: true, passive: true });

    // 某些 WebView 只派发 touch 事件，鼠标和触摸两套路径都覆盖。
    document.addEventListener('touchstart', function (e) {
        const active = document.activeElement;
        if (!opensKeyboard(active)) return;
        if (e.target instanceof Element && e.target.closest('.modal-overlay, .calendar-panel, .cat-modal-overlay, .sub-modal-overlay, .checkin-popup')) return;
        if (isEditable(e.target)) return;
        active.blur();
    }, { capture: true, passive: true });
})();

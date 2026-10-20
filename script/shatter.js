/**
 * 碎片飘散 V4：纯 CSS animation
 *
 * V3 用 element.animate() 还是卡 —— Web Animations API 在
 * Android WebView 上会走 JS 主线程，80 个动画就卡。
 *
 * V4 改用 CSS @keyframes + animation-delay，
 * 全部动画走合成线程，主线程零负担。
 */
var Shatter = (function () {

  var DEFAULTS = {
    windX: 240,
    windY: -150,
    duration: 620,           /* 原 1100ms，加快飘散 */
    maxDelay: 80,            /* 原 160ms，压缩碎片错峰 */
    maxPieces: 60,
    targetPieceSize: 14,
    vacateRatio: 0.6,        /* 动画进行到 60% 时释放原元素占位，让内容补齐 */
  };

  /* ---- 注入 CSS（只注入一次） ---- */
  var cssInjected = false;
  function injectCSS() {
    if (cssInjected) return;
    cssInjected = true;
    var style = document.createElement('style');
    style.textContent = [
      '@keyframes shatter-fly {',
      '  0%   { transform: translate3d(0,0,0) rotate(0) scale(1); opacity: 1; }',
      '  40%  { transform: translate3d(calc(var(--dx) * .4px), calc(var(--dy) * .4px + var(--wave) * .6px), 0) rotate(calc(var(--rot) * .4deg)) scale(.75); opacity: .85; }',
      '  70%  { transform: translate3d(calc(var(--dx) * .7px), calc(var(--dy) * .7px - var(--wave) * .5px), 0) rotate(calc(var(--rot) * .7deg)) scale(.55); opacity: .45; }',
      '  100% { transform: translate3d(calc(var(--dx) * 1px), calc(var(--dy) * 1px), 0) rotate(calc(var(--rot) * 1deg)) scale(var(--sc)); opacity: 0; }',
      '}',
      '.shatter-piece {',
      '  position: absolute;',
      '  background-repeat: no-repeat;',
      '  pointer-events: none;',
      '  will-change: transform, opacity;',
      '  backface-visibility: hidden;',
      '  -webkit-backface-visibility: hidden;',
      '  animation: shatter-fly var(--dur) cubic-bezier(.3, .5, .3, 1) var(--delay) forwards;',
      '  contain: layout style paint;',
      '}',
      '.shatter-container {',
      '  pointer-events: none;',
      '  position: fixed;',
      '  z-index: 9999;',
      '  overflow: visible;',
      '  /* contain 已移除：strict 会裁剪飞出容器的碎片 */',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ---- 把元素画到 canvas ---- */
  function rasterize(el, rect) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.ceil(rect.width);
    var h = Math.ceil(rect.height);
    var canvas = document.createElement('canvas');
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    var cs = getComputedStyle(el);
    var radius = parseFloat(cs.borderTopLeftRadius) || 0;
    var bg = cs.backgroundColor;

    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(0, 0, w, h, radius);
    else ctx.rect(0, 0, w, h);
    ctx.clip();

    if (bg && bg !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#FDFCFB';
      ctx.fillRect(0, 0, w, h);
    }

    /* 左侧圆点 */
    var dotEl = el.querySelector('.record__dot, .cat-manage__dot');
    if (dotEl) {
      ctx.beginPath();
      ctx.arc(20, h / 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = getComputedStyle(dotEl).backgroundColor || '#999';
      ctx.fill();
    }

    /* 名称 */
    var nameEl = el.querySelector('.record__name, .cat__name, .cat-manage__name');
    if (nameEl) {
      ctx.fillStyle = '#2E2A36';
      ctx.font = '500 14px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textBaseline = 'middle';
      var txt = nameEl.textContent.trim();
      if (txt.length > 16) txt = txt.slice(0, 16) + '…';
      ctx.fillText(txt, 40, h / 2 - 6);
    }

    /* 金额 */
    var amtEl = el.querySelector('.record__amount');
    if (amtEl) {
      ctx.fillStyle = '#A85E52';
      ctx.font = '600 15px -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(amtEl.textContent.trim(), w - 30, h / 2);
      ctx.textAlign = 'left';
    }

    ctx.restore();

    try { return canvas.toDataURL('image/png'); }
    catch (e) { return null; }
  }

  function play(elements, options, onDone) {
    var list = [];
    if (!elements) { if (onDone) onDone(); return; }
    if (elements.nodeType === 1) list = [elements];
    else if (elements.length !== undefined) list = Array.prototype.slice.call(elements);
    if (list.length === 0) { if (onDone) onDone(); return; }

    injectCSS();

    var opts = {};
    for (var k in DEFAULTS) opts[k] = DEFAULTS[k];
    if (options) for (var k2 in options) opts[k2] = options[k2];

    /* 计算占位释放时机：动画约 60% 时让原元素脱离文档流 */
    if (typeof opts.vacateDelay !== 'number') {
      opts.vacateDelay = Math.round(opts.duration * (opts.vacateRatio || 0.6));
    }

    var total = list.length;
    var done = 0;
    var finished = false;

    function finishOnce() {
      if (finished) return;
      finished = true;
      if (onDone) onDone();
    }

    function checkOne() {
      done++;
      if (done >= total) finishOnce();
    }

    setTimeout(finishOnce, opts.duration + opts.maxDelay + 350);

    list.forEach(function (el) {
      shatterOne(el, opts, checkOne);
    });
  }

  function shatterOne(el, opts, onDone) {
    if (!el || !el.parentNode) { onDone(); return; }

    var rect = el.getBoundingClientRect();
    if (rect.width < 6 || rect.height < 6) { onDone(); return; }

    var dataUrl = rasterize(el, rect);
    if (!dataUrl) { onDone(); return; }

    el.style.visibility = 'hidden';

    /* 到点后让元素脱离文档流，后面内容立刻补齐；碎片在 fixed 容器里继续飞，不受影响 */
    var vacateTimer = setTimeout(function () {
      el.style.display = 'none';
    }, opts.vacateDelay);

    var cols = Math.max(3, Math.ceil(rect.width / opts.targetPieceSize));
    var rows = Math.max(2, Math.ceil(rect.height / opts.targetPieceSize));
    if (cols * rows > opts.maxPieces) {
      var s = Math.sqrt(opts.maxPieces / (cols * rows));
      cols = Math.max(3, Math.floor(cols * s));
      rows = Math.max(2, Math.floor(rows * s));
    }

    var pw = rect.width / cols;
    var ph = rect.height / rows;

    var container = document.createElement('div');
    container.className = 'shatter-container';
    container.style.cssText =
      'left:' + rect.left + 'px;' +
      'top:' + rect.top + 'px;' +
      'width:' + rect.width + 'px;' +
      'height:' + rect.height + 'px;';
    document.body.appendChild(container);

    var frag = document.createDocumentFragment();
    var mainAngle = Math.atan2(opts.windY, opts.windX);
    var mainDist = Math.sqrt(opts.windX * opts.windX + opts.windY * opts.windY);

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x1 = c * pw, y1 = r * ph;

        var piece = document.createElement('div');
        piece.className = 'shatter-piece';

        /* 运动参数 */
        var a = mainAngle + (Math.random() - 0.5) * 0.7;
        var d = mainDist * (0.6 + Math.random() * 0.8);
        var dx = Math.cos(a) * d;
        var dy = Math.sin(a) * d;
        var wave = 40 * (0.4 + Math.random() * 1.1);
        var rot = (Math.random() - 0.5) * 720;
        var sc = 0.1 + Math.random() * 0.35;
        var sweep = (c / cols) * 140;
        var delay = sweep + Math.random() * 60;
        var dur = opts.duration * (0.75 + Math.random() * 0.4);

        piece.style.cssText =
          'left:' + x1 + 'px;' +
          'top:' + y1 + 'px;' +
          'width:' + pw + 'px;' +
          'height:' + ph + 'px;' +
          'background-image:url(' + dataUrl + ');' +
          'background-size:' + rect.width + 'px ' + rect.height + 'px;' +
          'background-position:' + (-x1) + 'px ' + (-y1) + 'px;' +
          '--dx:' + dx.toFixed(1) + ';' +
          '--dy:' + dy.toFixed(1) + ';' +
          '--wave:' + wave.toFixed(1) + ';' +
          '--rot:' + rot.toFixed(1) + ';' +
          '--sc:' + sc.toFixed(2) + ';' +
          '--dur:' + dur.toFixed(0) + 'ms;' +
          '--delay:' + delay.toFixed(0) + 'ms;';

        frag.appendChild(piece);
      }
    }

    container.appendChild(frag);

    setTimeout(function () {
      if (vacateTimer) clearTimeout(vacateTimer);
      if (container.parentNode) container.parentNode.removeChild(container);
      el.style.visibility = '';
      el.style.display = '';
      onDone();
    }, opts.duration + opts.maxDelay + 250);
  }

  return { play: play };
})();




/* ==========================================================
   日常向运势生成器（大学生校园版）
   ========================================================== */
function getLuoguFortune() {
  const levelRoll = Math.random();
  let level = '中吉';
  if (levelRoll < 0.15) level = '大凶';
  else if (levelRoll < 0.35) level = '凶';
  else if (levelRoll < 0.60) level = '小吉';
  else if (levelRoll < 0.85) level = '中吉';
  else level = '大吉';

  // 大凶特判：50% 概率“诸事不宜”
  if (level === '大凶' && Math.random() < 0.5) {
    return {
      level: '大凶',
      yi: '诸事不宜',
      yiDesc: '建议回宿舍躺平',
      ji: '出门',
      jiDesc: '外面风大，还可能下雨',
      isSpecial: true
    };
  }

  // 大吉特判：30% 概率“诸事皆宜”
  if (level === '大吉' && Math.random() < 0.3) {
    return {
      level: '大吉',
      yi: '诸事皆宜',
      yiDesc: '欧气爆棚，顺风顺水',
      ji: '无',
      jiDesc: '',
      isSpecial: true
    };
  }

  // 日常向词库
  const pools = {
    '大吉': {
      yi: ['早睡早起', '吃顿好的', '清空购物车', '出门社交'],
      yiDesc: ['一天都精神饱满', '食欲大满足', '剁手也快乐', '遇到神仙朋友'],
      ji: ['熬夜', '宅在宿舍', '拖延症', '盲目脱单'],
      jiDesc: ['容易掉头发', '容易发霉', 'Deadline 会教你做人', '容易遇到海王']
    },
    '中吉': {
      yi: ['喝杯奶茶', '整理桌面', '出门散步', '记账'],
      yiDesc: ['糖分让人快乐', '强迫症狂喜', '吹吹风心情好', '钱包感谢你'],
      ji: ['点外卖', '水群', '做重要决定', '冲动消费'],
      jiDesc: ['容易踩雷难吃', '容易被踢出群', '容易后悔', '月底吃土警告']
    },
    '小吉': {
      yi: ['听歌', '看电影', '洗衣服', '洗头'],
      yiDesc: ['身心愉悦', '沉浸式体验', '衣服香喷喷', '出门更自信'],
      ji: ['熬夜看剧', '抢课', '早起', '修电脑'],
      jiDesc: ['第二天起不来', '教务系统必崩', '床会封印你', '越修越坏']
    },
    '凶': {
      yi: ['摸鱼', '发呆', '待在宿舍', '睡觉'],
      yiDesc: ['带薪摸鱼最爽', '让大脑重启', '安全区最舒服', '梦里啥都有'],
      ji: ['出门', '约会', '抢票', '网购'],
      jiDesc: ['必忘带伞', '容易被放鸽子', '网速突然卡死', '快递容易丢']
    },
    '大凶': {
      yi: ['断网', '装死', '吃泡面', '复盘账单'],
      yiDesc: ['远离互联网烦恼', '没人能找到你', '填饱肚子要紧', '看看钱都花哪了'],
      ji: ['看成绩单', '大扫除', '表白', '去食堂'],
      jiDesc: ['容易怀疑人生', '越扫越乱', '必定被拒绝', '好吃的全卖光了']
    }
  };

  const pool = pools[level];
  const idx = Math.floor(Math.random() * pool.yi.length);

  return {
    level: level,
    yi: pool.yi[idx],
    yiDesc: pool.yiDesc[idx],
    ji: pool.ji[idx],
    jiDesc: pool.jiDesc[idx],
    isSpecial: false
  };
}



const App = {
  currentMonth: '',
  quickTemplates: [],

  renderQuickActions: function () {
    const box = document.getElementById('quickActions');
    if (!box) return;

    let html = this.quickTemplates.map(function (t) {
      return '<div class="quick-chip" data-qid="' + t.id + '">' +
        '<span>' + UI.escapeHtml(t.name) + '</span>' +
        '<span class="quick-chip__amount">￥' + t.amount + '</span>' +
      '</div>';
    }).join('');

    html += '<button class="quick-chip quick-chip--add" id="quickAddBtn" type="button">+ 添加</button>';
    box.innerHTML = html;
  },

  initQuickTemplates: function () {
    this.quickTemplates = Storage.read('slh.quickTemplates.v1', [
      { id: 'q1', name: '早餐', amount: 5, categoryId: 'food', note: '早餐' },
      { id: 'q2', name: '午餐', amount: 15, categoryId: 'food', note: '午餐' },
      { id: 'q3', name: '公交', amount: 2, categoryId: 'transport', note: '公交' }
    ]);
    this.renderQuickActions();
  },


  /* ==========================================================
     主题系统（20 Pantone + 自定义图片）
     ========================================================== */
    themeList: [
    { key: 'greenery', name: '草木绿', primary: '#88B04B', light: '#A8C878', dark: '#6A8F32', bg: '#F4F8EC', card: '#FCFEF8', surface: '#E5F0D2', border: '#D4E5BA' },
    { key: 'periwinkle', name: '长春花蓝', primary: '#6667AB', light: '#8A8BC7', dark: '#4F5090', bg: '#F2F2F7', card: '#FDFDFF', surface: '#E9E9F2', border: '#DDDEF0' },
    { key: 'magenta', name: '洋红万岁', primary: '#BE3455', light: '#D66580', dark: '#9A2844', bg: '#F8EFF2', card: '#FEFCFD', surface: '#EFDDE4', border: '#E8C9D2' },
    { key: 'peach', name: '柔和桃', primary: '#FFBE98', light: '#FFD4B8', dark: '#E09B6F', bg: '#FFF6F0', card: '#FFFEFC', surface: '#FCE9DB', border: '#F5D9C4' },
    { key: 'mocha', name: '摩卡慕斯', primary: '#A47864', light: '#C29884', dark: '#865D4C', bg: '#F8F1EC', card: '#FEFBF9', surface: '#EDDFD5', border: '#E4CEBE' },
    { key: 'classic', name: '经典蓝', primary: '#0F4C81', light: '#3D7AB0', dark: '#093A66', bg: '#EEF3F8', card: '#FBFCFE', surface: '#DEE7F0', border: '#D0DFEC' },
    { key: 'coral', name: '活珊瑚橘', primary: '#FF6F61', light: '#FF9589', dark: '#E05547', bg: '#FFF1EE', card: '#FFFCFB', surface: '#FBDDDA', border: '#F4C7C0' },
    { key: 'ultraviolet', name: '紫外光', primary: '#5F4B8B', light: '#8A79B0', dark: '#463573', bg: '#F3F0F7', card: '#FDFCFE', surface: '#E7E0F0', border: '#D8CEE4' },
    { key: 'quartz', name: '玫瑰石英', primary: '#F7CAC9', light: '#FBDCDB', dark: '#D8A5A4', bg: '#FDF5F5', card: '#FFFEFE', surface: '#F9E7E6', border: '#F2D1D0' },
    { key: 'serenity', name: '宁静蓝', primary: '#92A8D1', light: '#B4C3E0', dark: '#6E85B5', bg: '#F1F4FA', card: '#FDFDFF', surface: '#E1E8F4', border: '#D3DCEB' },
    { key: 'marsala', name: '玛萨拉酒红', primary: '#955251', light: '#B47373', dark: '#763D3C', bg: '#F7F0EF', card: '#FEFCFC', surface: '#EBDBDA', border: '#E0C7C6' },
    { key: 'orchid', name: '兰花紫', primary: '#B565A7', light: '#CA8AC0', dark: '#924D86', bg: '#F8F0F6', card: '#FEFCFE', surface: '#EEDDE8', border: '#E3C5D8' },
    { key: 'emerald', name: '翡翠绿', primary: '#009473', light: '#3FB396', dark: '#006E56', bg: '#ECF6F2', card: '#FBFEFD', surface: '#DAEBE4', border: '#C7E0D4' },
    { key: 'tangerine', name: '探戈橘', primary: '#DD4124', light: '#E86F58', dark: '#BA3218', bg: '#FBEFEB', card: '#FFFCFB', surface: '#F4DCD4', border: '#ECC5B8' },
    { key: 'honeysuckle', name: '忍冬红', primary: '#D94F70', light: '#E67D96', dark: '#B53A56', bg: '#FBEEF1', card: '#FFFCFD', surface: '#F3DCE2', border: '#EAC3CD' },
    { key: 'turquoise', name: '绿松石', primary: '#45B5AA', light: '#72C9C0', dark: '#329085', bg: '#EFF7F6', card: '#FCFEFE', surface: '#DCEDEA', border: '#C8E1DD' },
    { key: 'mimosa', name: '含羞草黄', primary: '#EFC050', light: '#F4D27B', dark: '#CDA035', bg: '#FBF6E9', card: '#FFFEFA', surface: '#F4E9CC', border: '#EADCAF' },
    { key: 'iris', name: '鸢尾蓝', primary: '#5A5B9F', light: '#8586BB', dark: '#404170', bg: '#F1F1F7', card: '#FDFDFF', surface: '#E3E3EE', border: '#D3D4E1' },
    { key: 'chili', name: '辣椒红', primary: '#9B1B30', light: '#B94A5E', dark: '#7B1124', bg: '#F9EEF0', card: '#FEFCFD', surface: '#F0DBE0', border: '#E6C5CC' },
    { key: 'sand', name: '沙色', primary: '#DECDBE', light: '#EADFD4', dark: '#B8A693', bg: '#FAF7F3', card: '#FFFEFC', surface: '#F1E8DC', border: '#E5D7C4' },
    { key: 'red1', name: '脉冲红', primary: '#EB0029', light: '#FF3C5C', dark: '#B3001F', bg: '#FFF5F6', card: '#FFFEFC', surface: '#F7E6E9', border: '#F0D1D9' }
  ],

  initTheme: function () {
    let name = 'greenery';
    try {
      name = localStorage.getItem('slh.theme.v1') || 'greenery';
    } catch (e) {}

    if (name === 'custom') {
      this.applyCustomTheme(false);
    } else {
      this.applyTheme(name, false);
    }
  },

  /* ---------- 智能对比度计算：判断底色是否过浅 ---------- */
  isLightColor: function(hex) {
    if (!hex) return false;
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    // 使用 W3C 感知亮度公式
    const lum = (r * 299 + g * 587 + b * 114) / 1000;
    return lum > 185; // 如果亮度大于 185，视为极浅色
  },

  applyTheme: function (name, showToast) {
    const html = document.documentElement;

    /* 清掉自定义主题注入的内联变量，否则会覆盖主题 */
    this.clearInlineVars();
    html.classList.remove('light-theme-active');

    /* 强制所有主题（包括长春花蓝）都挂载 data-theme 属性 */
    if (name) {
      html.setAttribute('data-theme', name);
    } else {
      html.setAttribute('data-theme', 'greenery');
      name = 'greenery';
    }

    /* 智能对比度：根据【主色】判断顶栏是否需要深色文字 */
    if (name !== 'custom') {
      const theme = this.themeList.find(function(t) { return t.key === name; });
      
      // 如果主色偏亮（例如沙色、柔和桃），顶栏需要改成深色文字
      if (theme && this.isLightColor(theme.primary)) {
        html.classList.add('light-theme-active');
        
        // 提取主色，按比例压暗，生成同色系高级深色
        if (typeof this.hexToRgb === 'function' && typeof this.rgbToHex === 'function') {
          const rgb = this.hexToRgb(theme.primary);
          
          // 主文字：亮度降到 45%（深咖色，清晰且有质感）
          const darkText = this.rgbToHex(rgb[0]*0.45, rgb[1]*0.45, rgb[2]*0.45);
          // 副文字：亮度降到 62%
          const subText  = this.rgbToHex(rgb[0]*0.62, rgb[1]*0.62, rgb[2]*0.62);
          // 浅文字：亮度降到 78%
          const lightText= this.rgbToHex(rgb[0]*0.78, rgb[1]*0.78, rgb[2]*0.78);
          
          html.style.setProperty('--c-text', darkText);
          html.style.setProperty('--c-text-sub', subText);
          html.style.setProperty('--c-text-light', lightText);
        } else {
          html.style.setProperty('--c-text', '#4A4A4A');
          html.style.setProperty('--c-text-sub', '#6A6A6A');
          html.style.setProperty('--c-text-light', '#8A8A8A');
        }
      } else {
        // 如果主色偏暗（如紫外光、经典蓝），保持顶栏白字，清理内联覆盖
        html.classList.remove('light-theme-active');
      }
    } else {
      html.classList.remove('light-theme-active');
    }

    try {
      localStorage.setItem('slh.theme.v1', name);
    } catch (e) {}

    /* 自定义背景去掉 */
    html.removeAttribute('data-custom-bg');
    html.style.removeProperty('--custom-bg-url');

    this.updateThemeSelection(name);

    if (showToast !== false && typeof UI !== 'undefined') {
      UI.showToast('已切换主题');
    }
    this.updateStatusBarColor();
  },

  updateStatusBarColor: function () {
    try {
      const styles = getComputedStyle(document.documentElement);
      let color = styles.getPropertyValue('--c-primary').trim();
      if (!color || color.length < 4) return;
      if (color.startsWith('#') && color.length === 7) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const darkIcons = lum > 165;
        if (window.Android && typeof window.Android.setStatusBarColor === 'function') {
          window.Android.setStatusBarColor(color, darkIcons);
        }
      }
    } catch (e) {}
  },

  /* ==========================================================
     玻璃样式切换
     ========================================================== */
  applyGlassMode: function (mode) {
    const html = document.documentElement;
    if (mode === 'clear') {
      html.setAttribute('data-glass-mode', 'clear');
    } else {
      html.removeAttribute('data-glass-mode');
      mode = 'frosted';
    }
    try {
      localStorage.setItem('slh.glassMode.v1', mode);
    } catch (e) {}

    const grid = document.getElementById('glassMode');
    if (grid) {
      Array.prototype.forEach.call(
        grid.querySelectorAll('.glass-mode__btn'),
        function (btn) {
          btn.classList.toggle('is-active', btn.dataset.mode === mode);
        }
      );
    }
  },

  initGlassMode: function () {
    let mode = 'frosted';
    try {
      mode = localStorage.getItem('slh.glassMode.v1') || 'frosted';
    } catch (e) {}
    this.applyGlassMode(mode);
  },

  clearInlineVars: function () {
    const vars = [
      '--c-primary', '--c-primary-light', '--c-primary-dark', '--c-primary-rgb',
      '--c-bg', '--c-card', '--c-surface', '--c-border',
      '--c-text', '--c-text-sub', '--c-text-light',
      '--c-shadow-sm', '--c-shadow', '--c-shadow-lg',
      '--c-danger', '--c-success', '--c-warning',
      '--custom-bg-url'
    ];
    const style = document.documentElement.style;
    vars.forEach(function (v) { style.removeProperty(v); });
  },

  applyCustomTheme: function (showToast) {
    let data = null;
    try {
      data = JSON.parse(localStorage.getItem('slh.customTheme.v1') || 'null');
    } catch (e) {}

    if (!data || !data.primary) {
      if (typeof UI !== 'undefined' && showToast) {
        UI.showToast('请先上传背景图片');
      }
      return;
    }

    const html = document.documentElement;
    const vars = data;
    const set = function (k, v) {
      if (v) html.style.setProperty(k, v);
    };

    // 将 Hex 转为 RGB 格式，用于半透明背景
    const hexToRgbStr = function (hex) {
      const h = hex.replace('#', '');
      const r = parseInt(h.slice(0, 2), 16) || 110;
      const g = parseInt(h.slice(2, 4), 16) || 92;
      const b = parseInt(h.slice(4, 6), 16) || 150;
      return r + ', ' + g + ', ' + b;
    };

    set('--c-primary', vars.primary);
    set('--c-primary-light', vars.light);
    set('--c-primary-rgb', hexToRgbStr(vars.primary));
    set('--c-primary-dark', vars.dark);
    set('--c-bg', vars.bg);
    set('--c-card', vars.card);
    set('--c-surface', vars.surface);
    set('--c-border', vars.border);
    // 清理浅色主题可能残留的类，防止顶栏被强制黑字
    html.classList.remove('light-theme-active');

    // 对卡片内的文字，同样使用壁纸提取的主色压暗，生成高级深色
    if (typeof this.hexToRgb === 'function' && typeof this.rgbToHex === 'function') {
      const rgb = this.hexToRgb(vars.primary);
      set('--c-text', this.rgbToHex(rgb[0]*0.45, rgb[1]*0.45, rgb[2]*0.45));
      set('--c-text-sub', this.rgbToHex(rgb[0]*0.62, rgb[1]*0.62, rgb[2]*0.62));
      set('--c-text-light', this.rgbToHex(rgb[0]*0.78, rgb[1]*0.78, rgb[2]*0.78));
    } else {
      set('--c-text', '#2E2A36');
      set('--c-text-sub', '#6E6878');
      set('--c-text-light', '#A8A2B0');
    }
    set('--c-shadow-sm', '0 1px 4px rgba(60, 50, 80, .05)');
    set('--c-shadow', '0 2px 12px rgba(60, 50, 80, .07)');
    set('--c-shadow-lg', '0 8px 28px rgba(60, 50, 80, .1)');
    set('--c-danger', '#A85E52');
    set('--c-success', '#5C7A6A');
    set('--c-warning', '#B5822E');

    html.setAttribute('data-theme', 'custom');

    /* 背景图 */
    try {
      const bg = localStorage.getItem('slh.customBg.v1');
      if (bg) {
        html.style.setProperty('--custom-bg-url', 'url(' + bg + ')');
        html.setAttribute('data-custom-bg', 'on');
      }
    } catch (e) {}

    try {
      localStorage.setItem('slh.theme.v1', 'custom');
    } catch (e) {}

    this.updateThemeSelection('custom');

    if (showToast !== false && typeof UI !== 'undefined') {
      UI.showToast('已应用自定义主题');
    }
    this.updateStatusBarColor();
  },

  updateThemeSelection: function (name) {
    const grid = document.getElementById('themeGrid');
    if (!grid) return;
    Array.prototype.forEach.call(
      grid.querySelectorAll('.theme-item'),
      function (btn) {
        btn.classList.toggle('is-active', btn.dataset.theme === name);
      }
    );
  },

  /* ---------- 图片处理 ---------- */

  /* 压缩图片为 base64（最长边 1280px，JPEG 0.78） */
  compressImage: function (file, maxSide, quality) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          const scale = Math.min(1, maxSide / Math.max(w, h));
          w = Math.round(w * scale);
          h = Math.round(h * scale);
          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', quality),
            canvas: canvas,
            width: w,
            height: h,
          });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /* 从 canvas 提取主色（简单但效果好） */
  extractColors: function (canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    /* 缩到 60x60 加速 */
    const small = document.createElement('canvas');
    small.width = 60;
    small.height = 60;
    const sctx = small.getContext('2d');
    sctx.drawImage(canvas, 0, 0, 60, 60);

    const data = sctx.getImageData(0, 0, 60, 60).data;

    /* 按色相桶统计 */
    const buckets = {};
    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 128) continue;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2 / 255;
      const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));

      /* 过滤太暗 / 太亮 / 太灰 */
      if (l < 0.15 || l > 0.92) continue;
      if (s < 0.12) continue;

      let hue = 0;
      const d = max - min;
      if (d === 0) hue = 0;
      else if (max === r) hue = ((g - b) / d) % 6;
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue = Math.round(hue * 60);
      if (hue < 0) hue += 360;

      /* 12 个色相桶 */
      const bucket = Math.floor(hue / 30);
      const key = bucket;

      if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, n: 0, sSum: 0 };
      buckets[key].r += r;
      buckets[key].g += g;
      buckets[key].b += b;
      buckets[key].n++;
      buckets[key].sSum += s;

      rSum += r; gSum += g; bSum += b; count++;
    }

    if (count === 0) {
      /* 全灰图：降级用平均色 */
      const r = Math.round(rSum / Math.max(1, count)) || 128;
      const g = Math.round(gSum / Math.max(1, count)) || 128;
      const b = Math.round(bSum / Math.max(1, count)) || 128;
      return { primary: this.rgbToHex(r, g, b), avg: [r, g, b] };
    }

    /* 挑平均饱和度最高 + 像素最多的桶 */
    let best = null;
    let bestScore = -1;
    Object.keys(buckets).forEach(function (k) {
      const b = buckets[k];
      const score = (b.sSum / b.n) * Math.log(b.n + 1);
      if (score > bestScore) {
        bestScore = score;
        best = b;
      }
    });

    const r = Math.round(best.r / best.n);
    const g = Math.round(best.g / best.n);
    const b = Math.round(best.b / best.n);

    return {
      primary: this.rgbToHex(r, g, b),
      avg: [r, g, b],
    };
  },

  rgbToHex: function (r, g, b) {
    const to = function (n) {
      const s = Math.max(0, Math.min(255, Math.round(n))).toString(16);
      return s.length === 1 ? '0' + s : s;
    };
    return '#' + to(r) + to(g) + to(b);
  },

  hexToRgb: function (hex) {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  },

  mix: function (c1, c2, t) {
    const a = this.hexToRgb(c1);
    const b = this.hexToRgb(c2);
    return this.rgbToHex(
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    );
  },

  /* 根据主色生成一整套主题变量 */
  buildThemeFromColor: function (primary) {
    return {
      primary: primary,
      light:   this.mix(primary, '#FFFFFF', 0.28),
      dark:    this.mix(primary, '#000000', 0.22),
      bg:      this.mix(primary, '#FDFCFB', 0.92),
      card:    this.mix(primary, '#FFFFFF', 0.965),
      surface: this.mix(primary, '#F8F5F2', 0.86),
      border:  this.mix(primary, '#F2EDE6', 0.75),
    };
  },

  handleCustomBg: async function (file) {
    if (!file) return;

    if (typeof UI !== 'undefined') UI.showToast('正在处理图片…');

    try {
      const compressed = await this.compressImage(file, 1280, 0.78);
      const colors = this.extractColors(compressed.canvas);

      const theme = this.buildThemeFromColor(colors.primary);

      /* 存图片和主题 */
      try {
        localStorage.setItem('slh.customBg.v1', compressed.dataUrl);
        localStorage.setItem('slh.customTheme.v1', JSON.stringify(theme));
      } catch (e) {
        if (typeof UI !== 'undefined') {
          UI.showToast('图片太大，存储失败，试试小一点的');
        }
        return;
      }

      /* 更新预览缩略图 */
      const preview = document.getElementById('customPreview');
      if (preview) {
        preview.style.backgroundImage = 'url(' + compressed.dataUrl + ')';
        preview.style.setProperty('--p', theme.primary);
      }

      this.applyCustomTheme();
    } catch (err) {
      console.error(err);
      if (typeof UI !== 'undefined') UI.showToast('图片处理失败');
    }
  },

  clearCustomBg: function () {
    try {
      localStorage.removeItem('slh.customBg.v1');
      localStorage.removeItem('slh.customTheme.v1');
      localStorage.setItem('slh.theme.v1', 'greenery');
    } catch (e) {}

    const html = document.documentElement;
    html.removeAttribute('data-custom-bg');
    html.removeAttribute('data-theme');
    html.style.removeProperty('--custom-bg-url');

    /* 清掉运行时注入的变量 */
    const vars = ['--c-primary', '--c-primary-light', '--c-primary-dark',
                  '--c-bg', '--c-card', '--c-surface', '--c-border',
                  '--c-text', '--c-text-sub', '--c-text-light',
                  '--c-shadow-sm', '--c-shadow', '--c-shadow-lg',
                  '--c-danger', '--c-success', '--c-warning'];
    vars.forEach(function (v) { html.style.removeProperty(v); });

    const preview = document.getElementById('customPreview');
    if (preview) {
      preview.style.backgroundImage = '';
      preview.style.removeProperty('--p');
    }

    this.updateThemeSelection('greenery');
    if (typeof UI !== 'undefined') UI.showToast('已清除自定义背景');

    // ★ 核心修复：重新应用默认主题，恢复状态栏和原生颜色
    this.applyTheme('greenery', false);
  },

  /* 启动时恢复自定义预览 */
  restoreCustomPreview: function () {
    try {
      const bg = localStorage.getItem('slh.customBg.v1');
      const custom = JSON.parse(localStorage.getItem('slh.customTheme.v1') || 'null');
      const preview = document.getElementById('customPreview');
      if (bg && preview) {
        preview.style.backgroundImage = 'url(' + bg + ')';
      }
      if (custom && custom.primary && preview) {
        preview.style.setProperty('--p', custom.primary);
      }
    } catch (e) {}
  },

  

  init: function () {
    Categories.init();
    IncomeCategories.init();
    Ledger.init();
    Calendar.init();
    Modal.init();
    UI.init();

    this.initTheme();
    this.initGlassMode();
    this.currentMonth = Ledger.todayMonth();
    this.setMonthButton(this.currentMonth);
    this.setDateButton(Ledger.today());
    this.setIncomeDateButton(Ledger.today());
    

    UI.renderAll(this.currentMonth);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.add('app-ready');
      });
    });
    this.bindEvents();
    this.updateAmountPreview();
    this.initQuickTemplates();
  },

  setMonthButton: function (month) {
    const parts = month.split('-');
    UI.els.monthPicker.textContent = parts[0] + ' 年 ' + Number(parts[1]) + ' 月';
    UI.els.monthPicker.dataset.value = month;
  },

  setDateButton: function (date) {
    UI.els.dateInput.textContent = date;
    UI.els.dateInput.dataset.value = date;
  },

  updateAmountPreview: function (inputEl, splitEl, previewEl) {
    const amountInput = inputEl || UI.els.amountInput;
    const splitInput = splitEl || UI.els.splitInput;
    const preview = previewEl || UI.els.amountPreview;
    if (!amountInput || !preview) return;

    const raw = Number(amountInput.value);
    const split = UI.getSplitCount(splitInput);

    if (!raw || raw <= 0 || split <= 1) {
      preview.hidden = true;
      preview.textContent = '';
      return;
    }

    const per = Math.round((raw / split) * 100) / 100;
    preview.hidden = false;
    preview.innerHTML = '￥' + raw.toFixed(2) + ' ÷ ' + split
                      + ' 人 = 实记 <strong>￥' + per.toFixed(2) + '</strong>';
  },

  updateIncomeAmountPreview: function () {
    this.updateAmountPreview(
      UI.els.incomeAmountInput,
      UI.els.incomeSplitInput,
      UI.els.incomeAmountPreview
    );
  },

  setIncomeDateButton: function (date) {
    if (!UI.els.incomeDateInput) return;
    UI.els.incomeDateInput.textContent = date;
    UI.els.incomeDateInput.dataset.value = date;
  },

  saveIncomeRecord: function () {
    const amountInput = UI.els.incomeAmountInput;
    const splitInput  = UI.els.incomeSplitInput;
    const dateInput   = UI.els.incomeDateInput;
    const noteInput   = UI.els.incomeNoteInput;
    if (!amountInput) return;

    const rawAmount = Number(amountInput.value);
    if (!rawAmount || rawAmount <= 0) {
      UI.showToast('请先填写金额');
      amountInput.focus();
      return;
    }

    const split = UI.getSplitCount(splitInput);
    const amount = Math.round((rawAmount / split) * 100) / 100;
    if (!amount || amount <= 0) {
      UI.showToast('金额太小了');
      return;
    }

    const date = dateInput.dataset.value || Ledger.today();
    const categoryId = UI.selectedIncomeCategoryId;
    const month = date.slice(0, 7);

    if (!categoryId) {
      UI.showToast('请先选择收入来源');
      return;
    }

    const _valid = IncomeCategories.list.some(function (c) {
      return c.id === categoryId;
    });
    if (!_valid) {
      UI.showToast('收入来源无效，请重新选择');
      return;
    }

    Ledger.add({
      type: 'income',
      amount: amount,
      categoryId: categoryId,
      note: noteInput.value || '',
      date: date,
    });

    amountInput.value = '';
    splitInput.value = '';
    noteInput.value = '';
    this.updateIncomeAmountPreview();
    amountInput.focus();

    if (month !== this.currentMonth) {
      this.currentMonth = month;
      this.setMonthButton(month);
    }

    UI.renderAll(this.currentMonth);

    const tip = split > 1
      ? ('已记收入 ￥' + amount.toFixed(2) + '（' + rawAmount.toFixed(2)
         + ' ÷ ' + split + '人）')
      : '收入记好啦 ✓';
    UI.showToast(tip);
  },

  openBudgetModal: function () {
    const currentBudget = Ledger.getBudget(this.currentMonth);
    
    // 生成分类列表 HTML
    let catHtml = '';
    Categories.list.forEach(function(c) {
      const limit = c.limit || '';
      
      // 去掉了外层的背景卡片，改成纯文本行
      catHtml += 
        '<div class="budget-cat-item">' +
          '<div class="budget-cat-left">' +
            '<span class="budget-cat-dot" style="background:' + c.color + '"></span>' +
            '<span class="budget-cat-name">' + UI.escapeHtml(c.name) + '</span>' +
          '</div>' +
          '<div class="budget-cat-right">' +
            '<span class="budget-cat-symbol">￥</span>' +
            '<input type="number" class="budget-cat-input cat-limit-input" style="min-width:0;" data-cat="' + c.id + '" value="' + limit + '" placeholder="不设限" min="0" step="10">' +
          '</div>' +
        '</div>';
    });

    const html = 
      '<div style="text-align:left; max-height: 55vh; overflow-y: auto; overflow-x: hidden; padding-right: 4px;">' +
        '<div style="margin-bottom: 24px;">' +
          '<label style="font-size:13px;font-weight:600;color:var(--c-text-sub);display:block;margin-bottom:8px;">本月总预算</label>' +
          '<div style="display:flex;align-items:center;background:rgba(255, 255, 255, 0.4);border:1px solid rgba(255,255,255,0.6);border-radius:var(--radius-sm);padding:0 12px;">' +
            '<span style="color:var(--c-text-sub);font-size:16px;font-weight:600;">￥</span>' +
            '<input type="number" id="modalBudgetInput" style="flex:1;padding:14px 0 14px 8px;font-size:20px;font-weight:700;background:transparent;border:none;outline:none;color:var(--c-text);" value="' + (currentBudget > 0 ? currentBudget : '') + '" placeholder="输入总预算">' +
          '</div>' +
        '</div>' +
        
        '<label style="font-size:13px;font-weight:600;color:var(--c-text-sub);display:block;margin-bottom:8px;">分类单独限额（可选）</label>' +
        '<div class="budget-cat-list">' + catHtml + '</div>' +
      '</div>';

    Modal.open({
      type: 'none',
      title: '🎯 预算设置',
      html: html,
      actions: [
        { text: '取消', value: null },
        { text: '保存', value: 'save', primary: true }
      ]
    }).then(function(res) {
      if (res === 'save') {
        // 1. 保存总预算
        const totalInput = document.getElementById('modalBudgetInput').value;
        const total = Number(totalInput);
        if (total > 0) {
          Ledger.setBudget(App.currentMonth, total);
        } else {
          Ledger.setBudget(App.currentMonth, 0);
        }

        // 2. 保存分类预算
        document.querySelectorAll('.cat-limit-input').forEach(function(input) {
          const catId = input.dataset.cat;
          const val = Number(input.value);
          Categories.setLimit(catId, val > 0 ? val : 0);
        });

        // 3. 重新渲染
        UI.renderAll(App.currentMonth);
        UI.showToast('预算设置已保存');
      }
    });
  },

  /* ==========================================================
     数据备份与恢复
     ========================================================== */
  exportData: function () {
    const data = {};
    // 严格白名单：只导出纯数据，不包含任何主题、背景等外观配置
    const allowedKeys = [
      'slh.records.v1',
      'slh.budgets.v1',
      'slh.categories.v1',
      'slh.checkin.v1'
    ];
    
    allowedKeys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val !== null) {
        data[key] = val;
      }
    });
    
    if (Object.keys(data).length === 0) {
      UI.showToast('没有可导出的数据');
      return;
    }

    const jsonStr = JSON.stringify(data, null, 2);
    
    const now = new Date();
    const pad = function(n) { return String(n).padStart(2, '0'); };
    const dateStr = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
    const timeStr = pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
    const filename = `有序星球_备份_${dateStr}_${timeStr}.json`;

    // 如果是安卓环境，调用原生下载
    if (window.Android && typeof window.Android.downloadFile === 'function') {
      window.Android.downloadFile(filename, jsonStr);
      UI.showToast('备份文件已保存到下载目录');
      return;
    }

    // 如果是浏览器环境，使用传统 Blob 下载兜底
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    UI.showToast('备份文件已生成');
  },

  importData: async function (file) {
    const reader = new FileReader();
    
    reader.onload = async function (e) {
      try {
        const content = e.target.result;
        const data = JSON.parse(content);
        
        if (typeof data !== 'object' || data === null) throw new Error('格式错误');

        /* ---------- 1. 合并分类 ---------- */
        const importedCatsStr = data['slh.categories.v1'];
        let newCatsCount = 0;
        if (importedCatsStr) {
          const importedCats = JSON.parse(importedCatsStr);
          const existingCatNames = new Set(Categories.list.map(c => c.name));
          
          importedCats.forEach(c => {
            // 如果本地没有同名分类，就加进去
            if (!existingCatNames.has(c.name)) {
              Categories.list.push(c);
              existingCatNames.add(c.name);
              newCatsCount++;
            }
          });
          if (newCatsCount > 0) {
            Categories.reorder();
            Categories.save();
          }
        }

        /* ---------- 2. 合并预算 ---------- */
        const importedBudgetsStr = data['slh.budgets.v1'];
        if (importedBudgetsStr) {
          const importedBudgets = JSON.parse(importedBudgetsStr);
          Object.assign(Ledger.budgets, importedBudgets);
          Storage.write(CONFIG.budgetKey, Ledger.budgets);
        }

        /* ---------- 3. 合并账单（智能去重） ---------- */
        const importedRecordsStr = data['slh.records.v1'];
        let addedCount = 0;
        let duplicateList = [];

        if (importedRecordsStr) {
          const importedRecords = JSON.parse(importedRecordsStr);
          
          // 建立本地现有记录的“签名库”用于查重
          // 签名 = 时间戳 + 金额 + 分类ID + 备注
          const existingSignatures = new Set();
          Ledger.records.forEach(r => {
            existingSignatures.add(`${r.createdAt}|${r.amount}|${r.categoryId}|${r.note}`);
          });

          importedRecords.forEach(r => {
            const sig = `${r.createdAt}|${r.amount}|${r.categoryId}|${r.note}`;
            
            if (existingSignatures.has(sig)) {
              // 发现重复
              duplicateList.push(r);
            } else {
              // 全新记录，加入本地数组
              Ledger.records.push(r);
              existingSignatures.add(sig);
              addedCount++;
            }
          });
          
          if (addedCount > 0) {
            Ledger.saveRecords();
          }
        }

        /* ---------- 4. 生成结果提示 ---------- */
        let msgHtml = `<div style="text-align:center;">`;
        msgHtml += `<p style="margin-bottom:12px;font-size:15px;">成功导入 <strong>${addedCount}</strong> 笔新记录。</p>`;
        if (newCatsCount > 0) {
          msgHtml += `<p style="font-size:13px;color:var(--c-text-sub);">新增了 <strong>${newCatsCount}</strong> 个分类。</p>`;
        }

        if (duplicateList.length > 0) {
          msgHtml += `<p style="font-size:13px;color:var(--c-text-sub);margin-top:8px;">已自动跳过 <strong>${duplicateList.length}</strong> 笔重复记录。</p>`;
          
          // 列出前 5 笔重复记录
          msgHtml += `<div style="margin-top:12px; text-align:left; font-size:12px; max-height:120px; overflow-y:auto; background:rgba(0,0,0,0.03); padding:10px; border-radius:8px; color:var(--c-text-sub);">`;
          msgHtml += `<strong style="color:var(--c-text);">重复项清单：</strong><br>`;
          
          duplicateList.slice(0, 5).forEach(r => {
            const cat = Categories.get(r.categoryId);
            const time = new Date(r.createdAt);
            const pad = function(n){ return String(n).padStart(2,'0'); };
            const timeStr = pad(time.getHours()) + ':' + pad(time.getMinutes()) + ':' + pad(time.getSeconds());
            const noteStr = r.note ? ' · ' + UI.escapeHtml(r.note) : '';
            
            msgHtml += `<div style="padding:4px 0; border-bottom:1px dashed rgba(0,0,0,0.05);">
              • ${UI.escapeHtml(cat.name)} ￥${r.amount.toFixed(2)}${noteStr} (${timeStr})
            </div>`;
          });
          
          if (duplicateList.length > 5) {
            msgHtml += `<div style="text-align:center; margin-top:6px;">...等共 ${duplicateList.length} 笔</div>`;
          }
          msgHtml += `</div>`;
        }
        msgHtml += `</div>`;

        Modal.alert({
          type: 'success',
          title: '导入完成',
          html: msgHtml,
          buttonText: '太棒了'
        }).then(() => {
          // 点击确定后刷新页面，让新数据渲染出来
          window.location.reload();
        });

      } catch (err) {
        console.error(err);
        Modal.alert({
          type: 'danger',
          title: '导入失败',
          message: '文件格式不正确或已损坏，请确保选择了正确的备份文件。'
        });
      }
    };
    
    reader.readAsText(file);
  },

  handleSavings: async function (isDeposit) {
    const amountEl = UI.els.savingsAmount;
    const noteEl = UI.els.savingsNote;
    
    const amount = Number(amountEl.value);
    if (!amount || amount <= 0) {
      UI.showToast('请输入金额');
      amountEl.focus();
      return;
    }

    if (!isDeposit) {
      const currentTotal = Ledger.getSavingsTotal();
      if (amount > currentTotal) {
        Modal.alert({ type: 'warn', title: '余额不足', message: '小金库里没有那么多钱哦～' });
        return;
      }
    }

    const finalAmount = isDeposit ? amount : -amount;
    const note = noteEl.value || '';

    Ledger.addSavings(finalAmount, note);
    
    // 清空表单
    amountEl.value = '';
    noteEl.value = '';
    
    // 更新 UI
    UI.renderSavings();
    UI.showToast(isDeposit ? '存入成功！' : '取出成功！');
  },

  bindEvents: function () {
    const self = this;

    UI.els.tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        UI.els.tabs.forEach(function (t) {
          t.classList.toggle('is-active', t === tab);
        });
        UI.els.pages.forEach(function (page) {
          page.classList.toggle('is-active', page.id === tab.dataset.page);
        });
        
        // 切换顶栏显示
        UI.updateHeader(self.currentMonth);
        
        UI.updateTabbarThumb();
        requestAnimationFrame(function () {
          UI.updateSegThumb();
          UI.updateChartTabsThumb();
        });
      });
    });

    UI.els.monthPicker.addEventListener('click', function () {
      if (Calendar.isOpen) {
        Calendar.close();
        return;
      }
      Calendar.open(
        UI.els.monthPicker, 'month',
        UI.els.monthPicker.dataset.value || self.currentMonth,
        function (month) {
          self.currentMonth = month;
          self.setMonthButton(month);
          const b = Ledger.getBudget(month);
          
          UI.renderAll(month);
        }
      );
    });

    UI.els.dateInput.addEventListener('click', function () {
      if (Calendar.isOpen && Calendar.triggerEl === UI.els.dateInput) {
        Calendar.close();
        return;
      }
      Calendar.open(
        UI.els.dateInput, 'date',
        UI.els.dateInput.dataset.value || Ledger.today(),
        function (date) { self.setDateButton(date); }
      );
    });

    UI.els.catGrid.addEventListener('click', function (e) {
      const delBtn = e.target.closest('[data-cat-del]');
      if (delBtn) {
        e.stopPropagation();
        self.removeCategory(delBtn.dataset.catDel);
        return;
      }
      const addBtn = e.target.closest('[data-cat-add]');
      if (addBtn) { self.promptAddCategory(); return; }
      const cat = e.target.closest('.cat');
      if (cat && cat.dataset.cat) UI.selectCategory(cat.dataset.cat);
    });

    
    /* ===== 快捷记账事件 ===== */
    const quickActions = document.getElementById('quickActions');
    if (quickActions) {
      let pressTimer = null;
      let startX = 0;
      let startY = 0;
      let isScrolling = false;

      // 处理一键记账
      quickActions.addEventListener('click', function (e) {
        const chip = e.target.closest('.quick-chip');
        if (!chip || chip.id === 'quickAddBtn') return;
        
        if (isScrolling) {
          isScrolling = false;
          return;
        }

        const id = chip.dataset.qid;
        const tpl = self.quickTemplates.find(function (t) { return t.id === id; });
        if (!tpl) return;

        Ledger.add({
          amount: Number(tpl.amount),
          categoryId: tpl.categoryId,
          note: tpl.note,
          date: Ledger.today(),
        });
        UI.renderAll(self.currentMonth);
        UI.showToast('已快捷记账 ￥' + tpl.amount);
      });

      // 长按删除逻辑
      quickActions.addEventListener('touchstart', function (e) {
        const chip = e.target.closest('.quick-chip');
        if (!chip || chip.id === 'quickAddBtn') return;
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isScrolling = false;

        pressTimer = setTimeout(function () {
          if (navigator.vibrate) navigator.vibrate(50);
          const id = chip.dataset.qid;
          Modal.confirm({
            type: 'warn',
            title: '删除快捷记账',
            message: '确定要删除这个快捷模板吗？',
            danger: true
          }).then(function (ok) {
            if (ok) {
              self.quickTemplates = self.quickTemplates.filter(function (t) { return t.id !== id; });
              Storage.write('slh.quickTemplates.v1', self.quickTemplates);
              self.renderQuickActions();
            }
          });
          pressTimer = null;
        }, 600);
      }, { passive: true });

      quickActions.addEventListener('touchmove', function (e) {
        if (!pressTimer) return;
        const moveX = Math.abs(e.touches[0].clientX - startX);
        const moveY = Math.abs(e.touches[0].clientY - startY);
        
        if (moveX > 10 || moveY > 10) {
          clearTimeout(pressTimer);
          pressTimer = null;
          isScrolling = true;
        }
      }, { passive: true });

      quickActions.addEventListener('touchend', function () {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      });

      // 添加模板弹窗
      quickActions.addEventListener('click', function (e) {
        if (!e.target.closest('#quickAddBtn')) return;
        
        const html = 
          '<div style="text-align:left; margin-bottom:16px;">' +
            '<label style="font-size:13px;color:var(--c-text-sub);display:block;margin-bottom:6px;">名称</label>' +
            '<input class="modal__input" id="qtName" type="text" placeholder="消费原因" maxlength="6">' +
          '</div>' +
          '<div style="text-align:left; margin-bottom:16px;">' +
            '<label style="font-size:13px;color:var(--c-text-sub);display:block;margin-bottom:6px;">金额</label>' +
            '<input class="modal__input" id="qtAmount" type="number" placeholder="0.00" step="0.01">' +
          '</div>' +
          '<div style="text-align:left; margin-bottom:16px;">' +
            '<label style="font-size:13px;color:var(--c-text-sub);display:block;margin-bottom:6px;">选择分类</label>' +
            '<div class="modal__input" id="qtCatBtn" style="text-align:left; cursor:pointer; display:flex; justify-content:space-between; align-items:center; user-select:none;">' +
              '<span id="qtCatLabel">' + UI.escapeHtml(Categories.list[0].name) + '</span>' +
              '<span style="font-size:10px; color:var(--c-text-light); opacity:0.8;">▼</span>' +
            '</div>' +
            '<input type="hidden" id="qtCat" value="' + Categories.list[0].id + '">' +
          '</div>';

        Modal.open({
          type: 'info',
          title: '添加快捷记账',
          html: html,
          actions: [
            { text: '取消', value: null },
            { text: '保存', value: 'save', primary: true }
          ]
        }).then(function (res) {
          if (res === 'save') {
            const name = document.getElementById('qtName').value.trim();
            const amt = Number(document.getElementById('qtAmount').value);
            const catId = document.getElementById('qtCat').value;

            if (!name) { UI.showToast('请填写名称'); return; }
            if (!amt || amt <= 0) { UI.showToast('请填写正确金额'); return; }

            const newTpl = {
              id: 'q' + Date.now().toString(36),
              name: name,
              amount: amt,
              categoryId: catId,
              note: name
            };
            self.quickTemplates.push(newTpl);
            Storage.write('slh.quickTemplates.v1', self.quickTemplates);
            self.renderQuickActions();
            UI.showToast('快捷按钮已添加');
          }
        });

        // 绑定子弹窗逻辑
        setTimeout(function() {
          const qtCatBtn = document.getElementById('qtCatBtn');
          if (!qtCatBtn) return;

          qtCatBtn.addEventListener('click', function() {
            // 动态创建子弹窗
            let overlay = document.createElement('div');
            overlay.className = 'sub-modal-overlay';
            
            let listHtml = Categories.list.map(function(c) {
              return '<button class="sub-modal-item" data-id="' + c.id + '" type="button">' +
                       '<span class="sub-modal-dot" style="background:' + c.color + '"></span>' +
                       '<span>' + UI.escapeHtml(c.name) + '</span>' +
                     '</button>';
            }).join('');

            overlay.innerHTML = 
              '<div class="sub-modal">' +
                '<div class="sub-modal__header">选择分类</div>' +
                '<div class="sub-modal__list">' + listHtml + '</div>' +
              '</div>';
            
            document.body.appendChild(overlay);
            
            // 触发动画
            void overlay.offsetWidth;
            overlay.classList.add('is-show');

            // 关闭子弹窗函数
            const closeSubModal = function() {
              overlay.classList.remove('is-show');
              setTimeout(function() { 
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay); 
              }, 250);
            };

            overlay.addEventListener('click', function(evt) {
              if (evt.target === overlay) {
                closeSubModal();
                return;
              }
              
              const btn = evt.target.closest('.sub-modal-item');
              if (btn) {
                const id = btn.dataset.id;
                const name = btn.querySelector('span:last-child').textContent;
                
                document.getElementById('qtCat').value = id;
                document.getElementById('qtCatLabel').textContent = name;
                
                closeSubModal();
              }
            });
          });
        }, 100);
      });
    }

    UI.els.amountInput.addEventListener('input', function () {
      self.updateAmountPreview();
    });
    UI.els.splitInput.addEventListener('input', function () {
      self.updateAmountPreview();
    });


    /* 存钱罐按钮 */
    const savingsInBtn = document.getElementById('savingsInBtn');
    const savingsOutBtn = document.getElementById('savingsOutBtn');
    if (savingsInBtn) savingsInBtn.addEventListener('click', function () { self.handleSavings(true); });
    if (savingsOutBtn) savingsOutBtn.addEventListener('click', function () { self.handleSavings(false); });

    /* 存钱罐记录的删除事件 */

    UI.els.submitBtn.addEventListener('click', function () { self.saveRecord(); });
    UI.els.amountInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') self.saveRecord();
    });
    UI.els.splitInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') self.saveRecord();
    });

    function onDeleteRecord(e) {
      const btn = e.target.closest('[data-del]');
      if (!btn) return;
      self.confirmDeleteRecord(btn.dataset.del);
    }
    UI.els.recentList.addEventListener('click', onDeleteRecord);
    UI.els.recordList.addEventListener('click', onDeleteRecord);
    if (UI.els.incomeRecentList) {
      UI.els.incomeRecentList.addEventListener('click', onDeleteRecord);
    }



    UI.els.statModeSeg.addEventListener('click', function (e) {
      const btn = e.target.closest('.seg__btn');
      if (!btn) return;
      UI.setStatMode(btn.dataset.mode);
    });

    UI.els.statPeriodBtn.addEventListener('click', function () {
      if (Calendar.isOpen && Calendar.triggerEl === UI.els.statPeriodBtn) {
        Calendar.close();
        return;
      }
      if (UI.statMode === 'year') {
        Calendar.open(UI.els.statPeriodBtn, 'year', UI.statPeriod,
          function (year) {
            UI.statPeriod = year;
            UI.renderStatAll();
          }
        );
      } else {
        Calendar.open(UI.els.statPeriodBtn, 'month', UI.statPeriod,
          function (month) {
            UI.statPeriod = month;
            UI.renderStatAll();
          }
        );
      }
    });

    UI.els.statCatSelect.addEventListener('change', function () {
      UI.statCategoryId = UI.els.statCatSelect.value;
      UI.renderStatAll();
    });

    UI.els.statCompareToggle.addEventListener('change', function () {
      UI.statCompare = UI.els.statCompareToggle.checked;
      UI.comparePeriod = ''; // 切换开关时，重置自定义周期
      UI.renderStatSummary();
    });

    UI.els.statComparePeriodBtn.addEventListener('click', function () {
      if (Calendar.isOpen && Calendar.triggerEl === UI.els.statComparePeriodBtn) {
        Calendar.close();
        return;
      }
      if (!UI.statCompare) return; // 没开对比，点了也没用

      if (UI.statMode === 'year') {
        Calendar.open(UI.els.statComparePeriodBtn, 'year', UI.comparePeriod || Ledger.prevYear(UI.statPeriod), function (year) {
          UI.comparePeriod = year;
          UI.renderStatSummary();
        });
      } else {
        Calendar.open(UI.els.statComparePeriodBtn, 'month', UI.comparePeriod || Ledger.prevMonth(UI.statPeriod), function (month) {
          UI.comparePeriod = month;
          UI.renderStatSummary();
        });
      }
    });

    UI.els.chartTabs.addEventListener('click', function (e) {
      const btn = e.target.closest('.chart-tab');
      if (!btn || btn.hidden) return;
      UI.setChartType(btn.dataset.chart);
    });

    UI.els.catManageList.addEventListener('click', function (e) {
      const limitBtn = e.target.closest('[data-cat-limit]');
      if (limitBtn) { self.editCategoryLimit(limitBtn.dataset.catLimit); return; }
      const delBtn = e.target.closest('[data-cat-del]');
      if (!delBtn || delBtn.disabled) return;
      self.removeCategory(delBtn.dataset.catDel);
    });

    /* 预算管理弹窗 */
    const budgetOverviewBtn = document.getElementById('headerBudgetBlock') || document.getElementById('budgetOverviewBtn');
    if (budgetOverviewBtn) {
      budgetOverviewBtn.addEventListener('click', function () {
        self.openBudgetModal();
      });
    }

    /* 数据备份与恢复 */
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFileInput = document.getElementById('importFileInput');

    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        self.exportData();
      });
    }

    if (importBtn && importFileInput) {
      importBtn.addEventListener('click', function () {
        importFileInput.click();
      });
      importFileInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (file) self.importData(file);
        e.target.value = ''; // 允许重复选择同一文件
      });
    }

    /* 主题卡片点击 */

    const themeGrid = document.getElementById('themeGrid');
    if (themeGrid) {
      themeGrid.addEventListener('click', function (e) {
        const btn = e.target.closest('.theme-item');
        if (!btn) return;
        const name = btn.dataset.theme;
        if (name === 'custom') {
          self.applyCustomTheme();
        } else {
          self.applyTheme(name);
        }
      });
    }

    /* 自定义背景上传 */
    const bgInput = document.getElementById('customBgInput');
    if (bgInput) {
      bgInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (file) self.handleCustomBg(file);
        e.target.value = '';
      });
    }

    const bgClear = document.getElementById('customBgClear');
    if (bgClear) {
      bgClear.addEventListener('click', function () {
        self.clearCustomBg();
      });
    }

    UI.els.addCatBtn.addEventListener('click', function () {
      self.addCategoryFromInput();
    });
    UI.els.newCatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') self.addCategoryFromInput();
    });

    /* ===== 收入记账 ===== */
    if (UI.els.incomeCatGrid) {
      UI.els.incomeCatGrid.addEventListener('click', function (e) {
        const delBtn = e.target.closest('[data-cat-del]');
        if (delBtn) {
          e.stopPropagation();
          self.removeIncomeCategory(delBtn.dataset.catDel);
          return;
        }
        const addBtn = e.target.closest('[data-cat-add]');
        if (addBtn) { self.promptAddIncomeCategory(); return; }
        const cat = e.target.closest('.cat');
        if (cat && cat.dataset.cat) UI.selectIncomeCategory(cat.dataset.cat);
      });
    }
    if (UI.els.incomeAmountInput) {
      UI.els.incomeAmountInput.addEventListener('input', function () {
        self.updateIncomeAmountPreview();
      });
    }
    if (UI.els.incomeSplitInput) {
      UI.els.incomeSplitInput.addEventListener('input', function () {
        self.updateIncomeAmountPreview();
      });
      UI.els.incomeSplitInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') self.saveIncomeRecord();
      });
    }
    if (UI.els.incomeAmountInput) {
      UI.els.incomeAmountInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') self.saveIncomeRecord();
      });
    }
    if (UI.els.incomeDateInput) {
      UI.els.incomeDateInput.addEventListener('click', function () {
        if (Calendar.isOpen) {
          Calendar.close();
          return;
        }
        Calendar.open(
          UI.els.incomeDateInput, 'date',
          UI.els.incomeDateInput.dataset.value || Ledger.today(),
          function (date) { self.setIncomeDateButton(date); }
        );
      });
    }
    if (UI.els.incomeSubmitBtn) {
      UI.els.incomeSubmitBtn.addEventListener('click', function () {
        self.saveIncomeRecord();
      });
    }

    /* ===== 统计类型切换（支出 / 收入） ===== */
    if (UI.els.statTypeSeg) {
      UI.els.statTypeSeg.addEventListener('click', function (e) {
        const btn = e.target.closest('.seg__btn');
        if (!btn) return;
        UI.setStatType(btn.dataset.type);
      });
    }
  },

  promptAddIncomeCategory: async function () {
    const name = await Modal.prompt({
      type: 'info',
      title: '新收入来源',
      message: '名字最多 6 个字',
      input: { placeholder: '比如：家教', maxLength: 6 },
    });
    if (name === null) return;

    const res = IncomeCategories.add(name);
    if (!res.ok) { Modal.alert({ type: 'warn', message: res.msg }); return; }

    UI.renderIncomeCategories();
    UI.showToast('收入来源已添加');
  },

    removeIncomeCategory: async function (id) {
    const cat = IncomeCategories.get(id);
    const count = Ledger.countByCategory(id);

    if (count > 0) {
      Modal.alert({
        type: 'warn',
        title: '无法删除',
        html: '「' + UI.escapeHtml(cat.name) + '」下还有 <strong>' + count + '</strong> 笔收入记录。<br><br>请先删除这些记录。',
      });
      return;
    }

    const ok = await Modal.confirm({
      type: 'warn',
      title: '删除「' + UI.escapeHtml(cat.name) + '」？',
      message: '删除后无法恢复。',
      okText: '删除',
      danger: true,
    });
    if (!ok) return;

    // 【核心修复】：正确查找收入分类的格子节点
    const nodes = [];
    document.querySelectorAll('.cat[data-cat="' + id + '"]').forEach(function (n) {
      nodes.push(n);
    });

    if (nodes.length > 0 && typeof Shatter !== 'undefined') {
      await new Promise(function (resolve) {
        Shatter.play(nodes, {
          windX: 220,
          windY: -160,
          duration: 1100,
          maxPieces: 80,
          targetPieceSize: 12,
        }, resolve);
      });
    }

    const res = IncomeCategories.remove(id);
    if (!res.ok) { Modal.alert({ type: 'warn', message: res.msg }); return; }

    if (UI.selectedIncomeCategoryId === id) {
      UI.selectedIncomeCategoryId = IncomeCategories.list[0].id;
    }
    UI.renderIncomeCategories();
    UI.renderIncomeRecent();
    UI.showToast('收入来源已删除');
  },

  confirmDeleteSavings: async function (id) {
    const ok = await Modal.confirm({
      type: 'warn',
      title: '删除这条记录？',
      message: '小金库记录删除后无法恢复',
      okText: '删除',
      danger: true,
    });
    if (!ok) return;

    // 收集所有承载此 id 的节点，准备播放碎片特效
    const nodes = document.querySelectorAll('[data-id="' + id + '"]');

    if (nodes.length > 0 && typeof Shatter !== 'undefined') {
      await new Promise(function (resolve) {
        Shatter.play(nodes, {
          windX: 240,
          windY: -150,
          duration: 1200,
          maxPieces: 80,
          targetPieceSize: 12,
        }, resolve);
      });
    }

    Ledger.removeSavings(id);
    UI.renderSavings();
    UI.showToast('已删除');
  },

  confirmDeleteRecord: async function (id) {
    const ok = await Modal.confirm({
      type: 'warn',
      title: '删除这条记录？',
      message: '删除后无法恢复',
      okText: '删除',
      danger: true,
    });
    if (!ok) return;

    /* 收集所有承载此 id 的节点（最近记录 / 明细两处） */
    const nodes = document.querySelectorAll('[data-id="' + id + '"]');

    if (nodes.length > 0 && typeof Shatter !== 'undefined') {
      await new Promise(function (resolve) {
        Shatter.play(nodes, {
          windX: 240,
          windY: -150,
          duration: 1200,
          maxPieces: 80,
          targetPieceSize: 12,
        }, resolve);
      });
    }

    Ledger.remove(id);
    UI.renderAll(this.currentMonth);
    UI.showToast('已删除');
  },

  promptAddCategory: async function () {
    const name = await Modal.prompt({
      type: 'info',
      title: '新分类',
      message: '名字最多 6 个字',
      input: { placeholder: '比如：奶茶', maxLength: 6 },
    });
    if (name === null) return;

    const res = Categories.add(name);
    if (!res.ok) { Modal.alert({ type: 'warn', message: res.msg }); return; }

    UI.renderCategories();
    UI.renderStatFilter();
    UI.renderCatManage(this.currentMonth);
    UI.showToast('分类已添加');
  },

  addCategoryFromInput: function () {
    const res = Categories.add(UI.els.newCatInput.value);
    if (!res.ok) { Modal.alert({ type: 'warn', message: res.msg }); return; }

    UI.els.newCatInput.value = '';
    UI.renderCategories();
    UI.renderStatFilter();
    UI.renderCatManage(this.currentMonth);
    UI.showToast('分类已添加');
  },

  removeCategory: async function (id) {
    const cat = Categories.get(id);
    const count = Ledger.countByCategory(id);

    // 1. 如果该分类下有记录，直接拦截，不再走后面的删除流程
    if (count > 0) {
      Modal.alert({
        type: 'warn',
        title: '无法删除',
        html: '「' + UI.escapeHtml(cat.name) + '」下还有 <strong>' + count + '</strong> 笔记录。<br><br>为了保证数据安全，请先删除或修改这些记录。',
      });
      return;
    }

    // 2. 没记录了，才弹确认框
    const ok = await Modal.confirm({
      type: 'warn',
      title: '删除「' + UI.escapeHtml(cat.name) + '」？',
      message: '删除后无法恢复，且该分类会从列表移除。',
      okText: '删除',
      danger: true,
    });
    if (!ok) return;

    // 3. 收集该分类所有 DOM，准备播放动画
    const nodes = [];
    document.querySelectorAll('.cat[data-cat="' + id + '"]').forEach(function (n) {
      nodes.push(n);
    });
    document.querySelectorAll('[data-cat-del="' + id + '"]').forEach(function (btn) {
      const li = btn.closest('li');
      if (li) nodes.push(li);
    });

    if (nodes.length > 0 && typeof Shatter !== 'undefined') {
      await new Promise(function (resolve) {
        Shatter.play(nodes, {
          windX: 220,
          windY: -160,
          duration: 1100,
          maxPieces: 80,
          targetPieceSize: 12,
        }, resolve);
      });
    }

    // 4. 正式移除
    const res = Categories.remove(id);
    if (!res.ok) { Modal.alert({ type: 'warn', message: res.msg }); return; }

    if (UI.selectedCategoryId === id) {
      UI.selectedCategoryId = Categories.list[0].id;
    }
    if (UI.statCategoryId === id) {
      UI.statCategoryId = '';
    }

    UI.renderCategories();
    UI.renderAll(this.currentMonth);
    UI.showToast('分类已删除');
  },

  editCategoryLimit: async function (id) {
    const cat = Categories.get(id);
    const current = (cat.limit && cat.limit > 0) ? String(cat.limit) : '';

    const value = await Modal.prompt({
      type: 'info',
      title: '「' + cat.name + '」月度额度',
      message: '输入每月上限，留空或填 0 表示取消',
      input: { placeholder: '比如：300', value: current, type: 'number' },
    });
    if (value === null) return;

    const num = Number(value);

    if (value === '' || num === 0) {
      Categories.setLimit(id, 0);
      UI.renderCatManage(this.currentMonth);
      UI.showToast('已取消额度');
      return;
    }
    if (isNaN(num) || num < 0) {
      Modal.alert({ type: 'warn', message: '请输入正确的金额' });
      return;
    }
    Categories.setLimit(id, num);
    UI.renderCatManage(this.currentMonth);
    UI.showToast('额度已设为 ￥' + num);
  },

  saveRecord: function () {
    const amountInput = UI.els.amountInput;
    const splitInput  = UI.els.splitInput;
    const dateInput   = UI.els.dateInput;
    const noteInput   = UI.els.noteInput;

    const rawAmount = Number(amountInput.value);
    if (!rawAmount || rawAmount <= 0) {
      UI.showToast('请先填写金额');
      amountInput.focus();
      return;
    }

    const split = UI.getSplitCount();
    const amount = Math.round((rawAmount / split) * 100) / 100;

    if (!amount || amount <= 0) {
      UI.showToast('金额太小了');
      return;
    }

    const date = dateInput.dataset.value || Ledger.today();
    const categoryId = UI.selectedCategoryId;
    const month = date.slice(0, 7);

    const beforeSpent = Ledger
      .byMonth(month)
      .filter(function (r) { return r.categoryId === categoryId; })
      .reduce(function (s, r) { return s + r.amount; }, 0);

    const note = noteInput.value || '';

    Ledger.add({
      amount: amount,
      categoryId: categoryId,
      note: note,
      date: date,
    });

    amountInput.value = '';
    splitInput.value = '';
    noteInput.value = '';
    this.updateAmountPreview();
    amountInput.focus();

    if (month !== this.currentMonth) {
      this.currentMonth = month;
      this.setMonthButton(month);
      const b2 = Ledger.getBudget(month);
      
    }

    UI.renderAll(this.currentMonth);

    const tip = split > 1
      ? ('已记 ￥' + amount.toFixed(2) + '（' + rawAmount.toFixed(2)
         + ' ÷ ' + split + '人）')
      : '记好啦 ✓';
    UI.showToast(tip);

    try { this.checkLimit(categoryId, beforeSpent, beforeSpent + amount); }
    catch (e) { console.warn(e); }
  },

  checkLimit: function (categoryId, beforeSpent, afterSpent) {
    const cat = Categories.get(categoryId);
    if (!cat.limit || cat.limit <= 0) return;

    const limit = cat.limit;
    const beforeRatio = beforeSpent / limit;
    const afterRatio = afterSpent / limit;

    if (afterRatio >= 1) {
      Modal.alert({
        type: 'danger',
        title: '「' + cat.name + '」已超支',
        html: '本月已花 <strong>￥' + afterSpent.toFixed(2) + '</strong><br>'
            + '额度 ￥' + limit.toFixed(2)
            + '，超出 <strong>￥' + (afterSpent - limit).toFixed(2) + '</strong>',
        buttonText: '知道了',
      });
      return;
    }

    if (afterRatio >= 0.5 && beforeRatio < 0.5) {
      Modal.alert({
        type: 'warn',
        title: '「' + cat.name + '」已用一半',
        html: '本月已花 <strong>￥' + afterSpent.toFixed(2) + '</strong><br>'
            + '额度 ￥' + limit.toFixed(2)
            + '，剩 <strong>￥' + (limit - afterSpent).toFixed(2) + '</strong>',
        buttonText: '知道了',
      });
    }
  },
};

document.addEventListener('DOMContentLoaded', function () {
  // 全局事件委托处理顶部切换
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.header-mode-btn');
    if (!btn) return;
    
    const mode = btn.dataset.mode;
    if (UI.globalMode === mode) return;
    UI.globalMode = mode;
    
    // 更新按钮状态
    const seg = document.getElementById('globalModeSeg');
    if (seg) {
      seg.querySelectorAll('.header-mode-btn').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.mode === mode);
      });
    }
    
    // 切换表单显隐
    const eForm = document.getElementById('expenseFormCard');
    const iForm = document.getElementById('incomeFormCard');
    const eRec = document.getElementById('recentExpenseCard');
    const iRec = document.getElementById('recentIncomeCard');
    
    if (eForm) eForm.hidden = (mode === 'income');
    if (iForm) iForm.hidden = (mode === 'expense');
    if (eRec) eRec.hidden = (mode === 'income');
    if (iRec) iRec.hidden = (mode === 'expense');
    
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(mode === 'income' ? '已切换到收入' : '已切换到支出');
    }
  });

  // 全局事件委托处理顶部切换
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.header-mode-btn');
    if (!btn) return;
    
    const mode = btn.dataset.mode;
    if (UI.globalMode === mode) return;
    UI.globalMode = mode;
    
    // 更新按钮状态
    const seg = document.getElementById('globalModeSeg');
    if (seg) {
      seg.querySelectorAll('.header-mode-btn').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.mode === mode);
      });
    }
    
    // 切换表单显隐
    const eForm = document.getElementById('expenseFormCard');
    const iForm = document.getElementById('incomeFormCard');
    const eRec = document.getElementById('recentExpenseCard');
    const iRec = document.getElementById('recentIncomeCard');
    
    if (eForm) eForm.hidden = (mode === 'income');
    if (iForm) iForm.hidden = (mode === 'expense');
    if (eRec) eRec.hidden = (mode === 'income');
    if (iRec) iRec.hidden = (mode === 'expense');
    
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(mode === 'income' ? '已切换到收入' : '已切换到支出');
    }
  });

  App.init();
});

/* ==========================================================
   玻璃样式切换（独立绑定，不依赖 App.init）
   ========================================================== */
(function () {
  function applyMode(mode) {
    const html = document.documentElement;
    if (mode === 'clear') {
      html.setAttribute('data-glass-mode', 'clear');
    } else {
      html.removeAttribute('data-glass-mode');
      mode = 'frosted';
    }
    try { localStorage.setItem('slh.glassMode.v1', mode); } catch (e) {}

    const grid = document.getElementById('glassMode');
    if (grid) {
      Array.prototype.forEach.call(
        grid.querySelectorAll('.glass-mode__btn'),
        function (btn) {
          btn.classList.toggle('is-active', btn.dataset.mode === mode);
        }
      );
    }
  }

  function init() {
    /* 恢复上次的模式 */
    let mode = 'frosted';
    try {
      mode = localStorage.getItem('slh.glassMode.v1') || 'frosted';
    } catch (e) {}
    applyMode(mode);

    /* 事件委托到 document（最高可靠性） */
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.glass-mode__btn');
      if (!btn) return;
      e.preventDefault();
      applyMode(btn.dataset.mode);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
  // 全局事件委托处理顶部切换
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.header-mode-btn');
    if (!btn) return;
    
    const mode = btn.dataset.mode;
    if (UI.globalMode === mode) return;
    UI.globalMode = mode;
    
    // 更新按钮状态
    const seg = document.getElementById('globalModeSeg');
    if (seg) {
      seg.querySelectorAll('.header-mode-btn').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.mode === mode);
      });
    }
    
    // 切换表单显隐
    const eForm = document.getElementById('expenseFormCard');
    const iForm = document.getElementById('incomeFormCard');
    const eRec = document.getElementById('recentExpenseCard');
    const iRec = document.getElementById('recentIncomeCard');
    
    if (eForm) eForm.hidden = (mode === 'income');
    if (iForm) iForm.hidden = (mode === 'expense');
    if (eRec) eRec.hidden = (mode === 'income');
    if (iRec) iRec.hidden = (mode === 'expense');
    
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(mode === 'income' ? '已切换到收入' : '已切换到支出');
    }
  });

  // 全局事件委托处理顶部切换
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.header-mode-btn');
    if (!btn) return;
    
    const mode = btn.dataset.mode;
    if (UI.globalMode === mode) return;
    UI.globalMode = mode;
    
    // 更新按钮状态
    const seg = document.getElementById('globalModeSeg');
    if (seg) {
      seg.querySelectorAll('.header-mode-btn').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.mode === mode);
      });
    }
    
    // 切换表单显隐
    const eForm = document.getElementById('expenseFormCard');
    const iForm = document.getElementById('incomeFormCard');
    const eRec = document.getElementById('recentExpenseCard');
    const iRec = document.getElementById('recentIncomeCard');
    
    if (eForm) eForm.hidden = (mode === 'income');
    if (iForm) iForm.hidden = (mode === 'expense');
    if (eRec) eRec.hidden = (mode === 'income');
    if (iRec) iRec.hidden = (mode === 'expense');
    
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(mode === 'income' ? '已切换到收入' : '已切换到支出');
    }
  });

      setTimeout(init, 100);
    });
  } else {
    setTimeout(init, 100);
  }
})();

/* ==========================================================
   签到功能（独立绑定，防冲突）
   ========================================================== */
(function () {
  function getTodayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function getYesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function initCheckin() {
    const streakEl = document.getElementById('checkinStreak');
    const btn = document.getElementById('checkinBtn');
    const btnText = document.getElementById('checkinBtnText');

    if (!streakEl || !btn || !btnText) {
      console.warn('[签到] 找不到 DOM 元素，可能 HTML 没插进去');
      return;
    }

    let data = { lastDate: '', streak: 0 };
    try {
      const saved = JSON.parse(localStorage.getItem('slh.checkin.v1'));
      if (saved) data = saved;
    } catch (e) {
      console.error('[签到] 读取数据失败', e);
    }

    const today = getTodayStr();
    const yest = getYesterdayStr();

    let currentStreak = data.streak || 0;

    // 如果断签
    if (data.lastDate && data.lastDate !== today && data.lastDate !== yest) {
      currentStreak = 0;
    }

    streakEl.textContent = currentStreak;

    if (data.lastDate === today) {
      btn.classList.add('is-checked');
      btnText.textContent = '今日已打卡';
    } else {
      btn.classList.remove('is-checked');
      btnText.textContent = '点击打卡';
    }
  }

  function handleCheckin() {
    const btn = document.getElementById('checkinBtn');
    if (!btn || btn.classList.contains('is-checked')) return;

    let data = { lastDate: '', streak: 0 };
    try {
      const saved = JSON.parse(localStorage.getItem('slh.checkin.v1'));
      if (saved) data = saved;
    } catch (e) {}

    const today = getTodayStr();
    const yest = getYesterdayStr();

    if (data.lastDate === yest) {
      data.streak = (data.streak || 0) + 1;
    } else if (data.lastDate === today) {
      return; // 已经签过了
    } else {
      data.streak = 1;
    }
    data.lastDate = today;

    try {
      localStorage.setItem('slh.checkin.v1', JSON.stringify(data));
    } catch (e) {
      console.error('[签到] 存储失败', e);
    }

    // 更新 UI
    document.getElementById('checkinStreak').textContent = data.streak;
    btn.classList.add('is-checked');
    document.getElementById('checkinBtnText').textContent = '今日已打卡';

    // 弹窗
    showPopup(data.streak);
  }

  function showPopup(streak) {
    let popup = document.getElementById('checkinPopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'checkinPopup';
      popup.className = 'checkin-popup';
      document.body.appendChild(popup);
    }

    const fortune = getLuoguFortune();
    const yi = fortune.yi;
    const ji = fortune.ji;
    const yiDesc = fortune.yiDesc;
    const jiDesc = fortune.jiDesc;
    const level = fortune.level;
    const isSpecial = fortune.isSpecial;

    popup.innerHTML = 
      '<div class="checkin-popup__content">' +
        '<div class="checkin-popup__title">今日运势</div>' +
        '<div class=\"checkin-popup__fortune\">§ ' + level + ' §</div>' +
        '<div class=\"checkin-popup__row yi\"><span>宜：</span><strong>' + yi + '</strong>' + (yiDesc ? '<br><span style=\"font-size:12px;font-weight:normal;opacity:.8;margin-left:28px\">' + yiDesc + '</span>' : '') + '</div>' +
        '<div class=\"checkin-popup__row ji\"><span>忌：</span><strong>' + ji + '</strong>' + (jiDesc ? '<br><span style=\"font-size:12px;font-weight:normal;opacity:.8;margin-left:28px\">' + jiDesc + '</span>' : '') + '</div>' +
        '<div class="checkin-popup__footer">你已经在有序星球连续打卡了 ' + streak + ' 天</div>' +
        '<button class="checkin-popup__close" type="button" id="checkinPopupClose">收下好运</button>' +
      '</div>';

    void popup.offsetWidth;
    popup.classList.add('is-show');

    popup.querySelector('#checkinPopupClose').addEventListener('click', function () {
      popup.classList.remove('is-show');
    });
    popup.addEventListener('click', function (e) {
      if (e.target === popup) popup.classList.remove('is-show');
    });
  }

  // 绑定事件（事件委托）
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('#checkinBtn');
    if (btn) {
      handleCheckin();
    }
  });

  // 延迟初始化，确保 DOM 已经渲染
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
  // 全局事件委托处理顶部切换
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.header-mode-btn');
    if (!btn) return;
    
    const mode = btn.dataset.mode;
    if (UI.globalMode === mode) return;
    UI.globalMode = mode;
    
    // 更新按钮状态
    const seg = document.getElementById('globalModeSeg');
    if (seg) {
      seg.querySelectorAll('.header-mode-btn').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.mode === mode);
      });
    }
    
    // 切换表单显隐
    const eForm = document.getElementById('expenseFormCard');
    const iForm = document.getElementById('incomeFormCard');
    const eRec = document.getElementById('recentExpenseCard');
    const iRec = document.getElementById('recentIncomeCard');
    
    if (eForm) eForm.hidden = (mode === 'income');
    if (iForm) iForm.hidden = (mode === 'expense');
    if (eRec) eRec.hidden = (mode === 'income');
    if (iRec) iRec.hidden = (mode === 'expense');
    
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(mode === 'income' ? '已切换到收入' : '已切换到支出');
    }
  });

  // 全局事件委托处理顶部切换
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.header-mode-btn');
    if (!btn) return;
    
    const mode = btn.dataset.mode;
    if (UI.globalMode === mode) return;
    UI.globalMode = mode;
    
    // 更新按钮状态
    const seg = document.getElementById('globalModeSeg');
    if (seg) {
      seg.querySelectorAll('.header-mode-btn').forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.mode === mode);
      });
    }
    
    // 切换表单显隐
    const eForm = document.getElementById('expenseFormCard');
    const iForm = document.getElementById('incomeFormCard');
    const eRec = document.getElementById('recentExpenseCard');
    const iRec = document.getElementById('recentIncomeCard');
    
    if (eForm) eForm.hidden = (mode === 'income');
    if (iForm) iForm.hidden = (mode === 'expense');
    if (eRec) eRec.hidden = (mode === 'income');
    if (iRec) iRec.hidden = (mode === 'expense');
    
    if (typeof UI !== 'undefined' && UI.showToast) {
      UI.showToast(mode === 'income' ? '已切换到收入' : '已切换到支出');
    }
  });

      setTimeout(initCheckin, 200);
    });
  } else {
    setTimeout(initCheckin, 200);
  }
})();

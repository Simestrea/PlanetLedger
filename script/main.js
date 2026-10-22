/* ==========================================================
   日常向运势生成器（大学生校园版）
   ========================================================== */
function getLuoguFortune() {
  const levelRoll = Math.random();
  let level = '中吉';
  if (levelRoll < 0.02) level = '大凶';
  else if (levelRoll < 0.07) level = '凶';
  else if (levelRoll < 0.35) level = '小吉';
  else if (levelRoll < 0.75) level = '中吉';
  else level = '大吉';

  if (level === '大凶' && Math.random() < 0.5) {
    return { level: '大凶', yi: '诸事不宜', yiDesc: '建议回宿舍躺平', ji: '出门', jiDesc: '外面风大，还可能下雨' };
  }
  if (level === '大吉' && Math.random() < 0.3) {
    return { level: '大吉', yi: '诸事皆宜', yiDesc: '欧气爆棚，顺风顺水', ji: '无', jiDesc: '' };
  }

  const pools = {
    '大吉': { yi: ['早睡早起', '吃顿好的', '清空购物车', '出门社交'], yiDesc: ['一天都精神饱满', '食欲大满足', '剁手也快乐', '遇到神仙朋友'], ji: ['熬夜', '宅在宿舍', '拖延症', '盲目脱单'], jiDesc: ['容易掉头发', '容易发霉', 'Deadline 会教你做人', '容易遇到海王'] },
    '中吉': { yi: ['喝杯奶茶', '整理桌面', '出门散步', '记账'], yiDesc: ['糖分让人快乐', '强迫症狂喜', '吹吹风心情好', '钱包感谢你'], ji: ['点外卖', '水群', '做重要决定', '冲动消费'], jiDesc: ['容易踩雷难吃', '容易被踢出群', '容易后悔', '月底吃土警告'] },
    '小吉': { yi: ['听歌', '看电影', '洗衣服', '洗头'], yiDesc: ['身心愉悦', '沉浸式体验', '衣服香喷喷', '出门更自信'], ji: ['熬夜看剧', '抢课', '早起', '修电脑'], jiDesc: ['第二天起不来', '教务系统必崩', '床会封印你', '越修越坏'] },
    '凶': { yi: ['摸鱼', '发呆', '待在宿舍', '睡觉'], yiDesc: ['带薪摸鱼最爽', '让大脑重启', '安全区最舒服', '梦里啥都有'], ji: ['出门', '约会', '抢票', '网购'], jiDesc: ['必忘带伞', '容易被放鸽子', '网速突然卡死', '快递容易丢'] },
    '大凶': { yi: ['断网', '装死', '吃泡面', '复盘账单'], yiDesc: ['远离互联网烦恼', '没人能找到你', '填饱肚子要紧', '看看钱都花哪了'], ji: ['看成绩单', '大扫除', '表白', '去食堂'], jiDesc: ['容易怀疑人生', '越扫越乱', '必定被拒绝', '好吃的全卖光了'] }
  };

  const pool = pools[level];
  const idx = Math.floor(Math.random() * pool.yi.length);
  return { level: level, yi: pool.yi[idx], yiDesc: pool.yiDesc[idx], ji: pool.ji[idx], jiDesc: pool.jiDesc[idx] };
}

const App = {
  currentMonth: '',
  quickTemplates: [],

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

  renderQuickActions: function () {
    const box = document.getElementById('quickActions');
    if (!box) return;
    let html = this.quickTemplates.map(function (t) {
      const defaultAmt = t.amounts && t.amounts.length > 0 ? t.amounts[0] : (t.amount || 0);
      return '<div class="quick-chip" data-qid="' + t.id + '"><span>' + UI.escapeHtml(t.name) + '</span><span class="quick-chip__amount">￥' + defaultAmt + '</span></div>';
    }).join('');
    html += '<button class="quick-chip quick-chip--add" id="quickAddBtn" type="button">+ 添加</button>';
    box.innerHTML = html;
  },

  initQuickTemplates: function () {
    this.quickTemplates = Storage.read('slh.quickTemplates.v1', [
      { id: 'q1', name: '早餐', amounts: [5, 8, 10], categoryId: 'food', note: '早餐' },
      { id: 'q2', name: '午餐', amounts: [15, 20, 25], categoryId: 'food', note: '午餐' },
      { id: 'q3', name: '公交', amounts: [2, 3], categoryId: 'transport', note: '公交' }
    ]);
    this.quickTemplates.forEach(function(t) {
      if (!t.amounts) t.amounts = [t.amount || 0];
      if (t.amount) delete t.amount;
    });
    Storage.write('slh.quickTemplates.v1', this.quickTemplates);
    this.renderQuickActions();
  },

  showQuickPanel: function (tpl) {
    const self = this;
    const amounts = tpl.amounts || [tpl.amount || 0];
    let amountsHtml = amounts.map(function(amt) {
      return '<div style="position:relative; display:inline-block; width:calc(50% - 4px); margin-bottom:8px;">' +
               '<button class="quick-amt-btn btn glass-amt-btn" data-amt="' + amt + '" type="button" style="width:100%; padding:12px 0; font-size:16px; font-weight:bold; border-radius:12px;">￥' + amt + '</button>' +
               '<button class="cat__del quick-amt-del" data-amt="' + amt + '" type="button" style="top:4px; right:4px; z-index:2; width:22px; height:22px; font-size:14px;"><svg class="icon-svg icon-close" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
             '</div>';
    }).join('');

    const html = 
      '<div id="quickAmtList" style="display:flex; flex-wrap:wrap; justify-content:space-between; max-height: 40vh; overflow-y: auto; overflow-x: hidden; padding-right: 4px; margin-bottom:4px;">' + amountsHtml + '</div>' +
      '<div style="display:flex; gap:12px; margin-top:16px;">' +
        '<button class="btn" id="quickEditBtn" type="button" style="flex:1; height:42px; padding:0; font-size:13px; color:var(--c-text-sub); background:var(--c-surface); border:none;"><svg class="icon-svg" viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg> 编辑速记</button>' +
        '<button class="btn" id="quickDelBtn" type="button" style="flex:1; height:42px; padding:0; font-size:13px; color:var(--c-danger); background:color-mix(in srgb, var(--c-danger) 8%, transparent); border:none;"><svg class="icon-svg" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> 删除速记</button>' +
      '</div>';

    Modal.open({
      type: 'none',
      title: '<svg class="icon-svg" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> ' + UI.escapeHtml(tpl.name),
      html: html,
      actions: [{ text: '关闭', value: null }]
    });

    setTimeout(function() {
      const bindQuickAmtEvents = function() {
        document.querySelectorAll('.quick-amt-btn').forEach(function(btn) {
          btn.addEventListener('click', function() { self.saveQuickRecord(tpl, Number(this.dataset.amt)); });
        });

        document.querySelectorAll('.quick-amt-del').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (tpl.amounts.length <= 1) {
              if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast('至少保留一个常用金额，或删除整个速记');
              }
              return;
            }
            const amtToDel = Number(this.dataset.amt);
            const parentDiv = this.closest('div');
            
            const doDelete = function() {
              tpl.amounts = tpl.amounts.filter(function(a) { return a !== amtToDel; });
              Storage.write('slh.quickTemplates.v1', self.quickTemplates);
              self.renderQuickActions();
              
              const amtList = document.getElementById('quickAmtList');
              if (amtList) {
                amtList.innerHTML = tpl.amounts.map(function(a) {
                  return '<div style="position:relative; display:inline-block; width:calc(50% - 4px); margin-bottom:8px;">' +
                           '<button class="quick-amt-btn btn glass-amt-btn" data-amt="' + a + '" type="button" style="width:100%; padding:12px 0; font-size:16px; font-weight:bold; border-radius:12px;">￥' + a + '</button>' +
                           '<button class="cat__del quick-amt-del" data-amt="' + a + '" type="button" style="top:4px; right:4px; z-index:2; width:22px; height:22px; font-size:14px;"><svg class="icon-svg icon-close" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
                         '</div>';
                }).join('');
                bindQuickAmtEvents(); 
              }
            };
            
            if (parentDiv && typeof Shatter !== 'undefined') {
              Shatter.play(parentDiv, { windX: 200, windY: -100, duration: 380, maxPieces: 40 }, doDelete);
            } else { doDelete(); }
          });
        });
      };
      
      bindQuickAmtEvents();

      const editBtn = document.getElementById('quickEditBtn');
      if (editBtn) {
        editBtn.addEventListener('click', function() {
          Modal._close(null);
          setTimeout(function() { self.openAddQuickTemplate(tpl); }, 300);
        });
      }

      const delBtn = document.getElementById('quickDelBtn');
      if (delBtn) {
        delBtn.addEventListener('click', function() {
          Modal.confirm({ type: 'warn', title: '删除速记', message: '确定要删除「' + tpl.name + '」吗？', danger: true }).then(function(ok) {
            if (ok) {
              const chip = document.querySelector('.quick-chip[data-qid="' + tpl.id + '"]');
              const doDeleteChip = function() {
                self.quickTemplates = self.quickTemplates.filter(function(t) { return t.id !== tpl.id; });
                Storage.write('slh.quickTemplates.v1', self.quickTemplates);
                self.renderQuickActions();
                UI.showToast('速记已删除');
              };
              if (chip && typeof Shatter !== 'undefined') {
                Shatter.play(chip, { windX: 220, windY: -150 }, doDeleteChip);
              } else { doDeleteChip(); }
            } else { self.showQuickPanel(tpl); }
          });
        });
      }
    }, 100);
  },

  saveQuickRecord: function(tpl, amt) {
    Ledger.add({ amount: amt, categoryId: tpl.categoryId, note: tpl.note, date: Ledger.today() });
    UI.renderAll(this.currentMonth);
    UI.showToast('已记账 ￥' + amt);
    Modal._close(null);
  },

  openAddQuickTemplate: function (editTpl) {
    const self = this;
    const isEdit = !!editTpl;
    let tempAmounts = isEdit && editTpl.amounts ? editTpl.amounts.slice() : [];
    let tempName = isEdit ? editTpl.name : '';
    let tempCatId = isEdit ? editTpl.categoryId : Categories.list[0].id;
    let tempCatName = isEdit ? Categories.get(editTpl.categoryId).name : Categories.list[0].name;

    const renderModal = function() {
      const nameInput = document.getElementById('qtName');
      if (nameInput) tempName = nameInput.value.trim();
      
      let tagsHtml = tempAmounts.map(function(amt, idx) {
        return '<div style="position:relative; display:inline-block; margin:4px;">' +
                 '<div class="btn" style="margin:4px 4px 4px 0; padding:4px 14px; font-size:14px; font-weight:bold; background:rgba(255,255,255,0.4); border-radius:8px; line-height:1.4; box-shadow:none;">￥' + amt + '</div>' +
                 '<button class="del-temp-amt" data-idx="' + idx + '" type="button" style="position:absolute; top:-4px; right:-4px; width:18px; height:18px; border-radius:50%; background:var(--c-card); color:var(--c-text-sub); border:1px solid var(--c-border); font-size:12px; display:flex; align-items:center; justify-content:center; z-index:2;"><svg class="icon-svg icon-close" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>' +
               '</div>';
      }).join('');

      const html = 
        '<div style="text-align:left; max-height: 55vh; overflow-y: auto; overflow-x: hidden; padding-right: 4px;">' +
          '<div style="margin-bottom:16px;">' +
            '<label style="font-size:13px;color:var(--c-text-sub);display:block;margin-bottom:6px;">名称</label>' +
            '<input id="qtName" type="text" class="modal__input" placeholder="消费原因" maxlength="100" style="width:100%; height:44px !important; padding:0 14px !important; margin-bottom:0 !important; font-size:15px !important;" value="' + UI.escapeHtml(tempName) + '">' +
          '</div>' +
          '<div style="margin-bottom:16px;">' +
            '<label style="font-size:13px;color:var(--c-text-sub);display:block;margin-bottom:6px;">常用金额</label>' +
            '<div class="modal__input" style="display:flex; flex-wrap:wrap; align-content: flex-start; height:auto !important; min-height:44px !important; padding:8px 14px !important; max-height: 130px; overflow-y: auto;">' +
              tagsHtml +
              '<button id="addTempAmtBtn" type="button" style="margin:4px 4px 4px 0; padding:4px 10px; font-size:13px; background:transparent; border:1px dashed var(--c-text-sub); color:var(--c-text-sub); border-radius:8px; line-height:1.4;">+ 添加</button>' +
            '</div>' +
          '</div>' +
          '<div style="margin-bottom:16px;">' +
            '<label style="font-size:13px;color:var(--c-text-sub);display:block;margin-bottom:6px;">选择分类</label>' +
            '<div id="qtCatBtn" class="modal__input" style="width:100%; height:44px !important; padding:0 14px !important; margin-bottom:0 !important; font-size:15px !important; text-align:left; cursor:pointer; display:flex; justify-content:space-between; align-items:center; user-select:none;">' +
              '<span id="qtCatLabel">' + UI.escapeHtml(tempCatName) + '</span>' +
              '<span style="font-size:10px; color:var(--c-text-light); opacity:0.8;">▼</span>' +
            '</div>' +
            '<input type="hidden" id="qtCat" value="' + tempCatId + '">' +
          '</div>' +
        '</div>';

      Modal.open({
        type: 'none',
        title: isEdit ? '编辑快捷记账' : '添加快捷记账',
        html: html,
        actions: [{ text: '取消', value: null }, { text: '保存', value: 'save', primary: true }]
      }).then(function (res) {
        if (res === 'save') {
          const name = document.getElementById('qtName').value.trim();
          const catId = document.getElementById('qtCat').value;
          if (!name) { UI.showToast('请填写名称'); return; }
          if (tempAmounts.length === 0) { UI.showToast('请至少添加一个金额'); return; }
          if (isEdit) {
            editTpl.name = name; editTpl.note = name; editTpl.amounts = tempAmounts; editTpl.categoryId = catId;
          } else {
            self.quickTemplates.push({ id: 'q' + Date.now().toString(36), name: name, amounts: tempAmounts, categoryId: catId, note: name });
          }
          Storage.write('slh.quickTemplates.v1', self.quickTemplates);
          self.renderQuickActions();
          UI.showToast(isEdit ? '速记已更新' : '快捷按钮已添加');
        }
      });

      setTimeout(function() {
        document.querySelectorAll('.del-temp-amt').forEach(function(btn) {
          btn.addEventListener('click', function() {
            if (tempAmounts.length <= 1) {
              if (typeof UI !== 'undefined' && UI.showToast) {
                UI.showToast('至少保留一个常用金额');
              }
              return;
            }
            const parentDiv = this.closest('div');
            const idxToDel = Number(this.dataset.idx);
            const doRefresh = function() {
              tempAmounts.splice(idxToDel, 1);
              renderModal();
            };
            if (parentDiv && typeof Shatter !== 'undefined') {
              Shatter.play(parentDiv, { windX: 200, windY: -100, duration: 380, maxPieces: 40 }, doRefresh);
            } else { doRefresh(); }
          });
        });

        document.getElementById('addTempAmtBtn').addEventListener('click', function() {
          tempName = document.getElementById('qtName').value.trim();
          tempCatId = document.getElementById('qtCat').value;
          tempCatName = document.getElementById('qtCatLabel').textContent;

          Modal.open({
            type: 'info',
            title: '添加金额',
            html: '<input type="number" id="tempAddAmtInput" class="modal__input" placeholder="输入金额" min="0" step="0.01" style="width:100%; height:44px !important; padding:0 14px !important; margin-bottom:0 !important; font-size:16px !important; text-align:center;">',
            actions: [{ text: '取消', value: null }, { text: '确定', value: 'save', primary: true }]
          }).then(function(res) {
            if (res === 'save') {
              const val = document.getElementById('tempAddAmtInput').value;
              const newAmt = Number(val);
              if (newAmt > 0 && tempAmounts.indexOf(newAmt) === -1) { tempAmounts.push(newAmt); }
            }
            renderModal();
          });
          setTimeout(function() {
            const i = document.getElementById('tempAddAmtInput');
            if (i) i.focus();
          }, 100);
        });

        const qtCatBtn = document.getElementById('qtCatBtn');
        if (qtCatBtn) {
          qtCatBtn.addEventListener('click', function() {
            tempName = document.getElementById('qtName').value.trim();
            let overlay = document.createElement('div');
            overlay.className = 'cat-modal-overlay';
            let listHtml = Categories.list.map(function(c) {
              const active = tempCatId === c.id ? ' is-active' : '';
              return '<button class="cat-modal__item' + active + '" data-id="' + c.id + '" type="button">' +
                     '<span class="cat-modal__dot" style="background:' + c.color + '"></span>' +
                     '<span>' + UI.escapeHtml(c.name) + '</span></button>';
            }).join('');
            overlay.innerHTML = '<div class="cat-modal"><div class="cat-modal__header">选择分类</div><div class="cat-modal__list">' + listHtml + '</div></div>';
            document.body.appendChild(overlay);
            void overlay.offsetWidth;
            overlay.classList.add('is-show');
            document.body.style.overflow = 'hidden';
            
            const closeCatModal = function() {
              overlay.classList.remove('is-show');
              document.body.style.overflow = '';
              setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 250);
            };
            
            overlay.addEventListener('click', function(evt) {
              if (evt.target === overlay) { closeCatModal(); return; }
              const btn = evt.target.closest('.cat-modal__item');
              if (btn) {
                tempCatId = btn.dataset.id;
                tempCatName = btn.querySelector('span:last-child').textContent;
                closeCatModal();
                renderModal(); 
              }
            });
          });
        }
      }, 100);
    };
    renderModal();
  },

  initTheme: function () {
    let name = 'greenery';
    try { name = localStorage.getItem('slh.theme.v1') || 'greenery'; } catch (e) {}
    if (name === 'custom') {
      this.applyCustomTheme(false);
    } else {
      this.applyTheme(name, false);
    }
  },

  isLightColor: function(hex) {
    if (!hex) return false;
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const lum = (r * 299 + g * 587 + b * 114) / 1000;
    return lum > 185;
  },

  applyTheme: function (name, showToast) {
    const html = document.documentElement;
    this.clearInlineVars();
    html.classList.remove('light-theme-active');

    if (name) {
      html.setAttribute('data-theme', name);
    } else {
      html.setAttribute('data-theme', 'greenery');
      name = 'greenery';
    }

    if (name !== 'custom') {
      const theme = this.themeList.find(function(t) { return t.key === name; });
      if (theme && this.isLightColor(theme.primary)) {
        html.classList.add('light-theme-active');
        if (typeof this.hexToRgb === 'function' && typeof this.rgbToHex === 'function') {
          const rgb = this.hexToRgb(theme.primary);
          const darkText = this.rgbToHex(rgb[0]*0.45, rgb[1]*0.45, rgb[2]*0.45);
          const subText  = this.rgbToHex(rgb[0]*0.62, rgb[1]*0.62, rgb[2]*0.62);
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
        html.classList.remove('light-theme-active');
      }
    } else {
      html.classList.remove('light-theme-active');
    }

    try { localStorage.setItem('slh.theme.v1', name); } catch (e) {}
    html.removeAttribute('data-custom-bg');
    html.style.removeProperty('--custom-bg-url');
    this.updateThemeSelection(name);

    if (showToast !== false && typeof UI !== 'undefined') UI.showToast('已切换主题');
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

  applyGlassMode: function (mode) {
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
      Array.prototype.forEach.call(grid.querySelectorAll('.glass-mode__btn'), function (btn) {
        btn.classList.toggle('is-active', btn.dataset.mode === mode);
      });
    }
  },

  initGlassMode: function () {
    let mode = 'frosted';
    try { mode = localStorage.getItem('slh.glassMode.v1') || 'frosted'; } catch (e) {}
    this.applyGlassMode(mode);
  },

  clearInlineVars: function () {
    const vars = [
      '--c-primary', '--c-primary-light', '--c-primary-dark', '--c-primary-rgb',
      '--c-bg', '--c-card', '--c-surface', '--c-border',
      '--c-text', '--c-text-sub', '--c-text-light',
      '--c-shadow-sm', '--c-shadow', '--c-shadow-lg',
      '--c-danger', '--c-success', '--c-warning', '--custom-bg-url'
    ];
    const style = document.documentElement.style;
    vars.forEach(function (v) { style.removeProperty(v); });
  },

  applyCustomTheme: function (showToast) {
    let data = null;
    try { data = JSON.parse(localStorage.getItem('slh.customTheme.v1') || 'null'); } catch (e) {}
    if (!data || !data.primary) {
      if (typeof UI !== 'undefined' && showToast) UI.showToast('请先上传背景图片');
      return;
    }
    const html = document.documentElement;
    const vars = data;
    const set = function (k, v) { if (v) html.style.setProperty(k, v); };
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
    html.classList.remove('light-theme-active');
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
    try {
      const bg = localStorage.getItem('slh.customBg.v1');
      if (bg) {
        html.style.setProperty('--custom-bg-url', 'url(' + bg + ')');
        html.setAttribute('data-custom-bg', 'on');
      }
    } catch (e) {}
    try { localStorage.setItem('slh.theme.v1', 'custom'); } catch (e) {}
    this.updateThemeSelection('custom');
    if (showToast !== false && typeof UI !== 'undefined') UI.showToast('已应用自定义主题');
    this.updateStatusBarColor();
  },

  updateThemeSelection: function (name) {
    const grid = document.getElementById('themeGrid');
    if (!grid) return;
    Array.prototype.forEach.call(grid.querySelectorAll('.theme-item'), function (btn) {
      btn.classList.toggle('is-active', btn.dataset.theme === name);
    });
  },

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
          resolve({ dataUrl: canvas.toDataURL('image/jpeg', quality), canvas: canvas, width: w, height: h });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  extractColors: function (canvas) {
    const sctx = document.createElement('canvas').getContext('2d');
    sctx.canvas.width = 60;
    sctx.canvas.height = 60;
    sctx.drawImage(canvas, 0, 0, 60, 60);
    const data = sctx.getImageData(0, 0, 60, 60).data;
    const buckets = {};
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if (a < 128) continue;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const l = (max + min) / 2 / 255;
      const s = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));
      if (l < 0.15 || l > 0.92 || s < 0.12) continue;
      let hue = 0;
      const d = max - min;
      if (d !== 0) {
        if (max === r) hue = ((g - b) / d) % 6;
        else if (max === g) hue = (b - r) / d + 2;
        else hue = (r - g) / d + 4;
        hue = Math.round(hue * 60);
        if (hue < 0) hue += 360;
      }
      const key = Math.floor(hue / 30);
      if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, n: 0, sSum: 0 };
      buckets[key].r += r; buckets[key].g += g; buckets[key].b += b; buckets[key].n++; buckets[key].sSum += s;
      rSum += r; gSum += g; bSum += b; count++;
    }
    if (count === 0) {
      const r = Math.round(rSum / Math.max(1, count)) || 128;
      const g = Math.round(gSum / Math.max(1, count)) || 128;
      const b = Math.round(bSum / Math.max(1, count)) || 128;
      return { primary: this.rgbToHex(r, g, b), avg: [r, g, b] };
    }
    let best = null, bestScore = -1;
    Object.keys(buckets).forEach(function (k) {
      const b = buckets[k];
      const score = (b.sSum / b.n) * Math.log(b.n + 1);
      if (score > bestScore) { bestScore = score; best = b; }
    });
    const r = Math.round(best.r / best.n), g = Math.round(best.g / best.n), b = Math.round(best.b / best.n);
    return { primary: this.rgbToHex(r, g, b), avg: [r, g, b] };
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
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  },

  mix: function (c1, c2, t) {
    const a = this.hexToRgb(c1);
    const b = this.hexToRgb(c2);
    return this.rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
  },

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
      try {
        localStorage.setItem('slh.customBg.v1', compressed.dataUrl);
        localStorage.setItem('slh.customTheme.v1', JSON.stringify(theme));
      } catch (e) {
        if (typeof UI !== 'undefined') UI.showToast('图片太大，存储失败，试试小一点的');
        return;
      }
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
    this.applyTheme('greenery', false);
  },

  restoreCustomPreview: function () {
    try {
      const bg = localStorage.getItem('slh.customBg.v1');
      const custom = JSON.parse(localStorage.getItem('slh.customTheme.v1') || 'null');
      const preview = document.getElementById('customPreview');
      if (bg && preview) preview.style.backgroundImage = 'url(' + bg + ')';
      if (custom && custom.primary && preview) preview.style.setProperty('--p', custom.primary);
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
    this.restoreCustomPreview();
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
    preview.innerHTML = '￥' + raw.toFixed(2) + ' ÷ ' + split + ' 人 = 实记 <strong>￥' + per.toFixed(2) + '</strong>';
  },

  updateIncomeAmountPreview: function () {
    this.updateAmountPreview(UI.els.incomeAmountInput, UI.els.incomeSplitInput, UI.els.incomeAmountPreview);
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
    const _valid = IncomeCategories.list.some(function (c) { return c.id === categoryId; });
    if (!_valid) {
      UI.showToast('收入来源无效，请重新选择');
      return;
    }

    Ledger.add({ type: 'income', amount: amount, categoryId: categoryId, note: noteInput.value || '', date: date });
    amountInput.value = '';
    splitInput.value = '';
    noteInput.value = '';
    this.updateIncomeAmountPreview();
    if (document.activeElement) document.activeElement.blur();

    if (month !== this.currentMonth) {
      this.currentMonth = month;
      this.setMonthButton(month);
    }
    UI.renderAll(this.currentMonth);
    const tip = split > 1 ? ('已记收入 ￥' + amount.toFixed(2) + '（' + rawAmount.toFixed(2) + ' ÷ ' + split + '人）') : '收入记好啦 ✓';
    UI.showToast(tip);
  },

  openBudgetModal: function () {
    const currentBudget = Ledger.getBudget(this.currentMonth);
    let catHtml = '';
    Categories.list.forEach(function(c) {
      const limit = c.limit || '';
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
      type: 'none', title: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg> 预算设置', html: html,
      actions: [{ text: '取消', value: null }, { text: '保存', value: 'save', primary: true }]
    }).then(function(res) {
      if (res === 'save') {
        const totalInput = document.getElementById('modalBudgetInput').value;
        const total = Number(totalInput);
        if (total > 0) Ledger.setBudget(App.currentMonth, total);
        else Ledger.setBudget(App.currentMonth, 0);
        document.querySelectorAll('.cat-limit-input').forEach(function(input) {
          Categories.setLimit(input.dataset.cat, Number(input.value) > 0 ? Number(input.value) : 0);
        });
        UI.renderAll(App.currentMonth);
        UI.showToast('预算设置已保存');
      }
    });
  },

  exportData: function () {
    const data = {};
    const allowedKeys = [
      'slh.records.v1',
      'slh.budgets.v1',
      'slh.categories.v1',
      'slh.incomeCategories.v1',
      'slh.quickTemplates.v1',
      'slh.checkin.v1'
    ];
    allowedKeys.forEach(key => {
      const val = localStorage.getItem(key);
      if (val !== null) data[key] = val;
    });
    if (Object.keys(data).length === 0) { UI.showToast('没有可导出的数据'); return; }
    const jsonStr = JSON.stringify(data, null, 2);
    const now = new Date();
    const pad = function(n) { return String(n).padStart(2, '0'); };
    const dateStr = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
    const timeStr = pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
    const filename = '有序星球_备份_' + dateStr + '_' + timeStr + '.json';
    if (window.Android && typeof window.Android.downloadFile === 'function') {
      window.Android.downloadFile(filename, jsonStr);
      UI.showToast('备份文件已保存到下载目录');
      return;
    }
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

        // ---- 支出分类合并：只按 id 判断，不存在就创建 ----
        const catIdMap = new Map();
        let newCatsCount = 0;
        const importedCatsStr = data['slh.categories.v1'];
        const importedCats = importedCatsStr ? JSON.parse(importedCatsStr) : [];
        importedCats.forEach(c => {
          if (Categories.list.some(lc => lc.id === c.id)) {
            catIdMap.set(c.id, c.id);
          } else {
            Categories.list.push(c);
            catIdMap.set(c.id, c.id);
            newCatsCount++;
          }
        });
        if (newCatsCount > 0) { Categories.reorder(); Categories.save(); }

        // ---- 收入分类合并：只按 id 判断，不存在就创建（和支出一模一样） ----
        const incomeCatIdMap = new Map();
        let newIncomeCatsCount = 0;
        const importedIncomeCatsStr = data['slh.incomeCategories.v1'];
        const importedIncomeCats = importedIncomeCatsStr ? JSON.parse(importedIncomeCatsStr) : [];
        importedIncomeCats.forEach(c => {
          if (IncomeCategories.list.some(lc => lc.id === c.id)) {
            incomeCatIdMap.set(c.id, c.id);
          } else {
            IncomeCategories.list.push(c);
            incomeCatIdMap.set(c.id, c.id);
            newIncomeCatsCount++;
          }
        });
        if (newIncomeCatsCount > 0) { IncomeCategories.reorder(); IncomeCategories.save(); }

        // ---- 快捷模板合并（按 id 去重） ----
        let newQuickCount = 0;
        const importedQuickStr = data['slh.quickTemplates.v1'];
        if (importedQuickStr) {
          if (!App.quickTemplates) App.quickTemplates = [];
          const importedQuick = JSON.parse(importedQuickStr);
          const localQuickIds = new Set(App.quickTemplates.map(t => t.id));
          importedQuick.forEach(t => {
            if (!localQuickIds.has(t.id)) {
              App.quickTemplates.push(t);
              localQuickIds.add(t.id);
              newQuickCount++;
            }
          });
          if (newQuickCount > 0) {
            Storage.write('slh.quickTemplates.v1', App.quickTemplates);
            if (typeof App.renderQuickActions === 'function') App.renderQuickActions();
          }
        }

        const importedBudgetsStr = data['slh.budgets.v1'];
        if (importedBudgetsStr) {
          const importedBudgets = JSON.parse(importedBudgetsStr);
          Object.assign(Ledger.budgets, importedBudgets);
          Storage.write(CONFIG.budgetKey, Ledger.budgets);
        }

        // ---- 记录导入（含 categoryId 校验与映射） ----
        const importedRecordsStr = data['slh.records.v1'];
        let addedCount = 0;
        let duplicateList = [];
        let remappedExpense = 0;
        let remappedIncome = 0;
        if (importedRecordsStr) {
          const importedRecords = JSON.parse(importedRecordsStr);
          const existingSignatures = new Set();
          Ledger.records.forEach(r => existingSignatures.add(`${r.createdAt}|${r.amount}|${r.categoryId}|${r.note}`));

          importedRecords.forEach(r => {
            if (r.type === 'income') {
              if (incomeCatIdMap.has(r.categoryId)) {
                r.categoryId = incomeCatIdMap.get(r.categoryId);
              } else if (!IncomeCategories.list.some(c => c.id === r.categoryId)) {
                IncomeCategories.list.push({
                  id: r.categoryId,
                  name: '未知收入',
                  color: '#A8A2B0'
                });
                incomeCatIdMap.set(r.categoryId, r.categoryId);
                remappedIncome++;
              }
            } else {
              if (catIdMap.has(r.categoryId)) {
                r.categoryId = catIdMap.get(r.categoryId);
              } else if (!Categories.list.some(c => c.id === r.categoryId)) {
                Categories.list.push({
                  id: r.categoryId,
                  name: '未知分类',
                  color: '#A8A2B0'
                });
                catIdMap.set(r.categoryId, r.categoryId);
                remappedExpense++;
              }
            }

            const sig = `${r.createdAt}|${r.amount}|${r.categoryId}|${r.note}`;
            if (existingSignatures.has(sig)) duplicateList.push(r);
            else { Ledger.records.push(r); existingSignatures.add(sig); addedCount++; }
          });

          // 循环结束后保存补建的分类
          if (remappedExpense > 0) { Categories.reorder(); Categories.save(); }
          if (remappedIncome > 0) { IncomeCategories.reorder(); IncomeCategories.save(); }
          if (addedCount > 0) Ledger.saveRecords();
        }

        let msgHtml = `<div style="text-align:center;">`;
        msgHtml += `<p style="margin-bottom:12px;font-size:15px;">成功导入 <strong>${addedCount}</strong> 笔新记录。</p>`;
        if (newCatsCount > 0) msgHtml += `<p style="font-size:13px;color:var(--c-text-sub);">新增了 <strong>${newCatsCount}</strong> 个支出分类。</p>`;
        if (newIncomeCatsCount > 0) msgHtml += `<p style="font-size:13px;color:var(--c-text-sub);">新增了 <strong>${newIncomeCatsCount}</strong> 个收入分类。</p>`;
        if (newQuickCount > 0) msgHtml += `<p style="font-size:13px;color:var(--c-text-sub);">新增了 <strong>${newQuickCount}</strong> 个快捷记账按钮。</p>`;
        if (remappedExpense > 0) {
          msgHtml += `<p style="font-size:13px;color:var(--c-text-sub);margin-top:8px;">补建了 <strong>${remappedExpense}</strong> 个缺失的支出分类。</p>`;
        }
        if (remappedIncome > 0) {
          msgHtml += `<p style="font-size:13px;color:var(--c-text-sub);margin-top:8px;">补建了 <strong>${remappedIncome}</strong> 个缺失的收入分类。</p>`;
        }
        if (duplicateList.length > 0) {
          msgHtml += `<p style="font-size:13px;color:var(--c-text-sub);margin-top:8px;">已自动跳过 <strong>${duplicateList.length}</strong> 笔重复记录。</p>`;
          msgHtml += `<div style="margin-top:12px; text-align:left; font-size:12px; max-height:120px; overflow-y:auto; background:rgba(0,0,0,0.03); padding:10px; border-radius:8px; color:var(--c-text-sub);">`;
          msgHtml += `<strong style="color:var(--c-text);">重复项清单：</strong><br>`;
          duplicateList.slice(0, 5).forEach(r => {
            const store = r.type === 'income' ? IncomeCategories : Categories;
            const cat = store.get(r.categoryId);
            const time = new Date(r.createdAt);
            const pad = function(n){ return String(n).padStart(2,'0'); };
            const timeStr = pad(time.getHours()) + ':' + pad(time.getMinutes()) + ':' + pad(time.getSeconds());
            const noteStr = r.note ? ' · ' + UI.escapeHtml(r.note) : '';
            msgHtml += `<div style="padding:4px 0; border-bottom:1px dashed rgba(0,0,0,0.05);">• ${UI.escapeHtml(cat.name)} ￥${r.amount.toFixed(2)}${noteStr} (${timeStr})</div>`;
          });
          if (duplicateList.length > 5) msgHtml += `<div style="text-align:center; margin-top:6px;">...等共 ${duplicateList.length} 笔</div>`;
          msgHtml += `</div>`;
        }
        msgHtml += `</div>`;

        Modal.alert({ type: 'success', title: '导入完成', html: msgHtml, buttonText: '太棒了' }).then(() => { window.location.reload(); });
      } catch (err) {
        console.error(err);
        Modal.alert({ type: 'danger', title: '导入失败', message: '文件格式不正确或已损坏，请确保选择了正确的备份文件。' });
      }
    };
    reader.readAsText(file);
  },

  bindEvents: function () {
    const self = this;
    UI.els.tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        UI.els.tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
        UI.els.pages.forEach(function (page) { page.classList.toggle('is-active', page.id === tab.dataset.page); });
        UI.updateHeader(self.currentMonth);
        UI.updateTabbarThumb();
        requestAnimationFrame(function () { UI.updateSegThumb(); UI.updateChartTabsThumb(); });
      });
    });

    UI.els.monthPicker.addEventListener('click', function () {
      if (Calendar.isOpen) { Calendar.close(); return; }
      Calendar.open(UI.els.monthPicker, 'month', UI.els.monthPicker.dataset.value || self.currentMonth, function (month) {
        self.currentMonth = month;
        self.setMonthButton(month);
        UI.renderAll(month);
      });
    });

    UI.els.dateInput.addEventListener('click', function () {
      if (Calendar.isOpen && Calendar.triggerEl === UI.els.dateInput) { Calendar.close(); return; }
      Calendar.open(UI.els.dateInput, 'date', UI.els.dateInput.dataset.value || Ledger.today(), function (date) { self.setDateButton(date); });
    });

    UI.els.catGrid.addEventListener('click', function (e) {
      const delBtn = e.target.closest('[data-cat-del]');
      if (delBtn) { e.stopPropagation(); self.removeCategory(delBtn.dataset.catDel); return; }
      const addBtn = e.target.closest('[data-cat-add]');
      if (addBtn) { self.promptAddCategory(); return; }
      const cat = e.target.closest('.cat');
      if (cat && cat.dataset.cat) UI.selectCategory(cat.dataset.cat);
    });

    UI.els.amountInput.addEventListener('input', function () { self.updateAmountPreview(); });
    UI.els.splitInput.addEventListener('input', function () { self.updateAmountPreview(); });

    const quickActions = document.getElementById('quickActions');
    if (quickActions) {
      let lastTap = 0;
      let tapTimer = null;
      const DOUBLE_PRESS_DELAY = 250;

      const newQuickActions = quickActions.cloneNode(true);
      quickActions.parentNode.replaceChild(newQuickActions, quickActions);

      newQuickActions.addEventListener('click', function (e) {
        const chip = e.target.closest('.quick-chip');
        if (!chip) return;
        if (chip.id === 'quickAddBtn') { self.openAddQuickTemplate(); return; }
        const id = chip.dataset.qid;
        const tpl = self.quickTemplates.find(function (t) { return t.id === id; });
        if (!tpl) return;
        const now = Date.now();
        if (now - lastTap < DOUBLE_PRESS_DELAY) {
          clearTimeout(tapTimer);
          const defaultAmt = tpl.amounts && tpl.amounts.length > 0 ? tpl.amounts[0] : (tpl.amount || 0);
          Ledger.add({ amount: Number(defaultAmt), categoryId: tpl.categoryId, note: tpl.note, date: Ledger.today() });
          UI.renderAll(self.currentMonth);
          if (navigator.vibrate) navigator.vibrate(30);
          UI.showToast('已快捷记账 ￥' + defaultAmt);
        } else {
          tapTimer = setTimeout(function () { self.showQuickPanel(tpl); }, DOUBLE_PRESS_DELAY);
        }
        lastTap = now;
      });
    }

    const generatePosterBtn = document.getElementById('generatePosterBtn');
    if (generatePosterBtn) {
      generatePosterBtn.addEventListener('click', async function () {
        const month = self.currentMonth;
        const list = Ledger.byMonth(month, 'expense');
        if (list.length === 0) { UI.showToast('本月还没有记账哦'); return; }
        
        generatePosterBtn.innerHTML = '生成中...';
        generatePosterBtn.disabled = true;
        
        try {
          // 1. 获取背景图
          let bgImg = null;
          const isCustomBgOn = document.documentElement.getAttribute('data-custom-bg') === 'on';
          const bgData = isCustomBgOn ? localStorage.getItem('slh.customBg.v1') : null;
          if (bgData) {
            bgImg = new Image();
            bgImg.src = bgData;
            await new Promise((resolve) => {
              bgImg.onload = resolve;
              bgImg.onerror = resolve;
            });
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const W = 750, H = 1150;
          canvas.width = W; canvas.height = H;
          
          const style = getComputedStyle(document.documentElement);
          const primary = style.getPropertyValue('--c-primary').trim() || '#6667AB';
          let primaryRgb = style.getPropertyValue('--c-primary-rgb').trim();
          
          // 如果是内置主题，没有定义 rgb 变量，就实时把 Hex 转成 RGB
          if (!primaryRgb && primary.startsWith('#')) {
            const hex = primary.replace('#', '');
            const r = parseInt(hex.length === 3 ? hex[0]+hex[0] : hex.substring(0, 2), 16);
            const g = parseInt(hex.length === 3 ? hex[1]+hex[1] : hex.substring(2, 4), 16);
            const b = parseInt(hex.length === 3 ? hex[2]+hex[2] : hex.substring(4, 6), 16);
            primaryRgb = r + ', ' + g + ', ' + b;
          } else if (!primaryRgb) {
            primaryRgb = '110, 92, 150'; // 终极兜底
          }
          
          // 固定文字色，不随主题瞎变
          const colorDark = '#1A1720';
          const colorSub = '#55505C';

          // 离屏底图
          const bgCanvas = document.createElement('canvas');
          bgCanvas.width = W; bgCanvas.height = H;
          const bgCtx = bgCanvas.getContext('2d');

          if (bgImg) {
            const scale = Math.max(W / bgImg.width, H / bgImg.height);
            const dw = bgImg.width * scale;
            const dh = bgImg.height * scale;
            bgCtx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
            // 全局压暗
            bgCtx.fillStyle = 'rgba(0,0,0,0.25)';
            bgCtx.fillRect(0, 0, W, H);
          } else {
            // 提取当前主题的背景色和卡片色
            const themeBg = style.getPropertyValue('--c-bg').trim() || '#F2F2F7';
            const themeCard = style.getPropertyValue('--c-card').trim() || '#FDFDFF';
            
            // 1. 基础渐变
            const grad = bgCtx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, themeBg);
            grad.addColorStop(1, themeCard);
            bgCtx.fillStyle = grad;
            bgCtx.fillRect(0, 0, W, H);

            // 2. 主题色光晕（让纯色背景看起来像高级的极光/磨砂渐变）
            const radial = bgCtx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, W);
            radial.addColorStop(0, `rgba(${primaryRgb}, 0.22)`);
            radial.addColorStop(1, `rgba(${primaryRgb}, 0)`);
            bgCtx.fillStyle = radial;
            bgCtx.fillRect(0, 0, W, H);
          }

          // 降采样模拟模糊（兼容性最强）
          const blurCanvas = document.createElement('canvas');
          const bW = 80, bH = 122;
          blurCanvas.width = bW; blurCanvas.height = bH;
          const blurCtx = blurCanvas.getContext('2d');
          blurCtx.drawImage(bgCanvas, 0, 0, bW, bH);

          // 主画布绘制清晰底图
          ctx.drawImage(bgCanvas, 0, 0);

          const expenseTotal = Ledger.sum(list);
          const incomeList = Ledger.byMonth(month, 'income');
          const incomeTotal = Ledger.sum(incomeList);
          const netTotal = incomeTotal - expenseTotal;
          const budget = Ledger.getBudget(month);
          let budgetPercent = 0;
          if (budget > 0) budgetPercent = Math.min(100, (expenseTotal / budget) * 100);
          
          let streak = 0;
          try {
            const checkinData = JSON.parse(localStorage.getItem('slh.checkin.v1'));
            if (checkinData && checkinData.streak) streak = checkinData.streak;
          } catch(e) {}

          const catTotals = {};
          list.forEach(r => { catTotals[r.categoryId] = (catTotals[r.categoryId] || 0) + r.amount; });

          // 玻璃卡片渲染器
          const drawGlassCard = (x, y, w, h, r, bgTint) => {
            ctx.save();
            
            // 阴影
            ctx.shadowColor = 'rgba(0,0,0,0.15)';
            ctx.shadowBlur = 30;
            ctx.shadowOffsetY = 15;
            ctx.fillStyle = 'rgba(255,255,255,0.01)'; // 占位
            ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.clip();

            // 铺满模糊背景（放大回来）
            ctx.drawImage(blurCanvas, 0, 0, bW, bH, 0, 0, W, H);

            // 叠加玻璃底色
            ctx.fillStyle = bgTint;
            ctx.fillRect(x, y, w, h);

            // 内边框高光（只留一圈细白边，模拟玻璃切边）
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.stroke();
            ctx.restore();
          };

          // 1. 顶部主卡（带主色的玻璃）
                    // 1. 顶部主卡（带主色的玻璃）
          // 使用 0.8 的主色，并额外叠加 0.15 的黑色，防止浅色主题（如沙色、柔和桃）下白字看不清
          drawGlassCard(40, 40, W - 80, 360, 32, `rgba(${primaryRgb}, 0.8)`);
          ctx.save(); 
          ctx.beginPath(); ctx.roundRect(40, 40, W - 80, 360, 32); ctx.clip();
          ctx.fillStyle = 'rgba(0,0,0,0.15)'; 
          ctx.fillRect(40, 40, W - 80, 360); 
          ctx.restore();
          
          ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 32px sans-serif'; ctx.fillText('有序星球', 80, 110);
          ctx.font = '20px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText(month.replace('-', ' 年 ') + ' 月财务报告', 80, 150);
          
          ctx.textAlign = 'right';
          ctx.font = '18px sans-serif'; 
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.fillText('连续打卡 ' + streak + ' 天', W - 80, 110);
          ctx.textAlign = 'left';

          ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 76px sans-serif'; ctx.fillText('￥' + expenseTotal.toFixed(2), 80, 260);
          ctx.font = '20px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillText('本月总支出', 80, 300);

          if (budget > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.roundRect(80, 330, W - 160, 12, 6); ctx.fill();
            ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(80, 330, (W - 160) * (budgetPercent / 100), 12, 6); ctx.fill();
            ctx.font = '16px sans-serif'; ctx.fillText('月预算 ￥' + budget + ' (已用 ' + budgetPercent.toFixed(1) + '%)', 80, 375);
          } else { 
            ctx.font = '16px sans-serif'; ctx.fillText('本月未设置预算', 80, 375); 
          }

          // 2. 数据卡片（两宫格纯白玻璃）
          const cardW = (W - 80 - 20) / 2;
          
          // 卡片1：总收入
          drawGlassCard(40, 430, cardW, 160, 24, 'rgba(255,255,255,0.85)');
          ctx.fillStyle = colorSub; ctx.font = '20px sans-serif'; ctx.fillText('本月总收入', 70, 480);
          ctx.fillStyle = '#5C7A6A'; ctx.font = 'bold 40px sans-serif'; ctx.fillText('+￥' + incomeTotal.toFixed(2), 70, 540);

          // 卡片2：净结余
          drawGlassCard(40 + cardW + 20, 430, cardW, 160, 24, 'rgba(255,255,255,0.85)');
          ctx.fillStyle = colorSub; ctx.font = '20px sans-serif'; ctx.fillText('本月净结余', 70 + cardW + 20, 480);
          ctx.fillStyle = netTotal >= 0 ? '#5C7A6A' : '#A85E52'; ctx.font = 'bold 40px sans-serif';
          const netSign = netTotal >= 0 ? '+' : '-'; ctx.fillText(netSign + '￥' + Math.abs(netTotal).toFixed(2), 70 + cardW + 20, 540);

          // 3. 底部：支出分类饼图（纯白玻璃）
          drawGlassCard(40, 620, W - 80, 420, 24, 'rgba(255,255,255,0.85)');
          ctx.fillStyle = colorDark; ctx.font = 'bold 22px sans-serif'; ctx.fillText('支出分类占比', 70, 680);

          const sortedCats = Object.keys(catTotals || {}).map(id => ({id, amt: catTotals[id]})).sort((a,b) => b.amt - a.amt);
          let chartData = [];
          if (sortedCats.length > 5) {
            chartData = sortedCats.slice(0, 5);
            const othersAmt = sortedCats.slice(5).reduce((sum, item) => sum + item.amt, 0);
            chartData.push({ id: 'other_merged', amt: othersAmt, name: '其他' });
          } else { chartData = sortedCats; }

          const cx = 230, cy = 850, radius = 110;
          let startAngle = -Math.PI / 2;
          if (expenseTotal > 0) {
            chartData.forEach(item => {
              const cat = item.name === '其他' ? { name: '其他', color: '#D1D5DB' } : Categories.get(item.id);
              const sliceAngle = (item.amt / expenseTotal) * Math.PI * 2;
              ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle); ctx.closePath();
              ctx.fillStyle = cat.color; ctx.fill(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.stroke();
              startAngle += sliceAngle;
            });

            ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
            ctx.fillStyle = colorSub; ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('总支出', cx, cy - 10);
            ctx.fillStyle = colorDark; ctx.font = 'bold 24px sans-serif'; ctx.fillText('￥' + expenseTotal.toFixed(0), cx, cy + 22);
            ctx.textAlign = 'left';
          } else {
            ctx.fillStyle = '#D1D5DB'; ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('无支出', cx, cy + 8);
            ctx.textAlign = 'left';
          }

          let legendY = 720;
          chartData.forEach(item => {
            const cat = item.name === '其他' ? { name: '其他', color: '#D1D5DB' } : Categories.get(item.id);
            const percent = expenseTotal > 0 ? (item.amt / expenseTotal * 100).toFixed(1) : '0.0';
            ctx.fillStyle = cat.color; ctx.beginPath(); ctx.roundRect(W - 250, legendY - 14, 14, 14, 4); ctx.fill();
            ctx.fillStyle = colorDark; ctx.font = '18px sans-serif'; ctx.fillText(cat.name, W - 220, legendY);
            ctx.fillStyle = colorDark; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(percent + '%', W - 80, legendY);
            ctx.textAlign = 'left'; legendY += 50;
          });

          ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText('—— 有序星球 · 记录每一笔 ——', W / 2, 1090); ctx.textAlign = 'left';
          
          const base64 = canvas.toDataURL('image/jpeg', 0.9);
          generatePosterBtn.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> 生成海报'; generatePosterBtn.disabled = false;
          
          Modal.open({
            type: 'none', title: '月度账单已生成', html: '<img src="' + base64 + '" style="width:100%; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">',
            actions: [{ text: '关闭', value: null }, { text: '保存到相册', value: 'save', primary: true }]
          }).then(function (res) {
            if (res === 'save') {
              if (window.Android && typeof window.Android.saveImage === 'function') window.Android.saveImage(base64);
              else { const a = document.createElement('a'); a.href = base64; a.download = '有序星球_海报_' + month + '.jpg'; a.click(); UI.showToast('图片已下载'); }
            }
          });

        } catch(err) { 
          console.error(err); 
          UI.showToast('海报生成失败'); 
          generatePosterBtn.innerHTML = '<svg class="icon-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> 生成海报'; 
          generatePosterBtn.disabled = false; 
        }
      });
    }

    UI.els.submitBtn.addEventListener('click', function () { self.saveRecord(); });
    UI.els.amountInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') self.saveRecord(); });
    UI.els.splitInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') self.saveRecord(); });

    function onDeleteRecord(e) {
      const btn = e.target.closest('[data-del]');
      if (!btn) return;
      self.confirmDeleteRecord(btn.dataset.del);
    }
    UI.els.recentList.addEventListener('click', onDeleteRecord);
    UI.els.recordList.addEventListener('click', onDeleteRecord);
    if (UI.els.incomeRecentList) UI.els.incomeRecentList.addEventListener('click', onDeleteRecord);

    UI.els.statModeSeg.addEventListener('click', function (e) {
      const btn = e.target.closest('.seg__btn');
      if (btn) UI.setStatMode(btn.dataset.mode);
    });

    UI.els.statPeriodBtn.addEventListener('click', function () {
      if (Calendar.isOpen && Calendar.triggerEl === UI.els.statPeriodBtn) { Calendar.close(); return; }
      if (UI.statMode === 'year') {
        Calendar.open(UI.els.statPeriodBtn, 'year', UI.statPeriod, function (year) {
          UI.statPeriod = year;
          UI.renderStatAll();
          UI.updateHeader(UI.statPeriod);
        });
      } else {
        Calendar.open(UI.els.statPeriodBtn, 'month', UI.statPeriod, function (month) {
          UI.statPeriod = month;
          UI.renderStatAll();
          UI.updateHeader(UI.statPeriod);
        });
      }
    });

    UI.els.statCatSelect.addEventListener('change', function () { UI.statCategoryId = UI.els.statCatSelect.value; UI.renderStatAll(); });
    UI.els.statCompareToggle.addEventListener('change', function () { UI.statCompare = UI.els.statCompareToggle.checked; UI.comparePeriod = ''; UI.renderStatSummary(); });

    UI.els.statComparePeriodBtn.addEventListener('click', function () {
      if (Calendar.isOpen && Calendar.triggerEl === UI.els.statComparePeriodBtn) { Calendar.close(); return; }
      if (!UI.statCompare) return;
      if (UI.statMode === 'year') {
        Calendar.open(UI.els.statComparePeriodBtn, 'year', UI.comparePeriod || Ledger.prevYear(UI.statPeriod), function (year) { UI.comparePeriod = year; UI.renderStatSummary(); });
      } else {
        Calendar.open(UI.els.statComparePeriodBtn, 'month', UI.comparePeriod || Ledger.prevMonth(UI.statPeriod), function (month) { UI.comparePeriod = month; UI.renderStatSummary(); });
      }
    });

    UI.els.chartTabs.addEventListener('click', function (e) {
      const btn = e.target.closest('.chart-tab');
      if (btn && !btn.hidden) UI.setChartType(btn.dataset.chart);
    });

    UI.els.catManageList.addEventListener('click', function (e) {
      const limitBtn = e.target.closest('[data-cat-limit]');
      if (limitBtn) { self.editCategoryLimit(limitBtn.dataset.catLimit); return; }
      const delBtn = e.target.closest('[data-cat-del]');
      if (delBtn && !delBtn.disabled) self.removeCategory(delBtn.dataset.catDel);
    });

    const budgetOverviewBtn = document.getElementById('headerBudgetBlock') || document.getElementById('budgetOverviewBtn');
    if (budgetOverviewBtn) budgetOverviewBtn.addEventListener('click', function () { self.openBudgetModal(); });

    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importFileInput = document.getElementById('importFileInput');
    if (exportBtn) exportBtn.addEventListener('click', function () { self.exportData(); });
    if (importBtn && importFileInput) {
      importBtn.addEventListener('click', function () { importFileInput.click(); });
      importFileInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (file) self.importData(file);
        e.target.value = '';
      });
    }

    const themeGrid = document.getElementById('themeGrid');
    if (themeGrid) {
      themeGrid.addEventListener('click', function (e) {
        const btn = e.target.closest('.theme-item');
        if (!btn) return;
        if (btn.dataset.theme === 'custom') self.applyCustomTheme();
        else self.applyTheme(btn.dataset.theme);
      });
    }

    const bgInput = document.getElementById('customBgInput');
    if (bgInput) {
      bgInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (file) self.handleCustomBg(file);
        e.target.value = '';
      });
    }

    const bgClear = document.getElementById('customBgClear');
    if (bgClear) bgClear.addEventListener('click', function () { self.clearCustomBg(); });

    UI.els.addCatBtn.addEventListener('click', function () { self.addCategoryFromInput(); });
    UI.els.newCatInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') self.addCategoryFromInput(); });

    if (UI.els.incomeCatGrid) {
      UI.els.incomeCatGrid.addEventListener('click', function (e) {
        const delBtn = e.target.closest('[data-cat-del]');
        if (delBtn) { e.stopPropagation(); self.removeIncomeCategory(delBtn.dataset.catDel); return; }
        const addBtn = e.target.closest('[data-cat-add]');
        if (addBtn) { self.promptAddIncomeCategory(); return; }
        const cat = e.target.closest('.cat');
        if (cat && cat.dataset.cat) UI.selectIncomeCategory(cat.dataset.cat);
      });
    }
    if (UI.els.incomeAmountInput) UI.els.incomeAmountInput.addEventListener('input', function () { self.updateIncomeAmountPreview(); });
    if (UI.els.incomeSplitInput) {
      UI.els.incomeSplitInput.addEventListener('input', function () { self.updateIncomeAmountPreview(); });
      UI.els.incomeSplitInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') self.saveIncomeRecord(); });
    }
    if (UI.els.incomeAmountInput) UI.els.incomeAmountInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') self.saveIncomeRecord(); });
    if (UI.els.incomeDateInput) {
      UI.els.incomeDateInput.addEventListener('click', function () {
        if (Calendar.isOpen) { Calendar.close(); return; }
        Calendar.open(UI.els.incomeDateInput, 'date', UI.els.incomeDateInput.dataset.value || Ledger.today(), function (date) { self.setIncomeDateButton(date); });
      });
    }
    if (UI.els.incomeSubmitBtn) UI.els.incomeSubmitBtn.addEventListener('click', function () { self.saveIncomeRecord(); });

    if (UI.els.statTypeSeg) {
      UI.els.statTypeSeg.addEventListener('click', function (e) {
        const btn = e.target.closest('.seg__btn');
        if (btn) UI.setStatType(btn.dataset.type);
      });
    }
  },

  promptAddIncomeCategory: async function () {
    const name = await Modal.prompt({ type: 'info', title: '新收入来源', message: '名字最多 6 个字', input: { placeholder: '输入来源名称', maxLength: 100 } });
    if (name === null) return;
    const res = IncomeCategories.add(name);
    if (!res.ok) { Modal.alert({ type: 'warn', message: res.msg }); return; }
    UI.renderIncomeCategories();
    UI.showToast('收入来源已添加');
  },

  removeIncomeCategory: async function (id) {
    const realCat = IncomeCategories.list.find(function (c) { return c.id === id; });
    if (!realCat) { Modal.alert({ type: 'warn', title: '分类不存在', message: '该分类可能已被删除或数据异常。' }); return; }
    const cat = realCat;
    const count = Ledger.countByCategory(id, 'income');
    if (count > 0) { Modal.alert({ type: 'warn', title: '无法删除', html: '「' + UI.escapeHtml(cat.name) + '」下还有 <strong>' + count + '</strong> 笔收入记录。<br><br>请先删除这些记录。' }); return; }
    const ok = await Modal.confirm({ type: 'warn', title: '删除「' + UI.escapeHtml(cat.name) + '」？', message: '删除后无法恢复。', okText: '删除', danger: true });
    if (!ok) return;
    const nodes = document.querySelectorAll('.cat[data-cat="' + id + '"]');
    if (nodes.length > 0 && typeof Shatter !== 'undefined') {
      await new Promise(function (resolve) { Shatter.play(nodes, { windX: 220, windY: -160, duration: 620, maxPieces: 80, targetPieceSize: 12 }, resolve); });
    }
    const res = IncomeCategories.remove(id);
    if (!res.ok) { Modal.alert({ type: 'warn', message: res.msg }); return; }
    if (UI.selectedIncomeCategoryId === id) UI.selectedIncomeCategoryId = IncomeCategories.list[0].id;
    UI.renderIncomeCategories();
    UI.renderIncomeRecent();
    UI.showToast('收入来源已删除');
  },

  confirmDeleteRecord: async function (id) {
    const ok = await Modal.confirm({ type: 'warn', title: '删除这条记录？', message: '删除后无法恢复', okText: '删除', danger: true });
    if (!ok) return;
    const nodes = document.querySelectorAll('[data-id="' + id + '"]');
    if (nodes.length > 0 && typeof Shatter !== 'undefined') {
      await new Promise(function (resolve) { Shatter.play(nodes, { windX: 240, windY: -150, duration: 680, maxPieces: 80, targetPieceSize: 12 }, resolve); });
    }
    Ledger.remove(id);
    UI.renderAll(this.currentMonth);
    UI.showToast('已删除');
  },

  promptAddCategory: async function () {
    const name = await Modal.prompt({ type: 'info', title: '新分类', message: '名字最多 6 个字', input: { placeholder: '输入分类名称', maxLength: 100 } });
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
    if (count > 0) { Modal.alert({ type: 'warn', title: '无法删除', html: '「' + UI.escapeHtml(cat.name) + '」下还有 <strong>' + count + '</strong> 笔记录。<br><br>为了保证数据安全，请先删除或修改这些记录。' }); return; }
    const ok = await Modal.confirm({ type: 'warn', title: '删除「' + UI.escapeHtml(cat.name) + '」？', message: '删除后无法恢复，且该分类会从列表移除。', okText: '删除', danger: true });
    if (!ok) return;
    const nodes = [];
    document.querySelectorAll('.cat[data-cat="' + id + '"]').forEach(function (n) { nodes.push(n); });
    document.querySelectorAll('[data-cat-del="' + id + '"]').forEach(function (btn) { const li = btn.closest('li'); if (li) nodes.push(li); });
    if (nodes.length > 0 && typeof Shatter !== 'undefined') {
      await new Promise(function (resolve) { Shatter.play(nodes, { windX: 220, windY: -160, duration: 620, maxPieces: 80, targetPieceSize: 12 }, resolve); });
    }
    const res = Categories.remove(id);
    if (!res.ok) { Modal.alert({ type: 'warn', message: res.msg }); return; }
    if (UI.selectedCategoryId === id) UI.selectedCategoryId = Categories.list[0].id;
    if (UI.statCategoryId === id) UI.statCategoryId = '';
    UI.renderCategories();
    UI.renderAll(this.currentMonth);
    UI.showToast('分类已删除');
  },

  editCategoryLimit: async function (id) {
    const cat = Categories.get(id);
    const current = (cat.limit && cat.limit > 0) ? String(cat.limit) : '';
    const value = await Modal.prompt({ type: 'info', title: '「' + cat.name + '」月度额度', message: '输入每月上限，留空或填 0 表示取消', input: { placeholder: '输入限额', value: current, type: 'number' } });
    if (value === null) return;
    const num = Number(value);
    if (value === '' || num === 0) { Categories.setLimit(id, 0); UI.renderCatManage(this.currentMonth); UI.showToast('已取消额度'); return; }
    if (isNaN(num) || num < 0) { Modal.alert({ type: 'warn', message: '请输入正确的金额' }); return; }
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
    if (!rawAmount || rawAmount <= 0) { UI.showToast('请先填写金额'); amountInput.focus(); return; }
    const split = UI.getSplitCount();
    const amount = Math.round((rawAmount / split) * 100) / 100;
    if (!amount || amount <= 0) { UI.showToast('金额太小了'); return; }
    const date = dateInput.dataset.value || Ledger.today();
    const categoryId = UI.selectedCategoryId;
    const month = date.slice(0, 7);
    const beforeSpent = Ledger.byMonth(month).filter(function (r) { return r.categoryId === categoryId; }).reduce(function (s, r) { return s + r.amount; }, 0);
    const note = noteInput.value || '';
    Ledger.add({ amount: amount, categoryId: categoryId, note: note, date: date });
    amountInput.value = '';
    splitInput.value = '';
    noteInput.value = '';
    this.updateAmountPreview();
    if (document.activeElement) document.activeElement.blur();
    if (month !== this.currentMonth) { this.currentMonth = month; this.setMonthButton(month); }
    UI.renderAll(this.currentMonth);
    const tip = split > 1 ? ('已记 ￥' + amount.toFixed(2) + '（' + rawAmount.toFixed(2) + ' ÷ ' + split + '人）') : '记好啦 ✓';
    UI.showToast(tip);
    try { this.checkLimit(categoryId, beforeSpent, beforeSpent + amount); } catch (e) { console.warn(e); }
  },

  checkLimit: function (categoryId, beforeSpent, afterSpent) {
    const cat = Categories.get(categoryId);
    if (!cat.limit || cat.limit <= 0) return;
    const limit = cat.limit;
    const beforeRatio = beforeSpent / limit;
    const afterRatio = afterSpent / limit;
    if (afterRatio >= 1) {
      Modal.alert({ type: 'danger', title: '「' + cat.name + '」已超支', html: '本月已花 <strong>￥' + afterSpent.toFixed(2) + '</strong><br>额度 ￥' + limit.toFixed(2) + '，超出 <strong>￥' + (afterSpent - limit).toFixed(2) + '</strong>', buttonText: '知道了' });
      return;
    }
    if (afterRatio >= 0.5 && beforeRatio < 0.5) {
      Modal.alert({ type: 'warn', title: '「' + cat.name + '」已用一半', html: '本月已花 <strong>￥' + afterSpent.toFixed(2) + '</strong><br>额度 ￥' + limit.toFixed(2) + '，剩 <strong>￥' + (limit - afterSpent).toFixed(2) + '</strong>', buttonText: '知道了' });
    }
  },
};

document.addEventListener('DOMContentLoaded', function () {
  App.init();
});

/* 玻璃模式切换：读取/应用交给 App.initGlassMode / App.applyGlassMode，这里只负责点击 */
(function () {
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.glass-mode__btn');
    if (!btn) return;
    e.preventDefault();
    if (typeof App !== 'undefined' && typeof App.applyGlassMode === 'function') {
      App.applyGlassMode(btn.dataset.mode);
    }
  }, true);
})();

(function () {
  const THRESHOLD = 90;
  const MAX_PULL = 150;
  const DAMP = 0.5;

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
         + '-' + String(d.getDate()).padStart(2, '0');
  }
  function yesterdayStr() {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
         + '-' + String(d.getDate()).padStart(2, '0');
  }

  function readCheckin() {
    let data = { lastDate: '', streak: 0 };
    try { const s = JSON.parse(localStorage.getItem('slh.checkin.v1')); if (s) data = s; } catch (e) {}
    return data;
  }
  function writeCheckin(data) {
    try { localStorage.setItem('slh.checkin.v1', JSON.stringify(data)); } catch (e) {}
  }
  function isCheckedToday() { return readCheckin().lastDate === todayStr(); }
  function currentStreak() {
    const data = readCheckin();
    if (data.lastDate === todayStr() || data.lastDate === yesterdayStr()) return data.streak || 0;
    return 0;
  }

  function getTodayFortune() {
    const today = todayStr();
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem('slh.fortune.v1') || 'null'); } catch (e) {}
    if (stored && stored.date === today && stored.fortune) return stored.fortune;

    const f = (typeof getLuoguFortune === 'function')
      ? getLuoguFortune()
      : { level: '中吉', yi: '记账', yiDesc: '', ji: '乱花', jiDesc: '' };
    try { localStorage.setItem('slh.fortune.v1', JSON.stringify({ date: today, fortune: f })); } catch (e) {}
    return f;
  }

  let pageEl, cardEl, hintEl, hintTextEl;
  let startY = 0, pulling = false, pullDist = 0, usingMouse = false;

  /* 弹窗/面板打开时禁止触发下拉签到 */
  var PULL_BLOCK_SELECTOR = '.tabbar, input, textarea, .quick-actions, .cat-grid, .modal-overlay, .cat-modal-overlay, .sub-modal-overlay, .calendar-panel, .checkin-popup, .toast, .shatter-container';

  function init() {
    pageEl = document.getElementById('page-home');
    cardEl = document.getElementById('checkinCard');
    if (!pageEl || !cardEl) return;

    hintEl = document.getElementById('pullHint');
    if (!hintEl) {
      hintEl = document.createElement('div');
      hintEl.id = 'pullHint';
      hintEl.className = 'pull-hint';
      hintEl.innerHTML = '<span class="pull-hint__arrow">↓</span><span id="pullHintText">下拉抽取今日运势</span>';
      document.body.appendChild(hintEl);
    }
    hintTextEl = document.getElementById('pullHintText');

    // 清理可能残留的抽屉元素
    const oldDrawer = document.getElementById('fortuneDrawer');
    if (oldDrawer) oldDrawer.remove();

    cardEl.style.transition = 'none';
    refreshCard();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { cardEl.style.transition = ''; });
    });

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onEnd);

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function refreshCard() {
    const checked = isCheckedToday();
    const streakEl = document.getElementById('checkinStreak');
    if (streakEl) streakEl.textContent = currentStreak();
    const titleEl = document.getElementById('checkinTitle');
    if (titleEl) titleEl.textContent = '欢迎回来';
    const pullText = document.getElementById('checkinPullText');
    if (pullText) pullText.textContent = '下拉抽取今日运势';
    cardEl.classList.toggle('is-hidden', checked);
  }

  function activeHome() { return pageEl && pageEl.classList.contains('is-active'); }
  function atTop() { return (window.scrollY || document.documentElement.scrollTop || 0) <= 0; }

  function onStart(e) {
    if (!activeHome() || !atTop() || e.touches.length !== 1) return;
    if (e.target.closest(PULL_BLOCK_SELECTOR)) return;
    
    startY = e.touches[0].clientY;
    pulling = true; pullDist = 0; usingMouse = false;
  }

  function onMove(e) {
    if (!pulling || usingMouse) return;
    if (!atTop()) { finishPull(false); return; }
    
    const dist = e.touches[0].clientY - startY;
    if (dist <= 0) { pullDist = 0; resetVisual(); return; }
    if (e.cancelable) e.preventDefault();
    pullDist = dist;
    updateVisual(dist);
  }

  function onEnd() {
    if (!pulling || usingMouse) return;
    finishPull(true);
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    if (e.target.closest('button, a, input, select, textarea, ' + PULL_BLOCK_SELECTOR)) {
      if (pulling) { pulling = false; pullDist = 0; resetVisual(); }
      return;
    }
    if (!activeHome() || !atTop()) return;
    startY = e.clientY;
    pulling = true; pullDist = 0; usingMouse = true;
  }
  function onMouseMove(e) {
    if (!pulling || !usingMouse) return;
    if (!atTop()) { finishPull(false); return; }
    const dist = e.clientY - startY;
    if (dist <= 0) { pullDist = 0; resetVisual(); return; }
    e.preventDefault();
    pullDist = dist;
    updateVisual(dist);
  }
  function onMouseUp() {
    if (!pulling || usingMouse) return;
    finishPull(true);
  }

  function updateVisual(dist) {
    pageEl.style.transition = 'none';
    pageEl.style.transform = 'translateY(' + Math.min(dist * DAMP, MAX_PULL) + 'px)';
    pageEl.classList.add('is-pulling');
    
    if (dist > 8) {
      hintEl.classList.add('is-show');
      if (dist >= THRESHOLD) {
        hintTextEl.textContent = isCheckedToday() ? '松开查看今日运势' : '松开抽取';
        hintEl.classList.add('is-ready');
      } else {
        hintTextEl.textContent = '继续下拉…';
        hintEl.classList.remove('is-ready');
      }
    }
  }

  function resetVisual() {
    pageEl.classList.remove('is-pulling');
    pageEl.style.transition = '';
    pageEl.style.transform = '';
    hintEl.classList.remove('is-show', 'is-ready');
  }

  function finishPull(canTrigger) {
    pulling = false;
    const dist = pullDist;
    pullDist = 0;

    pageEl.classList.remove('is-pulling');
    pageEl.style.transition = '';
    pageEl.style.transform = '';
    hintEl.classList.remove('is-show', 'is-ready');

    if (!canTrigger || dist < THRESHOLD) return;
    if (navigator.vibrate) navigator.vibrate(30);

    if (!isCheckedToday()) doCheckin();
    else showFortune();
  }

  function doCheckin() {
    const data = readCheckin();
    const today = todayStr(), yest = yesterdayStr();
    if (data.lastDate === today) return;
    if (data.lastDate === yest) data.streak = (data.streak || 0) + 1;
    else data.streak = 1;
    data.lastDate = today;
    writeCheckin(data);

    const fortune = getTodayFortune();
    refreshCard();
    showPopup(data.streak, fortune, true);
  }

  function showFortune() {
    const data = readCheckin();
    const streak = (data.lastDate === todayStr()) ? (data.streak || 0) : currentStreak();
    const fortune = getTodayFortune();
    
    cardEl.classList.add('is-hidden');
    showPopup(streak, fortune, false);
  }

  function showPopup(streak, fortune, isNew) {
    let popup = document.getElementById('checkinPopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'checkinPopup';
      popup.className = 'checkin-popup';
      document.body.appendChild(popup);
    }
    popup.innerHTML =
      '<div class="checkin-popup__content">' +
        '<div class="checkin-popup__title">' + (isNew ? '今日运势已抽取' : '今日运势') + '</div>' +
        '<div class="checkin-popup__fortune">§ ' + fortune.level + ' §</div>' +
        '<div class="checkin-popup__row yi"><span>宜：</span><strong>' + fortune.yi + '</strong>' +
          (fortune.yiDesc ? '<br><span style="font-size:12px;font-weight:normal;opacity:.8;margin-left:28px">' + fortune.yiDesc + '</span>' : '') + '</div>' +
        '<div class="checkin-popup__row ji"><span>忌：</span><strong>' + fortune.ji + '</strong>' +
          (fortune.jiDesc ? '<br><span style="font-size:12px;font-weight:normal;opacity:.8;margin-left:28px">' + fortune.jiDesc + '</span>' : '') + '</div>' +
        '<div class="checkin-popup__footer">已连续签到 ' + streak + ' 天' +
          (isNew ? '<br><span style="font-size:12px;font-weight:normal;opacity:.75;">以后下拉页面可再次查看今日运势</span>' : '') +
        '</div>' +
        
        '<div style="display:flex; gap:10px; margin-top:20px;">' +
          '<button class="checkin-popup__close" type="button" id="saveFortuneBtn" style="flex:1; margin-top:0; background:var(--c-surface); color:var(--c-text); border:1px solid var(--c-border);">保存运势</button>' +
          '<button class="checkin-popup__close" type="button" id="checkinPopupClose" style="flex:1; margin-top:0;">收下好运</button>' +
        '</div>' +
      '</div>';

    void popup.offsetWidth;
    popup.classList.add('is-show');
    document.body.style.overflow = 'hidden';

    var closeCheckinPopup = function () {
      popup.classList.remove('is-show');
      document.body.style.overflow = '';
    };

    popup.querySelector('#checkinPopupClose').addEventListener('click', closeCheckinPopup);

    // 保存运势图片逻辑 (高清 + 壁纸适配)
    popup.querySelector('#saveFortuneBtn').addEventListener('click', async function () {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 使用 2 倍分辨率防止模糊
        const dpr = 2; 
        const W = 750, H = 1100;
        canvas.width = W * dpr; 
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        const style = getComputedStyle(document.documentElement);
        const primary = style.getPropertyValue('--c-primary').trim() || '#6667AB';
        const primaryRgb = style.getPropertyValue('--c-primary-rgb').trim() || '110, 92, 150';

        // 1. 绘制背景（优先读取自定义壁纸）
        let bgImg = null;
        const isCustomBgOn = document.documentElement.getAttribute('data-custom-bg') === 'on';
        if (isCustomBgOn) {
          const bgData = localStorage.getItem('slh.customBg.v1');
          if (bgData) {
            bgImg = new Image();
            bgImg.src = bgData;
            await new Promise(r => { bgImg.onload = r; bgImg.onerror = r; });
          }
        }

        if (bgImg) {
          // 【自定义壁纸】：铺满壁纸并压暗
          const scale = Math.max(W / bgImg.width, H / bgImg.height);
          const dw = bgImg.width * scale;
          const dh = bgImg.height * scale;
          ctx.drawImage(bgImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.fillRect(0, 0, W, H);
        } else {
          // 【非自定义壁纸】：极简浅灰底色，不要渐变
          ctx.fillStyle = '#F5F6F8';
          ctx.fillRect(0, 0, W, H);
        }

        // 2. 绘制中央卡片
        const cardW = 600, cardH = 850;
        const cardX = (W - cardW) / 2, cardY = (H - cardH) / 2;
        
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        // 有壁纸时半透明白，无壁纸时纯白
        ctx.fillStyle = bgImg ? 'rgba(255, 255, 255, 0.85)' : '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 40);
        ctx.fill();
        ctx.restore();
        
        if (bgImg) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW, cardH, 40);
          ctx.stroke();
        }

        // 3. 绘制文字
        ctx.textAlign = 'center';
        
        // 标题
        ctx.fillStyle = '#444444';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText('有序星球 · 今日运势', W / 2, cardY + 80);
        
        const d = new Date();
        ctx.fillStyle = '#888888';
        ctx.font = '20px sans-serif';
        ctx.fillText(d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日', W / 2, cardY + 120);

        // 运势大字
        ctx.fillStyle = '#EE5253';
        ctx.font = 'bold 88px sans-serif';
        ctx.fillText('§ ' + fortune.level + ' §', W / 2, cardY + 250);

        // 宜忌背景框
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.roundRect(W / 2 - 220, cardY + 300, 440, 220, 24);
        ctx.fill();

        // 宜
        ctx.textAlign = 'left';
        ctx.fillStyle = '#D94F70';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('宜：', W / 2 - 180, cardY + 360);
        ctx.fillStyle = '#222222';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(fortune.yi, W / 2 - 100, cardY + 360);
        ctx.fillStyle = '#777777';
        ctx.font = '18px sans-serif';
        ctx.fillText(fortune.yiDesc || '运势极佳', W / 2 - 100, cardY + 395);

        // 忌
        ctx.fillStyle = '#5C7A6A';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('忌：', W / 2 - 180, cardY + 465);
        ctx.fillStyle = '#222222';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(fortune.ji, W / 2 - 100, cardY + 465);
        ctx.fillStyle = '#777777';
        ctx.font = '18px sans-serif';
        ctx.fillText(fortune.jiDesc || '小心行事', W / 2 - 100, cardY + 500);

        // 打卡天数
        ctx.textAlign = 'center';
        ctx.fillStyle = '#555555';
        ctx.font = '22px sans-serif';
        ctx.fillText('已连续签到', W / 2, cardY + 610);
        
        ctx.fillStyle = primary;
        ctx.font = 'bold 76px sans-serif';
        ctx.fillText(streak.toString(), W / 2, cardY + 700);
        
        ctx.fillStyle = '#555555';
        ctx.font = '22px sans-serif';
        ctx.fillText('天', W / 2, cardY + 745);

        // 底部水印
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        if (!bgImg) ctx.fillStyle = '#AAAAAA'; // 纯色背景时用灰色
        ctx.font = '18px sans-serif';
        ctx.fillText('—— 有序星球 · 记录每一笔 ——', W / 2, H - 40);

        const base64 = canvas.toDataURL('image/jpeg', 0.95);
        if (window.Android && typeof window.Android.saveImage === 'function') {
          window.Android.saveImage(base64);
        } else {
          const a = document.createElement('a');
          a.href = base64;
          a.download = '有序星球_运势_' + todayStr() + '.jpg';
          a.click();
          UI.showToast('运势图已保存');
        }
      } catch(err) {
        console.error(err);
        UI.showToast('保存失败');
      }
    });

    popup.onclick = function (e) {
      if (e.target === popup) closeCheckinPopup();
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }
})();


/* ==========================================================
   分段选择器 / 图表 Tab：支持苹果式滑动切换
   ========================================================== */
(function () {
  function initSegDrag() {
    const containers = document.querySelectorAll('.seg, .chart-tabs');
    
    containers.forEach(function(container) {
      let isTouching = false;
      let lastTargetBtn = null;

      const handleMove = function (e) {
        if (!isTouching) return;
        const touch = e.touches ? e.touches[0] : e;
        const clientX = touch.clientX;
        const clientY = touch.clientY;
        
        const target = document.elementFromPoint(clientX, clientY);
        if (!target) return;
        
        if (container.contains(target)) {
          const btn = target.closest('.seg__btn, .chart-tab');
          if (btn && btn !== lastTargetBtn && !btn.hidden && !btn.classList.contains('is-active')) {
            lastTargetBtn = btn;
            btn.click();
            if (navigator.vibrate) navigator.vibrate(10);
          }
        }
      };

      const startTouch = function (e) {
        isTouching = true;
        const target = e.target.closest('.seg__btn, .chart-tab');
        if (target) lastTargetBtn = target;
      };

      const endTouch = function () {
        isTouching = false;
        lastTargetBtn = null;
      };

      container.addEventListener('touchstart', startTouch, { passive: true });
      container.addEventListener('touchmove', handleMove, { passive: true });
      container.addEventListener('touchend', endTouch);
      container.addEventListener('touchcancel', endTouch);

      container.addEventListener('mousedown', startTouch);
      container.addEventListener('mousemove', function (e) {
        if (e.buttons === 1) handleMove(e);
      });
      window.addEventListener('mouseup', endTouch);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(initSegDrag, 500); });
  } else {
    setTimeout(initSegDrag, 500);
  }
})();


/* ==========================================================
   🌴 动物岛风格 V10 - 自定义主题防呆提示 (由 fix.py 注入)
   ========================================================== */
(function() {
  // 拦截“自定义”主题按钮的点击
  document.addEventListener('click', function(e) {
    const customBtn = e.target.closest('.theme-item[data-theme="custom"]');
    if (!customBtn) return;

    // 检查本地是否存有背景图
    try {
      const bg = localStorage.getItem('slh.customBg.v1');
      const customTheme = localStorage.getItem('slh.customTheme.v1');
      
      // 如果没有背景图或主题数据，拦截操作并提示
      if (!bg || !customTheme) {
        e.preventDefault();
        e.stopPropagation();
        
        // 使用你项目自带的 UI Toast 组件弹出提示
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
          UI.showToast('请先在下方上传背景图片哦～');
        } else {
          alert('请先在下方上传背景图片哦～');
        }
        return false;
      }
    } catch (err) {
      console.warn('读取自定义主题失败', err);
    }
  }, true); // 使用捕获阶段，确保在原本的点击事件之前执行

  // 拦截“清除背景”按钮
  document.addEventListener('click', function(e) {
    const clearBtn = e.target.closest('#customBgClear');
    if (!clearBtn) return;

    // 延迟一点，等系统自带的清除逻辑跑完，然后再强制切回默认主题
    setTimeout(() => {
      if (typeof App !== 'undefined' && typeof App.applyTheme === 'function') {
        App.applyTheme('greenery', false);
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
          UI.showToast('背景已清除，已切回默认主题');
        }
      }
    }, 100);
  }, false);
})();


/* ==========================================================
   🌴 动物岛风格 - 明细记录长按弹出详情 (注入于 main.js 末尾)
   ========================================================== */
(function() {
  let pressTimer = null;
  let isLongPressTriggered = false;
  const LONG_PRESS_DURATION = 500; // 长按 0.5 秒触发

  // 1. 全局拦截右键/长按菜单，防止干扰
  document.addEventListener('contextmenu', function(e) {
    if (e.target.closest('.record')) {
      e.preventDefault();
    }
  });

  // 2. 开始触摸
  document.addEventListener('touchstart', function(e) {
    const recordEl = e.target.closest('.record');
    if (!recordEl) return;

    // 如果点的是删除按钮（叉号），直接退出，不触发长按
    if (e.target.closest('.record__del')) return;

    isLongPressTriggered = false;
    
    // 添加按压缩放反馈 (果冻感)
    recordEl.style.transform = 'scale(0.96)';
    recordEl.style.transition = 'transform 0.2s';
    
    // 震动反馈（如果手机支持）
    if (navigator.vibrate) navigator.vibrate(20);

    pressTimer = setTimeout(() => {
      // 长按成功
      isLongPressTriggered = true;
      recordEl.style.transform = '';
      showRecordDetail(recordEl);
      
      // 阻止长按后抬手触发的 click 事件（防止误触删除等）
      const stopClick = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        document.removeEventListener('click', stopClick, true);
      };
      document.addEventListener('click', stopClick, true);
      setTimeout(() => document.removeEventListener('click', stopClick, true), 300);
      
    }, LONG_PRESS_DURATION);
  }, { passive: true });

  // 3. 手指移动或抬起时取消长按
  document.addEventListener('touchmove', function(e) {
    const recordEl = e.target.closest('.record');
    if (recordEl) recordEl.style.transform = '';
    
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    const recordEl = e.target.closest('.record');
    if (recordEl) recordEl.style.transform = '';
    
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  });

  // 4. 提取数据并渲染漂亮的海岛风弹窗
  function showRecordDetail(el) {
    const id = el.dataset.id;
    if (!id || typeof Ledger === 'undefined') return;

    const record = Ledger.records.find(r => r.id === id);
    if (!record) return;

    // 判断是收入还是支出
    const isIncome = record.type === 'income';
    const store = isIncome ? IncomeCategories : Categories;
    const cat = store.get(record.categoryId) || { name: '未分类', color: '#A8A2B0' };
    
    // 格式化时间
    const d = new Date(record.createdAt);
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());

    const amountStr = (isIncome ? '+' : '-') + '￥' + record.amount.toFixed(2);
    const amountColor = isIncome ? 'var(--c-success)' : 'var(--c-danger)';

    // 使用内联样式构建弹窗的 HTML（保持海岛风的大圆角和排版）
    const html = `
      <div style="text-align: left; padding: 10px 4px;">
        <!-- 头部：分类和金额 -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px dashed var(--c-border); padding-bottom: 16px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: ${cat.color}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></span>
            <span style="font-size: 18px; font-weight: 800; color: var(--c-text);">${cat.name}</span>
          </div>
          <span style="font-size: 24px; font-weight: 900; color: ${amountColor};">${amountStr}</span>
        </div>

        <!-- 详情列表 -->
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: var(--c-text-sub);">
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; white-space: nowrap; flex: none; width: 70px;">备注说明</span>
            <span style="color: var(--c-text); font-weight: 700; text-align: right; word-break: break-all; flex: 1;">${record.note || '无'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; white-space: nowrap; flex: none; width: 70px;">记账日期</span>
            <span style="color: var(--c-text); font-weight: 700;">${record.date}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; white-space: nowrap; flex: none; width: 70px;">精确时间</span>
            <span style="color: var(--c-text); font-weight: 700;">${timeStr}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600; white-space: nowrap; flex: none; width: 70px;">流水号</span>
            <span style="color: var(--c-text-light); font-size: 12px; user-select: text;">${record.id}</span>
          </div>
        </div>
      </div>
    `;

    // 调用你原有的 Modal 组件
    if (typeof Modal !== 'undefined') {
      Modal.alert({
        type: 'info',
        title: '交易详情',
        html: html,
        buttonText: '关闭'
      });
    }
  }
})();


/* ==========================================================
   🌴 终极修复：彻底禁止长按选中文本和呼出系统菜单
   ========================================================== */
(function() {
  // 1. 用 CSS 给记录卡片上物理锁定
  const style = document.createElement('style');
  style.textContent = `
    .record {
      -webkit-touch-callout: none !important;
      -webkit-user-select: none !important;
      -khtml-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
    }
  `;
  document.head.appendChild(style);

  // 2. 用 JS 强制拦截 touchstart 时的默认行为（双保险）
  document.addEventListener('touchstart', function(e) {
    const recordEl = e.target.closest('.record');
    // 如果长按的是记录卡片，且不是删除按钮，直接掐断默认行为
    if (recordEl && !e.target.closest('.record__del')) {
      // 注意：不能在这里直接 preventDefault，否则会导致页面无法滚动
      // 所以我们在长按计时器触发的那一刻去清除选区
    }
  }, { passive: true });

  // 3. 长按触发时，清除可能已经产生的选区，并阻止后续选择
  document.addEventListener('selectstart', function(e) {
    if (e.target.closest('.record')) {
      e.preventDefault();
    }
  }, { passive: false });

})();


(function() {
  // 移除旧的点击展开逻辑，防止冲突
  if (window._clickExpandInitialized) return;
  window._clickExpandInitialized = true;

  document.addEventListener('click', function(e) {
    if (e.target.closest('.record__del')) return;
    const recordEl = e.target.closest('.record');
    if (!recordEl) return;
    if (e.target.closest('.custom-expand-area')) return;

    let expandArea = recordEl.querySelector('.custom-expand-area');
    
    if (expandArea) {
      expandArea.style.height = expandArea.scrollHeight + 'px';
      requestAnimationFrame(() => {
        expandArea.style.height = '0px';
        expandArea.style.opacity = '0';
        setTimeout(() => expandArea.remove(), 300);
      });
      return;
    }

    document.querySelectorAll('.custom-expand-area').forEach(area => {
      area.style.height = area.scrollHeight + 'px';
      requestAnimationFrame(() => {
        area.style.height = '0px';
        area.style.opacity = '0';
        setTimeout(() => area.remove(), 300);
      });
    });

    const id = recordEl.dataset.id;
    if (!id || typeof Ledger === 'undefined') return;
    const record = Ledger.records.find(r => r.id === id);
    if (!record) return;

    const d = new Date(record.createdAt);
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());

    const area = document.createElement('div');
    area.className = 'custom-expand-area';
    area.style.cssText = `
      width: 100%;
      height: 0;
      opacity: 0;
      overflow: hidden;
      transition: height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
      border-top: 1.5px dashed var(--c-border);
      margin-top: 12px;
      padding-top: 12px;
      font-size: 13px;
      color: var(--c-text-sub);
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    // 修复的核心点：左侧加 white-space: nowrap; 右侧加 word-break
    area.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <span style="font-weight: 600; white-space: nowrap; flex: none; width: 70px;">完整备注</span>
        <span style="color: var(--c-text); font-weight: 700; text-align: right; word-break: break-all; line-height: 1.4;">${record.note || '无'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
        <span style="font-weight: 600; white-space: nowrap; flex: none;">精确时间</span>
        <span style="color: var(--c-text); font-weight: 700;">${timeStr}</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
        <span style="font-weight: 600; white-space: nowrap; flex: none;">流水号</span>
        <span style="color: var(--c-text-light); font-size: 11px; word-break: break-all; text-align: right;">${record.id}</span>
      </div>
    `;

    recordEl.style.flexWrap = 'wrap';
    recordEl.appendChild(area);

    requestAnimationFrame(() => {
      area.style.height = area.scrollHeight + 'px';
      area.style.opacity = '1';
    });

    e.stopPropagation();
  });
})();

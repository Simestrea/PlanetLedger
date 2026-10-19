/**
 * 非侵入式分类选择器 V3
 * 颜色优先读 option 的 data-color，回退到 Categories。
 */
(function () {
  function init() {
    const fakeBtn = document.getElementById('statCatFakeBtn');
    const fakeLabel = document.getElementById('statCatFakeLabel');
    const nativeSelect = document.getElementById('statCatSelect');

    if (!fakeBtn || !fakeLabel || !nativeSelect) {
      console.warn('[CatPicker] 找不到必要的 DOM 元素');
      return;
    }

    nativeSelect.addEventListener('change', updateLabel);

    function updateLabel() {
      const selectedOpt = nativeSelect.options[nativeSelect.selectedIndex];
      let text = selectedOpt ? selectedOpt.textContent : '全部';
      if (text.indexOf('全部') === 0) text = '全部';
      fakeLabel.textContent = text;
    }

    fakeBtn.addEventListener('click', function () { openModal(); });

    setTimeout(updateLabel, 200);

    function openModal() {
      let overlay = document.getElementById('catModalOverlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'catModalOverlay';
        overlay.className = 'cat-modal-overlay';
        document.body.appendChild(overlay);
      }

      let html = '';
      const currentVal = nativeSelect.value;
      const options = nativeSelect.querySelectorAll('option');

      options.forEach(function (opt) {
        const id = opt.value;
        let name = opt.textContent;
        if (name.indexOf('全部') === 0) name = '全部';
        const active = currentVal === id ? ' is-active' : '';

        let color = opt.dataset.color || '';
        if (!color && id && typeof Categories !== 'undefined' && Categories.get) {
          const cat = Categories.get(id);
          if (cat) color = cat.color;
        }
        if (!color) color = 'var(--c-text-light)';

        html += '<button class="cat-modal__item' + active + '" data-id="' + id + '" type="button">' +
                '<span class="cat-modal__dot" style="background:' + color + '"></span>' +
                '<span>' + name + '</span></button>';
      });

      overlay.innerHTML =
        '<div class="cat-modal">' +
          '<div class="cat-modal__header">选择分类</div>' +
          '<div class="cat-modal__list">' + html + '</div>' +
        '</div>';

      void overlay.offsetWidth;
      overlay.classList.add('is-show');

      const close = function () { overlay.classList.remove('is-show'); };

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });

      overlay.querySelectorAll('.cat-modal__item').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const id = this.dataset.id;
          nativeSelect.value = id;
          nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
          updateLabel();
          close();
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(init, 300);
    });
  } else {
    setTimeout(init, 300);
  }
})();

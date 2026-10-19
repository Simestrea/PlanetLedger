/**
 * 终极键盘与焦点管理 (精准狙击热区)
 */
(function() {
    const isInput = (el) => {
        return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
    };

    // 1. 获得焦点 / 键盘弹起
    document.addEventListener('focusin', function(e) {
        if (isInput(e.target)) {
            document.body.classList.add('keyboard-open');
        }
    });

    // 2. 失去焦点 / 键盘收起
    document.addEventListener('focusout', function(e) {
        if (isInput(e.target)) {
            setTimeout(() => {
                if (!isInput(document.activeElement)) {
                    document.body.classList.remove('keyboard-open');
                }
            }, 100);
        }
    });

    // 3. 绝杀：捕获阶段拦截，只有点到真正的 <input> 才允许聚焦！
    const forceBlurCapture = function(e) {
        const active = document.activeElement;
        if (isInput(active)) {
            const target = e.target;
            
            // 🚨 重点：如果点击的是 label，直接掐断它的默认聚焦行为
            if (target.closest('label')) {
                e.preventDefault();
            }
            
            // 判断当前点击的是不是真正的输入控件
            const isInputItself = target.tagName === 'INPUT' || 
                                  target.tagName === 'TEXTAREA' || 
                                  target.tagName === 'SELECT';
            
            // 只要点的不是 input 本身，立刻剥夺焦点！
            if (!isInputItself) {
                active.blur();
            }
        }
    };

    // 使用 capture: true 确保在事件到达目标元素之前就执行拦截
    // passive: false 允许我们阻止 label 的默认事件
    document.addEventListener('pointerdown', forceBlurCapture, { capture: true, passive: false });
    document.addEventListener('touchstart', forceBlurCapture, { capture: true, passive: false });
    
})();

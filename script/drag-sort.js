/**
 * 终极防抖丝滑拖拽引擎 (解决边界疯狂横跳)
 */
(function() {
    function initDragSort() {
        const configs = [
            { 
                containerId: 'catGrid', 
                itemSelector: '.cat:not(.cat--add)', 
                dataKey: 'data-cat', 
                type: 'category',
                store: () => typeof Categories !== 'undefined' ? Categories : null,
                render: () => typeof UI !== 'undefined' && UI.renderCategories()
            },
            { 
                containerId: 'incomeCatGrid', 
                itemSelector: '.cat:not(.cat--add)', 
                dataKey: 'data-cat', 
                type: 'incomeCategory',
                store: () => typeof IncomeCategories !== 'undefined' ? IncomeCategories : null,
                render: () => typeof UI !== 'undefined' && UI.renderIncomeCategories()
            },
            { 
                containerId: 'quickActions', 
                itemSelector: '.quick-chip:not(.quick-chip--add)', 
                dataKey: 'data-qid', 
                type: 'quick',
                store: () => typeof App !== 'undefined' ? App.quickTemplates : null,
                render: () => typeof App !== 'undefined' && App.renderQuickActions()
            }
        ];

        configs.forEach(conf => {
            const container = document.getElementById(conf.containerId);
            if (!container) return;

            let pressTimer = null;
            let isDragging = false;
            let startX, startY;
            let dragEl = null;
            let ghostEl = null;

            const getItems = () => Array.from(container.querySelectorAll(conf.itemSelector));

            const onTouchStart = (e) => {
                const item = e.target.closest(conf.itemSelector);
                if (!item) return;

                dragEl = item;
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                isDragging = false;

                pressTimer = setTimeout(() => {
                    isDragging = true;
                    if (navigator.vibrate) navigator.vibrate(30);

                    const rect = item.getBoundingClientRect();
                    ghostEl = item.cloneNode(true);
                    
                    const computedStyle = window.getComputedStyle(item);
                    ghostEl.style.cssText = `
                        position: fixed;
                        left: ${rect.left}px;
                        top: ${rect.top}px;
                        width: ${rect.width}px;
                        height: ${rect.height}px;
                        z-index: 9999;
                        pointer-events: none;
                        opacity: 0.95;
                        transform: scale(1.08);
                        box-shadow: 0 12px 32px rgba(0,0,0,0.25);
                        border-radius: ${computedStyle.borderRadius};
                        background: var(--c-card);
                        border: 2px solid var(--c-primary);
                        transition: transform 0.1s;
                        
                        /* 核心修复：继承原有的内部排版 */
                        display: ${computedStyle.display};
                        align-items: ${computedStyle.alignItems};
                        justify-content: ${computedStyle.justifyContent};
                        gap: ${computedStyle.gap};
                        padding: ${computedStyle.padding};
                        box-sizing: border-box;
                        white-space: nowrap;
                        font-size: ${computedStyle.fontSize};
                        line-height: ${computedStyle.lineHeight};
                        color: ${computedStyle.color};
                    `;
                    document.body.appendChild(ghostEl);
                    
                    item.style.opacity = '0.15';
                    item.style.width = rect.width + 'px';
                    item.style.height = rect.height + 'px';
                    item.style.boxSizing = 'border-box'; 
                }, 300);
            };

            const onTouchMove = (e) => {
                if (!isDragging) {
                    if (pressTimer) {
                        const touch = e.touches[0];
                        const dx = touch.clientX - startX;
                        const dy = touch.clientY - startY;
                        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                            clearTimeout(pressTimer);
                            pressTimer = null;
                        }
                    }
                    return;
                }

                e.preventDefault(); 
                const touch = e.touches[0];

                if (ghostEl) {
                    ghostEl.style.left = (touch.clientX - ghostEl.offsetWidth / 2) + 'px';
                    ghostEl.style.top = (touch.clientY - ghostEl.offsetHeight / 2) + 'px';
                }

                const items = getItems().filter(el => el !== dragEl);
                let closest = null;
                let minDist = Infinity;

                // 找最近的元素
                items.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const dist = Math.hypot(touch.clientX - cx, touch.clientY - cy);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = el;
                    }
                });

                if (closest) {
                    const rect = closest.getBoundingClientRect();
                    const containerStyle = window.getComputedStyle(container);
                    const isGrid = containerStyle.display.includes('grid');
                    
                    let insertBefore = false;

                    // 智能判断：如果是网格布局，依靠横向和纵向的绝对中心距离；如果是横排，依靠X轴
                    if (isGrid) {
                        const cx = rect.left + rect.width / 2;
                        const cy = rect.top + rect.height / 2;
                        
                        // 防止在中心点附近疯狂横跳，加一个 10px 的缓冲死区
                        if (Math.abs(touch.clientY - cy) > 10) {
                            insertBefore = touch.clientY < cy;
                        } else {
                            insertBefore = touch.clientX < cx;
                        }
                    } else {
                        // Flex Row (比如速记胶囊)
                        insertBefore = touch.clientX < rect.left + rect.width / 2;
                    }

                    const children = Array.from(container.children);
                    const dragIndex = children.indexOf(dragEl);
                    const closestIndex = children.indexOf(closest);

                    let shouldMove = false;

                    // 核心防抖：只有当确实跨越了前后顺序时，才去操作 DOM
                    if (insertBefore) {
                        if (dragIndex > closestIndex) shouldMove = true;
                    } else {
                        if (dragIndex < closestIndex) shouldMove = true;
                    }

                    if (shouldMove) {
                        // --- 核心：FLIP 动画计算 ---
                        const firstRects = new Map();
                        Array.from(container.children).forEach(el => {
                            if (el === ghostEl) return;
                            firstRects.set(el, el.getBoundingClientRect());
                        });

                        if (insertBefore) {
                            container.insertBefore(dragEl, closest);
                        } else {
                            container.insertBefore(dragEl, closest.nextSibling);
                        }

                        // 平滑滑动回位
                        Array.from(container.children).forEach(el => {
                            if (el === dragEl) return;
                            const first = firstRects.get(el);
                            if (!first) return;
                            const last = el.getBoundingClientRect();

                            const dx = first.left - last.left;
                            const dy = first.top - last.top;

                            if (dx !== 0 || dy !== 0) {
                                el.style.transition = 'none';
                                el.style.transform = `translate(${dx}px, ${dy}px)`;
                                
                                requestAnimationFrame(() => {
                                    el.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)';
                                    el.style.transform = '';
                                });
                            }
                        });
                    }
                }
            };

            const onTouchEnd = () => {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }

                if (isDragging) {
                    isDragging = false;
                    if (ghostEl && ghostEl.parentNode) {
                        ghostEl.parentNode.removeChild(ghostEl);
                        ghostEl = null;
                    }
                    if (dragEl) {
                        dragEl.style.opacity = '';
                        saveNewOrder(conf, container, getItems());
                    }
                    dragEl = null;

                    const stopClick = (evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                        document.removeEventListener('click', stopClick, true);
                    };
                    document.addEventListener('click', stopClick, true);
                    setTimeout(() => document.removeEventListener('click', stopClick, true), 200);
                }
                dragEl = null;
            };

            container.addEventListener('touchstart', onTouchStart, { passive: true });
            container.addEventListener('touchmove', onTouchMove, { passive: false });
            container.addEventListener('touchend', onTouchEnd);
            container.addEventListener('touchcancel', onTouchEnd);
        });
    }

    function saveNewOrder(conf, container, items) {
        const newOrderIds = items.map(el => el.getAttribute(conf.dataKey));
        const store = conf.store();
        if (!store) return;

        let newList = [];
        if (conf.type === 'quick') {
            newOrderIds.forEach(id => {
                const item = store.find(t => t.id === id);
                if (item) newList.push(item);
            });
            store.forEach(t => {
                if (!newOrderIds.includes(t.id)) newList.push(t);
            });
            App.quickTemplates = newList;
            Storage.write('slh.quickTemplates.v1', App.quickTemplates);
        } else {
            newOrderIds.forEach(id => {
                const item = store.list.find(c => c.id === id);
                if (item) newList.push(item);
            });
            store.list.forEach(c => {
                if (!newOrderIds.includes(c.id)) newList.push(c);
            });
            store.list = newList;
            store.save();
        }

        conf.render();
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('顺序已更新');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(initDragSort, 300));
    } else {
        setTimeout(initDragSort, 300);
    }
})();

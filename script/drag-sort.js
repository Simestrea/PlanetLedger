/**
 * 丝滑拖拽引擎 v4 — 性能重写
 *
 * 关键优化：
 *   1. 拖动开始时一次性缓存所有元素 rect / 布局模式 / ghost 尺寸
 *   2. 移动过程中只读缓存，零 getBoundingClientRect / getComputedStyle
 *   3. Ghost 用 transform: translate3d 走 GPU
 *   4. touchmove 用 requestAnimationFrame 节流
 *   5. 排序插入后才重建缓存（因为这时位置真的变了）
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

            /* ---------- 状态 ---------- */
            let pressTimer = null;
            let isDragging = false;
            let startX = 0, startY = 0;
            let latestX = 0, latestY = 0;
            let dragEl = null;
            let ghostEl = null;
            let grabOffsetX = 0, grabOffsetY = 0;
            let ghostW = 0, ghostH = 0;

            // 缓存
            let cachedItems = null;        // 除 dragEl 外的所有元素
            let cachedRects = null;        // Map<el, DOMRect>
            let isGridLayout = false;      // 布局模式

            // 事件引用
            let docMoveHandler = null;
            let docEndHandler = null;

            // rAF 节流
            let rafId = 0;

            const LONG_PRESS_MS = 220;
            const MOVE_TOLERANCE = 10;

            /* ---------- 滚动锁 ---------- */
            const lockScroll = () => {
                document.body.style.overflow = 'hidden';
                document.body.style.overscrollBehavior = 'none';
                document.documentElement.style.overscrollBehavior = 'none';
            };
            const unlockScroll = () => {
                document.body.style.overflow = '';
                document.body.style.overscrollBehavior = '';
                document.documentElement.style.overscrollBehavior = '';
            };

            /* ---------- 缓存重建 ---------- */
            const rebuildCache = () => {
                cachedItems = [];
                cachedRects = new Map();
                const all = container.children;
                for (let i = 0; i < all.length; i++) {
                    const el = all[i];
                    if (el === dragEl) continue;
                    if (!el.matches || !el.matches(conf.itemSelector)) continue;
                    cachedItems.push(el);
                    cachedRects.set(el, el.getBoundingClientRect());
                }
            };

            /* ---------- 开始拖拽 ---------- */
            const beginDrag = () => {
                if (!dragEl || !dragEl.parentNode) return;

                const rect = dragEl.getBoundingClientRect();
                ghostW = rect.width;
                ghostH = rect.height;
                grabOffsetX = latestX - (rect.left + rect.width / 2);
                grabOffsetY = latestY - (rect.top + rect.height / 2);

                const cs = getComputedStyle(dragEl);

                ghostEl = dragEl.cloneNode(true);
                ghostEl.style.cssText =
                    'position:fixed;' +
                    'left:0;' +
                    'top:0;' +
                    'width:' + ghostW + 'px;' +
                    'height:' + ghostH + 'px;' +
                    'z-index:9999;' +
                    'pointer-events:none;' +
                    'opacity:0.95;' +
                    'will-change:transform;' +
                    '-webkit-backface-visibility:hidden;' +
                    'backface-visibility:hidden;' +
                    'transform:translate3d(' + rect.left + 'px,' + rect.top + 'px,0) scale(1.08);' +
                    'box-shadow:0 12px 32px rgba(0,0,0,0.25);' +
                    'border-radius:' + cs.borderRadius + ';' +
                    'background:var(--c-card);' +
                    'border:2px solid var(--c-primary);' +
                    'box-sizing:border-box;' +
                    'white-space:nowrap;' +
                    'overflow:hidden;' +
                    'display:' + cs.display + ';' +
                    'align-items:' + cs.alignItems + ';' +
                    'justify-content:' + cs.justifyContent + ';' +
                    'gap:' + cs.gap + ';' +
                    'padding:' + cs.padding + ';' +
                    'font-size:' + cs.fontSize + ';' +
                    'line-height:' + cs.lineHeight + ';' +
                    'color:' + cs.color + ';';

                document.body.appendChild(ghostEl);

                dragEl.style.opacity = '0.15';
                dragEl.style.width = ghostW + 'px';
                dragEl.style.height = ghostH + 'px';
                dragEl.style.boxSizing = 'border-box';

                isDragging = true;
                window._isSortDragging = true;
                if (navigator.vibrate) navigator.vibrate(30);

                // 布局模式只算一次
                isGridLayout = getComputedStyle(container).display.indexOf('grid') >= 0;

                // 缓存所有位置
                rebuildCache();

                lockScroll();

                docMoveHandler = function(evt) {
                    if (!isDragging) return;
                    if (evt.cancelable) evt.preventDefault();
                    if (evt.touches && evt.touches.length > 0) {
                        latestX = evt.touches[0].clientX;
                        latestY = evt.touches[0].clientY;
                        if (!rafId) {
                            rafId = requestAnimationFrame(function() {
                                rafId = 0;
                                handleMove();
                            });
                        }
                    }
                };
                docEndHandler = function() { endDrag(); };

                document.addEventListener('touchmove', docMoveHandler, { passive: false });
                document.addEventListener('touchend', docEndHandler);
                document.addEventListener('touchcancel', docEndHandler);
            };

            /* ---------- 核心移动 ---------- */
            const handleMove = () => {
                if (!ghostEl) return;

                // 1) Ghost 用 transform 移动（GPU，不触发 layout）
                const gx = latestX - grabOffsetX - ghostW / 2;
                const gy = latestY - grabOffsetY - ghostH / 2;
                ghostEl.style.transform =
                    'translate3d(' + gx + 'px,' + gy + 'px,0) scale(1.08)';

                // 2) 找最近元素（用缓存，不读 DOM）
                if (!cachedItems || cachedItems.length === 0) return;

                let closest = null;
                let minDist = Infinity;
                for (let i = 0; i < cachedItems.length; i++) {
                    const el = cachedItems[i];
                    const r = cachedRects.get(el);
                    if (!r) continue;
                    const ecx = r.left + r.width / 2;
                    const ecy = r.top + r.height / 2;
                    const ddx = latestX - ecx;
                    const ddy = latestY - ecy;
                    const dist = ddx * ddx + ddy * ddy;
                    if (dist < minDist) {
                        minDist = dist;
                        closest = el;
                    }
                }
                if (!closest) return;

                // 3) 判断插前还是插后
                const cr = cachedRects.get(closest);
                let insertBefore;
                if (isGridLayout) {
                    const ecy = cr.top + cr.height / 2;
                    const ecx = cr.left + cr.width / 2;
                    if (Math.abs(latestY - ecy) > 10) {
                        insertBefore = latestY < ecy;
                    } else {
                        insertBefore = latestX < ecx;
                    }
                } else {
                    insertBefore = latestX < cr.left + cr.width / 2;
                }

                // 4) 位置没变就跳过（省一次 FLIP）
                const children = container.children;
                const dragIndex = Array.prototype.indexOf.call(children, dragEl);
                const closestIndex = Array.prototype.indexOf.call(children, closest);

                let shouldMove = false;
                if (insertBefore) {
                    if (dragIndex > closestIndex) shouldMove = true;
                } else {
                    if (dragIndex < closestIndex) shouldMove = true;
                }
                if (!shouldMove) return;

                // 5) FLIP
                const firstRects = new Map();
                for (let i = 0; i < children.length; i++) {
                    const el = children[i];
                    if (el === dragEl || el === ghostEl) continue;
                    firstRects.set(el, el.getBoundingClientRect());
                }

                if (insertBefore) {
                    container.insertBefore(dragEl, closest);
                } else {
                    container.insertBefore(dragEl, closest.nextSibling);
                }

                for (let i = 0; i < container.children.length; i++) {
                    const el = container.children[i];
                    if (el === dragEl) continue;
                    const first = firstRects.get(el);
                    if (!first) continue;
                    const last = el.getBoundingClientRect();
                    const dx = first.left - last.left;
                    const dy = first.top - last.top;
                    if (dx !== 0 || dy !== 0) {
                        el.style.transition = 'none';
                        el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
                        requestAnimationFrame((function(target) {
                            return function() {
                                target.style.transition = 'transform 0.22s cubic-bezier(0.2,0.8,0.2,1)';
                                target.style.transform = '';
                            };
                        })(el));
                    }
                }

                // 6) DOM 变了，重建缓存
                rebuildCache();
            };

            /* ---------- 结束 ---------- */
            const endDrag = () => {
                if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
                if (!isDragging) return;

                isDragging = false;
                window._isSortDragging = false;

                if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }

                if (docMoveHandler) {
                    document.removeEventListener('touchmove', docMoveHandler);
                    docMoveHandler = null;
                }
                if (docEndHandler) {
                    document.removeEventListener('touchend', docEndHandler);
                    document.removeEventListener('touchcancel', docEndHandler);
                    docEndHandler = null;
                }

                unlockScroll();

                if (ghostEl && ghostEl.parentNode) {
                    ghostEl.parentNode.removeChild(ghostEl);
                    ghostEl = null;
                }
                if (dragEl) {
                    dragEl.style.opacity = '';
                    dragEl.style.width = '';
                    dragEl.style.height = '';
                    dragEl.style.boxSizing = '';
                    saveNewOrder(conf, container);
                }
                dragEl = null;
                cachedItems = null;
                cachedRects = null;

                const stopClick = function(evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    document.removeEventListener('click', stopClick, true);
                };
                document.addEventListener('click', stopClick, true);
                setTimeout(function() {
                    document.removeEventListener('click', stopClick, true);
                }, 200);
            };

            /* ---------- 触摸 ---------- */
            const onTouchStart = (e) => {
                const item = e.target.closest(conf.itemSelector);
                if (!item) return;
                if (e.touches.length !== 1) return;

                dragEl = item;
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                latestX = touch.clientX;
                latestY = touch.clientY;
                isDragging = false;

                pressTimer = setTimeout(() => {
                    pressTimer = null;
                    beginDrag();
                }, LONG_PRESS_MS);
            };

            const onTouchMove = (e) => {
                if (isDragging) return;
                if (!pressTimer) return;
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                if (Math.abs(dx) > MOVE_TOLERANCE || Math.abs(dy) > MOVE_TOLERANCE) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                } else {
                    latestX = touch.clientX;
                    latestY = touch.clientY;
                }
            };

            const onTouchEnd = () => {
                if (isDragging) return;
                if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
                dragEl = null;
            };

            container.addEventListener('touchstart', onTouchStart, { passive: false });
            container.addEventListener('touchmove', onTouchMove, { passive: true });
            container.addEventListener('touchend', onTouchEnd);
            container.addEventListener('touchcancel', onTouchEnd);
        });
    }

    function saveNewOrder(conf, container) {
        const items = Array.from(container.children).filter(function(el) {
            return el.matches && el.matches(conf.itemSelector);
        });
        const newOrderIds = items.map(el => el.getAttribute(conf.dataKey));
        const store = conf.store();
        if (!store) return;

        let newList = [];
        if (conf.type === 'quick') {
            newOrderIds.forEach(function(id) {
                const item = store.find(t => t.id === id);
                if (item) newList.push(item);
            });
            store.forEach(function(t) {
                if (!newOrderIds.includes(t.id)) newList.push(t);
            });
            App.quickTemplates = newList;
            Storage.write('slh.quickTemplates.v1', App.quickTemplates);
        } else {
            newOrderIds.forEach(function(id) {
                const item = store.list.find(c => c.id === id);
                if (item) newList.push(item);
            });
            store.list.forEach(function(c) {
                if (!newOrderIds.includes(c.id)) newList.push(c);
            });
            store.list = newList;
            store.save();
        }

        conf.render();
        if (typeof UI !== 'undefined' && UI.showToast) UI.showToast('顺序已更新');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(initDragSort, 300); });
    } else {
        setTimeout(initDragSort, 300);
    }
})();

// Shared shell controls. Native links and the complete static content remain the fallback.
document.addEventListener('DOMContentLoaded', () => {
  const screen = document.getElementById('game-screen');
  if (!screen) return;
  const locationLabel = document.getElementById('screen-location');
  const page = location.pathname.split('/').pop() || 'index.html';
  const labels = { 'index.html': 'Miguel’s iPod', 'projects.html': 'Projects', 'blog.html': 'Field notes', 'school.html': 'Coursework', 'gallery.html': 'Pixel lab', 'webinfo.html': 'About', '404.html': 'Not found' };
  if (locationLabel) locationLabel.textContent = labels[page] || 'Miguel’s iPod';
  let selected = null;
  const items = () => [...screen.querySelectorAll('main a[href], main button:not(:disabled), main input:not(:disabled)')].filter(item => !item.closest('[hidden], [aria-hidden="true"], [inert]'));
  const choose = (item, scroll = true) => {
    screen.querySelectorAll('.game-selected').forEach(node => node.classList.remove('game-selected'));
    selected = item || null;
    if (!selected) return;
    selected.classList.add('game-selected');
    window.dispatchEvent(new CustomEvent('portfolio:selectionchange', { detail: { item: selected } }));
    if (scroll) {
      // Scroll only the display. scrollIntoView would also move the mobile document.
      const rect = selected.getBoundingClientRect();
      const scroller = selected.closest('.browser-menu') || screen;
      const bounds = scroller.getBoundingClientRect();
      const scale = bounds.height / scroller.offsetHeight || 1;
      const header = scroller === screen ? screen.querySelector('.screen-header')?.offsetHeight || 0 : 0;
      if (rect.bottom > bounds.bottom) scroller.scrollTop += (rect.bottom - bounds.bottom) / scale + 4;
      if (rect.top < bounds.top + header * scale) scroller.scrollTop -= (bounds.top + header * scale - rect.top) / scale + 4;
    }
  };
  const reset = () => { const list = items(); choose(list.find(item => item.closest('.game-menu')) || list[0], false); screen.scrollTop = 0; screen.querySelectorAll('.browser-menu').forEach(menu => { menu.scrollTop = 0; }); };
  const move = delta => {
    const list = items();
    if (!list.length) { screen.scrollTop += delta * 65; return; }
    const index = list.indexOf(selected);
    choose(list[(index + delta + list.length) % list.length]);
  };
  const back = () => {
    if (typeof window.portfolioBack === 'function') window.portfolioBack();
    else location.href = '/index.html';
  };
  const activate = () => {
    if (!items().includes(selected)) choose(items()[0], false);
    if (selected?.matches('input')) selected.focus();
    else selected?.click();
  };
  const act = control => {
    if (control === 'up') move(-1);
    if (control === 'down' || control === 'select') move(1);
    if (control === 'left' || control === 'back') back();
    if (control === 'right' || control === 'accept') activate();
  };
  document.querySelectorAll('[data-control]').forEach(button => button.addEventListener('click', () => act(button.dataset.control)));
  screen.addEventListener('focusin', event => { if (items().includes(event.target)) choose(event.target, false); });
  screen.addEventListener('click', event => { const item = event.target.closest('a, button, input'); if (items().includes(item)) choose(item, false); });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches?.('input, textarea, select, [contenteditable="true"]')) return;
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest?.('a, button')) return;
    const mapping = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'back', ArrowRight: 'accept', Enter: 'accept', Escape: 'back' };
    const control = mapping[event.key];
    if (!control) return;
    event.preventDefault(); act(control);
  });
  // Wheel pointer capture is deliberately local: page and screen gestures remain native.
  const wheel = document.getElementById('click-wheel');
  if (wheel) {
    let gesture = null;
    let suppressClickUntil = 0;
    const position = event => {
      const bounds = wheel.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) / Math.max(bounds.width, 1);
      const y = (event.clientY - bounds.top - bounds.height / 2) / Math.max(bounds.height, 1);
      return { angle: Math.atan2(y, x), radius: Math.hypot(x, y) };
    };
    const finish = event => {
      if (!gesture || event.pointerId !== gesture.id) return;
      const id = gesture.id;
      const tappedControl = event.type === 'pointerup' && gesture.travel <= .11 ? gesture.control : null;
      if (gesture.travel > .11 || tappedControl) suppressClickUntil = performance.now() + 450;
      gesture = null;
      wheel.classList.remove('dragging');
      try { if (wheel.hasPointerCapture(id)) wheel.releasePointerCapture(id); } catch { /* Safari may already have released a suspended touch. */ }
      if (tappedControl) act(tappedControl);
    };
    wheel.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || gesture || event.target.closest('.wheel-center')) return;
      const point = position(event);
      if (point.radius < .21 || point.radius > .56) return;
      gesture = { id: event.pointerId, angle: point.angle, accumulated: 0, travel: 0, control: event.target.closest('[data-control]')?.dataset.control };
      try { wheel.setPointerCapture(event.pointerId); } catch { gesture = null; return; }
      wheel.classList.add('dragging');
    });
    wheel.addEventListener('pointermove', event => {
      if (!gesture || event.pointerId !== gesture.id) return;
      if (event.cancelable) event.preventDefault();
      const point = position(event);
      // Crossing the center or leaving the ring must not turn into a large angular jump.
      if (point.radius < .21 || point.radius > .65) {
        gesture.angle = null;
        gesture.accumulated = 0;
        gesture.travel = Math.max(gesture.travel, .12);
        return;
      }
      const next = point.angle;
      if (gesture.angle === null) { gesture.angle = next; return; }
      let difference = next - gesture.angle;
      if (difference > Math.PI) difference -= Math.PI * 2;
      if (difference < -Math.PI) difference += Math.PI * 2;
      gesture.angle = next;
      gesture.accumulated += difference;
      gesture.travel += Math.abs(difference);
      const tick = Math.PI / 12;
      while (Math.abs(gesture.accumulated) >= tick) {
        const direction = Math.sign(gesture.accumulated);
        move(direction);
        gesture.accumulated -= direction * tick;
      }
    }, { passive: false });
    wheel.addEventListener('pointerup', finish);
    wheel.addEventListener('pointercancel', finish);
    wheel.addEventListener('lostpointercapture', finish);
    const cancel = () => { if (gesture) finish({ type: 'pointercancel', pointerId: gesture.id }); };
    window.addEventListener('blur', cancel);
    window.addEventListener('pagehide', cancel);
    window.addEventListener('orientationchange', cancel);
    window.addEventListener('portfolio:viewchange', cancel);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
    wheel.addEventListener('contextmenu', event => event.preventDefault());
    wheel.addEventListener('click', event => {
      if ((event.detail !== 0 || event.pointerType === 'touch') && performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
    wheel.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) + Math.abs(event.deltaX) < 1) return;
      event.preventDefault(); move(Math.sign(event.deltaY || event.deltaX));
    }, { passive: false });
  }
  window.addEventListener('portfolio:viewchange', reset);
  reset();
});

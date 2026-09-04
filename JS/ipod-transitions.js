// Short horizontal pushes reproduce the Classic's menu navigation.
(() => {
  let active = [];
  let ghost = null;
  window.ipodTransition = (update, direction = 1) => {
    const screen = document.getElementById('game-screen');
    const main = document.getElementById('main');
    active.forEach(animation => animation.cancel()); active = [];
    ghost?.remove(); ghost = null;
    if (!screen || !main || !main.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      update(); return;
    }
    const scroll = screen.scrollTop;
    const previous = main.cloneNode(true);
    previous.removeAttribute('id');
    previous.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    previous.querySelectorAll('a, button, input').forEach(node => node.setAttribute('tabindex', '-1'));
    const headerHeight = screen.querySelector('.screen-header')?.offsetHeight || 0;
    const overlay = document.createElement('div');
    overlay.className = 'screen-transition-overlay';
    overlay.setAttribute('aria-hidden', 'true'); overlay.inert = true;
    previous.style.position = 'absolute'; previous.style.top = -scroll + 'px';
    previous.style.width = '100%'; overlay.append(previous);
    update();
    overlay.style.top = (screen.scrollTop + headerHeight) + 'px';
    overlay.style.height = Math.max(screen.clientHeight - headerHeight, 0) + 'px';
    screen.append(overlay); ghost = overlay;
    const options = { duration: 240, easing: 'cubic-bezier(.25,.7,.25,1)', fill: 'none' };
    const incoming = main.animate([{ transform: `translateX(${direction * 100}%)` }, { transform: 'translateX(0)' }], options);
    const outgoing = previous.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-direction * 100}%)` }], options);
    active = [incoming, outgoing];
    Promise.allSettled(active.map(animation => animation.finished)).then(() => {
      overlay.remove();
      if (ghost === overlay) { ghost = null; active = []; }
    });
  };
  document.addEventListener('DOMContentLoaded', () => {
    const main = document.getElementById('main');
    if (!main?.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    main.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
  });
})();

/* Fixed-height list rows; data indices remain stable for selection and dragging. */
const VirtualList = {
  mount(list, scroller, items, createRow, isDragging = () => false) {
    const step = 60;
    let frame = null;
    let lastStart = -1;
    let lastEnd = -1;
    const render = () => {
      frame = null;
      if (isDragging()) return;
      const visible = Math.max(1, Math.ceil((scroller.clientHeight || 600) / step));
      const start = Math.min(Math.max(0, items.length - visible), Math.max(0, Math.floor(scroller.scrollTop / step) - 15));
      const end = Math.min(items.length, start + visible + 30);
      if (start === lastStart && end === lastEnd) return;
      lastStart = start; lastEnd = end;
      const fragment = document.createDocumentFragment();
      const spacer = height => {
        const li = document.createElement('li');
        li.style.height = `${height}px`; li.style.pointerEvents = 'none';
        li.setAttribute('aria-hidden', 'true'); return li;
      };
      fragment.appendChild(spacer(start * step));
      for (let i = start; i < end; i++) fragment.appendChild(createRow(items[i], i));
      fragment.appendChild(spacer((items.length - end) * step));
      list.replaceChildren(fragment);
    };
    const schedule = () => { if (frame === null) frame = requestAnimationFrame(render); };
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    scroller.addEventListener('dragend', schedule);
    render();
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', schedule);
      scroller.removeEventListener('dragend', schedule);
      window.removeEventListener('resize', schedule);
    };
  }
};

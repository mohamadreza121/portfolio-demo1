export function centerCarouselItem(viewport, item, behavior) {
  const viewportRect = viewport.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  viewport.scrollTo({
    left: viewport.scrollLeft + itemRect.left - viewportRect.left
      + (itemRect.width - viewport.clientWidth) / 2,
    behavior,
  });
}

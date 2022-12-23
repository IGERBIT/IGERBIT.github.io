export function isVisibleInViewport(el, partiallyVisible = false) {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    if (partiallyVisible) {
        return ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
            ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth));
    }
    return top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
}
export function elementFromHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
}
export function elementFromTemplate(html, args) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const element = div.firstElementChild;
    for (const key in args) {
        element.setAttribute(key, args[key]);
    }
    return element;
}
//# sourceMappingURL=utils.js.map
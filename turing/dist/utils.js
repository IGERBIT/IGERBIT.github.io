define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.elementFromTemplate = exports.elementFromHtml = exports.isVisibleInViewport = void 0;
    function isVisibleInViewport(el, partiallyVisible = false) {
        const { top, left, bottom, right } = el.getBoundingClientRect();
        const { innerHeight, innerWidth } = window;
        if (partiallyVisible) {
            return ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
                ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth));
        }
        return top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
    }
    exports.isVisibleInViewport = isVisibleInViewport;
    function elementFromHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.firstElementChild;
    }
    exports.elementFromHtml = elementFromHtml;
    function elementFromTemplate(html, args) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const element = div.firstElementChild;
        for (const key in args) {
            element.setAttribute(key, args[key]);
        }
        return element;
    }
    exports.elementFromTemplate = elementFromTemplate;
});
//# sourceMappingURL=utils.js.map
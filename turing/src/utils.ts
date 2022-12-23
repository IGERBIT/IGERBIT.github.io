export function isVisibleInViewport(el: HTMLElement, partiallyVisible = false) {
	const { top, left, bottom, right } = el.getBoundingClientRect();
	const { innerHeight, innerWidth } = window;

	if (partiallyVisible) {
		return ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
			((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
	}

	return top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
}

export function elementFromHtml<TE extends HTMLElement>(html: string) {
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.firstElementChild as TE;
}

export function elementFromTemplate<TE extends HTMLElement>(html: string, args: Record<string,string>) {
	const div = document.createElement('div');
	div.innerHTML = html;
	const element = div.firstElementChild as TE;
	for (const key in args) {
		element.setAttribute(key, args[key]);
	}
	return element;
}

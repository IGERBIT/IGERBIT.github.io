import { TuringMachine } from "./turingMachine";
import './style.scss'


function isElementVisibleInViewport(el: HTMLElement, partiallyVisible = false) {
	const { top, left, bottom, right } = el.getBoundingClientRect();
	const { innerHeight, innerWidth } = window;

	if (partiallyVisible) { 
		return ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
			((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
	}
		

	return top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
}


const turing = new TuringMachine();

function createEmptyCell(): HTMLDivElement {
	const cell = document.createElement("div");
	cell.classList.add("cell");
	cell.innerText = " ";
	return cell;
}

// fill line with empty cells while they are visible
function fillLine(line: HTMLDivElement, cells: HTMLDivElement[]): void {

	

	while (isElementVisibleInViewport(line.lastElementChild as HTMLElement)) {
		const cell = createEmptyCell();
		line.appendChild(cell);
		cells.push(cell);
	}
}


	
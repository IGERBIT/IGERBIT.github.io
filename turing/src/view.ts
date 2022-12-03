import { TuringMachine } from "./turingMachine";
import { isVisibleInViewport } from "./utils";

type UpdateValueEvent = (index: number, value: string) => void;

export interface Context {
	leftLine: HTMLDivElement;
	rightLine: HTMLDivElement;
	pointer: HTMLDivElement;
	leftCells: Cell[];
	rightCells: Cell[];
	pointerCell: Cell;

	moveRightBtn: HTMLButtonElement;
	moveLeftBtn: HTMLButtonElement;
	resetBtn: HTMLButtonElement;
	stepBtn: HTMLButtonElement;
	runBtn: HTMLButtonElement;
}

class Cell {
	private _index: number;
	private _value: string;
	private _element: HTMLDivElement;
	private _input: HTMLInputElement;

	private _updateValue: UpdateValueEvent = null;

	constructor(index: number, value: string) {
		this._index = index;
		this._value = value;
		this._element = document.createElement("div");
		this._element.classList.add("cell");
		this._element.dataset.index = index.toString();
		this._input = document.createElement("input");
		this._input.classList.add("cell-input");
		this._input.value = value;
		this._input.addEventListener("input", (e) => {
			let newValue = this._input.value;
			if (newValue.length > 1) {
				newValue = newValue[0];
			}
			this.value = newValue;
		});
		this._element.addEventListener("click", () => {
			this._input.focus();
		});
		this._element.appendChild(this._input);
	}

	public get index(): number {
		return this._index;
	}

	public set index(value: number) {
		this._index = value;
	}

	public get value(): string {
		return this._value;
	}

	public set value(value: string) {
		this._value = value ? value[0] : "";
		this._input.value = value;

		if (value !== this._value && this._updateValue) {
			this._updateValue(this._index, this._value);
		}
	}

	public get element(): HTMLDivElement {
		return this._element;
	}

	public setUpdateValueHandler(event: UpdateValueEvent) {
		this._updateValue = event;
	}

	public disableInput(value: boolean) {
		this._input.disabled = value;
	}
}

export class TuringMachineView {
	private _machine: TuringMachine;
	private _context: Context;

	constructor(machine: TuringMachine) {
		this._machine = machine;
		this._context = this.createContext();
	}

	public run(): void { 
		this.createContext();

		this.fillUpLeft();
		this.fillUpRight();
		this.createPointerCell();

		this.forceUpdateResetAndValues();
	}

	

	private createPointerCell(): void {
		if (this._context.pointerCell) return;
		let cell = this._context.pointerCell = new Cell(0, "");

		cell.setUpdateValueHandler(this.onUserUpdateCell.bind(this));
		this._context.pointer.appendChild(cell.element);

	}

	private setupEvents(): void {
		this._machine.finishEvent = this.onFinish.bind(this);
		this._machine.leftShiftEvent = this.onLeftShift.bind(this);
		this._machine.rightShiftEvent = this.onRightShift.bind(this);
		this._machine.updateCellEvent = this.onMachineUpdateCell.bind(this);
		this._machine.updateStateEvent = this.onUpdateState.bind(this);

	}

	private setupButtons(): void {
		const { runBtn, stepBtn, resetBtn, moveLeftBtn, moveRightBtn } = this._context;

		moveLeftBtn.addEventListener("click", () => {
			
		});
	}

	private fillUpLeft(): void {
		let leftLine = this._context.leftLine;
		let list = this._context.leftCells;
		let machineLine = this._machine.actualLine;
		let index = -list.length - 1;

		while ((list.length == 0) || isVisibleInViewport(list.at(-1).element)) {
			let value = machineLine.getCell(index);
			const cell = new Cell(index, value);
			cell.setUpdateValueHandler(this.onUserUpdateCell.bind(this));
			leftLine.appendChild(cell.element);
			list.push(cell);
			index--;
		}
	}

	private fillUpRight(): void {
		let rightLine = this._context.rightLine;
		let list = this._context.rightCells;
		let machineLine = this._machine.actualLine;
		let index = list.length + 1;

		while ((list.length == 0) || isVisibleInViewport(list.at(-1).element)) {
			let value = machineLine.getCell(index);
			const cell = new Cell(index, value);
			cell.setUpdateValueHandler(this.onUserUpdateCell.bind(this));
			rightLine.appendChild(cell.element);
			list.push(cell);
			index++;
		}
	}


	private createContext(): Context {
		const leftLine = document.getElementById('left-line') as HTMLDivElement;
		const rightLine = document.getElementById('right-line') as HTMLDivElement;
		const pointer = document.getElementById('pointer') as HTMLDivElement;

		const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
		const stepBtn = document.getElementById('step-btn') as HTMLButtonElement;
		const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;

		const moveLeftBtn = document.getElementById('move-left-btn') as HTMLButtonElement;
		const moveRightBtn = document.getElementById('move-right-btn') as HTMLButtonElement;

		return {
			leftLine,
			rightLine,
			pointer,
			leftCells: [],
			rightCells: [],
			pointerCell: null,

			runBtn,
			stepBtn,
			resetBtn,
			moveLeftBtn,
			moveRightBtn,
		};
	}

	private forceUpdateCells(): void {
		let machineLine = this._machine.actualLine;
		const { leftCells, pointerCell, rightCells } = this._context

		for (const cell of leftCells) {
			cell.value = machineLine.getCell(cell.index);
		}

		for (const cell of rightCells) {
			cell.value = machineLine.getCell(cell.index);
		}

		pointerCell.value = machineLine.getCell(pointerCell.index);
	}

	private forceUpdateResetAndValues(): void {
		let machineLine = this._machine.actualLine;
		const { leftCells, pointerCell, rightCells } = this._context

		let i = -1;
		for (const cell of leftCells) {
			cell.index = i--;
			cell.value = machineLine.getCell(cell.index);
		}

		i = 1;
		for (const cell of rightCells) {
			cell.index = i++;
			cell.value = machineLine.getCell(cell.index);
		}

		pointerCell.index = 0;
		pointerCell.value = machineLine.getCell(pointerCell.index);
	}

	private onUserUpdateCell(index: number, value: string): void {
		this._machine.actualLine.setCell(index, value);
	}

	private onFinish(): void {

	}

	private onLeftShift(): void {

	}

	private onRightShift(): void {

	}

	private onUpdateState(state: string): void {

	}

	private onMachineUpdateCell(index: number): void {

	}
}
import { DIRECTION, Rule, TuringMachine } from "./turingMachine";
import { isVisibleInViewport } from "./utils";

type UpdateValueEvent = (index: number, value: string) => void;

const DIRECTION2TEXT: Record<number, string> = {
	[DIRECTION.LEFT]: "Влево",
	[DIRECTION.RIGHT]: "Вправо",
	[DIRECTION.STAY]: "Нет",
}

export interface Context {
	leftLine: HTMLDivElement;
	rightLine: HTMLDivElement;
	pointer: HTMLDivElement;
	currentState: HTMLInputElement;
	leftCells: Cell[];
	rightCells: Cell[];
	pointerCell: Cell;

	rules: RuleView[];

	moveRightBtn: HTMLButtonElement;
	moveLeftBtn: HTMLButtonElement;
	resetBtn: HTMLButtonElement;
	stepBtn: HTMLButtonElement;
	runBtn: HTMLButtonElement;
	
	word: HTMLInputElement;
	writeWordBtn: HTMLButtonElement;
	clearLineBtn: HTMLButtonElement;

	newRuleState: HTMLInputElement;
	newRuleSymbol: HTMLInputElement;
	newRuleNewSymbol: HTMLInputElement;
	newRuleMove: HTMLSelectElement;
	newRuleNewState: HTMLInputElement;
	addRuleBtn: HTMLButtonElement;

	rulesTable: HTMLTableSectionElement;
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

class RuleView {
	private _rule: Rule;
	private _element: HTMLTableRowElement;

	private _state: HTMLTableCellElement;
	private _symbol: HTMLTableCellElement;
	private _newSymbol: HTMLTableCellElement;
	private _move: HTMLTableCellElement;
	private _newState: HTMLTableCellElement;
	private _deleteBtn: HTMLButtonElement;

	private _deleteHandler: (rule: Rule) => void = null;
	private _editHandler: (rule: Rule) => void = null;
	
	
	public get element() {
		return this._element;
	};

	private createRuleRow() {
		this._element = document.createElement("tr");
		this._state = document.createElement("td");
		this._symbol = document.createElement("td");
		this._newSymbol = document.createElement("td");
		this._move = document.createElement("td");
		this._newState = document.createElement("td");
		const deleteBtnCell = document.createElement("td");
		this._deleteBtn = document.createElement("button");
		this._deleteBtn.classList.add("delete-rule-btn");
		this._deleteBtn.textContent = "Удалить";
		this._deleteBtn.addEventListener("click", () => this._deleteHandler && this._deleteHandler(this._rule));
		deleteBtnCell.appendChild(this._deleteBtn);
		
		this._element.appendChild(this._state);
		this._element.appendChild(this._symbol);
		this._element.appendChild(this._newState);
		this._element.appendChild(this._newSymbol);
		this._element.appendChild(this._move);
		this._element.appendChild(deleteBtnCell);

		this._element.addEventListener("click", () => this._editHandler && this._editHandler(this._rule));

	}

	constructor(rule: Rule) {	
		this.createRuleRow();

		this.rule = rule;
	}

	
	public get rule(): Rule {
		return this._rule;
	}

	public set rule(value: Rule) {
		this._rule = value;
	
		this._state.textContent = value.state;
		this._symbol.textContent = value.cellValue;
		this._newSymbol.textContent = value.move.write ?? "";
		this._move.textContent = DIRECTION2TEXT[value.move.direction ?? DIRECTION.STAY];
		this._newState.textContent = value.move.state ?? "";
	}

	public setDeleteHandler(handler: (rule: Rule) => void) {
		this._deleteHandler = handler;
	}

	public setEditHandler(handler: (rule: Rule) => void) {
		this._editHandler = handler;
	}

}

export class TuringMachineView {
	private _machine: TuringMachine;
	private _context: Context;

	private _runInterval: number = null;

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

		this.setupEvents();
		this.setupButtons();

		this.initBinaryIncrement();
	}

	public initBinaryIncrement() {
		let rules = [
			{ state: "q0", cellValue: "0", move: { direction: DIRECTION.RIGHT } },
			{ state: "q0", cellValue: "1", move: { direction: DIRECTION.RIGHT } },
			{ state: "q0", cellValue: "", move: { direction: DIRECTION.LEFT, state: "q1" } },
			{ state: "q1", cellValue: "0", move: { direction: DIRECTION.LEFT, state: "q2", write: "1" } },
			{ state: "q1", cellValue: "1", move: { direction: DIRECTION.LEFT, state: "q1", write: "0" } },
			{ state: "q1", cellValue: "", move: { direction: DIRECTION.RIGHT, state: "!", write: "1" } },
			{ state: "q2", cellValue: "0", move: { direction: DIRECTION.LEFT, } },
			{ state: "q2", cellValue: "1", move: { direction: DIRECTION.LEFT, } },
			{ state: "q2", cellValue: "", move: { direction: DIRECTION.RIGHT, state: "!" } },
		];

		rules.forEach(rule => this._machine.addRule(rule));
		rules.forEach(rule => this.updateOrAddRule(rule));
		this._machine.actualState = "q0";
		this._machine.line.writeLine("1010011");
		this._context.currentState.value = this._machine.actualState;
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
		const { runBtn, stepBtn, resetBtn, moveLeftBtn, moveRightBtn, writeWordBtn, clearLineBtn, addRuleBtn, currentState } = this._context;

		moveLeftBtn.addEventListener("click", this.onLeftShiftClicked.bind(this));
		moveRightBtn.addEventListener("click", this.onRightShiftClicked.bind(this));
		resetBtn.addEventListener("click", this.onResetClicked.bind(this));
		stepBtn.addEventListener("click", this.onStepClicked.bind(this));
		runBtn.addEventListener("click", this.onRunClicked.bind(this));
		writeWordBtn.addEventListener("click", this.onWriteWordClicked.bind(this));
		clearLineBtn.addEventListener("click", this.onClearLineClicked.bind(this));
		addRuleBtn.addEventListener("click", this.onAddRuleClicked.bind(this));

		currentState.addEventListener("input", this.onCurrentStateChanged.bind(this));

	}

	//#region UI Handlers
	private onLeftShiftClicked(event: MouseEvent) {
		this._machine.actualCell--;
		this.forceUpdateResetAndValues();
	}

	private onRightShiftClicked(event: MouseEvent) {
		this._machine.actualCell++;
		this.forceUpdateResetAndValues();
	}

	private onResetClicked(event: MouseEvent) {
		this._machine.reset();
		this.forceUpdateResetAndValues();
	}

	private onStepClicked(event: MouseEvent) {
		this._machine.makeStep();
	}

	private onRunClicked(event: MouseEvent) {
		if(this._runInterval) {
			this.stopMachine();
		} else {
			this.startMachine();
		}
	}
	
	private onWriteWordClicked(event: MouseEvent) {
		if(this._runInterval) return;
		this._machine.line.writeLine(this._context.word.value, this._machine.actualCell);
		this.forceUpdateCells();
	}
	
	private onClearLineClicked(event: MouseEvent) {
		if(this._runInterval) return;
		this._machine.line.clear();
		this.forceUpdateCells();
	}
	
	private onAddRuleClicked(event: MouseEvent) {

		let state = this._context.newRuleState.value;
		if (!state) return;
		let symbol = this._context.newRuleSymbol.value;
		
		symbol = symbol || "";

		let newState = this._context.newRuleNewState.value;
		let newSymbol = this._context.newRuleNewSymbol.value;


		const value2direction: Record<string, number> = {
			"stay": DIRECTION.STAY,
			"left": DIRECTION.LEFT,
			"right": DIRECTION.RIGHT
		}

		let rule = {
			state: state,
			cellValue: symbol,
			move: {
				direction: value2direction[this._context.newRuleMove.value] ?? DIRECTION.STAY,
				state: newState || null,
				write: newSymbol || null
			}
		}

		this._machine.addRule(rule);

		this.updateOrAddRule(rule);
	}

	private updateOrAddRule(rule: Rule) {
		let ruleView = this._context.rules.find(r => r.rule.state == rule.state && r.rule.cellValue == rule.cellValue);
		if (ruleView) {
			ruleView.rule = rule;
		} else {
			ruleView = new RuleView(rule);
			ruleView.setDeleteHandler(this.onDeleteRule.bind(this));
			ruleView.setEditHandler(this.onUpdateRule.bind(this));
			this._context.rules.push(ruleView);
			this._context.rulesTable.appendChild(ruleView.element);
		}
	}

	private onDeleteRule(rule: Rule) {

		this._machine.removeRule(rule.state, rule.cellValue);
		let ruleView = this._context.rules.find(r => r.rule.state == rule.state && r.rule.cellValue == rule.cellValue);
		if (ruleView) {
			this._context.rulesTable.removeChild(ruleView.element);
			this._context.rules = this._context.rules.filter(r => r != ruleView);
		}
	}

	private onUpdateRule(rule: Rule) {

		this._context.newRuleState.value = rule.state;
		this._context.newRuleSymbol.value = rule.cellValue || "";
		this._context.newRuleNewState.value = rule.move.state || "";
		this._context.newRuleNewSymbol.value = rule.move.write || "";
		this._context.newRuleMove.value = rule.move.direction == DIRECTION.LEFT ? "left" : rule.move.direction == DIRECTION.RIGHT ? "right" : "stay";
	}
	
	private onCurrentStateChanged(event: Event) {
		if (this._runInterval) return;
		this._machine.actualState = this._context.currentState.value;
	}
	//#endregion


	private startMachine(): void { 
		if (this._runInterval) return;
		
		this._runInterval = setInterval(() => {
			this._machine.makeStep();

			if (this._machine.finished) this.stopMachine();

		}, 50) as any;

		
		this._context.currentState.disabled = true;
		this._context.runBtn.textContent = "Стоп";
		this._context.runBtn.classList.remove("bg-green");
		this._context.runBtn.classList.add("bg-red");
			
	}

	private stopMachine(): void { 
		clearInterval(this._runInterval);
		this._runInterval = null;

		this._context.currentState.disabled = false;
		this._context.runBtn.textContent = "Старт";
		this._context.runBtn.classList.remove("bg-red");
		this._context.runBtn.classList.add("bg-green");
	}


	private fillUpLeft(): void {
		let leftLine = this._context.leftLine;
		let list = this._context.leftCells;
		let machineLine = this._machine.line;
		let index = -list.length - 1;
		while (((list.length == 0) || isVisibleInViewport(list.at(-1).element))) {
			let value = machineLine.getCell(index);
			const cell = new Cell(index, value);
			cell.setUpdateValueHandler(this.onUserUpdateCell.bind(this));
			leftLine.insertBefore(cell.element, leftLine.firstChild)
			list.push(cell); 
			index--;
		}
	}

	private fillUpRight(): void {
		let rightLine = this._context.rightLine;
		let list = this._context.rightCells;
		let machineLine = this._machine.line;
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
		return {
			leftLine: document.getElementById('left-line') as HTMLDivElement,
			rightLine: document.getElementById('right-line') as HTMLDivElement, 
			pointer: document.getElementById('pointer') as HTMLDivElement,
			currentState: document.getElementById('current-state') as HTMLInputElement,
			leftCells: [],
			rightCells: [],
			pointerCell: null,
			rules: [],

			runBtn: document.getElementById('run-btn') as HTMLButtonElement,
			stepBtn: document.getElementById('step-btn') as HTMLButtonElement,
			resetBtn: document.getElementById('reset-btn') as HTMLButtonElement,
			moveLeftBtn: document.getElementById('move-left-btn') as HTMLButtonElement,
			moveRightBtn: document.getElementById('move-right-btn') as HTMLButtonElement,

			word: document.getElementById('word-to-write') as HTMLInputElement,
			writeWordBtn: document.getElementById('write-word') as HTMLButtonElement,
			clearLineBtn: document.getElementById('clear-line') as HTMLButtonElement,

			newRuleState: document.getElementById('new-rule-state') as HTMLInputElement,
			newRuleSymbol: document.getElementById('new-rule-symbol') as HTMLInputElement,
			newRuleNewSymbol: document.getElementById('new-rule-new-symbol') as HTMLInputElement,
			newRuleMove: document.getElementById('new-rule-direction') as HTMLSelectElement,
			newRuleNewState: document.getElementById('new-rule-new-state') as HTMLInputElement,

			addRuleBtn: document.getElementById('add-rule-btn') as HTMLButtonElement,
			rulesTable: document.getElementById('rules-list') as HTMLTableSectionElement,
		};
	}

	private forceUpdateCells(): void {
		let machineLine = this._machine.line;
		const { leftCells, pointerCell, rightCells } = this._context


		for (const cell of leftCells) {
			cell.value = machineLine.getCell(cell.index);
		}

		for (const cell of rightCells) {
			cell.value = machineLine.getCell(cell.index);
		}

		pointerCell.value = machineLine.getCell(pointerCell.index);
	}

	private forceUpdateCell(index: number): void {
		let machineLine = this._machine.line;
		const { leftCells, pointerCell, rightCells } = this._context

		var cell = [...leftCells, pointerCell, ...rightCells].find(cell => cell.index == index);

		if (cell == null) return;

		cell.value = machineLine.getCell(cell.index);
	}

	private forceUpdateResetAndValues(): void {
		let machineLine = this._machine.line;
		const { leftCells, pointerCell, rightCells } = this._context

		pointerCell.index = this._machine.actualCell;
		pointerCell.value = machineLine.getCell(pointerCell.index);

		let i = -1;
		for (const cell of leftCells) {
			cell.index = pointerCell.index + i--;
			cell.value = machineLine.getCell(cell.index);
		}

		i = 1;
		for (const cell of rightCells) {
			cell.index = pointerCell.index + i++;
			cell.value = machineLine.getCell(cell.index);
		}
	}



	private onUserUpdateCell(index: number, value: string): void {
		if(this._runInterval != null) return;
		this._machine.line.setCell(index, value);
	}

	private onFinish(): void {
		
	}

	private onLeftShift(): void {
		this.forceUpdateResetAndValues();
	}

	private onRightShift(): void {
		this.forceUpdateResetAndValues();
	}

	private onUpdateState(state: string): void {
		this._context.currentState.value = state;
	}

	private onMachineUpdateCell(index: number): void {
		this.forceUpdateCell(index);
	}
}

export interface Rule {
	state: string;
	cellValue: string;
	move: Move;
}

export interface Move {
	direction?: number;
	state?: string;
	write?: string;
	done?: boolean;
}

export const DIRECTION = {
	LEFT: -1,
	RIGHT: 1,
	STAY: 0,
};

export class InfinityLine {
	private _leftCells: string[] = [];
	private _rightCells: string[] = [];

	public getCell(index: number, defaultValue: string = ""): string {
		if (index < 0) {
			index = -index + 1;
			return this._leftCells[index] ?? defaultValue;
		}
		else {
			return this._rightCells[index] ?? defaultValue;
		}
	}

	public setCell(index: number, value: string): void {
		if (index < 0) {
			index = -index + 1;
			this._leftCells[index] = value[0];
		}
		else {
			this._rightCells[index] = value[0];
		}
	}

	public clear(): void {
		this._leftCells = [];
		this._rightCells = [];
	}

	public writeLine(line: string, startIndex: number = 0): void {
		for (let i = 0; i < line.length; i++) {
			this.setCell(startIndex + i, line[i]);
		}
	}

	public duplicate(): InfinityLine {
		const line = new InfinityLine();
		line._leftCells = [...this._leftCells];
		line._rightCells = [...this._rightCells];
		return line;
	}
}


type AddRuleResult = "added" | "updated";

export class TuringMachine {
	private _startState: string= "";
	private _startLine: InfinityLine = new InfinityLine();
	private _startCell: number = 0;
	private _rules: Rule[] = [];

	private _currentState: string;
	private _currentCell: number;
	private _line: InfinityLine;
	private _step: number;
	private _finished: boolean;

	public leftShiftEvent: () => void;
	public rightShiftEvent: () => void;
	public finishEvent: () => void;
	public updateCellEvent: (cell: number) => void;
	public updateStateEvent: (value: string) => void;

	constructor() {
		this.reset();
	}

	public get actualState(): string {
		return this._currentState;
	}

	public set actualState(value: string) {
		this._currentState = value;
	}

	public get actualCell(): number {
		return this._currentCell;
	}

	public set actualCell(value: number) {
		this._currentCell = value;
	}

	public get line(): InfinityLine {
		return this._line;
	}

	public get step(): number {
		return this._step;
	}

	public get finished(): boolean {
		return this._currentState === "!";
	}

	public getMove(state: string, cellValue: string): Move {
		return this._rules.find(rule => rule.state === state && rule.cellValue === cellValue)?.move ?? null;
	}

	public reset(): void {
		this._currentState = this._startState;
		this._currentCell = this._startCell;
		this._line = this._startLine.duplicate();
		this._step = 0;
		this._finished = false;
		if (this.updateStateEvent) this.updateStateEvent(this._currentState);
	}

	public makeStep(): void {
		if (this.finished) {
			return;
		}

		if (this._step === 0) { 
			this._startLine = this._line.duplicate();
			this._startState = this._currentState;
			this._startCell = this._currentCell;
		}

		const cellValue = this._line.getCell(this._currentCell, "");
		const move = this.getMove(this._currentState, cellValue);

		if (!move || move.done) {
			if (this.finishEvent) this.finishEvent();
			this._currentState = "!";
			if (this.updateStateEvent) this.updateStateEvent(this._currentState);
		}
		else {
			if (move.write) {
				this._line.setCell(this._currentCell, move.write);
				if (this.updateCellEvent) this.updateCellEvent(this._currentCell);
			}

			if (move.direction) {
				this._currentCell += move.direction;
				if (move.direction < 0 && this.leftShiftEvent) this.leftShiftEvent();
				if (move.direction > 0 && this.rightShiftEvent) this.rightShiftEvent();
			}

			if (move.state) {
				this._currentState = move.state;
				if (this.updateStateEvent) this.updateStateEvent(this._currentState);
			}
		}

		this._step++;
	}


	public addRule(rule: Rule): AddRuleResult {
		var existingRule = this._rules.find(r => r.state === rule.state && r.cellValue === rule.cellValue);
		if (!existingRule) {
			this._rules.push(rule);
			return "added";
		}
		else {
			existingRule.move = rule.move;
			return "updated";
		}
	}

	public removeRule(state: string, cellValue: string): boolean {
		const index = this._rules.findIndex(rule => rule.state === state && rule.cellValue === cellValue);
		if (index === -1) {
			return false;
		}
		else {
			this._rules.splice(index, 1);
			return true;
		}
	}

	public getAllRules(): Rule[] {
		return [...this._rules];
	}

}

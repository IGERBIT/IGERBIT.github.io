
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

export class InfinityLine {
	private _leftCells: number[] = [];
	private _rightCells: number[] = [];

	public getCell(index: number): number {
		if (index < 0) {
			index = -index + 1;
			return this._leftCells[index] ?? NaN;
		}
		else {
			return this._rightCells[index] ?? NaN;
		}
	}

	public setCell(index: number, value: number): void {
		if (index < 0) {
			index = -index + 1;
			this._leftCells[index] = value;
		}
		else {
			this._rightCells[index] = value;
		}
	}

	public clear(): void {
		this._leftCells = [];
		this._rightCells = [];
	}

	public writeLine(line: number[], startIndex: number = 0): void {
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

export class TuringMachine {
	private _startState: string= "";
	private _startLine: InfinityLine = new InfinityLine();
	private _rules: Rule[] = [];

	private _currentState: string;
	private _currentCell: number;
	private _line: InfinityLine;
	private _step: number;
	private _finished: boolean;

	public get actualState(): string {
		return this._currentState;
	}

	public get startState(): string {
		return this._startState;
	}

	public set startState(state: string) {
		this._startState = state;
	}

	public get actualCell(): number {
		return this._currentCell;
	}

	public get actualLine(): InfinityLine {
		return this._line;
	}


	constructor() {
		this.reset();
	}

	public getMove(state: string, cellValue: string): Move {
		return this._rules.find(rule => rule.state === state && rule.cellValue === cellValue)?.move ?? {};
	}

	public reset(): void {
		this._currentState = this._startState;
		this._currentCell = 0;
		this._line = this._startLine.duplicate();
		this._step = 0;
		this._finished = false;
	}

	public makeStep(): void {
		if (this._finished) {
			return;
		}

		if (this._step === 0) { 
			this._startLine = this._line.duplicate();
		}

		const cellValue = String.fromCharCode(this._line.getCell(this._currentCell));
		const move = this.getMove(this._currentState, cellValue);

		if (move.done) {
			this._finished = true;
		}
		else {
			this._line.setCell(this._currentCell, move.write.charCodeAt(0));
			this._currentCell += move.direction;
			this._currentState = move.state;
		}

		this._step++;
	}


	public addRule(rule: Rule): void {
		var existingRule = this._rules.find(r => r.state === rule.state && r.cellValue === rule.cellValue);
		if (!existingRule) {
			this._rules.push(rule);
		}
		else {
			existingRule.move = rule.move;
		}
	}

	public removeRule(state: string, cellValue: string): void {
		this._rules = this._rules.filter(rule => rule.state !== state || rule.cellValue !== cellValue);
	}

	public getAllRules(): Rule[] {
		return [...this._rules];
	}

}

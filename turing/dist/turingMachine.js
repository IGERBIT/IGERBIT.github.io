define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TuringMachine = exports.InfinityLine = exports.DIRECTION = void 0;
    exports.DIRECTION = {
        LEFT: -1,
        RIGHT: 1,
        STAY: 0,
    };
    class InfinityLine {
        constructor() {
            this._leftCells = [];
            this._rightCells = [];
        }
        getCell(index, defaultValue = "") {
            var _a, _b;
            if (index < 0) {
                index = -index + 1;
                return (_a = this._leftCells[index]) !== null && _a !== void 0 ? _a : defaultValue;
            }
            else {
                return (_b = this._rightCells[index]) !== null && _b !== void 0 ? _b : defaultValue;
            }
        }
        setCell(index, value) {
            if (index < 0) {
                index = -index + 1;
                this._leftCells[index] = value[0];
            }
            else {
                this._rightCells[index] = value[0];
            }
        }
        clear() {
            this._leftCells = [];
            this._rightCells = [];
        }
        writeLine(line, startIndex = 0) {
            for (let i = 0; i < line.length; i++) {
                this.setCell(startIndex + i, line[i]);
            }
        }
        duplicate() {
            const line = new InfinityLine();
            line._leftCells = [...this._leftCells];
            line._rightCells = [...this._rightCells];
            return line;
        }
    }
    exports.InfinityLine = InfinityLine;
    class TuringMachine {
        constructor() {
            this._startState = "";
            this._startLine = new InfinityLine();
            this._startCell = 0;
            this._rules = [];
            this.reset();
        }
        get actualState() {
            return this._currentState;
        }
        set actualState(value) {
            this._currentState = value;
        }
        get actualCell() {
            return this._currentCell;
        }
        set actualCell(value) {
            this._currentCell = value;
        }
        get line() {
            return this._line;
        }
        get step() {
            return this._step;
        }
        get finished() {
            return this._currentState === "!";
        }
        getMove(state, cellValue) {
            var _a, _b;
            return (_b = (_a = this._rules.find(rule => rule.state === state && rule.cellValue === cellValue)) === null || _a === void 0 ? void 0 : _a.move) !== null && _b !== void 0 ? _b : null;
        }
        reset() {
            this._currentState = this._startState;
            this._currentCell = this._startCell;
            this._line = this._startLine.duplicate();
            this._step = 0;
            this._finished = false;
            if (this.updateStateEvent)
                this.updateStateEvent(this._currentState);
        }
        makeStep() {
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
                if (this.finishEvent)
                    this.finishEvent();
                this._currentState = "!";
                if (this.updateStateEvent)
                    this.updateStateEvent(this._currentState);
            }
            else {
                if (move.write) {
                    this._line.setCell(this._currentCell, move.write);
                    if (this.updateCellEvent)
                        this.updateCellEvent(this._currentCell);
                }
                if (move.direction) {
                    this._currentCell += move.direction;
                    if (move.direction < 0 && this.leftShiftEvent)
                        this.leftShiftEvent();
                    if (move.direction > 0 && this.rightShiftEvent)
                        this.rightShiftEvent();
                }
                if (move.state) {
                    this._currentState = move.state;
                    if (this.updateStateEvent)
                        this.updateStateEvent(this._currentState);
                }
            }
            this._step++;
        }
        addRule(rule) {
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
        removeRule(state, cellValue) {
            const index = this._rules.findIndex(rule => rule.state === state && rule.cellValue === cellValue);
            if (index === -1) {
                return false;
            }
            else {
                this._rules.splice(index, 1);
                return true;
            }
        }
        getAllRules() {
            return [...this._rules];
        }
    }
    exports.TuringMachine = TuringMachine;
});
//# sourceMappingURL=turingMachine.js.map
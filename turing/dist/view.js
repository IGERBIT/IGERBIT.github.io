define(["require", "exports", "./turingMachine", "./utils"], function (require, exports, turingMachine_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TuringMachineView = void 0;
    const DIRECTION2TEXT = {
        [turingMachine_1.DIRECTION.LEFT]: "Влево",
        [turingMachine_1.DIRECTION.RIGHT]: "Вправо",
        [turingMachine_1.DIRECTION.STAY]: "Нет",
    };
    class Cell {
        constructor(index, value) {
            this._updateValue = null;
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
        get index() {
            return this._index;
        }
        set index(value) {
            this._index = value;
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value ? value[0] : "";
            this._input.value = value;
            if (value !== this._value && this._updateValue) {
                this._updateValue(this._index, this._value);
            }
        }
        get element() {
            return this._element;
        }
        setUpdateValueHandler(event) {
            this._updateValue = event;
        }
        disableInput(value) {
            this._input.disabled = value;
        }
    }
    class RuleView {
        get element() {
            return this._element;
        }
        ;
        createRuleRow() {
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
        constructor(rule) {
            this._deleteHandler = null;
            this._editHandler = null;
            this.createRuleRow();
            this.rule = rule;
        }
        get rule() {
            return this._rule;
        }
        set rule(value) {
            var _a, _b, _c;
            this._rule = value;
            this._state.textContent = value.state;
            this._symbol.textContent = value.cellValue;
            this._newSymbol.textContent = (_a = value.move.write) !== null && _a !== void 0 ? _a : "";
            this._move.textContent = DIRECTION2TEXT[(_b = value.move.direction) !== null && _b !== void 0 ? _b : turingMachine_1.DIRECTION.STAY];
            this._newState.textContent = (_c = value.move.state) !== null && _c !== void 0 ? _c : "";
        }
        setDeleteHandler(handler) {
            this._deleteHandler = handler;
        }
        setEditHandler(handler) {
            this._editHandler = handler;
        }
    }
    class TuringMachineView {
        constructor(machine) {
            this._runInterval = null;
            this._machine = machine;
            this._context = this.createContext();
        }
        run() {
            this.createContext();
            this.fillUpLeft();
            this.fillUpRight();
            this.createPointerCell();
            this.forceUpdateResetAndValues();
            this.setupEvents();
            this.setupButtons();
            this.initBinaryIncrement();
        }
        initBinaryIncrement() {
            let rules = [
                { state: "q0", cellValue: "0", move: { direction: turingMachine_1.DIRECTION.RIGHT } },
                { state: "q0", cellValue: "1", move: { direction: turingMachine_1.DIRECTION.RIGHT } },
                { state: "q0", cellValue: "", move: { direction: turingMachine_1.DIRECTION.LEFT, state: "q1" } },
                { state: "q1", cellValue: "0", move: { direction: turingMachine_1.DIRECTION.LEFT, state: "q2", write: "1" } },
                { state: "q1", cellValue: "1", move: { direction: turingMachine_1.DIRECTION.LEFT, state: "q1", write: "0" } },
                { state: "q1", cellValue: "", move: { direction: turingMachine_1.DIRECTION.RIGHT, state: "!", write: "1" } },
                { state: "q2", cellValue: "0", move: { direction: turingMachine_1.DIRECTION.LEFT, } },
                { state: "q2", cellValue: "1", move: { direction: turingMachine_1.DIRECTION.LEFT, } },
                { state: "q2", cellValue: "", move: { direction: turingMachine_1.DIRECTION.RIGHT, state: "!" } },
            ];
            rules.forEach(rule => this._machine.addRule(rule));
            rules.forEach(rule => this.updateOrAddRule(rule));
            this._machine.actualState = "q0";
            this._machine.line.writeLine("1010011");
            this._context.currentState.value = this._machine.actualState;
            this.forceUpdateResetAndValues();
        }
        createPointerCell() {
            if (this._context.pointerCell)
                return;
            let cell = this._context.pointerCell = new Cell(0, "");
            cell.setUpdateValueHandler(this.onUserUpdateCell.bind(this));
            this._context.pointer.appendChild(cell.element);
        }
        setupEvents() {
            this._machine.finishEvent = this.onFinish.bind(this);
            this._machine.leftShiftEvent = this.onLeftShift.bind(this);
            this._machine.rightShiftEvent = this.onRightShift.bind(this);
            this._machine.updateCellEvent = this.onMachineUpdateCell.bind(this);
            this._machine.updateStateEvent = this.onUpdateState.bind(this);
        }
        setupButtons() {
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
        onLeftShiftClicked(event) {
            this._machine.actualCell--;
            this.forceUpdateResetAndValues();
        }
        onRightShiftClicked(event) {
            this._machine.actualCell++;
            this.forceUpdateResetAndValues();
        }
        onResetClicked(event) {
            this._machine.reset();
            this.forceUpdateResetAndValues();
        }
        onStepClicked(event) {
            this._machine.makeStep();
        }
        onRunClicked(event) {
            if (this._runInterval) {
                this.stopMachine();
            }
            else {
                this.startMachine();
            }
        }
        onWriteWordClicked(event) {
            if (this._runInterval)
                return;
            this._machine.line.writeLine(this._context.word.value, this._machine.actualCell);
            this.forceUpdateCells();
        }
        onClearLineClicked(event) {
            if (this._runInterval)
                return;
            this._machine.line.clear();
            this.forceUpdateCells();
        }
        onAddRuleClicked(event) {
            var _a;
            let state = this._context.newRuleState.value;
            if (!state)
                return;
            let symbol = this._context.newRuleSymbol.value;
            symbol = symbol || "";
            let newState = this._context.newRuleNewState.value;
            let newSymbol = this._context.newRuleNewSymbol.value;
            const value2direction = {
                "stay": turingMachine_1.DIRECTION.STAY,
                "left": turingMachine_1.DIRECTION.LEFT,
                "right": turingMachine_1.DIRECTION.RIGHT
            };
            let rule = {
                state: state,
                cellValue: symbol,
                move: {
                    direction: (_a = value2direction[this._context.newRuleMove.value]) !== null && _a !== void 0 ? _a : turingMachine_1.DIRECTION.STAY,
                    state: newState || null,
                    write: newSymbol || null
                }
            };
            this._machine.addRule(rule);
            this.updateOrAddRule(rule);
        }
        updateOrAddRule(rule) {
            let ruleView = this._context.rules.find(r => r.rule.state == rule.state && r.rule.cellValue == rule.cellValue);
            if (ruleView) {
                ruleView.rule = rule;
            }
            else {
                ruleView = new RuleView(rule);
                ruleView.setDeleteHandler(this.onDeleteRule.bind(this));
                ruleView.setEditHandler(this.onUpdateRule.bind(this));
                this._context.rules.push(ruleView);
                this._context.rulesTable.appendChild(ruleView.element);
            }
        }
        onDeleteRule(rule) {
            this._machine.removeRule(rule.state, rule.cellValue);
            let ruleView = this._context.rules.find(r => r.rule.state == rule.state && r.rule.cellValue == rule.cellValue);
            if (ruleView) {
                this._context.rulesTable.removeChild(ruleView.element);
                this._context.rules = this._context.rules.filter(r => r != ruleView);
            }
        }
        onUpdateRule(rule) {
            this._context.newRuleState.value = rule.state;
            this._context.newRuleSymbol.value = rule.cellValue || "";
            this._context.newRuleNewState.value = rule.move.state || "";
            this._context.newRuleNewSymbol.value = rule.move.write || "";
            this._context.newRuleMove.value = rule.move.direction == turingMachine_1.DIRECTION.LEFT ? "left" : rule.move.direction == turingMachine_1.DIRECTION.RIGHT ? "right" : "stay";
        }
        onCurrentStateChanged(event) {
            if (this._runInterval)
                return;
            this._machine.actualState = this._context.currentState.value;
        }
        //#endregion
        startMachine() {
            if (this._runInterval)
                return;
            this._runInterval = setInterval(() => {
                this._machine.makeStep();
                if (this._machine.finished)
                    this.stopMachine();
            }, 50);
            this._context.currentState.disabled = true;
            this._context.runBtn.textContent = "Стоп";
            this._context.runBtn.classList.remove("bg-green");
            this._context.runBtn.classList.add("bg-red");
        }
        stopMachine() {
            clearInterval(this._runInterval);
            this._runInterval = null;
            this._context.currentState.disabled = false;
            this._context.runBtn.textContent = "Старт";
            this._context.runBtn.classList.remove("bg-red");
            this._context.runBtn.classList.add("bg-green");
        }
        fillUpLeft() {
            let leftLine = this._context.leftLine;
            let list = this._context.leftCells;
            let machineLine = this._machine.line;
            let index = -list.length - 1;
            while (((list.length == 0) || (0, utils_1.isVisibleInViewport)(list.at(-1).element))) {
                let value = machineLine.getCell(index);
                const cell = new Cell(index, value);
                cell.setUpdateValueHandler(this.onUserUpdateCell.bind(this));
                leftLine.insertBefore(cell.element, leftLine.firstChild);
                list.push(cell);
                index--;
            }
        }
        fillUpRight() {
            let rightLine = this._context.rightLine;
            let list = this._context.rightCells;
            let machineLine = this._machine.line;
            let index = list.length + 1;
            while ((list.length == 0) || (0, utils_1.isVisibleInViewport)(list.at(-1).element)) {
                let value = machineLine.getCell(index);
                const cell = new Cell(index, value);
                cell.setUpdateValueHandler(this.onUserUpdateCell.bind(this));
                rightLine.appendChild(cell.element);
                list.push(cell);
                index++;
            }
        }
        createContext() {
            return {
                leftLine: document.getElementById('left-line'),
                rightLine: document.getElementById('right-line'),
                pointer: document.getElementById('pointer'),
                currentState: document.getElementById('current-state'),
                leftCells: [],
                rightCells: [],
                pointerCell: null,
                rules: [],
                runBtn: document.getElementById('run-btn'),
                stepBtn: document.getElementById('step-btn'),
                resetBtn: document.getElementById('reset-btn'),
                moveLeftBtn: document.getElementById('move-left-btn'),
                moveRightBtn: document.getElementById('move-right-btn'),
                word: document.getElementById('word-to-write'),
                writeWordBtn: document.getElementById('write-word'),
                clearLineBtn: document.getElementById('clear-line'),
                newRuleState: document.getElementById('new-rule-state'),
                newRuleSymbol: document.getElementById('new-rule-symbol'),
                newRuleNewSymbol: document.getElementById('new-rule-new-symbol'),
                newRuleMove: document.getElementById('new-rule-direction'),
                newRuleNewState: document.getElementById('new-rule-new-state'),
                addRuleBtn: document.getElementById('add-rule-btn'),
                rulesTable: document.getElementById('rules-list'),
            };
        }
        forceUpdateCells() {
            let machineLine = this._machine.line;
            const { leftCells, pointerCell, rightCells } = this._context;
            for (const cell of leftCells) {
                cell.value = machineLine.getCell(cell.index);
            }
            for (const cell of rightCells) {
                cell.value = machineLine.getCell(cell.index);
            }
            pointerCell.value = machineLine.getCell(pointerCell.index);
        }
        forceUpdateCell(index) {
            let machineLine = this._machine.line;
            const { leftCells, pointerCell, rightCells } = this._context;
            var cell = [...leftCells, pointerCell, ...rightCells].find(cell => cell.index == index);
            if (cell == null)
                return;
            cell.value = machineLine.getCell(cell.index);
        }
        forceUpdateResetAndValues() {
            let machineLine = this._machine.line;
            const { leftCells, pointerCell, rightCells } = this._context;
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
        onUserUpdateCell(index, value) {
            if (this._runInterval != null)
                return;
            this._machine.line.setCell(index, value);
        }
        onFinish() {
        }
        onLeftShift() {
            this.forceUpdateResetAndValues();
        }
        onRightShift() {
            this.forceUpdateResetAndValues();
        }
        onUpdateState(state) {
            this._context.currentState.value = state;
        }
        onMachineUpdateCell(index) {
            this.forceUpdateCell(index);
        }
    }
    exports.TuringMachineView = TuringMachineView;
});
//# sourceMappingURL=view.js.map
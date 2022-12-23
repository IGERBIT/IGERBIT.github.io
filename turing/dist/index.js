define(["require", "exports", "./turingMachine", "./view"], function (require, exports, turingMachine_1, view_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const turing = new turingMachine_1.TuringMachine();
    const view = new view_1.TuringMachineView(turing);
    view.run();
});
//# sourceMappingURL=index.js.map
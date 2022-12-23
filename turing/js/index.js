import { TuringMachine } from "./turingMachine";
import { TuringMachineView } from "./view";
const turing = new TuringMachine();
const view = new TuringMachineView(turing);
view.run();

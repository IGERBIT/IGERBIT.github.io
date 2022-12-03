import { TuringMachine } from "./turingMachine";
import { TuringMachineView } from "./view";
import './style.scss'

const turing = new TuringMachine();
const view = new TuringMachineView(turing);

view.run();


	
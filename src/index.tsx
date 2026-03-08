import { render } from "solid-js/web";
import App from "./App";
/* @refresh reload */
import "@composition";
import "./index.css";

const root = document.getElementById("root");

render(() => <App />, root!);

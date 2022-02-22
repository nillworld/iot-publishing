import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";
import { IConfig } from "./model";
import App from "./App";
import { useState } from "react";

declare global {
  interface Window {
    acquireVsCodeApi(): any;
    initialData: IConfig;
  }
}

const vscode = window.acquireVsCodeApi();

ReactDOM.render(
  <React.StrictMode>
    <App vscode={vscode} />
    {/* <Config vscode={vscode} initialData={window.initialData} />, */}
  </React.StrictMode>,
  document.getElementById("root")
);

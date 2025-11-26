import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { onIpcMessage, isElectron } from "./utils/electron";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Electron 환경에서만 IPC 통신 사용
if (isElectron()) {
  console.log("Running in Electron environment");
  onIpcMessage("main-process-message", (_event, message) => {
    console.log("Message from main process:", message);
  });
} else {
  console.log("Running in Web environment");
}

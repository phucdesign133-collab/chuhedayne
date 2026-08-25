import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Đổi từ HashRouter sang BrowserRouter
import App from "./App";
import "./index.css"; // Đảm bảo import file CSS chính nếu có

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

const el = document.getElementById("root");
el.innerHTML = "";
createRoot(el).render(<App />);

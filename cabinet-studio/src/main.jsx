import { createRoot } from "react-dom/client";
import App from "./CustomerApp.jsx";
import "./styles/global.css";

const el = document.getElementById("root");
el.innerHTML = "";
createRoot(el).render(<App />);

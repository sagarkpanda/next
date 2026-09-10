"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => { const next = !dark; document.documentElement.classList.toggle("dark", next); localStorage.setItem("theme", next ? "dark" : "light"); setDark(next); };
  return <button onClick={toggle} className="icon-button" aria-label="Toggle theme">{dark ? <Sun size={16}/> : <Moon size={16}/>}</button>;
}

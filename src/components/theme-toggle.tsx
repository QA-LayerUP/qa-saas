"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({
  variant = "row",
}: {
  variant?: "row" | "icon";
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="lu-btn-ghost p-2"
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
        title={isDark ? "Modo claro" : "Modo escuro"}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    );
  }

  return (
    <button type="button" onClick={toggleTheme} className="lu-btn-ghost w-full px-3 py-2">
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
      {isDark ? "Modo claro" : "Modo escuro"}
    </button>
  );
}

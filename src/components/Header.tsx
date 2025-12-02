import { Moon, Sun, Monitor } from "lucide-react";
import { Github } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;

  return (
    <header>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl hover:rotate-12 transition-transform duration-300 cursor-default">🍌</span>
          <h1 className="text-lg font-semibold tracking-tight">Nano Banana Demo</h1>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/tanu360/nanobananademo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>

          <button
            onClick={cycleTheme}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ThemeIcon className="h-5 w-5" />
            <span className="sr-only">Toggle theme</span>
          </button>
        </div>
      </div>
    </header>
  );
}

import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, ExternalLink } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background">
            <span className="text-lg">🍌</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Nano Banana</h1>
            <p className="text-xs text-muted-foreground">AI Image Playground</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
            <a
              href="https://nanobanana.aikit.club"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hidden sm:inline text-xs">API Docs</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {resolvedTheme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                <Sun className="h-4 w-4" />
                Light
                {theme === "light" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                <Moon className="h-4 w-4" />
                Dark
                {theme === "dark" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
                <Monitor className="h-4 w-4" />
                System
                {theme === "system" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

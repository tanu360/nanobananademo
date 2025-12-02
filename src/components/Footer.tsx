import { Link } from "react-router-dom";
import { Sparkles, Pencil, ZoomIn, ExternalLink, Github } from "lucide-react";

interface FooterProps {
  onTabChange?: (tab: string) => void;
}

export function Footer({ onTabChange }: FooterProps) {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="container px-4">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          {/* Brand */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🍌</span>
              <span className="font-semibold">Nano Banana</span>
            </div>
            <p className="text-xs text-muted-foreground">
              AI-powered image generation, editing, and upscaling.
            </p>
          </div>

          {/* Features Row */}
          <div className="flex justify-center gap-6">
            <button
              onClick={() => onTabChange?.("generate")}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-xs">Generate</span>
            </button>
            <button
              onClick={() => onTabChange?.("edit")}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="h-5 w-5" />
              <span className="text-xs">Edit</span>
            </button>
            <button
              onClick={() => onTabChange?.("upscale")}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ZoomIn className="h-5 w-5" />
              <span className="text-xs">Upscale</span>
            </button>
          </div>

          {/* Links Row */}
          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <a
              href="https://nano-banana-api.readme.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              API
            </a>
            <a
              href="https://github.com/tanu360"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-row md:justify-between gap-8">
          {/* Brand - Left */}
          <div className="space-y-3 md:max-w-xs">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍌</span>
              <span className="font-semibold">Nano Banana</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered image generation, editing, and upscaling. Create stunning visuals with advanced AI models.
            </p>
          </div>

          {/* Features - Center */}
          <div className="space-y-3">
            <h4 className="font-medium">Features</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <button
                onClick={() => onTabChange?.("generate")}
                className="flex items-center gap-2 hover:text-foreground transition-colors text-left"
              >
                <Sparkles className="h-4 w-4" />
                Generate Images
              </button>
              <button
                onClick={() => onTabChange?.("edit")}
                className="flex items-center gap-2 hover:text-foreground transition-colors text-left"
              >
                <Pencil className="h-4 w-4" />
                Edit Images
              </button>
              <button
                onClick={() => onTabChange?.("upscale")}
                className="flex items-center gap-2 hover:text-foreground transition-colors text-left"
              >
                <ZoomIn className="h-4 w-4" />
                Upscale Images
              </button>
            </nav>
          </div>

          {/* Resources - Center */}
          <div className="space-y-3">
            <h4 className="font-medium">Resources</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a
                href="https://nano-banana-api.readme.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                API Info
              </a>
              <a
                href="https://github.com/tanu360"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </nav>
          </div>

          {/* Links - Right */}
          <div className="space-y-3">
            <h4 className="font-medium">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-6 pt-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Nano Banana. Powered by{" "}
            <a
              href="https://nano-banana-api.readme.io/"
              className="font-medium text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nano Banana API
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

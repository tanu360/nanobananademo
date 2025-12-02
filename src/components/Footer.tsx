import { Link } from "react-router-dom";
import { Sparkles, Pencil, ZoomIn } from "lucide-react";

interface FooterProps {
  onTabChange?: (tab: string) => void;
}

export function Footer({ onTabChange }: FooterProps) {
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍌</span>
              <span className="font-semibold">Nano Banana</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered image generation, editing, and upscaling. Create stunning visuals with advanced AI models.
            </p>
          </div>

          {/* Features */}
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

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-medium">Links</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a 
                href="https://nanobanana.aikit.club" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                API Documentation
              </a>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Nano Banana. Powered by{" "}
            <a
              href="https://nanobanana.aikit.club"
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

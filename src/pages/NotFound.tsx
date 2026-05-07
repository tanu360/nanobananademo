import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto py-16">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-foreground/10 select-none">404</div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            Oops! The page <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">{location.pathname}</code> doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">Maybe you were looking for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm px-3 py-1.5 rounded-full bg-muted">
                Generate Images
              </span>
              <span className="text-sm px-3 py-1.5 rounded-full bg-muted">
                Edit Images
              </span>
              <span className="text-sm px-3 py-1.5 rounded-full bg-muted">
                Upscale Images
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;

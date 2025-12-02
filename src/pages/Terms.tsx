import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container py-8 flex-1">
        <div className="mx-auto max-w-3xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Playground
            </Link>
          </Button>
          
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Nano Banana AI Image Playground, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Nano Banana provides an AI-powered image playground that allows users to generate, edit, and upscale images using advanced AI models including Google Imagen and the Nano Banana model.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. User Responsibilities</h2>
              <p className="text-muted-foreground">
                You agree to use this service responsibly and not to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Generate illegal, harmful, or inappropriate content</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Attempt to reverse engineer or exploit the service</li>
                <li>Use the service for automated bulk operations without permission</li>
                <li>Create content that depicts violence, hate speech, or explicit material</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. Intellectual Property</h2>
              <p className="text-muted-foreground">
                Images generated using our service are subject to the terms of the underlying AI models. You retain rights to your original prompts and uploaded images. Generated images may be subject to additional terms from Google Imagen and Nano Banana API.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. Service Availability</h2>
              <p className="text-muted-foreground">
                We strive to provide reliable service but do not guarantee uninterrupted availability. The service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Nano Banana is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, including but not limited to direct, indirect, incidental, or consequential damages.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">8. Contact</h2>
              <p className="text-muted-foreground">
                For questions about these terms, please visit{" "}
                <a 
                  href="https://nanobanana.aikit.club" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  nanobanana.aikit.club
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container py-6 flex-1">
        <div className="mx-auto max-w-3xl">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Playground
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                Nano Banana AI Image Playground processes images and prompts that you provide to generate, edit, or upscale images. We do not permanently store your images or prompts on our servers. All processing is done in real-time through the Nano Banana API.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
              <p className="text-muted-foreground">
                Your prompts and images are used solely to provide the image generation, editing, and upscaling services you request. We do not use your content for training AI models or share it with third parties except as necessary to provide the service.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">3. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical measures to protect your data during transmission. All API communications are encrypted using industry-standard protocols.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">4. Third-Party Services</h2>
              <p className="text-muted-foreground">
                Our service utilizes the Nano Banana API and Google Imagen models for image processing. Please refer to their respective privacy policies for information about how they handle data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">5. Cookies</h2>
              <p className="text-muted-foreground">
                We use minimal local storage to save your theme preferences. We do not use tracking cookies or third-party analytics.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">6. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify users of any material changes by posting the new policy on this page.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">7. Contact</h2>
              <p className="text-muted-foreground">
                For questions about this privacy policy, please visit{" "}
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

export default Privacy;

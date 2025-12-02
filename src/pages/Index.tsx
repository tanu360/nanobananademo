import { Header } from "@/components/Header";
import { GenerateTab } from "@/components/GenerateTab";
import { EditTab } from "@/components/EditTab";
import { UpscaleTab } from "@/components/UpscaleTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Pencil, ZoomIn } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight">AI Image Playground</h2>
            <p className="text-muted-foreground">
              Generate, edit, and upscale images using advanced AI models
            </p>
          </div>

          <Tabs defaultValue="generate" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Generate</span>
              </TabsTrigger>
              <TabsTrigger value="edit" className="gap-2">
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </TabsTrigger>
              <TabsTrigger value="upscale" className="gap-2">
                <ZoomIn className="h-4 w-4" />
                <span className="hidden sm:inline">Upscale</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <GenerateTab />
            </TabsContent>

            <TabsContent value="edit">
              <EditTab />
            </TabsContent>

            <TabsContent value="upscale">
              <UpscaleTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <a
              href="https://nanobanana.aikit.club"
              className="font-medium text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nano Banana API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

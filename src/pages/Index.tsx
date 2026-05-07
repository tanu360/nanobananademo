import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Pencil, ZoomIn, Clock, ShieldCheck } from "lucide-react";
import { GenerateTab } from "@/components/GenerateTab";
import { EditTab } from "@/components/EditTab";
import { UpscaleTab } from "@/components/UpscaleTab";
import { DetectorTab } from "@/components/DetectorTab";
import { HistoryTab } from "@/components/HistoryTab";

// State for passing data between tabs
interface GenerateInitialData {
  prompt: string;
  model: string;
}

interface ImageInitialData {
  imageUrl: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("generate");

  // Initial data for tabs from history
  const [generateInitialData, setGenerateInitialData] = useState<GenerateInitialData | null>(null);
  const [editInitialData, setEditInitialData] = useState<ImageInitialData | null>(null);
  const [upscaleInitialData, setUpscaleInitialData] = useState<ImageInitialData | null>(null);

  // Handlers for history actions
  const handleRegenerate = (prompt: string, model: string) => {
    setGenerateInitialData({ prompt, model });
    setActiveTab("generate");
  };

  const handleEditFromHistory = (imageUrl: string) => {
    setEditInitialData({ imageUrl });
    setActiveTab("edit");
  };

  const handleUpscaleFromHistory = (imageUrl: string) => {
    setUpscaleInitialData({ imageUrl });
    setActiveTab("upscale");
  };

  // Clear initial data after it's consumed
  const clearGenerateInitialData = () => setGenerateInitialData(null);
  const clearEditInitialData = () => setEditInitialData(null);
  const clearUpscaleInitialData = () => setUpscaleInitialData(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container py-6 flex-1">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-3xl font-bold tracking-tight">AI Image Playground</h2>
            <p className="text-muted-foreground">
              Generate, edit, and upscale images using advanced AI models
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
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
              <TabsTrigger value="detector" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Detector</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <GenerateTab
                initialData={generateInitialData}
                onInitialDataConsumed={clearGenerateInitialData}
              />
            </TabsContent>

            <TabsContent value="edit">
              <EditTab
                initialData={editInitialData}
                onInitialDataConsumed={clearEditInitialData}
              />
            </TabsContent>

            <TabsContent value="upscale">
              <UpscaleTab
                initialData={upscaleInitialData}
                onInitialDataConsumed={clearUpscaleInitialData}
              />
            </TabsContent>

            <TabsContent value="detector">
              <DetectorTab />
            </TabsContent>

            <TabsContent value="history">
              <HistoryTab
                onRegenerate={handleRegenerate}
                onEdit={handleEditFromHistory}
                onUpscale={handleUpscaleFromHistory}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

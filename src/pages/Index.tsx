import { useState, lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Pencil, ZoomIn, Clock } from "lucide-react";

// Lazy load tab components for better performance
const GenerateTab = lazy(() => import("@/components/GenerateTab").then(m => ({ default: m.GenerateTab })));
const EditTab = lazy(() => import("@/components/EditTab").then(m => ({ default: m.EditTab })));
const UpscaleTab = lazy(() => import("@/components/UpscaleTab").then(m => ({ default: m.UpscaleTab })));
const HistoryTab = lazy(() => import("@/components/HistoryTab").then(m => ({ default: m.HistoryTab })));

// Loading skeleton for tabs - min-height prevents footer flicker
const TabSkeleton = () => (
  <div className="min-h-[500px] grid gap-6 lg:grid-cols-2">
    <div className="space-y-6">
      <Skeleton className="h-[100px] w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
    <Skeleton className="h-[300px] w-full" />
  </div>
);

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
            <TabsList className="grid w-full grid-cols-4">
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
              <TabsTrigger value="history" className="gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="min-h-[500px]">
              <Suspense fallback={<TabSkeleton />}>
                <GenerateTab
                  initialData={generateInitialData}
                  onInitialDataConsumed={clearGenerateInitialData}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="edit" className="min-h-[500px]">
              <Suspense fallback={<TabSkeleton />}>
                <EditTab
                  initialData={editInitialData}
                  onInitialDataConsumed={clearEditInitialData}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="upscale" className="min-h-[500px]">
              <Suspense fallback={<TabSkeleton />}>
                <UpscaleTab
                  initialData={upscaleInitialData}
                  onInitialDataConsumed={clearUpscaleInitialData}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="history" className="min-h-[500px]">
              <Suspense fallback={<TabSkeleton />}>
                <HistoryTab
                  onRegenerate={handleRegenerate}
                  onEdit={handleEditFromHistory}
                  onUpscale={handleUpscaleFromHistory}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

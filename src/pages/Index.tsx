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

// Loading skeleton for tabs
const TabSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-2">
    <div className="space-y-6">
      <Skeleton className="h-[100px] w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
    <Skeleton className="h-[300px] w-full" />
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState("generate");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container py-8 flex-1">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
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

            <TabsContent value="generate">
              <Suspense fallback={<TabSkeleton />}>
                <GenerateTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="edit">
              <Suspense fallback={<TabSkeleton />}>
                <EditTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="upscale">
              <Suspense fallback={<TabSkeleton />}>
                <UpscaleTab />
              </Suspense>
            </TabsContent>

            <TabsContent value="history">
              <Suspense fallback={<TabSkeleton />}>
                <HistoryTab />
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

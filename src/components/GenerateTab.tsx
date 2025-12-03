import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Sparkles, Download, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { generateImage, type GenerateParams, type ImageData } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { OptionCard, AspectRatioIcon } from "@/components/OptionCard";
import { cn } from "@/lib/utils";
import { preloadImages } from "@/lib/imageCache";
import { saveToHistory } from "@/lib/imageHistory";

const MODELS = [
  { id: "nano-banana", name: "Nano Banana", description: "Default", maxImages: 1 },
  { id: "imagen-4.0-ultra-generate-001", name: "Imagen Ultra 4.0", description: "Best quality", maxImages: 4 },
  { id: "imagen-4.0-generate-001", name: "Imagen Pro 4.0", description: "High quality", maxImages: 4 },
  { id: "imagen-4.0-fast-generate-001", name: "Imagen Fast 4.0", description: "Quick result", maxImages: 4 },
  { id: "imagen-3.0-generate-002", name: "Imagen 3.0 v2", description: "Stable", maxImages: 4 },
  { id: "imagen-3.0-generate-001", name: "Imagen 3.0 v1", description: "Classic", maxImages: 4 },
  { id: "imagen-3.0-fast-generate-001", name: "Imagen 3.0 Fast", description: "Quick", maxImages: 4 },
];

const SIZES = [
  { value: "1K", label: "1K", description: "1024px" },
  { value: "2K", label: "2K", description: "2048px" },
];

const QUALITY_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "low", label: "Low" },
  { value: "high", label: "High" },
  { value: "hd", label: "HD" },
];

const SQUARE_RATIOS = [
  { value: "1:1", label: "1:1", description: "Square" },
];

interface GenerateTabProps {
  initialData?: { prompt: string; model: string } | null;
  onInitialDataConsumed?: () => void;
  onLoad?: () => void;
}

export function GenerateTab({ initialData, onInitialDataConsumed, onLoad }: GenerateTabProps) {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState("nano-banana");
  const [size, setSize] = useState("1K");
  const [quality, setQuality] = useState("auto");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [count, setCount] = useState(1);
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImageData[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentModel = MODELS.find(m => m.id === model);
  const maxImages = currentModel?.maxImages || 1;

  // Notify parent that tab is loaded (only on mount)
  useEffect(() => {
    onLoad?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle initial data from history
  useEffect(() => {
    if (initialData) {
      setPrompt(initialData.prompt);
      setModel(initialData.model);
      onInitialDataConsumed?.();
      toast({ title: "Prompt loaded from history" });
    }
  }, [initialData, onInitialDataConsumed]);

  useEffect(() => {
    if (count > maxImages) {
      setCount(maxImages);
    }
  }, [model, maxImages, count]);

  // Disable enhancePrompt for imagen-4.0-fast model
  useEffect(() => {
    if (model === "imagen-4.0-fast-generate-001") {
      setEnhancePrompt(false);
    }
  }, [model]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [results]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    // Minimize advanced controls when generating
    setAdvancedOpen(false);

    setLoading(true);
    try {
      const params: GenerateParams = {
        prompt,
        model,
        size: aspectRatio,
        sampleImageSize: size as "1K" | "2K",
        quality,
        enhance_prompt: enhancePrompt,
        n: count,
        response_format: "url",
      };

      if (negativePrompt.trim()) {
        params.negative_prompt = negativePrompt;
      }

      if (seed.trim()) {
        params.seed = parseInt(seed);
      }

      const response = await generateImage(params);
      setResults(response.data);

      // Preload all result images for instant viewing
      const urls = response.data
        .map(img => img.url)
        .filter((url): url is string => !!url);
      preloadImages(urls);

      // Save all generated images to history with revised_prompt
      for (const img of response.data) {
        if (img.url) {
          // Use revised_prompt from API response, fallback to user prompt
          const displayPrompt = img.revised_prompt || prompt;
          saveToHistory("generate", img.url, displayPrompt, { model, size, quality, aspectRatio });
        }
      }

      toast({ title: "Image generated successfully!" });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `nanobanana-${Date.now()}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? results.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === results.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="prompt">Prompt</Label>
            <span className="text-xs text-muted-foreground">
              {prompt.length} / 4096
            </span>
          </div>
          <Textarea
            id="prompt"
            placeholder="A serene mountain landscape at sunset with golden light reflecting off a calm lake..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[174px] resize-none"
            maxLength={4096}
          />
        </div>

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="rounded-lg border bg-card">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full items-center justify-between px-4 py-4 rounded-lg hover:bg-transparent">
              <span className="text-sm font-medium">Advanced Controls</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 px-4 pb-4">
            <div className="space-y-3">
              <Label className="text-muted-foreground">Model</Label>
              <OptionCard
                selected={model === "nano-banana"}
                onClick={() => setModel("nano-banana")}
                className="w-full"
              >
                <span className="text-sm font-medium">Nano Banana</span>
                <span className="text-xs text-muted-foreground">Default</span>
              </OptionCard>

              {/* Imagen 4.0 models - 3 in one row */}
              <div className="grid grid-cols-3 gap-2">
                <OptionCard
                  selected={model === "imagen-4.0-ultra-generate-001"}
                  onClick={() => setModel("imagen-4.0-ultra-generate-001")}
                >
                  <span className="text-sm font-medium">Imagen Ultra 4.0</span>
                  <span className="text-xs text-muted-foreground">Best quality</span>
                </OptionCard>
                <OptionCard
                  selected={model === "imagen-4.0-generate-001"}
                  onClick={() => setModel("imagen-4.0-generate-001")}
                >
                  <span className="text-sm font-medium">Imagen Pro 4.0</span>
                  <span className="text-xs text-muted-foreground">High quality</span>
                </OptionCard>
                <OptionCard
                  selected={model === "imagen-4.0-fast-generate-001"}
                  onClick={() => setModel("imagen-4.0-fast-generate-001")}
                >
                  <span className="text-sm font-medium">Imagen Fast 4.0</span>
                  <span className="text-xs text-muted-foreground">Quick result</span>
                </OptionCard>
              </div>

              {/* Imagen 3.0 models - 3 in one row */}
              <div className="grid grid-cols-3 gap-2">
                <OptionCard
                  selected={model === "imagen-3.0-generate-002"}
                  onClick={() => setModel("imagen-3.0-generate-002")}
                >
                  <span className="text-sm font-medium">Imagen 3.0 v2</span>
                  <span className="text-xs text-muted-foreground">Stable</span>
                </OptionCard>
                <OptionCard
                  selected={model === "imagen-3.0-generate-001"}
                  onClick={() => setModel("imagen-3.0-generate-001")}
                >
                  <span className="text-sm font-medium">Imagen 3.0 v1</span>
                  <span className="text-xs text-muted-foreground">Classic</span>
                </OptionCard>
                <OptionCard
                  selected={model === "imagen-3.0-fast-generate-001"}
                  onClick={() => setModel("imagen-3.0-fast-generate-001")}
                >
                  <span className="text-sm font-medium">Imagen 3.0 Fast</span>
                  <span className="text-xs text-muted-foreground">Quick</span>
                </OptionCard>
              </div>
            </div>

            {/* Image Size */}
            <div className="space-y-3">
              <Label className="text-muted-foreground">Image Size</Label>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map((s) => (
                  <OptionCard key={s.value} selected={size === s.value} onClick={() => setSize(s.value)}>
                    <span className="text-sm font-bold">{s.label}</span>
                    <span className="text-xs text-muted-foreground">{s.description}</span>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
              <Label className="text-muted-foreground">Aspect Ratio</Label>

              {/* 1:1, 16:9, 9:16 in first row */}
              <div className="grid grid-cols-3 gap-2">
                {SQUARE_RATIOS.map((r) => (
                  <OptionCard key={r.value} selected={aspectRatio === r.value} onClick={() => setAspectRatio(r.value)}>
                    <AspectRatioIcon ratio={r.value} className="mb-1" />
                    <span className="text-sm font-bold">{r.label}</span>
                    <span className="text-xs text-muted-foreground">{r.description}</span>
                  </OptionCard>
                ))}
                <OptionCard selected={aspectRatio === "16:9"} onClick={() => setAspectRatio("16:9")}>
                  <AspectRatioIcon ratio="16:9" className="mb-1" />
                  <span className="text-sm font-bold">16:9</span>
                  <span className="text-xs text-muted-foreground">Wide</span>
                </OptionCard>
                <OptionCard selected={aspectRatio === "9:16"} onClick={() => setAspectRatio("9:16")}>
                  <AspectRatioIcon ratio="9:16" className="mb-1" />
                  <span className="text-sm font-bold">9:16</span>
                  <span className="text-xs text-muted-foreground">Tall</span>
                </OptionCard>
              </div>

              {/* 4:3, 3:4 in second row */}
              <div className="grid grid-cols-2 gap-2">
                <OptionCard selected={aspectRatio === "4:3"} onClick={() => setAspectRatio("4:3")}>
                  <AspectRatioIcon ratio="4:3" className="mb-1" />
                  <span className="text-sm font-bold">4:3</span>
                  <span className="text-xs text-muted-foreground">Standard</span>
                </OptionCard>
                <OptionCard selected={aspectRatio === "3:4"} onClick={() => setAspectRatio("3:4")}>
                  <AspectRatioIcon ratio="3:4" className="mb-1" />
                  <span className="text-sm font-bold">3:4</span>
                  <span className="text-xs text-muted-foreground">Portrait</span>
                </OptionCard>
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-3">
              <Label className="text-muted-foreground">Quality</Label>
              <div className="grid grid-cols-4 gap-2">
                {QUALITY_OPTIONS.map((q) => (
                  <OptionCard key={q.value} selected={quality === q.value} onClick={() => setQuality(q.value)}>
                    <span className="text-sm font-medium">{q.label}</span>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Count */}
            <div className="space-y-3">
              <Label className="text-muted-foreground">Count {maxImages === 1 && <span className="text-xs">(max 1 for {currentModel?.name})</span>}</Label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <OptionCard
                    key={n}
                    selected={count === n}
                    onClick={() => n <= maxImages && setCount(n)}
                    className={n > maxImages ? "opacity-40 cursor-not-allowed" : ""}
                  >
                    <span className="text-sm font-bold">{n}</span>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="negative" className="text-muted-foreground">Negative Prompt</Label>
                <span className="text-xs text-muted-foreground">
                  {negativePrompt.length} / 1024
                </span>
              </div>
              <Input
                id="negative"
                placeholder="blur, low quality, distortion..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                maxLength={1024}
              />
            </div>

            {/* Seed */}
            <div className="space-y-2">
              <Label htmlFor="seed" className="text-muted-foreground">Seed (optional) {enhancePrompt && <span className="text-xs">(disabled when Enhance Prompt is on)</span>}</Label>
              <Input
                id="seed"
                type="number"
                min="0"
                max="2147483647"
                placeholder={enhancePrompt ? "Disabled with Enhance Prompt" : "Random seed for reproducible results"}
                value={seed}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseInt(value);
                  // Only allow positive numbers within range
                  if (value === "" || (numValue >= 0 && numValue <= 2147483647)) {
                    setSeed(value);
                  }
                }}
                disabled={enhancePrompt}
                className={enhancePrompt ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>

            {/* Enhance Prompt */}
            <div className={cn("flex items-center justify-between rounded-md border p-4", model === "imagen-4.0-fast-generate-001" && "opacity-50")}>
              <div className="space-y-0.5">
                <Label className="text-muted-foreground">Enhance Prompt</Label>
                <p className="text-xs text-muted-foreground">
                  {model === "imagen-4.0-fast-generate-001" ? "Not supported for Imagen Fast 4.0" : "Use AI to improve your prompt"}
                </p>
              </div>
              <Switch
                checked={enhancePrompt}
                onCheckedChange={setEnhancePrompt}
                disabled={model === "imagen-4.0-fast-generate-001"}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button onClick={handleGenerate} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        <Label>Results {results.length > 1 && `(${currentImageIndex + 1}/${results.length})`}</Label>
        {results.length === 0 ? (
          <Card className="flex min-h-[288px] items-center justify-center border-dashed">
            <CardContent className="text-center text-muted-foreground">
              {loading ? (
                <div className="space-y-3">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                  <p className="font-medium">Generating your image...</p>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      <span>Processing prompt</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.2s]" />
                      <span>Creating image</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.4s]" />
                      <span>Finalizing</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>Generated images will appear here</p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="group relative overflow-hidden">
            <img
              key={currentImageIndex}
              src={results[currentImageIndex]?.url || `data:image/png;base64,${results[currentImageIndex]?.b64_json}`}
              alt={`Generated ${currentImageIndex + 1}`}
              className="w-full object-contain"
            />

            {results.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
                  onClick={goToPrevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
                  onClick={goToNextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {results.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {results.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      i === currentImageIndex ? "bg-foreground" : "bg-foreground/30"
                    )}
                  />
                ))}
              </div>
            )}

            <Button
              size="icon"
              className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-background/90 hover:bg-background text-foreground backdrop-blur-sm"
              onClick={() => handleDownload(results[currentImageIndex].url || "", currentImageIndex)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

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

const MODELS = [
  { id: "nano-banana", name: "Nano Banana", description: "Default", maxImages: 1 },
  { id: "imagen-4.0-ultra-generate-001", name: "Imagen Ultra 4.0", description: "Highest quality", maxImages: 4 },
  { id: "imagen-4.0-generate-001", name: "Imagen Pro 4.0", description: "High quality", maxImages: 4 },
  { id: "imagen-4.0-fast-generate-001", name: "Imagen Fast 4.0", description: "Quick generation", maxImages: 4 },
  { id: "imagen-3.0-generate-002", name: "Imagen 3.0 v2", description: "Stable", maxImages: 4 },
  { id: "imagen-3.0-generate-001", name: "Imagen 3.0 v1", description: "Classic", maxImages: 4 },
  { id: "imagen-3.0-fast-generate-001", name: "Imagen 3.0 Fast", description: "Quick", maxImages: 4 },
];

const SIZES = [
  { value: "1024x1024", label: "1K", description: "1024px" },
  { value: "2048x2048", label: "2K", description: "2048px" },
  { value: "4096x4096", label: "4K", description: "4096px" },
];

const QUALITY_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "hd", label: "HD" },
];

const LANDSCAPE_RATIOS = [
  { value: "21:9", label: "21:9", description: "Ultra" },
  { value: "16:9", label: "16:9", description: "Wide" },
  { value: "4:3", label: "4:3", description: "Standard" },
  { value: "3:2", label: "3:2", description: "Classic" },
];

const SQUARE_RATIOS = [
  { value: "1:1", label: "1:1", description: "Square" },
];

const FLEXIBLE_RATIOS = [
  { value: "5:4", label: "5:4", description: "Wide" },
  { value: "4:5", label: "4:5", description: "Tall" },
];

const PORTRAIT_RATIOS = [
  { value: "2:3", label: "2:3", description: "Classic" },
  { value: "3:4", label: "3:4", description: "Portrait" },
  { value: "9:16", label: "9:16", description: "Tall" },
];

export function GenerateTab() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState("nano-banana");
  const [size, setSize] = useState("1024x1024");
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

  useEffect(() => {
    if (count > maxImages) {
      setCount(maxImages);
    }
  }, [model, maxImages, count]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [results]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const params: GenerateParams = {
        prompt,
        model,
        size: aspectRatio !== "1:1" ? aspectRatio : size,
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
      a.download = `nano-banana-${Date.now()}-${index}.png`;
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
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="A serene mountain landscape at sunset with golden light reflecting off a calm lake..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full items-center justify-between px-0 hover:bg-transparent">
              <span className="text-sm font-medium">Advanced Controls</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 pt-4">
            {/* Model Selection */}
            <div className="space-y-3">
              <Label>Model</Label>
              <OptionCard 
                selected={model === "nano-banana"} 
                onClick={() => setModel("nano-banana")}
                className="w-full"
              >
                <span className="text-sm font-medium">Nano Banana</span>
                <span className="text-xs text-muted-foreground">Default</span>
              </OptionCard>
              
              <div className="grid grid-cols-2 gap-2">
                <OptionCard 
                  selected={model === "imagen-4.0-ultra-generate-001"} 
                  onClick={() => setModel("imagen-4.0-ultra-generate-001")}
                >
                  <span className="text-sm font-medium">Imagen Ultra 4.0</span>
                  <span className="text-xs text-muted-foreground">Highest quality</span>
                </OptionCard>
                <OptionCard 
                  selected={model === "imagen-4.0-generate-001"} 
                  onClick={() => setModel("imagen-4.0-generate-001")}
                >
                  <span className="text-sm font-medium">Imagen Pro 4.0</span>
                  <span className="text-xs text-muted-foreground">High quality</span>
                </OptionCard>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <OptionCard 
                  selected={model === "imagen-4.0-fast-generate-001"} 
                  onClick={() => setModel("imagen-4.0-fast-generate-001")}
                >
                  <span className="text-sm font-medium">Imagen Fast 4.0</span>
                  <span className="text-xs text-muted-foreground">Quick generation</span>
                </OptionCard>
                <OptionCard 
                  selected={model === "imagen-3.0-generate-002"} 
                  onClick={() => setModel("imagen-3.0-generate-002")}
                >
                  <span className="text-sm font-medium">Imagen 3.0 v2</span>
                  <span className="text-xs text-muted-foreground">Stable</span>
                </OptionCard>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
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
              <Label>Image Size</Label>
              <div className="grid grid-cols-3 gap-2">
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
              <Label>Aspect Ratio</Label>
              
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Landscape</span>
                <div className="grid grid-cols-4 gap-2">
                  {LANDSCAPE_RATIOS.map((r) => (
                    <OptionCard key={r.value} selected={aspectRatio === r.value} onClick={() => setAspectRatio(r.value)}>
                      <AspectRatioIcon ratio={r.value} className="mb-1" />
                      <span className="text-sm font-bold">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </OptionCard>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Square</span>
                  <div className="grid grid-cols-1 gap-2">
                    {SQUARE_RATIOS.map((r) => (
                      <OptionCard key={r.value} selected={aspectRatio === r.value} onClick={() => setAspectRatio(r.value)}>
                        <AspectRatioIcon ratio={r.value} className="mb-1" />
                        <span className="text-sm font-bold">{r.label}</span>
                        <span className="text-xs text-muted-foreground">{r.description}</span>
                      </OptionCard>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Flexible</span>
                  <div className="grid grid-cols-2 gap-2">
                    {FLEXIBLE_RATIOS.map((r) => (
                      <OptionCard key={r.value} selected={aspectRatio === r.value} onClick={() => setAspectRatio(r.value)}>
                        <AspectRatioIcon ratio={r.value} className="mb-1" />
                        <span className="text-sm font-bold">{r.label}</span>
                        <span className="text-xs text-muted-foreground">{r.description}</span>
                      </OptionCard>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Portrait</span>
                <div className="grid grid-cols-3 gap-2">
                  {PORTRAIT_RATIOS.map((r) => (
                    <OptionCard key={r.value} selected={aspectRatio === r.value} onClick={() => setAspectRatio(r.value)}>
                      <AspectRatioIcon ratio={r.value} className="mb-1" />
                      <span className="text-sm font-bold">{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </OptionCard>
                  ))}
                </div>
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-3">
              <Label>Quality</Label>
              <div className="grid grid-cols-5 gap-2">
                {QUALITY_OPTIONS.map((q) => (
                  <OptionCard key={q.value} selected={quality === q.value} onClick={() => setQuality(q.value)}>
                    <span className="text-sm font-medium">{q.label}</span>
                  </OptionCard>
                ))}
              </div>
            </div>

            {/* Count */}
            <div className="space-y-3">
              <Label>Count {maxImages === 1 && <span className="text-xs text-muted-foreground">(max 1 for {currentModel?.name})</span>}</Label>
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
              <Label htmlFor="negative">Negative Prompt</Label>
              <Input
                id="negative"
                placeholder="blur, low quality, distortion..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            </div>

            {/* Seed */}
            <div className="space-y-2">
              <Label htmlFor="seed">Seed (optional)</Label>
              <Input
                id="seed"
                type="number"
                placeholder="Random seed for reproducible results"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
            </div>

            {/* Enhance Prompt */}
            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <Label>Enhance Prompt</Label>
                <p className="text-xs text-muted-foreground">Use AI to improve your prompt</p>
              </div>
              <Switch checked={enhancePrompt} onCheckedChange={setEnhancePrompt} />
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

      <div className="flex flex-col space-y-4">
        <Label>Results {results.length > 1 && `(${currentImageIndex + 1}/${results.length})`}</Label>
        {results.length === 0 ? (
          <Card className="flex flex-1 min-h-[300px] items-center justify-center border-dashed">
            <CardContent className="text-center text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Generated images will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="group relative flex-1 min-h-[300px] overflow-hidden">
            <img
              src={results[currentImageIndex].url || `data:image/png;base64,${results[currentImageIndex].b64_json}`}
              alt={`Generated ${currentImageIndex + 1}`}
              className="h-full w-full object-contain"
            />
            
            {results.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={goToPrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={goToNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownload(results[currentImageIndex].url || "", currentImageIndex)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            {results.length > 1 && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
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
            
            {results[currentImageIndex].revised_prompt && (
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-3 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground line-clamp-2">{results[currentImageIndex].revised_prompt}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

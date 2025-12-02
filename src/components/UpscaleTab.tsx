import { useState, useRef } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ZoomIn, Upload, Link, Download, X, ImagePlus } from "lucide-react";
import { upscaleImage, type ImageData } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OptionCard } from "@/components/OptionCard";

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const UPSCALE_FACTORS = [
  { value: "x2", label: "2x", description: "2K Resolution" },
  { value: "x3", label: "3x", description: "3K Resolution" },
  { value: "x4", label: "4x", description: "4K Resolution" },
];

export function UpscaleTab() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [upscaleFactor, setUpscaleFactor] = useState<"x2" | "x3" | "x4">("x2");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Only JPG, PNG, GIF, WebP formats are supported", variant: "destructive" });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File size must be less than 16MB", variant: "destructive" });
      return;
    }

    setUploadedFileInfo({ name: file.name, size: formatFileSize(file.size) });

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setImageSource("upload");
    };
    reader.readAsDataURL(file);
  };

  const handleUpscale = async () => {
    const imageToUpscale = imageSource === "url" ? imageUrl : uploadedImage;
    if (!imageToUpscale) {
      toast({ title: "Please provide an image", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await upscaleImage({
        image: imageToUpscale,
        upscale_factor: upscaleFactor,
        response_format: "url",
      });
      setResult(response.data[0]);
      toast({ title: "Image upscaled successfully!" });
    } catch (error) {
      toast({
        title: "Upscale failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `nano-banana-upscaled-${upscaleFactor}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setUploadedFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const previewImage = imageSource === "url" ? imageUrl : uploadedImage;
  const resultImage = result?.url || (result?.b64_json ? `data:image/png;base64,${result.b64_json}` : null);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Tabs value={imageSource} onValueChange={(v) => setImageSource(v as "url" | "upload")}>
          <TabsList className="w-full">
            <TabsTrigger value="url" className="flex-1">
              <Link className="mr-2 h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="mt-4 space-y-2">
            <Label htmlFor="upscale-url">Image URL</Label>
            <Input
              id="upscale-url"
              type="url"
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="rounded-lg"
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-4 space-y-2">
            <Label>Upload Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              className="relative w-full border border-dashed rounded-lg py-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => !uploadedImage && fileInputRef.current?.click()}
            >
              {uploadedImage && uploadedFileInfo ? (
                <>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute right-2 top-2 h-5 w-5 rounded-full"
                    onClick={(e) => { e.stopPropagation(); clearUpload(); }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-sm font-medium truncate max-w-[200px]">{uploadedFileInfo.name}</p>
                  <p className="text-xs text-muted-foreground">{uploadedFileInfo.size}</p>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">Click to upload (max 16MB)</p>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-3">
          <Label>Upscale Factor</Label>
          <div className="grid grid-cols-3 gap-2">
            {UPSCALE_FACTORS.map((f) => (
              <OptionCard
                key={f.value}
                selected={upscaleFactor === f.value}
                onClick={() => setUpscaleFactor(f.value as "x2" | "x3" | "x4")}
              >
                <span className="text-sm font-bold">{f.label}</span>
                <span className="text-xs text-muted-foreground">{f.description}</span>
              </OptionCard>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Higher factors produce larger images but take longer
          </p>
        </div>

        <Button onClick={handleUpscale} disabled={loading} className="w-full rounded-lg" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Upscaling...
            </>
          ) : (
            <>
              <ZoomIn className="mr-2 h-4 w-4" />
              Upscale Image
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col space-y-2">
        <Card className={`overflow-hidden rounded-md ${!previewImage ? 'flex-1' : ''}`}>
          {resultImage && previewImage ? (
            <div className="relative">
              <ReactCompareSlider
                itemOne={<ReactCompareSliderImage src={previewImage} alt="Original" />}
                itemTwo={<ReactCompareSliderImage src={resultImage} alt="Upscaled" />}
              />
              <Button
                size="icon"
                className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-background/90 hover:bg-background text-foreground backdrop-blur-sm z-10"
                onClick={() => handleDownload(result?.url || "")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ) : previewImage ? (
            <div className="relative">
              <img src={previewImage} alt="Preview" className="w-full h-auto" />
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-muted/30">
              <ImagePlus className="h-16 w-16 text-gray-400 dark:text-muted-foreground/40" />
              <p className="text-sm text-gray-500 dark:text-muted-foreground">Upload an image to get started</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

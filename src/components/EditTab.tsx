import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Pencil, Upload, Link, Download, X } from "lucide-react";
import { editImage, type ImageData } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EditTab() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setImageSource("upload");
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter edit instructions", variant: "destructive" });
      return;
    }

    const imageToEdit = imageSource === "url" ? imageUrl : uploadedImage;
    if (!imageToEdit) {
      toast({ title: "Please provide an image", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await editImage({
        prompt,
        image: imageToEdit,
        response_format: "url",
      });
      setResult(response.data[0]);
      toast({ title: "Image edited successfully!" });
    } catch (error) {
      toast({
        title: "Edit failed",
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
      a.download = `nano-banana-edited-${Date.now()}.png`;
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const previewImage = imageSource === "url" ? imageUrl : uploadedImage;

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
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-4 space-y-2">
            <Label>Upload Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="max-h-40 rounded-lg border object-contain"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-6 w-6"
                  onClick={clearUpload}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full border-dashed py-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Click to upload
              </Button>
            )}
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="edit-prompt">Edit Instructions</Label>
          <Textarea
            id="edit-prompt"
            placeholder="Add a rainbow in the sky, make it more vibrant..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        <Button onClick={handleEdit} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Editing...
            </>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Image
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Original</Label>
            <Card className="overflow-hidden">
              {previewImage ? (
                <img src={previewImage} alt="Original" className="w-full object-cover" />
              ) : (
                <CardContent className="flex aspect-square items-center justify-center text-muted-foreground">
                  <p className="text-sm">No image selected</p>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="space-y-2">
            <Label>Result</Label>
            <Card className="group relative overflow-hidden">
              {result ? (
                <>
                  <img
                    src={result.url || `data:image/png;base64,${result.b64_json}`}
                    alt="Edited"
                    className="w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(result.url || "")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </>
              ) : (
                <CardContent className="flex aspect-square items-center justify-center text-muted-foreground">
                  <p className="text-sm">Result will appear here</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

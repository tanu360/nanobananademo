import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, Link, X, ImagePlus, ShieldCheck, ShieldAlert, AlertCircle, Search } from "lucide-react";
import { detectSynthID, type SynthIDResponse } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface DetectorTabProps {
   onLoad?: () => void;
}

export function DetectorTab({ onLoad }: DetectorTabProps) {
   const [imageUrl, setImageUrl] = useState("");
   const [uploadedImage, setUploadedImage] = useState<string | null>(null);
   const [uploadedFileInfo, setUploadedFileInfo] = useState<{ name: string; size: string } | null>(null);
   const [imageSource, setImageSource] = useState<"url" | "upload">("url");
   const [loading, setLoading] = useState(false);
   const [result, setResult] = useState<SynthIDResponse | null>(null);
   const [isDragging, setIsDragging] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   // Notify parent that tab is loaded (only on mount)
   useEffect(() => {
      onLoad?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

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

   const handleDetect = async () => {
      const imageToDetect = imageSource === "url" ? imageUrl : uploadedImage;
      if (!imageToDetect) {
         toast({ title: "Please provide an image", variant: "destructive" });
         return;
      }

      setLoading(true);
      setResult(null);
      try {
         const response = await detectSynthID({
            image: imageSource === "upload" ? imageToDetect : undefined,
            url: imageSource === "url" ? imageToDetect : undefined,
         });
         setResult(response);

         if (response.error === true) {
            toast({
               title: "Analysis Error",
               description: response.reasoning,
               variant: "destructive",
            });
         } else if (response.isAIGenerated) {
            toast({ title: "AI-Generated Image Detected!", variant: "default" });
         } else {
            toast({ title: "Human-Created Image (Authentic)", variant: "default" });
         }
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "Unknown error";
         toast({
            title: "Detection failed",
            description: errorMessage,
            variant: "destructive",
         });
      } finally {
         setLoading(false);
      }
   };

   const clearUpload = () => {
      setUploadedImage(null);
      setUploadedFileInfo(null);
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };

   // Drag and drop handlers
   const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
   }, []);

   const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
   }, []);

   const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
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
   }, []);

   const previewImage = imageSource === "url" ? imageUrl : uploadedImage;

   const getResultIcon = () => {
      if (!result) return null;
      if (result.error === true) return <AlertCircle className="h-8 w-8 text-yellow-500" />;
      if (result.isAIGenerated) return <ShieldAlert className="h-8 w-8 text-red-500" />;
      return <ShieldCheck className="h-8 w-8 text-green-500" />;
   };

   const getResultTitle = () => {
      if (!result) return "";
      if (result.error === true) return "Analysis Error";
      if (result.isAIGenerated) return "AI-Generated Image";
      return "Human-Created Image";
   };

   const getResultBgColor = () => {
      if (!result) return "";
      if (result.error === true) return "bg-yellow-500/10 border-yellow-500/30";
      if (result.isAIGenerated) return "bg-red-500/10 border-red-500/30";
      return "bg-green-500/10 border-green-500/30";
   };

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
                  <Label htmlFor="detect-url">Image URL</Label>
                  <Input
                     id="detect-url"
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
                     className={cn(
                        "relative w-full border-2 border-dashed rounded-lg py-4 flex flex-col items-center justify-center cursor-pointer transition-colors",
                        isDragging ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
                     )}
                     onClick={() => !uploadedImage && fileInputRef.current?.click()}
                     onDragOver={handleDragOver}
                     onDragLeave={handleDragLeave}
                     onDrop={handleDrop}
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
                           <Upload className={cn("h-5 w-5 mb-1", isDragging ? "text-primary" : "text-muted-foreground")} />
                           <p className={cn("text-xs", isDragging ? "text-primary" : "text-muted-foreground")}>
                              {isDragging ? "Drop image here" : "Click or drag & drop (max 16MB)"}
                           </p>
                        </>
                     )}
                  </div>
               </TabsContent>
            </Tabs>

            <div className="space-y-3">
               <Label>SynthID Detection</Label>
               <p className="text-xs text-muted-foreground">
                  Detect if an image was created using NanoBanana AI or contains SynthID watermarks.
                  This helps verify the authenticity of images.
               </p>
            </div>

            <Button onClick={handleDetect} disabled={loading} className="w-full rounded-lg" size="lg">
               {loading ? (
                  <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Analyzing...
                  </>
               ) : (
                  <>
                     <Search className="mr-2 h-4 w-4" />
                     Detect SynthID
                  </>
               )}
            </Button>

            {result && (
               <Card className={cn("p-4 border-2", getResultBgColor())}>
                  <div className="flex items-start gap-4">
                     {getResultIcon()}
                     <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">{getResultTitle()}</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium">Confidence Score:</span>
                           <span className="text-sm bg-background/50 px-2 py-0.5 rounded">{result.score}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                        <p className="text-xs text-muted-foreground/70 pt-2">
                           {result.timestamp && new Date(result.timestamp).toLocaleString()}
                        </p>
                     </div>
                  </div>
               </Card>
            )}
         </div>

         <div className="flex flex-col space-y-2">
            <Card className={`overflow-hidden rounded-md ${!previewImage ? 'flex-1' : ''}`}>
               {previewImage ? (
                  <div className="relative">
                     <img src={previewImage} alt="Preview" className="w-full h-auto" />
                     {result && (
                        <div className={cn(
                           "absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm",
                           result.error === true ? "bg-yellow-500/90 text-yellow-950" :
                              result.isAIGenerated ? "bg-red-500/90 text-white" : "bg-green-500/90 text-white"
                        )}>
                           {result.error === true ? "Error" : result.isAIGenerated ? "AI Generated" : "Authentic"}
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="h-full min-h-[288px] flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-muted/30">
                     <ImagePlus className="h-16 w-16 text-gray-400 dark:text-muted-foreground/40" />
                     <p className="text-sm text-gray-500 dark:text-muted-foreground">Upload an image to detect SynthID</p>
                  </div>
               )}
            </Card>
         </div>
      </div>
   );
}

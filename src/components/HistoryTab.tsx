import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
   Dialog,
   DialogContent,
   DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Download, Trash2, Sparkles, Pencil, ZoomIn, Clock, X, ImageIcon, RefreshCw } from "lucide-react";
import {
   getHistory,
   deleteHistoryItem,
   clearHistory,
   type HistoryItem,
} from "@/lib/imageHistory";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const typeIcons = {
   generate: Sparkles,
   edit: Pencil,
   upscale: ZoomIn,
};

// All badges use white background in light, zinc in dark
const typeBadgeClass = "bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm";

const typeLabels = {
   generate: "Generated",
   edit: "Edited",
   upscale: "Upscaled",
};

interface HistoryTabProps {
   onRegenerate?: (prompt: string, model: string) => void;
   onEdit?: (imageUrl: string) => void;
   onUpscale?: (imageUrl: string) => void;
   onLoad?: () => void;
}

export function HistoryTab({ onRegenerate, onEdit, onUpscale, onLoad }: HistoryTabProps) {
   const [history, setHistory] = useState<HistoryItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

   const loadHistory = async () => {
      setLoading(true);
      const items = await getHistory();
      setHistory(items);
      setLoading(false);
   };

   useEffect(() => {
      loadHistory();
   }, []);

   // Notify parent that tab is loaded (only when loading completes)
   useEffect(() => {
      if (!loading) {
         onLoad?.();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [loading]);

   const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      toast({ title: "Image deleted from history" });
   };

   const handleClearAll = async () => {
      await clearHistory();
      setHistory([]);
      toast({ title: "History cleared" });
   };

   const handleDownload = async (item: HistoryItem, e?: React.MouseEvent) => {
      e?.stopPropagation();
      try {
         const a = document.createElement("a");
         a.href = item.imageUrl;
         a.download = `nanobanana-${item.type}-${Date.now()}.png`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         toast({ title: "Download started" });
      } catch {
         toast({ title: "Download failed", variant: "destructive" });
      }
   };

   const formatRelativeTime = (timestamp: number) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
   };

   const getModelName = (item: HistoryItem) => {
      if (item.params?.model) {
         const model = item.params.model as string;
         if (model === "nano-banana") return "Nano Banana";
         if (model === "nano-banana-editor") return "Nano Banana Editor";
         if (model === "nano-banana-upscaler") return "Nano Banana Upscaler";
         if (model.includes("ultra")) return "Imagen Ultra 4.0";
         if (model.includes("4.0-generate")) return "Imagen Pro 4.0";
         if (model.includes("4.0-fast")) return "Imagen Fast 4.0";
         if (model.includes("3.0-generate-002")) return "Imagen 3.0 v2";
         if (model.includes("3.0-generate-001")) return "Imagen 3.0 v1";
         if (model.includes("3.0-fast")) return "Imagen 3.0 Fast";
         return model;
      }
      return null;
   };

   return (
      <div className="space-y-6">
         {/* Header with count and clear button */}
         <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
               History
               <span className="text-muted-foreground">({history.length})</span>
               {history.length > 0 && (
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                        <Button
                           size="icon"
                           variant="ghost"
                           className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                        >
                           <Trash2 className="h-4 w-4" />
                        </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                           <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                           <AlertDialogDescription>
                              This will permanently delete all {history.length} images from your history. This action cannot be undone.
                           </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={handleClearAll}>
                              Clear All
                           </AlertDialogAction>
                        </AlertDialogFooter>
                     </AlertDialogContent>
                  </AlertDialog>
               )}
            </Label>
         </div>

         {/* Gallery Grid */}
         {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {[...Array(10)].map((_, i) => (
                  <div
                     key={i}
                     className="bg-muted animate-pulse rounded-2xl aspect-square"
                  />
               ))}
            </div>
         ) : history.length === 0 ? (
            <Card className="flex min-h-[300px] items-center justify-center border-dashed border-2 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10">
               <CardContent className="text-center text-muted-foreground py-12">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                     <ImageIcon className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="font-semibold text-lg mb-1">No history yet</p>
                  <p className="text-sm opacity-70">Your generated images will appear here</p>
               </CardContent>
            </Card>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {history.map((item, index) => {
                  const Icon = typeIcons[item.type];
                  return (
                     <div
                        key={item.id}
                        className="group relative break-inside-avoid cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => setSelectedItem(item)}
                     >
                        <div className="relative overflow-hidden rounded-2xl bg-muted/20 hover:ring-2 hover:ring-primary/50 transition-all duration-300 transform hover:scale-[1.02]">
                           <img
                              src={item.thumbnailUrl || item.imageUrl}
                              alt={item.prompt || item.type}
                              className="w-full h-auto object-cover"
                              loading="lazy"
                           />

                           {/* Type badge */}
                           <div className={cn(
                              "absolute top-2.5 left-2.5 p-1.5 rounded-full",
                              typeBadgeClass
                           )}>
                              <Icon className="h-3 w-3 text-black dark:text-white" />
                           </div>

                           {/* Gradient overlay on hover */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                           {/* Action buttons - appear on hover */}
                           <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <Button
                                 size="icon"
                                 variant="ghost"
                                 className="h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-black dark:text-white backdrop-blur-sm"
                                 onClick={(e) => handleDownload(item, e)}
                              >
                                 <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                 size="icon"
                                 variant="ghost"
                                 className="h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-red-500 hover:text-white text-red-500 dark:text-red-400 backdrop-blur-sm transition-colors"
                                 onClick={(e) => handleDelete(item.id, e)}
                              >
                                 <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                           </div>

                           {/* Bottom info - appears on hover */}
                           <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <div className="flex items-center gap-1.5 text-white/90">
                                 <Clock className="h-3 w-3" />
                                 <span className="text-[10px] font-medium">{formatRelativeTime(item.timestamp)}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}

         {/* Full image preview dialog */}
         <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="max-w-fit w-fit p-0 border-0 bg-transparent shadow-none [&>button]:hidden flex items-center justify-center" aria-describedby={undefined}>
               <VisuallyHidden.Root>
                  <DialogTitle>Image Preview</DialogTitle>
               </VisuallyHidden.Root>
               {selectedItem && (
                  <div className="rounded-lg overflow-hidden" style={{ display: 'table', maxWidth: '85vw' }}>
                     {/* Image container */}
                     <div className="relative" style={{ display: 'table-row' }}>
                        <div style={{ display: 'table-cell' }}>
                           <img
                              src={selectedItem.imageUrl}
                              alt={selectedItem.prompt || "Image"}
                              className="max-w-[85vw] max-h-[55vh] sm:max-h-[70vh] w-auto h-auto block rounded-t-lg object-contain"
                           />
                        </div>

                        {/* Close button - top right */}
                        <Button
                           size="icon"
                           variant="ghost"
                           className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-800 text-black dark:text-white backdrop-blur-sm border-0 z-10"
                           onClick={() => setSelectedItem(null)}
                        >
                           <X className="h-4 w-4" />
                        </Button>

                        {/* Download button - top right next to close */}
                        <Button
                           size="icon"
                           variant="ghost"
                           className="absolute top-3 right-14 h-9 w-9 rounded-full bg-white dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-800 text-black dark:text-white backdrop-blur-sm border-0 z-10"
                           onClick={() => handleDownload(selectedItem)}
                        >
                           <Download className="h-4 w-4" />
                        </Button>
                     </div>

                     {/* Info panel - table-caption at bottom forces it to match table (image) width */}
                     <div
                        className="bg-background/95 dark:bg-zinc-900 backdrop-blur-sm p-3 space-y-3 rounded-b-lg @container"
                        style={{ display: 'table-caption', captionSide: 'bottom' }}
                     >
                        {/* Row 1: Icon + Type label left, Model right */}
                        <div className="flex items-center justify-between gap-2">
                           <div className="flex items-center gap-2 shrink-0">
                              {(() => {
                                 const Icon = typeIcons[selectedItem.type];
                                 return (
                                    <span className="p-1.5 rounded-full bg-foreground/10">
                                       <Icon className="h-3.5 w-3.5 text-foreground" />
                                    </span>
                                 );
                              })()}
                              <span className="text-sm font-medium text-foreground">{typeLabels[selectedItem.type]}</span>
                           </div>
                           {getModelName(selectedItem) && (
                              <span className="text-xs text-muted-foreground text-right">
                                 {getModelName(selectedItem)}
                              </span>
                           )}
                        </div>

                        {/* Row 2: Prompt - scrollable but scrollbar hidden */}
                        {selectedItem.prompt && (
                           <p className="text-sm text-foreground/90 break-words max-h-20 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                              {selectedItem.prompt}
                           </p>
                        )}

                        {/* Row 3: Action buttons */}
                        <div className="flex gap-2 pt-1">
                           {selectedItem.type === "generate" && selectedItem.prompt && onRegenerate && (
                              <Button
                                 size="sm"
                                 variant="outline"
                                 className="flex-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 border-zinc-300 dark:border-zinc-600"
                                 onClick={() => {
                                    const model = (selectedItem.params?.model as string) || "nano-banana";
                                    onRegenerate(selectedItem.prompt!, model);
                                    setSelectedItem(null);
                                 }}
                                 title="Regenerate"
                              >
                                 <RefreshCw className="h-4 w-4" />
                              </Button>
                           )}
                           {onEdit && (
                              <Button
                                 size="sm"
                                 variant="outline"
                                 className="flex-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 border-zinc-300 dark:border-zinc-600"
                                 onClick={() => {
                                    onEdit(selectedItem.imageUrl);
                                    setSelectedItem(null);
                                 }}
                                 title="Edit"
                              >
                                 <Pencil className="h-4 w-4" />
                              </Button>
                           )}
                           {onUpscale && (
                              <Button
                                 size="sm"
                                 variant="outline"
                                 className="flex-1 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 border-zinc-300 dark:border-zinc-600"
                                 onClick={() => {
                                    onUpscale(selectedItem.imageUrl);
                                    setSelectedItem(null);
                                 }}
                                 title="Upscale"
                              >
                                 <ZoomIn className="h-4 w-4" />
                              </Button>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </DialogContent>
         </Dialog>
      </div>
   );
}

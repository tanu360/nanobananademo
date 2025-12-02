import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string | null;
  afterImage: string | null;
  beforeLabel?: string;
  afterLabel?: string;
  onDownload?: () => void;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  onDownload,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  if (!beforeImage && !afterImage) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Before Image (Full) */}
      {beforeImage && (
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}

      {/* After Image (Clipped) */}
      {afterImage && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <img
            src={afterImage}
            alt={afterLabel}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      )}

      {/* Slider Handle */}
      {beforeImage && afterImage && (
        <div
          className="absolute top-0 bottom-0 cursor-ew-resize"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="h-full w-1 bg-background shadow-lg" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-primary shadow-lg">
            <div className="flex gap-0.5">
              <div className="h-4 w-0.5 bg-primary-foreground rounded-full" />
              <div className="h-4 w-0.5 bg-primary-foreground rounded-full" />
            </div>
          </div>
        </div>
      )}

      {/* Labels */}
      <span className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
        {beforeLabel}
      </span>
      {afterImage && (
        <span className="absolute right-2 top-2 rounded bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
          {afterLabel}
        </span>
      )}

      {/* Download Button */}
      {afterImage && onDownload && (
        <Button
          size="icon"
          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function OptionCard({ selected, onClick, children, className }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-md border px-4 py-3 text-center transition-colors",
        selected
          ? "border-foreground bg-foreground/5 text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-foreground/50 hover:bg-muted/50",
        className
      )}
    >
      {children}
    </button>
  );
}

interface AspectRatioIconProps {
  ratio: string;
  className?: string;
}

export function AspectRatioIcon({ ratio, className }: AspectRatioIconProps) {
  const getIconStyle = () => {
    switch (ratio) {
      case "16:9":
        return "w-7 h-4";
      case "4:3":
        return "w-6 h-5";
      case "1:1":
        return "w-5 h-5";
      case "3:4":
        return "w-4 h-5";
      case "9:16":
        return "w-3 h-6";
      default:
        return "w-5 h-5";
    }
  };

  return (
    <div className={cn("bg-foreground", getIconStyle(), className)} />
  );
}

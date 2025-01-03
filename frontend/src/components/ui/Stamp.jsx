import { cn } from "@/lib/utils";

export function Stamp({ className, children }) {
  return (
    <div
      className={cn(
        "absolute top-1/2 left-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2", // Centering in the middle
        "w-24 h-10 flex items-center justify-center", // Rectangle shape (adjust the size here)
        "rotate-12", // Rotation effect
        "border-4 border-green-600", // Border style
        "bg-green-100 dark:bg-green-900", // Background color
        "text-green-600 dark:text-green-100", // Text color
        "font-bold text-sm",
        "shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

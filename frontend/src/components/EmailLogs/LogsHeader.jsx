import { History } from "lucide-react";

export function LogsHeader({ isLoading, count }) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <History className="w-8 h-8" />
        Email Change History
      </h1>
      <p className="text-muted-foreground">
        {isLoading
          ? "Loading logs..."
          : `Showing ${count} email change ${
              count === 1 ? "record" : "records"
            }`}
      </p>
    </div>
  );
}

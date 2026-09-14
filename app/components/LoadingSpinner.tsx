import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 size={32} className="animate-spin text-[#4f46e5]" />
    </div>
  );
}

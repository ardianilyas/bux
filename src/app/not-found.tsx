import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4 text-center p-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Page Not Found</h2>
        <p className="text-muted-foreground max-w-[500px]">
          The page you are looking for does not exist or has been moved.
          Please check the URL or return to the dashboard.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}

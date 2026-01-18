import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FeatureDisabledPageProps {
  featureName: string;
  description?: string;
}

export function FeatureDisabledPage({ featureName, description }: FeatureDisabledPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full border-amber-200 dark:border-amber-900/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-500" />
          </div>
          <CardTitle className="text-2xl">Feature Disabled</CardTitle>
          <CardDescription className="text-base mt-2">
            {description || `The ${featureName} feature is currently disabled.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This feature has been temporarily disabled by the administrators. Please check back later or contact support if you have questions.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="default">
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/support">Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

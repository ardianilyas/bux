"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AccountStatusView() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && session?.user) {
      const userStatus = (session.user as any)?.status;
      if (userStatus === "active" || !userStatus) {
        // Active users shouldn't be here
        router.push("/dashboard");
      } else {
        setStatus(userStatus);
      }
    } else if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (isPending || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isBanned = status === "banned";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {isBanned ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m4.9 4.9 14.2 14.2" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            )}
          </div>
          <CardTitle className={isBanned ? "text-red-500" : "text-amber-500"}>
            {isBanned ? "Account Banned" : "Account Suspended"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {isBanned
              ? "Your account has been permanently banned due to a violation of our terms of service. You can no longer access this application."
              : "Your account has been temporarily suspended. This may be due to unusual activity or a policy review. Please contact support for more information."}
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake, please contact{" "}
            <a
              href="mailto:support@bux.app"
              className="text-primary hover:underline"
            >
              support@bux.app
            </a>
          </p>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

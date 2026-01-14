"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">B</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
        {footer && <CardFooter className="flex flex-col space-y-4">{footer}</CardFooter>}
      </Card>
    </div>
  );
}

type AuthSubmitButtonProps = {
  isLoading: boolean;
  loadingText: string;
  text: string;
};

export function AuthSubmitButton({ isLoading, loadingText, text }: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="w-full mt-4"
      disabled={isLoading}
    >
      {isLoading ? loadingText : text}
    </Button>
  );
}

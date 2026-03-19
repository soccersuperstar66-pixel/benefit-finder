import * as React from "react";
import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-card border rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5">
          <div className="w-20 h-20 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground/80">Page not found</h2>
          <p className="text-muted-foreground leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button size="lg" className="w-full">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

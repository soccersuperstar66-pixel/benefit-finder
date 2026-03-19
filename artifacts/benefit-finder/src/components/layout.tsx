import * as React from "react";
import { Link } from "wouter";
import { ShieldCheck } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">
              GovBenefit Finder
            </span>
          </Link>
          <nav className="hidden sm:flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <a href="#" className="hover:text-primary transition-colors">About the Tool</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              This is a demonstration tool. Results are estimates and not legal or financial advice.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

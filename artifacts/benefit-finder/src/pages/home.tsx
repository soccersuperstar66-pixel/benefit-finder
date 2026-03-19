import * as React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { useCreateSession } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createSession = useCreateSession();

  const handleStart = () => {
    createSession.mutate(undefined, {
      onSuccess: (data) => {
        setLocation(`/session/${data.sessionId}`);
      },
      onError: () => {
        toast({
          title: "Error starting session",
          description: "We couldn't connect to the service. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Layout>
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 md:pt-24 pb-16 md:pb-32">
          {/* Background decoration */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary)),transparent_50%)] opacity-70" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-6 border border-accent/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  Updated for 2025 Guidelines
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
                  Discover government benefits you may qualify for.
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                  Answer a few simple questions about your situation to find out which federal tax credits and assistance programs can help you and your family.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="gap-2 text-lg px-8"
                    onClick={handleStart}
                    disabled={createSession.isPending}
                  >
                    {createSession.isPending ? "Starting..." : "Start your check"}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn how it works
                  </Button>
                </div>
                
                <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Takes ~3 minutes
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    100% Free
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    No sign-up required
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative hidden md:block"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 rounded-3xl transform rotate-3 scale-105" />
                <div className="relative bg-card rounded-3xl shadow-xl border overflow-hidden p-8 aspect-[4/3] flex items-center justify-center">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/hero-illustration.png`} 
                    alt="Family and community illustration" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features/Trust Section */}
        <section className="py-16 md:py-24 bg-card border-y">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl text-foreground mb-4">A simple, secure process</h2>
              <p className="text-muted-foreground text-lg">We designed this tool to be as straightforward as possible, respecting your time and privacy.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: ShieldCheck,
                  title: "Private & Secure",
                  desc: "We don't ask for your name, SSN, or exact address. Your answers are only used to estimate your eligibility."
                },
                {
                  icon: HeartHandshake,
                  title: "Comprehensive",
                  desc: "We check your eligibility against dozens of federal programs including EITC, CTC, SNAP, and more."
                },
                {
                  icon: CheckCircle2,
                  title: "Actionable Results",
                  desc: "At the end, you'll get a clear summary of what you might qualify for and official links to apply."
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border hover:border-primary/20 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-secondary text-primary flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl mb-3 font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

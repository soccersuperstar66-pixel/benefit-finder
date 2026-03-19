import * as React from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, RefreshCw, Info, CheckCircle2, AlertCircle, Share2, Printer, Check } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  useGetSession,
  useSubmitAnswer,
  useResetSession,
  useGoBack,
} from "@workspace/api-client-react";
import type { Benefit } from "@workspace/api-client-react";

const CATEGORY_MAP: Record<string, string> = {
  tax_credit: "Tax Credits",
  food_assistance: "Food Assistance",
  housing: "Housing",
  healthcare: "Healthcare",
  education: "Education",
  other: "Other",
};

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [numInput, setNumInput] = React.useState<string>("");
  const [lastConfirmation, setLastConfirmation] = React.useState<string | null>(null);

  const { data: session, isLoading, isError, refetch } = useGetSession(id || "");
  const submitAnswer = useSubmitAnswer();
  const resetSession = useResetSession();
  const goBackMutation = useGoBack();

  React.useEffect(() => {
    setNumInput("");
  }, [session?.currentQuestion?.id]);

  if (!id) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading session...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !session) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-display font-semibold">Session not found</h2>
            <p className="text-muted-foreground">We couldn't find this session or it has expired. Let's start a new check.</p>
            <Button onClick={() => setLocation("/")} size="lg" className="w-full">
              Go to Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAnswer = (answer: string, label?: string) => {
    const resolvedLabel = label ?? answer;
    submitAnswer.mutate(
      { sessionId: id, data: { questionId: session.currentQuestion!.id, answer } },
      {
        onSuccess: () => {
          setLastConfirmation(resolvedLabel);
          refetch();
        },
      }
    );
  };

  const handleNumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numInput) return;
    handleAnswer(numInput);
  };

  const handleStartOver = () => {
    resetSession.mutate({ sessionId: id }, {
      onSuccess: () => {
        setLastConfirmation(null);
        refetch();
      }
    });
  };

  const handleGoBack = () => {
    goBackMutation.mutate({ sessionId: id }, {
      onSuccess: () => {
        setLastConfirmation(null);
        refetch();
      }
    });
  };

  const isComplete = session.status === "complete";
  const canGoBack = !isComplete && session.questionNumber > 1;

  return (
    <Layout>
      <div className="flex-1 bg-background flex flex-col relative max-w-3xl mx-auto w-full">
        {/* Progress Bar Header */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur py-4 px-4 border-b print:hidden">
          <div className="flex items-center justify-between text-sm font-medium mb-2">
            <span className="text-muted-foreground">
              {isComplete ? "Check Complete" : `Question ${session.questionNumber} of ${session.totalQuestions}`}
            </span>
            <span className="text-primary">{session.progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${session.progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 flex flex-col w-full pb-32">
          <AnimatePresence mode="wait">
            {!isComplete && session.currentQuestion ? (
              <motion.div
                key={session.currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl mx-auto space-y-6"
              >
                {/* Confirmation bubble for previous answer */}
                <AnimatePresence>
                  {lastConfirmation && (
                    <motion.div
                      key="confirmation"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.25 }}
                      className="flex justify-end"
                    >
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%] shadow-sm">
                        <p className="text-sm font-medium">
                          You answered: <span className="font-semibold">{lastConfirmation}</span>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bot Bubble */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground shadow-md">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=CivicBot&backgroundColor=transparent" alt="Bot" className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <div className="bg-card border shadow-sm rounded-2xl rounded-tl-sm p-5 md:p-6 inline-block">
                      <h2 className="text-xl md:text-2xl font-display text-foreground leading-snug">
                        {session.currentQuestion.text}
                      </h2>
                    </div>
                    {session.currentQuestion.helpText && (
                      <div className="flex items-start gap-2 text-muted-foreground text-sm pl-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{session.currentQuestion.helpText}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer Area */}
                <div className="pl-14 space-y-3 pt-2">
                  {(session.currentQuestion.type === "single_choice" || session.currentQuestion.type === "yes_no") && (
                    <div className="flex flex-col gap-3">
                      {session.currentQuestion.options.map((opt) => (
                        <Button
                          key={opt.value}
                          variant="choice"
                          className="group relative overflow-hidden"
                          onClick={() => handleAnswer(opt.value, opt.label)}
                          disabled={submitAnswer.isPending}
                        >
                          <span className="relative z-10 flex items-center justify-between w-full">
                            {opt.label}
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                          </span>
                        </Button>
                      ))}
                    </div>
                  )}

                  {session.currentQuestion.type === "number_input" && (
                    <form onSubmit={handleNumSubmit} className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        {session.currentQuestion.inputUnit === "$" && (
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-muted-foreground text-lg">$</span>
                          </div>
                        )}
                        <input
                          type="number"
                          value={numInput}
                          onChange={(e) => setNumInput(e.target.value)}
                          min={session.currentQuestion.inputMin ?? undefined}
                          max={session.currentQuestion.inputMax ?? undefined}
                          className={`w-full h-14 px-4 rounded-xl border-2 border-input bg-background text-lg shadow-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all ${
                            session.currentQuestion.inputUnit === "$" ? "pl-8" : ""
                          }`}
                          placeholder="Enter a number..."
                          autoFocus
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:w-auto h-14 px-8 text-base"
                        disabled={!numInput || submitAnswer.isPending}
                      >
                        Continue
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </form>
                  )}

                  {/* Go Back button */}
                  {canGoBack && (
                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGoBack}
                        disabled={goBackMutation.isPending || submitAnswer.isPending}
                        className="text-muted-foreground hover:text-foreground gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Go back
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <ResultsView
                benefits={session.benefits}
                onRestart={handleStartOver}
                isResetting={resetSession.isPending}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}

function ResultsView({
  benefits,
  onRestart,
  isResetting,
}: {
  benefits: Benefit[];
  onRestart: () => void;
  isResetting: boolean;
}) {
  const [activeTab, setActiveTab] = React.useState<string>("All");
  const [copied, setCopied] = React.useState(false);

  const presentCategories = React.useMemo(() => {
    const cats = new Set(benefits.map((b) => b.category));
    return ["All", ...Object.entries(CATEGORY_MAP)
      .filter(([key]) => cats.has(key))
      .map(([, label]) => label)];
  }, [benefits]);

  const filteredBenefits = React.useMemo(() => {
    if (activeTab === "All") return benefits;
    const categoryKey = Object.entries(CATEGORY_MAP).find(([, label]) => label === activeTab)?.[0];
    return benefits.filter((b) => b.category === categoryKey);
  }, [benefits, activeTab]);

  const grouped = React.useMemo(() => {
    return filteredBenefits.reduce((acc, benefit) => {
      acc[benefit.category] = acc[benefit.category] || [];
      acc[benefit.category].push(benefit);
      return acc;
    }, {} as Record<string, Benefit[]>);
  }, [filteredBenefits]);

  const getCategoryTitle = (cat: string) => {
    return CATEGORY_MAP[cat] ?? cat.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-700 mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display text-foreground">Your Results</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Based on your answers, you may be eligible for the following benefits and programs.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2">
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Link copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share your results
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {benefits.length === 0 ? (
        <div className="bg-card border rounded-2xl p-8 text-center shadow-sm max-w-xl mx-auto">
          <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Matches Found</h3>
          <p className="text-muted-foreground mb-6">
            Based on the information provided, we didn't find specific federal benefits that match your situation right now. However, circumstances change and state/local programs might still be available to you.
          </p>
        </div>
      ) : (
        <>
          {/* Category filter tabs */}
          {presentCategories.length > 2 && (
            <div className="flex flex-wrap gap-2 justify-center print:hidden">
              {presentCategories.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150 ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Benefit cards */}
          <div className="space-y-10">
            <AnimatePresence mode="wait">
              {Object.entries(grouped).map(([category, items], i) => (
                <motion.div
                  key={`${activeTab}-${category}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.08 + 0.1 }}
                >
                  <h2 className="text-2xl font-display border-b pb-2 mb-6 text-foreground/90">
                    {getCategoryTitle(category)}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                    {items.map((benefit) => (
                      <div key={benefit.id} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full print:shadow-none print:border print:break-inside-avoid">
                        <h3 className="text-xl font-semibold mb-2 pr-8">{benefit.name}</h3>
                        {benefit.estimatedValue && (
                          <div className="inline-block bg-green-50 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-3 self-start border border-green-200">
                            Est. Value: {benefit.estimatedValue}
                          </div>
                        )}
                        <p className="text-muted-foreground mb-4 flex-1">
                          {benefit.description}
                        </p>
                        <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-muted">
                          <p className="text-sm"><strong>Why you matched:</strong> {benefit.reason}</p>
                        </div>
                        <Button asChild variant="outline" className="w-full mt-auto group print:hidden">
                          <a href={benefit.learnMoreUrl} target="_blank" rel="noopener noreferrer">
                            Learn how to apply
                            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </a>
                        </Button>
                        <p className="hidden print:block text-sm text-muted-foreground mt-4 break-all">{benefit.learnMoreUrl}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Start over */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center mt-12 print:hidden">
        <h3 className="text-xl font-display mb-2">Want to try a different scenario?</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          You can run this check as many times as you want to see how changes in income or family size might affect your benefits.
        </p>
        <Button
          size="lg"
          variant="default"
          onClick={onRestart}
          disabled={isResetting}
          className="px-8"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isResetting ? "animate-spin" : ""}`} />
          {isResetting ? "Resetting..." : "Start Over"}
        </Button>
      </div>
    </motion.div>
  );
}

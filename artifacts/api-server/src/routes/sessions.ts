import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, sessionsTable } from "@workspace/db";
import {
  GetSessionParams,
  GetSessionResponse,
  SubmitAnswerParams,
  SubmitAnswerBody,
  SubmitAnswerResponse,
  ResetSessionParams,
  ResetSessionResponse,
} from "@workspace/api-zod";
import { QUESTIONS, TOTAL_QUESTIONS } from "../lib/questions.js";
import { computeBenefits } from "../lib/eligibility.js";

const router: IRouter = Router();

function buildSessionState(session: {
  sessionId: string;
  status: string;
  currentQuestionIndex: number;
  answers: unknown;
  benefits: unknown;
}) {
  const answers = (session.answers ?? {}) as Record<string, string>;
  const benefits = (session.benefits ?? []) as object[];
  const questionIndex = session.currentQuestionIndex;
  const isComplete = session.status === "complete";
  const currentQuestion = isComplete ? null : (QUESTIONS[questionIndex] ?? null);
  const progressPercent = isComplete
    ? 100
    : Math.round((questionIndex / TOTAL_QUESTIONS) * 100);

  return {
    sessionId: session.sessionId,
    status: session.status as "in_progress" | "complete",
    currentQuestion: currentQuestion
      ? {
          ...currentQuestion,
          helpText: currentQuestion.helpText ?? null,
          inputMin: currentQuestion.inputMin ?? null,
          inputMax: currentQuestion.inputMax ?? null,
          inputUnit: currentQuestion.inputUnit ?? null,
        }
      : null,
    questionNumber: isComplete ? TOTAL_QUESTIONS : questionIndex + 1,
    totalQuestions: TOTAL_QUESTIONS,
    answers,
    benefits,
    progressPercent,
  };
}

router.post("/sessions", async (_req, res): Promise<void> => {
  const sessionId = randomUUID();
  await db.insert(sessionsTable).values({
    sessionId,
    status: "in_progress",
    answers: {},
    currentQuestionIndex: 0,
    benefits: [],
  });

  const state = buildSessionState({
    sessionId,
    status: "in_progress",
    currentQuestionIndex: 0,
    answers: {},
    benefits: [],
  });

  res.status(201).json(GetSessionResponse.parse(state));
});

router.get("/sessions/:sessionId", async (req, res): Promise<void> => {
  const params = GetSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sessionId, params.data.sessionId));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const state = buildSessionState(session);
  res.json(GetSessionResponse.parse(state));
});

router.post("/sessions/:sessionId/answer", async (req, res): Promise<void> => {
  const params = SubmitAnswerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = SubmitAnswerBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sessionId, params.data.sessionId));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  if (session.status === "complete") {
    const state = buildSessionState(session);
    res.json(SubmitAnswerResponse.parse(state));
    return;
  }

  const currentQuestion = QUESTIONS[session.currentQuestionIndex];
  if (!currentQuestion || currentQuestion.id !== body.data.questionId) {
    res.status(400).json({ error: "Answer does not match the current question" });
    return;
  }

  // Validate the submitted answer against allowed options
  if (currentQuestion.type === "single_choice" || currentQuestion.type === "yes_no") {
    const allowedValues = currentQuestion.options.map((o) => o.value);
    if (!allowedValues.includes(body.data.answer)) {
      res.status(400).json({
        error: `Invalid answer '${body.data.answer}'. Allowed values: ${allowedValues.join(", ")}`,
      });
      return;
    }
  } else if (currentQuestion.type === "number_input") {
    const parsed = Number(body.data.answer);
    if (isNaN(parsed)) {
      res.status(400).json({ error: "Answer must be a valid number for this question" });
      return;
    }
    if (currentQuestion.inputMin != null && parsed < currentQuestion.inputMin) {
      res.status(400).json({ error: `Answer must be at least ${currentQuestion.inputMin}` });
      return;
    }
    if (currentQuestion.inputMax != null && parsed > currentQuestion.inputMax) {
      res.status(400).json({ error: `Answer must be at most ${currentQuestion.inputMax}` });
      return;
    }
  }

  const existingAnswers = (session.answers ?? {}) as Record<string, string>;
  const updatedAnswers: Record<string, string> = {
    ...existingAnswers,
    [body.data.questionId]: body.data.answer,
  };

  const nextIndex = session.currentQuestionIndex + 1;
  const isComplete = nextIndex >= TOTAL_QUESTIONS;

  const benefits = isComplete ? computeBenefits(updatedAnswers) : [];

  const [updated] = await db
    .update(sessionsTable)
    .set({
      answers: updatedAnswers,
      currentQuestionIndex: nextIndex,
      status: isComplete ? "complete" : "in_progress",
      benefits: benefits as never,
    })
    .where(eq(sessionsTable.sessionId, params.data.sessionId))
    .returning();

  if (!updated) {
    res.status(500).json({ error: "Failed to update session" });
    return;
  }

  const state = buildSessionState(updated);
  res.json(SubmitAnswerResponse.parse(state));
});

router.post("/sessions/:sessionId/reset", async (req, res): Promise<void> => {
  const params = ResetSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sessionId, params.data.sessionId));

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const [updated] = await db
    .update(sessionsTable)
    .set({
      answers: {},
      currentQuestionIndex: 0,
      status: "in_progress",
      benefits: [],
    })
    .where(eq(sessionsTable.sessionId, params.data.sessionId))
    .returning();

  if (!updated) {
    res.status(500).json({ error: "Failed to reset session" });
    return;
  }

  const state = buildSessionState(updated);
  res.json(ResetSessionResponse.parse(state));
});

export default router;

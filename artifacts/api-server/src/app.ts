import express, { type Express } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { scheduleCleanup } from "./scripts/cleanup-sessions.js";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate-limit session creation: 20 new sessions per IP per hour
const createSessionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sessions created. Please try again later." },
});
app.use("/api/sessions", (req, res, next) => {
  if (req.method === "POST" && req.path === "/") {
    return createSessionLimiter(req, res, next);
  }
  next();
});

app.use("/api", router);

// Start background cleanup of expired sessions (runs every 6 hours)
scheduleCleanup();

export default app;

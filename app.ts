import { Hono } from "hono";
import { logger } from "hono/logger";
import Course from "./src/core/course";
import { clerkMiddleware } from "@hono/clerk-auth";
import Category from "./src/core/category";
import Chapter from "./src/core/chapter";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";

const app = new Hono();
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
  logger(),
  clerkMiddleware(),
);

app.use(
  "/api/*",
  csrf({
    origin: "http://localhost:3000",
  }),
);

app
  .route("/api/courses", Course)
  .route("/api/categories", Category)
  .route("/api/courses/:course_id/chapters", Chapter);

export default app;

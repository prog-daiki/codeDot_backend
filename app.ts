import { Hono } from "hono";
import { logger } from "hono/logger";
import Course from "./src/core/course";
import { clerkMiddleware } from "@hono/clerk-auth";
import Category from "./src/core/category";
import Chapter from "./src/core/chapter";

const app = new Hono();
app.use("*", logger(), clerkMiddleware());
app
  .route("/api/courses", Course)
  .route("/api/categories", Category)
  .route("/api/courses/:course_id/chapters", Chapter);

export default app;

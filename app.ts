import { Hono } from "hono";
import { logger } from "hono/logger";
import Course from "./src/core/course";
import { clerkMiddleware } from "@hono/clerk-auth";
import Category from "./src/core/category";

const app = new Hono();
app.use("*", logger(), clerkMiddleware());
app.route("/api/courses", Course).route("/api/categories", Category);

export default app;

import express, { Request, Response } from "express";
import path from "path";
import compression from "compression";
import favicon from "serve-favicon";
import bodyParser from "body-parser";

/**
 * Import components.
 */
import { router as userRouter } from "./components/user";
import { router as apiRouter } from "./components/api";

// Initialize Express.
export const app = express();

// Express configuration.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
    // Prevent cross-origin wildcards, this is our solution.
    const origin: string = <string> req.headers['origin'];
    res.append('Access-Control-Allow-Origin', [origin]);
    res.append('Access-Control-Allow-Credentials', 'true');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Publish assets.
app.use("/", express.static(path.join(__dirname, "../public")));

// Set favicon.
// app.use(favicon(path.join(__dirname, "../public", "favicon.ico")));

/**
 * App routes
 */
app.use("/user", userRouter);
app.use("/api", apiRouter);

export default app;
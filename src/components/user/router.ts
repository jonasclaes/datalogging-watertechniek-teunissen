import express, { Request, Response } from "express";

export const router = express.Router();

/**
 * GET index page.
 */
router.get("/", (req: Request, res: Response) => {
    res.render("pages/index");
});

/**
 * GET history page.
 */
router.get("/history", (req: Request, res: Response) => {
    res.render("pages/history");
});

/**
 * GET history in detail page.
 */
router.get("/history/detail", (req: Request, res: Response) => {
    res.render("pages/history-detail");
});
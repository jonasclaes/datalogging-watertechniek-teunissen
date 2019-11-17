import express, { Request, Response } from "express";
import { internetHealth, databaseHealth } from "../health";
import { router as historyRouter } from "../history";
import { router as fileRouter } from "../file";

export const router = express.Router();

/**
 * GET API info.
 */
router.get("/", async (req: Request, res: Response) => {
    const healthResponse = {
        internet: internetHealth.toJson(),
        database: databaseHealth.toJson()
    };

    res.json(healthResponse);
});

/**
 * History route.
 */
router.use("/history", historyRouter);

/**
 * File route.
 */
router.use("/file", fileRouter);
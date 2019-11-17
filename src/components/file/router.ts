import express, { Request, Response } from "express";
import { file } from "./index";

export const router = express.Router();

/**
 * GET image.
 * Query parameters: name: string;
 */
router.get("/", async (req: Request, res: Response) => {
    const fileResults = await file.read(req.query.run_id, req.query.limit, req.query.offset);

    const fileResponse = {
        data: fileResults
    }
    
    res.json(fileResponse);
});

/**
 * POST image.
 * Body parameters: run_id: number; name: string; data: string;
 */
router.post("/", async (req: Request, res: Response) => {
    const fileQuery = await file.create(req.body.run_id, req.body.name, req.body.data, req.body.type);

    const fileResponse = {
        rowCount: fileQuery
    }

    res.json(fileResponse);
});

/**
 * PUT history.
 */
router.put("/", async (req: Request, res: Response) => {
    const fileQuery = await file.update(req.body.id, req.body.run_id, req.body.name, req.body.data, req.body.type);

    const fileResponse = {
        rowCount: fileQuery
    }

    res.json(fileResponse);
});

/**
 * DELETE history.
 */
router.delete("/", async (req: Request, res: Response) => {
    const fileQuery = await file.delete(req.body.id);

    const fileResponse = {
        rowCount: fileQuery
    }

    res.json(fileResponse);
});
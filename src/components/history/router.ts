import express, { Request, Response } from "express";
import { history } from "./index";

export const router = express.Router();

/**
 * GET history.
 * Query parameters: name: string; limit: number; offset: number;
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const historyResults = await history.read(req.query.name, req.query.limit, req.query.offset);
        const totalRows = await history.count(req.query.name);
    
        const historyResponse = {
            data: historyResults,
            selectedRows: historyResults.length,
            totalRows: totalRows,
            limit: parseInt(req.query.limit) || 50,
            offset: parseInt(req.query.offset) || 0
        }
        
        res.json(historyResponse);
    } catch (err) {
        const errorResponse = {
            err: err
        }

        res.json(errorResponse);
    }
});

/**
 * GET history details.
 * Query parameters: id: number;
 */
router.get("/detail", async (req: Request, res: Response) => {
    const historyResults = await history.readbyId(req.query.id);

    const historyResponse = {
        data: historyResults
    }
    
    res.json(historyResponse);
});

/**
 * POST history.
 * Body parameters: name: string; date: string; client: string; pump: string;
 */
router.post("/", async (req: Request, res: Response) => {
    const historyResults = await history.create(req.body.name, req.body.date, req.body.client, req.body.pump, req.body.data);

    const historyResponse = {
        data: historyResults,
        totalRows: historyResults.length
    }

    res.json(historyResponse);
});

/**
 * PUT history.
 */
router.put("/", async (req: Request, res: Response) => {
    const historyResults = await history.update(req.body.id, req.body.name, req.body.date, req.body.client, req.body.pump, req.body.data);

    const historyResponse = {
        data: historyResults,
        totalRows: historyResults.length
    }

    res.json(historyResponse);
});

/**
 * DELETE history.
 */
router.delete("/", async (req: Request, res: Response) => {
    const historyQuery = await history.delete(req.body.id);

    const historyResponse = {
        rowCount: historyQuery
    }

    res.json(historyResponse);
});
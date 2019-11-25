import { default as WebSocket } from "ws";
import { wss } from "./server";

/**
 * Import components.
 */
import { machine, Machine, EStatus, IReading, IData } from "./components/machine";

wss.on("connection", (ws: WebSocket) => {
    ws.on("message", async (message: string) => {
        // Try to parse an instruction and data.
        try {
            const parsedJSON = JSON.parse(message);
            const instruction = parsedJSON.instruction;
            const data = parsedJSON.data;

            if (instruction !== undefined && data !== undefined) {
                instruction === "machine.report_status" ? machine.reportStatus(machine.getStatus()) : false;
                instruction === "machine.reset" ? await machine.reset() : false;
                instruction === "machine.start" ? await machine.start() : false;
                instruction === "machine.abort" ? await machine.abort() : false;
                instruction === "machine.debug.processGraph" ? await machine.processGraph(data.id) : false;
                instruction === "data.saved" ? await machine.processGraph(data.id) : false;
                instruction === "data.getCurrent" ? machine.getCurrentData() : false;
            }
        } catch (err) {
            console.error(err);
        }
    });

    machine.on("status", (status: EStatus) => {
        const statusObject: IData = {
            instruction: "status",
            data: status
        };

        ws.send(JSON.stringify(statusObject));
    });

    machine.on("reading", (reading: IReading) => {
        const statusObject: IData = {
            instruction: "reading",
            data: reading
        }

        ws.send(JSON.stringify(statusObject));
    });

    machine.on("data", (data: IData) => {
        ws.send(JSON.stringify(data));
    });
});
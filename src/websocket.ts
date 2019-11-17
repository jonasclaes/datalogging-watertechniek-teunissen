import { default as WebSocket } from "ws";
import { wss } from "./server";

/**
 * Import components.
 */
import { machine, Machine, EStatus, IReading } from "./components/machine";

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
                instruction === "data.saved" ? await machine.processGraph(data.id) : false;
            }
        } catch (err) {
            console.error(err);
        }
    });

    machine.on("status", (status: EStatus) => {
        const statusResponse = JSON.stringify({
            instruction: "status",
            data: status
        });

        ws.send(statusResponse);
    });

    machine.on("reading", (reading: IReading) => {
        const statusResponse = JSON.stringify({
            instruction: "reading",
            data: reading
        });

        ws.send(statusResponse);
    });
});
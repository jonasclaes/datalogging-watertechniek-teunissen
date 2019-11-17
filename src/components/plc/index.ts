import { PLC } from "./PLC";

export const plc = new PLC({
    host: process.env.PLC_HOST || "192.168.0.1",
    port: parseInt(process.env.PLC_PORT || "102"),
    rack: parseInt(process.env.PLC_RACK || "0"),
    slot: parseInt(process.env.PLC_SLOT || "1")
});

export { PLC } from "./PLC";
export { IVariableObject } from "./IVariableObject";
export { IItemTimerObject } from "./IItemTimerObject";
export const enum EStatus {
    AWAIT_PROGRAM_START = "AWAIT_PROGRAM_START",
    AWAIT_PLC_START_CMD = "AWAIT_PLC_START_CMD",
    RUNNING = "RUNNING",
    FINISHING = "FINISHING",
    FINISHED = "FINISHED",
    ABORTING = "ABORTING",
    ABORTED = "ABORTED",
    ERRORED = "ERRORED"
}
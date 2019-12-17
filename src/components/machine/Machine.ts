import { EventEmitter } from "events";
import { EStatus } from "./EStatus";
import { IReading } from "./IReading";
import { PLC } from "../plc";
import { promisify } from "util";
import { exec } from "child_process";
import { default as path } from "path";
import { file, EFileType } from "../file";
import { default as fs } from "fs";
import { history } from "../history";
import { IData } from "./IData";

export class Machine extends EventEmitter {
    private status: EStatus;
    private plc: PLC;
    private currentReadingBuffer: Array<any>;

    constructor () {
        super();
        // Set status.
        this.status = EStatus.AWAIT_PROGRAM_START;

        // Initialize a new PLC instance.
        this.plc = new PLC({
            host: process.env.PLC_HOST || "192.168.0.1",
            port: parseInt(process.env.PLC_PORT || "102"),
            rack: parseInt(process.env.PLC_RACK || "0"),
            slot: parseInt(process.env.PLC_SLOT || "1")
        });

        // Create an empty buffer.
        this.currentReadingBuffer = [];

        // Define our variable synonyms.
        this.plc.addItemSynonym("start", `DB${process.env.PLC_DB || "100"},X0.0`);
        this.plc.addItemSynonym("stop", `DB${process.env.PLC_DB || "100"},X0.1`);
        this.plc.addItemSynonym("measuredPressure", `DB${process.env.PLC_DB || "100"},REAL2`);
        this.plc.addItemSynonym("measuredFlow", `DB${process.env.PLC_DB || "100"},REAL6`);
    }

    /**
     * Get the current status.
     */
    public getStatus(): EStatus {
        return this.status;
    }

    /**
     * Get the current data.
     */
    public getCurrentData(): IData {
        return {
            instruction: "currentData",
            data: this.currentReadingBuffer
        }
    }

    /**
     * Report the status.
     * @param status Status.
     */
    public reportStatus(status: EStatus) {
        // Emit a status event through the EventEmitter.
        this.emit("status", status);
    }

    /**
     * Report a reading.
     * @param reading Reading.
     */
    public reportReading(reading: IReading) {
        // Emit a reading event through the EventEmitter.
        this.emit("reading", reading);
    }

    /**
     * Start a cycle.
     */
    public async start() {
        try {
            // Set status to waiting for PLC start and report the status.
            this.status = EStatus.AWAIT_PLC_START_CMD;
            this.reportStatus(this.status);

            // Connect to PLC.
            await this.plc.connect();

            // Clear the current reading buffer.
            this.currentReadingBuffer = [];

            // Wait until the start command has been given from the PLC.
            await this.plc.addItemTimer("start", true, 100);
            this.status = EStatus.RUNNING;
            this.reportStatus(this.status);

            // System has been started, wait until we get a stop command.
            // In the meanwhile, report a reading each time it changes.
            await new Promise(resolve => {
                this.plc.addReadItems(["stop", "measuredPressure", "measuredFlow"]);

                let currentReading = 0;

                // Define a reading object according to it's interface.
                let prevValues: IReading = {
                    pressure: 0,
                    flowrate: 0
                };

                // Create an interval timer to read PLC values and check for stop/readings.
                let itemTimer = setInterval(async () => {
                    let items = await this.plc.readItems()
                    
                    // Check for stop command.
                    if (items["stop"] === true) {
                        clearInterval(itemTimer);
                        resolve();
                    }

                    // Check if values have changed.
                    if (items["measuredPressure"] !== prevValues.pressure && items["measuredFlow"] !== prevValues.flowrate) {
                        prevValues.pressure = items["measuredPressure"];
                        prevValues.flowrate = items["measuredFlow"];
                        this.reportReading(prevValues);

                        this.currentReadingBuffer.push([currentReading, prevValues.pressure, prevValues.flowrate]);
                        currentReading += 1;
                    }
                }, 100);
            });

            // Set status to finishing and report the status.
            this.status = EStatus.FINISHING;
            this.reportStatus(this.status);
        } catch (err) {
            // Set status to errored and report the status.
            this.status = EStatus.ERRORED;
            this.reportStatus(this.status);
        } finally {
            // Always disconnect from the PLC.
            await this.plc.disconnect();

            // Always clear the buffer.
            this.currentReadingBuffer = [];
        }
    }

    /**
     * Abort a cycle.
     */
    public async abort() {
        // Set status to aborting and report status.
        this.status = EStatus.ABORTING;
        this.reportStatus(this.status);

        // Disconnect from the PLC.
        this.plc.disconnect();

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Set status to aborted and report status.
        this.status = EStatus.ABORTED;
        this.reportStatus(this.status);
    }

    /**
     * Reset the machine.
     */
    public async reset() {
        // Set status to await program start and report status.
        this.status = EStatus.AWAIT_PROGRAM_START;
        this.reportStatus(this.status);
    }

    public async processGraph(id: number) {
        // Generate a new chart from the data.
        const chartName = "Pump Performance Curve";
        const imageName = "chart.jpeg";
        const pdfEmptyChart = "EmptyChart.pdf";
        const pdfChartName = "chart.pdf";
        const execPromise = promisify(exec);
        const { stdout, stderr } = await execPromise(`java -jar ${process.env.GRAPHER_JAR} ${id} "${chartName}" "${path.join(process.env.GRAPHER_WORKDIR || "", imageName)}" "${path.join(process.env.GRAPHER_WORKDIR || "", pdfEmptyChart)}" "${path.join(process.env.GRAPHER_WORKDIR || "", pdfChartName)}" "jdbc:postgresql://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}" "${process.env.DB_USER}" "${process.env.DB_PASSWORD}"`);

        // Read data from outputfolder.
        const imageBuffer = fs.readFileSync(path.join(process.env.GRAPHER_WORKDIR || "", imageName));
        const pdfBuffer = fs.readFileSync(path.join(process.env.GRAPHER_WORKDIR || "", pdfChartName));

        // Save the chart to the database.
        file.create(id, imageName, imageBuffer.toString("hex"), EFileType.IMAGE);
        file.create(id, pdfChartName, pdfBuffer.toString("hex"), EFileType.PDF);

        // Create a CSV file.
        // We are implementing a comma seperated list.
        // Structure is as following.
        // Field 0: datapoint
        // Field 1: flow
        // Field 2: pressure
        const runData = await history.readbyId(id);
        let csvString = "datapoint;pressure;flow;\n";

        // Add run results to CSV.
        for (let run of runData[0].data) {
            let pressure = Math.round(run[1] * 1000) / 1000;
            let flow = Math.round(run[2] * 1000) / 1000;
            csvString += `${run[0]};${pressure};${flow};\n`;
        }

        // Standardize string for saving.
        const csvBuffer = Buffer.from(csvString);

        // Save buffer.
        file.create(id, "run.csv", csvBuffer.toString("hex"), EFileType.CSV);

        // Set status to finished and report the status.
        this.status = EStatus.FINISHED;
        this.reportStatus(this.status);
    }
}
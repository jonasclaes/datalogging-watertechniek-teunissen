import { EventEmitter } from "events";
import NodeS7, { ConnectionOptions } from "nodes7";
import { IVariableObject } from "./IVariableObject"
import { IItemTimerObject } from "./IItemTimerObject";

export class PLC extends EventEmitter {
    private s7: NodeS7;
    private connectionOptions: ConnectionOptions;
    private variables: IVariableObject = {};
    private itemTimers: IItemTimerObject = {}

    constructor (connectionOptions: ConnectionOptions) {
        super();
        this.connectionOptions = connectionOptions;

        this.s7 = new NodeS7({
            silent: true
        });

        this.s7.setTranslationCB((tag: string) => {
            return this.variables[tag];
        });
    }

    /**
     * Connect to PLC.
     */
    public connect(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.s7.initiateConnection(this.connectionOptions, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    this.emit("connected")
                    resolve();
                }
            });
        });
    }

    /**
     * Disconnect from PLC.
     */
    public disconnect(): Promise<any> {
        return new Promise(resolve => {
            this.s7.dropConnection(() => {
                this.emit("disconnected");
                resolve();
            });
        });
    }

    /**
     * Add a synonym for an item with an address.
     * @param item Item name.
     * @param value Value of item.
     */
    public addItemSynonym(item: string, value: string) {
        this.variables[item] = value;
    }

    /**
     * Remove a synonym for an item with an address.
     * @param item Item name.
     */
    public removeItemSynonym(item: string) {
        delete this.variables[item];
    }

    /**
     * Add a read item.
     * @param items Item name.
     */
    public addReadItems(items: string | Array<string>) {
        this.s7.addItems(items);
    }

    /**
     * Remove a read item.
     * @param items Item name.
     */
    public removeReadItems(items: string | Array<string>) {
        this.s7.removeItems(items);
    }

    /**
     * Read items that were added from PLC.
     */
    public readItems(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.s7.readAllItems((err, value) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    }

    /**
     * Write items to PLC.
     * @param items Write items.
     * @param values Write values.
     */
    public writeItems(items: string | Array<string>, values: any | Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.s7.writeItems(items, values, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Wait for an item to reach a certain value.
     * @param item Item name.
     * @param value Value.
     * @param interval Interval time in ms.
     */
    public addItemTimer(item: string, value: any, interval?: number): Promise<any> {
        return new Promise(resolve => {
            this.itemTimers[item] = setInterval(async () => {
                this.addReadItems(item);

                let items = await this.readItems();

                this.removeReadItems(item);

                if (items[item] === value) {
                    clearInterval(this.itemTimers[item]);
                    delete this.itemTimers[item];
                    resolve();
                }
            }, interval || 500);
        });
    }

    /**
     * Remove an item timer.
     * @param item Item name.
     */
    public removeItemTimer(item: string) {
        clearInterval(this.itemTimers[item]);
        delete this.itemTimers[item];
    }
}
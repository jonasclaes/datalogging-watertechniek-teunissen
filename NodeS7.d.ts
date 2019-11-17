declare module "nodes7" {
    export default class NodeS7 {
        private opts: object;
        private silentMode: boolean;
        private effectiveDebugLevel: number;

        private connectReq: Buffer;
        private negotiatePDU: Buffer;
        private readReqHeader: Buffer;
        private readReq: Buffer;
        private writeReqHeader: Buffer;
        private writeReq: Buffer;

        private resetPending: boolean;
        private resetTimeout: any;
        private isoclient: any;
        private isoConnectionState: number;
        private requestMaxPDU: number;
        private maxPDU: number;
        private requestMaxParallel: number;
        private maxParallel: number;
        private parallelJobsNow: number;
        private maxGap: number;
        private doNotOptimize: boolean;
        private connectCallback: any;
        private readDoneCallback: any;
        private writeDoneCallback: any;
        private connectTimeout: any;
        private PDUTimeout: any;
        private globalTimeout: number;

        private rack: number;
        private slot: number;
        private localTSAP: any;
        private remoteTSAP: any;

        private readPacketArray: Array<any>;
        private writePacketArray: Array<any>;
        private polledReadBlockList: Array<any>;
        private instantWriteBlockList: Array<any>;
        private globalReadBlockList: Array<any>;
        private globalWriteBlockList: Array<any>;
        private masterSequenceNumber: number;
        private translationCB: Function;
        private connectionParams: any;
        private connectionID: string;
        private addRemoveArray: Array<any>;
        private readPacketValid: boolean;
        private writeInQueue: boolean;
        private connectCBIssued: boolean;
        private dropConnectionCallback: any;
        private dropConnectionTimer: any;
        private reconnectTimer: any;
        private rereadTimer: any;
    
        constructor(opts?: Options);
        initiateConnection(options?: ConnectionOptions, callback?: CallbackError): any;
        dropConnection(callback?: Callback): any;
        setTranslationCB(translator: (tag: string) => any): any;
        addItems(items: string | Array<string>): any;
        removeItems(items: string | Array<string>): any;
        writeItems(items: string | Array<string>, values: any, callback: CallbackError): any;
        readAllItems(callback: CallbackErrorValue): any;
    }

    export interface Options {
        silent?: boolean;
        debug?: number;
    }

    export interface ConnectionOptions {
        rack?: number;
        slot?: number;
        port?: number;
        host?: string;
        timeout?: number;
        localTSAP?: number;
        remoteTSAP?: number;
    }

    interface Callback {

    }

    interface CallbackError {
        (err: Error): any;
    }

    interface CallbackErrorValue {
        (err: Error, value: any): any
    }
}
declare class InflightQueue {
    requestsQueue: Map<any, any>;
    /**
     * pushes the process against a variable in its queue
     * @param variable
     * @param {{resolve: (value?: any) => void; reject: (reason?: any) => void}} param2
     * the resolve callback will be called on
     */
    private addToQueue;
    /**
     * Calls the reject method against the passed process
     * @param process
     */
    private rejectProcess;
    /**
     * clears the queue against a variable
     * @param variable
     */
    clear(variable: any): void;
    /**
     * executes the n/w calls for a specified variable pushed in its respective queue (pushed while it was inFlight)
     * @param variable
     */
    process(variable: any): void;
    /**
     * initializes the queue against a variable and makes the first process call
     * If already initialized and a process in queue is in progress, the queue is not processed.
     * To process the next item in the queue, the process method has to be called from the caller.
     * @param variable
     * @returns {Promise<any>}
     */
    submit(variable: any): Promise<{}>;
}
export declare const $queue: InflightQueue;
export {};

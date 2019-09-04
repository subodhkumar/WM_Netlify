export declare class EventNotifier {
    private _subject;
    private _isInitialized;
    private _eventsBeforeInit;
    constructor(start?: boolean);
    /**
     * A event can be fired, but will be sent to subscribers only after exchange is started.
     *
     * @param {string} eventName
     * @param data
     */
    notify(eventName: string, ...data: Array<any>): void;
    /**
     * starts the exchange and send the pending events to subscribers.
     */
    start(): void;
    /**
     * upon subscription, method to cancel subscription is returned.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {() => void}
     */
    subscribe(eventName: any, callback: (...data: Array<any>) => void): () => void;
    destroy(): void;
}

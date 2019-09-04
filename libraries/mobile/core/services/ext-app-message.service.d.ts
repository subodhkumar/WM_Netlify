import { App } from '@wm/core';
interface Message {
    address: string;
    data: Map<string, string>;
}
export declare class ExtAppMessageService {
    private app;
    private handlers;
    constructor(app: App);
    /**
     * adds a listener for a message whose address matches with the given regex pattern.
     *
     * @param {string} messageAddressPattern a regex pattern that is used to target messages to listen.
     * @param {Function} listener function to invoke when message that matches regex is received.
     *                  message received will be sent as first argument.
     * @returns {Function} a function which removes the listener when invoked.
     */
    subscribe(messageAddressPattern: any, listener: (msg: Message) => any): () => any;
}
export {};

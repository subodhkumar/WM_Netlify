import { LocalDBStore } from '../models/local-db-store';
export declare class LocalKeyValueService {
    private store;
    /**
     * retrieves the value mapped to the key.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when value is retrieved from store.
     */
    get(key: string): any;
    /**
     * Initializes the service with the given store.
     *
     * @param {object} storeToUse a store with id, key, value with fields.
     * @returns {object} a promise that is resolved when data is persisted.
     */
    init(storeToUse: LocalDBStore): void;
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @param {string} value value
     * @returns {object} a promise that is resolved when data is persisted.
     */
    put(key: any, value: any): Promise<any>;
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when respective value is removed from store.
     */
    remove(key: any): Promise<any>;
    private fetchEntry;
}

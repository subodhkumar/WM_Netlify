export declare const EVENTS_MAP: Map<string, string>;
export declare const DISPLAY_TYPE: {
    BLOCK: string;
    INLINE_BLOCK: string;
    INLINE: string;
};
/**
 * Returns true if the provided key is a boolean attribute
 * @param {string} key
 * @returns {boolean}
 */
export declare const isBooleanAttr: (key: string) => boolean;
export declare const isDimensionProp: (key: string) => boolean;
export declare const DEBOUNCE_TIMES: {
    PAGINATION_DEBOUNCE_TIME: number;
};

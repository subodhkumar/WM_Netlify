import { IDeviceStartUpService } from '@wm/mobile/core';
export declare class CookieService implements IDeviceStartUpService {
    private cookieInfo;
    serviceName: string;
    persistCookie(hostname: string, cookieName: string, cookieValue?: string): Promise<void>;
    getCookie(hostname: string, cookieName: string): Promise<any>;
    setCookie(hostname: string, cookieName: string, cookieValue: string): Promise<any>;
    clearAll(): Promise<any>;
    /**
     * Loads persisted cookies from local storage and adds them to the browser.
     * @returns {*}
     */
    start(): Promise<any>;
    /**
     * Just rotates the given string exactly from 1/3 of string length in left to right direction.
     * @param str
     * @returns {string}
     */
    private rotateLTR;
    /**
     * Just rotates the given string exactly from 1/3 of string length in  right to left direction..
     * @param str
     * @returns {string}
     */
    private rotateRTL;
}

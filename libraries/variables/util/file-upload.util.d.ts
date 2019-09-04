import { NotifyPromise } from './notify-promise';
/**
 * This function uploads the file to the given url endpoint.
 *
 * @param file file to upload
 * @param url http endpoint to which the file has to be submitted.
 * @param options
 * @returns a promise to listen for success, event, onProgress.
 *  One can also abort the upload by simply calling abort function.
 */
export declare function upload(files: any, fd: any, config: any, options?: any): NotifyPromise;

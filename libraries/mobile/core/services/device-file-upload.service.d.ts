import { File } from '@ionic-native/file';
export interface IUploadResponse {
    text: string;
    response: any;
    headers: (string: any) => string;
}
export declare class UploadRequest {
    private url;
    private cordovaFile;
    private _files;
    private _params;
    private _headers;
    constructor(url: string, cordovaFile: File);
    addFile(name: string, path: string, filename: string): UploadRequest;
    addHeader(name: string, value: string): UploadRequest;
    addParam(name: string, value: string): UploadRequest;
    post(): Promise<IUploadResponse>;
}
export declare class DeviceFileUploadService {
    private cordovaFile;
    constructor(cordovaFile: File);
    upload(url: string, fileParamName: string, path: string, fileName?: string, params?: any, headers?: any): Promise<IUploadResponse>;
}

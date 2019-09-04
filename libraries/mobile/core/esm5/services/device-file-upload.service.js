import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { convertToBlob } from '@wm/core';
import * as i0 from "@angular/core";
import * as i1 from "@ionic-native/file";
var UploadRequest = /** @class */ (function () {
    function UploadRequest(url, cordovaFile) {
        this.url = url;
        this.cordovaFile = cordovaFile;
        this._files = [];
        this._params = [];
        this._headers = [];
    }
    UploadRequest.prototype.addFile = function (name, path, filename) {
        this._files.push({
            name: name,
            path: path,
            fileName: filename
        });
        return this;
    };
    UploadRequest.prototype.addHeader = function (name, value) {
        this._headers.push({
            name: name,
            value: value
        });
        return this;
    };
    UploadRequest.prototype.addParam = function (name, value) {
        this._params.push({
            name: name,
            value: value
        });
        return this;
    };
    UploadRequest.prototype.post = function () {
        var _this = this;
        var formData = new FormData();
        this._params.forEach(function (e) { return formData.append(e.name, e.value); });
        return Promise.all(this._files.map(function (e) {
            if (e.path) {
                return convertToBlob(e.path)
                    .then(function (result) {
                    return {
                        name: e.name,
                        fileName: e.fileName,
                        blob: result.blob
                    };
                });
            }
            return e;
        })).then(function (params) {
            params.forEach(function (e) { return formData.append(e.name, e.blob || e.path, e.fileName); });
            return new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();
                request.open('POST', _this.url);
                _this._headers.forEach(function (e) { return request.setRequestHeader(e.name, e.value); });
                request.onload = function () {
                    resolve({
                        headers: function (name) { return request.getResponseHeader(name); },
                        response: request.response,
                        text: request.responseText
                    });
                };
                request.onerror = reject;
                request.onabort = reject;
                request.send(formData);
            });
        });
    };
    return UploadRequest;
}());
export { UploadRequest };
var DeviceFileUploadService = /** @class */ (function () {
    function DeviceFileUploadService(cordovaFile) {
        this.cordovaFile = cordovaFile;
    }
    DeviceFileUploadService.prototype.upload = function (url, fileParamName, path, fileName, params, headers) {
        var req = new UploadRequest(url, this.cordovaFile)
            .addFile(fileParamName, path, fileName);
        _.forEach(params, function (k, v) { return req.addParam(k, v); });
        _.forEach(headers, function (k, v) { return req.addHeader(k, v); });
        return req.post();
    };
    DeviceFileUploadService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    DeviceFileUploadService.ctorParameters = function () { return [
        { type: File }
    ]; };
    DeviceFileUploadService.ngInjectableDef = i0.defineInjectable({ factory: function DeviceFileUploadService_Factory() { return new DeviceFileUploadService(i0.inject(i1.File)); }, token: DeviceFileUploadService, providedIn: "root" });
    return DeviceFileUploadService;
}());
export { DeviceFileUploadService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLWZpbGUtdXBsb2FkLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvcmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9kZXZpY2UtZmlsZS11cGxvYWQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUUxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFDOzs7QUFVekM7SUFNSSx1QkFBcUIsR0FBVyxFQUFVLFdBQWlCO1FBQXRDLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBTTtRQUpuRCxXQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ1osWUFBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLGFBQVEsR0FBRyxFQUFFLENBQUM7SUFJdEIsQ0FBQztJQUVNLCtCQUFPLEdBQWQsVUFBZSxJQUFZLEVBQUUsSUFBWSxFQUFFLFFBQWdCO1FBQ3ZELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2IsSUFBSSxFQUFFLElBQUk7WUFDVixJQUFJLEVBQUUsSUFBSTtZQUNWLFFBQVEsRUFBRSxRQUFRO1NBQ3JCLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxpQ0FBUyxHQUFoQixVQUFpQixJQUFZLEVBQUUsS0FBYTtRQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztZQUNmLElBQUksRUFBRSxJQUFJO1lBQ1YsS0FBSyxFQUFFLEtBQUs7U0FDZixDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sZ0NBQVEsR0FBZixVQUFnQixJQUFZLEVBQUUsS0FBYTtRQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNkLElBQUksRUFB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Q0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO1FBQ2xELE9BQU8sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3RCLENBQUM7O2dCQVhKLFVBQVUsU0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7Ozs7Z0JBbkZ6QixJQUFJOzs7a0NBRmI7Q0FrR0MsQUFiRCxJQWFDO1NBWlksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9maWxlJztcblxuaW1wb3J0IHsgY29udmVydFRvQmxvYiB9IGZyb20gJ0B3bS9jb3JlJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgaW50ZXJmYWNlIElVcGxvYWRSZXNwb25zZSB7XG4gICAgdGV4dDogc3RyaW5nO1xuICAgIHJlc3BvbnNlOiBhbnk7XG4gICAgaGVhZGVyczogKHN0cmluZykgPT4gc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgVXBsb2FkUmVxdWVzdCB7XG5cbiAgICBwcml2YXRlIF9maWxlcyA9IFtdO1xuICAgIHByaXZhdGUgX3BhcmFtcyA9IFtdO1xuICAgIHByaXZhdGUgX2hlYWRlcnMgPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yIChwcml2YXRlIHVybDogc3RyaW5nLCBwcml2YXRlIGNvcmRvdmFGaWxlOiBGaWxlKSB7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkRmlsZShuYW1lOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgZmlsZW5hbWU6IHN0cmluZyk6IFVwbG9hZFJlcXVlc3Qge1xuICAgICAgICB0aGlzLl9maWxlcy5wdXNoKHtcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgICAgZmlsZU5hbWU6IGZpbGVuYW1lXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkSGVhZGVyKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IFVwbG9hZFJlcXVlc3Qge1xuICAgICAgICB0aGlzLl9oZWFkZXJzLnB1c2goe1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZFBhcmFtKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IFVwbG9hZFJlcXVlc3Qge1xuICAgICAgICB0aGlzLl9wYXJhbXMucHVzaCh7XG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgcG9zdCgpOiBQcm9taXNlPElVcGxvYWRSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICB0aGlzLl9wYXJhbXMuZm9yRWFjaCggZSA9PiBmb3JtRGF0YS5hcHBlbmQoZS5uYW1lLCBlLnZhbHVlKSk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbCh0aGlzLl9maWxlcy5tYXAoIGUgPT4ge1xuICAgICAgICAgICAgaWYgKGUucGF0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb252ZXJ0VG9CbG9iKGUucGF0aClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBlLmZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2I6IHJlc3VsdC5ibG9iXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9KSkudGhlbihwYXJhbXMgPT4ge1xuICAgICAgICAgICAgcGFyYW1zLmZvckVhY2goZSA9PiBmb3JtRGF0YS5hcHBlbmQoZS5uYW1lLCBlLmJsb2IgfHwgZS5wYXRoLCBlLmZpbGVOYW1lKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8SVVwbG9hZFJlc3BvbnNlPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIHJlcXVlc3Qub3BlbignUE9TVCcsIHRoaXMudXJsKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWFkZXJzLmZvckVhY2goZSA9PiByZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoZS5uYW1lLCBlLnZhbHVlKSk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyczogKG5hbWU6IHN0cmluZykgPT4gcmVxdWVzdC5nZXRSZXNwb25zZUhlYWRlcihuYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXF1ZXN0LnJlc3BvbnNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogcmVxdWVzdC5yZXNwb25zZVRleHQgYXMgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgICAgICAgICAgIHJlcXVlc3Qub25hYm9ydCA9IHJlamVjdDtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LnNlbmQoZm9ybURhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBEZXZpY2VGaWxlVXBsb2FkU2VydmljZSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvcmRvdmFGaWxlOiBGaWxlKSB7fVxuXG4gICAgcHVibGljIHVwbG9hZCh1cmw6IHN0cmluZywgZmlsZVBhcmFtTmFtZTogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGZpbGVOYW1lPzogc3RyaW5nLCBwYXJhbXM/OiBhbnksIGhlYWRlcnM/OiBhbnkpOiBQcm9taXNlPElVcGxvYWRSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCByZXEgPSBuZXcgVXBsb2FkUmVxdWVzdCh1cmwsIHRoaXMuY29yZG92YUZpbGUpXG4gICAgICAgICAgICAuYWRkRmlsZShmaWxlUGFyYW1OYW1lLCBwYXRoLCBmaWxlTmFtZSk7XG4gICAgICAgIF8uZm9yRWFjaChwYXJhbXMsIChrLCB2KSA9PiByZXEuYWRkUGFyYW0oaywgdikpO1xuICAgICAgICBfLmZvckVhY2goaGVhZGVycywgKGssIHYpID0+IHJlcS5hZGRIZWFkZXIoaywgdikpO1xuICAgICAgICByZXR1cm4gcmVxLnBvc3QoKTtcbiAgICB9XG5cbn1cbiJdfQ==
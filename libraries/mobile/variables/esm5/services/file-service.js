import * as tslib_1 from "tslib";
import { isValidWebURL } from '@wm/core';
import { $rootScope, DeviceVariableService } from '@wm/variables';
var FileService = /** @class */ (function (_super) {
    tslib_1.__extends(FileService, _super);
    function FileService(fileOpener, fileUploader) {
        var _this = _super.call(this) || this;
        _this.name = 'file';
        _this.operations = [];
        _this.operations.push(new OpenFileOperation(fileOpener), new UploadFileOperation(fileUploader));
        return _this;
    }
    return FileService;
}(DeviceVariableService));
export { FileService };
var OpenFileOperation = /** @class */ (function () {
    function OpenFileOperation(fileOpener) {
        this.fileOpener = fileOpener;
        this._defaultFileTypesToOpen = {
            'doc': { 'label': 'Microsoft Office Word Document', 'mimeType': 'application/msword', 'extension': 'doc' },
            'pdf': { 'label': 'PDF Document', 'mimeType': 'application/pdf', 'extension': 'pdf' },
            'ppt': { 'label': 'Microsoft Office Powerpoint', 'mimeType': 'application/vnd.ms-powerpoint', 'extension': 'ppt' },
            'xls': { 'label': 'Microsoft Office Excel', 'mimeType': 'application/vnd.ms-excel', 'extension': 'xls' }
        };
        this.name = 'openFile';
        this.model = {};
        this.properties = [
            { target: 'filePath', type: 'string', value: '', dataBinding: true },
            { target: 'fileType', type: 'list', options: _.mapValues(this._defaultFileTypesToOpen, 'label'), value: 'pdf', dataBinding: true, hide: true },
            { target: 'spinnerContext', hide: false },
            { target: 'spinnerMessage', hide: false }
        ];
        this.requiredCordovaPlugins = [];
    }
    OpenFileOperation.prototype.invoke = function (variable, options, dataBindings) {
        var fileType = this._defaultFileTypesToOpen[dataBindings.get('fileType')];
        var filePath = dataBindings.get('filePath');
        // if relative path is given, then append url with deployedUrl, to access files in resources.
        if (!isValidWebURL(filePath)) {
            filePath = $rootScope.project.deployedUrl + filePath;
        }
        return this.fileOpener.openRemoteFile(filePath, fileType.extension);
    };
    return OpenFileOperation;
}());
var UploadFileOperation = /** @class */ (function () {
    function UploadFileOperation(fileUploader) {
        this.fileUploader = fileUploader;
        this.name = 'upload';
        this.model = {
            fileName: '',
            path: '',
            length: 0,
            success: false,
            inlinePath: '',
            errorMessage: '',
            inProgress: false,
            loaded: 0
        };
        this.properties = [
            { target: 'localFile', type: 'string', value: '', dataBinding: true },
            { target: 'remoteFolder', type: 'string', value: '', dataBinding: true },
            { target: 'onProgress', hide: false },
            { target: 'spinnerContext', hide: false },
            { target: 'spinnerMessage', hide: false }
        ];
        this.requiredCordovaPlugins = [];
    }
    UploadFileOperation.prototype.invoke = function (variable, options, dataBindings) {
        var serverUrl = $rootScope.project.deployedUrl + 'services/file/uploadFile?relativePath=' + (dataBindings.get('remoteFolder') || ''), filePath = dataBindings.get('localFile'), fileName = filePath.split('/').pop(), data = {
            fileName: fileName,
            fileSize: 0,
            inProgress: true,
            length: 0,
            loaded: 0
        };
        return this.fileUploader.upload(serverUrl, 'files', filePath, fileName)
            .then(function (uploadResponse) {
            _.assignIn(data, JSON.parse(uploadResponse.text)[0]);
            data.loaded = data.length;
            return data;
        });
    };
    return UploadFileOperation;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9maWxlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFekMsT0FBTyxFQUFFLFVBQVUsRUFBRSxxQkFBcUIsRUFBNEIsTUFBTSxlQUFlLENBQUM7QUFJNUY7SUFBaUMsdUNBQXFCO0lBSWxELHFCQUFZLFVBQW1DLEVBQUUsWUFBcUM7UUFBdEYsWUFDSSxpQkFBTyxTQUdWO1FBUEQsVUFBSSxHQUFHLE1BQU0sQ0FBQztRQUNkLGdCQUFVLEdBQStCLEVBQUUsQ0FBQztRQUl4QyxLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxFQUNsRCxJQUFJLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7O0lBQy9DLENBQUM7SUFDTCxrQkFBQztBQUFELENBQUMsQUFURCxDQUFpQyxxQkFBcUIsR0FTckQ7O0FBRUQ7SUFtQkksMkJBQW9CLFVBQW1DO1FBQW5DLGVBQVUsR0FBVixVQUFVLENBQXlCO1FBakIvQyw0QkFBdUIsR0FBRztZQUM5QixLQUFLLEVBQUcsRUFBQyxPQUFPLEVBQUcsZ0NBQWdDLEVBQUUsVUFBVSxFQUFHLG9CQUFvQixFQUFFLFdBQVcsRUFBRyxLQUFLLEVBQUM7WUFDNUcsS0FBSyxFQUFHLEVBQUMsT0FBTyxFQUFHLGNBQWMsRUFBRSxVQUFVLEVBQUcsaUJBQWlCLEVBQUUsV0FBVyxFQUFHLEtBQUssRUFBQztZQUN2RixLQUFLLEVBQUcsRUFBQyxPQUFPLEVBQUcsNkJBQTZCLEVBQUUsVUFBVSxFQUFHLCtCQUErQixFQUFFLFdBQVcsRUFBRyxLQUFLLEVBQUM7WUFDcEgsS0FBSyxFQUFHLEVBQUMsT0FBTyxFQUFHLHdCQUF3QixFQUFFLFVBQVUsRUFBRyww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LEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFDeEMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQ3BDLElBQUksR0FBRztZQUNILFFBQVEsRUFBTSxRQUFRO1lBQ3RCLFFBQVEsRUFBTSxDQUFDO1lBQ2YsVUFBVSxFQUFJLElBQUk7WUFDbEIsTUFBTSxFQUFRLENBQUM7WUFDZixNQUFNLEVBQVEsQ0FBQztTQUNsQixDQUFDO1FBQ04sT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUM7YUFDbEUsSUFBSSxDQUFDLFVBQUEsY0FBYztZQUNoQixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFDTCwwQkFBQztBQUFELENBQUMsQUExQ0QsSUEwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1ZhbGlkV2ViVVJMIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgRGV2aWNlRmlsZU9wZW5lclNlcnZpY2UsIERldmljZUZpbGVVcGxvYWRTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcbmltcG9ydCB7ICRyb290U2NvcGUsIERldmljZVZhcmlhYmxlU2VydmljZSwgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uIH0gZnJvbSAnQHdtL3ZhcmlhYmxlcyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuZXhwb3J0IGNsYXNzIEZpbGVTZXJ2aWNlIGV4dGVuZHMgRGV2aWNlVmFyaWFibGVTZXJ2aWNlIHtcbiAgICBuYW1lID0gJ2ZpbGUnO1xuICAgIG9wZXJhdGlvbnM6IElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbltdID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcihmaWxlT3BlbmVyOiBEZXZpY2VGaWxlT3BlbmVyU2VydmljZSwgZmlsZVVwbG9hZGVyOiBEZXZpY2VGaWxlVXBsb2FkU2VydmljZSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9wZXJhdGlvbnMucHVzaChuZXcgT3BlbkZpbGVPcGVyYXRpb24oZmlsZU9wZW5lciksXG4gICAgICAgICAgICBuZXcgVXBsb2FkRmlsZU9wZXJhdGlvbihmaWxlVXBsb2FkZXIpKTtcbiAgICB9XG59XG5cbmNsYXNzIE9wZW5GaWxlT3BlcmF0aW9uIGltcGxlbWVudHMgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uIHtcblxuICAgIHByaXZhdGUgX2RlZmF1bHRGaWxlVHlwZXNUb09wZW4gPSB7XG4gICAgICAgICdkb2MnIDogeydsYWJlbCcgOiAnTWljcm9zb2Z0IE9mZmljZSBXb3JkIERvY3VtZW50JywgJ21pbWVUeXBlJyA6ICdhcHBsaWNhdGlvbi9tc3dvcmQnLCAnZXh0ZW5zaW9uJyA6ICdkb2MnfSxcbiAgICAgICAgJ3BkZicgOiB7J2xhYmVsJyA6ICdQREYgRG9jdW1lbnQnLCAnbWltZVR5cGUnIDogJ2FwcGxpY2F0aW9uL3BkZicsICdleHRlbnNpb24nIDogJ3BkZid9LFxuICAgICAgICAncHB0JyA6IHsnbGFiZWwnIDogJ01pY3Jvc29mdCBPZmZpY2UgUG93ZXJwb2ludCcsICdtaW1lVHlwZScgOiAnYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQnLCAnZXh0ZW5zaW9uJyA6ICdwcHQnfSxcbiAgICAgICAgJ3hscycgOiB7J2xhYmVsJyA6ICdNaWNyb3NvZnQgT2ZmaWNlIEV4Y2VsJywgJ21pbWVUeXBlJyA6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLCAnZXh0ZW5zaW9uJyA6ICd4bHMnfVxuICAgIH07XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdvcGVuRmlsZSc7XG4gICAgcHVibGljIHJlYWRvbmx5IG1vZGVsID0ge307XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXG4gICAgICAgIHt0YXJnZXQ6ICdmaWxlUGF0aCcsIHR5cGU6ICdzdHJpbmcnLCB2YWx1ZTogJycsIGRhdGFCaW5kaW5nOiB0cnVlfSxcbiAgICAgICAge3RhcmdldDogJ2ZpbGVUeXBlJywgdHlwZTogJ2xpc3QnLCBvcHRpb25zOiBfLm1hcFZhbHVlcyh0aGlzLl9kZWZhdWx0RmlsZVR5cGVzVG9PcGVuLCAnbGFiZWwnKSwgIHZhbHVlOiAncGRmJywgZGF0YUJpbmRpbmc6IHRydWUsIGhpZGU6IHRydWV9LFxuICAgICAgICB7dGFyZ2V0OiAnc3Bpbm5lckNvbnRleHQnLCBoaWRlOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzcGlubmVyTWVzc2FnZScsIGhpZGU6IGZhbHNlfVxuICAgIF07XG4gICAgcHVibGljIHJlYWRvbmx5IHJlcXVpcmVkQ29yZG92YVBsdWdpbnMgPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZmlsZU9wZW5lcjogRGV2aWNlRmlsZU9wZW5lclNlcnZpY2UpIHt9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgZmlsZVR5cGUgPSB0aGlzLl9kZWZhdWx0RmlsZVR5cGVzVG9PcGVuW2RhdGFCaW5kaW5ncy5nZXQoJ2ZpbGVUeXBlJyldO1xuICAgICAgICBsZXQgZmlsZVBhdGggPSBkYXRhQmluZGluZ3MuZ2V0KCdmaWxlUGF0aCcpO1xuICAgICAgICAvLyBpZiByZWxhdGl2ZSBwYXRoIGlzIGdpdmVuLCB0aGVuIGFwcGVuZCB1cmwgd2l0aCBkZXBsb3llZFVybCwgdG8gYWNjZXNzIGZpbGVzIGluIHJlc291cmNlcy5cbiAgICAgICAgaWYgKCFpc1ZhbGlkV2ViVVJMKGZpbGVQYXRoKSkge1xuICAgICAgICAgICAgZmlsZVBhdGggPSAkcm9vdFNjb3BlLnByb2plY3QuZGVwbG95ZWRVcmwgKyBmaWxlUGF0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5maWxlT3BlbmVyLm9wZW5SZW1vdGVGaWxlKGZpbGVQYXRoLCBmaWxlVHlwZS5leHRlbnNpb24pO1xuICAgIH1cbn1cblxuY2xhc3MgVXBsb2FkRmlsZU9wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICd1cGxvYWQnO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHtcbiAgICAgICAgZmlsZU5hbWUgICAgOiAnJyxcbiAgICAgICAgcGF0aCAgICAgICAgOiAnJyxcbiAgICAgICAgbGVuZ3RoICAgICAgOiAwLFxuICAgICAgICBzdWNjZXNzICAgICA6IGZhbHNlLFxuICAgICAgICBpbmxpbmVQYXRoICA6ICcnLFxuICAgICAgICBlcnJvck1lc3NhZ2U6ICcnLFxuICAgICAgICBpblByb2dyZXNzICA6IGZhbHNlLFxuICAgICAgICBsb2FkZWQgICAgICA6IDBcbiAgICB9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICB7dGFyZ2V0OiAnbG9jYWxGaWxlJywgdHlwZTogJ3N0cmluZycsIHZhbHVlOiAnJywgZGF0YUJpbmRpbmc6IHRydWV9LFxuICAgICAgICB7dGFyZ2V0OiAncmVtb3RlRm9sZGVyJywgdHlwZTogJ3N0cmluZycsIHZhbHVlOiAnJywgZGF0YUJpbmRpbmc6IHRydWV9LFxuICAgICAgICB7dGFyZ2V0OiAnb25Qcm9ncmVzcycsIGhpZGUgOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzcGlubmVyQ29udGV4dCcsIGhpZGUgOiBmYWxzZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdzcGlubmVyTWVzc2FnZScsIGhpZGUgOiBmYWxzZX1cbiAgICBdO1xuICAgIHB1YmxpYyByZWFkb25seSByZXF1aXJlZENvcmRvdmFQbHVnaW5zID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZpbGVVcGxvYWRlcjogRGV2aWNlRmlsZVVwbG9hZFNlcnZpY2UpIHt9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3Qgc2VydmVyVXJsID0gJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsICsgJ3NlcnZpY2VzL2ZpbGUvdXBsb2FkRmlsZT9yZWxhdGl2ZVBhdGg9JyArIChkYXRhQmluZGluZ3MuZ2V0KCdyZW1vdGVGb2xkZXInKSB8fCAnJyksXG4gICAgICAgICAgICBmaWxlUGF0aCA9IGRhdGFCaW5kaW5ncy5nZXQoJ2xvY2FsRmlsZScpLFxuICAgICAgICAgICAgZmlsZU5hbWUgPSBmaWxlUGF0aC5zcGxpdCgnLycpLnBvcCgpLFxuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZSAgICA6IGZpbGVOYW1lLFxuICAgICAgICAgICAgICAgIGZpbGVTaXplICAgIDogMCxcbiAgICAgICAgICAgICAgICBpblByb2dyZXNzICA6IHRydWUsXG4gICAgICAgICAgICAgICAgbGVuZ3RoICAgICAgOiAwLFxuICAgICAgICAgICAgICAgIGxvYWRlZCAgICAgIDogMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZVVwbG9hZGVyLnVwbG9hZChzZXJ2ZXJVcmwsICdmaWxlcycsIGZpbGVQYXRoLCBmaWxlTmFtZSlcbiAgICAgICAgICAgIC50aGVuKHVwbG9hZFJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBfLmFzc2lnbkluKGRhdGEsIEpTT04ucGFyc2UodXBsb2FkUmVzcG9uc2UudGV4dClbMF0pO1xuICAgICAgICAgICAgICAgIGRhdGEubG9hZGVkID0gZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=
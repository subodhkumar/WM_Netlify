import { isValidWebURL } from '@wm/core';
import { $rootScope, DeviceVariableService } from '@wm/variables';
export class FileService extends DeviceVariableService {
    constructor(fileOpener, fileUploader) {
        super();
        this.name = 'file';
        this.operations = [];
        this.operations.push(new OpenFileOperation(fileOpener), new UploadFileOperation(fileUploader));
    }
}
class OpenFileOperation {
    constructor(fileOpener) {
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
    invoke(variable, options, dataBindings) {
        const fileType = this._defaultFileTypesToOpen[dataBindings.get('fileType')];
        let filePath = dataBindings.get('filePath');
        // if relative path is given, then append url with deployedUrl, to access files in resources.
        if (!isValidWebURL(filePath)) {
            filePath = $rootScope.project.deployedUrl + filePath;
        }
        return this.fileOpener.openRemoteFile(filePath, fileType.extension);
    }
}
class UploadFileOperation {
    constructor(fileUploader) {
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
    invoke(variable, options, dataBindings) {
        const serverUrl = $rootScope.project.deployedUrl + 'services/file/uploadFile?relativePath=' + (dataBindings.get('remoteFolder') || ''), filePath = dataBindings.get('localFile'), fileName = filePath.split('/').pop(), data = {
            fileName: fileName,
            fileSize: 0,
            inProgress: true,
            length: 0,
            loaded: 0
        };
        return this.fileUploader.upload(serverUrl, 'files', filePath, fileName)
            .then(uploadResponse => {
            _.assignIn(data, JSON.parse(uploadResponse.text)[0]);
            data.loaded = data.length;
            return data;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9maWxlLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV6QyxPQUFPLEVBQUUsVUFBVSxFQUFFLHFCQUFxQixFQUE0QixNQUFNLGVBQWUsQ0FBQztBQUk1RixNQUFNLE9BQU8sV0FBWSxTQUFRLHFCQUFxQjtJQUlsRCxZQUFZLFVBQW1DLEVBQUUsWUFBcUM7UUFDbEYsS0FBSyxFQUFFLENBQUM7UUFKWixTQUFJLEdBQUcsTUFBTSxDQUFDO1FBQ2QsZUFBVSxHQUErQixFQUFFLENBQUM7UUFJeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsRUFDbEQsSUFBSSxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDSjtBQUVELE1BQU0saUJBQWlCO0lBbUJuQixZQUFvQixVQUFtQztRQUFuQyxlQUFVLEdBQVYsVUFBVSxDQUF5QjtRQWpCL0MsNEJBQXVCLEdBQUc7WUFDOUIsS0FBSyxFQUFHLEVBQUMsT0FBTyxFQUFHLGdDQUFnQyxFQUFFLFVBQVUsRUFBRyxvQkFBb0IsRUFBRSxXQUFXLEVBQUcsS0FBSyxFQUFDO1lBQzVHLEtBQUssRUFBRyxFQUFDLE9BQU8sRUFBRyxjQUFjLEVBQUUsVUFBVSxFQUFHLGlCQUFpQixFQUFFLFdBQVcsRUFBRyxLQUFLLEVBQUM7WUFDdkYsS0FBSyxFQUFHLEVBQUMsT0FBTyxFQUFHLDZCQUE2QixFQUFFLFVBQVUsRUFBRywrQkFBK0IsRUFBRSxXQUFXLEVBQUcsS0FBSyxFQUFDO1lBQ3BILEtBQUssRUFBRyxFQUFDLE9BQU8sRUFBRyx3QkFBd0IsRUFBRSxVQUFVLEVBQUcsMEJBQTBCLEVBQUUsV0FBVyxFQUFH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QUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQ3BDLElBQUksR0FBRztZQUNILFFBQVEsRUFBTSxRQUFRO1lBQ3RCLFFBQVEsRUFBTSxDQUFDO1lBQ2YsVUFBVSxFQUFJLElBQUk7WUFDbEIsTUFBTSxFQUFRLENBQUM7WUFDZixNQUFNLEVBQVEsQ0FBQztTQUNsQixDQUFDO1FBQ04sT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUM7YUFDbEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ25CLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzFCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNWYWxpZFdlYlVSTCB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IERldmljZUZpbGVPcGVuZXJTZXJ2aWNlLCBEZXZpY2VGaWxlVXBsb2FkU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5pbXBvcnQgeyAkcm9vdFNjb3BlLCBEZXZpY2VWYXJpYWJsZVNlcnZpY2UsIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmV4cG9ydCBjbGFzcyBGaWxlU2VydmljZSBleHRlbmRzIERldmljZVZhcmlhYmxlU2VydmljZSB7XG4gICAgbmFtZSA9ICdmaWxlJztcbiAgICBvcGVyYXRpb25zOiBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb25bXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoZmlsZU9wZW5lcjogRGV2aWNlRmlsZU9wZW5lclNlcnZpY2UsIGZpbGVVcGxvYWRlcjogRGV2aWNlRmlsZVVwbG9hZFNlcnZpY2UpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb25zLnB1c2gobmV3IE9wZW5GaWxlT3BlcmF0aW9uKGZpbGVPcGVuZXIpLFxuICAgICAgICAgICAgbmV3IFVwbG9hZEZpbGVPcGVyYXRpb24oZmlsZVVwbG9hZGVyKSk7XG4gICAgfVxufVxuXG5jbGFzcyBPcGVuRmlsZU9wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG5cbiAgICBwcml2YXRlIF9kZWZhdWx0RmlsZVR5cGVzVG9PcGVuID0ge1xuICAgICAgICAnZG9jJyA6IHsnbGFiZWwnIDogJ01pY3Jvc29mdCBPZmZpY2UgV29yZCBEb2N1bWVudCcsICdtaW1lVHlwZScgOiAnYXBwbGljYXRpb24vbXN3b3JkJywgJ2V4dGVuc2lvbicgOiAnZG9jJ30sXG4gICAgICAgICdwZGYnIDogeydsYWJlbCcgOiAnUERGIERvY3VtZW50JywgJ21pbWVUeXBlJyA6ICdhcHBsaWNhdGlvbi9wZGYnLCAnZXh0ZW5zaW9uJyA6ICdwZGYnfSxcbiAgICAgICAgJ3BwdCcgOiB7J2xhYmVsJyA6ICdNaWNyb3NvZnQgT2ZmaWNlIFBvd2VycG9pbnQnLCAnbWltZVR5cGUnIDogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50JywgJ2V4dGVuc2lvbicgOiAncHB0J30sXG4gICAgICAgICd4bHMnIDogeydsYWJlbCcgOiAnTWljcm9zb2Z0IE9mZmljZSBFeGNlbCcsICdtaW1lVHlwZScgOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJywgJ2V4dGVuc2lvbicgOiAneGxzJ31cbiAgICB9O1xuXG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnb3BlbkZpbGUnO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHt9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICB7dGFyZ2V0OiAnZmlsZVBhdGgnLCB0eXBlOiAnc3RyaW5nJywgdmFsdWU6ICcnLCBkYXRhQmluZGluZzogdHJ1ZX0sXG4gICAgICAgIHt0YXJnZXQ6ICdmaWxlVHlwZScsIHR5cGU6ICdsaXN0Jywgb3B0aW9uczogXy5tYXBWYWx1ZXModGhpcy5fZGVmYXVsdEZpbGVUeXBlc1RvT3BlbiwgJ2xhYmVsJyksICB2YWx1ZTogJ3BkZicsIGRhdGFCaW5kaW5nOiB0cnVlLCBoaWRlOiB0cnVlfSxcbiAgICAgICAge3RhcmdldDogJ3NwaW5uZXJDb250ZXh0JywgaGlkZTogZmFsc2V9LFxuICAgICAgICB7dGFyZ2V0OiAnc3Bpbm5lck1lc3NhZ2UnLCBoaWRlOiBmYWxzZX1cbiAgICBdO1xuICAgIHB1YmxpYyByZWFkb25seSByZXF1aXJlZENvcmRvdmFQbHVnaW5zID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZpbGVPcGVuZXI6IERldmljZUZpbGVPcGVuZXJTZXJ2aWNlKSB7fVxuXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZTogYW55LCBvcHRpb25zOiBhbnksIGRhdGFCaW5kaW5nczogTWFwPHN0cmluZywgYW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IGZpbGVUeXBlID0gdGhpcy5fZGVmYXVsdEZpbGVUeXBlc1RvT3BlbltkYXRhQmluZGluZ3MuZ2V0KCdmaWxlVHlwZScpXTtcbiAgICAgICAgbGV0IGZpbGVQYXRoID0gZGF0YUJpbmRpbmdzLmdldCgnZmlsZVBhdGgnKTtcbiAgICAgICAgLy8gaWYgcmVsYXRpdmUgcGF0aCBpcyBnaXZlbiwgdGhlbiBhcHBlbmQgdXJsIHdpdGggZGVwbG95ZWRVcmwsIHRvIGFjY2VzcyBmaWxlcyBpbiByZXNvdXJjZXMuXG4gICAgICAgIGlmICghaXNWYWxpZFdlYlVSTChmaWxlUGF0aCkpIHtcbiAgICAgICAgICAgIGZpbGVQYXRoID0gJHJvb3RTY29wZS5wcm9qZWN0LmRlcGxveWVkVXJsICsgZmlsZVBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsZU9wZW5lci5vcGVuUmVtb3RlRmlsZShmaWxlUGF0aCwgZmlsZVR5cGUuZXh0ZW5zaW9uKTtcbiAgICB9XG59XG5cbmNsYXNzIFVwbG9hZEZpbGVPcGVyYXRpb24gaW1wbGVtZW50cyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24ge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAndXBsb2FkJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kZWwgPSB7XG4gICAgICAgIGZpbGVOYW1lICAgIDogJycsXG4gICAgICAgIHBhdGggICAgICAgIDogJycsXG4gICAgICAgIGxlbmd0aCAgICAgIDogMCxcbiAgICAgICAgc3VjY2VzcyAgICAgOiBmYWxzZSxcbiAgICAgICAgaW5saW5lUGF0aCAgOiAnJyxcbiAgICAgICAgZXJyb3JNZXNzYWdlOiAnJyxcbiAgICAgICAgaW5Qcm9ncmVzcyAgOiBmYWxzZSxcbiAgICAgICAgbG9hZGVkICAgICAgOiAwXG4gICAgfTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcHJvcGVydGllcyA9IFtcbiAgICAgICAge3RhcmdldDogJ2xvY2FsRmlsZScsIHR5cGU6ICdzdHJpbmcnLCB2YWx1ZTogJycsIGRhdGFCaW5kaW5nOiB0cnVlfSxcbiAgICAgICAge3RhcmdldDogJ3JlbW90ZUZvbGRlcicsIHR5cGU6ICdzdHJpbmcnLCB2YWx1ZTogJycsIGRhdGFCaW5kaW5nOiB0cnVlfSxcbiAgICAgICAge3RhcmdldDogJ29uUHJvZ3Jlc3MnLCBoaWRlIDogZmFsc2V9LFxuICAgICAgICB7dGFyZ2V0OiAnc3Bpbm5lckNvbnRleHQnLCBoaWRlIDogZmFsc2V9LFxuICAgICAgICB7dGFyZ2V0OiAnc3Bpbm5lck1lc3NhZ2UnLCBoaWRlIDogZmFsc2V9XG4gICAgXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWRDb3Jkb3ZhUGx1Z2lucyA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBmaWxlVXBsb2FkZXI6IERldmljZUZpbGVVcGxvYWRTZXJ2aWNlKSB7fVxuXG4gICAgcHVibGljIGludm9rZSh2YXJpYWJsZTogYW55LCBvcHRpb25zOiBhbnksIGRhdGFCaW5kaW5nczogTWFwPHN0cmluZywgYW55Pik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHNlcnZlclVybCA9ICRyb290U2NvcGUucHJvamVjdC5kZXBsb3llZFVybCArICdzZXJ2aWNlcy9maWxlL3VwbG9hZEZpbGU/cmVsYXRpdmVQYXRoPScgKyAoZGF0YUJpbmRpbmdzLmdldCgncmVtb3RlRm9sZGVyJykgfHwgJycpLFxuICAgICAgICAgICAgZmlsZVBhdGggPSBkYXRhQmluZGluZ3MuZ2V0KCdsb2NhbEZpbGUnKSxcbiAgICAgICAgICAgIGZpbGVOYW1lID0gZmlsZVBhdGguc3BsaXQoJy8nKS5wb3AoKSxcbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWUgICAgOiBmaWxlTmFtZSxcbiAgICAgICAgICAgICAgICBmaWxlU2l6ZSAgICA6IDAsXG4gICAgICAgICAgICAgICAgaW5Qcm9ncmVzcyAgOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxlbmd0aCAgICAgIDogMCxcbiAgICAgICAgICAgICAgICBsb2FkZWQgICAgICA6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgIHJldHVybiB0aGlzLmZpbGVVcGxvYWRlci51cGxvYWQoc2VydmVyVXJsLCAnZmlsZXMnLCBmaWxlUGF0aCwgZmlsZU5hbWUpXG4gICAgICAgICAgICAudGhlbih1cGxvYWRSZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgXy5hc3NpZ25JbihkYXRhLCBKU09OLnBhcnNlKHVwbG9hZFJlc3BvbnNlLnRleHQpWzBdKTtcbiAgICAgICAgICAgICAgICBkYXRhLmxvYWRlZCA9IGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuIl19
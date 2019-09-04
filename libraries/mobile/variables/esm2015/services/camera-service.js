import { isNumber } from '@wm/core';
import { DeviceVariableService } from '@wm/variables';
export class CameraService extends DeviceVariableService {
    constructor(camera, mediaCapture) {
        super();
        this.name = 'camera';
        this.operations = [];
        this.operations.push(new CaptureImageOperation(camera), new CaptureVideoOperation(mediaCapture));
    }
}
class CaptureImageOperation {
    constructor(camera) {
        this.camera = camera;
        this.name = 'captureImage';
        this.model = {
            imagePath: 'resources/images/imagelists/default-image.png'
        };
        this.properties = [
            { target: 'allowImageEdit', type: 'boolean', value: false, dataBinding: true },
            { target: 'imageQuality', type: 'number', value: 80, dataBinding: true },
            { target: 'imageEncodingType', type: 'list', options: { '0': 'JPEG', '1': 'PNG' }, value: '0', dataBinding: true },
            { target: 'correctOrientation', type: 'boolean', value: true, dataBinding: true },
            { target: 'imageTargetWidth', type: 'number', dataBinding: true },
            { target: 'imageTargetHeight', type: 'number', dataBinding: true }
        ];
        this.requiredCordovaPlugins = ['CAMERA', 'CAPTURE'];
    }
    invoke(variable, options, dataBindings) {
        const imageTargetWidth = dataBindings.get('imageTargetWidth'), imageTargetHeight = dataBindings.get('imageTargetHeight');
        let imageEncodingType = parseInt(dataBindings.get('imageEncodingType'), 10), cameraOptions;
        if (isNaN(imageEncodingType)) {
            imageEncodingType = (dataBindings.get('imageEncodingType') === 'JPEG' ? 0 : 1);
        }
        cameraOptions = {
            quality: dataBindings.get('imageQuality'),
            destinationType: 1,
            sourceType: 1,
            allowEdit: dataBindings.get('allowImageEdit'),
            encodingType: imageEncodingType,
            mediaType: 0,
            correctOrientation: dataBindings.get('correctOrientation'),
            targetWidth: isNumber(imageTargetWidth) ? imageTargetWidth : undefined,
            targetHeight: isNumber(imageTargetHeight) ? imageTargetHeight : undefined,
        };
        return this.camera.getPicture(cameraOptions).then(data => {
            return { imagePath: data };
        });
    }
}
class CaptureVideoOperation {
    constructor(mediaCapture) {
        this.mediaCapture = mediaCapture;
        this.name = 'captureVideo';
        this.model = {
            videoPath: ''
        };
        this.properties = [];
        this.requiredCordovaPlugins = ['CAMERA', 'CAPTURE'];
    }
    invoke(variable, options) {
        return this.mediaCapture.captureVideo({
            limit: 1
        }).then(data => {
            return { videoPath: data[0].fullPath };
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLXNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL3ZhcmlhYmxlcy8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL2NhbWVyYS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxFQUFFLHFCQUFxQixFQUE0QixNQUFNLGVBQWUsQ0FBQztBQUVoRixNQUFNLE9BQU8sYUFBYyxTQUFRLHFCQUFxQjtJQUlwRCxZQUFZLE1BQWMsRUFBRSxZQUEwQjtRQUNsRCxLQUFLLEVBQUUsQ0FBQztRQUpJLFNBQUksR0FBRyxRQUFRLENBQUM7UUFDaEIsZUFBVSxHQUErQixFQUFFLENBQUM7UUFJeEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsRUFDbEQsSUFBSSxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ2pELENBQUM7Q0FDSjtBQUVELE1BQU0scUJBQXFCO0lBZXZCLFlBQW9CLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBZGxCLFNBQUksR0FBRyxjQUFjLENBQUM7UUFDdEIsVUFBSyxHQUFHO1lBQ3BCLFNBQVMsRUFBRSwrQ0FBK0M7U0FDN0QsQ0FBQztRQUNjLGVBQVUsR0FBRztZQUNyQixFQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBQztZQUM1RSxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUM7WUFDdEUsRUFBQyxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBQyxHQUFHLEVBQUUsTUFB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LENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENhbWVyYSB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvY2FtZXJhJztcbmltcG9ydCB7IE1lZGlhQ2FwdHVyZSB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvbWVkaWEtY2FwdHVyZSc7XG5cbmltcG9ydCB7IGlzTnVtYmVyIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgRGV2aWNlVmFyaWFibGVTZXJ2aWNlLCBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24gfSBmcm9tICdAd20vdmFyaWFibGVzJztcblxuZXhwb3J0IGNsYXNzIENhbWVyYVNlcnZpY2UgZXh0ZW5kcyBEZXZpY2VWYXJpYWJsZVNlcnZpY2Uge1xuICAgIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ2NhbWVyYSc7XG4gICAgcHVibGljIHJlYWRvbmx5IG9wZXJhdGlvbnM6IElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbltdID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcihjYW1lcmE6IENhbWVyYSwgbWVkaWFDYXB0dXJlOiBNZWRpYUNhcHR1cmUpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb25zLnB1c2gobmV3IENhcHR1cmVJbWFnZU9wZXJhdGlvbihjYW1lcmEpLFxuICAgICAgICAgICAgbmV3IENhcHR1cmVWaWRlb09wZXJhdGlvbihtZWRpYUNhcHR1cmUpKTtcbiAgICB9XG59XG5cbmNsYXNzIENhcHR1cmVJbWFnZU9wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnY2FwdHVyZUltYWdlJztcbiAgICBwdWJsaWMgcmVhZG9ubHkgbW9kZWwgPSB7XG4gICAgICAgIGltYWdlUGF0aDogJ3Jlc291cmNlcy9pbWFnZXMvaW1hZ2VsaXN0cy9kZWZhdWx0LWltYWdlLnBuZydcbiAgICB9O1xuICAgIHB1YmxpYyByZWFkb25seSBwcm9wZXJ0aWVzID0gW1xuICAgICAgICAgICAge3RhcmdldDogJ2FsbG93SW1hZ2VFZGl0JywgdHlwZTogJ2Jvb2xlYW4nLCB2YWx1ZTogZmFsc2UsIGRhdGFCaW5kaW5nOiB0cnVlfSxcbiAgICAgICAgICAgIHt0YXJnZXQ6ICdpbWFnZVF1YWxpdHknLCB0eXBlOiAnbnVtYmVyJywgdmFsdWU6IDgwLCBkYXRhQmluZGluZzogdHJ1ZX0sXG4gICAgICAgICAgICB7dGFyZ2V0OiAnaW1hZ2VFbmNvZGluZ1R5cGUnLCB0eXBlOiAnbGlzdCcsIG9wdGlvbnM6IHsnMCc6ICdKUEVHJywgJzEnOiAnUE5HJ30sIHZhbHVlOiAnMCcsIGRhdGFCaW5kaW5nOiB0cnVlfSxcbiAgICAgICAgICAgIHt0YXJnZXQ6ICdjb3JyZWN0T3JpZW50YXRpb24nLCB0eXBlOiAnYm9vbGVhbicsIHZhbHVlOiB0cnVlLCBkYXRhQmluZGluZzogdHJ1ZX0sXG4gICAgICAgICAgICB7dGFyZ2V0OiAnaW1hZ2VUYXJnZXRXaWR0aCcsIHR5cGU6ICdudW1iZXInLCBkYXRhQmluZGluZzogdHJ1ZX0sXG4gICAgICAgICAgICB7dGFyZ2V0OiAnaW1hZ2VUYXJnZXRIZWlnaHQnLCB0eXBlOiAnbnVtYmVyJywgZGF0YUJpbmRpbmc6IHRydWV9XG4gICAgICAgIF07XG4gICAgcHVibGljIHJlYWRvbmx5IHJlcXVpcmVkQ29yZG92YVBsdWdpbnMgPSBbJ0NBTUVSQScsICdDQVBUVVJFJ107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhbWVyYTogQ2FtZXJhKSB7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgaW1hZ2VUYXJnZXRXaWR0aCA9IGRhdGFCaW5kaW5ncy5nZXQoJ2ltYWdlVGFyZ2V0V2lkdGgnKSxcbiAgICAgICAgICAgIGltYWdlVGFyZ2V0SGVpZ2h0ID0gZGF0YUJpbmRpbmdzLmdldCgnaW1hZ2VUYXJnZXRIZWlnaHQnKTtcbiAgICAgICAgbGV0IGltYWdlRW5jb2RpbmdUeXBlID0gcGFyc2VJbnQoZGF0YUJpbmRpbmdzLmdldCgnaW1hZ2VFbmNvZGluZ1R5cGUnKSwgMTApLFxuICAgICAgICAgICAgY2FtZXJhT3B0aW9ucztcbiAgICAgICAgaWYgKGlzTmFOKGltYWdlRW5jb2RpbmdUeXBlKSkge1xuICAgICAgICAgICAgaW1hZ2VFbmNvZGluZ1R5cGUgPSAoZGF0YUJpbmRpbmdzLmdldCgnaW1hZ2VFbmNvZGluZ1R5cGUnKSA9PT0gJ0pQRUcnID8gMCA6IDEpO1xuICAgICAgICB9XG4gICAgICAgIGNhbWVyYU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgcXVhbGl0eSAgICAgICAgICAgOiBkYXRhQmluZGluZ3MuZ2V0KCdpbWFnZVF1YWxpdHknKSxcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvblR5cGUgICA6IDEsIC8vIG9ubHkgZmlsZSB1cmxcbiAgICAgICAgICAgICAgICBzb3VyY2VUeXBlICAgICAgICA6IDEsIC8vIGNhbWVyYVxuICAgICAgICAgICAgICAgIGFsbG93RWRpdCAgICAgICAgIDogZGF0YUJpbmRpbmdzLmdldCgnYWxsb3dJbWFnZUVkaXQnKSxcbiAgICAgICAgICAgICAgICBlbmNvZGluZ1R5cGUgICAgICA6IGltYWdlRW5jb2RpbmdUeXBlLFxuICAgICAgICAgICAgICAgIG1lZGlhVHlwZSAgICAgICAgIDogMCwgLy8gYWx3YXlzIHBpY3R1cmVcbiAgICAgICAgICAgICAgICBjb3JyZWN0T3JpZW50YXRpb246IGRhdGFCaW5kaW5ncy5nZXQoJ2NvcnJlY3RPcmllbnRhdGlvbicpLFxuICAgICAgICAgICAgICAgIHRhcmdldFdpZHRoICAgICAgIDogaXNOdW1iZXIoaW1hZ2VUYXJnZXRXaWR0aCkgPyAgaW1hZ2VUYXJnZXRXaWR0aCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICB0YXJnZXRIZWlnaHQgICAgICA6IGlzTnVtYmVyKGltYWdlVGFyZ2V0SGVpZ2h0KSA/IGltYWdlVGFyZ2V0SGVpZ2h0IDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FtZXJhLmdldFBpY3R1cmUoY2FtZXJhT3B0aW9ucykudGhlbiggZGF0YSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge2ltYWdlUGF0aDogZGF0YX07XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuY2xhc3MgQ2FwdHVyZVZpZGVvT3BlcmF0aW9uIGltcGxlbWVudHMgSURldmljZVZhcmlhYmxlT3BlcmF0aW9uIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdjYXB0dXJlVmlkZW8nO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHtcbiAgICAgICAgdmlkZW9QYXRoOiAnJ1xuICAgIH07XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmVxdWlyZWRDb3Jkb3ZhUGx1Z2lucyA9IFsnQ0FNRVJBJywgJ0NBUFRVUkUnXTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbWVkaWFDYXB0dXJlOiBNZWRpYUNhcHR1cmUpIHtcblxuICAgIH1cblxuICAgIHB1YmxpYyBpbnZva2UodmFyaWFibGU6IGFueSwgb3B0aW9uczogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVkaWFDYXB0dXJlLmNhcHR1cmVWaWRlbyh7XG4gICAgICAgICAgICBsaW1pdCA6IDFcbiAgICAgICAgfSkudGhlbiggZGF0YSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge3ZpZGVvUGF0aDogZGF0YVswXS5mdWxsUGF0aH07XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==
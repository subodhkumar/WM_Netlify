import { Injectable } from '@angular/core';
import { DeviceFileUploadService } from '@wm/mobile/core';
import { LVService } from '@wm/variables';
var PushServiceImpl = /** @class */ (function () {
    function PushServiceImpl(deviceFileUploadService) {
        this.deviceFileUploadService = deviceFileUploadService;
    }
    // Returns a promise from the observable.
    PushServiceImpl.prototype.getPromiseFromObs = function (cb) {
        return new Promise(function (resolve, reject) {
            cb.subscribe(function (response) {
                if (response && response.type) {
                    resolve(response);
                }
            }, reject);
        });
    };
    PushServiceImpl.prototype.push = function (change) {
        var params = change.params;
        switch (change.service) {
            case 'DatabaseService':
                switch (change.operation) {
                    case 'insertTableData':
                        return this.getPromiseFromObs(LVService.insertTableData(change.params, null, null));
                    case 'insertMultiPartTableData':
                        return this.getPromiseFromObs(LVService.insertMultiPartTableData(change.params, null, null));
                    case 'updateTableData':
                        return this.getPromiseFromObs(LVService.updateTableData(change.params, null, null));
                    case 'updateMultiPartTableData':
                        return this.getPromiseFromObs(LVService.updateMultiPartTableData(change.params, null, null));
                    case 'deleteTableData':
                        return this.getPromiseFromObs(LVService.deleteTableData(change.params, null, null));
                }
            case 'OfflineFileUploadService':
                if (change.operation === 'uploadToServer') {
                    return this.deviceFileUploadService['uploadToServer'].call(this.deviceFileUploadService, params.serverUrl, params.ftOptions.fileKey, params.file, params.ftOptions.fileName, params.params, params.headers);
                }
        }
        return Promise.reject(change.service + " service with operation " + change.operation + " is not supported for push.");
    };
    PushServiceImpl.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    PushServiceImpl.ctorParameters = function () { return [
        { type: DeviceFileUploadService }
    ]; };
    return PushServiceImpl;
}());
export { PushServiceImpl };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVzaC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9vZmZsaW5lLyIsInNvdXJjZXMiOlsic2VydmljZXMvcHVzaC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHM0MsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUkxQztJQUdJLHlCQUNZLHVCQUFnRDtRQUFoRCw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO0lBQ3pELENBQUM7SUFFSix5Q0FBeUM7SUFDakMsMkNBQWlCLEdBQXpCLFVBQTBCLEVBQUU7UUFDeEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLEVBQUUsQ0FBQyxTQUFTLENBQUMsVUFBQSxRQUFRO2dCQUNqQixJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO29CQUMzQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3JCO1lBQ0wsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sOEJBQUksR0FBWCxVQUFZLE1BQWM7UUFDdEIsSUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM3QixRQUFRLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDcEIsS0FBSyxpQkFBaUI7Z0JBQ2xCLFFBQVEsTUFBTSxDQUFDLFNBQVMsRUFBRTtvQkFDdEIsS0FBSyxpQkFBaUI7d0JBQ2xCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDeEYsS0FBSywwQkFBMEI7d0JBQzNCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNqRyxLQUFLLGlCQUFpQjt3QkFDbEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN4RixLQUFLLDBCQUEwQjt3QkFDM0IsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQ2pHLEtBQUssaUJBQWlCO3dCQUNsQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQzNGO1lBQ0wsS0FBSywwQkFBMEI7Z0JBQzNCLElBQUksTUFBTSxDQUFDLFNBQVMsS0FBSyxnQkFBZ0IsRUFBRTtvQkFDdkMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQ3RELElBQUksQ0FBQyx1QkFBdUIsRUFDNUIsTUFBTSxDQUFDLFNBQVMsRUFDaEIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQ3hCLE1BQU0sQ0FBQyxJQUFJLEVBQ1gsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQ3pCLE1BQU0sQ0FBQyxNQUFNLEVBQ2IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUN2QjtTQUNSO1FBQ0QsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFLLE1BQU0sQ0FBQyxPQUFPLGdDQUEyQixNQUFNLENBQUMsU0FBUyxnQ0FBNkIsQ0FBQyxDQUFDO0lBQ3RILENBQUM7O2dCQS9DSixVQUFVOzs7O2dCQUxGLHVCQUF1Qjs7SUFxRGhDLHNCQUFDO0NBQUEsQUFoREQsSUFnREM7U0EvQ1ksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuXG5pbXBvcnQgeyBEZXZpY2VGaWxlVXBsb2FkU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5pbXBvcnQgeyBMVlNlcnZpY2UgfSBmcm9tICdAd20vdmFyaWFibGVzJztcblxuaW1wb3J0IHsgQ2hhbmdlLCBQdXNoU2VydmljZSB9IGZyb20gJy4vY2hhbmdlLWxvZy5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFB1c2hTZXJ2aWNlSW1wbCBpbXBsZW1lbnRzIFB1c2hTZXJ2aWNlIHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGRldmljZUZpbGVVcGxvYWRTZXJ2aWNlOiBEZXZpY2VGaWxlVXBsb2FkU2VydmljZVxuICAgICkge31cblxuICAgIC8vIFJldHVybnMgYSBwcm9taXNlIGZyb20gdGhlIG9ic2VydmFibGUuXG4gICAgcHJpdmF0ZSBnZXRQcm9taXNlRnJvbU9icyhjYikge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY2Iuc3Vic2NyaWJlKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UudHlwZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcHVzaChjaGFuZ2U6IENoYW5nZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IGNoYW5nZS5wYXJhbXM7XG4gICAgICAgIHN3aXRjaCAoY2hhbmdlLnNlcnZpY2UpIHtcbiAgICAgICAgICAgIGNhc2UgJ0RhdGFiYXNlU2VydmljZSc6XG4gICAgICAgICAgICAgICAgc3dpdGNoIChjaGFuZ2Uub3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2luc2VydFRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm9taXNlRnJvbU9icyhMVlNlcnZpY2UuaW5zZXJ0VGFibGVEYXRhKGNoYW5nZS5wYXJhbXMsIG51bGwsIG51bGwpKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFByb21pc2VGcm9tT2JzKExWU2VydmljZS5pbnNlcnRNdWx0aVBhcnRUYWJsZURhdGEoY2hhbmdlLnBhcmFtcywgbnVsbCwgbnVsbCkpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd1cGRhdGVUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvbWlzZUZyb21PYnMoTFZTZXJ2aWNlLnVwZGF0ZVRhYmxlRGF0YShjaGFuZ2UucGFyYW1zLCBudWxsLCBudWxsKSk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZU11bHRpUGFydFRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm9taXNlRnJvbU9icyhMVlNlcnZpY2UudXBkYXRlTXVsdGlQYXJ0VGFibGVEYXRhKGNoYW5nZS5wYXJhbXMsIG51bGwsIG51bGwpKTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGVsZXRlVGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFByb21pc2VGcm9tT2JzKExWU2VydmljZS5kZWxldGVUYWJsZURhdGEoY2hhbmdlLnBhcmFtcywgbnVsbCwgbnVsbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ09mZmxpbmVGaWxlVXBsb2FkU2VydmljZSc6XG4gICAgICAgICAgICAgICAgaWYgKGNoYW5nZS5vcGVyYXRpb24gPT09ICd1cGxvYWRUb1NlcnZlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGV2aWNlRmlsZVVwbG9hZFNlcnZpY2VbJ3VwbG9hZFRvU2VydmVyJ10uY2FsbChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGV2aWNlRmlsZVVwbG9hZFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuc2VydmVyVXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmZ0T3B0aW9ucy5maWxlS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmZpbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMuZnRPcHRpb25zLmZpbGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLnBhcmFtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCBgJHtjaGFuZ2Uuc2VydmljZX0gc2VydmljZSB3aXRoIG9wZXJhdGlvbiAke2NoYW5nZS5vcGVyYXRpb259IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHB1c2guYCk7XG4gICAgfVxufVxuIl19
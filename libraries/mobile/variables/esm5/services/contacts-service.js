import * as tslib_1 from "tslib";
import { DeviceVariableService } from '@wm/variables';
var ContactsService = /** @class */ (function (_super) {
    tslib_1.__extends(ContactsService, _super);
    function ContactsService(contacts) {
        var _this = _super.call(this) || this;
        _this.name = 'contacts';
        _this.operations = [];
        _this.operations.push(new GetContactsOperation(contacts));
        return _this;
    }
    return ContactsService;
}(DeviceVariableService));
export { ContactsService };
var GetContactsOperation = /** @class */ (function () {
    function GetContactsOperation(contacts) {
        this.contacts = contacts;
        this.name = 'getContacts';
        this.model = {
            id: '',
            displayName: '',
            phoneNumbers: [{ value: '' }]
        };
        this.properties = [
            { target: 'startUpdate', type: 'boolean' },
            { target: 'autoUpdate', type: 'boolean' },
            { target: 'contactFilter', type: 'string', value: '', dataBinding: true }
        ];
        this.requiredCordovaPlugins = ['CONTACTS'];
        this.waitingCalls = [];
    }
    GetContactsOperation.prototype.extractDisplayName = function (c) {
        var name = c.displayName;
        // In IOS, displayName is undefined, so using the formatted name.
        if (!name || name === '') {
            if (c.name.formatted) {
                return c.name.formatted;
            }
        }
        return name;
    };
    GetContactsOperation.prototype.processNextCall = function () {
        if (this.waitingCalls.length > 0) {
            this.waitingCalls[0]();
        }
    };
    GetContactsOperation.prototype.findContacts = function (requiredFields, findOptions) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // Contacts plugin is not processing two simultaneous calls. It is anwsering to only call.
            _this.waitingCalls.push(function () {
                _this.contacts.find(requiredFields, findOptions).then(function (data) {
                    if (data != null) {
                        var contacts = data.filter(function (c) {
                            c.displayName = _this.extractDisplayName(c);
                            return c.phoneNumbers && c.phoneNumbers.length > 0;
                        });
                        resolve(contacts);
                    }
                }, reject).then(function () {
                    _this.waitingCalls.shift();
                    _this.processNextCall();
                });
            });
            if (_this.waitingCalls.length === 1) {
                _this.processNextCall();
            }
        });
    };
    GetContactsOperation.prototype.invoke = function (variable, options, dataBindings) {
        var requiredFields = ['displayName', 'name'];
        var findOptions = {
            filter: dataBindings.get('contactFilter'),
            multiple: true
        };
        return this.findContacts(requiredFields, findOptions);
    };
    return GetContactsOperation;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGFjdHMtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvdmFyaWFibGVzLyIsInNvdXJjZXMiOlsic2VydmljZXMvY29udGFjdHMtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsT0FBTyxFQUFFLHFCQUFxQixFQUE0QixNQUFNLGVBQWUsQ0FBQztBQUVoRjtJQUFxQywyQ0FBcUI7SUFJdEQseUJBQVksUUFBa0I7UUFBOUIsWUFDSSxpQkFBTyxTQUVWO1FBTmUsVUFBSSxHQUFHLFVBQVUsQ0FBQztRQUNsQixnQkFBVSxHQUErQixFQUFFLENBQUM7UUFJeEQsS0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOztJQUM3RCxDQUFDO0lBQ0wsc0JBQUM7QUFBRCxDQUFDLEFBUkQsQ0FBcUMscUJBQXFCLEdBUXpEOztBQUVEO0lBZ0JJLDhCQUFvQixRQUFrQjtRQUFsQixhQUFRLEdBQVIsUUFBUSxDQUFVO1FBZnRCLFNBQUksR0FBRyxhQUFhLENBQUM7UUFDckIsVUFBSyxHQUFHO1lBQ3BCLEVBQUUsRUFBRyxFQUFFO1lBQ1AsV0FBVyxFQUFHLEVBQUU7WUFDaEIsWUFBWSxFQUFHLENBQUMsRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFDLENBQUM7U0FDL0IsQ0FBQztRQUNjLGVBQVUsR0FBRztZQUN6QixFQUFDLE1BQU0sRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztZQUN4QyxFQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBQztZQUN2QyxFQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUM7U0FDMUUsQ0FBQztRQUNjLDJCQUFzQixHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFL0MsaUJBQVksR0FBbUIsRUFBRSxDQUFDO0lBSXpDLENBQUM7SUFFTyxpREFBa0IsR0FBMUIsVUFBMkIsQ0FBVTtRQUNqQyxJQUFNLElBQUksR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBQzNCLGlFQUFpRTtRQUNqRSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQzthQUMzQjtTQUNKO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLDhDQUFlLEdBQXZCO1FBQ0ksSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDOUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQzFCO0lBQ0wsQ0FBQztJQUVPLDJDQUFZLEdBQXBCLFVBQXFCLGNBQWMsRUFBRSxXQUFXO1FBQWhELGlCQXFCQztRQXBCRyxPQUFPLElBQUksT0FBTyxDQUFNLFVBQUMsT0FBTyxFQUFFLE1BQU07WUFDcEMsMEZBQTBGO1lBQzFGLEtBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO2dCQUNuQixLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSTtvQkFDckQsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFO3dCQUNkLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDOzRCQUMxQixDQUFDLENBQUMsV0FBVyxHQUFHLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDM0MsT0FBTyxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzt3QkFDdkQsQ0FBQyxDQUFDLENBQUM7d0JBQ0gsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUNyQjtnQkFDTCxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUNaLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQzFCLEtBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDM0IsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksS0FBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNoQyxLQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7YUFDMUI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxxQ0FBTSxHQUFiLFVBQWMsUUFBYSxFQUFFLE9BQVksRUFBRSxZQUE4QjtRQUNyRSxJQUFNLGNBQWMsR0FBdUIsQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDbkUsSUFBTSxXQUFXLEdBQUc7WUFDaEIsTUFBTSxFQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQzFDLFFBQVEsRUFBRyxJQUFJO1NBQ2xCLENBQUM7UUFDRixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFDTCwyQkFBQztBQUFELENBQUMsQUFwRUQsSUFvRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb250YWN0LCBDb250YWN0RmllbGRUeXBlLCBDb250YWN0cyB9IGZyb20gJ0Bpb25pYy1uYXRpdmUvY29udGFjdHMnO1xuXG5pbXBvcnQgeyBEZXZpY2VWYXJpYWJsZVNlcnZpY2UsIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuXG5leHBvcnQgY2xhc3MgQ29udGFjdHNTZXJ2aWNlIGV4dGVuZHMgRGV2aWNlVmFyaWFibGVTZXJ2aWNlIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdjb250YWN0cyc7XG4gICAgcHVibGljIHJlYWRvbmx5IG9wZXJhdGlvbnM6IElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbltdID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcihjb250YWN0czogQ29udGFjdHMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5vcGVyYXRpb25zLnB1c2gobmV3IEdldENvbnRhY3RzT3BlcmF0aW9uKGNvbnRhY3RzKSk7XG4gICAgfVxufVxuXG5jbGFzcyBHZXRDb250YWN0c09wZXJhdGlvbiBpbXBsZW1lbnRzIElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbiB7XG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWUgPSAnZ2V0Q29udGFjdHMnO1xuICAgIHB1YmxpYyByZWFkb25seSBtb2RlbCA9IHtcbiAgICAgICAgaWQgOiAnJyxcbiAgICAgICAgZGlzcGxheU5hbWUgOiAnJyxcbiAgICAgICAgcGhvbmVOdW1iZXJzIDogW3t2YWx1ZTogJyd9XVxuICAgIH07XG4gICAgcHVibGljIHJlYWRvbmx5IHByb3BlcnRpZXMgPSBbXG4gICAgICAgIHt0YXJnZXQ6ICdzdGFydFVwZGF0ZScsIHR5cGU6ICdib29sZWFuJ30sXG4gICAgICAgIHt0YXJnZXQ6ICdhdXRvVXBkYXRlJywgdHlwZTogJ2Jvb2xlYW4nfSxcbiAgICAgICAge3RhcmdldDogJ2NvbnRhY3RGaWx0ZXInLCB0eXBlOiAnc3RyaW5nJywgdmFsdWU6ICcnLCBkYXRhQmluZGluZzogdHJ1ZX1cbiAgICBdO1xuICAgIHB1YmxpYyByZWFkb25seSByZXF1aXJlZENvcmRvdmFQbHVnaW5zID0gWydDT05UQUNUUyddO1xuXG4gICAgcHVibGljIHdhaXRpbmdDYWxsczogKCgpID0+IHZvaWQpW10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY29udGFjdHM6IENvbnRhY3RzKSB7XG5cbiAgICB9XG5cbiAgICBwcml2YXRlIGV4dHJhY3REaXNwbGF5TmFtZShjOiBDb250YWN0KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGMuZGlzcGxheU5hbWU7XG4gICAgICAgIC8vIEluIElPUywgZGlzcGxheU5hbWUgaXMgdW5kZWZpbmVkLCBzbyB1c2luZyB0aGUgZm9ybWF0dGVkIG5hbWUuXG4gICAgICAgIGlmICghbmFtZSB8fCBuYW1lID09PSAnJykge1xuICAgICAgICAgICAgaWYgKGMubmFtZS5mb3JtYXR0ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYy5uYW1lLmZvcm1hdHRlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHByb2Nlc3NOZXh0Q2FsbCgpIHtcbiAgICAgICAgaWYgKHRoaXMud2FpdGluZ0NhbGxzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMud2FpdGluZ0NhbGxzWzBdKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRDb250YWN0cyhyZXF1aXJlZEZpZWxkcywgZmluZE9wdGlvbnMpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBDb250YWN0cyBwbHVnaW4gaXMgbm90IHByb2Nlc3NpbmcgdHdvIHNpbXVsdGFuZW91cyBjYWxscy4gSXQgaXMgYW53c2VyaW5nIHRvIG9ubHkgY2FsbC5cbiAgICAgICAgICAgIHRoaXMud2FpdGluZ0NhbGxzLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGFjdHMuZmluZChyZXF1aXJlZEZpZWxkcywgZmluZE9wdGlvbnMpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRhY3RzID0gZGF0YS5maWx0ZXIoYyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYy5kaXNwbGF5TmFtZSA9IHRoaXMuZXh0cmFjdERpc3BsYXlOYW1lKGMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjLnBob25lTnVtYmVycyAmJiBjLnBob25lTnVtYmVycy5sZW5ndGggPiAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNvbnRhY3RzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHJlamVjdCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2FpdGluZ0NhbGxzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc05leHRDYWxsKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLndhaXRpbmdDYWxscy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NOZXh0Q2FsbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSwgZGF0YUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgY29uc3QgcmVxdWlyZWRGaWVsZHM6IENvbnRhY3RGaWVsZFR5cGVbXSA9IFsnZGlzcGxheU5hbWUnLCAnbmFtZSddO1xuICAgICAgICBjb25zdCBmaW5kT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGZpbHRlciA6IGRhdGFCaW5kaW5ncy5nZXQoJ2NvbnRhY3RGaWx0ZXInKSxcbiAgICAgICAgICAgIG11bHRpcGxlIDogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5maW5kQ29udGFjdHMocmVxdWlyZWRGaWVsZHMsIGZpbmRPcHRpb25zKTtcbiAgICB9XG59XG4iXX0=
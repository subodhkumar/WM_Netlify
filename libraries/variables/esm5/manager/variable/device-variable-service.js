import { $invokeWatchers } from '@wm/core';
import { initiateCallback } from '../../util/variable/variables.utils';
import { CONSTANTS, VARIABLE_CONSTANTS } from '../../constants/variables.constants';
var DeviceVariableService = /** @class */ (function () {
    function DeviceVariableService() {
    }
    DeviceVariableService.prototype.invoke = function (variable, options) {
        var operation = this.operations.find(function (o) {
            return o.name === variable.operation;
        });
        if (operation == null) {
            initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null);
            return Promise.reject("Could not find operation '" + variable.operation + "' in service '" + this.name + "'");
        }
        else if (CONSTANTS.hasCordova) {
            var dataBindings_1 = new Map();
            if (variable.dataBinding !== undefined) {
                Object.entries(variable).forEach(function (o) {
                    dataBindings_1.set(o[0], o[1]);
                });
                Object.entries(variable.dataBinding).forEach(function (o) {
                    dataBindings_1.set(o[0], o[1]);
                });
            }
            return operation.invoke(variable, options, dataBindings_1)
                .then(function (data) {
                variable.dataSet = data;
                $invokeWatchers(true);
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, data);
                return data;
            }, function (reason) {
                variable.dataSet = {};
                $invokeWatchers(true);
                initiateCallback(VARIABLE_CONSTANTS.EVENT.ERROR, variable, null);
                return reason;
            });
        }
        else {
            return Promise.resolve()
                .then(function () {
                initiateCallback(VARIABLE_CONSTANTS.EVENT.SUCCESS, variable, operation.model);
                return operation.model;
            });
        }
    };
    return DeviceVariableService;
}());
export { DeviceVariableService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLXZhcmlhYmxlLXNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsibWFuYWdlci92YXJpYWJsZS9kZXZpY2UtdmFyaWFibGUtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRXZFLE9BQU8sRUFBRSxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUVwRjtJQUFBO0lBMkNBLENBQUM7SUFyQ0csc0NBQU0sR0FBTixVQUFPLFFBQWEsRUFBRSxPQUFZO1FBQzlCLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQztZQUNwQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksU0FBUyxJQUFJLElBQUksRUFBRTtZQUNuQixnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsK0JBQTZCLFFBQVEsQ0FBQyxTQUFTLHNCQUFpQixJQUFJLENBQUMsSUFBSSxNQUFHLENBQUMsQ0FBQztTQUN2RzthQUFNLElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRTtZQUM3QixJQUFNLGNBQVksR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO1lBQzVDLElBQUksUUFBUSxDQUFDLFdBQVcsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztvQkFDOUIsY0FBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7b0JBQzFDLGNBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLENBQUMsQ0FBQzthQUNOO1lBQ0QsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsY0FBWSxDQUFDO2lCQUNuRCxJQUFJLENBQUMsVUFBVSxJQUFJO2dCQUNoQixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDeEIsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QixnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDbkUsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxFQUFFLFVBQVUsTUFBTTtnQkFDZixRQUFRLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztnQkFDdEIsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QixnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDakUsT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7U0FDVjthQUFNO1lBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFO2lCQUNuQixJQUFJLENBQUM7Z0JBQ0YsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM5RSxPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDM0IsQ0FBQyxDQUFDLENBQUM7U0FDVjtJQUNMLENBQUM7SUFDTCw0QkFBQztBQUFELENBQUMsQUEzQ0QsSUEyQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyAkaW52b2tlV2F0Y2hlcnMgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IGluaXRpYXRlQ2FsbGJhY2sgfSBmcm9tICcuLi8uLi91dGlsL3ZhcmlhYmxlL3ZhcmlhYmxlcy51dGlscyc7XG5pbXBvcnQgeyBJRGV2aWNlVmFyaWFibGVPcGVyYXRpb24gfSBmcm9tICcuL2RldmljZS12YXJpYWJsZS1vcGVyYXRpb24nO1xuaW1wb3J0IHsgQ09OU1RBTlRTLCBWQVJJQUJMRV9DT05TVEFOVFMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMvdmFyaWFibGVzLmNvbnN0YW50cyc7XG5cbmV4cG9ydCBjbGFzcyBEZXZpY2VWYXJpYWJsZVNlcnZpY2Uge1xuXG4gICAgbmFtZTogc3RyaW5nO1xuXG4gICAgcHJvdGVjdGVkIG9wZXJhdGlvbnM6IElEZXZpY2VWYXJpYWJsZU9wZXJhdGlvbltdO1xuXG4gICAgaW52b2tlKHZhcmlhYmxlOiBhbnksIG9wdGlvbnM6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IHRoaXMub3BlcmF0aW9ucy5maW5kKG8gPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG8ubmFtZSA9PT0gdmFyaWFibGUub3BlcmF0aW9uO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG9wZXJhdGlvbiA9PSBudWxsKSB7XG4gICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5FUlJPUiwgdmFyaWFibGUsIG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGBDb3VsZCBub3QgZmluZCBvcGVyYXRpb24gJyR7dmFyaWFibGUub3BlcmF0aW9ufScgaW4gc2VydmljZSAnJHt0aGlzLm5hbWV9J2ApO1xuICAgICAgICB9IGVsc2UgaWYgKENPTlNUQU5UUy5oYXNDb3Jkb3ZhKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhQmluZGluZ3MgPSBuZXcgTWFwPHN0cmluZywgYW55PigpO1xuICAgICAgICAgICAgaWYgKHZhcmlhYmxlLmRhdGFCaW5kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyh2YXJpYWJsZSkuZm9yRWFjaChvID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YUJpbmRpbmdzLnNldChvWzBdLCBvWzFdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyh2YXJpYWJsZS5kYXRhQmluZGluZykuZm9yRWFjaChvID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YUJpbmRpbmdzLnNldChvWzBdLCBvWzFdKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvcGVyYXRpb24uaW52b2tlKHZhcmlhYmxlLCBvcHRpb25zLCBkYXRhQmluZGluZ3MpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFibGUuZGF0YVNldCA9IGRhdGE7XG4gICAgICAgICAgICAgICAgICAgICRpbnZva2VXYXRjaGVycyh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhdGVDYWxsYmFjayhWQVJJQUJMRV9DT05TVEFOVFMuRVZFTlQuU1VDQ0VTUywgdmFyaWFibGUsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlLmRhdGFTZXQgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgJGludm9rZVdhdGNoZXJzKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5FUlJPUiwgdmFyaWFibGUsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVhc29uO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpbml0aWF0ZUNhbGxiYWNrKFZBUklBQkxFX0NPTlNUQU5UUy5FVkVOVC5TVUNDRVNTLCB2YXJpYWJsZSwgb3BlcmF0aW9uLm1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wZXJhdGlvbi5tb2RlbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==
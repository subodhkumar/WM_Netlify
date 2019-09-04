import { Calendar } from '@ionic-native/calendar';
import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';
/**
 * this file contains all calendar operations under 'calendar' service.
 */
export declare class CalendarService extends DeviceVariableService {
    readonly name = "calendar";
    readonly operations: IDeviceVariableOperation[];
    constructor(calendar: Calendar);
}

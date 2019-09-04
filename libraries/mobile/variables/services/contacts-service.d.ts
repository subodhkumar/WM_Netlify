import { Contacts } from '@ionic-native/contacts';
import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';
export declare class ContactsService extends DeviceVariableService {
    readonly name = "contacts";
    readonly operations: IDeviceVariableOperation[];
    constructor(contacts: Contacts);
}

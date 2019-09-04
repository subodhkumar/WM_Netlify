import { AppDefaults } from '@wm/core';
export declare class AppDefaultsService implements AppDefaults {
    constructor();
    dateFormat: string;
    timeFormat: string;
    dateTimeFormat: string;
    setFormats(formats: any): void;
}

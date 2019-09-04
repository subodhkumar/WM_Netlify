import { Resolve } from '@angular/router';
import { AbstractI18nService } from '@wm/core';
export declare class I18nResolve implements Resolve<any> {
    private i18nService;
    constructor(i18nService: AbstractI18nService);
    resolve(): any;
}

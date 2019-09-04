import { Resolve } from '@angular/router';
import { AppManagerService } from '../services/app.manager.service';
export declare class MetadataResolve implements Resolve<any> {
    private appManager;
    constructor(appManager: AppManagerService);
    resolve(): true | Promise<boolean>;
}

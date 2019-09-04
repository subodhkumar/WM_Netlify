import { ToastrService } from 'ngx-toastr';
import { AbstractToasterService } from '@wm/core';
export declare class ToasterServiceImpl extends AbstractToasterService {
    private toaster;
    constructor(toaster: ToastrService);
    private _showToaster;
    success(title: any, desc: any): any;
    error(title: any, desc: any): any;
    info(title: any, desc: any): any;
    warn(title: any, desc: any): any;
    show(type: any, title: any, desc: any, options: any): any;
    hide(toasterObj: any): void;
    showCustom(page: any, options: any): import("ngx-toastr").ActiveToast<any>;
}

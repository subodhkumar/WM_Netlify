(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('@wm/mobile/placeholder', ['exports', '@angular/core'], factory) :
    (factory((global.wm = global.wm || {}, global.wm.mobile = global.wm.mobile || {}, global.wm.mobile.runtime = {}),global.ng.core));
}(this, (function (exports,core) { 'use strict';

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */
    var MobileRuntimeModule = /** @class */ (function () {
        function MobileRuntimeModule() {
        }
        /**
         * @return {?}
         */
        MobileRuntimeModule.forRoot = /**
         * @return {?}
         */
            function () {
                return {
                    ngModule: MobileRuntimeModule,
                    providers: []
                };
            };
        MobileRuntimeModule.decorators = [
            { type: core.NgModule, args: [{},] }
        ];
        return MobileRuntimeModule;
    }());

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    /**
     * @fileoverview added by tsickle
     * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
     */

    exports.MobileRuntimeModule = MobileRuntimeModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.umd.js.map
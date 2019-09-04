import * as tslib_1 from "tslib";
import { Compiler, Injectable, Injector, ChangeDetectorRef, KeyValueDiffers } from '@angular/core';
import { AsyncPipe, UpperCasePipe, LowerCasePipe, JsonPipe, SlicePipe, DecimalPipe, PercentPipe, TitleCasePipe, CurrencyPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, KeyValuePipe, NgLocalization } from '@angular/common';
import { SuffixPipe, ToDatePipe, FileIconClassPipe, FileExtensionFromMimePipe, FilterPipe, FileSizePipe, ToNumberPipe, ToCurrencyPipe, PrefixPipe, TimeFromNowPipe, NumberToStringPipe, StateClassPipe, StringToNumberPipe } from '@wm/components';
import { getSessionStorageItem } from '@wm/core';
import * as i0 from "@angular/core";
var PipeProvider = /** @class */ (function () {
    function PipeProvider(compiler, injector) {
        var _this = this;
        this.compiler = compiler;
        this.injector = injector;
        this._locale = getSessionStorageItem('selectedLocale') || 'en';
        this.preparePipeMeta = function (reference, name, pure, diDeps) {
            if (diDeps === void 0) { diDeps = []; }
            return ({
                type: { reference: reference, diDeps: diDeps },
                name: name,
                pure: pure
            });
        };
        this._pipeData = [
            // TODO | NEED TO BE TESTED
            this.preparePipeMeta(AsyncPipe, 'async', false, [ChangeDetectorRef]),
            this.preparePipeMeta(SlicePipe, 'slice', false),
            this.preparePipeMeta(PercentPipe, 'percent', true, [this._locale]),
            this.preparePipeMeta(I18nPluralPipe, 'i18nPlural', true, [
                NgLocalization
            ]),
            this.preparePipeMeta(I18nSelectPipe, 'i18nSelect', true),
            this.preparePipeMeta(KeyValuePipe, 'keyvalue', false, [
                KeyValueDiffers
            ]),
            this.preparePipeMeta(FileIconClassPipe, 'fileIconClass', true),
            this.preparePipeMeta(FileExtensionFromMimePipe, 'fileExtensionFromMime', true),
            this.preparePipeMeta(StateClassPipe, 'stateClass', true),
            this.preparePipeMeta(FileSizePipe, 'filesize', true),
            // TESTED
            this.preparePipeMeta(FilterPipe, 'filter', true),
            this.preparePipeMeta(UpperCasePipe, 'uppercase', true),
            this.preparePipeMeta(LowerCasePipe, 'lowercase', true),
            this.preparePipeMeta(JsonPipe, 'json', false),
            this.preparePipeMeta(DecimalPipe, 'number', true, [this._locale]),
            this.preparePipeMeta(TitleCasePipe, 'titlecase', true),
            this.preparePipeMeta(CurrencyPipe, 'currency', true, [this._locale]),
            this.preparePipeMeta(DatePipe, 'date', true, [this._locale]),
            this.preparePipeMeta(ToDatePipe, 'toDate', true, [
                new DatePipe(this._locale)
            ]),
            this.preparePipeMeta(ToNumberPipe, 'toNumber', true, [
                new DecimalPipe(this._locale)
            ]),
            this.preparePipeMeta(ToCurrencyPipe, 'toCurrency', true, [
                new DecimalPipe(this._locale)
            ]),
            this.preparePipeMeta(PrefixPipe, 'prefix', true),
            this.preparePipeMeta(SuffixPipe, 'suffix', true),
            this.preparePipeMeta(TimeFromNowPipe, 'timeFromNow', true),
            this.preparePipeMeta(NumberToStringPipe, 'numberToString', true, [
                new DecimalPipe(this._locale)
            ]),
            this.preparePipeMeta(StringToNumberPipe, 'stringToNumber', true)
        ];
        this._pipeMeta = new Map();
        this._pipeData.forEach(function (v) {
            _this._pipeMeta.set(v.name, v);
        });
    }
    PipeProvider.prototype.unknownPipe = function (name) {
        throw Error("The pipe '" + name + "' could not be found");
    };
    PipeProvider.prototype.meta = function (name) {
        var meta = this._pipeMeta.get(name);
        if (!meta) {
            this.unknownPipe(name);
        }
        return meta;
    };
    PipeProvider.prototype.getPipeNameVsIsPureMap = function () {
        var _map = new Map();
        this._pipeMeta.forEach(function (v, k) {
            _map.set(k, v.pure);
        });
        return _map;
    };
    PipeProvider.prototype.resolveDep = function (dep) {
        return this.injector.get(dep.token.identifier.reference);
    };
    PipeProvider.prototype.getInstance = function (name) {
        var e_1, _a;
        var _b = this.meta(name).type, ref = _b.reference, deps = _b.diDeps;
        if (!ref) {
            this.unknownPipe(name);
        }
        if (!deps.length) {
            return new ref();
        }
        else {
            var args = [];
            try {
                for (var deps_1 = tslib_1.__values(deps), deps_1_1 = deps_1.next(); !deps_1_1.done; deps_1_1 = deps_1.next()) {
                    var dep = deps_1_1.value;
                    args.push(dep);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (deps_1_1 && !deps_1_1.done && (_a = deps_1.return)) _a.call(deps_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return new (ref.bind.apply(ref, tslib_1.__spread([void 0], args)))();
        }
    };
    PipeProvider.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] }
    ];
    /** @nocollapse */
    PipeProvider.ctorParameters = function () { return [
        { type: Compiler },
        { type: Injector }
    ]; };
    PipeProvider.ngInjectableDef = i0.defineInjectable({ factory: function PipeProvider_Factory() { return new PipeProvider(i0.inject(i0.Compiler), i0.inject(i0.INJECTOR)); }, token: PipeProvider, providedIn: "root" });
    return PipeProvider;
}());
export { PipeProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlwZS1wcm92aWRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL3BpcGUtcHJvdmlkZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFrQixlQUFlLEVBQVEsTUFBTSxlQUFlLENBQUM7QUFDekgsT0FBTyxFQUNILFNBQVMsRUFDVCxhQUFhLEVBQ2IsYUFBYSxFQUNiLFFBQVEsRUFDUixTQUFTLEVBQ1QsV0FBVyxFQUNYLFdBQVcsRUFDWCxhQUFhLEVBQ2IsWUFBWSxFQUNaLFFBQVEsRUFDUixjQUFjLEVBQ2QsY0FBYyxFQUNkLFlBQVksRUFDWixjQUFjLEVBQ2pCLE1BQU0saUJBQWlCLENBQUE7QUFDeEIsT0FBTyxFQUNILFVBQVUsRUFDVixVQUFVLEVBQ1YsaUJBQWlCLEVBQ2pCLHlCQUF5QixFQUN6QixVQUFVLEVBQ1YsWUFBWSxFQUNaLFlBQVksRUFDWixjQUFjLEVBQ2QsVUFBVSxFQUNWLGVBQWUsRUFDZixrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLGtCQUFrQixFQUNyQixNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLFVBQVUsQ0FBQzs7QUFFakQ7SUFtRUksc0JBQW9CLFFBQWtCLEVBQVUsUUFBa0I7UUFBbEUsaUJBS0M7UUFMbUIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVU7UUE5RGxFLFlBQU8sR0FBRyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLElBQUksQ0FBQztRQUMxRCxvQkFBZSxHQUFHLFVBQ2QsU0FBZSxFQUNmLElBQVksRUFDWixJQUFhLEVBQ2IsTUFBVztZQUFYLHVCQUFBLEVBQUEsV0FBVztZQUNWLE9BQUEsQ0FBQztnQkFDRixJQUFJLEVBQUUsRUFB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QztJQUVELGlDQUFVLEdBQVYsVUFBVyxHQUFHO1FBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRUQsa0NBQVcsR0FBWCxVQUFZLElBQUk7O1FBRVIsSUFBQSx5QkFBc0MsRUFBOUIsa0JBQWMsRUFBRSxnQkFBYyxDQUN0QjtRQUNwQixJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMxQjtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2QsT0FBTyxJQUFJLEdBQUcsRUFBRSxDQUFDO1NBQ3BCO2FBQU07WUFDSCxJQUFNLElBQUksR0FBRyxFQUFFLENBQUM7O2dCQUNoQixLQUFrQixJQUFBLFNBQUEsaUJBQUEsSUFBSSxDQUFBLDBCQUFBLDRDQUFFO29CQUFuQixJQUFNLEdBQUcsaUJBQUE7b0JBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDbEI7Ozs7Ozs7OztZQUNELFlBQVcsR0FBRyxZQUFILEdBQUcsNkJBQUksSUFBSSxNQUFFO1NBQzNCO0lBQ0wsQ0FBQzs7Z0JBL0dKLFVBQVUsU0FBQztvQkFDUixVQUFVLEVBQUUsTUFBTTtpQkFDckI7Ozs7Z0JBcENRLFFBQVE7Z0JBQWMsUUFBUTs7O3VCQUF2QztDQWtKQyxBQWhIRCxJQWdIQztTQTdHWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcGlsZXIsIEluamVjdGFibGUsIEluamVjdG9yLCBDaGFuZ2VEZXRlY3RvclJlZiwgSW5qZWN0aW9uVG9rZW4sIEtleVZhbHVlRGlmZmVycywgUGlwZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgICBBc3luY1BpcGUsXG4gICAgVXBwZXJDYXNlUGlwZSxcbiAgICBMb3dlckNhc2VQaXBlLFxuICAgIEpzb25QaXBlLFxuICAgIFNsaWNlUGlwZSxcbiAgICBEZWNpbWFsUGlwZSxcbiAgICBQZXJjZW50UGlwZSxcbiAgICBUaXRsZUNhc2VQaXBlLFxuICAgIEN1cnJlbmN5UGlwZSxcbiAgICBEYXRlUGlwZSxcbiAgICBJMThuUGx1cmFsUGlwZSxcbiAgICBJMThuU2VsZWN0UGlwZSxcbiAgICBLZXlWYWx1ZVBpcGUsXG4gICAgTmdMb2NhbGl6YXRpb25cbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJ1xuaW1wb3J0IHtcbiAgICBTdWZmaXhQaXBlLFxuICAgIFRvRGF0ZVBpcGUsXG4gICAgRmlsZUljb25DbGFzc1BpcGUsXG4gICAgRmlsZUV4dGVuc2lvbkZyb21NaW1lUGlwZSxcbiAgICBGaWx0ZXJQaXBlLFxuICAgIEZpbGVTaXplUGlwZSxcbiAgICBUb051bWJlclBpcGUsXG4gICAgVG9DdXJyZW5jeVBpcGUsXG4gICAgUHJlZml4UGlwZSxcbiAgICBUaW1lRnJvbU5vd1BpcGUsXG4gICAgTnVtYmVyVG9TdHJpbmdQaXBlLFxuICAgIFN0YXRlQ2xhc3NQaXBlLFxuICAgIFN0cmluZ1RvTnVtYmVyUGlwZVxufSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBnZXRTZXNzaW9uU3RvcmFnZUl0ZW0gfSBmcm9tICdAd20vY29yZSc7XG5cbkBJbmplY3RhYmxlKHtcbiAgICBwcm92aWRlZEluOiAncm9vdCdcbn0pXG5leHBvcnQgY2xhc3MgUGlwZVByb3ZpZGVyIHtcbiAgICBfcGlwZU1ldGE7XG4gICAgX2xvY2FsZSA9IGdldFNlc3Npb25TdG9yYWdlSXRlbSgnc2VsZWN0ZWRMb2NhbGUnKSB8fCAnZW4nO1xuICAgIHByZXBhcmVQaXBlTWV0YSA9IChcbiAgICAgICAgcmVmZXJlbmNlOiBQaXBlLFxuICAgICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHB1cmU6IGJvb2xlYW4sXG4gICAgICAgIGRpRGVwcyA9IFtdXG4gICAgKSA9PiAoe1xuICAgICAgICB0eXBlOiB7IHJlZmVyZW5jZSwgZGlEZXBzIH0sXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHB1cmVcbiAgICB9KVxuICAgIF9waXBlRGF0YSA9IFtcbiAgICAgICAgLy8gVE9ETyB8IE5FRUQgVE8gQkUgVEVTVEVEXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKEFzeW5jUGlwZSwgJ2FzeW5jJywgZmFsc2UsIFtDaGFuZ2VEZXRlY3RvclJlZl0pLFxuICAgICAgICB0aGlzLnByZXBhcmVQaXBlTWV0YShTbGljZVBpcGUsICdzbGljZScsIGZhbHNlKSxcbiAgICAgICAgdGhpcy5wcmVwYXJlUGlwZU1ldGEoUGVyY2VudFBpcGUsICdwZXJjZW50JywgdHJ1ZSwgW3RoaXMuX2xvY2FsZV0pLFxuICAgICAgICB0aGlzLnByZXBhcmVQaXBlTWV0YShJMThuUGx1cmFsUGlwZSwgJ2kxOG5QbHVyYWwnLCB0cnVlLCBbXG4gICAgICAgICAgICBOZ0xvY2FsaXphdGlvblxuICAgICAgICBdKSxcbiAgICAgICAgdGhpcy5wcmVwYXJlUGlwZU1ldGEoSTE4blNlbGVjdFBpcGUsICdpMThuU2VsZWN0JywgdHJ1ZSksXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKEtleVZhbHVlUGlwZSwgJ2tleXZhbHVlJywgZmFsc2UsIFtcbiAgICAgICAgICAgIEtleVZhbHVlRGlmZmVyc1xuICAgICAgICBdKSxcbiAgICAgICAgdGhpcy5wcmVwYXJlUGlwZU1ldGEoRmlsZUljb25DbGFzc1BpcGUsICdmaWxlSWNvbkNsYXNzJywgdHJ1ZSksXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKFxuICAgICAgICAgICAgRmlsZUV4dGVuc2lvbkZyb21NaW1lUGlwZSxcbiAgICAgICAgICAgICdmaWxlRXh0ZW5zaW9uRnJvbU1pbWUnLFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICApLFxuICAgICAgICB0aGlzLnByZXBhcmVQaXBlTWV0YShTdGF0ZUNsYXNzUGlwZSwgJ3N0YXRlQ2xhc3MnLCB0cnVlKSxcbiAgICAgICAgdGhpcy5wcmVwYXJlUGlwZU1ldGEoRmlsZVNpemVQaXBlLCAnZmlsZXNpemUnLCB0cnVlKSxcbiAgICAgICAgLy8gVEVTVEVEXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKEZpbHRlclBpcGUsICdmaWx0ZXInLCB0cnVlKSxcbiAgICAgICAgdGhpcy5wcmVwYXJlUGlwZU1ldGEoVXBwZXJDYXNlUGlwZSwgJ3VwcGVyY2FzZScsIHRydWUpLFxuICAgICAgICB0aGlzLnByZXBhcmVQaXBlTWV0YShMb3dlckNhc2VQaXBlLCAnbG93ZXJjYXNlJywgdHJ1ZSksXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKEpzb25QaXBlLCAnanNvbicsIGZhbHNlKSxcbiAgICAgICAgdGhpcy5wcmVwYXJlUGlwZU1ldGEoRGVjaW1hbFBpcGUsICdudW1iZXInLCB0cnVlLCBbdGhpcy5fbG9jYWxlXSksXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKFRpdGxlQ2FzZVBpcGUsICd0aXRsZWNhc2UnLCB0cnVlKSxcbiAgICAgICAgdGhpcy5wcmVwYXJlUGlwZU1ldGEoQ3VycmVuY3lQaXBlLCAnY3VycmVuY3knLCB0cnVlLCBbdGhpcy5fbG9jYWxlXSksXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKERhdGVQaXBlLCAnZGF0ZScsIHRydWUsIFt0aGlzLl9sb2NhbGVdKSxcbiAgICAgICAgdGhpcy5wcmVwYXJlUGlwZU1ldGEoVG9EYXRlUGlwZSwgJ3RvRGF0ZScsIHRydWUsIFtcbiAgICAgICAgICAgIG5ldyBEYXRlUGlwZSh0aGlzLl9sb2NhbGUpXG4gICAgICAgIF0pLFxuICAgICAgICB0aGlzLnByZXBhcmVQaXBlTWV0YShUb051bWJlclBpcGUsICd0b051bWJlcicsIHRydWUsIFtcbiAgICAgICAgICAgIG5ldyBEZWNpbWFsUGlwZSh0aGlzLl9sb2NhbGUpXG4gICAgICAgIF0pLFxuICAgICAgICB0aGlzLnByZXBhcmVQaXBlTWV0YShUb0N1cnJlbmN5UGlwZSwgJ3RvQ3VycmVuY3knLCB0cnVlLCBbXG4gICAgICAgICAgICBuZXcgRGVjaW1hbFBpcGUodGhpcy5fbG9jYWxlKVxuICAgICAgICBdKSxcbiAgICAgICAgdGhpcy5wcmVwYXJlUGlwZU1ldGEoUHJlZml4UGlwZSwgJ3ByZWZpeCcsIHRydWUpLFxuICAgICAgICB0aGlzLnByZXBhcmVQaXBlTWV0YShTdWZmaXhQaXBlLCAnc3VmZml4JywgdHJ1ZSksXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKFRpbWVGcm9tTm93UGlwZSwgJ3RpbWVGcm9tTm93JywgdHJ1ZSksXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKE51bWJlclRvU3RyaW5nUGlwZSwgJ251bWJlclRvU3RyaW5nJywgdHJ1ZSwgW1xuICAgICAgICAgICAgbmV3IERlY2ltYWxQaXBlKHRoaXMuX2xvY2FsZSlcbiAgICAgICAgXSksXG4gICAgICAgIHRoaXMucHJlcGFyZVBpcGVNZXRhKFN0cmluZ1RvTnVtYmVyUGlwZSwgJ3N0cmluZ1RvTnVtYmVyJywgdHJ1ZSlcbiAgICBdO1xuXG4gICAgdW5rbm93blBpcGUobmFtZSkge1xuICAgICAgICB0aHJvdyBFcnJvcihgVGhlIHBpcGUgJyR7bmFtZX0nIGNvdWxkIG5vdCBiZSBmb3VuZGApO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY29tcGlsZXI6IENvbXBpbGVyLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgICAgICB0aGlzLl9waXBlTWV0YSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5fcGlwZURhdGEuZm9yRWFjaCh2ID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3BpcGVNZXRhLnNldCh2Lm5hbWUsIHYpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtZXRhKG5hbWUpIHtcbiAgICAgICAgY29uc3QgbWV0YSA9IHRoaXMuX3BpcGVNZXRhLmdldChuYW1lKTtcbiAgICAgICAgaWYgKCFtZXRhKSB7XG4gICAgICAgICAgICB0aGlzLnVua25vd25QaXBlKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXRhO1xuICAgIH1cblxuICAgIGdldFBpcGVOYW1lVnNJc1B1cmVNYXAoKSB7XG4gICAgICAgIGNvbnN0IF9tYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuX3BpcGVNZXRhLmZvckVhY2goKHYsIGspID0+IHtcbiAgICAgICAgICAgIF9tYXAuc2V0KGssIHYucHVyZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gX21hcDtcbiAgICB9XG5cbiAgICByZXNvbHZlRGVwKGRlcCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbmplY3Rvci5nZXQoZGVwLnRva2VuLmlkZW50aWZpZXIucmVmZXJlbmNlKTtcbiAgICB9XG5cbiAgICBnZXRJbnN0YW5jZShuYW1lKSB7XG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIHR5cGU6IHsgcmVmZXJlbmNlOiByZWYsIGRpRGVwczogZGVwcyB9XG4gICAgICAgIH0gPSB0aGlzLm1ldGEobmFtZSk7XG4gICAgICAgIGlmICghcmVmKSB7XG4gICAgICAgICAgICB0aGlzLnVua25vd25QaXBlKG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkZXBzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyByZWYoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGVwIG9mIGRlcHMpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goZGVwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgcmVmKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
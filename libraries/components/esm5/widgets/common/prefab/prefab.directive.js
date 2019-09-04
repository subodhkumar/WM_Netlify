import * as tslib_1 from "tslib";
import { Attribute, ChangeDetectorRef, Directive, ElementRef, Injector } from '@angular/core';
import { setCSS } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { styler } from '../../framework/styler';
import { PROP_TYPE, register } from '../../framework/widget-props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { prefabProps } from './prefab.props';
var DEFAULT_CLS = 'app-prefab';
var registeredPropsSet = new Set();
var PrefabDirective = /** @class */ (function (_super) {
    tslib_1.__extends(PrefabDirective, _super);
    function PrefabDirective(inj, elRef, cdr, prefabName) {
        var _this = this;
        var widgetType = "wm-prefab-" + prefabName;
        var WIDGET_CONFIG = { widgetType: widgetType, hostClass: DEFAULT_CLS };
        _this = _super.call(this, inj, WIDGET_CONFIG, new Promise(function (res) { return _this.propsReady = res; })) || this;
        _this.prefabName = prefabName;
        _this.widgetType = widgetType;
        _this.name = elRef.nativeElement.getAttribute('name');
        styler(_this.nativeElement, _this);
        // Call on property change on name to set name attribute on element.
        _this.registerReadyStateListener(function () {
            _super.prototype.onPropertyChange.call(_this, 'name', _this.name);
        });
        return _this;
    }
    PrefabDirective.prototype.onStyleChange = function (key, nv, ov) {
        if (key === 'height') {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }
    };
    PrefabDirective.prototype.setProps = function (config) {
        if (!config || !config.properties) {
            return;
        }
        if (!registeredPropsSet.has(this.widgetType)) {
            register(this.widgetType, this.prepareProps(config.properties));
        }
        this.propsReady();
    };
    PrefabDirective.prototype.handleEvent = function () {
        // do not call the super;
        // prevent events from getting registered
    };
    PrefabDirective.prototype.prepareProps = function (props) {
        if (props === void 0) { props = {}; }
        var propsMap = new Map(prefabProps);
        Object.entries(props).forEach(function (_a) {
            var _b = tslib_1.__read(_a, 2), k = _b[0], v = _b[1];
            var type = PROP_TYPE.STRING;
            if (v.type === 'boolean') {
                type = PROP_TYPE.BOOLEAN;
            }
            else if (v.type === 'number') {
                type = PROP_TYPE.NUMBER;
            }
            else if (v.type !== 'string') {
                type = v.type;
            }
            // Do not set the 'bind:*' values
            propsMap.set(k, { type: type, value: _.startsWith(v.value, 'bind:') ? undefined : v.value });
        });
        registeredPropsSet.add(this.widgetType);
        return propsMap;
    };
    PrefabDirective.decorators = [
        { type: Directive, args: [{
                    selector: 'section[wmPrefab]',
                    providers: [
                        provideAsWidgetRef(PrefabDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    PrefabDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: ElementRef },
        { type: ChangeDetectorRef },
        { type: undefined, decorators: [{ type: Attribute, args: ['prefabname',] }] }
    ]; };
    return PrefabDirective;
}(StylableComponent));
export { PrefabDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcHJlZmFiL3ByZWZhYi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFOUYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNuRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0MsSUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDO0FBRWpDLElBQU0sa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztBQUk3QztJQU1xQywyQ0FBaUI7SUFPbEQseUJBQVksR0FBYSxFQUFFLEtBQWlCLEVBQUUsR0FBc0IsRUFBMkIsVUFBVTtRQUF6RyxpQkFnQkM7UUFmRyxJQUFNLFVBQVUsR0FBRyxlQUFhLFVBQVksQ0FBQztRQUM3QyxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsWUFBQSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztRQUUzRCxRQUFBLGtCQUFNLEdBQUcsRUFBRSxhQUFhLEVBQUUsSUFBSSxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxLQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDLFNBQUM7UUFFckUsS0FB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aUIsR0FxRXJEO1NBckVZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIENoYW5nZURldGVjdG9yUmVmLCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHNldENTUyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFBST1BfVFlQRSwgcmVnaXN0ZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBwcmVmYWJQcm9wcyB9IGZyb20gJy4vcHJlZmFiLnByb3BzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXByZWZhYic7XG5cbmNvbnN0IHJlZ2lzdGVyZWRQcm9wc1NldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnc2VjdGlvblt3bVByZWZhYl0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoUHJlZmFiRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgUHJlZmFiRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuXG4gICAgd2lkZ2V0VHlwZTogc3RyaW5nO1xuICAgIHByZWZhYk5hbWU6IHN0cmluZztcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgcHJvcHNSZWFkeTogRnVuY3Rpb247XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBlbFJlZjogRWxlbWVudFJlZiwgY2RyOiBDaGFuZ2VEZXRlY3RvclJlZiwgQEF0dHJpYnV0ZSgncHJlZmFibmFtZScpIHByZWZhYk5hbWUpIHtcbiAgICAgICAgY29uc3Qgd2lkZ2V0VHlwZSA9IGB3bS1wcmVmYWItJHtwcmVmYWJOYW1lfWA7XG4gICAgICAgIGNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZSwgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHLCBuZXcgUHJvbWlzZShyZXMgPT4gdGhpcy5wcm9wc1JlYWR5ID0gcmVzKSk7XG5cbiAgICAgICAgdGhpcy5wcmVmYWJOYW1lID0gcHJlZmFiTmFtZTtcbiAgICAgICAgdGhpcy53aWRnZXRUeXBlID0gd2lkZ2V0VHlwZTtcbiAgICAgICAgdGhpcy5uYW1lID0gZWxSZWYubmF0aXZlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ25hbWUnKTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcblxuICAgICAgICAvLyBDYWxsIG9uIHByb3BlcnR5IGNoYW5nZSBvbiBuYW1lIHRvIHNldCBuYW1lIGF0dHJpYnV0ZSBvbiBlbGVtZW50LlxuICAgICAgICB0aGlzLnJlZ2lzdGVyUmVhZHlTdGF0ZUxpc3RlbmVyKCgpID0+IHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2UoJ25hbWUnLCB0aGlzLm5hbWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblN0eWxlQ2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdjogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdoZWlnaHQnKSB7XG4gICAgICAgICAgICBzZXRDU1ModGhpcy5uYXRpdmVFbGVtZW50LCAnb3ZlcmZsb3cnLCAnYXV0bycpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldFByb3BzKGNvbmZpZykge1xuICAgICAgICBpZiAoIWNvbmZpZyB8fCAhY29uZmlnLnByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcmVnaXN0ZXJlZFByb3BzU2V0Lmhhcyh0aGlzLndpZGdldFR5cGUpKSB7XG4gICAgICAgICAgICByZWdpc3Rlcih0aGlzLndpZGdldFR5cGUsIHRoaXMucHJlcGFyZVByb3BzKGNvbmZpZy5wcm9wZXJ0aWVzKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByb3BzUmVhZHkoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQoKSB7XG4gICAgICAgIC8vIGRvIG5vdCBjYWxsIHRoZSBzdXBlcjtcbiAgICAgICAgLy8gcHJldmVudCBldmVudHMgZnJvbSBnZXR0aW5nIHJlZ2lzdGVyZWRcbiAgICB9XG5cbiAgICBwcml2YXRlIHByZXBhcmVQcm9wcyhwcm9wcyA9IHt9KSB7XG4gICAgICAgIGNvbnN0IHByb3BzTWFwID0gbmV3IE1hcChwcmVmYWJQcm9wcyk7XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHByb3BzKS5mb3JFYWNoKChbaywgdl06IFtzdHJpbmcsIGFueV0pID0+IHtcbiAgICAgICAgICAgIGxldCB0eXBlID0gUFJPUF9UWVBFLlNUUklORztcblxuICAgICAgICAgICAgaWYgKHYudHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IFBST1BfVFlQRS5CT09MRUFOO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2LnR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgdHlwZSA9IFBST1BfVFlQRS5OVU1CRVI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHYudHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gdi50eXBlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEbyBub3Qgc2V0IHRoZSAnYmluZDoqJyB2YWx1ZXNcbiAgICAgICAgICAgIHByb3BzTWFwLnNldChrLCB7dHlwZSwgdmFsdWU6IF8uc3RhcnRzV2l0aCh2LnZhbHVlLCAnYmluZDonKSA/IHVuZGVmaW5lZCA6IHYudmFsdWV9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVnaXN0ZXJlZFByb3BzU2V0LmFkZCh0aGlzLndpZGdldFR5cGUpO1xuXG4gICAgICAgIHJldHVybiBwcm9wc01hcDtcbiAgICB9XG59XG4iXX0=
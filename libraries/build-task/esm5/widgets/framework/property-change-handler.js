import { $appDigest, $unwatch, isChangeFromWatch, isObject, resetChangeFromWatch, toBoolean, toDimension } from '@wm/core';
import { getWidgetPropsByType, PROP_TYPE } from './widget-props';
import { isStyle } from './styler';
import { getConditionalClasses, getWatchIdentifier } from '../../utils/widget-utils';
import { isBooleanAttr, isDimensionProp } from './constants';
/**
 * Returns the parsed value based on the provided type
 * if the type is PROP_TYPE.NUMBER returns a number/NaN
 * if the type is PROP_BOOLEAN returns true/false
 * else returns the same value without any type conversion
 *
 * @param {string} key
 * @param value
 * @param {PROP_TYPE} type
 * @returns {any}
 */
var parseValue = function (key, value, type) {
    if (type === PROP_TYPE.BOOLEAN) {
        return toBoolean(value, isBooleanAttr(key) && key);
    }
    if (type === PROP_TYPE.NUMBER) {
        return +value;
    }
    return value;
};
var ɵ0 = parseValue;
/**
 * Whenever a property on a component changes through a proxy this method will be triggered
 * If the new value is not from a watch, the existing watch on that particular property will be removed
 * This method invokes the defaultPropertyChange handler where the common widget properties like name, class are handled
 * Notifies the component about the style/property change
 */
export var globalPropertyChangeHandler = function (component, key, nv) {
    var widgetId = component.widgetId;
    var ov = component[key];
    // if the change is not from the bound watch, remove the existing watch
    if (!isChangeFromWatch()) {
        $unwatch(getWatchIdentifier(widgetId, key));
    }
    resetChangeFromWatch();
    var widgetProps = getWidgetPropsByType(component.getWidgetSubType());
    var propInfo = widgetProps.get(key);
    if (propInfo) {
        var type = propInfo.type;
        if (type) {
            nv = parseValue(key, nv, type);
        }
    }
    // Set the value in the component and trigger appDigest when there is a change in the value
    if (nv !== ov || isObject(nv) || isObject(ov)) {
        if (isDimensionProp(key)) {
            nv = toDimension(nv);
        }
        else if (_.startsWith(nv, 'resources/')) {
            var ref = component;
            if (ref._parentPrefab_ === undefined) {
                ref._parentPrefab_ = component.$element.closest('[prefabname][prefabname!="__self__"]').attr('prefabname') || '';
            }
            if (ref._parentPrefab_) {
                nv = "./app/prefabs/" + ref._parentPrefab_ + "/" + nv;
            }
        }
        component[key] = nv;
        if (isStyle(key)) {
            component.notifyStyleChange(key, nv, ov);
        }
        else {
            if (key === 'conditionalclass') {
                nv = getConditionalClasses(nv, ov);
            }
            if (propInfo) {
                component.notifyPropertyChange(key, nv, ov);
            }
        }
        $appDigest();
    }
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktY2hhbmdlLWhhbmRsZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvZnJhbWV3b3JrL3Byb3BlcnR5LWNoYW5nZS1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRzNILE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JGLE9BQU8sRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSTdEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxJQUFNLFVBQVUsR0FBRyxVQUFDLEdBQVcsRUFBRSxLQUFVLEVBQUUsSUFBZTtJQUN4RCxJQUFJLElBQUksS0FBSyxTQUFTLENBQUMsT0FBTyxFQUFFO1FBQzVCLE9BQU8sU0FBUyxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7S0FDdEQ7SUFFRCxJQUFJLElBQUksS0FBSyxTQUFTLENBQUMsTUFBTSxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUM7S0FDakI7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDLENBQUM7O0FBR0Y7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsSUFBTSwyQkFBMkIsR0FBRyxVQUFDLFNBQXdCLEVBQUUsR0FBVyxFQUFFLEVBQU87SUFDdEYsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztJQUNwQyxJQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFMUIsdUVBQXVFO0lBQ3ZFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1FBQ3RCLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUMvQztJQUVELG9CQUFvQixFQUFFLENBQUM7SUFFdkIsSUFBTSxXQUFXLEdBQUcsb0JBQW9CLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUN2RSxJQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RDLElBQUksUUFBUSxFQUFFO1FBQ1YsSUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztRQUMzQixJQUFJLElBQUksRUFBRTtZQUNOLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNsQztLQUNKO0lBRUQsMkZBQTJGO0lBQzNGLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBRTNDLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDeEI7YUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFlBQVksQ0FBQyxFQUFFO1lBQ3ZDLElBQU0sR0FBRyxHQUFRLFNBQVMsQ0FBQztZQUMzQixJQUFJLEdBQUcsQ0FBQyxjQUFjLEtBQUssU0FBUyxFQUFFO2dCQUNsQyxHQUFHLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNwSDtZQUNELElBQUksR0FBRyxDQUFDLGNBQWMsRUFBRTtnQkFDcEIsRUFBRSxHQUFHLG1CQUFpQixHQUFHLENBQUMsY0FBYyxTQUFJLEVBQUksQ0FBQzthQUNwRDtTQUNKO1FBRUQsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUVwQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNkLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzVDO2FBQU07WUFFSCxJQUFJLEdBQUcsS0FBSyxrQkFBa0IsRUFBRTtnQkFDNUIsRUFBRSxHQUFHLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUN0QztZQUVELElBQUksUUFBUSxFQUFFO2dCQUNWLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQy9DO1NBQ0o7UUFFRCxVQUFVLEVBQUUsQ0FBQztLQUNoQjtBQUNMLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ICRhcHBEaWdlc3QsICR1bndhdGNoLCBpc0NoYW5nZUZyb21XYXRjaCwgaXNPYmplY3QsIHJlc2V0Q2hhbmdlRnJvbVdhdGNoLCB0b0Jvb2xlYW4sIHRvRGltZW5zaW9uIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBCYXNlQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tbW9uL2Jhc2UvYmFzZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgZ2V0V2lkZ2V0UHJvcHNCeVR5cGUsIFBST1BfVFlQRSB9IGZyb20gJy4vd2lkZ2V0LXByb3BzJztcbmltcG9ydCB7IGlzU3R5bGUgfSBmcm9tICcuL3N0eWxlcic7XG5pbXBvcnQgeyBnZXRDb25kaXRpb25hbENsYXNzZXMsIGdldFdhdGNoSWRlbnRpZmllciB9IGZyb20gJy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBpc0Jvb2xlYW5BdHRyLCBpc0RpbWVuc2lvblByb3AgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBwYXJzZWQgdmFsdWUgYmFzZWQgb24gdGhlIHByb3ZpZGVkIHR5cGVcbiAqIGlmIHRoZSB0eXBlIGlzIFBST1BfVFlQRS5OVU1CRVIgcmV0dXJucyBhIG51bWJlci9OYU5cbiAqIGlmIHRoZSB0eXBlIGlzIFBST1BfQk9PTEVBTiByZXR1cm5zIHRydWUvZmFsc2VcbiAqIGVsc2UgcmV0dXJucyB0aGUgc2FtZSB2YWx1ZSB3aXRob3V0IGFueSB0eXBlIGNvbnZlcnNpb25cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0gdmFsdWVcbiAqIEBwYXJhbSB7UFJPUF9UWVBFfSB0eXBlXG4gKiBAcmV0dXJucyB7YW55fVxuICovXG5jb25zdCBwYXJzZVZhbHVlID0gKGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCB0eXBlOiBQUk9QX1RZUEUpOiBhbnkgPT4ge1xuICAgIGlmICh0eXBlID09PSBQUk9QX1RZUEUuQk9PTEVBTikge1xuICAgICAgICByZXR1cm4gdG9Cb29sZWFuKHZhbHVlLCBpc0Jvb2xlYW5BdHRyKGtleSkgJiYga2V5KTtcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PT0gUFJPUF9UWVBFLk5VTUJFUikge1xuICAgICAgICByZXR1cm4gK3ZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZTtcbn07XG5cblxuLyoqXG4gKiBXaGVuZXZlciBhIHByb3BlcnR5IG9uIGEgY29tcG9uZW50IGNoYW5nZXMgdGhyb3VnaCBhIHByb3h5IHRoaXMgbWV0aG9kIHdpbGwgYmUgdHJpZ2dlcmVkXG4gKiBJZiB0aGUgbmV3IHZhbHVlIGlzIG5vdCBmcm9tIGEgd2F0Y2gsIHRoZSBleGlzdGluZyB3YXRjaCBvbiB0aGF0IHBhcnRpY3VsYXIgcHJvcGVydHkgd2lsbCBiZSByZW1vdmVkXG4gKiBUaGlzIG1ldGhvZCBpbnZva2VzIHRoZSBkZWZhdWx0UHJvcGVydHlDaGFuZ2UgaGFuZGxlciB3aGVyZSB0aGUgY29tbW9uIHdpZGdldCBwcm9wZXJ0aWVzIGxpa2UgbmFtZSwgY2xhc3MgYXJlIGhhbmRsZWRcbiAqIE5vdGlmaWVzIHRoZSBjb21wb25lbnQgYWJvdXQgdGhlIHN0eWxlL3Byb3BlcnR5IGNoYW5nZVxuICovXG5leHBvcnQgY29uc3QgZ2xvYmFsUHJvcGVydHlDaGFuZ2VIYW5kbGVyID0gKGNvbXBvbmVudDogQmFzZUNvbXBvbmVudCwga2V5OiBzdHJpbmcsIG52OiBhbnkpID0+IHtcbiAgICBjb25zdCB3aWRnZXRJZCA9IGNvbXBvbmVudC53aWRnZXRJZDtcbiAgICBjb25zdCBvdiA9IGNvbXBvbmVudFtrZXldO1xuXG4gICAgLy8gaWYgdGhlIGNoYW5nZSBpcyBub3QgZnJvbSB0aGUgYm91bmQgd2F0Y2gsIHJlbW92ZSB0aGUgZXhpc3Rpbmcgd2F0Y2hcbiAgICBpZiAoIWlzQ2hhbmdlRnJvbVdhdGNoKCkpIHtcbiAgICAgICAgJHVud2F0Y2goZ2V0V2F0Y2hJZGVudGlmaWVyKHdpZGdldElkLCBrZXkpKTtcbiAgICB9XG5cbiAgICByZXNldENoYW5nZUZyb21XYXRjaCgpO1xuXG4gICAgY29uc3Qgd2lkZ2V0UHJvcHMgPSBnZXRXaWRnZXRQcm9wc0J5VHlwZShjb21wb25lbnQuZ2V0V2lkZ2V0U3ViVHlwZSgpKTtcbiAgICBjb25zdCBwcm9wSW5mbyA9IHdpZGdldFByb3BzLmdldChrZXkpO1xuICAgIGlmIChwcm9wSW5mbykge1xuICAgICAgICBjb25zdCB0eXBlID0gcHJvcEluZm8udHlwZTtcbiAgICAgICAgaWYgKHR5cGUpIHtcbiAgICAgICAgICAgIG52ID0gcGFyc2VWYWx1ZShrZXksIG52LCB0eXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCB0aGUgdmFsdWUgaW4gdGhlIGNvbXBvbmVudCBhbmQgdHJpZ2dlciBhcHBEaWdlc3Qgd2hlbiB0aGVyZSBpcyBhIGNoYW5nZSBpbiB0aGUgdmFsdWVcbiAgICBpZiAobnYgIT09IG92IHx8IGlzT2JqZWN0KG52KSB8fCBpc09iamVjdChvdikpIHtcblxuICAgICAgICBpZiAoaXNEaW1lbnNpb25Qcm9wKGtleSkpIHtcbiAgICAgICAgICAgIG52ID0gdG9EaW1lbnNpb24obnYpO1xuICAgICAgICB9IGVsc2UgaWYgKF8uc3RhcnRzV2l0aChudiwgJ3Jlc291cmNlcy8nKSkge1xuICAgICAgICAgICAgY29uc3QgcmVmOiBhbnkgPSBjb21wb25lbnQ7XG4gICAgICAgICAgICBpZiAocmVmLl9wYXJlbnRQcmVmYWJfID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZWYuX3BhcmVudFByZWZhYl8gPSBjb21wb25lbnQuJGVsZW1lbnQuY2xvc2VzdCgnW3ByZWZhYm5hbWVdW3ByZWZhYm5hbWUhPVwiX19zZWxmX19cIl0nKS5hdHRyKCdwcmVmYWJuYW1lJykgfHwgJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVmLl9wYXJlbnRQcmVmYWJfKSB7XG4gICAgICAgICAgICAgICAgbnYgPSBgLi9hcHAvcHJlZmFicy8ke3JlZi5fcGFyZW50UHJlZmFiX30vJHtudn1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29tcG9uZW50W2tleV0gPSBudjtcblxuICAgICAgICBpZiAoaXNTdHlsZShrZXkpKSB7XG4gICAgICAgICAgICBjb21wb25lbnQubm90aWZ5U3R5bGVDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnY29uZGl0aW9uYWxjbGFzcycpIHtcbiAgICAgICAgICAgICAgICBudiA9IGdldENvbmRpdGlvbmFsQ2xhc3Nlcyhudiwgb3YpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocHJvcEluZm8pIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQubm90aWZ5UHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgIH1cbn07XG4iXX0=
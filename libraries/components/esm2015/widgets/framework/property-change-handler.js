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
const parseValue = (key, value, type) => {
    if (type === PROP_TYPE.BOOLEAN) {
        return toBoolean(value, isBooleanAttr(key) && key);
    }
    if (type === PROP_TYPE.NUMBER) {
        return +value;
    }
    return value;
};
const ɵ0 = parseValue;
/**
 * Whenever a property on a component changes through a proxy this method will be triggered
 * If the new value is not from a watch, the existing watch on that particular property will be removed
 * This method invokes the defaultPropertyChange handler where the common widget properties like name, class are handled
 * Notifies the component about the style/property change
 */
export const globalPropertyChangeHandler = (component, key, nv) => {
    const widgetId = component.widgetId;
    const ov = component[key];
    // if the change is not from the bound watch, remove the existing watch
    if (!isChangeFromWatch()) {
        $unwatch(getWatchIdentifier(widgetId, key));
    }
    resetChangeFromWatch();
    const widgetProps = getWidgetPropsByType(component.getWidgetSubType());
    const propInfo = widgetProps.get(key);
    if (propInfo) {
        const type = propInfo.type;
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
            const ref = component;
            if (ref._parentPrefab_ === undefined) {
                ref._parentPrefab_ = component.$element.closest('[prefabname][prefabname!="__self__"]').attr('prefabname') || '';
            }
            if (ref._parentPrefab_) {
                nv = `./app/prefabs/${ref._parentPrefab_}/${nv}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktY2hhbmdlLWhhbmRsZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvZnJhbWV3b3JrL3Byb3BlcnR5LWNoYW5nZS1oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRzNILE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JGLE9BQU8sRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSTdEOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQVcsRUFBRSxLQUFVLEVBQUUsSUFBZSxFQUFPLEVBQUU7SUFDakUsSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLE9BQU8sRUFBRTtRQUM1QixPQUFPLFNBQVMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0tBQ3REO0lBRUQsSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLE1BQU0sRUFBRTtRQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDO0tBQ2pCO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQyxDQUFDOztBQUdGOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxTQUF3QixFQUFFLEdBQVcsRUFBRSxFQUFPLEVBQUUsRUFBRTtJQUMxRixNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO0lBQ3BDLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUUxQix1RUFBdUU7SUFDdkUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUU7UUFDdEIsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQy9DO0lBRUQsb0JBQW9CLEVBQUUsQ0FBQztJQUV2QixNQUFNLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEMsSUFBSSxRQUFRLEVBQUU7UUFDVixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQzNCLElBQUksSUFBSSxFQUFFO1lBQ04sRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2xDO0tBQ0o7SUFFRCwyRkFBMkY7SUFDM0YsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFFM0MsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDdEIsRUFBRSxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN4QjthQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsWUFBWSxDQUFDLEVBQUU7WUFDdkMsTUFBTSxHQUFHLEdBQVEsU0FBUyxDQUFDO1lBQzNCLElBQUksR0FBRyxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7Z0JBQ2xDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3BIO1lBQ0QsSUFBSSxHQUFHLENBQUMsY0FBYyxFQUFFO2dCQUNwQixFQUFFLEdBQUcsaUJBQWlCLEdBQUcsQ0FBQyxjQUFjLElBQUksRUFBRSxFQUFFLENBQUM7YUFDcEQ7U0FDSjtRQUVELFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFcEIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDZCxTQUFTLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUM1QzthQUFNO1lBRUgsSUFBSSxHQUFHLEtBQUssa0JBQWtCLEVBQUU7Z0JBQzVCLEVBQUUsR0FBRyxxQkFBcUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDdEM7WUFFRCxJQUFJLFFBQVEsRUFBRTtnQkFDVixTQUFTLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUMvQztTQUNKO1FBRUQsVUFBVSxFQUFFLENBQUM7S0FDaEI7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyAkYXBwRGlnZXN0LCAkdW53YXRjaCwgaXNDaGFuZ2VGcm9tV2F0Y2gsIGlzT2JqZWN0LCByZXNldENoYW5nZUZyb21XYXRjaCwgdG9Cb29sZWFuLCB0b0RpbWVuc2lvbiB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQmFzZUNvbXBvbmVudCB9IGZyb20gJy4uL2NvbW1vbi9iYXNlL2Jhc2UuY29tcG9uZW50JztcbmltcG9ydCB7IGdldFdpZGdldFByb3BzQnlUeXBlLCBQUk9QX1RZUEUgfSBmcm9tICcuL3dpZGdldC1wcm9wcyc7XG5pbXBvcnQgeyBpc1N0eWxlIH0gZnJvbSAnLi9zdHlsZXInO1xuaW1wb3J0IHsgZ2V0Q29uZGl0aW9uYWxDbGFzc2VzLCBnZXRXYXRjaElkZW50aWZpZXIgfSBmcm9tICcuLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgaXNCb29sZWFuQXR0ciwgaXNEaW1lbnNpb25Qcm9wIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcGFyc2VkIHZhbHVlIGJhc2VkIG9uIHRoZSBwcm92aWRlZCB0eXBlXG4gKiBpZiB0aGUgdHlwZSBpcyBQUk9QX1RZUEUuTlVNQkVSIHJldHVybnMgYSBudW1iZXIvTmFOXG4gKiBpZiB0aGUgdHlwZSBpcyBQUk9QX0JPT0xFQU4gcmV0dXJucyB0cnVlL2ZhbHNlXG4gKiBlbHNlIHJldHVybnMgdGhlIHNhbWUgdmFsdWUgd2l0aG91dCBhbnkgdHlwZSBjb252ZXJzaW9uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHBhcmFtIHZhbHVlXG4gKiBAcGFyYW0ge1BST1BfVFlQRX0gdHlwZVxuICogQHJldHVybnMge2FueX1cbiAqL1xuY29uc3QgcGFyc2VWYWx1ZSA9IChrZXk6IHN0cmluZywgdmFsdWU6IGFueSwgdHlwZTogUFJPUF9UWVBFKTogYW55ID0+IHtcbiAgICBpZiAodHlwZSA9PT0gUFJPUF9UWVBFLkJPT0xFQU4pIHtcbiAgICAgICAgcmV0dXJuIHRvQm9vbGVhbih2YWx1ZSwgaXNCb29sZWFuQXR0cihrZXkpICYmIGtleSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGUgPT09IFBST1BfVFlQRS5OVU1CRVIpIHtcbiAgICAgICAgcmV0dXJuICt2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG59O1xuXG5cbi8qKlxuICogV2hlbmV2ZXIgYSBwcm9wZXJ0eSBvbiBhIGNvbXBvbmVudCBjaGFuZ2VzIHRocm91Z2ggYSBwcm94eSB0aGlzIG1ldGhvZCB3aWxsIGJlIHRyaWdnZXJlZFxuICogSWYgdGhlIG5ldyB2YWx1ZSBpcyBub3QgZnJvbSBhIHdhdGNoLCB0aGUgZXhpc3Rpbmcgd2F0Y2ggb24gdGhhdCBwYXJ0aWN1bGFyIHByb3BlcnR5IHdpbGwgYmUgcmVtb3ZlZFxuICogVGhpcyBtZXRob2QgaW52b2tlcyB0aGUgZGVmYXVsdFByb3BlcnR5Q2hhbmdlIGhhbmRsZXIgd2hlcmUgdGhlIGNvbW1vbiB3aWRnZXQgcHJvcGVydGllcyBsaWtlIG5hbWUsIGNsYXNzIGFyZSBoYW5kbGVkXG4gKiBOb3RpZmllcyB0aGUgY29tcG9uZW50IGFib3V0IHRoZSBzdHlsZS9wcm9wZXJ0eSBjaGFuZ2VcbiAqL1xuZXhwb3J0IGNvbnN0IGdsb2JhbFByb3BlcnR5Q2hhbmdlSGFuZGxlciA9IChjb21wb25lbnQ6IEJhc2VDb21wb25lbnQsIGtleTogc3RyaW5nLCBudjogYW55KSA9PiB7XG4gICAgY29uc3Qgd2lkZ2V0SWQgPSBjb21wb25lbnQud2lkZ2V0SWQ7XG4gICAgY29uc3Qgb3YgPSBjb21wb25lbnRba2V5XTtcblxuICAgIC8vIGlmIHRoZSBjaGFuZ2UgaXMgbm90IGZyb20gdGhlIGJvdW5kIHdhdGNoLCByZW1vdmUgdGhlIGV4aXN0aW5nIHdhdGNoXG4gICAgaWYgKCFpc0NoYW5nZUZyb21XYXRjaCgpKSB7XG4gICAgICAgICR1bndhdGNoKGdldFdhdGNoSWRlbnRpZmllcih3aWRnZXRJZCwga2V5KSk7XG4gICAgfVxuXG4gICAgcmVzZXRDaGFuZ2VGcm9tV2F0Y2goKTtcblxuICAgIGNvbnN0IHdpZGdldFByb3BzID0gZ2V0V2lkZ2V0UHJvcHNCeVR5cGUoY29tcG9uZW50LmdldFdpZGdldFN1YlR5cGUoKSk7XG4gICAgY29uc3QgcHJvcEluZm8gPSB3aWRnZXRQcm9wcy5nZXQoa2V5KTtcbiAgICBpZiAocHJvcEluZm8pIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IHByb3BJbmZvLnR5cGU7XG4gICAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgICAgICBudiA9IHBhcnNlVmFsdWUoa2V5LCBudiwgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIHZhbHVlIGluIHRoZSBjb21wb25lbnQgYW5kIHRyaWdnZXIgYXBwRGlnZXN0IHdoZW4gdGhlcmUgaXMgYSBjaGFuZ2UgaW4gdGhlIHZhbHVlXG4gICAgaWYgKG52ICE9PSBvdiB8fCBpc09iamVjdChudikgfHwgaXNPYmplY3Qob3YpKSB7XG5cbiAgICAgICAgaWYgKGlzRGltZW5zaW9uUHJvcChrZXkpKSB7XG4gICAgICAgICAgICBudiA9IHRvRGltZW5zaW9uKG52KTtcbiAgICAgICAgfSBlbHNlIGlmIChfLnN0YXJ0c1dpdGgobnYsICdyZXNvdXJjZXMvJykpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZjogYW55ID0gY29tcG9uZW50O1xuICAgICAgICAgICAgaWYgKHJlZi5fcGFyZW50UHJlZmFiXyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVmLl9wYXJlbnRQcmVmYWJfID0gY29tcG9uZW50LiRlbGVtZW50LmNsb3Nlc3QoJ1twcmVmYWJuYW1lXVtwcmVmYWJuYW1lIT1cIl9fc2VsZl9fXCJdJykuYXR0cigncHJlZmFibmFtZScpIHx8ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlZi5fcGFyZW50UHJlZmFiXykge1xuICAgICAgICAgICAgICAgIG52ID0gYC4vYXBwL3ByZWZhYnMvJHtyZWYuX3BhcmVudFByZWZhYl99LyR7bnZ9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbXBvbmVudFtrZXldID0gbnY7XG5cbiAgICAgICAgaWYgKGlzU3R5bGUoa2V5KSkge1xuICAgICAgICAgICAgY29tcG9uZW50Lm5vdGlmeVN0eWxlQ2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2NvbmRpdGlvbmFsY2xhc3MnKSB7XG4gICAgICAgICAgICAgICAgbnYgPSBnZXRDb25kaXRpb25hbENsYXNzZXMobnYsIG92KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHByb3BJbmZvKSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50Lm5vdGlmeVByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG59O1xuIl19
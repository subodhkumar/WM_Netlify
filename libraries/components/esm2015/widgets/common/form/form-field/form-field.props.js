import { FormWidgetType } from '@wm/core';
import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../framework/widget-props';
import { searchProps } from '../../search/search.props';
import { checkboxProps } from '../../checkbox/checkbox.props';
import { colorPickerProps } from '../../color-picker/color-picker.props';
import { currencyProps } from '../../currency/currency.props';
import { checkboxsetProps } from '../../checkboxset/checkboxset.props';
import { chipsProps } from '../../chips/chips.props';
import { dateProps } from '../../date/date.props';
import { dateTimeProps } from '../../date-time/date-time.props';
import { numberProps } from '../../number/number.props';
import { inputNumberTypeProps } from '../../text/number/input-number.props';
import { inputTextTypeProps } from '../../text/text/input-text.props';
import { inputCalendarTypeProps } from '../../text/calendar/input-calendar.props';
import { inputColorTypeProps } from '../../text/color/input-color.props';
import { inputEmailTypeProps } from '../../text/email/input-email.props';
import { radiosetProps } from '../../radioset/radioset.props';
import { ratingProps } from '../../rating/rating.props';
import { richTextProps } from '../../rich-text-editor/rich-text-editor.props';
import { selectProps } from '../../select/select.props';
import { sliderProps } from '../../slider/slider.props';
import { switchProps } from '../../switch/switch.props';
import { textareaProps } from '../../textarea/textarea.props';
import { timeProps } from '../../time/time.props';
export const registerProps = () => {
    const uploadProps = new Map([
        ['disabled', PROP_BOOLEAN],
        ['extensions', PROP_STRING],
        ['filetype', PROP_STRING],
        ['multiple', PROP_BOOLEAN],
        ['readonly', PROP_BOOLEAN],
        ['required', PROP_BOOLEAN]
    ]);
    const textProps = new Map(inputTextTypeProps);
    const mergeTextProps = (typeProps) => {
        typeProps.forEach((v, k) => textProps.set(k, v));
    };
    mergeTextProps(inputCalendarTypeProps);
    mergeTextProps(inputColorTypeProps);
    mergeTextProps(inputEmailTypeProps);
    mergeTextProps(inputNumberTypeProps);
    const widgetPropsMap = new Map([
        [FormWidgetType.AUTOCOMPLETE, searchProps],
        [FormWidgetType.CHECKBOX, checkboxProps],
        [FormWidgetType.CHECKBOXSET, checkboxsetProps],
        [FormWidgetType.CHIPS, chipsProps],
        [FormWidgetType.COLORPICKER, colorPickerProps],
        [FormWidgetType.CURRENCY, currencyProps],
        [FormWidgetType.DATE, dateProps],
        [FormWidgetType.DATETIME, dateTimeProps],
        [FormWidgetType.NUMBER, numberProps],
        [FormWidgetType.PASSWORD, inputTextTypeProps],
        [FormWidgetType.RADIOSET, radiosetProps],
        [FormWidgetType.RATING, ratingProps],
        [FormWidgetType.RICHTEXT, richTextProps],
        [FormWidgetType.SELECT, selectProps],
        [FormWidgetType.SLIDER, sliderProps],
        [FormWidgetType.SWITCH, switchProps],
        [FormWidgetType.TEXT, textProps],
        [FormWidgetType.TEXTAREA, textareaProps],
        [FormWidgetType.TIME, timeProps],
        [FormWidgetType.TIMESTAMP, dateTimeProps],
        [FormWidgetType.TOGGLE, checkboxProps],
        [FormWidgetType.TYPEAHEAD, searchProps],
        [FormWidgetType.UPLOAD, uploadProps]
    ]);
    const formFieldMap = new Map([
        ['debouncetime', Object.assign({ value: 250 }, PROP_NUMBER)],
        ['defaultvalue', PROP_STRING],
        ['displayname', PROP_STRING],
        ['display-name', PROP_STRING],
        ['field', PROP_STRING],
        ['filterexpressions', PROP_STRING],
        ['filter-on', PROP_STRING],
        ['generator', PROP_STRING],
        ['hint', PROP_STRING],
        ['inputtype', PROP_STRING],
        ['is-primary-key', PROP_BOOLEAN],
        ['is-range', PROP_BOOLEAN],
        ['is-related', PROP_BOOLEAN],
        ['isformfield', { value: true }],
        ['key', PROP_STRING],
        ['limit', PROP_NUMBER],
        ['lookup-type', PROP_STRING],
        ['lookup-field', PROP_STRING],
        ['name', PROP_STRING],
        ['matchmode', PROP_STRING],
        ['maxdefaultvalue', PROP_STRING],
        ['maxplaceholder', PROP_STRING],
        ['mobile-display', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['period', PROP_BOOLEAN],
        ['pc-display', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['placeholder', PROP_STRING],
        ['primary-key', PROP_BOOLEAN],
        ['related-entity-name', PROP_STRING],
        ['required', PROP_BOOLEAN],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['type', PROP_STRING],
        ['validationmessage', PROP_STRING],
        ['viewmodewidget', PROP_STRING],
        ['widgettype', PROP_STRING]
    ]);
    widgetPropsMap.forEach((val, key) => {
        const propsMap = new Map(formFieldMap);
        const widgetProps = widgetPropsMap.get(key);
        widgetProps.forEach((v, k) => propsMap.set(k, v));
        register('wm-form-field-' + key, propsMap);
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS1maWVsZC5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZm9ybS9mb3JtLWZpZWxkL2Zvcm0tZmllbGQucHJvcHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUxQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDbkcsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUM5RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUN6RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdkUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDaEUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3pF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IH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBQUk9QX0JPT0xFQU4sIFBST1BfTlVNQkVSLCBQUk9QX1NUUklORywgcmVnaXN0ZXIgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcbmltcG9ydCB7IHNlYXJjaFByb3BzIH0gZnJvbSAnLi4vLi4vc2VhcmNoL3NlYXJjaC5wcm9wcyc7XG5pbXBvcnQgeyBjaGVja2JveFByb3BzIH0gZnJvbSAnLi4vLi4vY2hlY2tib3gvY2hlY2tib3gucHJvcHMnO1xuaW1wb3J0IHsgY29sb3JQaWNrZXJQcm9wcyB9IGZyb20gJy4uLy4uL2NvbG9yLXBpY2tlci9jb2xvci1waWNrZXIucHJvcHMnO1xuaW1wb3J0IHsgY3VycmVuY3lQcm9wcyB9IGZyb20gJy4uLy4uL2N1cnJlbmN5L2N1cnJlbmN5LnByb3BzJztcbmltcG9ydCB7IGNoZWNrYm94c2V0UHJvcHMgfSBmcm9tICcuLi8uLi9jaGVja2JveHNldC9jaGVja2JveHNldC5wcm9wcyc7XG5pbXBvcnQgeyBjaGlwc1Byb3BzIH0gZnJvbSAnLi4vLi4vY2hpcHMvY2hpcHMucHJvcHMnO1xuaW1wb3J0IHsgZGF0ZVByb3BzIH0gZnJvbSAnLi4vLi4vZGF0ZS9kYXRlLnByb3BzJztcbmltcG9ydCB7IGRhdGVUaW1lUHJvcHMgfSBmcm9tICcuLi8uLi9kYXRlLXRpbWUvZGF0ZS10aW1lLnByb3BzJztcbmltcG9ydCB7IG51bWJlclByb3BzIH0gZnJvbSAnLi4vLi4vbnVtYmVyL251bWJlci5wcm9wcyc7XG5pbXBvcnQgeyBpbnB1dE51bWJlclR5cGVQcm9wcyB9IGZyb20gJy4uLy4uL3RleHQvbnVtYmVyL2lucHV0LW51bWJlci5wcm9wcyc7XG5pbXBvcnQgeyBpbnB1dFRleHRUeXBlUHJvcHMgfSBmcm9tICcuLi8uLi90ZXh0L3RleHQvaW5wdXQtdGV4dC5wcm9wcyc7XG5pbXBvcnQgeyBpbnB1dENhbGVuZGFyVHlwZVByb3BzIH0gZnJvbSAnLi4vLi4vdGV4dC9jYWxlbmRhci9pbnB1dC1jYWxlbmRhci5wcm9wcyc7XG5pbXBvcnQgeyBpbnB1dENvbG9yVHlwZVByb3BzIH0gZnJvbSAnLi4vLi4vdGV4dC9jb2xvci9pbnB1dC1jb2xvci5wcm9wcyc7XG5pbXBvcnQgeyBpbnB1dEVtYWlsVHlwZVByb3BzIH0gZnJvbSAnLi4vLi4vdGV4dC9lbWFpbC9pbnB1dC1lbWFpbC5wcm9wcyc7XG5pbXBvcnQgeyByYWRpb3NldFByb3BzIH0gZnJvbSAnLi4vLi4vcmFkaW9zZXQvcmFkaW9zZXQucHJvcHMnO1xuaW1wb3J0IHsgcmF0aW5nUHJvcHMgfSBmcm9tICcuLi8uLi9yYXRpbmcvcmF0aW5nLnByb3BzJztcbmltcG9ydCB7IHJpY2hUZXh0UHJvcHMgfSBmcm9tICcuLi8uLi9yaWNoLXRleHQtZWRpdG9yL3JpY2gtdGV4dC1lZGl0b3IucHJvcHMnO1xuaW1wb3J0IHsgc2VsZWN0UHJvcHMgfSBmcm9tICcuLi8uLi9zZWxlY3Qvc2VsZWN0LnByb3BzJztcbmltcG9ydCB7IHNsaWRlclByb3BzIH0gZnJvbSAnLi4vLi4vc2xpZGVyL3NsaWRlci5wcm9wcyc7XG5pbXBvcnQgeyBzd2l0Y2hQcm9wcyB9IGZyb20gJy4uLy4uL3N3aXRjaC9zd2l0Y2gucHJvcHMnO1xuaW1wb3J0IHsgdGV4dGFyZWFQcm9wcyB9IGZyb20gJy4uLy4uL3RleHRhcmVhL3RleHRhcmVhLnByb3BzJztcbmltcG9ydCB7IHRpbWVQcm9wcyB9IGZyb20gJy4uLy4uL3RpbWUvdGltZS5wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIGNvbnN0IHVwbG9hZFByb3BzID0gbmV3IE1hcChbXG4gICAgICAgIFsnZGlzYWJsZWQnLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICBbJ2V4dGVuc2lvbnMnLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnZmlsZXR5cGUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnbXVsdGlwbGUnLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICBbJ3JlYWRvbmx5JywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgWydyZXF1aXJlZCcsIFBST1BfQk9PTEVBTl1cbiAgICBdKTtcblxuICAgIGNvbnN0IHRleHRQcm9wcyA9IG5ldyBNYXAoaW5wdXRUZXh0VHlwZVByb3BzKTtcblxuICAgIGNvbnN0IG1lcmdlVGV4dFByb3BzID0gKHR5cGVQcm9wcykgPT4ge1xuICAgICAgICB0eXBlUHJvcHMuZm9yRWFjaCgodjogYW55LCBrKSA9PiB0ZXh0UHJvcHMuc2V0KGssIHYpKTtcbiAgICB9O1xuICAgIG1lcmdlVGV4dFByb3BzKGlucHV0Q2FsZW5kYXJUeXBlUHJvcHMpO1xuICAgIG1lcmdlVGV4dFByb3BzKGlucHV0Q29sb3JUeXBlUHJvcHMpO1xuICAgIG1lcmdlVGV4dFByb3BzKGlucHV0RW1haWxUeXBlUHJvcHMpO1xuICAgIG1lcmdlVGV4dFByb3BzKGlucHV0TnVtYmVyVHlwZVByb3BzKTtcblxuICAgIGNvbnN0IHdpZGdldFByb3BzTWFwID0gbmV3IE1hcChcbiAgICAgICAgW1xuICAgICAgICAgICAgW0Zvcm1XaWRnZXRUeXBlLkFVVE9DT01QTEVURSwgc2VhcmNoUHJvcHNdLFxuICAgICAgICAgICAgW0Zvcm1XaWRnZXRUeXBlLkNIRUNLQk9YLCBjaGVja2JveFByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5DSEVDS0JPWFNFVCwgY2hlY2tib3hzZXRQcm9wc10sXG4gICAgICAgICAgICBbRm9ybVdpZGdldFR5cGUuQ0hJUFMsIGNoaXBzUHJvcHNdLFxuICAgICAgICAgICAgW0Zvcm1XaWRnZXRUeXBlLkNPTE9SUElDS0VSLCBjb2xvclBpY2tlclByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5DVVJSRU5DWSwgY3VycmVuY3lQcm9wc10sXG4gICAgICAgICAgICBbRm9ybVdpZGdldFR5cGUuREFURSwgZGF0ZVByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5EQVRFVElNRSwgZGF0ZVRpbWVQcm9wc10sXG4gICAgICAgICAgICBbRm9ybVdpZGdldFR5cGUuTlVNQkVSLCBudW1iZXJQcm9wc10sXG4gICAgICAgICAgICBbRm9ybVdpZGdldFR5cGUuUEFTU1dPUkQsIGlucHV0VGV4dFR5cGVQcm9wc10sXG4gICAgICAgICAgICBbRm9ybVdpZGdldFR5cGUuUkFESU9TRVQsIHJhZGlvc2V0UHJvcHNdLFxuICAgICAgICAgICAgW0Zvcm1XaWRnZXRUeXBlLlJBVElORywgcmF0aW5nUHJvcHNdLFxuICAgICAgICAgICAgW0Zvcm1XaWRnZXRUeXBlLlJJQ0hURVhULCByaWNoVGV4dFByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5TRUxFQ1QsIHNlbGVjdFByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5TTElERVIsIHNsaWRlclByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5TV0lUQ0gsIHN3aXRjaFByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5URVhULCB0ZXh0UHJvcHNdLFxuICAgICAgICAgICAgW0Zvcm1XaWRnZXRUeXBlLlRFWFRBUkVBLCB0ZXh0YXJlYVByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5USU1FLCB0aW1lUHJvcHNdLFxuICAgICAgICAgICAgW0Zvcm1XaWRnZXRUeXBlLlRJTUVTVEFNUCwgZGF0ZVRpbWVQcm9wc10sXG4gICAgICAgICAgICBbRm9ybVdpZGdldFR5cGUuVE9HR0xFLCBjaGVja2JveFByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5UWVBFQUhFQUQsIHNlYXJjaFByb3BzXSxcbiAgICAgICAgICAgIFtGb3JtV2lkZ2V0VHlwZS5VUExPQUQsIHVwbG9hZFByb3BzXVxuICAgICAgICBdXG4gICAgKTtcbiAgICBjb25zdCBmb3JtRmllbGRNYXAgPSBuZXcgTWFwKFxuICAgICAgICBbXG4gICAgICAgICAgICBbJ2RlYm91bmNldGltZScsIHt2YWx1ZTogMjUwLCAuLi5QUk9QX05VTUJFUn1dLFxuICAgICAgICAgICAgWydkZWZhdWx0dmFsdWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBbJ2Rpc3BsYXluYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgWydkaXNwbGF5LW5hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBbJ2ZpZWxkJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgWydmaWx0ZXJleHByZXNzaW9ucycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgIFsnZmlsdGVyLW9uJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgWydnZW5lcmF0b3InLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBbJ2hpbnQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBbJ2lucHV0dHlwZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgIFsnaXMtcHJpbWFyeS1rZXknLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICAgICAgWydpcy1yYW5nZScsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgICAgICBbJ2lzLXJlbGF0ZWQnLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICAgICAgWydpc2Zvcm1maWVsZCcsIHt2YWx1ZTogdHJ1ZX1dLFxuICAgICAgICAgICAgWydrZXknLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBbJ2xpbWl0JywgUFJPUF9OVU1CRVJdLFxuICAgICAgICAgICAgWydsb29rdXAtdHlwZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgIFsnbG9va3VwLWZpZWxkJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgWydtYXRjaG1vZGUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBbJ21heGRlZmF1bHR2YWx1ZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgIFsnbWF4cGxhY2Vob2xkZXInLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBbJ21vYmlsZS1kaXNwbGF5Jywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgICAgIFsncGVyaW9kJywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgICAgIFsncGMtZGlzcGxheScsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICBbJ3BsYWNlaG9sZGVyJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgWydwcmltYXJ5LWtleScsIFBST1BfQk9PTEVBTl0sXG4gICAgICAgICAgICBbJ3JlbGF0ZWQtZW50aXR5LW5hbWUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBbJ3JlcXVpcmVkJywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgICAgIFsnc2hvdycsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICBbJ3R5cGUnLCBQUk9QX1NUUklOR10sXG4gICAgICAgICAgICBbJ3ZhbGlkYXRpb25tZXNzYWdlJywgUFJPUF9TVFJJTkddLFxuICAgICAgICAgICAgWyd2aWV3bW9kZXdpZGdldCcsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgIFsnd2lkZ2V0dHlwZScsIFBST1BfU1RSSU5HXVxuICAgICAgICBdXG4gICAgKTtcbiAgICB3aWRnZXRQcm9wc01hcC5mb3JFYWNoKCh2YWwsIGtleSkgPT4ge1xuICAgICAgICBjb25zdCBwcm9wc01hcCA9IG5ldyBNYXAoZm9ybUZpZWxkTWFwKTtcbiAgICAgICAgY29uc3Qgd2lkZ2V0UHJvcHMgPSB3aWRnZXRQcm9wc01hcC5nZXQoa2V5KTtcbiAgICAgICAgd2lkZ2V0UHJvcHMuZm9yRWFjaCgodjogYW55LCBrKSA9PiBwcm9wc01hcC5zZXQoaywgdikpO1xuICAgICAgICByZWdpc3RlcihcbiAgICAgICAgICAgICd3bS1mb3JtLWZpZWxkLScgKyBrZXksXG4gICAgICAgICAgICBwcm9wc01hcFxuICAgICAgICApO1xuICAgIH0pO1xufTtcbiJdfQ==
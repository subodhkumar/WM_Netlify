import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export const radiosetProps = new Map([
    ['class', PROP_STRING],
    ['compareby', PROP_STRING],
    ['datafield', PROP_STRING],
    ['dataset', Object.assign({ value: 'Option 1, Option 2, Option 3' }, PROP_ANY)],
    ['datavaluesource', PROP_ANY],
    ['datavalue', PROP_STRING],
    ['disabled', PROP_BOOLEAN],
    ['displayexpression', PROP_STRING],
    ['displayfield', PROP_STRING],
    ['displayValue', PROP_STRING],
    ['itemclass', Object.assign({ value: '' }, PROP_STRING)],
    ['layout', Object.assign({ value: 'stacked' }, PROP_STRING)],
    ['listclass', Object.assign({ value: '' }, PROP_STRING)],
    ['name', PROP_STRING],
    ['orderby', PROP_STRING],
    ['readonly', PROP_BOOLEAN],
    ['required', PROP_BOOLEAN],
    ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
    ['showindevice', Object.assign({ displayType: 'inline-block', value: 'all' }, PROP_STRING)],
    ['tabindex', Object.assign({ value: 0 }, PROP_NUMBER)],
    ['usekeys', PROP_BOOLEAN]
]);
export const registerProps = () => {
    register('wm-radioset', radiosetProps);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW9zZXQucHJvcHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3JhZGlvc2V0L3JhZGlvc2V0LnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFMUcsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxDQUNoQztJQUNJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztJQUN0QixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUM7SUFDMUIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDO0lBQzFCLENBQUMsU0FBUyxrQkFBRyxLQUFLLEVBQUUsOEJBQThCLElBQUssUUFBUSxFQUFFO0lBQ2pFLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDO0lBQzdCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQztJQUMxQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUM7SUFDMUIsQ0FBQyxtQkFBbUIsRUFBRSxXQUFXLENBQUM7SUFDbEMsQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDO0lBQzdCLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQztJQUM3QixDQUFDLFdBQVcsa0JBQUcsS0FBSyxFQUFFLEVBQUUsSUFBSyxXQUFXLEVBQUU7SUFDMUMsQ0FBQyxRQUFRLGtCQUFHLEtBQUssRUFBRSxTQUFTLElBQUssV0FBVyxFQUFFO0lBQzlDLENBQUMsV0FBVyxrQkFBRyxLQUFLLEVBQUUsRUFBRSxJQUFLLFdBQVcsRUFBRTtJQUMxQyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUM7SUFDckIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDO0lBQ3hCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztJQUMxQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUM7SUFDMUIsQ0FBQyxNQUFNLGtCQUFHLEtBQUssRUFBRSxJQUFJLElBQUssWUFBWSxFQUFFO0lBQ3hDLENBQUMsY0FBYyxrQkFBRyxXQUFXLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxLQUFLLElBQUssV0FBVyxFQUFFO0lBQzdFLENBQUMsVUFBVSxrQkFBRyxLQUFLLEVBQUUsQ0FBQyxJQUFLLFdBQVcsRUFBRTtJQUN4QyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7Q0FDNUIsQ0FDSixDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRTtJQUM5QixRQUFRLENBQ0osYUFBYSxFQUNiLGFBQWEsQ0FDaEIsQ0FBQztBQUNOLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBST1BfQU5ZLCBQUk9QX0JPT0xFQU4sIFBST1BfTlVNQkVSLCBQUk9QX1NUUklORywgcmVnaXN0ZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvd2lkZ2V0LXByb3BzJztcblxuZXhwb3J0IGNvbnN0IHJhZGlvc2V0UHJvcHMgPSBuZXcgTWFwKFxuICAgIFtcbiAgICAgICAgWydjbGFzcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydjb21wYXJlYnknLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnZGF0YWZpZWxkJywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ2RhdGFzZXQnLCB7dmFsdWU6ICdPcHRpb24gMSwgT3B0aW9uIDIsIE9wdGlvbiAzJywgLi4uUFJPUF9BTll9XSxcbiAgICAgICAgWydkYXRhdmFsdWVzb3VyY2UnLCBQUk9QX0FOWV0sXG4gICAgICAgIFsnZGF0YXZhbHVlJywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ2Rpc2FibGVkJywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgWydkaXNwbGF5ZXhwcmVzc2lvbicsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgWydkaXNwbGF5ZmllbGQnLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsnZGlzcGxheVZhbHVlJywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ2l0ZW1jbGFzcycsIHt2YWx1ZTogJycsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgIFsnbGF5b3V0Jywge3ZhbHVlOiAnc3RhY2tlZCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgIFsnbGlzdGNsYXNzJywge3ZhbHVlOiAnJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgWyduYW1lJywgUFJPUF9TVFJJTkddLFxuICAgICAgICBbJ29yZGVyYnknLCBQUk9QX1NUUklOR10sXG4gICAgICAgIFsncmVhZG9ubHknLCBQUk9QX0JPT0xFQU5dLFxuICAgICAgICBbJ3JlcXVpcmVkJywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgWydzaG93Jywge3ZhbHVlOiB0cnVlLCAuLi5QUk9QX0JPT0xFQU59XSxcbiAgICAgICAgWydzaG93aW5kZXZpY2UnLCB7ZGlzcGxheVR5cGU6ICdpbmxpbmUtYmxvY2snLCB2YWx1ZTogJ2FsbCcsIC4uLlBST1BfU1RSSU5HfV0sXG4gICAgICAgIFsndGFiaW5kZXgnLCB7dmFsdWU6IDAsIC4uLlBST1BfTlVNQkVSfV0sXG4gICAgICAgIFsndXNla2V5cycsIFBST1BfQk9PTEVBTl1cbiAgICBdXG4pO1xuXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJQcm9wcyA9ICgpID0+IHtcbiAgICByZWdpc3RlcihcbiAgICAgICAgJ3dtLXJhZGlvc2V0JyxcbiAgICAgICAgcmFkaW9zZXRQcm9wc1xuICAgICk7XG59O1xuIl19
import { isMobileApp } from '@wm/core';
import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';
export const registerProps = () => {
    const props = new Map([
        ['class', PROP_STRING],
        ['defaultpaneindex', Object.assign({ value: 0 }, PROP_NUMBER)],
        ['justified', PROP_BOOLEAN],
        ['tabsposition', Object.assign({ value: 'top' }, PROP_STRING)],
        ['name', PROP_STRING],
        ['show', Object.assign({ value: true }, PROP_BOOLEAN)],
        ['transition', PROP_STRING]
    ]);
    if (isMobileApp()) {
        props.set('transition', Object.assign({ value: 'slide' }, PROP_STRING));
    }
    register('wm-tabs', props);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFicy5wcm9wcy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFicy90YWJzLnByb3BzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdkMsT0FBTyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRWhHLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxHQUFHLEVBQUU7SUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQ2pCO1FBQ0ksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDO1FBQ3RCLENBQUMsa0JBQWtCLGtCQUFHLEtBQUssRUFBRSxDQUFDLElBQUssV0FBVyxFQUFFO1FBQ2hELENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQztRQUMzQixDQUFDLGNBQWMsa0JBQUcsS0FBSyxFQUFFLEtBQUssSUFBSyxXQUFXLEVBQUU7UUFDaEQsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDO1FBQ3JCLENBQUMsTUFBTSxrQkFBRyxLQUFLLEVBQUUsSUFBSSxJQUFLLFlBQVksRUFBRTtRQUN4QyxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7S0FDOUIsQ0FDSixDQUFDO0lBQ0YsSUFBSSxXQUFXLEVBQUUsRUFBRTtRQUNmLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxrQkFBRyxLQUFLLEVBQUUsT0FBTyxJQUFLLFdBQVcsRUFBRSxDQUFDO0tBQzdEO0lBQ0QsUUFBUSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc01vYmlsZUFwcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgUFJPUF9CT09MRUFOLCBQUk9QX05VTUJFUiwgUFJPUF9TVFJJTkcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3dpZGdldC1wcm9wcyc7XG5cbmV4cG9ydCBjb25zdCByZWdpc3RlclByb3BzID0gKCkgPT4ge1xuICAgIGNvbnN0IHByb3BzID0gbmV3IE1hcChcbiAgICAgICAgW1xuICAgICAgICAgICAgWydjbGFzcycsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgIFsnZGVmYXVsdHBhbmVpbmRleCcsIHt2YWx1ZTogMCwgLi4uUFJPUF9OVU1CRVJ9XSxcbiAgICAgICAgICAgIFsnanVzdGlmaWVkJywgUFJPUF9CT09MRUFOXSxcbiAgICAgICAgICAgIFsndGFic3Bvc2l0aW9uJywge3ZhbHVlOiAndG9wJywgLi4uUFJPUF9TVFJJTkd9XSxcbiAgICAgICAgICAgIFsnbmFtZScsIFBST1BfU1RSSU5HXSxcbiAgICAgICAgICAgIFsnc2hvdycsIHt2YWx1ZTogdHJ1ZSwgLi4uUFJPUF9CT09MRUFOfV0sXG4gICAgICAgICAgICBbJ3RyYW5zaXRpb24nLCBQUk9QX1NUUklOR11cbiAgICAgICAgXVxuICAgICk7XG4gICAgaWYgKGlzTW9iaWxlQXBwKCkpIHtcbiAgICAgICAgcHJvcHMuc2V0KCd0cmFuc2l0aW9uJywge3ZhbHVlOiAnc2xpZGUnLCAuLi5QUk9QX1NUUklOR30pO1xuICAgIH1cbiAgICByZWdpc3Rlcignd20tdGFicycsIHByb3BzKTtcbn07XG4iXX0=
import { getAttrMarkup, getBoundToExpr, register } from '@wm/transpiler';
const tagName = 'div';
const getAttr = (node, attrName) => node.attrs.find(attr => attr.name === attrName);
const ɵ0 = getAttr;
const getAttrValue = (node, attrName) => {
    const match = getAttr(node, attrName);
    if (match) {
        return match.value;
    }
};
const ɵ1 = getAttrValue;
const getReplaceRegex = (v) => new RegExp(`bind:(${v}|${v}\\[\\$i])\\.`, 'g');
const ɵ2 = getReplaceRegex;
register('wm-progress-bar', () => {
    return {
        template: (node) => {
            const dataset = getAttrValue(node, 'dataset');
            const boundExpr = getBoundToExpr(dataset);
            if (boundExpr) {
                let type = getAttrValue(node, 'type');
                let datavalue = getAttrValue(node, 'datavalue');
                const replaceRegex = getReplaceRegex(boundExpr);
                if (type && type.includes(boundExpr)) {
                    type = type.replace(replaceRegex, '');
                    getAttr(node, 'type').value = type;
                }
                if (datavalue && datavalue.includes(boundExpr)) {
                    datavalue = datavalue.replace(replaceRegex, '');
                    getAttr(node, 'datavalue').value = datavalue;
                }
            }
        },
        pre: attrs => `<${tagName} wmProgressBar ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});
export default () => { };
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MtYmFyLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9wcm9ncmVzcy1iYXIvcHJvZ3Jlc3MtYmFyLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUl4RixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFhLEVBQUUsUUFBZ0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDOztBQUVyRyxNQUFNLFlBQVksR0FBRyxDQUFDLElBQWEsRUFBRSxRQUFnQixFQUFzQixFQUFFO0lBQ3pFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdEMsSUFBSSxLQUFLLEVBQUU7UUFDUCxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDdEI7QUFDTCxDQUFDLENBQUM7O0FBRUYsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUV0RixRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBa0IsRUFBRTtJQUM1QyxPQUFPO1FBQ0gsUUFBUSxFQUFFLENBQUMsSUFBYSxFQUFFLEVBQUU7WUFDeEIsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM5QyxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFMUMsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFFaEQsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVoRCxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUNsQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3RDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztpQkFDdEM7Z0JBRUQsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtvQkFDNUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNoRCxPQUFPLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7aUJBQ2hEO2FBQ0o7UUFDTCxDQUFDO1FBQ0QsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLGtCQUFrQixhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUc7UUFDbEUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssT0FBTyxHQUFHO0tBQzlCLENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRWxlbWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcblxuaW1wb3J0IHsgZ2V0QXR0ck1hcmt1cCwgZ2V0Qm91bmRUb0V4cHIsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IHRhZ05hbWUgPSAnZGl2JztcblxuY29uc3QgZ2V0QXR0ciA9IChub2RlOiBFbGVtZW50LCBhdHRyTmFtZTogc3RyaW5nKSA9PiBub2RlLmF0dHJzLmZpbmQoYXR0ciA9PiBhdHRyLm5hbWUgPT09IGF0dHJOYW1lKTtcblxuY29uc3QgZ2V0QXR0clZhbHVlID0gKG5vZGU6IEVsZW1lbnQsIGF0dHJOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICAgIGNvbnN0IG1hdGNoID0gZ2V0QXR0cihub2RlLCBhdHRyTmFtZSk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBtYXRjaC52YWx1ZTtcbiAgICB9XG59O1xuXG5jb25zdCBnZXRSZXBsYWNlUmVnZXggPSAodjogc3RyaW5nKSA9PiBuZXcgUmVnRXhwKGBiaW5kOigke3Z9fCR7dn1cXFxcW1xcXFwkaV0pXFxcXC5gLCAnZycpO1xuXG5yZWdpc3Rlcignd20tcHJvZ3Jlc3MtYmFyJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlOiAobm9kZTogRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGF0YXNldCA9IGdldEF0dHJWYWx1ZShub2RlLCAnZGF0YXNldCcpO1xuICAgICAgICAgICAgY29uc3QgYm91bmRFeHByID0gZ2V0Qm91bmRUb0V4cHIoZGF0YXNldCk7XG5cbiAgICAgICAgICAgIGlmIChib3VuZEV4cHIpIHtcbiAgICAgICAgICAgICAgICBsZXQgdHlwZSA9IGdldEF0dHJWYWx1ZShub2RlLCAndHlwZScpO1xuICAgICAgICAgICAgICAgIGxldCBkYXRhdmFsdWUgPSBnZXRBdHRyVmFsdWUobm9kZSwgJ2RhdGF2YWx1ZScpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZVJlZ2V4ID0gZ2V0UmVwbGFjZVJlZ2V4KGJvdW5kRXhwcik7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZSAmJiB0eXBlLmluY2x1ZGVzKGJvdW5kRXhwcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA9IHR5cGUucmVwbGFjZShyZXBsYWNlUmVnZXgsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgZ2V0QXR0cihub2RlLCAndHlwZScpLnZhbHVlID0gdHlwZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZGF0YXZhbHVlICYmIGRhdGF2YWx1ZS5pbmNsdWRlcyhib3VuZEV4cHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGF2YWx1ZSA9IGRhdGF2YWx1ZS5yZXBsYWNlKHJlcGxhY2VSZWdleCwgJycpO1xuICAgICAgICAgICAgICAgICAgICBnZXRBdHRyKG5vZGUsICdkYXRhdmFsdWUnKS52YWx1ZSA9IGRhdGF2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHByZTogYXR0cnMgPT4gYDwke3RhZ05hbWV9IHdtUHJvZ3Jlc3NCYXIgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+YCxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvJHt0YWdOYW1lfT5gXG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==
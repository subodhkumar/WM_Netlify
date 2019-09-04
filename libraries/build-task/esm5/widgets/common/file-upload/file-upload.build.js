import { getAttrMarkup, getDataSource, register } from '@wm/transpiler';
var tagName = 'div';
register('wm-fileupload', function () {
    return {
        pre: function (attrs) {
            if (attrs.get('select.event')) {
                var onSelectBinding = getDataSource(attrs.get('select.event'));
                attrs.set('datasource.bind', onSelectBinding);
            }
            return "<" + tagName + " wmFileUpload " + getAttrMarkup(attrs) + " role=\"input\">";
        },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS11cGxvYWQuYnVpbGQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2ZpbGUtdXBsb2FkL2ZpbGUtdXBsb2FkLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFpQixRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2RixJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFFdEIsUUFBUSxDQUFDLGVBQWUsRUFBRTtJQUN0QixPQUFPO1FBQ0gsR0FBRyxFQUFFLFVBQUEsS0FBSztZQUNOLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDM0IsSUFBTSxlQUFlLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDakUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLENBQUMsQ0FBQzthQUNqRDtZQUNELE9BQU8sTUFBSSxPQUFPLHNCQUFpQixhQUFhLENBQUMsS0FBSyxDQUFDLHFCQUFnQixDQUFDO1FBQzVFLENBQUM7UUFDRCxJQUFJLEVBQUUsY0FBTSxPQUFBLE9BQUssT0FBTyxNQUFHLEVBQWYsQ0FBZTtLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEF0dHJNYXJrdXAsIGdldERhdGFTb3VyY2UsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ2Rpdic7XG5cbnJlZ2lzdGVyKCd3bS1maWxldXBsb2FkJywgKCk6IElCdWlsZFRhc2tEZWYgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHByZTogYXR0cnMgPT4ge1xuICAgICAgICAgICAgaWYgKGF0dHJzLmdldCgnc2VsZWN0LmV2ZW50JykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvblNlbGVjdEJpbmRpbmcgPSBnZXREYXRhU291cmNlKGF0dHJzLmdldCgnc2VsZWN0LmV2ZW50JykpO1xuICAgICAgICAgICAgICAgIGF0dHJzLnNldCgnZGF0YXNvdXJjZS5iaW5kJywgb25TZWxlY3RCaW5kaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBgPCR7dGFnTmFtZX0gd21GaWxlVXBsb2FkICR7Z2V0QXR0ck1hcmt1cChhdHRycyl9IHJvbGU9XCJpbnB1dFwiPmA7XG4gICAgICAgIH0sXG4gICAgICAgIHBvc3Q6ICgpID0+IGA8LyR7dGFnTmFtZX0+YFxuICAgIH07XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge307XG4iXX0=
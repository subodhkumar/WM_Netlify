import { getAttrMarkup, register } from '@wm/transpiler';
var tagName = 'marquee';
register('wm-marquee', function () {
    return {
        pre: function (attrs) { return "<" + tagName + " onmouseover=\"this.stop();\" onmouseout=\"this.start();\" wmMarquee role=\"marquee\" aria-live=\"off\" " + getAttrMarkup(attrs) + ">"; },
        post: function () { return "</" + tagName + ">"; }
    };
});
export default (function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFycXVlZS5idWlsZC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbWFycXVlZS9tYXJxdWVlLmJ1aWxkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQWlCLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXhFLElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUUxQixRQUFRLENBQUMsWUFBWSxFQUFFO0lBQ25CLE9BQU87UUFDSCxHQUFHLEVBQUUsVUFBQSxLQUFLLElBQUksT0FBQSxNQUFJLE9BQU8sZ0hBQW1HLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBRyxFQUFySSxDQUFxSTtRQUNuSixJQUFJLEVBQUUsY0FBTSxPQUFBLE9BQUssT0FBTyxNQUFHLEVBQWYsQ0FBZTtLQUM5QixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUM7QUFFSCxnQkFBZSxjQUFPLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldEF0dHJNYXJrdXAsIElCdWlsZFRhc2tEZWYsIHJlZ2lzdGVyIH0gZnJvbSAnQHdtL3RyYW5zcGlsZXInO1xuXG5jb25zdCB0YWdOYW1lID0gJ21hcnF1ZWUnO1xuXG5yZWdpc3Rlcignd20tbWFycXVlZScsICgpOiBJQnVpbGRUYXNrRGVmID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcmU6IGF0dHJzID0+IGA8JHt0YWdOYW1lfSBvbm1vdXNlb3Zlcj1cInRoaXMuc3RvcCgpO1wiIG9ubW91c2VvdXQ9XCJ0aGlzLnN0YXJ0KCk7XCIgd21NYXJxdWVlIHJvbGU9XCJtYXJxdWVlXCIgYXJpYS1saXZlPVwib2ZmXCIgJHtnZXRBdHRyTWFya3VwKGF0dHJzKX0+YCxcbiAgICAgICAgcG9zdDogKCkgPT4gYDwvJHt0YWdOYW1lfT5gXG4gICAgfTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7fTtcbiJdfQ==
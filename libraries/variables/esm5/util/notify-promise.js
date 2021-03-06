var NotifyPromise = /** @class */ (function () {
    function NotifyPromise(fn) {
        var notifyQueue = [], notify = function (status) {
            notifyQueue.forEach(function (fn1) {
                fn1(status);
            });
        };
        var cleanUp = function () {
            notifyQueue.length = 0;
        };
        var p1 = new Promise(function (res, rej) {
            fn(res, rej, notify);
        });
        p1.superThen = p1.then.bind(p1);
        p1.then = function (onResolve, onReject, onNotify) {
            p1.superThen(function (response) {
                onResolve(response);
                cleanUp();
            }, function (reason) {
                onResolve(reason);
                cleanUp();
            });
            if (onNotify) {
                notifyQueue.push(onNotify);
            }
        };
        return p1;
    }
    return NotifyPromise;
}());
export { NotifyPromise };
// let newPromise = new PromiseWithNotify((resolve, reject, notify) => {
//     setInterval(notify, 1000);
// })
// console.log(newPromise)
// newPromise.then(undefined, undefined, () => console.log(3));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZ5LXByb21pc2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsidXRpbC9ub3RpZnktcHJvbWlzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUVJLHVCQUFZLEVBQUU7UUFDVixJQUFNLFdBQVcsR0FBRyxFQUFFLEVBQ2xCLE1BQU0sR0FBRyxVQUFBLE1BQU07WUFDZixXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztnQkFDbkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDO1FBRUYsSUFBTSxPQUFPLEdBQUc7WUFDWixXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUM7UUFFRixJQUFNLEVBQUUsR0FBSSxJQUFJLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBRSxHQUFHO1lBQzdCLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUYsRUFBVSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4QyxFQUFVLENBQUMsSUFBSSxHQUFHLFVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRO1lBQzVDLEVBQVUsQ0FBQyxTQUFTLENBQ2pCLFVBQUEsUUFBUTtnQkFDSixTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3BCLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxFQUNELFVBQUEsTUFBTTtnQkFDRixTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2xCLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUNKLENBQUM7WUFDRixJQUFJLFFBQVEsRUFBRTtnQkFDVixXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCO1FBQ0wsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBQ0wsb0JBQUM7QUFBRCxDQUFDLEFBcENELElBb0NDOztBQUVELHdFQUF3RTtBQUN4RSxpQ0FBaUM7QUFDakMsS0FBSztBQUNMLDBCQUEwQjtBQUMxQiwrREFBK0QiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTm90aWZ5UHJvbWlzZSB7XG5cbiAgICBjb25zdHJ1Y3Rvcihmbikge1xuICAgICAgICBjb25zdCBub3RpZnlRdWV1ZSA9IFtdLFxuICAgICAgICAgICAgbm90aWZ5ID0gc3RhdHVzID0+IHtcbiAgICAgICAgICAgIG5vdGlmeVF1ZXVlLmZvckVhY2goZm4xID0+IHtcbiAgICAgICAgICAgICAgICBmbjEoc3RhdHVzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGNsZWFuVXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG5vdGlmeVF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgcDEgPSAgbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgICAgICBmbihyZXMsIHJlaiwgbm90aWZ5KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgKHAxIGFzIGFueSkuc3VwZXJUaGVuID0gcDEudGhlbi5iaW5kKHAxKTtcbiAgICAgICAgKHAxIGFzIGFueSkudGhlbiA9IChvblJlc29sdmUsIG9uUmVqZWN0LCBvbk5vdGlmeSkgPT4ge1xuICAgICAgICAgICAgKHAxIGFzIGFueSkuc3VwZXJUaGVuKFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb25SZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYW5VcCgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVhc29uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb25SZXNvbHZlKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFuVXAoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG9uTm90aWZ5KSB7XG4gICAgICAgICAgICAgICAgbm90aWZ5UXVldWUucHVzaChvbk5vdGlmeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBwMTtcbiAgICB9XG59XG5cbi8vIGxldCBuZXdQcm9taXNlID0gbmV3IFByb21pc2VXaXRoTm90aWZ5KChyZXNvbHZlLCByZWplY3QsIG5vdGlmeSkgPT4ge1xuLy8gICAgIHNldEludGVydmFsKG5vdGlmeSwgMTAwMCk7XG4vLyB9KVxuLy8gY29uc29sZS5sb2cobmV3UHJvbWlzZSlcbi8vIG5ld1Byb21pc2UudGhlbih1bmRlZmluZWQsIHVuZGVmaW5lZCwgKCkgPT4gY29uc29sZS5sb2coMykpO1xuIl19
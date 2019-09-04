import { noop } from '@wm/core';
import { Subject } from 'rxjs';
var FragmentMonitor = /** @class */ (function () {
    function FragmentMonitor() {
        this.fragments = 0;
        this.fragmentsLoaded$ = new Subject();
    }
    FragmentMonitor.prototype.init = function () {
        // console.log(`inside fragmentMonitor: Page-${(this as any).pageName}, Partial-${(this as any).partialName}`);
        var _this = this;
        this.viewInit$.subscribe(noop, noop, function () {
            _this.isViewInitialized = true;
            _this.isReady();
        });
    };
    FragmentMonitor.prototype.registerFragment = function () {
        this.fragments++;
    };
    FragmentMonitor.prototype.resolveFragment = function () {
        this.fragments--;
        this.isReady();
    };
    FragmentMonitor.prototype.isReady = function () {
        if (this.isViewInitialized && !this.fragments) {
            this.registerFragment = noop;
            this.resolveFragment = noop;
            this.fragmentsLoaded$.complete();
        }
    };
    return FragmentMonitor;
}());
export { FragmentMonitor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhZ21lbnQtbW9uaXRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJ1dGlsL2ZyYWdtZW50LW1vbml0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVoQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRS9CO0lBT0k7UUFOQSxjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBSWQscUJBQWdCLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUVsQixDQUFDO0lBRWhCLDhCQUFJLEdBQUo7UUFDSSwrR0FBK0c7UUFEbkgsaUJBT0M7UUFKRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO1lBQ2pDLEtBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsS0FBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDBDQUFnQixHQUFoQjtRQUNJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQseUNBQWUsR0FBZjtRQUNJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNqQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVELGlDQUFPLEdBQVA7UUFDSSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDM0MsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUM3QixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztZQUM1QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDcEM7SUFDTCxDQUFDO0lBQ0wsc0JBQUM7QUFBRCxDQUFDLEFBbENELElBa0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbm9vcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRnJhZ21lbnRNb25pdG9yIHtcbiAgICBmcmFnbWVudHMgPSAwO1xuICAgIHZpZXdJbml0JDogU3ViamVjdDxhbnk+O1xuICAgIGlzVmlld0luaXRpYWxpemVkOiBib29sZWFuO1xuXG4gICAgZnJhZ21lbnRzTG9hZGVkJCA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgICBpbml0KCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgaW5zaWRlIGZyYWdtZW50TW9uaXRvcjogUGFnZS0keyh0aGlzIGFzIGFueSkucGFnZU5hbWV9LCBQYXJ0aWFsLSR7KHRoaXMgYXMgYW55KS5wYXJ0aWFsTmFtZX1gKTtcblxuICAgICAgICB0aGlzLnZpZXdJbml0JC5zdWJzY3JpYmUobm9vcCwgbm9vcCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc1ZpZXdJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmlzUmVhZHkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJGcmFnbWVudCgpIHtcbiAgICAgICAgdGhpcy5mcmFnbWVudHMrKztcbiAgICB9XG5cbiAgICByZXNvbHZlRnJhZ21lbnQoKSB7XG4gICAgICAgIHRoaXMuZnJhZ21lbnRzLS07XG4gICAgICAgIHRoaXMuaXNSZWFkeSgpO1xuICAgIH1cblxuICAgIGlzUmVhZHkoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRpYWxpemVkICYmICF0aGlzLmZyYWdtZW50cykge1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckZyYWdtZW50ID0gbm9vcDtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZUZyYWdtZW50ID0gbm9vcDtcbiAgICAgICAgICAgIHRoaXMuZnJhZ21lbnRzTG9hZGVkJC5jb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
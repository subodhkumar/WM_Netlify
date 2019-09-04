import { noop } from '@wm/core';
import { Subject } from 'rxjs';
export class FragmentMonitor {
    constructor() {
        this.fragments = 0;
        this.fragmentsLoaded$ = new Subject();
    }
    init() {
        // console.log(`inside fragmentMonitor: Page-${(this as any).pageName}, Partial-${(this as any).partialName}`);
        this.viewInit$.subscribe(noop, noop, () => {
            this.isViewInitialized = true;
            this.isReady();
        });
    }
    registerFragment() {
        this.fragments++;
    }
    resolveFragment() {
        this.fragments--;
        this.isReady();
    }
    isReady() {
        if (this.isViewInitialized && !this.fragments) {
            this.registerFragment = noop;
            this.resolveFragment = noop;
            this.fragmentsLoaded$.complete();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhZ21lbnQtbW9uaXRvci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJ1dGlsL2ZyYWdtZW50LW1vbml0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVoQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRS9CLE1BQU0sT0FBZ0IsZUFBZTtJQU9qQztRQU5BLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFJZCxxQkFBZ0IsR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBRWxCLENBQUM7SUFFaEIsSUFBSTtRQUNBLCtHQUErRztRQUUvRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRTtZQUN0QyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1lBQzlCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxnQkFBZ0I7UUFDWixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELGVBQWU7UUFDWCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxPQUFPO1FBQ0gsSUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzNDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3BDO0lBQ0wsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbm9vcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRnJhZ21lbnRNb25pdG9yIHtcbiAgICBmcmFnbWVudHMgPSAwO1xuICAgIHZpZXdJbml0JDogU3ViamVjdDxhbnk+O1xuICAgIGlzVmlld0luaXRpYWxpemVkOiBib29sZWFuO1xuXG4gICAgZnJhZ21lbnRzTG9hZGVkJCA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgICBpbml0KCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhgaW5zaWRlIGZyYWdtZW50TW9uaXRvcjogUGFnZS0keyh0aGlzIGFzIGFueSkucGFnZU5hbWV9LCBQYXJ0aWFsLSR7KHRoaXMgYXMgYW55KS5wYXJ0aWFsTmFtZX1gKTtcblxuICAgICAgICB0aGlzLnZpZXdJbml0JC5zdWJzY3JpYmUobm9vcCwgbm9vcCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pc1ZpZXdJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmlzUmVhZHkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJGcmFnbWVudCgpIHtcbiAgICAgICAgdGhpcy5mcmFnbWVudHMrKztcbiAgICB9XG5cbiAgICByZXNvbHZlRnJhZ21lbnQoKSB7XG4gICAgICAgIHRoaXMuZnJhZ21lbnRzLS07XG4gICAgICAgIHRoaXMuaXNSZWFkeSgpO1xuICAgIH1cblxuICAgIGlzUmVhZHkoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzVmlld0luaXRpYWxpemVkICYmICF0aGlzLmZyYWdtZW50cykge1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckZyYWdtZW50ID0gbm9vcDtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZUZyYWdtZW50ID0gbm9vcDtcbiAgICAgICAgICAgIHRoaXMuZnJhZ21lbnRzTG9hZGVkJC5jb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19
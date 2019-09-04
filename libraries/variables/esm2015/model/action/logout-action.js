import { BaseAction } from '../base-action';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LOGOUT);
};
const ɵ0 = getManager;
export class LogoutAction extends BaseAction {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    logout(options, success, error) {
        getManager().logout(this, options, success, error);
    }
    invoke(options, success, error) {
        this.logout(options, success, error);
    }
    cancel() {
        // TODO[VIBHU]: implement http abort logic
    }
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nb3V0LWFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJtb2RlbC9hY3Rpb24vbG9nb3V0LWFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDekUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFFaEYsTUFBTyxVQUFVLEdBQUcsR0FBRyxFQUFFO0lBQ3JCLE9BQU8sc0JBQXNCLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUM7O0FBRUYsTUFBTSxPQUFPLFlBQWEsU0FBUSxVQUFVO0lBTXhDLFlBQVksUUFBYTtRQUNyQixLQUFLLEVBQUUsQ0FBQztRQUNSLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLO1FBQzFCLFVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQsTUFBTSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSztRQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELE1BQU07UUFDRiwwQ0FBMEM7SUFDOUMsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQmFzZUFjdGlvbiB9IGZyb20gJy4uL2Jhc2UtYWN0aW9uJztcbmltcG9ydCB7IFZBUklBQkxFX0NPTlNUQU5UUyB9IGZyb20gJy4uLy4uL2NvbnN0YW50cy92YXJpYWJsZXMuY29uc3RhbnRzJztcbmltcG9ydCB7IFZhcmlhYmxlTWFuYWdlckZhY3RvcnkgfSBmcm9tICcuLi8uLi9mYWN0b3J5L3ZhcmlhYmxlLW1hbmFnZXIuZmFjdG9yeSc7XG5cbmNvbnN0ICBnZXRNYW5hZ2VyID0gKCkgPT4ge1xuICAgIHJldHVybiBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5LmdldChWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuTE9HT1VUKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBMb2dvdXRBY3Rpb24gZXh0ZW5kcyBCYXNlQWN0aW9uIHtcblxuICAgIHN0YXJ0VXBkYXRlOiBib29sZWFuO1xuICAgIGF1dG9VcGRhdGU6IGJvb2xlYW47XG4gICAgdXNlRGVmYXVsdFN1Y2Nlc3NIYW5kbGVyOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IodmFyaWFibGU6IGFueSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHZhcmlhYmxlKTtcbiAgICB9XG5cbiAgICBsb2dvdXQob3B0aW9ucywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgZ2V0TWFuYWdlcigpLmxvZ291dCh0aGlzLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgaW52b2tlKG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgIHRoaXMubG9nb3V0KG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG5cbiAgICBjYW5jZWwoKSB7XG4gICAgICAgIC8vIFRPRE9bVklCSFVdOiBpbXBsZW1lbnQgaHR0cCBhYm9ydCBsb2dpY1xuICAgIH1cbn1cbiJdfQ==
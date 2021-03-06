import { Injectable } from '@angular/core';
import { AbstractHttpService, hasCordova } from '@wm/core';
export class MetadataService {
    constructor($http) {
        this.$http = $http;
        this.CONTEXT_APP = 'app';
    }
    isLoaded() {
        return this.metadataMap ? this.metadataMap.has(this.CONTEXT_APP) : false;
    }
    load(prefabName) {
        let url;
        if (hasCordova()) {
            url = 'metadata/' + (prefabName ? `prefabs/${prefabName}/` : 'app/') + 'service-definitions.json';
        }
        else {
            url = './services/' + (prefabName ? `prefabs/${prefabName}/` : '') + 'servicedefs';
        }
        return new Promise((resolve, reject) => {
            this.$http.send({ 'url': url, 'method': 'GET' }).then((response) => {
                this.metadataMap = this.metadataMap || new Map();
                this.metadataMap.set(prefabName || this.CONTEXT_APP, response.body);
                resolve(response.body);
            }, reject);
        });
    }
    getByOperationId(operationId, context) {
        context = context || this.CONTEXT_APP;
        const map = this.metadataMap.get(context);
        return map && map[operationId];
    }
}
MetadataService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
MetadataService.ctorParameters = () => [
    { type: AbstractHttpService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJzZXJ2aWNlL21ldGFkYXRhLXNlcnZpY2UvbWV0YWRhdGEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxVQUFVLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHM0QsTUFBTSxPQUFPLGVBQWU7SUFJeEIsWUFBb0IsS0FBMEI7UUFBMUIsVUFBSyxHQUFMLEtBQUssQ0FBcUI7UUFGOUMsZ0JBQVcsR0FBRyxLQUFLLENBQUM7SUFFNkIsQ0FBQztJQUVsRCxRQUFRO1FBQ0osT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUM3RSxDQUFDO0lBRUQsSUFBSSxDQUFDLFVBQW1CO1FBQ3BCLElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSSxVQUFVLEVBQUUsRUFBRTtZQUNkLEdBQUcsR0FBRyxXQUFXLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLDBCQUEwQixDQUFDO1NBQ3JHO2FBQU07WUFDSCxHQUFHLEdBQUcsYUFBYSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLENBQUM7U0FDdEY7UUFDRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFHLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDOUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDcEUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsT0FBTztRQUNqQyxPQUFPLEdBQUcsT0FBTyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDdEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7OztZQS9CSixVQUFVOzs7O1lBRkYsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBYnN0cmFjdEh0dHBTZXJ2aWNlLCBoYXNDb3Jkb3ZhIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWV0YWRhdGFTZXJ2aWNlIHtcbiAgICBtZXRhZGF0YU1hcDogTWFwPHN0cmluZywgYW55PjtcbiAgICBDT05URVhUX0FQUCA9ICdhcHAnO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSAkaHR0cDogQWJzdHJhY3RIdHRwU2VydmljZSkge31cblxuICAgIGlzTG9hZGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXRhZGF0YU1hcCA/IHRoaXMubWV0YWRhdGFNYXAuaGFzKHRoaXMuQ09OVEVYVF9BUFApIDogZmFsc2U7XG4gICAgfVxuXG4gICAgbG9hZChwcmVmYWJOYW1lPzogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgbGV0IHVybDtcbiAgICAgICAgaWYgKGhhc0NvcmRvdmEoKSkge1xuICAgICAgICAgICAgdXJsID0gJ21ldGFkYXRhLycgKyAocHJlZmFiTmFtZSA/IGBwcmVmYWJzLyR7cHJlZmFiTmFtZX0vYCA6ICdhcHAvJykgKyAnc2VydmljZS1kZWZpbml0aW9ucy5qc29uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9ICcuL3NlcnZpY2VzLycgKyAocHJlZmFiTmFtZSA/IGBwcmVmYWJzLyR7cHJlZmFiTmFtZX0vYCA6ICcnKSArICdzZXJ2aWNlZGVmcyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuJGh0dHAuc2VuZCh7J3VybCcgOiB1cmwsICdtZXRob2QnOiAnR0VUJ30pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXRhZGF0YU1hcCA9IHRoaXMubWV0YWRhdGFNYXAgfHwgbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgIHRoaXMubWV0YWRhdGFNYXAuc2V0KHByZWZhYk5hbWUgfHwgdGhpcy5DT05URVhUX0FQUCwgcmVzcG9uc2UuYm9keSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZS5ib2R5KTtcbiAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEJ5T3BlcmF0aW9uSWQob3BlcmF0aW9uSWQsIGNvbnRleHQpIHtcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQgfHwgdGhpcy5DT05URVhUX0FQUDtcbiAgICAgICAgY29uc3QgbWFwID0gdGhpcy5tZXRhZGF0YU1hcC5nZXQoY29udGV4dCk7XG4gICAgICAgIHJldHVybiBtYXAgJiYgbWFwW29wZXJhdGlvbklkXTtcbiAgICB9XG59XG4iXX0=
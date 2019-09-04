var InflightQueue = /** @class */ (function () {
    function InflightQueue() {
        this.requestsQueue = new Map();
    }
    /**
     * pushes the process against a variable in its queue
     * @param variable
     * @param {{resolve: (value?: any) => void; reject: (reason?: any) => void}} param2
     * the resolve callback will be called on
     */
    InflightQueue.prototype.addToQueue = function (variable, param2) {
        if (this.requestsQueue.has(variable)) {
            this.requestsQueue.get(variable).push(param2);
        }
        else {
            var processes = [];
            processes.push({ resolve: param2.resolve, reject: param2.reject, active: false });
            this.requestsQueue.set(variable, processes);
        }
    };
    /**
     * Calls the reject method against the passed process
     * @param process
     */
    InflightQueue.prototype.rejectProcess = function (process) {
        process.reject('Process rejected in the queue. Check the "Inflight behavior" for more info.');
    };
    /**
     * clears the queue against a variable
     * @param variable
     */
    InflightQueue.prototype.clear = function (variable) {
        this.requestsQueue.delete(variable);
    };
    /**
     * executes the n/w calls for a specified variable pushed in its respective queue (pushed while it was inFlight)
     * @param variable
     */
    InflightQueue.prototype.process = function (variable) {
        var processes = this.requestsQueue.get(variable);
        var nextProcess;
        // process request queue for the variable only if it is not empty
        if (!processes || !processes.length) {
            this.clear(variable);
            return;
        }
        // If only one item in queue
        if (processes.length === 1) {
            nextProcess = processes[0];
            if (nextProcess.active) {
                this.clear(variable);
            }
            else {
                nextProcess.active = true;
                nextProcess.resolve();
            }
            return;
        }
        switch (variable.inFlightBehavior) {
            case 'executeLast':
                for (var i = 0; i < processes.length - 2; i++) {
                    this.rejectProcess(processes[i]);
                }
                processes.splice(0, processes.length - 1);
                this.process(variable);
                break;
            case 'executeAll':
                nextProcess = processes.splice(0, 1)[0];
                if (nextProcess.active) {
                    nextProcess = processes.splice(0, 1)[0];
                }
                nextProcess.active = true;
                nextProcess.resolve();
                break;
            default:
                for (var i = 0; i < processes.length - 1; i++) {
                    this.rejectProcess(processes[i]);
                }
                this.clear(variable);
                break;
        }
    };
    /**
     * initializes the queue against a variable and makes the first process call
     * If already initialized and a process in queue is in progress, the queue is not processed.
     * To process the next item in the queue, the process method has to be called from the caller.
     * @param variable
     * @returns {Promise<any>}
     */
    InflightQueue.prototype.submit = function (variable) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.addToQueue(variable, { resolve: resolve, reject: reject });
            if (_this.requestsQueue.get(variable).length === 1) {
                _this.process(variable);
            }
        });
    };
    return InflightQueue;
}());
export var $queue = new InflightQueue();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mbGlnaHQtcXVldWUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsidXRpbC9pbmZsaWdodC1xdWV1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtJQUFBO1FBQ0ksa0JBQWEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBcUc5QixDQUFDO0lBbkdHOzs7OztPQUtHO0lBQ0ssa0NBQVUsR0FBbEIsVUFBbUIsUUFBYSxFQUFFLE1BQTBFO1FBQ3hHLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2pEO2FBQU07WUFDSCxJQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDckIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUMvQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSyxxQ0FBYSxHQUFyQixVQUFzQixPQUFZO1FBQzlCLE9BQU8sQ0FBQyxNQUFNLENBQUMsNkVBQTZFLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksNkJBQUssR0FBWixVQUFhLFFBQVE7UUFDakIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7T0FHRztJQUNILCtCQUFPLEdBQVAsVUFBUSxRQUFhO1FBQ2pCLElBQU0sU0FBUyxHQUFVLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFELElBQUksV0FBVyxDQUFDO1FBRWhCLGlFQUFpRTtRQUNqRSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRTtZQUNqQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JCLE9BQU87U0FDVjtRQUVELDRCQUE0QjtRQUM1QixJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUNwQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNILFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDekI7WUFDRCxPQUFPO1NBQ1Y7UUFFRCxRQUFRLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtZQUMvQixLQUFLLGFBQWE7Z0JBQ2QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMzQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNwQztnQkFDRCxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2QixNQUFNO1lBQ1YsS0FBSyxZQUFZO2dCQUNiLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO29CQUNwQixXQUFXLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzNDO2dCQUNELFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLE1BQU07WUFDVjtnQkFDSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQzNDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3BDO2dCQUNELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3JCLE1BQU07U0FDYjtJQUNMLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCw4QkFBTSxHQUFOLFVBQU8sUUFBYTtRQUFwQixpQkFRQztRQVBHLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixLQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7WUFFOUQsSUFBSSxLQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMvQyxLQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzFCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0wsb0JBQUM7QUFBRCxDQUFDLEFBdEdELElBc0dDO0FBRUQsTUFBTSxDQUFDLElBQU0sTUFBTSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBJbmZsaWdodFF1ZXVlIHtcbiAgICByZXF1ZXN0c1F1ZXVlID0gbmV3IE1hcCgpO1xuXG4gICAgLyoqXG4gICAgICogcHVzaGVzIHRoZSBwcm9jZXNzIGFnYWluc3QgYSB2YXJpYWJsZSBpbiBpdHMgcXVldWVcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcGFyYW0ge3tyZXNvbHZlOiAodmFsdWU/OiBhbnkpID0+IHZvaWQ7IHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZH19IHBhcmFtMlxuICAgICAqIHRoZSByZXNvbHZlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIG9uXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRUb1F1ZXVlKHZhcmlhYmxlOiBhbnksIHBhcmFtMjoge3Jlc29sdmU6ICh2YWx1ZT86IChhbnkpKSA9PiB2b2lkOyByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWR9KSB7XG4gICAgICAgIGlmICh0aGlzLnJlcXVlc3RzUXVldWUuaGFzKHZhcmlhYmxlKSkge1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0c1F1ZXVlLmdldCh2YXJpYWJsZSkucHVzaChwYXJhbTIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VzID0gW107XG4gICAgICAgICAgICBwcm9jZXNzZXMucHVzaCh7cmVzb2x2ZTogcGFyYW0yLnJlc29sdmUsIHJlamVjdDogcGFyYW0yLnJlamVjdCwgYWN0aXZlOiBmYWxzZX0pO1xuICAgICAgICAgICAgdGhpcy5yZXF1ZXN0c1F1ZXVlLnNldCh2YXJpYWJsZSwgcHJvY2Vzc2VzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxzIHRoZSByZWplY3QgbWV0aG9kIGFnYWluc3QgdGhlIHBhc3NlZCBwcm9jZXNzXG4gICAgICogQHBhcmFtIHByb2Nlc3NcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlamVjdFByb2Nlc3MocHJvY2VzczogYW55KSB7XG4gICAgICAgIHByb2Nlc3MucmVqZWN0KCdQcm9jZXNzIHJlamVjdGVkIGluIHRoZSBxdWV1ZS4gQ2hlY2sgdGhlIFwiSW5mbGlnaHQgYmVoYXZpb3JcIiBmb3IgbW9yZSBpbmZvLicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNsZWFycyB0aGUgcXVldWUgYWdhaW5zdCBhIHZhcmlhYmxlXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICovXG4gICAgcHVibGljIGNsZWFyKHZhcmlhYmxlKSB7XG4gICAgICAgIHRoaXMucmVxdWVzdHNRdWV1ZS5kZWxldGUodmFyaWFibGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGV4ZWN1dGVzIHRoZSBuL3cgY2FsbHMgZm9yIGEgc3BlY2lmaWVkIHZhcmlhYmxlIHB1c2hlZCBpbiBpdHMgcmVzcGVjdGl2ZSBxdWV1ZSAocHVzaGVkIHdoaWxlIGl0IHdhcyBpbkZsaWdodClcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKi9cbiAgICBwcm9jZXNzKHZhcmlhYmxlOiBhbnkpIHtcbiAgICAgICAgY29uc3QgcHJvY2Vzc2VzOiBbYW55XSA9IHRoaXMucmVxdWVzdHNRdWV1ZS5nZXQodmFyaWFibGUpO1xuICAgICAgICBsZXQgbmV4dFByb2Nlc3M7XG5cbiAgICAgICAgLy8gcHJvY2VzcyByZXF1ZXN0IHF1ZXVlIGZvciB0aGUgdmFyaWFibGUgb25seSBpZiBpdCBpcyBub3QgZW1wdHlcbiAgICAgICAgaWYgKCFwcm9jZXNzZXMgfHwgIXByb2Nlc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIodmFyaWFibGUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgb25seSBvbmUgaXRlbSBpbiBxdWV1ZVxuICAgICAgICBpZiAocHJvY2Vzc2VzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgbmV4dFByb2Nlc3MgPSBwcm9jZXNzZXNbMF07XG4gICAgICAgICAgICBpZiAobmV4dFByb2Nlc3MuYWN0aXZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhcih2YXJpYWJsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5leHRQcm9jZXNzLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgbmV4dFByb2Nlc3MucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoICh2YXJpYWJsZS5pbkZsaWdodEJlaGF2aW9yKSB7XG4gICAgICAgICAgICBjYXNlICdleGVjdXRlTGFzdCc6XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9jZXNzZXMubGVuZ3RoIC0gMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVqZWN0UHJvY2Vzcyhwcm9jZXNzZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcm9jZXNzZXMuc3BsaWNlKDAsIHByb2Nlc3Nlcy5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXhlY3V0ZUFsbCc6XG4gICAgICAgICAgICAgICAgbmV4dFByb2Nlc3MgPSBwcm9jZXNzZXMuc3BsaWNlKDAsIDEpWzBdO1xuICAgICAgICAgICAgICAgIGlmIChuZXh0UHJvY2Vzcy5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dFByb2Nlc3MgPSBwcm9jZXNzZXMuc3BsaWNlKDAsIDEpWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXh0UHJvY2Vzcy5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG5leHRQcm9jZXNzLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9jZXNzZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVqZWN0UHJvY2Vzcyhwcm9jZXNzZXNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGluaXRpYWxpemVzIHRoZSBxdWV1ZSBhZ2FpbnN0IGEgdmFyaWFibGUgYW5kIG1ha2VzIHRoZSBmaXJzdCBwcm9jZXNzIGNhbGxcbiAgICAgKiBJZiBhbHJlYWR5IGluaXRpYWxpemVkIGFuZCBhIHByb2Nlc3MgaW4gcXVldWUgaXMgaW4gcHJvZ3Jlc3MsIHRoZSBxdWV1ZSBpcyBub3QgcHJvY2Vzc2VkLlxuICAgICAqIFRvIHByb2Nlc3MgdGhlIG5leHQgaXRlbSBpbiB0aGUgcXVldWUsIHRoZSBwcm9jZXNzIG1ldGhvZCBoYXMgdG8gYmUgY2FsbGVkIGZyb20gdGhlIGNhbGxlci5cbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICAgICAqL1xuICAgIHN1Ym1pdCh2YXJpYWJsZTogYW55KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFkZFRvUXVldWUodmFyaWFibGUsIHtyZXNvbHZlOiByZXNvbHZlLCByZWplY3Q6IHJlamVjdH0pO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5yZXF1ZXN0c1F1ZXVlLmdldCh2YXJpYWJsZSkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzKHZhcmlhYmxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgJHF1ZXVlID0gbmV3IEluZmxpZ2h0UXVldWUoKTtcbiJdfQ==
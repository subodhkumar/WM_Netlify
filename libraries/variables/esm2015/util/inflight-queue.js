class InflightQueue {
    constructor() {
        this.requestsQueue = new Map();
    }
    /**
     * pushes the process against a variable in its queue
     * @param variable
     * @param {{resolve: (value?: any) => void; reject: (reason?: any) => void}} param2
     * the resolve callback will be called on
     */
    addToQueue(variable, param2) {
        if (this.requestsQueue.has(variable)) {
            this.requestsQueue.get(variable).push(param2);
        }
        else {
            const processes = [];
            processes.push({ resolve: param2.resolve, reject: param2.reject, active: false });
            this.requestsQueue.set(variable, processes);
        }
    }
    /**
     * Calls the reject method against the passed process
     * @param process
     */
    rejectProcess(process) {
        process.reject('Process rejected in the queue. Check the "Inflight behavior" for more info.');
    }
    /**
     * clears the queue against a variable
     * @param variable
     */
    clear(variable) {
        this.requestsQueue.delete(variable);
    }
    /**
     * executes the n/w calls for a specified variable pushed in its respective queue (pushed while it was inFlight)
     * @param variable
     */
    process(variable) {
        const processes = this.requestsQueue.get(variable);
        let nextProcess;
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
                for (let i = 0; i < processes.length - 2; i++) {
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
                for (let i = 0; i < processes.length - 1; i++) {
                    this.rejectProcess(processes[i]);
                }
                this.clear(variable);
                break;
        }
    }
    /**
     * initializes the queue against a variable and makes the first process call
     * If already initialized and a process in queue is in progress, the queue is not processed.
     * To process the next item in the queue, the process method has to be called from the caller.
     * @param variable
     * @returns {Promise<any>}
     */
    submit(variable) {
        return new Promise((resolve, reject) => {
            this.addToQueue(variable, { resolve: resolve, reject: reject });
            if (this.requestsQueue.get(variable).length === 1) {
                this.process(variable);
            }
        });
    }
}
export const $queue = new InflightQueue();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mbGlnaHQtcXVldWUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vdmFyaWFibGVzLyIsInNvdXJjZXMiOlsidXRpbC9pbmZsaWdodC1xdWV1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLGFBQWE7SUFBbkI7UUFDSSxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFxRzlCLENBQUM7SUFuR0c7Ozs7O09BS0c7SUFDSyxVQUFVLENBQUMsUUFBYSxFQUFFLE1BQTBFO1FBQ3hHLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2pEO2FBQU07WUFDSCxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDckIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUMvQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSyxhQUFhLENBQUMsT0FBWTtRQUM5QixPQUFPLENBQUMsTUFBTSxDQUFDLDZFQUE2RSxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUVEOzs7T0FHRztJQUNJLEtBQUssQ0FBQyxRQUFRO1FBQ2pCLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxPQUFPLENBQUMsUUFBYTtRQUNqQixNQUFNLFNBQVMsR0FBVSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxRCxJQUFJLFdBQVcsQ0FBQztRQUVoQixpRUFBaUU7UUFDakUsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQixPQUFPO1NBQ1Y7UUFFRCw0QkFBNEI7UUFDNUIsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN4QixXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtnQkFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN4QjtpQkFBTTtnQkFDSCxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDMUIsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ3pCO1lBQ0QsT0FBTztTQUNWO1FBRUQsUUFBUSxRQUFRLENBQUMsZ0JBQWdCLEVBQUU7WUFDL0IsS0FBSyxhQUFhO2dCQUNkLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDM0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDcEM7Z0JBQ0QsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkIsTUFBTTtZQUNWLEtBQUssWUFBWTtnQkFDYixXQUFXLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtvQkFDcEIsV0FBVyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMzQztnQkFDRCxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDMUIsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN0QixNQUFNO1lBQ1Y7Z0JBQ0ksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUMzQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNwQztnQkFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNyQixNQUFNO1NBQ2I7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsTUFBTSxDQUFDLFFBQWE7UUFDaEIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7WUFFOUQsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMvQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzFCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFFRCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEluZmxpZ2h0UXVldWUge1xuICAgIHJlcXVlc3RzUXVldWUgPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiBwdXNoZXMgdGhlIHByb2Nlc3MgYWdhaW5zdCBhIHZhcmlhYmxlIGluIGl0cyBxdWV1ZVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSB7e3Jlc29sdmU6ICh2YWx1ZT86IGFueSkgPT4gdm9pZDsgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkfX0gcGFyYW0yXG4gICAgICogdGhlIHJlc29sdmUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgb25cbiAgICAgKi9cbiAgICBwcml2YXRlIGFkZFRvUXVldWUodmFyaWFibGU6IGFueSwgcGFyYW0yOiB7cmVzb2x2ZTogKHZhbHVlPzogKGFueSkpID0+IHZvaWQ7IHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZH0pIHtcbiAgICAgICAgaWYgKHRoaXMucmVxdWVzdHNRdWV1ZS5oYXModmFyaWFibGUpKSB7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RzUXVldWUuZ2V0KHZhcmlhYmxlKS5wdXNoKHBhcmFtMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwcm9jZXNzZXMgPSBbXTtcbiAgICAgICAgICAgIHByb2Nlc3Nlcy5wdXNoKHtyZXNvbHZlOiBwYXJhbTIucmVzb2x2ZSwgcmVqZWN0OiBwYXJhbTIucmVqZWN0LCBhY3RpdmU6IGZhbHNlfSk7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RzUXVldWUuc2V0KHZhcmlhYmxlLCBwcm9jZXNzZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbHMgdGhlIHJlamVjdCBtZXRob2QgYWdhaW5zdCB0aGUgcGFzc2VkIHByb2Nlc3NcbiAgICAgKiBAcGFyYW0gcHJvY2Vzc1xuICAgICAqL1xuICAgIHByaXZhdGUgcmVqZWN0UHJvY2Vzcyhwcm9jZXNzOiBhbnkpIHtcbiAgICAgICAgcHJvY2Vzcy5yZWplY3QoJ1Byb2Nlc3MgcmVqZWN0ZWQgaW4gdGhlIHF1ZXVlLiBDaGVjayB0aGUgXCJJbmZsaWdodCBiZWhhdmlvclwiIGZvciBtb3JlIGluZm8uJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2xlYXJzIHRoZSBxdWV1ZSBhZ2FpbnN0IGEgdmFyaWFibGVcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xlYXIodmFyaWFibGUpIHtcbiAgICAgICAgdGhpcy5yZXF1ZXN0c1F1ZXVlLmRlbGV0ZSh2YXJpYWJsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogZXhlY3V0ZXMgdGhlIG4vdyBjYWxscyBmb3IgYSBzcGVjaWZpZWQgdmFyaWFibGUgcHVzaGVkIGluIGl0cyByZXNwZWN0aXZlIHF1ZXVlIChwdXNoZWQgd2hpbGUgaXQgd2FzIGluRmxpZ2h0KVxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqL1xuICAgIHByb2Nlc3ModmFyaWFibGU6IGFueSkge1xuICAgICAgICBjb25zdCBwcm9jZXNzZXM6IFthbnldID0gdGhpcy5yZXF1ZXN0c1F1ZXVlLmdldCh2YXJpYWJsZSk7XG4gICAgICAgIGxldCBuZXh0UHJvY2VzcztcblxuICAgICAgICAvLyBwcm9jZXNzIHJlcXVlc3QgcXVldWUgZm9yIHRoZSB2YXJpYWJsZSBvbmx5IGlmIGl0IGlzIG5vdCBlbXB0eVxuICAgICAgICBpZiAoIXByb2Nlc3NlcyB8fCAhcHJvY2Vzc2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhcih2YXJpYWJsZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBvbmx5IG9uZSBpdGVtIGluIHF1ZXVlXG4gICAgICAgIGlmIChwcm9jZXNzZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBuZXh0UHJvY2VzcyA9IHByb2Nlc3Nlc1swXTtcbiAgICAgICAgICAgIGlmIChuZXh0UHJvY2Vzcy5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyKHZhcmlhYmxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV4dFByb2Nlc3MuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBuZXh0UHJvY2Vzcy5yZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKHZhcmlhYmxlLmluRmxpZ2h0QmVoYXZpb3IpIHtcbiAgICAgICAgICAgIGNhc2UgJ2V4ZWN1dGVMYXN0JzpcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2Nlc3Nlcy5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWplY3RQcm9jZXNzKHByb2Nlc3Nlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByb2Nlc3Nlcy5zcGxpY2UoMCwgcHJvY2Vzc2VzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzcyh2YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdleGVjdXRlQWxsJzpcbiAgICAgICAgICAgICAgICBuZXh0UHJvY2VzcyA9IHByb2Nlc3Nlcy5zcGxpY2UoMCwgMSlbMF07XG4gICAgICAgICAgICAgICAgaWYgKG5leHRQcm9jZXNzLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0UHJvY2VzcyA9IHByb2Nlc3Nlcy5zcGxpY2UoMCwgMSlbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5leHRQcm9jZXNzLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgbmV4dFByb2Nlc3MucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2Nlc3Nlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWplY3RQcm9jZXNzKHByb2Nlc3Nlc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXIodmFyaWFibGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaW5pdGlhbGl6ZXMgdGhlIHF1ZXVlIGFnYWluc3QgYSB2YXJpYWJsZSBhbmQgbWFrZXMgdGhlIGZpcnN0IHByb2Nlc3MgY2FsbFxuICAgICAqIElmIGFscmVhZHkgaW5pdGlhbGl6ZWQgYW5kIGEgcHJvY2VzcyBpbiBxdWV1ZSBpcyBpbiBwcm9ncmVzcywgdGhlIHF1ZXVlIGlzIG5vdCBwcm9jZXNzZWQuXG4gICAgICogVG8gcHJvY2VzcyB0aGUgbmV4dCBpdGVtIGluIHRoZSBxdWV1ZSwgdGhlIHByb2Nlc3MgbWV0aG9kIGhhcyB0byBiZSBjYWxsZWQgZnJvbSB0aGUgY2FsbGVyLlxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gICAgICovXG4gICAgc3VibWl0KHZhcmlhYmxlOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuYWRkVG9RdWV1ZSh2YXJpYWJsZSwge3Jlc29sdmU6IHJlc29sdmUsIHJlamVjdDogcmVqZWN0fSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnJlcXVlc3RzUXVldWUuZ2V0KHZhcmlhYmxlKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3ModmFyaWFibGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCAkcXVldWUgPSBuZXcgSW5mbGlnaHRRdWV1ZSgpO1xuIl19
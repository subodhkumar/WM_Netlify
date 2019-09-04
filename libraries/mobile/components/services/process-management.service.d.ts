import { ProcessManagerComponent, ProcessApi } from '../widgets/process-manager/process-manager.component';
export declare class ProcessManagementService {
    private processManagerComponent;
    setUIComponent(processManagerComponent: ProcessManagerComponent): void;
    /**
     * Returns a promise that will be resolved when an instance is available. At max, 3 instances can only run
     * in parallel and rest has to wait till a process is completed.
     *
     * A progress instance has the following properties.
     *
     *   1) min {number} minimum value, default value is 0 </br>
     *   2) max {number} maximum value, default value is 100 </br>
     *   3) value {number} progress value </br>
     *   4) progressLabel {string} process name </br>
     *   5) stopButtonLabel {string} label for stop button, default value is 'Cancel' </br>
     *   6) onStop {function} function to invoke when stop button is clicked. </br>
     *
     * A progress instance has 3 methods </br>
     *   1) set(property, value) -- sets value to the corresponding property </br>
     *   2) get(property) -- returns property value </br>
     *   3) destroy() -- closes the instance. </br>
     *
     * A progress instance will get auto closed when value and max are equal or when destroy method is called.
     *
     * @param {string} name name of the process whose progress is going to be shown
     * @param {number} min minimum value
     * @param {number} max maximum value
     *
     * @returns {object} a promise
     */
    createInstance(name: string, min?: number, max?: number): Promise<ProcessApi>;
}

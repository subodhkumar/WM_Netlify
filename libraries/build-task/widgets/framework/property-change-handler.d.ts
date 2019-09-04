import { BaseComponent } from '../common/base/base.component';
/**
 * Whenever a property on a component changes through a proxy this method will be triggered
 * If the new value is not from a watch, the existing watch on that particular property will be removed
 * This method invokes the defaultPropertyChange handler where the common widget properties like name, class are handled
 * Notifies the component about the style/property change
 */
export declare const globalPropertyChangeHandler: (component: BaseComponent, key: string, nv: any) => void;

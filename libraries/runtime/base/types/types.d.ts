export declare enum ComponentType {
    PAGE = 0,
    PREFAB = 1,
    PARTIAL = 2
}
export declare abstract class ComponentRefProvider {
    abstract getComponentFactoryRef(componentName: string, componentType: ComponentType): Promise<any>;
    clearComponentFactoryRefCache(): void;
}
export declare abstract class PrefabConfigProvider {
    abstract getConfig(prefabName: string): Promise<any>;
}
export declare abstract class AppJSProvider {
    abstract getAppScriptFn(): Promise<Function>;
}
export declare abstract class AppVariablesProvider {
    abstract getAppVariables(): Promise<any>;
}
export declare abstract class PartialRefProvider {
    abstract getComponentFactoryRef(partialName: string, componentType: ComponentType): Promise<any>;
}

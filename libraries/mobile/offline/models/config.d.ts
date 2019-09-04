import { SQLiteObject } from '@ionic-native/sqlite';
import { LocalDBStore } from './local-db-store';
export declare class DBInfo {
    schema: {
        name: string;
        isInternal: boolean;
        entities: Map<string, EntityInfo>;
    };
    stores: Map<string, LocalDBStore>;
    queries: Map<string, NamedQueryInfo>;
    sqliteObject: SQLiteObject;
}
export declare class EntityInfo {
    name: string;
    entityName?: string;
    columns: ColumnInfo[];
    pullConfig: PullConfig;
    pushConfig: PushConfig;
    constructor(name: string, entityName?: string);
}
export declare class ColumnInfo {
    name: string;
    fieldName?: string;
    generatorType: string;
    sqlType: string;
    primaryKey: boolean;
    defaultValue: any;
    foreignRelations?: ForeignRelationInfo[];
    constructor(name: string, fieldName?: string);
}
export declare class ForeignRelationInfo {
    sourceFieldName: string;
    targetEntity: string;
    targetTable: string;
    targetColumn: string;
    targetFieldName: string;
    targetPath: string;
    dataMapper: Array<ColumnInfo>;
}
export declare class NamedQueryInfo {
    name: string;
    query: string;
    params: NamedQueryParamInfo[];
    response: {
        properties: any[];
    };
    constructor(name: string, query: string);
}
export declare class NamedQueryParamInfo {
    name: string;
    type?: string;
    variableType?: string;
    constructor(name: string, type?: string, variableType?: string);
}
export declare class PullConfig {
    size: number;
    query: string;
    orderBy: string;
    maxNoOfRecords: number;
    defaultType: string;
    pullType: PullType;
    filter: OfflineDataFilter[];
}
export declare enum PullType {
    LIVE = "LIVE",
    BUNDLED = "BUNDLED",
    APP_START = "APP_START"
}
export declare class OfflineDataFilter {
    attributeName: string;
    attributeValue: any;
    attributeType: string;
    filterCondition: string;
}
export declare class PushConfig {
    insertEnabled: boolean;
    updateEnabled: boolean;
    deleteEnabled: boolean;
    readEnabled: boolean;
}

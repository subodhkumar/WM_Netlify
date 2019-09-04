import { AppVersion } from '@ionic-native/app-version';
import { File } from '@ionic-native/file';
import { SQLite } from '@ionic-native/sqlite';
import { DeviceFileService, DeviceService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';
import { LocalKeyValueService } from './local-key-value.service';
import { LocalDBStore } from '../models/local-db-store';
export interface CallBack {
    onDbCreate?: (info: any) => any;
    postImport?: (importFolderPath: string, metaInfo: any) => any;
    preExport?: (folderToExportFullPath: string, metaInfo: any) => any;
}
export declare class LocalDBManagementService {
    private appVersion;
    private deviceService;
    private deviceFileService;
    private file;
    private localKeyValueService;
    private securityService;
    private sqlite;
    private callbacks;
    private dbInstallDirectory;
    private dbInstallDirectoryName;
    private dbInstallParentDirectory;
    private databases;
    private _logSql;
    nextId: number;
    private readonly systemProperties;
    constructor(appVersion: AppVersion, deviceService: DeviceService, deviceFileService: DeviceFileService, file: File, localKeyValueService: LocalKeyValueService, securityService: SecurityService, sqlite: SQLite);
    /**
     * Closes all databases.
     *
     * @returns {object} a promise.
     */
    close(): Promise<any>;
    nextIdCount(): number;
    /**
     * Executes a named query.
     *
     * @param {string} dbName name of database on which the named query has to be run
     * @param {string} queryName name of the query to execute
     * @param {object} params parameters required for query.
     * @returns {object} a promise.
     */
    executeNamedQuery(dbName: string, queryName: string, params: any): Promise<any>;
    /**
     * This function will export the databases in a zip format.
     *
     * @returns {object} a promise that is resolved when zip is created.
     */
    exportDB(): Promise<string>;
    /**
     *  returns store bound to the dataModelName and entityName.
     *
     * @param dataModelName
     * @param entityName
     * @returns {*}
     */
    getStore(dataModelName: string, entityName: string): Promise<LocalDBStore>;
    /**
     * This function will replace the databases with the files provided in zip. If import gets failed,
     * then app reverts back to use old databases.
     *
     * @param {string} zipPath location of the zip file.
     * @param {boolean} revertIfFails If true, then a backup is created and when import fails, backup is reverted back.
     * @returns {object} a promise that is resolved when zip is created.
     */
    importDB(zipPath: string, revertIfFails: boolean): Promise<void>;
    /**
     * @param {string} dataModelName Name of the data model
     * @param {string} entityName Name of the entity
     * @param {string} operation Name of the operation (READ, INSERT, UPDATE, DELETE)
     * @returns {boolean} returns true, if the given operation can be performed as per configuration.
     */
    isOperationAllowed(dataModelName: string, entityName: string, operation: string): Promise<boolean>;
    loadDatabases(): Promise<any>;
    /**
     * using this function one can listen events such as onDbCreate, 'preExport' and 'postImport'.
     *
     * @param {object} listener an object with functions mapped to event names.
     */
    registerCallback(listener: CallBack): void;
    setLogSQl(flag: boolean): void;
    /**
     * Deletes any existing databases (except wavemaker db) and copies the databases that are packaged with the app.
     *
     * @returns {*}
     */
    private cleanAndCopyDatabases;
    private compactEntitySchema;
    private compactQueries;
    private compactSchema;
    private convertBoolToInt;
    private convertIntToBool;
    /**
     * Turns off foreign keys
     * @returns {*}
     */
    private disableForeignKeys;
    /**
     * Executes SQL query;
     *
     * @param dbName
     * @param sql
     * @param params
     * @returns {*}
     */
    executeSQLQuery(dbName: any, sql: any, params?: any[], logOutput?: boolean): any;
    private extractQueryParams;
    /**
     * Returns a promise that is resolved with application info such as packageName, appName, versionNumber, versionCode.
     * @returns {*}
     */
    private getAppInfo;
    private getCallbacksFor;
    /**
     * Searches for the files with given regex in 'www/metadata/app'and returns an array that contains the JSON
     * content present in each file.
     *
     * @param {string} fileNameRegex regex pattern to search for files.
     * @returns {*} A promise that is resolved with an array
     */
    private getMetaInfo;
    /**
     * Returns true, if the given entity's data is bundled along with application installer.
     * @param dataModelName name of the data model
     * @param entityName name of the entity
     * @returns {Promise<any>}
     */
    isBundled(dataModelName: any, entityName: any): Promise<any>;
    /**
     * Loads local database schemas from *_data_model.json.
     *
     * @returns {*} A promise that is resolved with metadata.
     */
    private loadDBSchemas;
    /**
     * Load named queries from *_query.json.
     *
     * @param {*} metadata
     * @returns {*} A promise that is resolved with metadata
     */
    private loadNamedQueries;
    /**
     * Load offline configuration from *_offline.json.
     *
     * @param {*} metadata
     * @returns {*} A promise that is resolved with metadata
     */
    private loadOfflineConfig;
    private logSql;
    /**
     * SQLite does not support boolean data. Instead of using boolean values, data will be changed to 0 or 1.
     * If the value is 'true', then 1 is set as value. If value is not 1 nor null, then column value is set as 0.
     * @param dbName
     * @param tableName
     * @param colName
     * @returns {*}
     */
    private normalizeBooleanData;
    /**
     * Converts data to support SQLite.
     * @returns {*}
     */
    private normalizeData;
    private openDatabase;
    /**
     * When app is opened for first time  after a fresh install or update, then old databases are removed and
     * new databases are created using bundled databases.
     *
     * @returns {*} a promise that is resolved with true, if the databases are newly created or resolved with false
     * if existing databases are being used.
     */
    private setUpDatabases;
}

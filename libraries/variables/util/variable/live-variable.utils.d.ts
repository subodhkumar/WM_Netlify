export declare class LiveVariableUtils {
    static isCompositeKey(primaryKey: any): boolean;
    static isNoPrimaryKey(primaryKey: any): boolean;
    static getCompositeIDURL(primaryKeysData: any): string;
    static hasBlob(variable: any): any;
    static getPrimaryKey(variable: any): any;
    static processBlobColumns(responseData: any, variable: any): void;
    static getHibernateOrSqlType(variable: any, fieldName: any, type: any, entityName?: string): any;
    static getSqlType(variable: any, fieldName: any, entityName?: string): any;
    static isRelatedFieldMany(variable: any, fieldName: any): boolean;
    static isStringType(type: any): any;
    static getSQLFieldType(variable: any, options: any): any;
    static getAttributeName(variable: any, fieldName: any): any;
    static getFilterCondition(filterCondition: any): any;
    static getFilterOption(variable: any, fieldOptions: any, options: any): any;
    static getFilterOptions(variable: any, filterFields: any, options: any): any[];
    static wrapInLowerCase(value: any, options: any, ignoreCase: any, isField?: any): any;
    static encodeAndAddQuotes(value: any, type: any, skipEncode: any): any;
    static getParamValue(value: any, options: any, ignoreCase: any, skipEncode: any): any;
    static getSearchQuery(filterOptions: any, operator: any, ignoreCase: any, skipEncode?: any): any;
    /**
     * creating the proper values from the actual object like for between,in matchModes value has to be an array like [1,2]
     * @param rules recursive filterexpressions object
     * @param variable variable object
     * @param options options
     */
    static processFilterFields(rules: any, variable: any, options: any): void;
    static getSearchField(fieldValue: any, ignoreCase: any, skipEncode: any): any;
    /**
     * this is used to identify whether to use ignorecase at each criteria level and not use the variable
     * level isIgnoreCase flag and apply it to all the rules.
     * Instead of adding an extra param to the criteria object, we have added few other matchmodes for string types like
     * anywhere with anywhereignorecase, start with startignorecase, end with endignorecase, exact with exactignorecase,
     * So while creating the criteria itseld user can choose whether to use ignore case or not for a particular column while querying
     * @param matchMode
     * @param ignoreCase
     * @returns {*} boolean
     */
    static getIgnoreCase(matchMode: any, ignoreCase: any): any;
    static generateSearchQuery(rules: any, condition: any, ignoreCase: any, skipEncode: any): any;
    static prepareTableOptionsForFilterExps(variable: any, options: any, clonedFields: any): {
        'filter': any[];
        'sort': any;
        'query': any;
    };
    static prepareTableOptions(variable: any, options: any, clonedFields?: any): {
        'filter': any[];
        'sort': any;
        'query': any;
    };
    static getFieldType(fieldName: any, variable: any, relatedField?: any): any;
    static prepareFormData(variableDetails: any, rowObject: any): any;
    static traverseFilterExpressions(filterExpressions: any, traverseCallbackFn: any): void;
    /**
     * Traverses recursively the filterExpressions object and if there is any required field present with no value,
     * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
     * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
     * the filter query section as optional
     * @param filterExpressions - recursive rule Object
     * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
     */
    static getFilterExprFields(filterExpressions: any): any;
    /**
     *
     * @param variable
     * @param options
     * @returns {function(*=): *} returns a function which should be called for the where clause.
     * This return function can take a function as argument. This argument function can modify the filter fields
     * before generating where clause.
     */
    static getWhereClauseGenerator(variable: any, options: any, updatedFilterFields?: any): (modifier: any, skipEncode?: boolean) => any;
}

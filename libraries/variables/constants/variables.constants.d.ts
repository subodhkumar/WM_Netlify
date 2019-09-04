export declare const CONSTANTS: {
    hasCordova: boolean;
    isWaveLens: boolean;
    isStudioMode: boolean;
    isRunMode: boolean;
    XSRF_COOKIE_NAME: string;
    DEFAULT_TIMER_DELAY: number;
    WIDGET_DOESNT_EXIST: string;
};
export declare const VARIABLE_CONSTANTS: {
    CATEGORY: {
        MODEL: string;
        LIVE: string;
        SERVICE: string;
        WEBSOCKET: string;
        NAVIGATION: string;
        NOTIFICATION: string;
        TIMER: string;
        LOGIN: string;
        LOGOUT: string;
        DEVICE: string;
    };
    EVENTS: string[];
    EVENT: {
        'CAN_UPDATE': string;
        'BEFORE': string;
        'BEFORE_UPDATE': string;
        'PREPARE_SETDATA': string;
        'RESULT': string;
        'ERROR': string;
        'ABORT': string;
        'PROGRESS': string;
        'CLICK': string;
        'HIDE': string;
        'OK': string;
        'CANCEL': string;
        'CLOSE': string;
        'TIMER_FIRE': string;
        'SUCCESS': string;
        'BEFORE_OPEN': string;
        'OPEN': string;
        'BEFORE_SEND': string;
        'MESSAGE_RECEIVE': string;
        'BEFORE_CLOSE': string;
    };
    OWNER: {
        'APP': string;
        'PAGE': string;
    };
    REST_SUPPORTED_SERVICES: string[];
    PAGINATION_PARAMS: string[];
    REST_SERVICE: {
        'BASE_PATH_KEY': string;
        'RELATIVE_PATH_KEY': string;
        'OAUTH_PROVIDER_KEY': string;
        'AUTH_HDR_KEY': string;
        'SECURITY_DEFN': {
            'BASIC': string;
            'OAUTH2': string;
        };
        'AUTH_TYPE': {
            'BASIC': string;
            'OAUTH': string;
            'NONE': string;
        };
        'CONTENT_TYPE_KEY': string;
        'ACCESSTOKEN_PLACEHOLDER': {
            'LEFT': string;
            'RIGHT': string;
        };
        ERR_TYPE: {
            NO_ACCESSTOKEN: string;
            NO_CREDENTIALS: string;
            METADATA_MISSING: string;
            USER_UNAUTHORISED: string;
            REQUIRED_FIELD_MISSING: string;
        };
        ERR_MSG: {
            NO_ACCESSTOKEN: string;
            NO_CREDENTIALS: string;
            METADATA_MISSING: string;
            USER_UNAUTHORISED: string;
            REQUIRED_FIELD_MISSING: string;
        };
        UNCLOAKED_HEADERS: string[];
        PREFIX: {
            AUTH_HDR_VAL: {
                BASIC: string;
                OAUTH: string;
            };
            CLOAK_HEADER_KEY: string;
        };
    };
    SERVICE_TYPE: {
        JAVA: string;
        REST: string;
        SOAP: string;
        FEED: string;
        DATA: string;
        SECURITY: string;
        WEBSOCKET: string;
    };
    CONTROLLER_TYPE: {
        QUERY: string;
        PROCEDURE: string;
    };
    HTTP_STATUS_CODE: {
        CORS_FAILURE: number;
        UNAUTHORIZED: number;
        FORBIDDEN: number;
    };
    EXPORT_TYPES_MAP: {
        'EXCEL': string;
        'CSV': string;
    };
    DEFAULT_VAR: {
        'NOTIFICATION': string;
    };
};
export declare const WS_CONSTANTS: {
    NON_BODY_HTTP_METHODS: string[];
    CONTENT_TYPES: {
        FORM_URL_ENCODED: string;
        MULTIPART_FORMDATA: string;
        OCTET_STREAM: string;
    };
};
export declare const DB_CONSTANTS: {
    'DATABASE_MATCH_MODES': {
        'like': string;
        'start': string;
        'startignorecase': string;
        'end': string;
        'endignorecase': string;
        'anywhere': string;
        'anywhereignorecase': string;
        'exact': string;
        'exactignorecase': string;
        'notequals': string;
        "notequalsignorecase": string;
        'between': string;
        'in': string;
        "notin": string;
        'lessthan': string;
        'lessthanequal': string;
        'greaterthan': string;
        'greaterthanequal': string;
        'null': string;
        'isnotnull': string;
        'empty': string;
        'isnotempty': string;
        'nullorempty': string;
    };
    'DATABASE_EMPTY_MATCH_MODES': string[];
    'DATABASE_RANGE_MATCH_MODES': string[];
    'DATABASE_NULL_EMPTY_MATCH': {
        'NULL': string;
        'IS_NOT_NULL': string;
        'EMPTY': string;
        'IS_NOT_EMPTY': string;
        'NULL_OR_EMPTY': string;
    };
    'DATABASE_MATCH_MODES_WITH_QUERY': {
        'LIKE': string;
        'STARTING_WITH': string;
        'STARTING_WITH_IGNORECASE': string;
        'ENDING_WITH': string;
        'ENDING_WITH_IGNORECASE': string;
        'CONTAINING': string;
        'CONTAINING_IGNORECASE': string;
        'EQUALS': string;
        'EQUALS_IGNORECASE': string;
        'NOT_EQUALS': string;
        "NOT_EQUALS_IGNORECASE": string;
        'BETWEEN': string;
        'IN': string;
        'NOTIN': string;
        'LESS_THAN': string;
        'LESS_THAN_OR_EQUALS': string;
        'GREATER_THAN': string;
        'GREATER_THAN_OR_EQUALS': string;
        'NULL': string;
        'IS_NOT_NULL': string;
        'EMPTY': string;
        'IS_NOT_EMPTY': string;
        'NULL_OR_EMPTY': string;
    };
    'DATABASE_STRING_MODES': string[];
};
export declare const SWAGGER_CONSTANTS: {
    WM_DATA_JSON: string;
    WM_HTTP_JSON: string;
};
export declare const VARIABLE_URLS: {
    DATABASE: {
        searchTableData: {
            url: string;
            method: string;
        };
        searchTableDataWithQuery: {
            url: string;
            method: string;
            headers: {
                'Content-Type': string;
            };
        };
        readTableData: {
            url: string;
            method: string;
        };
        insertTableData: {
            url: string;
            method: string;
        };
        insertMultiPartTableData: {
            url: string;
            method: string;
            headers: {};
        };
        updateTableData: {
            url: string;
            method: string;
        };
        updateMultiPartTableData: {
            url: string;
            method: string;
            headers: {};
        };
        deleteTableData: {
            url: string;
            method: string;
        };
        updateCompositeTableData: {
            url: string;
            method: string;
        };
        periodUpdateCompositeTableData: {
            url: string;
            method: string;
        };
        updateMultiPartCompositeTableData: {
            url: string;
            method: string;
            headers: {};
        };
        deleteCompositeTableData: {
            url: string;
            method: string;
        };
        periodDeleteCompositeTableData: {
            url: string;
            method: string;
        };
        getDistinctDataByFields: {
            url: string;
            method: string;
        };
        exportTableData: {
            url: string;
            method: string;
        };
        readTableRelatedData: {
            url: string;
            method: string;
        };
        executeNamedQuery: {
            url: string;
            method: string;
        };
        executeCustomQuery: {
            url: string;
            method: string;
        };
        executeAggregateQuery: {
            url: string;
            method: string;
        };
        executeNamedProcedure: {
            url: string;
            method: string;
        };
        countTableDataWithQuery: {
            url: string;
            method: string;
            headers: {
                'Content-Type': string;
            };
        };
    };
    oauthConfiguration: {
        getAuthorizationUrl: {
            url: string;
            method: string;
        };
    };
};
export declare const $rootScope: {
    project: {
        deployedUrl: string;
        id: string;
    };
    projectName: string;
    isApplicationType: boolean;
};

export const variables = {
  "appNotification" : {
    "_id" : "wm-appErrorHandler-wm.NotificationVariable-1454664620943",
    "name" : "appNotification",
    "owner" : "App",
    "category" : "wm.NotificationVariable",
    "dataBinding" : [ {
      "target" : "class",
      "value" : "Error",
      "type" : "list"
    }, {
      "target" : "toasterPosition",
      "value" : "bottom right",
      "type" : "list"
    } ],
    "operation" : "toast"
  },
  "goToPage_Main" : {
    "_id" : "wm-wm.NavigationVariable1389180517517",
    "name" : "goToPage_Main",
    "owner" : "App",
    "category" : "wm.NavigationVariable",
    "operation" : "gotoPage",
    "pageName" : "Main"
  },
  "supportedLocale" : {
    "_id" : "wm-wm.Variable1402640443182",
    "name" : "supportedLocale",
    "owner" : "App",
    "category" : "wm.Variable",
    "dataSet" : {
      "en" : "English"
    },
    "type" : "string",
    "isList" : false,
    "saveInPhonegap" : false
  }
};

export const getVariables = () => JSON.parse(JSON.stringify(variables));

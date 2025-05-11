/*Title : Update Fields
Purpose : To Update custom fields (ASI/ASIT) based on several rules
Author: Haetham Eleisah
Functional Area : workflow events,inpsection result or document upload events.
Description : JSON Example :
{
  "Marijuana/Retail/Retail Store/Renewal": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "update fields",
          "operators": {
             
          }
        },
        "criteria": {
          "customFields": {
            "Trade Name": "test"
          },
          "customLists": {
            "OWNERSHIP INFORMATION/Name": "33",
            
          },
          "task": [
            
          ],
          "status": [
           
          ],
          
        },
        "action": {
          "daysOut":"365"
          "valueSource": " ",
          "sourceName": "ACA_CONFIGS/AGENCY_NAME",
          "customFieldToUpdate": "EIN#",
          "customListToUpdate": "TESTHAETHAM/TestHaetham",
		  "asitSearchColumn": "",
		  "updateAppName":{
			"includeAddress" : false,
			"addressType": "",
			"contactType" : "Applicant",
			"includeContactName" : true,
			"includeBusinessName" : false,
			"includeDBATradeName" : false
		  }
        },
        "postScript": ""
      }
    ]
  }
}
** Available Types: customFields, customLists
** Available Attributes for each type:
- Custom Fields and Custom Lists: ALL

** Property 'daysOut' OPTIONAL: 
	- if filled, script will ignore 'valueSource' and 'sourceName'
	- can be numeric ex, 120, will be used in dateAdd()
	- can be a custom method name, script will evaluate it eval() and returned value used to update the target field(s)
		in case custom method name, method must be accessible to the script (most common is to place it in INCLUDES_CUSTOM)
	
** asitSearchColumn OPTIONAL is used to search in Standard Comment, if used (comment name)
	MUST be in same Custom List to update
*
Note : for the source name when the value source is standard comments then the source name should be "comment type/comment ID"
and when the source is standard choice the source name will be standard choice / standard choice value.

 */

try {
	// This should be included in all Configurable Scripts
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var settingsArray = [];
	var scriptSuffix = "UPDATE_FIELDS";
	isConfigurableScript(settingsArray, scriptSuffix);

	for (s in settingsArray) {
		var rules = settingsArray[s];
		var preScript = rules.preScript;
		var postScript = rules.postScript;

		//run preScript
		if (!isEmptyOrNull(preScript)) {
			eval(getScriptText(preScript, null, false));
		}
		if (cancelCfgExecution) {
			logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
			cancelCfgExecution = false;
			continue;
		}

		UpdateFields(rules.action);

		//run post script
		if (!isEmptyOrNull(postScript)) {
			eval(getScriptText(postScript, null, false));
		}
	}
} catch (ex) {
	logDebug("**ERROR: Exception while verifying the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * this function will update ASI or ASIT column  based on the json rules
 * @param rules json rules .
 */
function UpdateFields(rules) {
	var daysOut = rules.daysOut;
	var valueSource = rules.valueSource;
	var customListToUpdate = rules.customListToUpdate;
	var asitSearchColumn = rules.asitSearchColumn;
	var sourceName = rules.sourceName;
	var updateAppName = rules.updateAppName;
	var newValue = null;
	//prepare the new value
	if (!isEmptyOrNull(daysOut)) {
		if (isNaN(daysOut)) {
			//custom function name
			try {
				//add () if not already added in JSON
				var methodName = String(daysOut).indexOf("(") == -1 ? String(daysOut) + "()" : String(daysOut);
				newValue = eval(methodName);
			} catch (ex) {
				logDebug("**WARN Exception eval dynamic method (" + daysOut + ") in script (" + scriptSuffix + ") ERROR:" + ex);
			}
		} else {
			//numeric value
			newValue = dateAdd(null, parseInt(daysOut));
		}
	} else if (valueSource == "Standard Comments" && !isEmptyOrNull(customListToUpdate) && !isEmptyOrNull(asitSearchColumn)) {

		customListToUpdate = customListToUpdate.split("/");

		var searchTable = customListToUpdate[0];

		tmpTable = [];
		tmpTable = loadASITable(searchTable.toUpperCase());
		var columnList = [];
		for (i in tmpTable) {
			var thisRow = tmpTable[i];
			columnList.push(thisRow[asitSearchColumn].fieldValue);
		}//for all comment details ASIT rows

		var tableToUpdate = customListToUpdate[0];
		var columnToUpdate = customListToUpdate[1];

		var result = aa.cap.getStandardComment(null).getOutput();
		var stdComments = sourceName;
		for (i in result) {
			if (result[i].getCommentType() == stdComments) {
				for (c in columnList) {
					if (result[i].getName() == columnList[c]) {
						var stdCommentText = result[i].getText();
						customListColumnUpdateLocal(capId, tableToUpdate, asitSearchColumn, columnList[c], columnToUpdate, stdCommentText);
					}//columnList match Std-Comment Name
				}//for all column values from columnList
			}//src comment type match
		}//for all comments
	} else {
		newValue = getNewValue(rules);
	}

	//update field with new value
	if (newValue != null) {
		if (rules.customFieldToUpdate != null && rules.customFieldToUpdate != "") {
			editAppSpecific(rules.customFieldToUpdate, newValue);
		}
		if (rules.customListToUpdate != null && rules.customListToUpdate != "") {
			UpdateAsitTableColumn(rules.customListToUpdate, newValue)
		}
	}

	if (!isEmptyOrNull(updateAppName)) {
		var appContact = null;
		var bContName = false;
		var vNewAppName = "";
		var itemCap = capId
		var vContactType = updateAppName.contactType;
		var vAddressType = updateAppName.addressType;
		var includeAddress = updateAppName.includeAddress;

		var includeContactName = updateAppName.includeContactName;
		var includeBusinessName = updateAppName.includeBusinessName;
		var includeDBATradeName = updateAppName.includeDBATradeName;

		if(!isEmptyOrNull(includeAddress)){
				var addResult = aa.address.getAddressByCapId(itemCap);

				if (addResult.getSuccess()) {
					var addArray = addResult.getOutput();
	
					if(!isEmptyOrNull(vAddressType) && !isEmptyOrNull(addArray) && addArray.length > 0){
						for (var jj in addArray) {
							var thisAddress = addArray[jj];
						
							if (thisAddress.getAddressType() != null) {
								if (String(thisAddress.getAddressType()).toUpperCase().equals(vAddressType.toUpperCase())) {
									vNewAppName = thisAddress.getDisplayAddress();
								}
								else{
									logDebug("Could not find an address of type: " + vAddressType);
								}		
							} 
						}
					}
					else{
						if(!isEmptyOrNull(addArray) && addArray.length > 0)
						// Use the first address in the arry
						vNewAppName = addArray[0].getDisplayAddress();
					}
				} 
				else {
					logDebug("Could not find address: " + addResult.getErrorMessage());
				}
			//}
			
		}
		
		if(!isEmptyOrNull(vContactType)){
			appContact = getContactObj(itemCap,vContactType)

			if(vNewAppName != ""){
				// Add a colon after the address
				vNewAppName += " : ";
			}

			if (appContact)
			{
				peop = appContact.people;

				if (includeContactName && peop.getLastName() != null && peop.getFirstName() != null){
					vNewAppName += peop.getFirstName() + " " + peop.getLastName()
					bContName = true;
				}
				if(peop.getBusinessName() != null && bContName && includeContactName && includeBusinessName){
					vNewAppName += peop.getBusinessName() + " - " + peop.getFirstName() + " " + peop.getLastName();
				}
				if(peop.getTradeName() != null && bContName && includeContactName && includeDBATradeName){
					vNewAppName += peop.getTradeName() + " - " + peop.getFirstName() + " " + peop.getLastName();
				}
				if(peop.getBusinessName() != null && peop.getTradeName() != null && !includeContactName && includeBusinessName && includeDBATradeName){
					vNewAppName += peop.getBusinessName() + " - " + peop.getTradeName();
				}
				if(peop.getBusinessName() != null && !includeContactName && includeBusinessName && !includeDBATradeName){
					vNewAppName += peop.getBusinessName();
				}
				if(peop.getTradeName() != null && !includeContactName && !includeBusinessName && includeDBATradeName){
					vNewAppName += peop.getTradeName();
				}
				
				
			}

		}

		editAppName(vNewAppName,itemCap);		

	}

}

function customListColumnUpdateLocal(capIDModel, tableName, searchColumnName, searchValue, columnToUpdate, valueToUpdate) {
	// logDebug(" ");
	// logDebug("capIDModel: " + capIDModel);
	//logDebug("tableName: " + tableName);
	//logDebug("searchColumnName: " + searchColumnName);
	//logDebug("searchValue: " + searchValue);
	//logDebug("columnToUpdate: " + columnToUpdate);
	//logDebug("valueToUpdate: " + valueToUpdate);

	// Create a HashMap.
	var searchConditionMap = aa.util.newHashMap();

	// Create a List object to add the value of Column.
	var valuesList = aa.util.newArrayList();
	valuesList.add(searchValue);

	searchConditionMap.put(searchColumnName, valuesList);

	var appSpecificTableInfo = aa.appSpecificTableScript.getAppSpecificTableInfo(capIDModel, tableName, searchConditionMap);
	//logDebug("appSpecificTableInfo.getSuccess(): " + appSpecificTableInfo.getSuccess());
	if (appSpecificTableInfo.getSuccess()) {
		var appSpecificTableModel = appSpecificTableInfo.getOutput().getAppSpecificTableModel();
		var tableFields = appSpecificTableModel.getTableFields();

		if (tableFields != null && tableFields.size() > 0) {
			//logDebug("tableFields.size(): " + tableFields.size());
			var updateRowsMap = aa.util.newHashMap();
			for (var i = 0; i < tableFields.size(); i++) {
				var fieldObject = tableFields.get(i);
				//get the column name.
				var columnName = fieldObject.getFieldLabel();
				//get the value of column
				var columnValue = fieldObject.getInputValue();
				//get the row ID 
				var rowID = fieldObject.getRowIndex();
				//logDebug("columnName: " + columnName);
				//logDebug("columnValue: " + columnValue);
				//logDebug("rowID: " + rowID);
				if (columnName == searchColumnName) {
					setUpdateColumnValueLocal(updateRowsMap, rowID, columnToUpdate, valueToUpdate);
				}
			}
			if (!updateRowsMap.isEmpty()) {
				var tableResult = updateAppSpecificTableInforsLocal(tableName, capIDModel, updateRowsMap);
				//logDebug("tableResult: " + tableResult.getSuccess());
				if (tableResult.getSuccess()) {
					logDebug("Table successfully updated!");
				}
			}
		} else {
			//logDebug("tableFields is null"); // prev code had log with tableFields.size() that would cause error if it's null
		}
	}

	function setUpdateColumnValueLocal(updateRowsMap, rowID, columnName, columnValue) {
		var updateFieldsMap = updateRowsMap.get(rowID);
		if (updateFieldsMap == null) {
			updateFieldsMap = aa.util.newHashMap();
			updateRowsMap.put(rowID, updateFieldsMap);
		}
		updateFieldsMap.put(columnName, columnValue);
	}

	function updateAppSpecificTableInforsLocal(tableName, capIDModel, updateRowsMap) {
		if (updateRowsMap == null || updateRowsMap.isEmpty()) {
			return;
		}

		var asitTableScriptModel = aa.appSpecificTableScript.createTableScriptModel();
		var asitTableModel = asitTableScriptModel.getTabelModel();
		var rowList = asitTableModel.getRows();
		asitTableModel.setSubGroup(tableName);
		var rowIdArray = updateRowsMap.keySet().toArray();
		for (var i = 0; i < rowIdArray.length; i++) {
			var rowScriptModel = aa.appSpecificTableScript.createRowScriptModel();
			var rowModel = rowScriptModel.getRow();
			rowModel.setFields(updateRowsMap.get(rowIdArray[i]));
			rowModel.setId(rowIdArray[i]);
			rowList.add(rowModel);
		}
		return aa.appSpecificTableScript.updateAppSpecificTableInfors(capIDModel, asitTableModel);
	}
} //function end

/**
 * this function will get the new value to update the asi/asit column based on the source
 * @param rules
 * @returns
 */
function getNewValue(rules) {
	var valueSource = rules.valueSource;
	var sourceName = rules.sourceName;
	if (valueSource && valueSource.trim() == "") {
		return sourceName;
	} else if (valueSource == "Standard Choice") {
		var stdValues = sourceName.split("/");
		if (stdValues.length == 2) {
			var result = aa.bizDomain.getBizDomainByValue(stdValues[0], stdValues[1]).getOutput();

			if (result != null) {
				return result.getDescription();
			} else {
				return "";
			}
		}
	} else if (valueSource == "Standard Comments") {
		var result = aa.cap.getStandardComment(null).getOutput();
		var stdComments = sourceName.split("/");
		if (stdComments.length == 2) {
			for ( var ix in result) {
				if (result[ix].getCommentType() == stdComments[0] && stdComments[1] == result[ix].getDocID())
					return result[ix].getName();
			}
		}
	}
}
/**
 * this function will update ASIT column
 * @param customListDetails ASIT details 
 * @param newValue new column value
 */
function UpdateAsitTableColumn(customListDetails, newValue) {
	var asitDetails = customListDetails.split("/");
	if (asitDetails.length == 2) {
		var tableName = asitDetails[0];
		var columnName = asitDetails[1];
		var oldASITArray = loadASITable(tableName);
		for ( var i in oldASITArray) {
			oldASITArray[i][columnName] = newValue;

		}

		removeASITable(tableName);
		addASITable(tableName, oldASITArray)
	}
}

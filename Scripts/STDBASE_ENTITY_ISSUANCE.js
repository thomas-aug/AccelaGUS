/*
Title : Entity Issuance Automation (WorkflowTaskUpdateAfter) 
Purpose : When all associated contacts have completed the individual registration applications, the information is reviewed and
approved by agency staff. The business license application is automatically generated and pre-populated with information
from the business application

Author: Yazan Barghouth
 
Functional Area : Contacts,Records,Public User, Workflow
 
JSON Example :

{
  "Cannabis/Entity/Prequalification/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Entity Issuance for Prequalification",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Application Issuance"
          ],
          "status": [
            "Approved"
          ],
        },
        "action": {
        	"customFieldGroup": "",
        	"customFieldRecordGrouping": "",
        	"customListName": "MJ_LICENSURE TYPE",
        	"customListGroupField": "Permit Category",
        	"customListValueField": "Permit Type"
			"customFieldRecordTypeMapping": {
            "Adult-Use": {
              "Cannabis Cultivation": "Cannabis/Adult-Use/Cultivation/Application",
              "Cannabis Dispensary": "Cannabis/Adult-Use/Dispensary/Application",
              "Cannabis Processor": "Cannabis/Adult-Use/Processor/Application",
              "Cannabis Product Manufacturer": "Cannabis/Adult-Use/Manufacturer/Application",
              "Cannabis Optional Premises Cultivation": "Cannabis/Adult-Use/Optional Prem Culti/Application",
              "Cannabis Transport": "Cannabis/Adult-Use/Transport/Application"
            },
            "Medicinal Use": {
              "Cannabis Medical Center": "Cannabis/Medical/Medical Center/Application",
              "Cannabis Cultivation": "Cannabis/Medical/Cultivation/Application",
              "Cannabis Dispensary": "Cannabis/Medical/Dispensary/Application",
              "Cannabis Infused Products Manufacturer": "Cannabis/Medical/Infused Products Mfg/Application",
              "Cannabis Optional Premises Cultivation": "Cannabis/Medical/Optional Prem Culti/Application",
              "Cannabis Processor": "Cannabis/Medical/Processor/Application",
              "Cannabis Product Manufacturer": "Cannabis/Medical/Manufacturer/Application",
              "Cannabis Transport": "Cannabis/Medical/Transport/Application"
            },
            "Medicinal and Adult-Use": {
              "Cannabis Cultivation": "Cannabis/Combo/Cultivation/Application",
              "Cannabis Dispensary": "Cannabis/Combo/Dispensary/Application",
              "Cannabis Microbusiness": "Cannabis/Combo/Microbusiness/Application",
              "Cannabis Optional Premises Cultivation": "Cannabis/Combo/Optional Prem Culti/Application",
              "Cannabis Processor": "Cannabis/Combo/Processor/Application",
              "Cannabis Product Manufacturer": "Cannabis/Combo/Manufacturer/Application",
              "Cannabis Testing Facility": "Cannabis/Combo/Testing Facility/Application",
              "Cannabis Transport": "Cannabis/Combo/Transport/Application"
            }
          },
          "childTempRecord": true,
          "childRecordStatus": "Pending",
          "CFGroupsToCopy": "GENERAL INFORMATION,PERMITS,APPLICANT INFORMATION,ENTITY DETAILS,FINANCIAL HISTORY",
          "copyCF": true,
          "copyCT": false,
          "recordIdField": ""
        },
        "postScript": ""
	  }
}

- Parameters CFGroupsToCopy: comma separated values for ASI groups to be copied (if copyCF is true)
if left empty, all ASI groups will be copied.

- nothing mentioned in JSON about who should receive the email(s), no emails were sent, and 
JSON parameters (notificationTemplate,notificationReport) were deleted
 * 
 */

var scriptSuffix = "ENTITY_ISSUANCE";

try {
	// This should be included in all Configurable Scripts
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));

	var settingsArray = [];
	if (isConfigurableScript(settingsArray, scriptSuffix)) {
		for (s in settingsArray) {

			var rules = settingsArray[s];
			//Execute PreScript
			var preScript = handleUndefined(rules.preScript);
			if (!matches(preScript, null, "")) {
				eval(getScriptText(preScript));
			}

			generateLicenseApplications(capId, rules.action);

			//Execute postScript
			var postScript = handleUndefined(rules.postScript);
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		}
	}
} catch (ex) {
	logDebug("**ERROR: Exception while verifying the rules for " + scriptSuffix + ". Error: " + ex);
}

function generateLicenseApplications(capIdObject, jsonRules) {

	var customFieldRecordTypeMapping = jsonRules.customFieldRecordTypeMapping;
	var customFieldGroup = jsonRules.customFieldGroup;
	var customFieldRecordGrouping = jsonRules.customFieldRecordGrouping
	var customListName = jsonRules.customListName;
	

	var contacts = getCapContactModel(capIdObject);
	
	var recordGrouping = "All";
	
	if(customFieldGroup != null && customFieldGroup !=""){
		// loop through the custom field checkboxes
		var customFieldSubgroup = getCustomFieldSubgroup(capIdObject, customFieldGroup);

		if (customFieldSubgroup == null || customFieldSubgroup.length == 0) {
			logDebug("WARNING: failed to load custom fields subgroup with name=" + jsonRules.customFieldGroup);
		}
	
		if(customFieldRecordGrouping != null && customFieldRecordGrouping != ""){
			//We are using a field group with checkboxes
			recordGrouping = getAppSpecific(customFieldRecordGrouping,capIdObject);
		}
		
		var entLicenseTypeGroupMapping = customFieldRecordTypeMapping[recordGrouping];

		for (cf in customFieldSubgroup) {
			var thisCustomField = customFieldSubgroup[cf];
			var thisCustomFieldLabel = thisCustomField.checkboxDesc;
			var thisCustomFieldValue = thisCustomField.checklistComment;
			
			if (thisCustomFieldValue == "CHECKED") {
				var entLicenseType = entLicenseTypeGroupMapping[thisCustomFieldLabel];

				if (!(typeof entLicenseType === 'undefined')) {

					var customFieldCopyTypes = null;
					if (!(typeof jsonRules.CFGroupsToCopy === 'undefined') && jsonRules.CFGroupsToCopy != null && jsonRules.CFGroupsToCopy != "") {
						customFieldCopyTypes = new String(jsonRules.CFGroupsToCopy).split(",");
					}

					var createdCapId = createChildTempRecordLocal(capIdObject, entLicenseType, customFieldCopyTypes, jsonRules);
				}
				else{
					logDebug("WARNING: Failed to find a matching license type for " + thisCustomFieldLabel);
				}
				
			}//asi field CHCKED
		}//for all fields in subGroup
	} // if customFieldGroup
	
	if(customListName != null && customListName !=""){
		var customListArray = loadASITable(customListName,capIdObject);
		var customListGroupField = jsonRules.customListGroupField
		var customListValueField = jsonRules.customListValueField

		
		for(iRow in customListArray){
			var tableRow = customListArray[iRow];
			recordGrouping = tableRow[customListGroupField];
			var recordTypeAlias = tableRow[customListValueField];
			var entLicenseTypeGroupMapping = customFieldRecordTypeMapping[recordGrouping];
			var entLicenseType = entLicenseTypeGroupMapping[recordTypeAlias];
;
			if (!(typeof entLicenseType === 'undefined')) {

				var customFieldCopyTypes = null;
				if (!(typeof jsonRules.CFGroupsToCopy === 'undefined') && jsonRules.CFGroupsToCopy != null && jsonRules.CFGroupsToCopy != "") {
					customFieldCopyTypes = new String(jsonRules.CFGroupsToCopy).split(",");
				}
				var createdCapId = createChildTempRecordLocal(capIdObject, entLicenseType, customFieldCopyTypes, jsonRules);
			}
			else{
				logDebug("WARNING: Failed to find a matching license type for " + recordTypeAlias);
			}
		}
		
	}

}

function getCustomFieldSubgroup(pCapId, subgroupName) {
	var matchSubgroup = new String(subgroupName);
	var sgFieldArray = new Array();
	var customFieldsResult = aa.appSpecificInfo.getByCapID(pCapId);
	if (customFieldsResult.getSuccess()) {
		var customFields = customFieldsResult.getOutput();
		for (cf in customFields) {

			var customField = customFields[cf];
			var cfSubgroup = customField.checkboxType;
			var cfDescription = customField.checkboxDesc;
			var cfValue = customField.checklistComment;
			var cfRequiredFlag = customField.getAttributeValueReqFlag();

			if (matchSubgroup.indexOf(cfSubgroup) != -1) {
				sgFieldArray.push(customField);
			}
		}
		return sgFieldArray;
	} else {
		logDebug("ERROR getCustomFieldSubgroup err " + customFieldsResult.getErrorMessage());
	}
	return false;
}

function createChildTempRecordLocal(vCapId, recordTypeString, customFieldCopyTypes, jsonRules) { // optional groups to ignore
	var childId = null;

	var tmpCap = aa.cap.getCap(vCapId).getOutput();
	var newRecordName = tmpCap.getSpecialText();

	var cTypeArray = recordTypeString.split("/");
	if (jsonRules.childTempRecord) {
		//create temp record:
		ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
		ctm.setGroup(cTypeArray[0]);
		ctm.setType(cTypeArray[1]);
		ctm.setSubType(cTypeArray[2]);
		ctm.setCategory(cTypeArray[3]);
		createChildResult = aa.cap.createSimplePartialRecord(ctm, newRecordName, "INCOMPLETE EST");
	} else {
		//create record:
		createChildResult = aa.cap.createApp(cTypeArray[0], cTypeArray[1], cTypeArray[2], cTypeArray[3], newRecordName);
	}

	if (createChildResult.getSuccess()) {
		childId = createChildResult.getOutput();
		logDebug("Child ID: " + childId.getCustomID());
	} else {
		logDebug("ERROR Creating child temp record: " + createChildResult.getErrorMessage());
		return false;
	}

	if (!jsonRules.childTempRecord) {
		var childCapModel = aa.cap.getCap(childId).getOutput();
		var res = aa.cap.runEMSEScriptAfterApplicationSubmit(childCapModel, vCapId);
	}

	updateAppStatus(jsonRules.childRecordStatus, jsonRules.childRecordStatus, childId);

	if (jsonRules.recordIdField = null && jsonRules.recordIdField != "") {
		editAppSpecific(jsonRules.recordIdField, vCapId.getId(), childId);
	}

	if (jsonRules.copyCF) {
		copyAppSpecificByType(vCapId, childId, customFieldCopyTypes);
	}
	if (jsonRules.copyCT) {
		copyASITablesByType(vCapId, childId, null);
	}
	copyParcels(vCapId, childId);
	copyAddresses(vCapId, childId);
	copyOwner(vCapId, childId);
	copyContacts(vCapId, childId);

	aa.cap.createAssociatedFormsHierarchy(vCapId, childId);

	return childId;
}

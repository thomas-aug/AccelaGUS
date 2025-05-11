/*Title : CONTACT LICENSE CONFLICTCHECKING
Purpose : add condition to the contact or to the record based on the JSON rules
Author: Haetham Eleisah
Functional Area : ApplicationSubmitAfter or WorkflowTaskUpdateAfter
Description : JSON Example :
{
"Building/Commercial/New Construction/NA": {
  "ApplicationSpecificInfoUpdateAfter": [
    {
      "preScript": "",
      "contactTypeRecordTypeMapping": [
        {
          "Applicant": {
            "Building/Commercial/New Construction/NA": {
              "count": 0,
              "status": [
                "Open",
                "Issued"
              ]
             
            }
          }
        },
        {
          "Affiliate Business": {
            "Building/Commercial/New Construction/NA": {
              "count": 0,
              "status": [
                "Active",
                "About to Expire"
              ]
              
            }
          }
        }
      ],
      "stdConditionType":"Notice",
      "stdConditionName": "License Conflict",
      "stdConditionDesc": "License Conflict",
      "stdConditionComment": "A licence conflict has been identified",
      "applyToRecord": true,
      "applyToContact": true,
      "postScript": ""
    }
  ]
}
}
		
 */
// this because the script should work only WorkflowTaskUpdateAfter and ApplicationSubmitAfter events
if (typeof controlString != 'undefined' && (controlString == "WorkflowTaskUpdateAfter" || controlString == "ApplicationSubmitAfter")) {
	var scriptSuffix = "CONTACT_LICENSE_CONFLICT_CHECKING";
	try {
		eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
		var settingsArray = [];
		if (isConfigurableScript(settingsArray, scriptSuffix)) {

			for (s in settingsArray) {

				var rules = settingsArray[s];

				CheckContactLicenseConflict(rules);
				//Execute PreScript
				var preScript = handleUndefined(rules.preScript);
				if (!matches(preScript, null, "")) {
					eval(getScriptText(preScript));
				}

				//Execute Post Script
				var postScript = handleUndefined(rules.postScript);
				if (!matches(postScript, null, "")) {
					eval(getScriptText(postScript));
				}
			}
		}

	} catch (ex) {
		logDebug("**ERROR:Exception while verifying the rules for " + scriptSuffix + ". Error: " + ex);
	}
}
/**
 * this function will check the license contact conflict
 * @param rules  the provided rules from the JSON.
 */
function CheckContactLicenseConflict(rules) {
	if (rules.contactTypeRecordTypeMapping != null && rules.contactTypeRecordTypeMapping != "") {
		//this to get the current cap contacts
		var currentCapContacts = getCapContactModel(capId);
		if (currentCapContacts != null && currentCapContacts.length > 0) {
			for ( var i in rules.contactTypeRecordTypeMapping) {
				var contactJsonMapping = rules.contactTypeRecordTypeMapping[i];
				for ( var ct in currentCapContacts) {
					for ( var x in contactJsonMapping) {
						var contactModel = null;
						var recordJsonMapping = contactJsonMapping[x];
						if (currentCapContacts[ct].getPeople().contactType == x) {
							contactModel = currentCapContacts[ct];
						}
						if (contactModel != null) {
							checkRecordType(recordJsonMapping, contactModel, rules.applyToRecord, rules.applyToContact);
							break;
						}

					}

				}
			}
		}
	}
}

/**
 * this function to check if the contact type from JSON is exists on the current record
 * @param currentContactArray the contact array that linked to the current record
 * @param jsonContactType the contact type that provided from the JSON.
 * 
 */
function isContactExists(currentContactArray, jsonContactType) {
	var contactModel = null;
	for ( var ct in currentContactArray) {
		if (currentContactArray[ct].getPeople().contactType == jsonContactType) {
			contactModel = currentContactArray[ct];
			break;
		}
	}
	return contactModel;

}

/**
 * This function will check the record type if exists in the provided JSON.
 * @param recordJsonObject the record object from the JSON
 * @param capContactObj cap contact Object 
 * @param applyToRecord flag from the JSON to apply the condition on the record
 * @param applyToContact flag from the JSON to apply the condition on the contact
 */
function checkRecordType(recordJsonObject, capContactObj, applyToRecord, applyToContact) {
	for ( var i in recordJsonObject) {
		var count = recordJsonObject[i].count;
		var status = recordJsonObject[i].status;
		var allowed = recordJsonObject[i].allowed;

		var stdConditionType = rules.stdConditionType;
		var stdConditionName = rules.stdConditionName;
		var stdConditionDesc = rules.stdConditionDesc;
		var stdConditionComment = rules.stdConditionComment;

		var recordTypeArray = i.split("/");
		var capTypeModel = aa.cap.getCapTypeModel().getOutput();
		capTypeModel.setGroup(recordTypeArray[0]);
		capTypeModel.setType(recordTypeArray[1]);
		capTypeModel.setSubType(recordTypeArray[2]);
		capTypeModel.setCategory(recordTypeArray[3]);
		var capModel = aa.cap.getCapModel().getOutput();
		capModel.setCapType(capTypeModel);
		capModel.setCapContactModel(capContactObj.getCapContactModel());
		var capIdScriptModelList = aa.cap.getCapIDListByCapModel(capModel).getOutput();
		var conditionCreated = false;
		if (count < capIdScriptModelList.length) {
			for ( var cti in capIdScriptModelList) {
				var itemCap = aa.cap.getCap(capIdScriptModelList[cti].getCapID()).getOutput();
				var itemAppTypeResult = itemCap.getCapType();
				var itemAppTypeString = itemAppTypeResult.toString();
				var capStatus = itemCap.getCapStatus();
				if (itemAppTypeString == i && CheckRelatedRecordsStatus(status, capStatus)) {

					if (applyToContact && capContactObj.getCapContactModel().getRefContactNumber() != null) {
						addContactStdCondition(capContactObj.getCapContactModel().getRefContactNumber(), stdConditionType, stdConditionDesc);
						conditionCreated = true;
					}
					if (applyToRecord) {
						addAppCondition(stdConditionType, "Applied", stdConditionDesc, stdConditionComment, "");
						conditionCreated = true;
					}

					if (conditionCreated)
						break;

				}
			}

		}

	}
}
/**
 * this function to check if the record status exists in the JSON status
 * @param jsonStatus status object from the  JSON.
 * @param recordStatus the record status
 * @returns {Boolean} true if the record status matched in the json status otherwise false.
 */
function CheckRelatedRecordsStatus(jsonStatus, recordStatus) {
	var isMatched = false;
	for ( var s in jsonStatus) {
		if (recordStatus == jsonStatus[s]) {
			isMatched = true;
			break;
		}
	}

	return isMatched;

}

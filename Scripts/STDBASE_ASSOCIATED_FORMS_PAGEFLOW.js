/*

Title : Associated Forms Pageflow (ApplicationSubmitAfter) 
Purpose : Create child records (Associated forms) and copy parent's data into them
Author: Yazan Barghouth 
 
Functional Area : ASA of ACA
 
JSON Example :

{
  "Building/Commercial/Company/amman05": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "formType": "Field",
        "fieldType": "Number",
        "recordType": "Building/Commercial/Company/amman05",
        "fieldName": "Number of Units",
	"postScript": ""
      }
    ]
  }
}

Description:
This script creates Child record(s) with current record as parent,
the relation between parent and child record(s) is AssociatedForms "AssoForm"
if -for current record- there is at least one child (AssociatedForms) then no records is created
assuming this is a -Save For Later / Resume from beginning- case.

Original intention of this script was to copy data from parent to child records,
and since there is another script "STDBASE_COPY_RECORD_DATA" that already does that,
this part was not handled (copy data) in this script instead, use "STDBASE_COPY_RECORD_DATA"
with "usageType": "copyFromParent".

Deleted properties: 
CONTACTS, ASI, ASIT, PARCEL, ADDRESS, RECORDDETAILS, RECORDNAME and OWNER
They are handled using STDBASE_COPY_RECORD_DATA script
 * 
 */

function getScriptText(vScriptName) {
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1)
		servProvCode = arguments[1];
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

// This should be included in all Configurable Scripts
eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
var scriptSuffix = "ASSOCIATED_FORMS_PAGEFLOW";

try {
	var settingsArray = [];

	if (isConfigurableScript(settingsArray, scriptSuffix)) {

		if (!isPublicUser) {
			//reset array, script will not run (it's only for ASA/ACA)
			settingsArray = new settingsArray();
		}

		for (s in settingsArray) {
			var rules = settingsArray[s];

			//Execute PreScript
			var preScript = rules.preScript;
			if (!matches(preScript, null, "")) {
				eval(getScriptText(preScript));
			}

			var fieldValue = null;
			var recordTypesArray = aa.util.newArrayList();

			if (rules.formType.equalsIgnoreCase("Field")) {
				fieldValue = getAppSpecific(rules.fieldName);
			} else if (rules.formType.equalsIgnoreCase("Table")) {
				//[0] table name, [1] field name
				var tmpFieldDesc = rules.fieldName.split("|");

				var asiTables = loadASITable(tmpFieldDesc[0]);
				var typeNamesArray = new Array();
				for (x in asiTables) {
					typeNamesArray.push(asiTables[x][tmpFieldDesc[1]].fieldValue);
				}
				recordTypesArray = fillRecordTypesFromArray(typeNamesArray);
			} else {
				logDebug("**INFO invalid formType: " + rules.formType);
				recordTypesArray = null;
			}

			if (!rules.formType.equalsIgnoreCase("Table")) {
				if (rules.fieldType.equalsIgnoreCase("Number")) {
					var recordType = rules.recordType;
					recordTypesArray = fillRecordTypes(recordType, parseInt(fieldValue));
				} else if (rules.fieldType.equalsIgnoreCase("Type")) {
					recordTypesArray = fillRecordTypes(fieldValue, 1);
				} else {
					logDebug("**INFO invalid fieldType: " + rules.fieldType);
					recordTypesArray = null;
				}
			}// formType!=table

			//prevent recreate if "Save and resume later"
			var allChilds = aa.cap.getChildByMasterID(capId);
			allChilds = allChilds.getOutput();
			for (e in allChilds) {
				var recordParents = aa.cap.getProjectByChildCapID(allChilds[e].getCapID(), "AssoForm", "").getOutput();
				recordParents = recordParents[0].getProjectID();
				if (recordParents.getId() == capId.getId()) {
					logDebug("**INFO assocForm record already created=" + allChilds[e].getCapID());
					recordTypesArray = null;
					break;
				}//same parent -> already created AssoForm record
			}//for all child records

			if (recordTypesArray != null) {
				var recordIDList = aa.cap.batchCreateChildRecords(capId, recordTypesArray, null).getOutput();
			}

			var postScript = rules.postScript;
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		}//for all settings
	}//isConf()
} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

function fillRecordTypesFromArray(recordTypeNamesAry) {
	var tmpTypesArray = aa.util.newArrayList();
	for (g in recordTypeNamesAry) {
		//reuse method fillRecordTypes(), instead of duplicate code
		var tmpAry = fillRecordTypes(recordTypeNamesAry[g], 1);
		tmpTypesArray.add(tmpAry.get(0));
	}
	return tmpTypesArray;
}

function fillRecordTypes(recordType, count) {
	recordType = recordType.split("/");
	var tmpTypesArray = aa.util.newArrayList();

	var capTypeModel = aa.cap.getCapTypeModel().getOutput();
	capTypeModel.setGroup(recordType[0]);
	capTypeModel.setType(recordType[1]);
	capTypeModel.setSubType(recordType[2]);
	capTypeModel.setCategory(recordType[3]);

	for (g = 0; g < count; g++) {
		tmpTypesArray.add(capTypeModel);
	}
	return tmpTypesArray;
}

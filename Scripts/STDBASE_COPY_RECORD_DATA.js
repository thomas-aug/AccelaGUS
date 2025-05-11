/*

Title : Copy Record Data Automation (After)
Purpose : Copy data between parent and child records
Author: Yazan Barghouth

Functional Area :

JSON Example : 
{
  "Marijuana/Combo/Testing Facility/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Copy data between parent and child records",
          "operators": {
            "status":"!="
          }
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Inspections"
          ],
          "status": [
            "Denied"
          ],
          "recordType": "Marijuana/Combo/Testing Facility/Application"
        },
        "action": {
          "usageType": "copyToChild",
          "CONTACTS": [
            "ALL"
          ],
          "ASI": [
            "ALL"
          ],
          "ASIT": [
            "ALL"
          ],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [
          ],
          "Renewal": false,
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [
            "ALL"
          ],
          "keepExistingAPO": false,
          "RECORDDETAILS": false,
          "RECORDNAME": false,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ]
  }
}

- Available "usageType": copyToParent, copyFromParent and copyToChild
- "recordType" can be un-set, if so, all parent/child records from all types will be used
- for items to copy, ex "ASIT", should be in Array: ["type1","type2","..."] values allowed ["ALL"] copy all, a "TYPE" copy this TYPE only, empty array [] don't copy
Notes:
- Pageflow Event, script should be placed onLoad of step-1 / page-1, once only to prevent data duplication
- Copy RECORDDETAILS uses method aa.cap.copyCapDetailInfo() (as is), the method copy some of the fields, not all of them
- Copy RECORDNAME is handled
- Only Following is supported in Pageflow: Contact, APO , LP and Parcel
- Copy Document is not supported in ACA

if(parentCapId != "" && parentCapId !=null ){
	var result = aa.cap.createRenewalCap(parentCapId, capId, true);
}
 *
 */

//CONSTANTS
var TO_PARENT = 1;
var FROM_PARENT = 2;
var TO_CHILD = 3;
var USAGE_TYPES = new Array();
USAGE_TYPES["copyfromparent"] = FROM_PARENT;
USAGE_TYPES["copytoparent"] = TO_PARENT;
USAGE_TYPES["copytochild"] = TO_CHILD;

// this function is added so this script would work on pageflow
function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)
		servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

// This should be included in all Configurable Scripts
eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
var scriptSuffix = "COPY_RECORD_DATA";

try {

	var capIdsArray = null;

	var settingsArray = [];
	if (isConfigurableScript(settingsArray, scriptSuffix)) {

		for (s in settingsArray) {
			var rules = settingsArray[s];

			//Execute PreScript
			var preScript = rules.preScript;
			if (!matches(preScript, null, "")) {
				eval(getScriptText(preScript));
			}
			if (cancelCfgExecution) {
				logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
				cancelCfgExecution = false;
				continue;
			}

			copyRecordData(rules);

			var postScript = rules.postScript;
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		} //for all settings
	} //isConf()
} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

function copyRecordData(rules) {
	var isRenewal = false;
	if (rules.action.hasOwnProperty("Renewal") && String(rules.action.Renewal) != "") {
		isRenewal = rules.action.Renewal;
	}

	if (isRenewal) {
		prepareAppForRenewal();

		/*var partialCapId = getIncompleteCapId();
		var parentCapId = aa.env.getValue("ParentCapID");
		if (typeof parentcapID == undefined || !parentcapID || parentcapID == null || parentcapID == "") {
			logDebug("**WARN " + scriptSuffix + " parentcapID is null or empty, this is NOT a Renewal?");
		} else {
		    //if(isRenewProcess(parentCapId, partialCapId)){
		        var parentcapIDs = parentcapID.toString().split("-");
		        var pID = aa.cap.getCapID(parentcapIDs[0], parentcapIDs[1], parentcapIDs[2]).getOutput();
		        if (pID != null && pID != "") {
		            var result = aa.cap.createRenewalCap(pID, partialCapId, true);
		            if (result.getSuccess()) {
		                //3. Copy key information from parent license to partial cap
		                copyKeyInfo(parentCapId, partialCapId);
		            }
		        }
		    //}
			
		}//parentcapID OK
		*/
	} else {//renewal=true

		//set usageType, toLower() : avoid upper/lower mistakes in JSON
		var usageType = USAGE_TYPES[rules.action.usageType.toLowerCase()];
		capIdsArray = getCapIdsArray(rules.criteria.recordType, usageType, isRenewal);
		if (capIdsArray == null || capIdsArray.length == 0) {
			logDebug("**INFO capIdsArray empty or null, usageType=" + rules.action.usageType);
			return;
		}

		copyContactsLocal(capIdsArray, rules.action.CONTACTS, usageType);
		copyAppSpecificLocal(capIdsArray, rules.action.ASI, usageType);
		copyAppSpecificTableLocal(capIdsArray, rules.action.ASIT, usageType);
		copyAppConditionsLocal(capIdsArray, rules.action.CONDITIONS, usageType);
		copyAppAddressesLocal(capIdsArray, rules.action.ADDRESS, usageType, rules.keepExistingAPO);
		copyAppLPLocal(capIdsArray, rules.action.LICENSEDPROFESSIONALS, usageType);
		copyAssetsLocal(capIdsArray, rules.action.ASSETS, usageType);

		if (rules.action.RECORDNAME) {
			copyRecordNameLocal(capIdsArray, usageType);
		}
		if (rules.action.RECORDDETAILS) {
			copyRecordDetailsLocal(capIdsArray, usageType);
		}
		if (rules.action.PARCEL) {
			copyParcelsLocal(capIdsArray, usageType, rules.action.keepExistingAPO);
		}
		if (rules.action.OWNER) {
			copyOwnerLocal(capIdsArray, usageType, rules.action.keepExistingAPO);
		}
		if (rules.action.ADDITIONALINFO) {
			copyAdditionalInfoLocal(capIdsArray, usageType);
		}
		if (rules.action.EDUCATION) {
			copyEducationLocal(capIdsArray, usageType);
		}
		if (rules.action.CONTEDUCATION) {
			copyContEducationLocal(capIdsArray, usageType);
		}
		if (rules.action.EXAM) {
			copyExamsLocal(capIdsArray, usageType);
		}
		if (rules.action.DOCUMENT) {
			copyDocumentsLocal(capIdsArray, usageType);
		}
	}
}

function getIncompleteCapId() {
	var v_id1 = aa.env.getValue("PermitId1");
	var v_id2 = aa.env.getValue("PermitId2");
	var v_id3 = aa.env.getValue("PermitId3");

	var result = aa.cap.getCapIDModel(v_id1, v_id2, v_id3);
	if (result.getSuccess()) {
		return result.getOutput();
	} else {
		logDebug("ERROR: Failed to get capId: " + result.getErrorMessage());
		return null;
	}
}

function prepareAppForRenewal() {
	var partialCapId = getIncompleteCapId();
	var parentCapId = aa.env.getValue("ParentCapID");

	logDebug("Parent Cap id from environment = " + parentCapId);
	//1. Check to see if license is ready for renew
	if (isRenewProcess(parentCapId, partialCapId)) {
		logDebug("CAPID(" + parentCapId + ") is ready for renew. PartialCap (" + partialCapId + ")");
		//2. Associate partial cap with parent CAP.
		var result = aa.cap.createRenewalCap(parentCapId, partialCapId, true);
		if (result.getSuccess()) {
			//3. Copy key information from parent license to partial cap
			copyKeyInfo(parentCapId, partialCapId);

			//4. Set B1PERMIT.B1_ACCESS_BY_ACA to "Y" for partial CAP to allow that it is searched by ACA user.
			aa.cap.updateAccessByACA(partialCapId, "Y");
		} else {
			logDebug("ERROR: Associate partial cap with parent CAP. " + result.getErrorMessage());
		}
	} else {
		logDebug("This is not renewal process. PartialCapId = " + partialCapId + " ParentCapId = " + parentCapId);
	}
}

function isRenewProcess(parentCapID, partialCapID) {
	//1. Check to see parent CAP ID is null.
	if (parentCapID == null || partialCapID == null || aa.util.instanceOfString(parentCapID)) {
		return false;
	}
	//2. Get CAPModel by PK for partialCAP.
	var result = aa.cap.getCap(partialCapID);
	if (result.getSuccess()) {
		capScriptModel = result.getOutput();
		//2.1. Check to see if it is partial CAP.	
		if (capScriptModel.isCompleteCap()) {
			logDebug("ERROR: It is not partial CAP(" + capScriptModel.getCapID() + ")");
			return false;
		}
	} else {
		logDebug("ERROR: Fail to get CAPModel (" + partialCapID + "): " + result.getErrorMessage());
		return false;
	}
	//3.  Check to see if the renewal was initiated before. 
	result = aa.cap.getProjectByMasterID(parentCapID, "Renewal", "Incomplete");
	if (result.getSuccess()) {
		partialProjects = result.getOutput();
		if (partialProjects != null && partialProjects.length > 0) {
			//Avoid to initiate renewal process multiple times.
			logDebug("Warning: Renewal process was initiated before. ( " + parentCapID + ")");
			return false;
		}

	}
	//4 . Check to see if parent CAP is ready for renew.
	return isReadyRenew(parentCapID);
}

function isReadyRenew(capid) {
	logDebug("isReadyRenew " + capid);
	if (capid == null || aa.util.instanceOfString(capid)) {
		return false;
	}
	b1ExpResult = aa.expiration.getLicensesByCapID(capid)
	if (b1ExpResult.getSuccess()) {
		b1Exp = b1ExpResult.getOutput();
		tmpStatus = b1Exp.getExpStatus();
		logDebug(tmpStatus);
		tmpDate = b1Exp.getExpDate();
		if (tmpDate) {
			b1ExpDate = tmpDate.getMonth() + "/" + tmpDate.getDayOfMonth() + "/" + tmpDate.getYear();
			logDebug(b1ExpDate);
		}
	} else {
		logDebug("Error getting expiration info " + b1ExpResult.getErrorMessage());
	}
	var result = aa.expiration.isExpiredLicenses(capid);
	if (result.getSuccess()) {
		return true;
	} else {
		logDebug("ERROR: Failed to get expiration with CAP(" + capid + "): " + result.getErrorMessage());
	}
	return false;
}

function copyKeyInfo(srcCapId, targetCapId) {
	copyAppSpecificInfoForLic(srcCapId, targetCapId);
	copyAddressForLic(srcCapId, targetCapId);
	copyAppSpecificTableForLic(srcCapId, targetCapId);
	copyParcelForLic(srcCapId, targetCapId);
	copyPeopleForLic(srcCapId, targetCapId);
	copyLicenseProfessionalForLic(srcCapId, targetCapId);
	copyOwnerForLic(srcCapId, targetCapId);
	copyCapConditionForLic(srcCapId, targetCapId);
	copyAdditionalInfoForLic(srcCapId, targetCapId);
	if (vEventName == "ConvertToRealCapAfter") {
		copyEducation(srcCapId, targetCapId);
		copyContEducation(srcCapId, targetCapId);
		copyExamination(srcCapId, targetCapId);
		var currentUserID = aa.env.getValue("CurrentUserID");
		copyRenewCapDocument(srcCapId, targetCapId, currentUserID);
	}
}

/**
 * Copy Contacts from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyTypes ALL or a bar separated values (group names, or types)
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyContactsLocal(capIdsArray, copyTypes, copyDirection) {
	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyContactsLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		copyTypes = getCopyTypesArray(copyTypes);
		//handle ("" means don't copy)
		if (copyTypes != null && copyTypes.length == 0) {
			return;
		}

		//ACA PageFlow/ FROM_PARENT
		if (controlString.equalsIgnoreCase("Pageflow") && copyDirection == FROM_PARENT) {
			var currCapModel = aa.env.getValue('CapModel');
			copyContactFromParent4ACA(currCapModel, srcDestArray["src"], copyTypes);
			//copy from 1st parent only (other will just overwrite)
			return;
		}

		if (copyTypes == null) {
			copyContacts(srcDestArray["src"], srcDestArray["dest"]);
		} else {
			for (cd in copyTypes) {
				copyContactsByType(srcDestArray["src"], srcDestArray["dest"], copyTypes[cd]);
			}
		}

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}

/**
 * Copy ASI from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyTypes all or a bar separated values (group names, or types)
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyAppSpecificLocal(capIdsArray, copyTypes, copyDirection) {
	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);
		if (!srcDestArray) {
			logDebug("**INFO: copyAppSpecificLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		copyTypes = getCopyTypesArray(copyTypes);
		//handle ("" means don't copy)
		if (copyTypes != null && copyTypes.length == 0) {
			return;
		}

		//ACA PageFlow/ FROM_PARENT
		if (controlString.equalsIgnoreCase("Pageflow") && copyDirection == FROM_PARENT) {
			var currCapModel = aa.env.getValue('CapModel');
			copyASIFromParent4ACA(currCapModel, srcDestArray["src"], copyTypes);
			//copy from 1st parent only (other will just overwrite)
			return;
		}

		copyAppSpecificByType(srcDestArray["src"], srcDestArray["dest"], copyTypes);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy ASIT from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyTypes all or a bar separated values (group names, or types)
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyAppSpecificTableLocal(capIdsArray, copyTypes, copyDirection) {
	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyAppSpecificTableLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		copyTypes = getCopyTypesArray(copyTypes);
		//handle ("" means don't copy)
		if (copyTypes != null && copyTypes.length == 0) {
			return;
		}

		//ACA PageFlow/ FROM_PARENT
		if (controlString.equalsIgnoreCase("Pageflow") && copyDirection == FROM_PARENT) {
			var currCapModel = aa.env.getValue('CapModel');
			copyAsitFromParent4ACA(currCapModel, srcDestArray["src"], copyTypes);
			//copy from 1st parent only (other will just overwrite)
			return;
		}

		copyASITablesByType(srcDestArray["src"], srcDestArray["dest"], copyTypes);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Conditions from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyTypes all or a bar separated values (group names, or types)
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyAppConditionsLocal(capIdsArray, copyTypes, copyDirection) {

	//This Portlet is not supported in Pageflow
	if (controlString.equalsIgnoreCase("Pageflow")) {
		return;
	}

	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyAppConditionsLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		copyTypes = getCopyTypesArray(copyTypes);
		//handle ("" means don't copy)
		if (copyTypes != null && copyTypes.length == 0) {
			return;
		}

		copyConditionsByType(srcDestArray["src"], srcDestArray["dest"], copyTypes);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Addresses from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyTypes all or a bar separated values (group names, or types)
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyAppAddressesLocal(capIdsArray, copyTypes, copyDirection, keepExistingAPO) {
	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyAppAddressesLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		copyTypes = getCopyTypesArray(copyTypes);
		//handle ("" means don't copy)
		if (copyTypes != null && copyTypes.length == 0) {
			return;
		}

		//delete existing
		deleteExistingAPO(srcDestArray["dest"], keepExistingAPO, "A");

		//ACA PageFlow/ FROM_PARENT
		if (controlString.equalsIgnoreCase("Pageflow") && copyDirection == FROM_PARENT) {
			var currCapModel = aa.env.getValue('CapModel');
			copyAddressFromParent4ACA(currCapModel, srcDestArray["src"], copyTypes);
			//copy from 1st parent only (other will just overwrite)
			return;
		}

		copyAddressesByType(srcDestArray["src"], srcDestArray["dest"], copyTypes);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Licensed Professionals from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyTypes all or a bar separated values (group names, or types)
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyAppLPLocal(capIdsArray, copyTypes, copyDirection) {

	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyAppLPLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		copyTypes = getCopyTypesArray(copyTypes);
		//handle ("" means don't copy)
		if (copyTypes != null && copyTypes.length == 0) {
			return;
		}

		if (controlString.equalsIgnoreCase("Pageflow")) {
			var currCapModel = aa.env.getValue('CapModel');
			copyLPFromParent4ACA(currCapModel, srcDestArray["src"], copyTypes);
			return;
		}

		copyLicensedProfByType(srcDestArray["src"], srcDestArray["dest"], copyTypes);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Assets from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyTypes all or a bar separated values (group names, or types)
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyAssetsLocal(capIdsArray, copyTypes, copyDirection) {
	//This Portlet is not supported in Pageflow
	if (controlString.equalsIgnoreCase("Pageflow")) {
		return;
	}
	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyAssetsLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		copyTypes = getCopyTypesArray(copyTypes);
		//handle ("" means don't copy)
		if (copyTypes != null && copyTypes.length == 0) {
			return;
		}
		copyAssetsByType(srcDestArray["src"], srcDestArray["dest"], copyTypes);
		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Parcels from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyParcelsLocal(capIdsArray, copyDirection, keepExistingAPO) {

	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyParcelsLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		//delete existing
		deleteExistingAPO(srcDestArray["dest"], keepExistingAPO, "P");

		//ACA PageFlow/ FROM_PARENT
		if (controlString.equalsIgnoreCase("Pageflow") && copyDirection == FROM_PARENT) {
			var currCapModel = aa.env.getValue('CapModel');
			copyParcelsFromParent4ACA(currCapModel, srcDestArray["src"]);

			//copy from 1st parent only (other will just overwrite)
			return;
		}

		copyParcels(srcDestArray["src"], srcDestArray["dest"]);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Owner from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyOwnerLocal(capIdsArray, copyDirection, keepExistingAPO) {
	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyOwnerLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		//delete existing
		deleteExistingAPO(srcDestArray["dest"], keepExistingAPO, "O");

		//ACA PageFlow/ FROM_PARENT
		if (controlString.equalsIgnoreCase("Pageflow") && copyDirection == FROM_PARENT) {
			var currCapModel = aa.env.getValue('CapModel');
			copyOwnersFromParent4ACA(currCapModel, srcDestArray["src"]);
			//copy from 1st parent only (other will just overwrite)
			return;
		}

		copyOwner(srcDestArray["src"], srcDestArray["dest"]);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Education from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyEducationLocal(capIdsArray, copyDirection) {

	//This Portlet is not supported in Pageflow
	if (controlString.equalsIgnoreCase("Pageflow")) {
		return;
	}

	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyEducationLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		var cr = aa.education.copyEducationList(srcDestArray["src"], srcDestArray["dest"]);

		if (!cr.getSuccess()) {
			logDebug("**INFO: copyEducationLocal(): failed: " + cr.getErrorMessage());
		}
		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Exams from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyExamsLocal(capIdsArray, copyDirection) {

	//This Portlet is not supported in Pageflow
	if (controlString.equalsIgnoreCase("Pageflow")) {
		return;
	}
	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyExamsLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		var cr = aa.examination.copyExaminationList(srcDestArray["src"], srcDestArray["dest"]);

		if (!cr.getSuccess()) {
			logDebug("**INFO: copyExamsLocal(): failed: " + cr.getErrorMessage());
		}
		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Documents from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyDocumentsLocal(capIdsArray, copyDirection) {

	//This Portlet is not supported in Pageflow
	if (controlString.equalsIgnoreCase("Pageflow")) {
		return;
	}
	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		if (!srcDestArray) {
			logDebug("**INFO: copyDocumentsLocal(): Invalid usageType: " + copyDirection);
			return false;
		}

		if (controlString == "ConvertToRealCAPAfter" && copyDirection == FROM_PARENT) {
			copyDocumentFromParent4ACA(srcDestArray["src"]);
			return;
		} else {
			aa.cap.copyRenewCapDocument(srcDestArray["src"], srcDestArray["dest"], aa.getAuditID());
		}

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Additional Info from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyAdditionalInfoLocal(capIdsArray, copyDirection) {

	//This Portlet is not supported in Pageflow
	if (controlString.equalsIgnoreCase("Pageflow")) {
		return;
	}

	for (ca in capIdsArray) {
		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		var adFrom = aa.cap.getBValuatn4AddtInfo(srcDestArray["src"]);
		if (!adFrom.getSuccess()) {
			logDebug("**INFO: copyAdditionalInfoLocal(): failed: " + adFrom.getErrorMessage());
			return false;
		}
		adFrom = adFrom.getOutput();
		var valueTnFrom = adFrom.getbValuatn();

		var cdFrom = aa.cap.getCapDetail(srcDestArray["src"]);
		if (!cdFrom.getSuccess()) {
			logDebug("**INFO: copyAdditionalInfoLocal(): failed: " + cdFrom.getErrorMessage());
			return false;
		}
		cdFrom = cdFrom.getOutput();

		var adTo = aa.cap.getBValuatn4AddtInfo(srcDestArray["dest"]);
		if (!adTo.getSuccess()) {
			logDebug("**INFO: copyAdditionalInfoLocal(): failed: " + adTo.getErrorMessage());
			return false;
		}
		adTo = adTo.getOutput();
		var valueTnTo = adTo.getbValuatn();

		var cdTo = aa.cap.getCapDetail(srcDestArray["dest"]);
		if (!cdTo.getSuccess()) {
			logDebug("**INFO: copyAdditionalInfoLocal(): failed: " + cdTo.getErrorMessage());
			return false;
		}
		cdTo = cdTo.getOutput();

		adTo.setFeeFactorFlag(adFrom.getFeeFactorFlag());
		adTo.setEstimatedValue(adFrom.getEstimatedValue());
		adTo.setValuationPeriod(adFrom.getValuationPeriod());
		adTo.setCalculatedValue(adFrom.getCalculatedValue());
		adTo.setPlanCheckValue(adFrom.getPlanCheckValue());

		adTo.getbValuatn().setFeeFactorFlag(valueTnFrom.getFeeFactorFlag());
		adTo.getbValuatn().setEstimatedValue(valueTnFrom.getEstimatedValue());
		adTo.getbValuatn().setValuationPeriod(valueTnFrom.getValuationPeriod());
		adTo.getbValuatn().setCalculatedValue(valueTnFrom.getCalculatedValue());
		adTo.getbValuatn().setPlanCheckValue(valueTnFrom.getPlanCheckValue());

		cdTo.setHouseCount(cdFrom.getHouseCount());
		cdTo.setConstTypeCode(cdFrom.getConstTypeCode());
		cdTo.setBuildingCount(cdFrom.getBuildingCount());
		cdTo.setPublicOwned(cdFrom.getPublicOwned());

		aa.cap.editAddtInfo(cdTo, adTo);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Record Details from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyRecordDetailsLocal(capIdsArray, copyDirection) {

	//This Portlet is not supported in Pageflow
	if (controlString.equalsIgnoreCase("Pageflow")) {
		return;
	}

	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		aa.cap.copyCapDetailInfo(srcDestArray["src"], srcDestArray["dest"]);

		//for Description Field
		aa.cap.copyCapWorkDesInfo(srcDestArray["src"], srcDestArray["dest"]);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
/**
 * Copy Continuing Education from Current record to Parent or Child records, Or from Parent to Current Record, based on copyDirection parameter
 * @param capIdsArray array of Parent or Child CapIdModel
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns {Boolean} true if success, false otherwise
 */
function copyContEducationLocal(capIdsArray, copyDirection) {

	//This Portlet is not supported in Pageflow
	if (controlString.equalsIgnoreCase("Pageflow")) {
		return;
	}
	for (ca in capIdsArray) {

		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		aa.continuingEducation.copyContEducationList(srcDestArray["src"], srcDestArray["dest"]);

		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}
function copyRecordNameLocal(capIdsArray, copyDirection) {

	//This Portlet is not supported in Pageflow
	if (controlString.equalsIgnoreCase("Pageflow")) {
		return;
	}

	for (ca in capIdsArray) {
		var srcDestArray = getCopySrcDest(capId, capIdsArray[ca], copyDirection);

		var fromCapModel = aa.cap.getCapByPK(srcDestArray["src"], true);
		if (fromCapModel.getSuccess()) {
			fromCapModel = fromCapModel.getOutput();

			var toCapModel = aa.cap.getCapByPK(srcDestArray["dest"], true);
			if (toCapModel.getSuccess()) {
				toCapModel = toCapModel.getOutput();
				toCapModel.setSpecialText(fromCapModel.getSpecialText());
				aa.cap.editCapByPK(toCapModel).getSuccess();
			}
		}
		//copy from 1st parent only (other will just overwrite)
		if (copyDirection == FROM_PARENT) {
			return true;
		}
	} //for all capIdsArray
	return true;
}

/**
 * get a list of Parent or Child records related to Current capId.<br>- Child or Parent is determined by copyDirection parameter
 * @param recordType get Caps of this type only, null or empty means ANY
 * @param copyDirection Number: TO_PARENT = 1, FROM_PARENT = 2, TO_CHILD = 3
 * @returns array of CapIdModel
 */
function getCapIdsArray(recordType, copyDirection, isRenewal) {
	var capIdsArray = null;
	if ((recordType == null || recordType.equals("")) && copyDirection == FROM_PARENT) {
		logDebug("**INFO recordType=null && FROM_PARENT, abort");
		return new Array();
	}

	if (controlString == "Pageflow" && (copyDirection == FROM_PARENT || copyDirection == TO_PARENT)) {
		var myParentCapID = null;

		if (isRenewal) {
			myParentCapID = getParentCapID4Renewal()
		} else {
			myParentCapID = getParentCapId4ACA(capId);
		}

		if (myParentCapID == null) {
			logDebug("**INFO could not get parent CAP-ID for: " + capId);
			return new Array();
		}

		capIdsArray = new Array();
		capIdsArray.push(myParentCapID);
		return capIdsArray;
	}

	if (controlString == "ConvertToRealCAPAfter" && (copyDirection == FROM_PARENT || copyDirection == TO_PARENT)) {

		if (isRenewal) {
			capIdsArray = new Array();
			var tmpParentId = getParentCapID4Renewal();
			if (tmpParentId)
				capIdsArray.push(tmpParentId);
			return capIdsArray;
		}

		var myParentCapID = aa.env.getValue("ParentCapID"); //getParentByCapId(capId);
		if (myParentCapID == null || myParentCapID == "") {
			logDebug("**INFO could not get parent CAP-ID for: " + capId);
			return new Array();
		}

		capIdsArray = new Array();
		capIdsArray.push(myParentCapID);
		return capIdsArray;
	}

	if (copyDirection == TO_PARENT || copyDirection == FROM_PARENT) {
		if (isRenewal) {
			capIdsArray = new Array();
			var tmpParentId = getParentCapID4Renewal();
			if (tmpParentId)
				capIdsArray.push(tmpParentId);
			return capIdsArray;
		}

		if (recordType == null || recordType.equals("")) {
			capIdsArray = getParents();
		} else {
			capIdsArray = getParents(recordType);
		}

	} else if (copyDirection == TO_CHILD) {
		capIdsArray = getChilds(recordType);
	}

	if (!capIdsArray || capIdsArray == null) {
		capIdsArray = new Array();
	}
	return capIdsArray;
}
/**
 * get list of Child records, related to Current capId
 * @param recordType
 * @returns array of CapIdModel
 */
function getChilds(recordType) {
	var caps = aa.cap.getChildByMasterID(capId);
	if (caps.getSuccess()) {
		caps = caps.getOutput();
	} else {
		logDebug("**INFO: getChilds returned an error: " + caps.getErrorMessage());
		return null;
	}

	if (!caps.length) {
		logDebug("**INFO: getChilds function found no children");
		return null
	}

	var recordTypeArray = null;
	var resultArray = new Array();

	for (c in caps) {
		//All
		if (recordType == null || recordType.equals("")) {
			resultArray.push(caps[c].getCapID());
		} else if (caps[c].getCapType().toString().equals(recordType)) {
			resultArray.push(caps[c].getCapID());
		} //recordTypeArray !null
	} //for all childs
	return resultArray;
}
/**
 * puts capId1 and capId2 in an array ["src"], ["dest"] based on copyDirection
 * @param capId1 CapID of current record
 * @param capId2 CapID of Other record
 * @param copyDirection Number, TO_PARENT=1, FROM_PARENT=2 and TO_CHILD=3
 * @returns Associative array ["src"], ["dest"], or false if copyDirection not supported
 */
function getCopySrcDest(capId1, capId2, copyDirection) {
	var srcDestArr = new Array();
	if (copyDirection == TO_PARENT || copyDirection == TO_CHILD) {
		srcDestArr["src"] = capId1;
		srcDestArr["dest"] = capId2;
	} else if (copyDirection == FROM_PARENT) {
		srcDestArr["src"] = capId2;
		srcDestArr["dest"] = capId1;
	} else {
		return false;
	}
	return srcDestArr;
}
/**
 *
 * @param copyTypes {Array} have "ALL" Or types/group names
 * @returns null, if copyTypes length=1 and copyTypes[0] equals "ALL", otherwise, returns same array
 */
function getCopyTypesArray(copyTypes) {
	if (copyTypes && copyTypes != null && copyTypes != "" && copyTypes.length > 0 && copyTypes[0].equalsIgnoreCase("all")) {
		return null;
	} else if (copyTypes == null || copyTypes == "") {
		return new Array();
	} else {
		return copyTypes;
	}
}
///ACA (PageFlow) METHODS-----------------------

function copyDocumentFromParent4ACA(parentCapId) {
	var capDocumentList = aa.document.getDocumentListByEntity(String(parentCapId), "CAP").getOutput();
	if (capDocumentList == null || capDocumentList.size() == 0) {
		return;
	}
	copyAssosiateFormDocuments(capDocumentList, capId);
}

function copyAssosiateFormDocuments(documentList, toCapIDModel) {
	var edmsPolicyModel = aa.proxyInvoker.newInstance("com.accela.aa.policy.policy.EdmsPolicyModel").getOutput();
	var documentBusiness = aa.proxyInvoker.newInstance("com.accela.aa.ads.ads.DocumentBusiness").getOutput();
	if (documentList != null && documentList.size() > 0) {
		for (var i = 0; i < documentList.size(); i++) {
			var documentModel = documentList.get(i);
			var documentContentModel = documentBusiness.getDocumentContent(aa.getServiceProviderCode(), documentModel.getDocumentNo());
			documentModel.setEntityID(toCapIDModel.getID1() + "-" + toCapIDModel.getID2() + "-" + toCapIDModel.getID3());
			documentModel.setEntityType("CAP");
			documentModel.setDocumentContent(documentContentModel);
			var documenta = aa.document.createDocument(documentModel);
			if (documentModel.getDocumentContent() != null && documentModel.getDocumentContent().getDocInputStream() != null) {
				documentModel.getDocumentContent().getDocInputStream().close();
			}
		}
		for (var i = 0; i < documentList.size(); i++) {
			var clearModel = documentList.get(i);
			if (clearModel.getDocumentContent() != null) {
				clearModel.setDocumentContent(null);
			}
		}
	}
}

function copyAddressFromParent4ACA(currentRecordCapModel, parentCapId, typesArray) {

	var capAddressResult = aa.address.getAddressWithAttributeByCapId(parentCapId).getOutput();
	if (capAddressResult == null || capAddressResult.length == 0) {
		return;
	}

	var adrr = getPrimaryOrAddressByType(capAddressResult, typesArray);
	if (adrr != null) {
		currentRecordCapModel.setAddressModel(adrr);
	}
}
function getPrimaryOrAddressByType(addresses, typesArray) {
	var ourTypeAddress = null;

	for (a in addresses) {
		if (typesArray != null && arrayContainsValue(typesArray, addresses[a].getAddressType()) && addresses[a].getPrimaryFlag() == "Y") {
			return addresses[a];
		} else if (typesArray == null && addresses[a].getPrimaryFlag() == "Y") {
			return addresses[a];
		} else if (typesArray != null && arrayContainsValue(typesArray, addresses[a].getAddressType()) && ourTypeAddress == null) {
			ourTypeAddress = addresses[a];
		} else if (typesArray == null && ourTypeAddress == null) {
			ourTypeAddress = addresses[a];
		}
	} //for

	return ourTypeAddress;
}
function copyParcelsFromParent4ACA(currentRecordCapModel, parentCapId) {

	//assume primary parcel is at index=0
	var primaryIndex = 0;

	var capParcelResult = aa.parcel.getParcelandAttribute(parentCapId, null).getOutput();

	if (capParcelResult == null || capParcelResult.size() == 0) {
		return;
	}

	for (var i = 0; i < capParcelResult.size(); i++) {

		if (capParcelResult.get(i).getPrimaryParcelFlag() == "Y") {
			primaryIndex = i;
			break;
		}
	} //for all parcels

	var capParcel = aa.parcel.getCapParcelModel().getOutput();
	capParcel.setParcelModel(capParcelResult.get(primaryIndex));
	currentRecordCapModel.setParcelModel(capParcel);
}

function copyOwnersFromParent4ACA(currentRecordCapModel, parentCapId) {
	var owners = aa.owner.getOwnerByCapId(parentCapId).getOutput();
	if (owners.length > 0) {
		currentRecordCapModel.setOwnerModel(owners[0].getCapOwnerModel());
	}
}

function copyLPFromParent4ACA(currentRecordCapModel, parentCapId, typesArray) {

	if (currentRecordCapModel.getLicenseProfessionalList() == null) {
		currentRecordCapModel.setLicenseProfessionalList(aa.util.newArrayList());
	}
	if (currentRecordCapModel.getLicenseProfessionalList().size() > 0) {
		return;
	}

	var t = aa.licenseProfessional.getLicenseProf(parentCapId);
	if (t.getSuccess()) {
		t = t.getOutput();

		for (lp in t) {
			if (typesArray != null && !arrayContainsValue(typesArray, t[lp].getLicenseProfessionalModel().getLicenseType())) {
				continue;
			}

			var newLicenseModel = t[lp].getLicenseProfessionalModel();
			newLicenseModel.setComponentName(null);
			newLicenseModel.setCapID(null);
			newLicenseModel.setAgencyCode(aa.getServiceProviderCode());
			newLicenseModel.setAuditID(aa.getAuditID());
			currentRecordCapModel.getLicenseProfessionalList().add(newLicenseModel);

			return;
		}
	}
}

function copyContactFromParent4ACA(currentRecordCapModel, parentCapId, typesArray) {
	contactsGroup = currentRecordCapModel.getContactsGroup();
	if (contactsGroup.size() > 0) {
		return;
	}
	var t = aa.people.getCapContactByCapID(parentCapId);
	if (t.getSuccess()) {
		capPeopleArr = t.getOutput();
		for (cp in capPeopleArr) {
			if (typesArray != null && !arrayContainsValue(typesArray, capPeopleArr[cp].getCapContactModel().getPeople().getContactType())) {
				continue;
			}
			capPeopleArr[cp].getCapContactModel().setCapID(null);
			//contactsGroup.add(capPeopleArr[cp].getCapContactModel());
			contactAddFromUser4ACA(currentRecordCapModel, capPeopleArr[cp].getCapContactModel());
			return;
		} //for all contacts from parent
	} //get paretn contacts success
}

function contactAddFromUser4ACA(capModel, contactModel) {
	var theContact = contactModel.getPeople();
	var capContactModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();
	capContactModel.setContactType(theContact.getContactType());
	capContactModel.setFirstName(theContact.getFirstName());
	capContactModel.setMiddleName(theContact.getMiddleName());
	capContactModel.setLastName(theContact.getLastName());
	capContactModel.setFullName(theContact.getFullName());
	capContactModel.setEmail(theContact.getEmail());
	capContactModel.setPhone2(theContact.getPhone2());
	capContactModel.setPhone1CountryCode(theContact.getPhone1CountryCode());
	capContactModel.setPhone2CountryCode(theContact.getPhone2CountryCode());
	capContactModel.setPhone3CountryCode(theContact.getPhone3CountryCode());
	capContactModel.setCompactAddress(theContact.getCompactAddress());
	capContactModel.sePreferredChannele(theContact.getPreferredChannel()); // Preferred Channel is used for 'Particiapnt Type' in ePermits. Yes, the function itself is misspelled, just use it like this.
	capContactModel.setPeople(theContact);
	var birthDate = theContact.getBirthDate();
	if (birthDate != null && birthDate != "") {
		capContactModel.setBirthDate(aa.util.parseDate(birthDate));
	}
	var peopleAttributes = aa.people.getPeopleAttributeByPeople(theContact.getContactSeqNumber(), theContact.getContactType()).getOutput();
	if (peopleAttributes) {
		var newPeopleAttributes = aa.util.newArrayList();
		for ( var i in peopleAttributes) {
			newPeopleAttributes.add(peopleAttributes[i].getPeopleAttributeModel())
		}
		capContactModel.getPeople().setAttributes(newPeopleAttributes)
	}
	capModel.getContactsGroup().add(capContactModel);

}

function copyASIFromParent4ACA(currentRecordCapModel, parentCapId, typesArray) {
	var asiGroups = currentRecordCapModel.getAppSpecificInfoGroups();
	var asiArray = new Array();
	loadAppSpecific4ACA(asiArray, parentCapId);
	setFieldValue(asiArray, asiGroups, typesArray);
}

function copyAsitFromParent4ACA(currentRecordCapModel, parentCapId, typesArray) {
	var currentRecordAsitGroups = capModel.getAppSpecificTableGroupModel();

	if (currentRecordAsitGroups == null || currentRecordAsitGroups.getTablesMap() == null) {
		return;
	}

	var ta = currentRecordAsitGroups.getTablesMap().values();
	var tai = ta.iterator();
	while (tai.hasNext()) {
		var tsm = tai.next();
		var tableName = "" + tsm.getTableName().toString();
		if (typesArray != null && !arrayContainsValue(typesArray, tableName)) {
			continue;
		}
		var asitArray = loadASITable(tableName, parentCapId);
		currentRecordAsitGroups = addASITable4ACAPageFlowCamp(currentRecordAsitGroups, tableName, asitArray, capModel.getCapID());
	}
}

function setFieldValue(asiValuesArray, asiGroups, typesArray) {
	if (asiGroups == null) {
		return false;
	}
	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		if (typesArray != null && !arrayContainsValue(typesArray, group.getGroupName())) {
			continue;
		}
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				field.setChecklistComment(asiValuesArray[field.getCheckboxDesc()]);
			}
		}
	} //for all groups
	return true;
}

function addASITable4ACAPageFlowCamp(destinationTableGroupModel, tableName, tableValueArray) {
	var itemCap = capId
	if (arguments.length > 3)
		itemCap = arguments[3];

	if (destinationTableGroupModel == null || destinationTableGroupModel.getTablesMap() == null) {
		return;
	}

	var ta = destinationTableGroupModel.getTablesMap().values();
	var tai = ta.iterator();

	var found = false;
	while (tai.hasNext()) {
		var tsm = tai.next();
		if (tsm.getTableName().equals(tableName)) {
			if (tsm.getTableFields() != null && tsm.getTableFields().size() > 0) {
				return destinationTableGroupModel;
			}
			found = true;
			break;
		}
	}

	if (!found) {
		logDebug("cannot update asit for ACA, no matching table name");
		return false;
	}

	var i = -1;
	if (tsm.getTableFields() != null) {
		i = 0 - tsm.getTableFields().size()
	}

	for (thisrow in tableValueArray) {
		var fld = aa.util.newArrayList();
		var fld_readonly = aa.util.newArrayList();
		var col = tsm.getColumns()
		var coli = col.iterator();
		while (coli.hasNext()) {
			var colname = coli.next();
			if (!tableValueArray[thisrow][colname.getColumnName()]) {
				logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
				tableValueArray[thisrow][colname.getColumnName()] = "";
			}

			if (typeof (tableValueArray[thisrow][colname.getColumnName()].fieldValue) != "undefined") {
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()].fieldValue ? tableValueArray[thisrow][colname.getColumnName()].fieldValue : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(tableValueArray[thisrow][colname.getColumnName()].readOnly.equals("Y"));
				fld.add(fldToAdd);
				fld_readonly.add(tableValueArray[thisrow][colname.getColumnName()].readOnly);

			} else {
				var args = new Array(tableValueArray[thisrow][colname.getColumnName()] ? tableValueArray[thisrow][colname.getColumnName()] : "", colname);
				var fldToAdd = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", args).getOutput();
				fldToAdd.setRowIndex(i);
				fldToAdd.setFieldLabel(colname.getColumnName());
				fldToAdd.setFieldGroup(tableName.replace(/ /g, "\+"));
				fldToAdd.setReadOnly(false);
				fld.add(fldToAdd);
				fld_readonly.add("N");
			}
		}
		i--;
		if (tsm.getTableFields() == null) {
			tsm.setTableFields(fld);
		} else {
			tsm.getTableFields().addAll(fld);
		}
		if (tsm.getReadonlyField() == null) {
			tsm.setReadonlyField(fld_readonly);
		} else {
			tsm.getReadonlyField().addAll(fld_readonly);
		}
	}

	tssm = tsm;
	return destinationTableGroupModel;
}
function getParentCapId4ACA(myCapId) {
	var getCapResult = aa.cap.getProjectParents(myCapId, 1);
	if (getCapResult.getSuccess()) {
		var parentArray = getCapResult.getOutput();
		if (parentArray.length) {
			return parentArray[0].getCapModel().getCapID();
		}
	}
	return null;
}

/**
 * Deletes selected component from deleteFromCapId if keepExisting is true,<br/>flag 'keepExisting' is passed and checked in case it's coming from a settings source
 * @param deleteFromCapId capId to delete related APO from
 * @param keepExisting boolean, check if delete required
 * @param whichAPO which component to delete A: address P: Parcel O:Owner
 */
function deleteExistingAPO(deleteFromCapId, keepExisting, whichAPO) {
	if (keepExisting || whichAPO == null || whichAPO == "") {
		return;
	}

	if (whichAPO.equalsIgnoreCase("A")) {
		var addresses = aa.address.getAddressByCapId(deleteFromCapId, null);
		if (addresses.getSuccess()) {
			addresses = addresses.getOutput();
			for (a in addresses) {
				aa.address.removeAddress(deleteFromCapId, addresses[a].getAddressId());
			}
		}
	} else if (whichAPO.equalsIgnoreCase("P")) {
		var pbzns = aa.proxyInvoker.newInstance("com.accela.aa.aamain.parcel.ParcelBusiness").getOutput();
		var capModelDeleteFrom = aa.cap.getCap(deleteFromCapId);
		if (capModelDeleteFrom.getSuccess()) {
			capModelDeleteFrom = capModelDeleteFrom.getOutput();
			capModelDeleteFrom = capModelDeleteFrom.getCapModel();
			pbzns.removeParcel(capModelDeleteFrom);
		}
	} else if (whichAPO.equalsIgnoreCase("O")) {
		var owners = null;
		owners = aa.owner.getOwnerByCapId(deleteFromCapId);
		if (owners.getSuccess()) {
			owners = owners.getOutput();
			for (o in owners) {
				aa.owner.removeCapOwnerModel(owners[o]);
			}
		}
	}
}

//  copyKeyInfo functions
/**
 * Takes in a template for a CapModel and converts it to a real CapModel
 * 
 * @example convert2RealCAP(CapModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapModel}
 *            capModel
 * @returns {CapModel} Returns the real version of the CapModel
 */

function convert2RealCAP(capModel) {
	var originalCAPID = capModel.getCapID().getCustomID();
	var originalCAP = capModel;
	var capWithTemplateResult = aa.cap.getCapWithTemplateAttributes(capModel);
	var capWithTemplate = null;
	if (capWithTemplateResult.getSuccess()) {
		capWithTemplate = capWithTemplateResult.getOutput();
	} else {
		logDebug(capWithTemplateResult.getErrorMessage());
		return null;
	}

	// 2. Convert asi group.
	aa.cap.convertAppSpecificInfoGroups2appSpecificInfos4ACA(capModel);
	if (capModel.getAppSpecificTableGroupModel() != null) {
		aa.cap.convertAppSpecTableField2Value4ACA(capModel);
	}
	// 4. Trigger event before convert to real CAP.
	aa.cap.runEMSEScriptBeforeCreateRealCap(capModel, null);
	// 5. Convert to real CAP.
	convertResult = aa.cap.createRegularCapModel4ACA(capModel, null, false, false);
	if (convertResult.getSuccess()) {
		capModel = convertResult.getOutput();
		logDebug("Commit OK: Convert partial CAP to real CAP successful: " + originalCAPID + " to " + capModel.getCapID().getCustomID());
	} else {
		logDebug(convertResult.getErrorMessage());
		return null;
	}
	// 6. Create template after convert to real CAP.
	aa.cap.createTemplateAttributes(capWithTemplate, capModel);
	// Trigger event after convert to real CAP.
	aa.cap.runEMSEScriptAfterCreateRealCap(capModel, null);
	return capModel;
}

function copyContactAddressToLicProf(contactAddress, licProf) {
	if (contactAddress && licProf) {
		licProf.setAddress1(contactAddress.getAddressLine1());
		licProf.setAddress2(contactAddress.getAddressLine2());
		licProf.setAddress3(contactAddress.getAddressLine3());
		licProf.setCity(contactAddress.getCity());
		licProf.setState(contactAddress.getState());
		licProf.setZip(contactAddress.getZip());
		licProf.getLicenseModel().setCountryCode(contactAddress.getCountryCode());
	}
}

function getAdditionalInfoForLic(capId) {
	bvaluatnScriptModel = null;
	var s_result = aa.cap.getBValuatn4AddtInfo(capId);
	if (s_result.getSuccess()) {
		bvaluatnScriptModel = s_result.getOutput();
		if (bvaluatnScriptModel == null) {
			logDebug("WARNING: no additional info on this CAP:" + capId);
			bvaluatnScriptModel = null;
		}
	} else {
		logDebug("ERROR: Failed to get additional info: " + s_result.getErrorMessage());
		bvaluatnScriptModel = null;
	}
	// Return bvaluatnScriptModel
	return bvaluatnScriptModel;
}

function IsStrInArry(eVal, argArr) {
	for (x in argArr) {
		if (eVal == argArr[x]) {
			return true;
		}
	}
	return false;
}

function getParcelForLic(capId) {
	capParcelArr = null;
	var s_result = aa.parcel.getParcelandAttribute(capId, null);
	if (s_result.getSuccess()) {
		capParcelArr = s_result.getOutput();
		if (capParcelArr == null || capParcelArr.length == 0) {
			logDebug("WARNING: no parcel on this CAP:" + capId);
			capParcelArr = null;
		}
	} else {
		logDebug("ERROR: Failed to parcel: " + s_result.getErrorMessage());
		capParcelArr = null;
	}
	return capParcelArr;
}

function getTableName(capId) {
	var tableName = null;
	var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
	if (result.getSuccess()) {
		tableName = result.getOutput();
		if (tableName != null) {
			return tableName;
		}
	}
	return tableName;
}

function getOwnerForLic(capId) {
	capOwnerArr = null;
	var s_result = aa.owner.getOwnerByCapId(capId);
	if (s_result.getSuccess()) {
		capOwnerArr = s_result.getOutput();
		if (capOwnerArr == null || capOwnerArr.length == 0) {
			logDebug("WARNING: no Owner on this CAP:" + capId);
			capOwnerArr = null;
		}
	} else {
		logDebug("ERROR: Failed to Owner: " + s_result.getErrorMessage());
		capOwnerArr = null;
	}
	return capOwnerArr;
}

function getAddressForLic(capId) {
	capAddresses = null;
	var s_result = aa.address.getAddressByCapId(capId);
	if (s_result.getSuccess()) {
		capAddresses = s_result.getOutput();
		if (capAddresses == null || capAddresses.length == 0) {
			logDebug("WARNING: no addresses on this CAP:" + capId);
			capAddresses = null;
		}
	} else {
		logDebug("ERROR: Failed to address: " + s_result.getErrorMessage());
		capAddresses = null;
	}
	return capAddresses;
}

function getAppSpecificTableForLic(capId, tableName) {
	appSpecificTable = null;
	var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId, tableName);
	if (s_result.getSuccess()) {
		appSpecificTable = s_result.getOutput();
		if (appSpecificTable == null || appSpecificTable.length == 0) {
			logDebug("WARNING: no appSpecificTable on this CAP:" + capId);
			appSpecificTable = null;
		}
	} else {
		logDebug("ERROR: Failed to appSpecificTable: " + s_result.getErrorMessage());
		appSpecificTable = null;
	}
	return appSpecificTable;
}

/**
 * Retrieves people from Cap and copies to the target License
 * 
 * @requires getPeopleForLic(CapIDModel)
 * @example copyPeopleForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {any} srcCapId
 * @param {any} targetCapId
 */

function copyPeopleForLic(srcCapId, targetCapId) {
	//1. Get people with source CAPID.
	var capPeoples = getPeopleForLic(srcCapId);
	if (capPeoples == null || capPeoples.length == 0) {
		return;
	}
	//2. Get people with target CAPID.
	var targetPeople = getPeopleForLic(targetCapId);
	//3. Check to see which people is matched in both source and target.
	for (loopk in capPeoples) {
		sourcePeopleModel = capPeoples[loopk];
		//3.1 Set target CAPID to source people.
		sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
		targetPeopleModel = null;
		//3.2 Check to see if sourcePeople exist.
		if (targetPeople != null && targetPeople.length > 0) {
			for (loop2 in targetPeople) {
				if (isMatchPeople(sourcePeopleModel, targetPeople[loop2])) {
					targetPeopleModel = targetPeople[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched people model.
		if (targetPeopleModel != null) {
			//3.3.1 Copy information from source to target.
			aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());
			//3.3.2 Copy contact address from source to target.
			if (targetPeopleModel.getCapContactModel().getPeople() != null && sourcePeopleModel.getCapContactModel().getPeople()) {
				targetPeopleModel.getCapContactModel().getPeople().setContactAddressList(sourcePeopleModel.getCapContactModel().getPeople().getContactAddressList());
			}

			//3.3.3 Edit People with source People information. 
			aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
		}
		//3.4 It is new People model.
		else {
			//3.4.1 Create new people.
			aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
		}
	}
}

function getPeopleForLic(capId) {
	capPeopleArr = null;
	var s_result = aa.people.getCapContactByCapID(capId);
	if (s_result.getSuccess()) {
		capPeopleArr = s_result.getOutput();
		if (capPeopleArr != null || capPeopleArr.length > 0) {
			for (loopk in capPeopleArr) {
				var capContactScriptModel = capPeopleArr[loopk];
				var capContactModel = capContactScriptModel.getCapContactModel();
				var peopleModel = capContactScriptModel.getPeople();
				var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
				if (contactAddressrs.getSuccess()) {
					var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
					peopleModel.setContactAddressList(contactAddressModelArr);
				}
			}
		}

		else {
			logDebug("WARNING: no People on this CAP:" + capId);
			capPeopleArr = null;
		}
	} else {
		logDebug("ERROR: Failed to People: " + s_result.getErrorMessage());
		capPeopleArr = null;
	}
	return capPeopleArr;
}

function getCapConditionByCapIDForLic(capId) {
	capConditionScriptModels = null;

	var s_result = aa.capCondition.getCapConditions(capId);
	if (s_result.getSuccess()) {
		capConditionScriptModels = s_result.getOutput();
		if (capConditionScriptModels == null || capConditionScriptModels.length == 0) {
			logDebug("WARNING: no cap condition on this CAP:" + capId);
			capConditionScriptModels = null;
		}
	} else {
		logDebug("ERROR: Failed to get cap condition: " + s_result.getErrorMessage());
		capConditionScriptModels = null;
	}
	return capConditionScriptModels;
}

/**
 * Takes in an array of Contact Address Script Models and converts to Contact Address Models
 * 
 * @example convertContactAddressModelArr(AddressScriptModel[]);
 * @memberof INCLUDES_CUSTOM
 * @param {AddressScriptModel[]}
 *            contactAddressScriptModelArr
 * @returns {AddressScriptModel[]} Returns the converted version of the Contact
 *          Address array
 */

function convertContactAddressModelArr(contactAddressScriptModelArr) {
	var contactAddressModelArr = null;
	if (contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0) {
		logDebug(contactAddressScriptModelArr.length + " addresses");
		contactAddressModelArr = aa.util.newArrayList();
		for (loopk in contactAddressScriptModelArr) {
			contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
		}
	}
	return contactAddressModelArr;
}

function getCapDetailByID(capId) {
	capDetailScriptModel = null;
	var s_result = aa.cap.getCapDetail(capId);
	if (s_result.getSuccess()) {
		capDetailScriptModel = s_result.getOutput();
		if (capDetailScriptModel == null) {
			logDebug("WARNING: no cap detail on this CAP:" + capId);
			capDetailScriptModel = null;
		}
	} else {
		logDebug("ERROR: Failed to get cap detail: " + s_result.getErrorMessage());
		capDetailScriptModel = null;
	}
	// Return capDetailScriptModel
	return capDetailScriptModel;
}

function getCAPModel(capIDModel) {
	var capModel = aa.cap.getCapViewBySingle4ACA(capIDModel);
	if (capModel == null) {
		logDebug("Fail to get CAP model: " + capIDModel.toString());
		return null;
	}

	return capModel;
}

/**
 * Converts License Renewal to a real License
 * 
 * @example convertRenewalToReal();
 * @memberof INCLUDES_CUSTOM
 */

function convertRenewalToReal() {
	var sendLicEmails = false;
	logDebug("convertRenewalToReal");
	var capID = getCapId();
	logDebug(capID.getCustomID());
	var partialCapID = getPartialCapID(capID);
	// var result = aa.cap.isRenewalInProgess(capID);
	// if (result.getSuccess()) {
	parentLicenseCAPID = getParentLicenseCapID(capID);
	if (parentLicenseCAPID != null) {
		// 1. Set B1PERMIT.B1_ACCESS_BY_ACA to "N" for partial CAP to not allow
		// that it is searched by ACA user.
		// aa.cap.updateAccessByACA(capID, "N");

		// var parentLicenseCAPID = result.getOutput();
		// 2 . Copy key information from child CAP to parent CAP.
		logDebug("Copying key information from renewal CAP to license CAP");
		copyKeyInfo(capID, parentLicenseCAPID);

		// 3. move renew document to parent cap
		aa.cap.transferRenewCapDocument(partialCapID, parentLicenseCAPID, true);
		logDebug("Transfer document for renew cap. Source Cap: " + partialCapID + ", target Cap:" + parentLicenseCAPID);

		// 4. Send auto-issurance license email to public user
		if (sendLicEmails)
			aa.expiration.sendAutoIssueLicenseEmail(parentLicenseCAPID);
		// logDebug("send auto-issuance license email to citizen user.");
		aa.env.setValue("isAutoIssuanceSuccess", "Yes");
	}
	// else { logDebug("isRenewalInProgress returned error " +
	// result.getErrorMessage()); }
	else {
		logDebug("Parent License Cap ID is null");
	}
}

/**
 * Copies extra information from one License to another License
 * 
 * @requires getAdditionalInfoForLic(CapIDModel)
 * 			 getCapDetailByID(CapIDModel)
 * @example copyAdditionalInfoForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyAdditionalInfoForLic(srcCapId, targetCapId) {
	// 1. Get Additional Information with source CAPID. (BValuatnScriptModel)
	var additionalInfo = getAdditionalInfoForLic(srcCapId);
	if (additionalInfo == null) {
		return;
	}
	// 2. Get CAP detail with source CAPID.
	var capDetail = getCapDetailByID(srcCapId);
	// 3. Set target CAP ID to additional info.
	additionalInfo.setCapID(targetCapId);
	if (capDetail != null) {
		capDetail.setCapID(targetCapId);
	}
	// 4. Edit or create additional infor for target CAP.
	aa.cap.editAddtInfo(capDetail, additionalInfo);
}

// Return BValuatnScriptModel for additional info.

/**
 * Copies the Address from one License to another License
 * 
 * @requires getAddressForLic(CapIDModel)
 * @example copyAdditionalInfoForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyAddressForLic(srcCapId, targetCapId) {
	// 1. Get address with source CAPID.
	var capAddresses = getAddressForLic(srcCapId);
	if (capAddresses == null || capAddresses.length == 0) {
		return;
	}
	// 2. Get addresses with target CAPID.
	var targetAddresses = getAddressForLic(targetCapId);
	// 3. Check to see which address is matched in both source and target.
	for (loopk in capAddresses) {
		sourceAddressfModel = capAddresses[loopk];
		// 3.1 Set target CAPID to source address.
		sourceAddressfModel.setCapID(targetCapId);
		targetAddressfModel = null;
		// 3.2 Check to see if sourceAddress exist.
		if (targetAddresses != null && targetAddresses.length > 0) {
			for (loop2 in targetAddresses) {
				if (isMatchAddress(sourceAddressfModel, targetAddresses[loop2])) {
					targetAddressfModel = targetAddresses[loop2];
					break;
				}
			}
		}
		// 3.3 It is a matched address model.
		if (targetAddressfModel != null) {

			// 3.3.1 Copy information from source to target.
			aa.address.copyAddressModel(sourceAddressfModel, targetAddressfModel);
			// 3.3.2 Edit address with source address information.
			aa.address.editAddressWithAPOAttribute(targetCapId, targetAddressfModel);
		}
		// 3.4 It is new address model.
		else {
			// 3.4.1 Create new address.
			aa.address.createAddressWithAPOAttribute(targetCapId, sourceAddressfModel);
		}
	}
}

/**
 * Copies App Specific Information to a new Cap
 * 
 * @requires editAppSpecific(AppSpecificInfoScriptModel,
 *           AppSpecificInfoScriptModel[], CapModel)
 * @example copyAppSpecificForLic(AppSpecificInfoScriptModel, CapModel);
 * @memberof INCLUDES_CUSTOM
 * @param {AppSpecificInfoScriptModel[]}
 *            AInfo
 * @param {CapModel}
 *            newCap
 */

function copyAppSpecificForLic(AInfo, newCap) // copy all App Specific info
// into new Cap, 1 optional
// parameter for ignoreArr
{
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		ignoreArr = arguments[2];
		limitCopy = true;
	}

	for (asi in AInfo) {
		if (limitCopy) {
			var ignore = false;
			for (var i = 0; i < ignoreArr.length; i++) {
				if (asi.indexOf(ignoreArr[i]) == 0) {
					// if(ignoreArr[i] == asi){
					logDebug("ignoring " + asi);
					ignore = true;
					break;
				}
			}
			if (!ignore)
				editAppSpecific(asi, AInfo[asi], newCap);
		} else
			editAppSpecific(asi, AInfo[asi], newCap);
	}
}

/**
 * Copies App Specific Info to a License
 * 
 * @requires copyAppSpecificForLic(AppSpecificInfoScriptModel, CapModel)
 * @example copyAppSpecificInfoForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyAppSpecificInfoForLic(srcCapId, targetCapId) {
	var ignore = lookup("EMSE:ASI Copy Exceptions", "License/*/*/*");
	logDebug("Ignore = " + ignore);
	var ignoreArr = new Array();
	if (ignore != null)
		ignoreArr = ignore.split("|");
	var AppSpecInfo = new Array();
	useAppSpecificGroupName = true;
	loadAppSpecific(AppSpecInfo, srcCapId);
	copyAppSpecificForLic(AppSpecInfo, targetCapId, ignoreArr);
	useAppSpecificGroupName = false;
}

/**
 * Copies App Specific Table to a License
 * 
 * @requires getAppSpecificTableForLic(CapIDModel, String)
 * @example copyAppSpecificTableForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyAppSpecificTableForLic(srcCapId, targetCapId) {
	var tableNameArray = getTableName(srcCapId);
	var targetTableNameArray = getTableName(targetCapId);
	if (tableNameArray == null) {
		logDebug("tableNameArray is null, returning");
		return;
	}
	for (loopk in tableNameArray) {
		var tableName = tableNameArray[loopk];
		if (IsStrInArry(tableName, targetTableNameArray)) {
			//1. Get appSpecificTableModel with source CAPID
			var sourceAppSpecificTable = getAppSpecificTableForLic(srcCapId, tableName);
			//2. Edit AppSpecificTableInfos with target CAPID
			var srcTableModel = null;
			if (sourceAppSpecificTable == null) {
				logDebug("sourceAppSpecificTable is null");
				return;
			} else {
				srcTableModel = sourceAppSpecificTable.getAppSpecificTableModel();

				tgtTableModelResult = aa.appSpecificTableScript.getAppSpecificTableModel(targetCapId, tableName);
				if (tgtTableModelResult.getSuccess()) {
					tgtTableModel = tgtTableModelResult.getOutput();
					if (tgtTableModel == null) {
						logDebug("target table model is null");
					} else {
						tgtGroupName = tgtTableModel.getGroupName();
						srcTableModel.setGroupName(tgtGroupName);
					}
				} else {
					logDebug("Error getting target table model " + tgtTableModelResult.getErrorMessage());
				}
			}
			editResult = aa.appSpecificTableScript.editAppSpecificTableInfos(srcTableModel, targetCapId, null);
			if (editResult.getSuccess()) {
				logDebug("Successfully editing appSpecificTableInfos");
			} else {
				logDebug("Error editing appSpecificTableInfos " + editResult.getErrorMessage());
			}
		} else {
			logDebug("Table " + tableName + " is not defined on target");
		}
	}

}

/**
 * Retrieves Cap Condition from a License and copies it to another License
 * 
 * @requires getCapConditionByCapIDForLic(CapIDModel)
 * @example copyCapConditionForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyCapConditionForLic(srcCapId, targetCapId) {
	// 1. Get Cap condition with source CAPID.
	var capConditions = getCapConditionByCapIDForLic(srcCapId);
	if (capConditions == null || capConditions.length == 0) {
		return;
	}
	// 2. Get Cap condition with target CAPID.
	var targetCapConditions = getCapConditionByCapIDForLic(targetCapId);
	// 3. Check to see which Cap condition is matched in both source and target.
	for (loopk in capConditions) {
		sourceCapCondition = capConditions[loopk];
		// 3.1 Set target CAPID to source Cap condition.
		sourceCapCondition.setCapID(targetCapId);
		targetCapCondition = null;
		// 3.2 Check to see if source Cap condition exist in target CAP.
		if (targetCapConditions != null && targetCapConditions.length > 0) {
			for (loop2 in targetCapConditions) {
				if (isMatchCapCondition(sourceCapCondition, targetCapConditions[loop2])) {
					targetCapCondition = targetCapConditions[loop2];
					break;
				}
			}
		}
		// 3.3 It is a matched Cap condition model.
		if (targetCapCondition != null) {
			// 3.3.1 Copy information from source to target.
			sourceCapCondition.setConditionNumber(targetCapCondition.getConditionNumber());
			// 3.3.2 Edit Cap condition with source Cap condition information.
			aa.capCondition.editCapCondition(sourceCapCondition);
		}
		// 3.4 It is new Cap condition model.
		else {
			// 3.4.1 Create new Cap condition.
			aa.capCondition.createCapCondition(sourceCapCondition);
		}
	}
}

function getPeople(capId) {
	capPeopleArr = null;
	var s_result = aa.people.getCapContactByCapID(capId);
	if (s_result.getSuccess()) {
		capPeopleArr = s_result.getOutput();
		if (capPeopleArr != null || capPeopleArr.length > 0) {
			for (loopk in capPeopleArr) {
				var capContactScriptModel = capPeopleArr[loopk];
				var capContactModel = capContactScriptModel.getCapContactModel();
				var peopleModel = capContactScriptModel.getPeople();
				var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
				if (contactAddressrs.getSuccess()) {
					var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
					peopleModel.setContactAddressList(contactAddressModelArr);
				}
			}
		}

		else {
			capPeopleArr = null;
		}
	} else {
		logDebug("ERROR: Failed to People: " + s_result.getErrorMessage());
		capPeopleArr = null;
	}
	return capPeopleArr;
}

/**
 * Creates duplicates of Contacts with Addresses and assigns a new Cap ID
 * 
 * @requires getPeople(CapIDModel)
 * @example copyContactsWithAddresses(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            sourceCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyContactsWithAddresses(sourceCapId, targetCapId) {

	var capPeoples = getPeople(sourceCapId);
	if (capPeoples != null && capPeoples.length > 0) {
		for (loopk in capPeoples) {
			sourcePeopleModel = capPeoples[loopk];
			sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
			aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
			logDebug("added contact");
		}
	} else {
		logDebug("No peoples on source");
	}
}

/**
 * Copies education list from one Contact to another Contact
 * 
 * @example copyContEducation(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyContEducation(srcCapId, targetCapId) {
	if (srcCapId != null && targetCapId != null) {
		aa.continuingEducation.copyContEducationList(srcCapId, targetCapId);
	}
}

/**
 * Copies education list from one Cap to another Cap
 * 
 * @example copyEducation(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyEducation(srcCapId, targetCapId) {
	if (srcCapId != null && targetCapId != null) {
		aa.education.copyEducationList(srcCapId, targetCapId);
	}
}

/**
 * Copies examination list from one Cap to another Cap
 * 
 * @example copyExamination(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyExamination(srcCapId, targetCapId) {
	if (srcCapId != null && targetCapId != null) {
		aa.examination.copyExaminationList(srcCapId, targetCapId);
	}
}

/**
 * Copies License Professional from one Cap to another Cap
 * 
 * @requires getLicenseProfessionalForLic(CapIDModel)
 *           isMatchLicenseProfessional(LicenseProfessionalScriptModel,
 *           LicenseProfessionalScriptModel)
 * @example copyLicenseProfessionalForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyLicenseProfessionalForLic(srcCapId, targetCapId) {
	// 1. Get license professionals with source CAPID.
	var capLicenses = getLicenseProfessionalForLic(srcCapId);
	if (capLicenses == null || capLicenses.length == 0) {
		return;
	}
	// 2. Get license professionals with target CAPID.
	var targetLicenses = getLicenseProfessionalForLic(targetCapId);
	// 3. Check to see which licProf is matched in both source and target.
	for (loopk in capLicenses) {
		sourcelicProfModel = capLicenses[loopk];
		// 3.1 Set target CAPID to source lic prof.
		sourcelicProfModel.setCapID(targetCapId);
		targetLicProfModel = null;
		// 3.2 Check to see if sourceLicProf exist.
		if (targetLicenses != null && targetLicenses.length > 0) {
			for (loop2 in targetLicenses) {
				if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2])) {
					targetLicProfModel = targetLicenses[loop2];
					break;
				}
			}
		}
		// 3.3 It is a matched licProf model.
		if (targetLicProfModel != null) {
			// 3.3.1 Copy information from source to target.
			aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
			// 3.3.2 Edit licProf with source licProf information.
			aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
		}
		// 3.4 It is new licProf model.
		else {
			// 3.4.1 Create new license professional.
			aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
		}
	}
}

function getLicenseProfessionalForLic(capId) {
	capLicenseArr = null;
	var s_result = aa.licenseProfessional.getLicenseProf(capId);
	if (s_result.getSuccess()) {
		capLicenseArr = s_result.getOutput();
		if (capLicenseArr == null || capLicenseArr.length == 0) {
			logDebug("WARNING: no licensed professionals on this CAP:" + capId);
			capLicenseArr = null;
		}
	} else {
		logDebug("ERROR: Failed to license professional: " + s_result.getErrorMessage());
		capLicenseArr = null;
	}
	return capLicenseArr;
}
function isMatchAddress(addressScriptModel1, addressScriptModel2) {
	if (addressScriptModel1 == null || addressScriptModel2 == null) {
		return false;
	}
	var streetName1 = addressScriptModel1.getStreetName();
	var streetName2 = addressScriptModel2.getStreetName();
	if ((streetName1 == null && streetName2 != null) || (streetName1 != null && streetName2 == null)) {
		return false;
	}
	if (streetName1 != null && !streetName1.equals(streetName2)) {
		return false;
	}
	return true;
}

function isMatchLicenseProfessional(licProfScriptModel1, licProfScriptModel2) {
	if (licProfScriptModel1 == null || licProfScriptModel2 == null) {
		return false;
	}
	if (licProfScriptModel1.getLicenseType().equals(licProfScriptModel2.getLicenseType()) && licProfScriptModel1.getLicenseNbr().equals(licProfScriptModel2.getLicenseNbr())) {
		return true;
	}
	return false;
}

function isMatchOwner(ownerScriptModel1, ownerScriptModel2) {
	if (ownerScriptModel1 == null || ownerScriptModel2 == null) {
		return false;
	}
	var fullName1 = ownerScriptModel1.getOwnerFullName();
	var fullName2 = ownerScriptModel2.getOwnerFullName();
	if ((fullName1 == null && fullName2 != null) || (fullName1 != null && fullName2 == null)) {
		return false;
	}
	if (fullName1 != null && !fullName1.equals(fullName2)) {
		return false;
	}
	return true;
}

function isMatchParcel(parcelScriptModel1, parcelScriptModel2) {
	if (parcelScriptModel1 == null || parcelScriptModel2 == null) {
		return false;
	}
	if (parcelScriptModel1.getParcelNumber().equals(parcelScriptModel2.getParcelNumber())) {
		return true;
	}
	return false;
}

function isMatchPeople(capContactScriptModel, capContactScriptModel2) {
	if (capContactScriptModel == null || capContactScriptModel2 == null) {
		return false;
	}
	var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
	var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
	var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();
	var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();
	var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();
	var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();
	var fullName1 = capContactScriptModel.getCapContactModel().getPeople().getFullName();
	var fullName2 = capContactScriptModel2.getCapContactModel().getPeople().getFullName();
	if ((contactType1 == null && contactType2 != null) || (contactType1 != null && contactType2 == null)) {
		return false;
	}
	if (contactType1 != null && !contactType1.equals(contactType2)) {
		return false;
	}
	if ((firstName1 == null && firstName2 != null) || (firstName1 != null && firstName2 == null)) {
		return false;
	}
	if (firstName1 != null && !firstName1.equals(firstName2)) {
		return false;
	}
	if ((lastName1 == null && lastName2 != null) || (lastName1 != null && lastName2 == null)) {
		return false;
	}
	if (lastName1 != null && !lastName1.equals(lastName2)) {
		return false;
	}
	if ((fullName1 == null && fullName2 != null) || (fullName1 != null && fullName2 == null)) {
		return false;
	}
	if (fullName1 != null && !fullName1.equals(fullName2)) {
		return false;
	}
	return true;
}

function isMatchCapCondition(capConditionScriptModel1, capConditionScriptModel2) {
	if (capConditionScriptModel1 == null || capConditionScriptModel2 == null) {
		return false;
	}
	var description1 = capConditionScriptModel1.getConditionDescription();
	var description2 = capConditionScriptModel2.getConditionDescription();
	if ((description1 == null && description2 != null) || (description1 != null && description2 == null)) {
		return false;
	}
	if (description1 != null && !description1.equals(description2)) {
		return false;
	}
	var conGroup1 = capConditionScriptModel1.getConditionGroup();
	var conGroup2 = capConditionScriptModel2.getConditionGroup();
	if ((conGroup1 == null && conGroup2 != null) || (conGroup1 != null && conGroup2 == null)) {
		return false;
	}
	if (conGroup1 != null && !conGroup1.equals(conGroup2)) {
		return false;
	}
	return true;
}

/**
 * Copies License Professional from one Cap to another Cap
 * 
 * @requires getLicenseProfessionalForLic(CapIDModel)
 *           isMatchLicenseProfessional(LicenseProfessionalScriptModel,
 *           LicenseProfessionalScriptModel)
 * @example copyLicenseProfessionalForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyLicenseProfessionalForLic(srcCapId, targetCapId) {
	// 1. Get license professionals with source CAPID.
	var capLicenses = getLicenseProfessionalForLic(srcCapId);
	if (capLicenses == null || capLicenses.length == 0) {
		return;
	}
	// 2. Get license professionals with target CAPID.
	var targetLicenses = getLicenseProfessionalForLic(targetCapId);
	// 3. Check to see which licProf is matched in both source and target.
	for (loopk in capLicenses) {
		sourcelicProfModel = capLicenses[loopk];
		// 3.1 Set target CAPID to source lic prof.
		sourcelicProfModel.setCapID(targetCapId);
		targetLicProfModel = null;
		// 3.2 Check to see if sourceLicProf exist.
		if (targetLicenses != null && targetLicenses.length > 0) {
			for (loop2 in targetLicenses) {
				if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2])) {
					targetLicProfModel = targetLicenses[loop2];
					break;
				}
			}
		}
		// 3.3 It is a matched licProf model.
		if (targetLicProfModel != null) {
			// 3.3.1 Copy information from source to target.
			aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
			// 3.3.2 Edit licProf with source licProf information.
			aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
		}
		// 3.4 It is new licProf model.
		else {
			// 3.4.1 Create new license professional.
			aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
		}
	}
}

/**
 * Copies Owner from one License to another License
 * 
 * @requires getOwnerForLic(CapIDModel)
 * @example copyOwnerForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel}
 *            srcCapId
 * @param {CapIDModel}
 *            targetCapId
 */

function copyOwnerForLic(srcCapId, targetCapId) {
	//1. Get Owners with source CAPID.
	var capOwners = getOwnerForLic(srcCapId);
	if (capOwners == null || capOwners.length == 0) {
		return;
	}
	//2. Get Owners with target CAPID.
	var targetOwners = getOwnerForLic(targetCapId);
	//3. Check to see which owner is matched in both source and target.
	for (loopk in capOwners) {
		sourceOwnerModel = capOwners[loopk];
		//3.1 Set target CAPID to source Owner.
		sourceOwnerModel.setCapID(targetCapId);
		targetOwnerModel = null;
		//3.2 Check to see if sourceOwner exist.
		if (targetOwners != null && targetOwners.length > 0) {
			for (loop2 in targetOwners) {
				if (isMatchOwner(sourceOwnerModel, targetOwners[loop2])) {
					targetOwnerModel = targetOwners[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched owner model.
		if (targetOwnerModel != null) {
			//3.3.1 Copy information from source to target.
			aa.owner.copyCapOwnerModel(sourceOwnerModel, targetOwnerModel);
			//3.3.2 Edit owner with source owner information. 
			aa.owner.updateDailyOwnerWithAPOAttribute(targetOwnerModel);
		}
		//3.4 It is new owner model.
		else {
			//3.4.1 Create new Owner.
			aa.owner.createCapOwnerWithAPOAttribute(sourceOwnerModel);
		}
	}
}

/**
 * Retrieves parcels from Cap and copies to the target License
 * 
 * @requires getParcelForLic(CapIDModel)
 * @example copyParcelForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel} srcCapId
 * @param {CapIDModel} targetCapId
 */

function copyParcelForLic(srcCapId, targetCapId) {
	//1. Get parcels with source CAPID.
	var copyParcels = getParcelForLic(srcCapId);
	if (copyParcels == null || copyParcels.length == 0) {
		return;
	}
	//2. Get parcel with target CAPID.
	var targetParcels = getParcelForLic(targetCapId);
	//3. Check to see which parcel is matched in both source and target.
	for (i = 0; i < copyParcels.size(); i++) {
		sourceParcelModel = copyParcels.get(i);
		//3.1 Set target CAPID to source parcel.
		sourceParcelModel.setCapID(targetCapId);
		targetParcelModel = null;
		//3.2 Check to see if sourceParcel exist.
		if (targetParcels != null && targetParcels.size() > 0) {
			for (j = 0; j < targetParcels.size(); j++) {
				if (isMatchParcel(sourceParcelModel, targetParcels.get(j))) {
					targetParcelModel = targetParcels.get(j);
					break;
				}
			}
		}
		//3.3 It is a matched parcel model.
		if (targetParcelModel != null) {
			//3.3.1 Copy information from source to target.
			var tempCapSourceParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, sourceParcelModel).getOutput();
			var tempCapTargetParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, targetParcelModel).getOutput();
			aa.parcel.copyCapParcelModel(tempCapSourceParcel, tempCapTargetParcel);
			//3.3.2 Edit parcel with sourceparcel. 
			aa.parcel.updateDailyParcelWithAPOAttribute(tempCapTargetParcel);
		}
		//3.4 It is new parcel model.
		else {
			//3.4.1 Create new parcel.
			aa.parcel.createCapParcelWithAPOAttribute(aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, sourceParcelModel).getOutput());
		}
	}
}

/**
 * Retrieves people from Cap and copies to the target License
 * 
 * @requires getPeopleForLic(CapIDModel)
 * @example copyPeopleForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {any} srcCapId
 * @param {any} targetCapId
 */

function copyPeopleForLic(srcCapId, targetCapId) {
	//1. Get people with source CAPID.
	var capPeoples = getPeopleForLic(srcCapId);
	if (capPeoples == null || capPeoples.length == 0) {
		return;
	}
	//2. Get people with target CAPID.
	var targetPeople = getPeopleForLic(targetCapId);
	//3. Check to see which people is matched in both source and target.
	for (loopk in capPeoples) {
		sourcePeopleModel = capPeoples[loopk];
		//3.1 Set target CAPID to source people.
		sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
		targetPeopleModel = null;
		//3.2 Check to see if sourcePeople exist.
		if (targetPeople != null && targetPeople.length > 0) {
			for (loop2 in targetPeople) {
				if (isMatchPeople(sourcePeopleModel, targetPeople[loop2])) {
					targetPeopleModel = targetPeople[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched people model.
		if (targetPeopleModel != null) {
			//3.3.1 Copy information from source to target.
			aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());
			//3.3.2 Copy contact address from source to target.
			if (targetPeopleModel.getCapContactModel().getPeople() != null && sourcePeopleModel.getCapContactModel().getPeople()) {
				targetPeopleModel.getCapContactModel().getPeople().setContactAddressList(sourcePeopleModel.getCapContactModel().getPeople().getContactAddressList());
			}

			//3.3.3 Edit People with source People information. 
			aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
		}
		//3.4 It is new People model.
		else {
			//3.4.1 Create new people.
			aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
		}
	}
}

/**
 * Copies Cap Document to another Cap
 * 
 * @example copyPeopleForLic(CapIDModel, CapIDModel);
 * @memberof INCLUDES_CUSTOM
 * @param {CapIDModel} srcCapId
 * @param {CapIDModel} targetCapId
 * @param {String} currentUserID
 */

function copyRenewCapDocument(srcCapId, targetCapId, currentUserID) {
	if (srcCapId != null && targetCapId != null) {
		aa.cap.copyRenewCapDocument(srcCapId, targetCapId, currentUserID);
	}
}

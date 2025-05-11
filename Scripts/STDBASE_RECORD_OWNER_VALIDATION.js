/*

Title : Record Owner Validation (Before All include Pageflow) 
Purpose : A function is needed to validate an owner on a record.
Author: Yazan Barghouth 
 
 Functional Area : Owner 
 
 JSON Example :

{
  "Building/Commercial/Company/amman05": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "To validate an owner on a record",
          "operators": {
            
          }
        },
        "criteria": {
          "duplicateRecordType": [
            {
              "type": "Marijuana/Combo/Testing Facility/License",
              "status": "Approved"
            }
          ],
          "requiredRecordType": [
            {
              "type": "Marijuana/Combo/Testing Facility/License",
              "status": "Approved"
            }
          ],
          "cancelSubmissionFields": [
            {
              "OwnerFullName": "Saba Fakhry"
            },
            {
              "MailZip": "12345"
            }
          ]
        },
        "action": {
          
        },
        "postScript": ""
      }
    ]
  }
}

- Available cancelSubmissionFields options:

	For ACA (ASB):
	MailState, MailCity, MailAddress1, MailAddress2, MailAddress3, MailZip, Phone, OwnerFullName, OwnerFirstName, OwnerMiddleName, OwnerLastName
	
	For ACA Pageflow and Other Events
	State, City, Address1, Address2, Address3, Zip, Country, MailState, MailCity, MailAddress1, MailAddress2, MailAddress3, MailZip, MailCountry, Email, Fax, Phone, OwnerFullName, OwnerFirstName, OwnerMiddleName, OwnerLastName
	
- Note: some fields on ACA uses mail fields without a clear label (ex Zip)

- For duplicateRecordType and requiredRecordType, check if exist with status required in PDF, 
	each can contain several JSON objects with properties (type, status),
	Empty status means ignore status check (I.E. of any status)
 * 
 */

var scriptSuffix = "RECORD_OWNER_VALIDATION";

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

			if (cancelCfgExecution) {
				logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
				cancelCfgExecution = false;
				continue;
			}

			var validation = validateOwner(rules);

			if (validation != "") {
				if (isPublicUser) {
					aa.env.setValue("ErrorCode", "1");
					aa.env.setValue("ErrorMessage", validation);
				}
				cancel = true;
				showMessage = true;
				comment(validation);
			}//validation failed

			var postScript = handleUndefined(rules.postScript);
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		}//for all settings
	}//isConf()
} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

function validateOwner(rules) {

	var owner = getOwnerLocal();

	if (owner == null) {
		return "Could not get owner or owner not found";
	}

	//validate key-value in owner object:
	var fieldsValidation = validateCancelFields(rules, owner);
	if (fieldsValidation != "") {
		return fieldsValidation;
	}

	//check duplicateRecordType
	if (!isEmptyOrNull(rules.criteria.duplicateRecordType)) {
		var duplicates = rules.criteria.duplicateRecordType;
		for (d in duplicates) {
			var duplicateItem = duplicates[d];
			var capModel = getSearchCapModel(duplicateItem.type, owner, duplicateItem.status);
			var capIDList = aa.cap.getCapIDListByCapModel(capModel).getOutput();

			if (capIDList != null && capIDList.length > 0) {
				return "Owner already have records of type: " + duplicateItem.type + " with status: " + duplicateItem.status;
			}//apps count > 0
		}//for all duplicates check
	}//chk duplicateRecordType

	//check requiredRecordType
	if (!isEmptyOrNull(rules.criteria.requiredRecordType)) {
		var requiredRecs = rules.criteria.requiredRecordType;
		for (r in requiredRecs) {
			var requiredItem = requiredRecs[r];

			var capModel = getSearchCapModel(requiredItem.type, owner, requiredItem.status);
			var capIDList = aa.cap.getCapIDListByCapModel(capModel).getOutput();
			if (capIDList == null || capIDList.length == 0) {
				return "Owner should have records of type: " + requiredItem.type + " with status: " + requiredItem.status;
			}//apps count == 0
		}//for all requiredRecs
	}//chk requiredRecordType

	//validation is OK
	return "";
}

/**
 * a method to get owner of record (for Before Event)<br/>
 * method will try to get from session (CapModel), if it fails then getOwnerByCapId()
 * <br/> if it fails, try to read owner variables from session and populate RefOwnerModel object
 * @returns RefOwnerModel or null
 */
function getOwnerLocal() {
	logDebug("INFO populating owner from session CapModel...");

	var owner = null;
	var tmpCapModel = aa.env.getValue("CapModel");
	if (tmpCapModel != null && tmpCapModel != "" && tmpCapModel != ".") {
		try {
			owner = tmpCapModel.getOwnerModel();
		} catch (ex) {
			//nothing needed here, try/catch just to make sure code will continue
		}
	}

	//if owner still null
	if (owner == null) {
		logDebug("INFO owner still null, populating owner from getOwnerByCapId(capId)...");

		var owners = aa.owner.getOwnerByCapId(capId);
		if (!owners.getSuccess()) {
			logDebug("Error getOwnerByCapId() " + owners.getErrorMessage());
		}
		owners = owners.getOutput();
		if (owners == null || owners.length == 0) {
			logDebug("WARN getOwnerByCapId() returned no owners on record: " + capId);
		} else {
			owner = owners[0].getCapOwnerModel();
		}
	}

	//if owner still null
	if (owner == null) {
		logDebug("INFO owner still null, populating owner from session variables...");

		/*
		 based on current way STD-SOL support implemented in Master Scripts V:+9.2.1, 
		 variables will not be visible yet, we declare/populate them here 
		 */
		var OwnerFullName = aa.env.getValue("OwnerFullName");
		var OwnerFirstName = aa.env.getValue("OwnerFirstName");
		var OwnerMiddleName = aa.env.getValue("OwnerMiddleName");
		var OwnerLastName = aa.env.getValue("OwnerLastName");
		var OwnerMailAddressLine1 = aa.env.getValue("OwnerMailAddressLine1");
		var OwnerMailAddressLine2 = aa.env.getValue("OwnerMailAddressLine2");
		var OwnerMailAddressLine3 = aa.env.getValue("OwnerMailAddressLine3");
		var OwnerMailCity = aa.env.getValue("OwnerMailCity");
		var OwnerMailState = aa.env.getValue("OwnerMailState");
		var OwnerMailZip = aa.env.getValue("OwnerMailZip");
		var OwnerPhone = aa.env.getValue("OwnerPhone");

		//get empty OwnerModel
		owner = aa.owner.getCapOwnerScriptModel().getOutput();
		owner = owner.getCapOwnerModel();

		owner.setOwnerFullName(OwnerFullName);
		owner.setOwnerFirstName(OwnerFirstName);
		owner.setOwnerMiddleName(OwnerMiddleName);
		owner.setOwnerLastName1(OwnerLastName);
		owner.setMailAddress1(OwnerMailAddressLine1);
		owner.setMailAddress2(OwnerMailAddressLine2);
		owner.setMailAddress3(OwnerMailAddressLine3);
		owner.setMailCity(OwnerMailCity);
		owner.setMailState(OwnerMailState);
		owner.setMailZip(OwnerMailZip);
		owner.setPhone(OwnerPhone);
	}
	return owner;
}

/**
 * Create a CapModel to be used in search for applications, at least appTypeSearch or refOwnerModel should be passed
 * @param appTypeSearch application type 4 levels string [optional: empty or null to ignore]
 * @param refOwnerModel [optional: null to ignore], only FullName, Phone and Fax are used in search
 * @returns CapModel
 */
function getSearchCapModel(appTypeSearch, refOwnerModel, appStatus) {

	//at least one is required
	if ((appTypeSearch == null || appTypeSearch == "") && refOwnerModel == null) {
		return null;
	}

	var capModel = aa.cap.getCapModel().getOutput();

	if (!isEmptyOrNull(appStatus)) {
		capModel.setCapStatus(appStatus);
	}

	if (appTypeSearch != null && appTypeSearch != "") {
		var chkTypeAry = appTypeSearch.split("/");
		var capTypeModel = aa.cap.getCapTypeModel().getOutput();
		capTypeModel.setGroup(chkTypeAry[0]);
		capTypeModel.setType(chkTypeAry[1]);
		capTypeModel.setSubType(chkTypeAry[2]);
		capTypeModel.setCategory(chkTypeAry[3]);
		capModel.setCapType(capTypeModel);
	}

	if (refOwnerModel != null) {
		var tmpOwner = aa.owner.getCapOwnerScriptModel().getOutput();
		tmpOwner = tmpOwner.getCapOwnerModel();

		//only those fields effect search in the expected way
		if (refOwnerModel.getOwnerFullName() != null && refOwnerModel.getOwnerFullName() != "") {
			tmpOwner.setOwnerFullName(refOwnerModel.getOwnerFullName());
		}
		if (refOwnerModel.getPhone() != null && refOwnerModel.getPhone() != "") {
			tmpOwner.setPhone(refOwnerModel.getPhone());
		}
		if (refOwnerModel.getFax() != null && refOwnerModel.getFax() != "") {
			tmpOwner.setFax(refOwnerModel.getFax());
		}

		capModel.setOwnerModel(tmpOwner);
	}

	return capModel;
}

/**
 * Check if required fields to be validated have a matching values in refOwnerModel
 * @param rules JSON that contains rules set
 * @param refOwnerModel to apply validation rules on
 * @returns {String} empty if validation pass, reason of validation failure otherwise
 */
function validateCancelFields(rules, refOwnerModel) {

	if (isEmptyOrNull(rules.criteria.cancelSubmissionFields)) {
		return "";
	}

	for (f in rules.criteria.cancelSubmissionFields) {
		var filedsArray = rules.criteria.cancelSubmissionFields[f];
		if (filedsArray['State'] != null && filedsArray['State'] != '') {
			if (refOwnerModel.getState() == filedsArray['State']) {
				return "State value block submit";
			}
		}
		if (filedsArray['City'] != null && filedsArray['City'] != '') {
			if (refOwnerModel.getCity() == filedsArray['City']) {
				return "City value block submit";
			}
		}
		if (filedsArray['Address1'] != null && filedsArray['Address1'] != '') {
			if (refOwnerModel.getAddress1() == filedsArray['Address1']) {
				return "Address1 value block submit";
			}
		}
		if (filedsArray['Address2'] != null && filedsArray['Address2'] != '') {
			if (refOwnerModel.getAddress2() == filedsArray['Address2']) {
				return "Address2 value block submit";
			}
		}
		if (filedsArray['Address3'] != null && filedsArray['Address3'] != '') {
			if (refOwnerModel.getAddress3() == filedsArray['Address3']) {
				return "Address3 value block submit";
			}
		}

		if (filedsArray['Zip'] != null && filedsArray['Zip'] != '') {
			if (refOwnerModel.getZip() == filedsArray['Zip']) {
				return "Zip value block submit";
			}
		}
		if (filedsArray['Country'] != null && filedsArray['Country'] != '') {
			if (refOwnerModel.getCountry() == filedsArray['Country']) {
				return "Country value block submit";
			}
		}

		//----Mail Fields section----
		if (filedsArray['MailState'] != null && filedsArray['MailState'] != '') {
			if (refOwnerModel.getMailState() == filedsArray['MailState']) {
				return "MailState value block submit";
			}
		}
		if (filedsArray['MailCity'] != null && filedsArray['MailCity'] != '') {
			if (refOwnerModel.getMailCity() == filedsArray['MailCity']) {
				return "MailCity value block submit";
			}
		}
		if (filedsArray['MailAddress1'] != null && filedsArray['MailAddress1'] != '') {
			if (refOwnerModel.getMailAddress1() == filedsArray['MailAddress1']) {
				return "MailAddress1 value block submit";
			}
		}
		if (filedsArray['MailAddress2'] != null && filedsArray['MailAddress2'] != '') {
			if (refOwnerModel.getMailAddress2() == filedsArray['MailAddress2']) {
				return "MailAddress2 value block submit";
			}
		}
		if (filedsArray['MailAddress3'] != null && filedsArray['MailAddress3'] != '') {
			if (refOwnerModel.getMailAddress3() == filedsArray['MailAddress3']) {
				return "MailAddress3 value block submit";
			}
		}

		if (filedsArray['MailZip'] != null && filedsArray['MailZip'] != '') {
			if (refOwnerModel.getMailZip() == filedsArray['MailZip']) {
				return "MailZip value block submit";
			}
		}
		if (filedsArray['MailCountry'] != null && filedsArray['MailCountry'] != '') {
			if (refOwnerModel.getMailCountry() == filedsArray['MailCountry']) {
				return "MailCountry value block submit";
			}
		}
		//----Mail Fields section END----

		if (filedsArray['Email'] != null && filedsArray['Email'] != '') {
			if (refOwnerModel.getEmail() == filedsArray['Email']) {
				return "Email value block submit";
			}
		}
		if (filedsArray['Fax'] != null && filedsArray['Fax'] != '') {
			if (refOwnerModel.getFax() == filedsArray['Fax']) {
				return "Fax value block submit";
			}
		}
		if (filedsArray['Phone'] != null && filedsArray['Phone'] != '') {
			if (refOwnerModel.getPhone() == filedsArray['Phone']) {
				return "Phone value block submit";
			}
		}
		if (filedsArray['OwnerFullName'] != null && filedsArray['OwnerFullName'] != '') {
			if (refOwnerModel.getOwnerFullName() == filedsArray['OwnerFullName']) {
				return "OwnerFullName value block submit";
			}
		}
		if (filedsArray['OwnerFirstName'] != null && filedsArray['OwnerFirstName'] != '') {
			if (refOwnerModel.getOwnerFirstName() == filedsArray['OwnerFirstName']) {
				return "OwnerFirstName value block submit";
			}
		}
		if (filedsArray['OwnerMiddleName'] != null && filedsArray['OwnerMiddleName'] != '') {
			if (refOwnerModel.getOwnerMiddleName() == filedsArray['OwnerMiddleName']) {
				return "OwnerMiddleName value block submit";
			}
		}
		if (filedsArray['OwnerLastName'] != null && filedsArray['OwnerLastName'] != '') {
			if (refOwnerModel.getOwnerLastName1() == filedsArray['OwnerLastName']) {
				return "OwnerLastName value block submit";
			}
		}
	}
	return "";
}

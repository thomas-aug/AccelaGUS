/*
Title : Entity Contact Registration Automation (WorkflowTaskUpdateAfter) 
Purpose : When a business registers for a license, each contact associated to the business needs to complete a registration application for themselves
Author: Yazan Barghouth
 
Functional Area : Contacts,Records,Public User, Workflow
 
JSON Example :

{
  "Cannabis/Entity/Prequalification/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
		"metadata": {
          "description": "entity issuance",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Intake"
          ],
          "status": [
            "Approved"
          ]
        },
        "action":{
        "contactTypeRecordTypeMapping": {
          "Affiliate Individual": "Cannabis/Entity/Registration/Individual",
          "Affiliate Business": "Cannabis/Entity/Registration/Business",
          "Applicant": "Cannabis/Entity/Registration/Business",
          "Employee": "Cannabis/Entity/Registration/Employee",
          "Volunteer": "Cannabis/Entity/Registration/Employee",
          "Independent Contractor": "Cannabis/Entity/Registration/Individual"
        },
        "childTempRecord": true,
        "childRecordStatus": "Pending",
        "copyCF": false,
        "copyCT": false,
        "CFGroupsToCopy": "",
        "recordIdField": "",
        "notificationTemplate": "SS_APP_CREATED",
        "notificationReport": "",
        "postScript": ""
      }
    }
    ]
  }
}

- Parameters CFGroupsToCopy: comma separated values for ASI groups to be copied (if copyCF is true)
if left empty, all ASI groups will be copied. 
 * 
 */
var scriptSuffix = "ENTITY_REGISTRATION";

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

			generateIndividualRegistrations(capId, rules.action);

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

function generateIndividualRegistrations(capIdObject, jsonRules) {

	var contactTypeMap = jsonRules.contactTypeRecordTypeMapping;

	// refresh links between transaction and reference contacts
	createRefContactsFromCapContactsAndLink(capIdObject, null, null, false, true, comparePeopleStandard);

	// fill contactTypes required (from mapping in JSON)
	var contactTypes = new Array();
	for (c in contactTypeMap) {
		contactTypes.push(c);
	}

	var contacts = getCapContactModel(capIdObject);

	for (c in contacts) {
		var contact = contacts[c].getCapContactModel();
		var contactType = contact.getContactType();
		if (arrayContainsValue(contactTypes, contactType) && contactType != "Individual") {

			var regRecordType = contactTypeMap[contactType];
			if (regRecordType == 'undefined') {
				logDebug("WARNING: No recordType mapped for contact type: " + contactType);
				continue;
			}
			// create prequalification applications for each contact
			var newChildCapId = createChildTempRegistration(capId, contact, regRecordType, jsonRules);

			if (newChildCapId) {
				// create public users or link ref contact to existing public user        
				createPublicUserForContact(contact);
				// send email to contact with registration instructions
				sendAffiliateRegistrationNotification(newChildCapId, contact, jsonRules);
			}//newChildCapId OK
		}//contact type match
	}//for all contacts
}

function createChildTempRegistration(vCapId, capContactModel, recordTypeString, jsonRules) { // optional groups to ignore

	var customFieldCopyTypes = null;
	if (jsonRules.CFGroupsToCopy != null && jsonRules.CFGroupsToCopy != "") {
		customFieldCopyTypes = jsonRules.CFGroupsToCopy.split(",");
	}

	var contactName = "";
	var firstName = "" + capContactModel.getFirstName();
	var lastName = "" + capContactModel.getLastName();
	contactName = firstName + " " + lastName;

	var cTypeArray = recordTypeString.split("/");

	var childId = null;
	var createChildResult = null;

	if (jsonRules.childTempRecord) {
		//create temp record:
		ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
		ctm.setGroup(cTypeArray[0]);
		ctm.setType(cTypeArray[1]);
		ctm.setSubType(cTypeArray[2]);
		ctm.setCategory(cTypeArray[3]);
		createChildResult = aa.cap.createSimplePartialRecord(ctm, contactName, "INCOMPLETE EST");
	} else {
		//create record:
		createChildResult = aa.cap.createApp(cTypeArray[0], cTypeArray[1], cTypeArray[2], cTypeArray[3], contactName);
	}

	if (createChildResult.getSuccess()) {
		childId = createChildResult.getOutput();
		logDebug("Child ID: " + childId.getCustomID());
	} else {
		logDebug("ERROR Creating child temp record: " + createChildResult.getErrorMessage());
		return false;
	}

	updateAppStatus(jsonRules.childRecordStatus, jsonRules.childRecordStatus, childId);

	//Run ASA if not temp cap
	if (!jsonRules.childTempRecord) {
		var childCapModel = aa.cap.getCap(childId).getOutput();
		var res = aa.cap.runEMSEScriptAfterApplicationSubmit(childCapModel, capId);
	}

	aa.cap.createAssociatedFormsHierarchy(vCapId, childId);

	if (jsonRules.recordIdField = null && jsonRules.recordIdField != "") {
		editAppSpecific(jsonRules.recordIdField, vCapId.getId(), childId);
	}

	//create/add contact in child record
	var newCapContactModel = capContactModel;
	newCapContactModel.setCapID(childId);
	newCapContactModel.setPrimaryFlag("Y");
	logDebug("Creating Contact: " + contactName);
	var createContactResult = aa.people.createCapContactWithAttribute(newCapContactModel);
	if (createContactResult.getSuccess()) {
		var copyContactScriptModel = createContactResult.getOutput();
		logDebug("Successfully created contact.");
	} else {
		logDebug("Error creating contact: " + createContactResult.getErrorMessage());
		return false;
	}

	//Copy parent to child data
	if (jsonRules.copyCF) {
		copyAppSpecificByType(vCapId, childId, customFieldCopyTypes);
	}
	if (jsonRules.copyCT) {
		copyASITablesByType(vCapId, childId, null);
	}
	//copy the business entity
	copyContactsByType(vCapId, childId, "Business Entity");
	copyAddresses(vCapId, childId);

	return childId;
}

function sendAffiliateRegistrationNotification(pCapId, contact, jsonRules) {

	var acaSiteUrl = lookup("ACA_CONFIGS", "ACA_SITE");
	var subStrIndex = acaSiteUrl.toUpperCase().indexOf("/ADMIN");
	var acaCitizenRootUrl = acaSiteUrl.substring(0, subStrIndex);

	var eParams = aa.util.newHashtable();
	var capModel = aa.cap.getCap(pCapId).getOutput();
	capModel = capModel.getCapModel();
	addParameter(eParams, "$$altID$$", capModel.getAltID());
	addParameter(eParams, "$$recordAlias$$", capModel.getCapType().getAlias());
	addParameter(eParams, "$$recordStatus$$", capModel.getCapStatus());
	addParameter(eParams, "$$balance$$", feeBalance(""));
	addParameter(eParams, "$$acaRecordUrl$$", getACARecordURLLocal(acaCitizenRootUrl, pCapId, capModel.getModuleName()));
	addParameter(eParams, "$$acaPaymentUrl$$", getACAPaymentUrlLocal(acaCitizenRootUrl, pCapId, capModel));

	//resolve even related parameters
	if (controlString == "WorkflowTaskUpdateAfter") {
		addParameter(eParams, "$$wfTask$$", wfTask);
		addParameter(eParams, "$$wfStatus$$", wfStatus);
		addParameter(eParams, "$$wfDate$$", wfDate);
		addParameter(eParams, "$$wfComment$$", wfComment);
		addParameter(eParams, "$$wfStaffUserID$$", wfStaffUserID);
		addParameter(eParams, "$$wfHours$$", wfHours);
	}//WFTUA

	if (jsonRules.notificationReport != null && jsonRules.notificationReport != "") {
		//send report in email
		var scriptCode = "SEND_NOTIFICATION_WITH_REPORT";
		var envParameters = aa.util.newHashMap();
		envParameters.put("fromEmail", "");
		envParameters.put("toEmail", contact.getEmail());
		envParameters.put("notificationTemplate", jsonRules.notificationTemplate);
		envParameters.put("emailParams", eParams);
		envParameters.put("notificationReport", jsonRules.notificationReport);
		envParameters.put("altId", capModel.getAltID());
		envParameters.put("inspID", "0");
		envParameters.put("module", capModel.getCapModel().getModuleName());
		envParameters.put("capID1", pCapId.getID1());
		envParameters.put("capID2", pCapId.getID2());
		envParameters.put("capID3", pCapId.getID3());
		aa.runAsyncScript(scriptCode, envParameters);
	} else {
		//send email only
		var scriptCode = "SEND_NOTIFICATION_BYTEMPLATE";
		var envParameters = aa.util.newHashMap();
		envParameters.put("fromEmail", "");//not set in JSON, use TEMPLATE definition
		envParameters.put("toEmail", contact.getEmail());
		envParameters.put("notificationTemplate", jsonRules.notificationTemplate);
		envParameters.put("emailParams", eParams);
		aa.runAsyncScript(scriptCode, envParameters);
	}
	return true;
}

function createPublicUserForContact(capContact) {
	var refSeqNumber = capContact.getRefContactNumber();
	if (refSeqNumber == null || refSeqNumber == "") {
		logDebug("Warning: Could not create public user because ref contact ID is null.");
		return false;
	}
	if (!capContact.getEmail()) {
		logDebug("Couldn't create public user for : " + capContact + ", no email address");
		return false;
	}
	logDebug("Searching for account with email: " + capContact.getEmail());

	// check to see if public user exists already based on email address
	var getUserResult = aa.publicUser.getPublicUserByEmail(capContact.getEmail())
	if (getUserResult.getSuccess() && getUserResult.getOutput()) {
		userModel = getUserResult.getOutput();
		logDebug("createPublicUserFromContact: Found an existing public user: " + userModel.getUserID());
	}

	if (!userModel) { // create one

		logDebug(" CreatePublicUserFromContact: creating new user based on email address: " + capContact.getEmail());
		var publicUser = aa.publicUser.getPublicUserModel();
		publicUser.setFirstName(capContact.getFirstName());
		publicUser.setLastName(capContact.getLastName());
		publicUser.setEmail(capContact.getEmail());
		publicUser.setUserID(capContact.getEmail());
		publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111

		publicUser.setAuditID("PublicUser");
		publicUser.setAuditStatus("A");
		publicUser.setCellPhone(capContact.getPhone2());

		var result = aa.publicUser.createPublicUser(publicUser);
		if (result.getSuccess()) {
			logDebug("Created public user " + capContact.getEmail() + "sucessfully.");

			var userSeqNum = result.getOutput();
			var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

			// create for agency
			aa.publicUser.createPublicUserForAgency(userModel);

			// activate for agency
			var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput();
			userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(aa.getServiceProviderCode(), userSeqNum, "ADMIN");

			// reset password
			var resetPasswordResult = aa.publicUser.resetPassword(capContact.getEmail());
			if (resetPasswordResult.getSuccess()) {
				var resetPassword = resetPasswordResult.getOutput();
				userModel.setPassword(resetPassword);
				logDebug("Reset password for " + capContact.getEmail() + "sucessfully.");
			} else {
				logDebug("**WARNING: Reset password for " + capContact.getEmail() + "failure:" + resetPasswordResult.getErrorMessage());
			}

			// send Activate email
			aa.publicUser.sendActivateEmail(userModel, true, true);

			// send another email
			aa.publicUser.sendPasswordEmail(userModel);
		} else {
			logDebug("**WARNIJNG creating public user " + capContact.getEmail() + "failure: " + result.getErrorMessage());
			return null;
		}
	}

	//Now that we have a public user let's connect to the reference contact
	if (refSeqNumber) {
		logDebug("CreatePublicUserFromContact: Linking this public user with reference contact : " + refSeqNumber);
		aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refSeqNumber);
	}
	return userModel; // send back the new or existing public user
}
/**
 * Adds a Key-Value entry to the HashMap parameters
 * @param parameters HashMap to add parameter to
 * @param key parameter key
 * @param value parameter value
 */
function addParameter(parameters, key, value) {
	if (key != null) {
		if (value == null) {
			value = "";
		}
		parameters.put(key, value);
	}
}
/**
 * Generates a deep URL for the payment page (ACA) of recordCapId Record
 * @param acaRootUrl root url of ACA citizen access (without trailer slash '/')
 * @param recordCapId optional, pass null to use capId (current record)
 * @param recordCapModel optional, pass null and method will get this
 * @returns {String} deep url of payment page
 */
function getACAPaymentUrlLocal(acaRootUrl, recordCapId, recordCapModel) {
	var tmpCapId = capId;
	var tmpCapModel = null;
	if (recordCapId != null) {
		tmpCapId = recordCapId;
	}
	if (recordCapModel != null) {
		tmpCapModel = recordCapModel;
	} else {
		tmpCapModel = aa.cap.getCap(tmpCapId).getOutput().getCapModel();
	}
	var url = acaRootUrl + "/urlrouting.ashx?type=1009&culture=en-US&FromACA=Y";
	url += "&Module=" + tmpCapModel.getModuleName();
	url += "&capID1=" + tmpCapId.getID1();
	url += "&capID2=" + tmpCapId.getID2();
	url += "&capID3=" + tmpCapId.getID3();
	url += "&agencyCode=" + aa.getServiceProviderCode();
	return url;
}

function getACARecordURLLocal(e, recordCapId, moduleName) {
	var t = "";
	var n = recordCapId.ID1;
	var r = recordCapId.ID2;
	var i = recordCapId.ID3;
	t = e + "/urlrouting.ashx?type=1000";
	t += "&Module=" + moduleName;
	t += "&capID1=" + n + "&capID2=" + r + "&capID3=" + i;
	t += "&agencyCode=" + aa.getServiceProviderCode();
	return t
}

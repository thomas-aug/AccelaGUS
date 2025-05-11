/*Title : Alert Automation
Purpose : Automate alert creation based on certain criteria
Author: Yazan Barghouth
Functional Area : After All
Description : JSON Example :

{
  "Building/Commercial/Company/amman05": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "To skip ACA page based on some rules",
          "operators": {
            
          }
        },
        "criteria": {
          "contactFields": {
            "contactType": "Applicant",
            "firstName": "yazan"
          },
          "customFields ": {
            "Street Name": "abc"
          },
          "customLists ": [
            {
              "tableName": "PARTNERS",
              "columnName": "First Name",
              "value": "partner 1"
            }
          ],
          "addressFields": {
            "streetName": "streetX"
          },
          "parcelFields": {
            "Block": "112233",
            "ParcelNumber": "254"
          },
          " lpFields": {
            "licType": "Architect"
          },
          "recordStatus": [
            "Waiting For Revisions"
          ]
        },
        "action": {
          "alertName": "VIP Parcel",
          "alertAssign": "Workflow",
          "alertDepartment": "",
          "alertUser": ""
        },
        "postScript": ""
      }
    ]
  }
}

Available Types: contactFields, customFields, customLists, parcelFields, addressFields, lpFields

Available Attributes for each type: 
- Custom Fields and Custom Lists: ALL
- Address: All Custom Attributes, (primaryFlag,houseNumberStart,streetDirection,streetName,streetSuffix,city,state,zip,addressStatus,county,country,addressDescription,xCoordinate,yCoordinate)
- Parcel: All Custom Attributes, (ParcelNumber,Section,Block,LegalDesc,GisSeqNo,SourceSeqNumber,Page,I18NSubdivision,CouncilDistrict,RefAddressTypes,ParcelStatus,ExemptValue,PublicSourceSeqNBR,CensusTract,InspectionDistrict,NoticeConditions,ImprovedValue,PlanArea,Lot,ParcelArea,Township,LandValue)
- Licensed Professional: All Custom Attributes, (licType,lastName,firstName,businessName,address1,city,state,zip,country,email,phone1,phone2,lastRenewalDate,licExpirationDate,FEIN,gender,birthDate)
- Contact: All Custom Attributes, (firstName,lastName,middleName,businessName,contactSeqNumber,contactType,relation,phone1,phone2,email,addressLine1,addressLine2,city,state,zip,fax,notes,country,fullName,peopleModel)

- 'alertAssign' options: Workflow: for all active tasks assigned staff, Record: for staff assigned to record, Manual: rely on 'alertDepartment' and 'alertUser' to send alert

- When 'alertAssign' ='Manual':
	if 'alertDepartment' is set, then all users in the department will be alerted,
	if not set, 'alertUser' will be alerted
	if both 'alertDepartment' and 'alertUser' are set, then only 'alertDepartment' will be used.
 */

try {
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var scriptSuffix = "ALERT_AUTOMATION";
	var settingsArray = [];
	isConfigurableScript(settingsArray, scriptSuffix);
	for (s in settingsArray) {

		var rules = settingsArray[s];
		if (!matches(rules.preScript, null, "")) {
			eval(getScriptText(rules.preScript, null, false));
		}

		if (cancelCfgExecution) {
			logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
			cancelCfgExecution = false;
			continue;
		}
		
		createAlert(rules);

		if (!matches(rules.postScript, null, "")) {
			eval(getScriptText(rules.postScript, null, false));
		}

	}
} catch (ex) {
	logDebug("**ERROR:Exception while verificaiton the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * 
 * @param rules JSON object contains alert details
 */
function createAlert(rules) {

	if (isEmptyOrNull(rules.action.alertAssign)) {
		logDebug("**WARN alertAssign required value");
		return false;
	}
	if (isEmptyOrNull(rules.action.alertName)) {
		logDebug("**WARN alertName required value");
		return false;
	}
	
	var toUsersArray = new Array();

	var acaSiteUrl = lookup("ACA_CONFIGS", "ACA_SITE");
	var subStrIndex = acaSiteUrl.indexOf("/Admin");
	var acaCitizenRootUrl = acaSiteUrl.substring(0, subStrIndex);

	var alertUser = null;
	if (rules.action.alertAssign == "Workflow") {
		toUsersArray = getActiveTaskAssignedStaff(capId);
	} else if (rules.action.alertAssign == "Record") {
		var capDetail = aa.cap.getCapDetail(capId).getOutput();
		userObj = aa.person.getUser(capDetail.getAsgnStaff());
		if (userObj.getSuccess()) {
			staff = userObj.getOutput();
			alertUser = staff.getUserID();
		}
		toUsersArray.push(alertUser);
	} else if (rules.action.alertAssign == "Manual") {
		if (!isEmptyOrNull(rules.action.alertDepartment)) {
			var users = aa.people.getSysUserListByDepartmentName(rules.action.alertDepartment).getOutput();
			for (u in users) {
				toUsersArray.push(users[u].getUserID());
			}//for all users in dept
		} else {
			if (!isEmptyOrNull(rules.action.alertUser)) {
				toUsersArray.push(rules.action.alertUser);
			}
		}
	} else {
		logDebug("**WARN invalid alertAssign value: " + rules.action.alertAssign);
		return false;
	}

	//prepare template parameters:
	var emailParameters = aa.util.newHashtable();

	var capModel = aa.cap.getCap(capId).getOutput();
	capModel = capModel.getCapModel();
	addParameter(emailParameters, "$$altID$$", capModel.getAltID());
	addParameter(emailParameters, "$$recordAlias$$", capModel.getCapType().getAlias());
	addParameter(emailParameters, "$$recordStatus$$", capModel.getCapStatus());
	addParameter(emailParameters, "$$balance$$", feeBalance(""));
	addParameter(emailParameters, "$$acaRecordUrl$$", getACARecordURL(acaCitizenRootUrl));
	addParameter(emailParameters, "$$acaPaymentUrl$$", getACAPaymentUrlLocal(acaCitizenRootUrl, null, capModel));

	//resolve even related parameters
	if (controlString == "InspectionResultSubmitAfter") {
		addParameter(emailParameters, "$$inspID$$", inspId);
		addParameter(emailParameters, "$$inspResult$$", inspResult);
		addParameter(emailParameters, "$$inspComment$$", inspComment);
		addParameter(emailParameters, "$$inspResultDate$$", inspResultDate);
		addParameter(emailParameters, "$$inspGroup$$", inspGroup);
		addParameter(emailParameters, "$$inspType$$", inspType);
		if (inspSchedDate) {
			addParameter(emailParameters, "$$inspSchedDate$$", inspSchedDate);
		} else {
			addParameter(emailParameters, "$$inspSchedDate$$", "N/A");
		}
	}//IRSA
	if (controlString == "WorkflowTaskUpdateAfter") {
		addParameter(emailParameters, "$$wfTask$$", wfTask);
		addParameter(emailParameters, "$$wfStatus$$", wfStatus);
		addParameter(emailParameters, "$$wfDate$$", wfDate);
		addParameter(emailParameters, "$$wfComment$$", wfComment);
		addParameter(emailParameters, "$$wfStaffUserID$$", wfStaffUserID);
		addParameter(emailParameters, "$$wfHours$$", wfHours);
	}//WFTUA

	return sendAlert(toUsersArray, rules.action.alertName, emailParameters);
}

/**
 * Send Alert to users listed in the array using templateName to prepare a alert content
 * @param alertUsersArray array of user IDs to receive the alert
 * @param templateName template name to be used (Notification Template)
 * @param {HashMap} templateParameters key-value entries to be used in template
 * @returns {Boolean} true if alert sent success, false otherwise
 */
function sendAlert(alertUsersArray, templateName, templateParameters) {

	if (alertUsersArray == null || alertUsersArray.length == 0) {
		return false;
	}
	//get template
	var templateResult = aa.communication.getNotificationTemplate(templateName);

	if (templateResult.getSuccess()) {
		templateResult = templateResult.getOutput();

		if (templateResult == null) {
			logDebug("**WARN getNotificationTemplate output null: " + templateResult.getOutput());
			return false;
		}

		//replace parameters in template
		var communicationHelper = aa.proxyInvoker.newInstance("com.accela.aa.communication.CommunicationHelper").getOutput();
		communicationHelper.replaceVariables(templateResult, templateParameters);
		var emailTempModel = templateResult.getEmailTemplateModel();

		//send alert to users array
		for (a in alertUsersArray) {
			aa.alert.createAlertMessage(emailTempModel.getTitle(), emailTempModel.contentText, alertUsersArray[a]);
		}//for all users
		return true;
	} else {//getNotificationTemplate OK
		logDebug("**WARN getNotificationTemplate failed: " + templateResult.getErrorMessage());
	}
	return false;
}

/**
 * Get assigned staff for the currently active Task
 * @param capId record capId
 * @returns string Staff UserID, or null if no staff assigned
 */
function getActiveTaskAssignedStaff(capId) {
	var taskStatusList = aa.workflow.getTaskItems(capId, null, null, null, null, "Y").getOutput();
	var assignedArray = new Array();

	for (t in taskStatusList) {
		var fTask = taskStatusList[t];
		var vStaffUser = aa.cap.getStaffByUser(fTask.getAssignedStaff().getFirstName(), fTask.getAssignedStaff().getMiddleName(), fTask.getAssignedStaff().getLastName(),
				fTask.getAssignedStaff().toString()).getOutput();
		if (vStaffUser != null) {
			assignedArray.push(vStaffUser.getUserID());
		}
	}
	return assignedArray;
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

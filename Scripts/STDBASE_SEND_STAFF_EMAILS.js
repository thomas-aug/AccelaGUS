/*
Title : Send Staff Emails (After all) 
Purpose : Send Emails to staff and contain certain criteria
Author: Yazan Barghouth 
 
Functional Area : Email
 
JSON Example :

{
  "Licenses/Business/Retail/Application": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "To Send Emails to staff and contain certain criteria",
          "operators": {
            
          }
        },
        "criteria": {
          
        },
        "preScript": "",
        "action": {
          "notificationTemplate": "APPLICATION_SUBMITTED",
          "notificationReport": "",
          "staff": "Record Assigned",
          "fromEmail": "noreply@accela.com"
        },
        "postScript": ""
      }
    ],
    "InspectionResultSubmitAfter": [
      {
        "metadata": {
          "description": "To Send Emails to staff and contain certain criteria",
          "operators": {
            
          }
        },
        "criteria": {
          "inspectionTypePerformed": [
            "inspeTypeX"
          ],
          "inspectionResult": [
            "inspeResultY"
          ]
        },
        "preScript": "",
        "action": {
          "notificationTemplate": "INSPECTION_SUBMITTED",
          "notificationReport": "",
          "staff": "Supervisor",
          "fromEmail": "noreply@accela.com"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "To Send Emails to staff and contain certain criteria",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Zoning Review"
          ],
          "status": [
            "Clearance Received"
          ]
        },
        "preScript": "",
        "action": {
          "notificationTemplate": "CLEARANCE_RECEIVED",
          "notificationReport": "",
          "staff": "Workflow Assigned",
          "fromEmail": "noreply@accela.com"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "To Send Emails to staff and contain certain criteria",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Initial Review"
          ],
          "status": [
            "Approved"
          ]
        },
        "preScript": "",
        "action": {
          "notificationTemplate": "PAYMENT_DUE",
          "notificationReport": "",
          "staff": "ADMIN",
          "fromEmail": "noreply@accela.com"
        },
        "postScript": ""
      }
    ]
  }
}

- Parameters 'acaRecordUrl' and 'acaPaymentUrl' requires ACA-Citizen root URL,
it was extracted from Standard-Choice "ACA_CONFIG/ACA_SITE",
by substring() to exclude '/Admin/login.aspx'
 * 
 */

// This should be included in all Configurable Scripts
eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
var scriptSuffix = "SEND_STAFF_EMAILS";

try {
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
			sendStaffEmails(capId, rules);

			//Execute postScript
			var postScript = rules.postScript;
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		}//for all settings
	}//isConf()
} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * Prepare and send email based on config values in rules (JSON), required parameters are prepared too.
 * @param capId record capId to be used to prepare parameters
 * @param rules JSON object of configuration used in the process
 * @returns {Boolean} true if process success, false otherwise
 */
function sendStaffEmails(capId, rules) {

	var acaSiteUrl = lookup("ACA_CONFIGS", "ACA_SITE");
	var subStrIndex = acaSiteUrl.indexOf("/Admin");
	var acaCitizenRootUrl = acaSiteUrl.substring(0, subStrIndex);

	var eParams = aa.util.newHashtable();
	var staffID = null;
	var staffEmail = null;

	//resolve staffID Staff
	if (rules.action.staff.equalsIgnoreCase("Workflow Assigned") && controlString == "WorkflowTaskUpdateAfter") {
		//the assigned workflow staff
		staffID = getTaskAssignedStaff(wfTask);
	} else if (rules.action.staff.equalsIgnoreCase("Record Assigned")) {
		//the assigned record staff
		var capDetail = aa.cap.getCapDetail(capId).getOutput();
		userObj = aa.person.getUser(capDetail.getAsgnStaff());
		if (userObj.getSuccess()) {
			staff = userObj.getOutput();
			staffID = staff.getUserID();
		}
	} else {
		//rules.staff is staffID
		staffID = rules.action.staff;
	}

	if (staffID != null && staffID != false) {
		staffEmail = getUserEmail(staffID);
	} else {
		logDebug("**INFO sendStaffEmails() : Failed to get, or no assigned Staff, assignedStaff=" + staffID);
		return false;
	}

	if (staffEmail == null) {
		logDebug("**INFO sendStaffEmails() : Failed to get assigned Staff Email, rules.staff=" + rules.action.staff + ", assignedStaff=" + staffID);
		return false;
	}

	//resolve Common Parameters
	var capModel = aa.cap.getCap(capId).getOutput();
	capModel = capModel.getCapModel();
	addParameter(eParams, "$$altID$$", capModel.getAltID());
	addParameter(eParams, "$$recordAlias$$", capModel.getCapType().getAlias());
	addParameter(eParams, "$$recordStatus$$", capModel.getCapStatus());
	addParameter(eParams, "$$balance$$", feeBalance(""));
	addParameter(eParams, "$$acaRecordUrl$$", getACARecordURL(acaCitizenRootUrl));
	addParameter(eParams, "$$acaPaymentUrl$$", getACAPaymentUrlLocal(acaCitizenRootUrl, null, capModel));

	//resolve even related parameters
	if (controlString == "InspectionResultSubmitAfter") {
		addParameter(eParams, "$$inspID$$", inspId);
		addParameter(eParams, "$$inspResult$$", inspResult);
		addParameter(eParams, "$$inspComment$$", inspComment);
		addParameter(eParams, "$$inspResultDate$$", inspResultDate);
		addParameter(eParams, "$$inspGroup$$", inspGroup);
		addParameter(eParams, "$$inspType$$", inspType);
		if (inspSchedDate) {
			addParameter(eParams, "$$inspSchedDate$$", inspSchedDate);
		} else {
			addParameter(eParams, "$$inspSchedDate$$", "N/A");
		}
	}//IRSA
	if (controlString == "WorkflowTaskUpdateAfter") {
		addParameter(eParams, "$$wfTask$$", wfTask);
		addParameter(eParams, "$$wfStatus$$", wfStatus);
		addParameter(eParams, "$$wfDate$$", wfDate);
		addParameter(eParams, "$$wfComment$$", wfComment);
		addParameter(eParams, "$$wfStaffUserID$$", wfStaffUserID);
		addParameter(eParams, "$$wfHours$$", wfHours);
	}//WFTUA

	//check if report(s) are included in JSON
	if (isEmptyOrNull(rules.action.notificationReport)) {

		//send email without reports:
		var scriptCode = "SEND_NOTIFICATION_BYTEMPLATE";
		var envParameters = aa.util.newHashMap();

		if (!isEmptyOrNull(rules.action.fromEmail))
			envParameters.put("fromEmail", rules.action.fromEmail);
		else
			envParameters.put("fromEmail", "");

		envParameters.put("toEmail", staffEmail);
		envParameters.put("notificationTemplate", rules.action.notificationTemplate);
		envParameters.put("emailParams", eParams);

		aa.runAsyncScript(scriptCode, envParameters);

		return true;
	} else {
		var scriptCode = "SEND_NOTIFICATION_WITH_REPORT";
		var envParameters = aa.util.newHashMap();

		if (!isEmptyOrNull(rules.action.fromEmail))
			envParameters.put("fromEmail", rules.action.fromEmail);
		else
			envParameters.put("fromEmail", "");

		envParameters.put("toEmail", staffEmail);
		envParameters.put("notificationTemplate", rules.action.notificationTemplate);
		envParameters.put("emailParams", eParams);
		envParameters.put("notificationReport", rules.action.notificationReport);
		envParameters.put("altId", capModel.getAltID());
		if (controlString == "InspectionResultSubmitAfter") {
			envParameters.put("inspID", inspId);
		} else {
			envParameters.put("inspID", "0");
		}
		envParameters.put("module", appTypeArray[0]);
		envParameters.put("capID1", capId.getID1());
		envParameters.put("capID2", capId.getID2());
		envParameters.put("capID3", capId.getID3());
		aa.runAsyncScript(scriptCode, envParameters);

		return true;
	}//notificationReport !empty

	return false;
}

/**
 * Get staff (User ID) that was assigned to a task, optional parameter 'processName'
 * @param taskName to get assigned staff for
 * @returns {String} UserID
 */
function getTaskAssignedStaff(taskName) {// optional process name.
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var taskDesc = taskName;
	if (taskName == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(capId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logDebug("ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(taskName.toUpperCase()) || taskName == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var vStaffUser = aa.cap.getStaffByUser(fTask.getAssignedStaff().getFirstName(), fTask.getAssignedStaff().getMiddleName(), fTask.getAssignedStaff().getLastName(),
					fTask.getAssignedStaff().toString()).getOutput();
			if (vStaffUser != null) {
				return vStaffUser.getUserID();
			}
		}
	}
	return false;
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

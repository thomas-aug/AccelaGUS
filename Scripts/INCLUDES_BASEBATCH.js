/*------------------------------------------------------------------------------------------------------/
| Program		: INCLUDES_BASEBATCH.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 09/03/2016 10:44:24
|
/------------------------------------------------------------------------------------------------------*/
var globalEval = eval;
var showDebug = false;
var capId = null;
var message = "";
var debug = "<h2>Debug Log: </h2>";
var exceptions = "<h2>Exception Log: </h2>";
var showMessage = true;
var br = "<BR>";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));
eval(getScriptText("INCLUDES_NOTIFICATIONS", null, false));

function Batch() {
	this.name = aa.env.getValue("BatchJobName") + "";

	if (lookup("BATCH_SCRIPT_DEBUG", "ENABLE_DEBUG") == "Yes") {
		showDebug = true;
	}
	this.showDebug = showDebug;
	this.maxSeconds = 5 * 60;
	this.batchJobID = aa.batchJob.getJobID().getOutput();
	this.systemUserObj = aa.person.getUser("ADMIN").getOutput();

}
Batch.prototype.include = function (vScriptName) {

	globalEval(getScriptText(vScriptName))

}
Batch.prototype.log = function (etype, edesc, createEventLog) {
	if (createEventLog) {
		//		var sysDate = aa.date.getCurrentDate();
		//		aa.eventLog.createEventLog(etype, "Batch Process", this.name, sysDate, sysDate, "", edesc, this.batchJobID);
	}
	var msg = etype + " : " + edesc;

	if (etype == "ERROR") {
		msg = "<font color='red' size=2>" + msg + "</font><BR>"
	} else {
		msg = "<font color='green' size=2>" + msg + "</font><BR>"
	}
	if (etype == "DEBUG") {
		if (this.showDebug) {
			aa.print(msg);
		}
	} else {
		aa.print(msg);
	}
	debug += msg;
}
Batch.prototype.execute = function () {
	throw "Execute not implemented in base page"
}

function run() {
	try {
		var batch = new Batch();
		logDebug = function (e) {
			batch.log("DEBUG", e)
		}
		logMessage = function (e) {
			batch.log("MESSAGE", e)
		}
		batch.log("DEBUG", "Start of Job", false)
		var startDate = new Date();
		batch.execute();
		var endDate = new Date();
		var elapsed = (endDate - startDate) / 1000;
		batch.log("DEBUG", "End of Job: Elapsed Time : " + elapsed + " Seconds", false)
		aa.env.setValue("ErrorCode", "0");

	} catch (e) {
		aa.print("ERROR:" + e)
		batch.log("ERROR", e, true);
		aa.env.setValue("ErrorCode", "1");
		aa.env.setValue("ErrorMessage", e + "");
	}
}

/**
 * 
 * @param {*} expString 
 */
function logException(expString) {
	exceptions += "<br>" + expString;

}

/**
 * Time tracker to timeout batch job
 */
function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}

/**
 * Sends an email with the batch result. Uses a notification template passed as a parameters
 */
function sendBatchResultEmail(fromEmail, toEmail, notificationTemplate, emailParams, reportName, reportParams) {

	if (!matches(reportName, null, undefined, false, "")) {
		// TO DO: Add ability to include a report in the notification
	} else {
		// Call sendNotification if you are not using a report
		var sendResult = aa.document.sendEmailByTemplateName(fromEmail, toEmail, "", notificationTemplate, emailParams, null);
		if (sendResult.getSuccess()) {
			sendResult.getOutput();
			logDebug("Batch result email sent successfully to: " + toEmail);
		} else {
			logDebug("ERROR: Failed to send batch result email. " + sendResult.getErrorMessage())
		}
	}
}


/**
 * Checks if the recordType value exists in the excludeRecordsArray.
 * @example The exclude records array is configured in CONF_LIC_RENEWAL.
 * Example JSON array configuration:
 * "excludeRecordType": [
				{ "type": "Licenses/Type/Subtype/Category" },
				{ "type": "Licenses/Type/Subtype/Category" }
			]
 * 
 * @param {string} recordType Record type of the record
 * @param {JSONArray} excludeRecordsArray JSON Array of types to exclude
 * @returns {boolean} true or false if the record should be excluded
 */
function isRecordTypeExcluded(recordType, excludeRecordsArray) {
	var appTypeArray = recordType.split("/");
	// if the record type is in the excludeRecordsArray, return true to exclude
	if (excludeRecordsArray && excludeRecordsArray.length > 0) {
		for (rec in excludeRecordsArray) {
			//logDebug("Comparing: " + recordType + " = " + excludeRecordsArray[rec].type)
			if (excludeRecordsArray[rec].type == recordType) {
				return true;
			}
		}
	}
}

/**
 * Checksif the recordStatus value exists in the excludeRecordStatusArray. Returns true if the record should be excluded
 * @example
 * Example JSON array configuration:
 * "excludeRecordStatus": [
				{ "status": "Withdrawn" },
				{ "status": "Deceased"}
			]
 * @param {string} recordStatus Record status of the record
 * @param {JSONArray} excludeRecordStatusArray JSON Array of statuses to exclude
 * @returns {boolean} true or false if the record status should be excluded
 */
function isRecordStatusExcluded(recordStatus, excludeRecordStatusArray) {

	if (excludeRecordStatusArray && excludeRecordStatusArray.length > 0) {
		for (stat in excludeRecordStatusArray) {
			//logDebug("Comparing: " + recordStatus + " = " + excludeRecordStatusArray[stat].status)
			if (excludeRecordStatusArray[stat].status == recordStatus) {
				return true;
			}
		}
	}
}
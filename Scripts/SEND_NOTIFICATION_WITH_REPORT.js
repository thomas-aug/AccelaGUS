var notificationReport = aa.env.getValue("notificationReport");
var altId = aa.env.getValue("altId");
var inspID = aa.env.getValue("inspID");
var module = aa.env.getValue("module");
var capID1 = aa.env.getValue("capID1");
var capID2 = aa.env.getValue("capID2");
var capID3 = aa.env.getValue("capID3");
var fromEmail = aa.env.getValue("fromEmail");
var toEmail = aa.env.getValue("toEmail");
var notificationTemplate = aa.env.getValue("notificationTemplate");
var emailParams = aa.env.getValue("emailParams");

var reportFiles = new Array();
var repTypeArray = notificationReport.split(';');
var rptParams = aa.util.newHashtable();
rptParams.put("altID", altId);
if (inspID != "0" && inspID != "") {
	rptParams.put("inspID", inspID);
}

for (r in repTypeArray) {
	var report = aa.reportManager.getReportInfoModelByName(repTypeArray[r]);

	if (report == null) {
		aa.debug("SND_STF_EMAIL", "**WARN SEND_NOTIFICATION_WITH_REPORT getReportInfoModelByName() returned NULL, reportType=" + repTypeArray[r]);
		continue;
	}

	if (report.getSuccess()) {
		report = report.getOutput();
		report.setModule(module);
		report.setCapId(capID1 + "-" + capID2 + "-" + capID3);
		report.setReportParameters(rptParams);

		var hasPerm = aa.reportManager.hasPermission(repTypeArray[r], aa.getAuditID());
		if (hasPerm.getSuccess() && hasPerm.getOutput().booleanValue()) {
			var reportResult = aa.reportManager.getReportResult(report);
			if (reportResult.getSuccess()) {
				reportResult = reportResult.getOutput();
				var reportFile = aa.reportManager.storeReportToDisk(reportResult);
				if (reportFile.getSuccess()) {
					reportFile = reportFile.getOutput();
					reportFiles.push(reportFile);
				} else {
					aa.debug("SND_STF_EMAIL", "**WARN SEND_NOTIFICATION_WITH_REPORT storeReportToDisk() failed: " + reportFile.getErrorMessage());
				}
			}//report result OK
		}//has permission
	} else {//report OK
		aa.debug("SND_STF_EMAIL", "**WARN SEND_NOTIFICATION_WITH_REPORT getReportInfoModelByName() failed: " + report.getErrorMessage());
	}
}//for all reports

//send email with report:
var altIDScriptModel = aa.cap.createCapIDScriptModel(capID1, capID2, capID3);
var sent = aa.document.sendEmailAndSaveAsDocument(fromEmail, toEmail, "", notificationTemplate, emailParams, altIDScriptModel, reportFiles);
if (!sent.getSuccess()) {
	aa.debug("SND_STF_EMAIL", "**WARN SEND_NOTIFICATION_WITH_REPORT failed, Error: " + sent.getErrorMessage());
}

var fromEmail = aa.env.getValue("fromEmail");
var toEmail = aa.env.getValue("toEmail");
var notificationTemplate = aa.env.getValue("notificationTemplate");
var emailParams = aa.env.getValue("emailParams");

var sent = aa.document.sendEmailByTemplateName(fromEmail, toEmail, "", notificationTemplate, emailParams, null);
if (!sent.getSuccess()) {
	aa.debug("SND_STF_EMAIL", "**WARN SEND_NOTIFICATION_BYTEMPLATENAME failed, Error: " + sent.getErrorMessage());
}

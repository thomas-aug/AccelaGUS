function sendNotificationGUS(eletricalId) {
	if (!appMatch("Building/Residential/Electrical/NA", electricalId)) return;

	var notificationTemplate = "BUILDING_ELECTRICAL_GUS";
	var fromEmail = "noreply@gus.com";
	var toEmail = "augustin.ravin@ks.gov";

	var eParams = aa.util.newHashtable();
	addParameter(eParams, "$$altID$$", String(electricalId.customID));
	
	sendNotification(fromEmail, toEmail, "", notificationTemplate, eParams, null);
	logDebug("Sending email temp: " + notificationTemplate + " to email " + toEmail);

}

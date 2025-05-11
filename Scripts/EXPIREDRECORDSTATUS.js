eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON");
var recStatus = getRecordStatus();
logDebug("in expiredRecordStatus: " + recStatus);
if (recStatus == "Expired"){
	showMessage = true;
	cancel = true;
	comment("Cannot schedule an inspection on an Expired permit");
}
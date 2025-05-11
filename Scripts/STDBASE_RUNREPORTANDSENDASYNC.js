/*------------------------------------------------------------------------------------------------------/
| Program : STDBASE_RUNREPORTANDSENDASYNC.js
| Events  : ApplicatonSubmitAfter, WorkflowTaskUpdateAfter, InspectionScheduleAfter, InspectionResultSubmitAfter
|
| Usage   : Run report and send async.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/

// ********************************************************************************************************************************
//	Env Paramters Below
// ********************************************************************************************************************************
var servProvCode = aa.env.getValue("ServProvCode");			// Service Provider Code
var capIDString = aa.env.getValue("CustomCapId");			// Custom CAP ID
var vCapId = aa.env.getValue("CapID");
var reportName = aa.env.getValue("ReportName"); 			// Report Name
var reportParameters = aa.env.getValue("ReportParameters");	// Report Paramters, it should be HashTable
var reportAttach = aa.env.getValue("ReportAttach");			// Attach the report to the email
var module = aa.env.getValue("Module");						// Module Name
var reportUser = aa.env.getValue("ReportUser"); 			// AA User
var errorEmailTo = aa.env.getValue("ErrorEmailTo");			// To Email Address handle Error Message
var debugEmailTo = aa.env.getValue("DebugEmailTo");			// To Email Address handle Debug Message
var	emailFrom = aa.env.getValue("EmailFrom");
var	emailTo = aa.env.getValue("EmailTo");
var	emailTemplate = aa.env.getValue("EmailTemplate");
var	emailParameters = aa.env.getValue("EmailParameters");
var emailCC = aa.env.getValue("EmailCC");
var waitTime = aa.env.getValue("WaitTime");
var systemMailFrom = aa.env.getValue("SystemMailFrom");
var vEventName = aa.env.getValue("EventName");
var controlString = vEventName;
var showMessage = false;
var showDebug = false;
var message = "";
var debug = "";
var error = "";
var br = "<BR/>";
var capStatus = "";
var wfTask = "";
var wfStatus = "";
var inspGroup = "";
var inspType = "";
var inspResult = "";

var testMode = false;


var currentUserID = aa.env.getValue("CurrentUserID");
if(matches(currentUserID,null,"")) {
	currentUserID = "ADMIN";
}

if (currentUserID.indexOf("PUBLICUSER") == 0){
	publicUserID = currentUserID; 
	currentUserID = "ADMIN"; 
	publicUser = true;
}

if(matches(servProvCode,null,"")){	
	servProvCode = aa.getServiceProviderCode();
}

var capId

var capIDArray = vCapId.toString().split("-");
if(capIDArray && capIDArray[0]){
	var id1 = capIDArray[0];
	var id2 = capIDArray[1];
	var id3 = capIDArray[2];
	capId = aa.cap.getCapID(id1,id2,id3).getOutput();
}

if(capId == null){
	capId = aa.cap.getCapID(capIDString).getOutput();
}

aa.env.setValue("PermitId1", capId.getID1());
aa.env.setValue("PermitId2", capId.getID2());
aa.env.setValue("PermitId3", capId.getID3());

handleEnvParamters();

if(matches(waitTime,null,undefined,"")) {waitTime = 10000;}
else {waitTime = parseInt(waitTime);}

var agencyReplyEmailDefault = lookup("ACA_EMAIL_TO_AND_FROM_SETTING", "RENEW_LICENSE_AUTO_ISSUANCE_MAILFROM");
var acaURLDefault = lookup("ACA_CONFIGS", "ACA_SITE");
acaURLDefault = acaURLDefault.substr(0, acaURLDefault.toUpperCase().indexOf("/ADMIN"));
var acaURL = acaURLDefault;

if(matches(systemMailFrom,null,"")){
	systemMailFrom = agencyReplyEmailDefault;
}


var scriptSuffix = "SEND_CONTACT_EMAILS";


function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode) servProvCode = aa.getServiceProviderCode();
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

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));


try {
	var rParams = aa.util.newHashMap();
	if(reportParameters && !reportParameters.getClass){
		rParams = convertStringToHashMap(String(reportParamters));
	}
	else if(reportParameters && reportParameters.getClass().toString() == "class java.util.HashMap"){
		rParams = reportParameters;
	}
		
	var eParams = aa.util.newHashtable();
	
	if(emailParameters && !emailParameters.getClass){
			eParams = convertStringToHashTable(String(emailParameters));
		}
	else if(emailParameters && emailParameters.getClass().toString() == "class java.util.Hashtable"){
		eParams = emailParameters;
	}

	capStatus = getHashTableParameter(eParams,"$$recordStatus$$");

	if (controlString.indexOf("InspectionSchedule") > -1) {		
		inspGroup = getHashTableParameter(eParams, "$$inspGroup$$");
		inspType = getHashTableParameter(eParams, "$$inspType$$");
	}
	if (controlString.indexOf("InspectionResult") > -1) {
		inspResult = getHashTableParameter(eParams, "$$inspResult$$");
		inspGroup = getHashTableParameter(eParams, "$$inspGroup$$");
		inspType = getHashTableParameter(eParams, "$$inspType$$");
	}
	if (controlString.indexOf("Workflow") > -1) {
		wfTask = getHashTableParameter(eParams, "$$wfTask$$");
		wfStatus = getHashTableParameter(eParams, "$$wfStatus$$");
	}
	
	logDebug("Starting async script. Waiting " + waitTime + " milliseconds to execute...");
	wait(waitTime);  //7 seconds in milliseconds
	logDebug("Done waiting, it's been: " + waitTime + "milliseconds");
	
	// ********************************************************************
	printEnv();
	// ***********************************************************************


	// This should be included in all Configurable Scripts
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var settingsArray = [];
	var vIsConfigurableScript = isConfigurableScript(settingsArray, scriptSuffix);

	if (vIsConfigurableScript) {
		
		for (s in settingsArray) {

			var rules = settingsArray[s];

			//Execute PreScript
			if (!isEmptyOrNull(rules.preScript)) {
				eval(getScriptText(rules.preScript));
			}

			if (cancelCfgExecution) {
				logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
				cancelCfgExecution = false;
				continue;
			}

			sendContactEmailsAsync(capId, rules, eParams);

			//Execute Post Script
			if (!isEmptyOrNull(rules.postScript)) {
				eval(getScriptText(rules.postScript));
			}
		}

		if(!isEmptyOrNull(debugEmailTo)) {
			aa.sendMail(systemMailFrom, debugEmailTo, "", "Post Debug Information in Sending Report Script", debug);
		}
	}

} catch (err) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + err);
	logDebug("(RUNREPORTANDSENDASYNC) A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
	aa.sendMail(systemMailFrom, debugEmailTo, "", "EXCEPTION: Debug Information in Sending Report Script", debug);
}


// ======================================================================
//
//					Internal Function
//
// ======================================================================

function logDebug(dstr) {
	debug += dstr + br;	
}

function getHashTableParameter(pamaremeters, key)
{
	var value = "";
	if(key){
		value = pamaremeters.get(key);
	}
	else{
		logDebug("(getHashTableParameter) No Key Provided")
	}
	return value;
}

function generateReportLocal(itemCap,reportName,module,parameters,eParamsHash,acaURL) {

	//returns the report file which can be attached to an email.
	var user = "ADMIN";   // Setting the User Name
	var report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput();
	report.setModule(module);
	report.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3());
	report.setReportParameters(parameters);
	report.getEDMSEntityIdModel().setAltId(itemCap.getCustomID());
  
	var permit = aa.reportManager.hasPermission(reportName,user);
  
	if (permit.getOutput().booleanValue()) {
	  var reportResult = aa.reportManager.getReportResult(report);
	  if(reportResult) {
		reportOutput = reportResult.getOutput();
		if(reportOutput){
			if(eParamsHash!=null && acaURL !=null){
				var reportFileName = reportOutput.getName();
				getACADocumentNameURLParams4Notification(eParamsHash,reportFileName,acaURL);
			}
			var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
			reportFile=reportFile.getOutput();
			return reportFile;
		}else{
			logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
			return false;
		}
	  }  else {
		logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
		return false;
	  }
	} else {
	  logDebug("You have no permission.");
	  return false;
	}
  }

function sendNotificationLocal(emailFrom, emailTo, emailCC, templateName, params, reportFile) {
	var itemCap = capId;

	if (arguments.length == 7)
		itemCap = arguments[6]; // use cap ID specified in args

	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;

	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);

	var result = null;
	if (isEmptyOrNull(emailFrom))
		emailFrom = null;
	if (isEmptyOrNull(emailCC))
		emailCC = null;

	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);

	if (result.getSuccess()) {
		logDebug("Sent email successfully!");
		return true;
	} else {
		logDebug("Failed to send mail. - " + result.getErrorType() + " : " + result.getErrorMessage());
		return false;
	}
}

function runReport4EmailLocal(itemCap,reportName,rEmailTo,rParams,eParams,emailTemplate,module,mailFrom,acaURL) {
	//If email address available for contact type then email the report, otherwise return false;

	var reportSent = false;

	if (rEmailTo) {
		if (!matches(rEmailTo,null,undefined,"")) {
			//Send the report via email
			var rFile;
			var rFiles = new Array();
			rFile = generateReportLocal(itemCap,reportName,module,rParams,eParams,acaURL);
	
			if (rFile) {
				rFiles.push(rFile);
				reportSent = true;
			}else{
				logDebug("(runReport4Email) Unable to generate report - sending email without report")
				reportSent = false;
			}

			sendNotificationLocal(mailFrom,rEmailTo,"",emailTemplate,eParams,rFiles,itemCap);

		} else {
			reportSent = false;
		}
	} else {
		reportSent = false;
	}

	return reportSent;
}

/**
 * Runs a report with any specified parameters and attaches it to the record
 *
 * @example
 *		runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");
 *		runReportAttach(capId,"ReportName",paramHashtable);
 * @param capId
 *			itemCapId - capId object 
 * @param {report parameter pairs} or {hashtable}
 *			optional parameters are report parameter pairs or a parameters hashtable
 * @returns {boolean}
 *			if the report was generated and attached return true
 *
 */
function runReportAttach(itemCapId,aaReportName)
	{

	var reportName = aaReportName;

	reportResult = aa.reportManager.getReportInfoModelByName(reportName);

	if (!reportResult.getSuccess())
		{ logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); return false; }

	var report = reportResult.getOutput(); 

	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	itemAppTypeResult = itemCap.getCapType();
	itemAppTypeString = itemAppTypeResult.toString(); 
	itemAppTypeArray = itemAppTypeString.split("/");

	report.setModule(itemAppTypeArray[0]); 
	report.setCapId(itemCapId.getID1() + "-" + itemCapId.getID2() + "-" + itemCapId.getID3()); 
	report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());

	var parameters = aa.util.newHashMap(); 

	if(arguments.length > 2 && arguments[2].getClass().toString().equals("class java.lang.String")){
		// optional parameters are report parameter pairs
		// for example: runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");
		for (var i = 2; i < arguments.length ; i = i+2)
		{
			parameters.put(arguments[i],arguments[i+1]);
			logDebug("Report parameter: " + arguments[i] + " = " + arguments[i+1]);
		}
	}
	else if(arguments.length > 2 && arguments[2].getClass().toString().equals("class java.util.HashMap")){
		// optional argument is a hashmap so assign it to parameters
		parameters = arguments[2]
	}

	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,"ADMIN"); 
	if(permit.getOutput().booleanValue()) 
		{ 
			var reportResult = aa.reportManager.getReportResult(report); 
			if(reportResult){
				logDebug("Report " + aaReportName + " has been run for " + itemCapId.getCustomID());
				return true;
			}
		}
	else{
		logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
		return false;
	}
}


function getLicensedProfessionalObjectsByRecord(pCapId,licenseTypeArray){
	var itemCap = capId;
	if (pCapId != null)
		itemCap = pCapId; // use cap ID specified in args

	var licenseProfObjArray = new Array();
	var licenseProfResult = aa.licenseProfessional.getLicensedProfessionalsByCapID(itemCap);
	if(licenseProfResult.getSuccess()){
		var licenseProfList = licenseProfResult.getOutput();
		var licenseProfObjArray= new Array();
		if (licenseProfList) {
			for (thisLP in licenseProfList) {
				if(licenseProfList[thisLP].getLicenseNbr() != null){
					if (!licenseTypeArray || exists(licenseProfList[thisLP].getLicenseType(), licenseTypeArray))
					var vLPObj = new licenseProfObject(licenseProfList[thisLP].getLicenseNbr());
					licenseProfObjArray.push(vLPObj);
				}
			}
		}
	}
	
	return licenseProfObjArray;
}

function convertContactAddressModelArr(contactAddressScriptModelArr)
{
	var contactAddressModelArr = null;
	if(contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0)
	{
		contactAddressModelArr = aa.util.newArrayList();
		for(loopk in contactAddressScriptModelArr)
		{
			contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
		}
	}	
	return contactAddressModelArr;
}

/**
 * Standard base automation to send notifications to contacts based on JSON configurable rules.
 * 
 * @param {CapIdObject} itemCapId CapIdObject blah
 * @param {JSON} recordSettings JSON configuration ruleset
 * @param {HashMap} parameters Optional hashmap of notification template parameters
 */
function sendContactEmailsAsync(itemCapId, recordSettings, parameters) {

	var functionTitle = "sendContactEmailsAsync()";

	var debugMode = false;

	// validate JSON parameters using handleUndefined function
	// handleUndefine(JSON Parameter, isRequired);
	var rNotificationTemplate = handleUndefined(recordSettings.action.notificationTemplate, false);
	var rReportParamContactType = handleUndefined(recordSettings.action.reportParamContactType,false);
	var rNotifyContactType = handleUndefined(recordSettings.action.notifyContactTypes, false);
	var rNotifyLPType = handleUndefined(recordSettings.action.notifyLPTypes, false);
	var rUrl4ACA = handleUndefined(recordSettings.action.url4ACA, false);
	var rNotificationReport = handleUndefined(recordSettings.action.notificationReport, false);
	var rFromEmail = handleUndefined(recordSettings.action.fromEmail, false);
	var rAdditionalEmailsTo = handleUndefined(recordSettings.action.additionalEmailsTo, false);
	var rCreateFromParent = handleUndefined(recordSettings.action.createFromParent, false);
	var rReportingInfoStandards = handleUndefined(recordSettings.action.reportingInfoStandards, false);
	var rBalanceAllowed = handleUndefined(recordSettings.action.balanceAllowed, false);

	// VALIDATE FUNCTION PARAMETERS
	// validate required parameters, log error and return false if required parameters are missing
	if (!rNotificationTemplate) {
		logDebug("ERROR: recordSettings.notificationTemplate is missing in JSON configuration.");
		return false;
	}

	if (isEmptyOrNull(rNotifyContactType)) {
		logDebug("ERROR: recordSettings.notifyContactType is missing in JSON configuration.");
		return false;
	}

	if (isEmptyOrNull(rUrl4ACA)) {
		rUrl4ACA = acaURL;
	}

	if (isEmptyOrNull(rFromEmail)) {
		rFromEmail = agencyReplyEmailDefault;
	}

	if (typeof itemCapId == 'undefined') {
		logDebug("WARNING: The capIdObject Parameter is required for the function. " + functionTitle);
		return false;
	}
	if (isEmptyOrNull(rCreateFromParent)) {
		rCreateFromParent = false;
	}

	if (rCreateFromParent) {
		var vParentCapId = getParentByCapId(itemCapId);

		if (vParentCapId) {
			itemCapId = vParentCapId;
		}
	}

	if (isEmptyOrNull(rReportingInfoStandards)) {
		rReportingInfoStandards = "Reporting Information Standards";
	}

	if (!isEmptyOrNull(rNotificationTemplate) && !isEmptyOrNull(rNotifyContactType)) {
		try {
			//Get Contacts
			emailAddrList = new Array();
			var contactObjArray = new Array();
			var capContactArray = null;
			var capContactResult = aa.people.getCapContactByCapID(itemCapId);
			if (capContactResult.getSuccess()) {
				capContactArray = capContactResult.getOutput();
			}

			//Check Necessary Contacts
			if (rNotifyContactType[0].toUpperCase() != "ALL" && rNotifyContactType[0].toUpperCase() != "PRIMARY") {
				if (capContactArray) {
					for (y in capContactArray) {
						thisCon = capContactArray[y];
						for (z in rNotifyContactType) {
							if (thisCon.getPeople().getContactType().toUpperCase() == rNotifyContactType[z].toUpperCase()) {
								if (thisCon.getEmail())
									contactObjArray.push(new contactObj(thisCon));
							}
						}
					}
				}
			} else if (rNotifyContactType[0].toUpperCase() == "ALL") {
				if (capContactArray) {
					for (y in capContactArray) {
						thisCon = capContactArray[y];
						if (thisCon.getEmail())
							contactObjArray.push(new contactObj(thisCon));
					}
				}
			} else if (rNotifyContactType[0].toUpperCase() == "PRIMARY") {
				if (capContactArray) {
					for (y in capContactArray) {
						thisCon = capContactArray[y];
						if (thisCon.getPeople().getFlag() == "Y" && thisCon.getEmail())
							contactObjArray.push(new contactObj(thisCon));
					}
				}
			}

			var reportAttached = false;
			logDebug("sendContactEmails contactObjArray.length = " +contactObjArray.length)
			if (contactObjArray.length > 0 || !isEmptyOrNull(rAdditionalEmailsTo)) {

				//Build parameters
				if (isEmptyOrNull(parameters)) {
					eParamsRecord = aa.util.newHashtable();
				} else {
					eParamsRecord = parameters;
				}
				responsiveACA = lookup("ACA_CONFIGS", "ENABLE_CUSTOMIZATION_PER_PAGE");
				var itemCapIDString = itemCapId.getCustomID();
				var itemCap = aa.cap.getCap(itemCapId).getOutput();
				var itemCapName = itemCap.getSpecialText();
				var itemCapStatus = itemCap.getCapStatus();
				var itemFileDate = itemCap.getFileDate();
				var itemCapTypeAlias = itemCap.getCapType().getAlias();
				var itemAppTypeResult = itemCap.getCapType();
				var itemAppTypeString = itemAppTypeResult.toString();
				var itemAppTypeArray = itemAppTypeString.split("/");
				var itemModule = itemCap.getCapModel().getModuleName();
				var capIDScriptModel = aa.cap.createCapIDScriptModel(itemCapId.getID1(), itemCapId.getID2(), itemCapId.getID3());
				var itemHouseCount;
				var itemFeesInvoicedTotal;
				var itemBalanceDue = 0;
				var departmentNameUserID;

				var itemCapDetailObjResult = aa.cap.getCapDetail(itemCapId);
				if (itemCapDetailObjResult.getSuccess()) {
					itemCapDetail = itemCapDetailObjResult.getOutput();
					itemHouseCount = itemCapDetail.getHouseCount();
					itemFeesInvoicedTotal = itemCapDetail.getTotalFee();
					itemBalanceDue = itemCapDetail.getBalance();
				}

				//Report Parameters
				var repParams = aa.util.newHashMap();
				//repParams.put("altID", itemCapId.getCustomID());
				repParams.put("p1Value", itemCapIDString); // Used for Ad Hoc Reporting
				
			}//contacs list or additional emails

			//an email needs to be sent to a specified contact type when all fees have been paid.
			if (String(rNotifyContactType) != "" && String(rBalanceAllowed) != "") {
				var itemBalanceDue = 0;
				var itemCapDetailObjResult = aa.cap.getCapDetail(itemCapId);
				if (itemCapDetailObjResult.getSuccess()) {
					itemCapDetail = itemCapDetailObjResult.getOutput();
					itemBalanceDue = itemCapDetail.getBalance();
				}
				if (rBalanceAllowed == false && itemBalanceDue == 0) {
					if (capContactArray) {
						for (y in capContactArray) {
							thisCon = capContactArray[y];
							for (z in rNotifyContactType) {
								if (thisCon.getPeople().getContactType().toUpperCase() == rNotifyContactType[z].toUpperCase()) {
									if (thisCon.getEmail())
										contactObjArray.push(new contactObj(thisCon));
								}
							}
						}
					}
				}
			}

			//Send Email logic
			for (iCont in contactObjArray) {
				var eParamsContact
				if(isEmptyOrNull(eParamsRecord)){
					eParamsContact = aa.util.newHashtable();
				}
				else{
					eParamsContact = eParamsRecord;
				}
				
				
				var rptParamsContact = repParams;
				var tContactObj = contactObjArray[iCont];
				var rEmailTo =  tContactObj.people.getEmail();
				
				tContactObj.getEmailTemplateParams(eParamsContact, "Contact");
				if(testMode){
					logDebug("Contact Info = "+ tContactObj.toString());
					logDebug("Contact Email = "+ tContactObj.people.getEmail());
					logDebug("Contact Name = "+ tContactObj.getContactName());
					logDebug("eParamsContact: "+ eParamsContact);
				}

				if(!isEmptyOrNull(rReportParamContactType)){
					rptParamsContact.put("p2Value", rReportParamContactType);
				}
				

				if (!isEmptyOrNull(rNotificationReport)) {
					reportFiles = new Array();
					repTypeArray = rNotificationReport;

					for (xReport in repTypeArray) {
						var report = repTypeArray[xReport]; 

						if(!matches(rEmailTo,null,undefined,"") && rEmailTo.indexOf("@") > 0){
							runReport4EmailLocal(itemCapId,report,rEmailTo,rptParamsContact,eParamsContact,rNotificationTemplate,itemModule,rFromEmail,rUrl4ACA);
							reportAttached = true;
						}
						else{
							runReportAttach(itemCapId,report,rptParamsContact);
							reportAttached = true;
						}

						
					}
				}
			} // contactObjArray loop

			//code block repeated, we could not create empty CapContactScriptModel object and push() it to 'contactObjArray'
			if (!isEmptyOrNull(rAdditionalEmailsTo)) {
				for (e in rAdditionalEmailsTo) {
					if (isEmptyOrNull(rNotificationReport)) {
						sendNotificationLocal(rFromEmail, rAdditionalEmailsTo[e].trim(), "", rNotificationTemplate, eParamsContact, null, itemCapId);
					} else {
						reportFiles = new Array();
						repTypeArray = rNotificationReport;
						
						for (xReport in repTypeArray) {
							var report = repTypeArray[xReport];
							runReport4EmailLocal(itemCapId,report,rAdditionalEmailsTo[e].trim(),rptParamsContact,eParamsContact,rNotificationTemplate,itemModule,rFromEmail,rUrl4ACA);
							reportAttached = true;
						}
					}
				}//for all extra emails
			}//rAdditionalEmailsTo

			if(!isEmptyOrNull(rNotifyLPType)){
				var eParamsLP = eParamsRecord;
				var rptParamsLP = repParams;
				var licenseProfObjArray = new Array();

				if (rNotifyLPType[0].toUpperCase() == "ALL") {
					licenseProfObjArray = getLicensedProfessionalObjectsByRecord(itemCapId);
				}
				else{
					licenseProfObjArray = getLicensedProfessionalObjectsByRecord(itemCapId,rNotifyLPType);
				}


				for(var lp in licenseProfObjArray){
					var vLPObj = licenseProfObjArray[lp];
				
					var vLPEmail = vLPObj.refLicModel.getEMailAddress();

					
					var eParamsLP = aa.util.newHashtable();
					vLPObj.getEmailTemplateParams(eParamsLP,"Contact");
			
					if(!isEmptyOrNull(rReportParamContactType)){
						rptParamsLP.put("p2Value", rReportParamContactType);
					}
					

					if (isEmptyOrNull(rNotificationReport)) {
						sendNotificationLocal(rFromEmail, vLPEmail, "", rNotificationTemplate, eParamsLP, null, itemCapId);
					} else {
						reportFiles = new Array();
						repTypeArray = rNotificationReport;

						for (xReport in repTypeArray) {
							var report = repTypeArray[xReport]; 
							if(!matches(rEmavLPEmaililTo,null,undefined,"") && vLPEmail.indexOf("@") > 0){
								runReport4EmailLocal(itemCapId,report,vLPEmail,rptParamsLP,eParamsLP,rNotificationTemplate,itemModule,rFromEmail,rUrl4ACA);
							}
							else{
								if(!reportAttached){
									runReportAttach(itemCapId,report,rptParamsLP);
								}
								
							}
						}
					}
				}
			}

		} catch (err) {
			logDebug("Exception generating emails : " + err);
			logDebug("(RUNREPORTANDSENDASYNC) A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
			aa.sendMail(systemMailFrom, debugEmailTo, "", "EXCEPTION: Debug Information in Sending Report Script", debug);
		}
	}
}

function getDocumentList() {
	// Returns an array of documentmodels if any
	// returns an empty array if no documents
	itemCapId = (arguments.length == 1) ? arguments[0] : capId;
	var docListArray = new Array();

	docListResult = aa.document.getCapDocumentList(itemCapId,"ADMIN");

	if (docListResult.getSuccess()) {		
		docListArray = docListResult.getOutput();
	}
	return docListArray;
} 

function addParameter(pamaremeters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		pamaremeters.put(key, value);
	}
}

function getACADocumentDownloadUrl(acaUrl,documentModel) {
  	//returns the ACA URL for supplied document model
	var acaUrlResult = aa.document.getACADocumentUrl(acaUrl, documentModel);

	if(acaUrlResult.getSuccess())
	{
		acaDocUrl = acaUrlResult.getOutput();
		return acaDocUrl;
	}
	else
	{
		logDebug("Error retrieving ACA Document URL: " + acaUrlResult.getErrorType());
		return false;
	}
}

function getACADocumentNameURLParams4Notification(params,pDocName,acaURL)  {
	itemCapId = (arguments.length == 4) ? arguments[3] : capId;
	// pass in a hashtable and it will add the additional parameters to the table

	var vDocListArray = getDocumentList(itemCapId);
	var vDocName = "";
	var vDocDownloadURL = "";

	for(iDoc in vDocListArray){
		var docModel = vDocListArray[iDoc];
		var docNo = docModel.getDocumentNo(); 
		var docCategory = docModel.getDocCategory();
		var docName = docModel.getDocName(); 
		var docStatus = docModel.getDocStatus();
		
		if(docName == pDocName){
			// Find the most current version of the document type
				vDocName = docName;
				vDocDownloadURL = getACADocumentDownloadUrl(acaURL,docModel);
				addParameter(params, "$$acaDocName$$",pDocName);
				addParameter(params, "$$acaDocDownloadURL$$",vDocDownloadURL);
				logDebug("(getACADocumentNameURLParams4Notification) $$acaDocName$$ - " + pDocName +  " $$acaDocDownloadURL$$ - https:\\" + vDocDownloadURL);
		}
	}
	
	return params;
}

function lookup(stdChoice,stdValue) 
	{
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	
   	if (bizDomScriptResult.getSuccess())
   		{
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
		}
	return strControl;
	}

function handleEnvParamters() {
	if(servProvCode == null) servProvCode = "";	
	if(capIDString == null) capIDString = "";
	if(capId == null) capId = "";
	if(reportName == null) reportName = "";
	if(reportAttach == null) reportAttach = true;
	if(module == null) module = "";
	if(reportUser == null) reportUser = "";
	if(errorEmailTo == null) errorEmailTo = "";
	if(debugEmailTo == null) debugEmailTo = "";
	if(emailFrom == null) emailFrom = "";
	if(emailTo == null) emailTo = "";
	if(emailTemplate == null) emailTemplate = "";
	if(systemMailFrom == null) systemMailFrom = "";
}

function logError(dstr) {
	error += dstr + br;
	logDebug(dstr);
}

function printEnv() {
    //Log All Environmental Variables as  globals
    var params = aa.env.getParamValues();
    var keys =  params.keys();
    var key = null;
    while(keys.hasMoreElements())
    {
     key = keys.nextElement();
     eval("var " + key + " = aa.env.getValue(\"" + key + "\");");
     logDebug(key + " = " + aa.env.getValue(key));
    }
}

function convertStringToHashMap(theString) {
    var retObj = aa.util.newHashMap();
    theString = theString.replace(/^\{|\}$/g,'').split(',');
    for(var i=0,cur,pair;cur=theString[i];i++){
        pair = cur.split('=');
        var key = pair[0].trim().toString()
        if (pair[1]) var val = pair[1].toString(); else val = "";
        retObj.put(key,val);
    }
    return retObj;
}

function convertStringToHashTable(theString) {
    var retObj = aa.util.newHashtable();
    theString = theString.replace(/^\{|\}$/g,'').split(',');
    for(var i=0,cur,pair;cur=theString[i];i++){
        pair = cur.split('=');
        var key = pair[0].trim().toString()
        if (pair[1]) var val = pair[1].toString(); else val = "";
        retObj.put(key,val);
    }
    return retObj;
}

function matches(eVal,argList) {
   for (var i=1; i<arguments.length;i++)
   	if (arguments[i] == eVal)
   		return true;

}

function asyncDebug(dstr) {
	aa.debug(aa.getServiceProviderCode() + " : " + myUserId + " : " + capId1 + "-" + capId2 + "-" +capId3, dstr);
	debug+=dstr;
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}


// end user code
if(testMode){
	aa.env.setValue("ScriptReturnCode", "0");
	if (showMessage) aa.env.setValue("ScriptReturnMessage", message);
	if (showDebug) aa.env.setValue("ScriptReturnMessage", debug);
}

/*------------------------------------------------------------------------------------------------------/
| Program: SET_SCRIPT_UPDATE_LICENSE_EXPIRATION.js  Trigger: Batch
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Script Test Parameters
/------------------------------------------------------------------------------------------------------*/
/*
//  SCRIPT TEST PARAMETERS
var mySetID = "TEST_SET_SCRIPT";
var setMemberArray = new Array(); 
var setMemberResult = aa.set.getCAPSetMembersByPK(mySetID);
if (setMemberResult.getSuccess()) 
{
	setMemberArray = setMemberResult.getOutput().toArray();
	aa.env.setValue("SetMemberArray",setMemberArray);
	aa.env.setValue("SetID",mySetID);
	aa.env.setValue("ScriptName","SET_SCRIPT_UPDATE_LICENSE_EXPIRATION");
	aa.env.setValue("CurrentUserID","AWILLIAMS");
} 
else 
{
	logDebug("Error: Could not find set by PK: " + mySetID);
}
*/
/*------------------------------------------------------------------------------------------------------/
| END Script Test Parameters
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 3.0
batchJobName="";
batchJobID="";
var capId;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
eval(getScriptText("INCLUDES_CUSTOM",null,true));
eval(getScriptText("INCLUDES_BATCH"));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)
		servProvCode = aa.getServiceProviderCode();

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
/*------------------------------------------------------------------------------------------------------/
| END Includes
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Initialize Standard Variables
/------------------------------------------------------------------------------------------------------*/
debug = "";	
br = "<BR>";
message =	"";
emailText = "";
currentUserID = aa.env.getValue("CurrentUserID");
systemUserObj = aa.person.getUser(currentUserID).getOutput();
SetMemberArray= aa.env.getValue("SetMemberArray");
SetId =  aa.env.getValue("SetID");
ScriptName =  aa.env.getValue("ScriptName");
sysDate = aa.date.getCurrentDate();
wfObjArray = null;
startDate = new Date();
startTime = startDate.getTime();			// Start timer
systemUserObj = aa.person.getUser(currentUserID).getOutput();
/*------------------------------------------------------------------------------------------------------/
| END Initialize Standard Variables
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Load Script Parameters
/------------------------------------------------------------------------------------------------------*/
var configStdChoice = "SET_SCRIPT_UPDATE_LICENSE_EXPIRATION";  // the standard choice that contains the configuration for this script

// script administration parameters
var script_email_address = lookup(configStdChoice, "script_email_address");
var showDebug = lookup(configStdChoice, "showDebug");	//debug level
if(showDebug=="false" || showDebug=="null" || showDebug==undefined) showDebug=false;

var rec_new_app_status = lookup(configStdChoice, "rec_new_app_status");
var rec_new_exp_date = lookup(configStdChoice, "rec_new_exp_date");
var rec_new_exp_status = lookup(configStdChoice, "rec_new_exp_status");
/*------------------------------------------------------------------------------------------------------/
| END Load Script Parameters
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Custom Code
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");
logDebug("Processing Set: " + SetId);

var success=false;

success = mainProcess();

if(success)
{
	logDebug("Job completed successfully.");
}
else 
{
	logDebug("Job failed, see log.");
}

logMessage("End of Job: Elapsed Time : " + elapsed() + " Seconds");
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

emailText = "Set Script Executed: " + ScriptName + "<br>" + emailText;

if (script_email_address.length)
	aa.sendMail("noreply@accela.com", script_email_address, "", ScriptName + " Results", emailText);


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess()
{

	var capCount = 0;

	/*------------------------------------------------------------------------------------------------------/
	| BEGIN Loop through Set Members
	/-----------------------------------------------------------------------------------------------------*/
	for(var i=0; i < SetMemberArray.length; i++) 
	{
		var id= SetMemberArray[i];
		capId = aa.cap.getCapID(id.getID1(), id.getID2(),id.getID3()).getOutput();	  
		if (!capId)
			{
			logDebug("Could not get a Cap ID for " + id.getID1() + "-" + id.getID2() + "-" + id.getID3());
			continue;
		}
		
		altId = capId.getCustomID();
		parentCapId = capId;
		logDebug("Processing Record: " + altId);
		
		var cap = aa.cap.getCap(capId).getOutput();
		var capStatus = cap.getCapStatus();
		appTypeResult = cap.getCapType();		//create CapTypeModel object
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		appTypeAlias = cap.getCapModel().getAppTypeAlias();

		capCount++;
		// update CAP status from clone config or copy from original
		if (rec_new_app_status.length > 0 && rec_new_app_status != null && rec_new_app_status != "null")
		{
			updateAppStatus(rec_new_app_status, "", capId);
			logMessage(altId + ": Updated Record Status from: " + capStatus + " to " + rec_new_app_status);

		}
		
		// update expiration info from clone config or copy from original
		if(rec_new_exp_status.length > 0 && rec_new_exp_status != null && rec_new_exp_status != "null")
		{
			var expResult = aa.expiration.getLicensesByCapID(capId);
	 		if(!expResult.getOutput().getB1Expiration())
			{
				logDebug(altId + ": ERROR Could not get Renewal Information");
			}
			else
			{
 				var b1Exp = expResult.getOutput();
				var b1Status = b1Exp.getExpStatus();
				var	expDate = b1Exp.getExpDate();
				var b1ExpDate;
				if (expDate) b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();					
				b1Exp.setExpStatus(rec_new_exp_status);
				aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
				// update expiration date based on interval
				if (rec_new_exp_date != null && rec_new_exp_status != "null")
				{
					//rec_new_exp_date = dateAdd(b1ExpDate,parseInt(gracePeriodDays));
					b1Exp.setExpDate(aa.date.parseDate(rec_new_exp_date));
					aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
					logMessage(altId + ": Updated Renewal Info from:  " + b1Status + ", " + b1ExpDate + " to " + rec_new_exp_status + ", " + rec_new_exp_date);
				}
			}   
		}
	}
					
 	logDebug("Total Records in set: " + SetMemberArray.length);
 	logDebug("Total Records processed: " + capCount);
	
	aa.env.setValue("ScriptReturnCode","0");
	aa.env.setValue("ScriptReturnMessage", message); 
	return true;
} 
 
 /*------------------------------------------------------------------------------------------------------/
| END Custom Code
/-----------------------------------------------------------------------------------------------------*/
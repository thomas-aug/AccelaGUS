/*------------------------------------------------------------------------------------------------------/
| Program: SET_SCRIPT_DELETE_TEST_RECORDS.js  Trigger: Set
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Script Test Parameters
/------------------------------------------------------------------------------------------------------*/
/*
//  SCRIPT TEST PARAMETERS
var mySetID = "TESTING ROUND #3 - LICENSE ISSUANCE_20140429:104126";
var setMemberArray = new Array(); 
var setMemberResult = aa.set.getCAPSetMembersByPK(mySetID);
if (setMemberResult.getSuccess()) 
{
	setMemberArray = setMemberResult.getOutput().toArray();
	aa.env.setValue("SetMemberArray",setMemberArray);
	aa.env.setValue("SetID",mySetID);
	aa.env.setValue("ScriptName","SET_SCRIPT_DELETE_TEST_RECORDS");
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
eval(getScriptText("INCLUDES_BASEBATCH"));

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
var configStdChoice = "SET_DELETE_TEST_RECORDS";  // the standard choice that contains the configuration for this script

// script administration parameters
var script_email_address = lookup(configStdChoice, "script_email_address");
var showDebug = lookup(configStdChoice, "showDebug");	//debug level
if(showDebug=="false" || showDebug=="null" || showDebug==undefined) showDebug=false;

var delete_parents = lookup(configStdChoice, "delete_parents");
var delete_children = lookup(configStdChoice, "delete_children");
var delete_record = lookup(configStdChoice, "delete_record");
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

if (script_email_address=="false" || script_email_address=="null" || script_email_address==undefined)
	aa.sendMail("noreply@accela.com", script_email_address, "", ScriptName + " Results", emailText);


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess()
{

	var capCount = 0;
	var childCapCount = 0;
	var parentCapCount = 0;

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

		
		//delete record
		if (delete_record.substr(0,1)=="Y")
		{
		
			if (delete_children.substr(0,1)=="Y")
			{
				var cRecordIDArray = getChildren("*/*/*/*",capId);
				for(iC in cRecordIDArray){
					var childCapId = cRecordIDArray[iC];
					var childAltId = childCapId.getCustomID();

					var removeRecordResult = aa.cap.removeRecord(childCapId);
					if (removeRecordResult.getSuccess())
					{
						childCapCount++
						logMessage("Deleted Child Record: " + childAltId);
					}

				}
			}
			if (delete_parents.substr(0,1)=="Y")
			{
				var pCapId = getParentByCapId(itemCap)

				if(pCapId){
					var pAltId = pCapId.getCustomID();
					var removeRecordResult = aa.cap.removeRecord(pCapId);
					if (removeRecordResult.getSuccess())
					{
						parentCapCount++
						logMessage("Deleted Parent Record: " + pAltId);
					}
				}
			}		
			
			var removeRecordResult = aa.cap.removeRecord(capId);
			if (removeRecordResult.getSuccess())
			{
				capCount++;
				removeRecordResult.getOutput();
				logMessage("Deleted Record: " + altId);
			}
		}
	}
					
 	logDebug("Total Records in Set: " + SetMemberArray.length);
	 logDebug("Total Records Deleted: " + capCount);
	 logDebug("Total Child Records Deleted: " + childCapCount);
	 logDebug("Total Parent Records Deleted: " + parentCapCount);
	
	aa.env.setValue("ScriptReturnCode","0");
	aa.env.setValue("ScriptReturnMessage", message); 
	return true;
} 
 
 /*------------------------------------------------------------------------------------------------------/
| END Custom Code
/-----------------------------------------------------------------------------------------------------*/

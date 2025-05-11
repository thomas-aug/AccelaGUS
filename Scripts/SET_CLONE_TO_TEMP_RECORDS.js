/*------------------------------------------------------------------------------------------------------/
| Program: UPDATES THE PROJECT SOLUTION CUSTOM FIELD SOLUTION DETAIL.Recommend packaging (Certified)
|  Trigger: Batch
| Client:
|
| Version 1.0 - Base Version. 11/19/2015
|
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| BEGIN Initialize Variables
/------------------------------------------------------------------------------------------------------*/
/* START SCRIPT TEST PARAMETERS */
//var mySetID = "LOT ROW BILL_11052015";		//Literal for testing
//var mySetID = "RH CLONE TO TEMP RECORD";
/*
var mySetID = "BUILDING CLONE TO TEMP RECORD";
var setMemberArray = new Array();
var setMemberResult = aa.set.getCAPSetMembersByPK(mySetID);
if (setMemberResult.getSuccess())
{
	setMemberArray = setMemberResult.getOutput().toArray();
	aa.env.setValue("SetMemberArray",setMemberArray);
	aa.env.setValue("SetId",mySetID);
	aa.env.setValue("ScriptName","SET_CLONE_TO_SET_RECORDS");
}
else
{
	aa.print("Error: Could not find set by PK: " + mySetID);
}
*/
/* END SCRIPT TEST PARAMETERS */

var scriptConfig = "";
var debug = "";
var br = "<BR>";
var message = "";
var emailText = "";
var AInfo = []; // editTaskSpecific needs this defined as global
var useAppSpecificGroupName = ""; // getAppSpecific needs this defined as global
var currentUserID = aa.env.getValue("CurrentUserID");
var systemUserObj = aa.person.getUser(currentUserID).getOutput();
var SetMemberArray = aa.env.getValue("SetMemberArray");
var SetId = aa.env.getValue("SetID"); //Un-comment me for real code


var ScriptName = aa.env.getValue("ScriptName");
batchJobName = "";
batchJobID = "";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/

SCRIPT_VERSION = 3.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));

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
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
/*----------------------------------------------------------------------------------------------------/
|
| Start: SCRIPT PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var showDebug = true; //debug level

logDebug("Processing Set: " + SetId);

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var systemUserObj = aa.person.getUser(currentUserID).getOutput();

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

   
if (SetMemberArray.length > 0) {
    try {
	    mainProcess();
    }
    catch(e){
        logDebug("Error running set script: " + e);
    }
    

} else {
	logDebug("**WARNING** : This set has no records.");
}

aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug + message);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {

    eval(getScriptText("INCLUDES_RECORD"));
    

    resultObjArray = new Array();
	var resultObjArray = aa.env.getValue("SetMemberArray")
    for (curRecord in resultObjArray) {
        capId = resultObjArray[curRecord];
        aa.env.setValue("PermitId1", resultObjArray[curRecord].getID1());
        aa.env.setValue("PermitId2", resultObjArray[curRecord].getID2());
        aa.env.setValue("PermitId3", resultObjArray[curRecord].getID3());
        var capIdObject = getCapId();
        //end workaround
        var cap = aa.cap.getCap(capIdObject).getOutput();
        var customID = capIdObject.getCustomID();
        logDebug("=====Processing Record : " + customID);

        var record = new Record(customID);
        
        // set Recommend Packaging custom field
        var recordName = record.getApplicationName();
        var cap = aa.cap.getCap(capIdObject).getOutput();
        recordTypeResult = cap.getCapType();
        recordTypeString = recordTypeResult.toString();
        createChildTempRecord(capIdObject,recordTypeString,recordName);
        
    }
}

function createChildTempRecord(vCapId, recordTypeString, newRecordName) // optional groups to ignore
{
    var childId = null;
    var groupsIgnoreArray;
    if (arguments.length > 0) {
        groupsIgnoreArray = arguments[1];
    }

    // add check for existing reg record
    var cTypeArray = recordTypeString.split("/");
    ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
    ctm.setGroup(cTypeArray[0]);
    ctm.setType(cTypeArray[1]);
    ctm.setSubType(cTypeArray[2]);
    ctm.setCategory(cTypeArray[3]);
    var childId;
    var createChildResult = aa.cap.createSimplePartialRecord(ctm, null, "INCOMPLETE EST");
    if (createChildResult.getSuccess()) {
        childId = createChildResult.getOutput();
        logDebug("New Record ID: " + childId.getCustomID());
    } else {
        logDebug("ERROR Creating child temp record: " + createChildResult.getErrorMessage());
        return false;
    }
    var capId;
    var holdId = capId;
    capId=childId;
    //logDebug("updated record name: " + newRecordName)
    editAppName(newRecordName); 
    capId=holdId;

    // Copy Cap Detail
    aa.cap.copyCapDetailInfo(vCapId, childId);

	//Copy Work Description Field
	aa.cap.copyCapWorkDesInfo(vCapId, childId);

    //copyAdditionalInfo(vCapId, childId);
    copyASIFields(vCapId, childId, null);

    //copy contacts
    copyContacts(vCapId, childId);
    // copy licensed professionals
	copyLicensedProf(vCapId,childId);
    copyParcels(vCapId, childId);
    copyAddresses(vCapId, childId);
    copyOwnerLocal(vCapId, childId);
    copyDocuments(vCapId,childId);

    return childId;
}

//Function will copy all owners from source CAP (sCapID) to target CAP (tCapId)
function copyOwnerLocal(sCapID, tCapID)
{ 
	var ownrReq = aa.owner.getOwnerByCapId(sCapID);
	if(ownrReq.getSuccess())
	{
        var ownrObj = ownrReq.getOutput();

        if(ownrObj !=null && typeof(ownrObj) != "undefined"){
			for (xx in ownrObj)
			{
				ownrObj[xx].setCapID(tCapID);
				aa.owner.createCapOwnerWithAPOAttribute(ownrObj[xx]);
				logDebug("Copied Owner: " + ownrObj[xx].getOwnerFullName());
			}
		}else{
			logDebug("Warning: Error Copying Owner :: ownrObj = " + ownrObj);
		}
	}else{ 
		logDebug("Warning: No owners exist to copy");
	}
}

function copyDocuments(pFromCapId, pToCapId) {
    
          //Copies all attachments (documents) from pFromCapId to pToCapId
            var vFromCapId = pFromCapId;
            var vToCapId = pToCapId;
    
        var capDocResult = aa.document.getDocumentListByEntity(capId,"CAP");
        if(capDocResult.getSuccess())
        {
          if(capDocResult.getOutput().size() > 0)
          {
            for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
            {
              var documentObject = capDocResult.getOutput().get(docInx);
    
                        // download the document content
                        var useDefaultUserPassword = true;
                        //If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
                        var EMDSUsername = null;
                        var EMDSPassword = null;
    
                        var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
                        if(downloadResult.getSuccess())
                        {
                            var path = downloadResult.getOutput();
                            var fileNames = new Array();
                            fileNames[0] = path;
                            //Send Email.
                            logDebug("path=" + path);
                        }
    
                        var tmpEntId = vToCapId.getID1() + "-" + vToCapId.getID2() + "-" + vToCapId.getID3();
                        documentObject.setDocumentNo(null);
                        documentObject.setCapID(vToCapId)
                        documentObject.setEntityID(tmpEntId);
    
                        // Open and process file
                        try
                        {
                            // put together the document content
                            var newContentModel = aa.document.newDocumentContentModel().getOutput();
                            inputstream = new java.io.FileInputStream(path);
                            newContentModel.setDocInputStream(inputstream);
                            documentObject.setDocumentContent(newContentModel);
    
                            var newDocResult = aa.document.createDocument(documentObject);
                            if (newDocResult.getSuccess())
                            {
                                newDocResult.getOutput();
                                logDebug("Successfully copied document: " + documentObject.getFileName());
                            }
                            else {
                                logDebug("Failed to copy document: " + documentObject.getFileName());
                                logDebug(newDocResult.getErrorMessage());
                            }
    
                        }
                        catch (err)
                        {
                            logDebug("Error copying document: " + err.message);
                            return false;
                        }
    
                    }
          }
        }
      }
/*
Title : ACA SkipPage 
Purpose : To skip ACA page based on some rules 
Author: Yazan Barghouth 
 
 Functional Area : PageFlow Description : 
 
 JSON Example : 
 {
  "Building/Commercial/abc/xyz": {
    "Pageflow": [
      {
        "metadata": {
          "description": "To skip ACA page based on some rules",
          "operators": {
            
          }
        },
        "criteria": {
          "customFields": {
            "Street Name": "Gardens"
          },
          "contactFields": {
            "contactType": "Applicant",
            "firstName": "yazan"
          },
          "customLists": {
            "PARTNERS/First Name": "yazan",
            "PARTNERS/Last Name": "saeed",
            "BUSINESS ACTIVITIES/Acticity Desc": "export"
          },
          "customLists": [
            {
              "tableName": "PARTNERS",
              "columnName": "First Name",
              "value": "yazan"
            },
            {
              "tableName": "PARTNERS",
              "columnName": "Last Name",
              "value": "barghouth"
            },
            {
              "tableName": "BUSINESS ACTIVITIES",
              "columnName": "Acticity Desc",
              "value": "export"
            }
          ],
          "lpFields": {
            "licType": "Architect",
            "firstName": "yazan"
          },
          "addressFields": {
            "streetName": "Madena"
          },
          "parcelFields": {
            "Block": "1122",
            "ParcelNumber": "00800"
          }
        },
        "preScript": "",
        "action": {
           "requiredDocuments": [
            "Primary Applicant's Fictitious Business Name Statement",
            "Property Owner Consent Form",
            "Indemnification Agreement",
            "Plan - Business Plan",
            "Plan - Waste Management Plan",
            "Plan - Proposed Location & Neighborhood Compatibility Plan",
            "Equity Ownership Information",
            "Letter - Approval",
            "Zoning and Parking Verification Form",
            "Plan - Secrity Part 1"
          ],
          "requirementType": "CONDITION",
          "validationMessage": "Documents are Required",
          "updateDocumentCategories": true
        },
        "postScript": ""
      }
    ]
  }
}
 
 * updateDocumentCategories only works on DocumentUploadAfter Event
 * Available Types: contactFields, customFields, customLists, parcelFields,
 * addressFields, lpFields
 * 
 * Available Attributes for each type: - Custom Fields and Custom Lists: ALL -
 * Address: All Custom Attributes,
 * (primaryFlag,houseNumberStart,streetDirection,streetName,streetSuffix,city,state,zip,addressStatus,county,country,addressDescription,xCoordinate,yCoordinate) -
 * Parcel: All Custom Attributes,
 * (ParcelNumber,Section,Block,LegalDesc,GisSeqNo,SourceSeqNumber,Page,I18NSubdivision,CouncilDistrict,RefAddressTypes,ParcelStatus,ExemptValue,PublicSourceSeqNBR,CensusTract,InspectionDistrict,NoticeConditions,ImprovedValue,PlanArea,Lot,ParcelArea,Township,LandValue) -
 * Licensed Professional: All Custom Attributes,
 * (licType,lastName,firstName,businessName,address1,city,state,zip,country,email,phone1,phone2,lastRenewalDate,licExpirationDate,FEIN,gender,birthDate) -
 * Contact: All Custom Attributes,
 * (firstName,lastName,middleName,businessName,contactSeqNumber,contactType,relation,phone1,phone2,email,addressLine1,addressLine2,city,state,zip,fax,notes,country,fullName,peopleModel)
 */

/*
 * current page index and current step index are expected to be passed from the
 * global Page Flow Event
 */


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

// This should be included in all Configurable Scripts
eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
var scriptSuffix = "CONDITION_DOCUMENTS";

try {
    //showDebug = true;
	var settingsArray = [];
	if (isConfigurableScript(settingsArray, scriptSuffix)) {
		for (s in settingsArray) {
			var rules = settingsArray[s];

			var preScript = rules.preScript;
			var postScript = rules.postScript;

			if (!matches(preScript, null, "")) {
				eval(getScriptText(preScript));
			}
			if (cancelCfgExecution) {
				logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
				cancelCfgExecution = false;
				continue;
			}

            var criteria = rules.criteria;
            var action = rules.action;
            
            requirementType = action.requirementType;
            validationMessage = action.validationMessage;
            requiredDocuments = action.requiredDocuments;
            
            if(requiredDocuments != null && requiredDocuments.length > 0){
                logDebug("requiredDocuments: " + requiredDocuments)
                applyConditionDocuments("Required Documents", requiredDocuments);
            }      

            if(action.updateDocumentCategories && action.updateDocumentCategories == true){
                updateDocumentCategories();
            }

			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}

		}// for all settings
	}// isConfigurableScript()
} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
/// this function will validate documents based on the rules in the JSON.
function applyConditionDocuments(conditionType, reqDocs) {

    // loop through required docs array
    for (var d in reqDocs) {

        var requiredDocType = reqDocs[d];
        var condExists = hasConditionDocument(capId, conditionType, requiredDocType);

        // if cond does not already exist, create one
        if (!condExists) {
            // get the standard condition
            var standardConditionsResult = aa.capCondition.getStandardConditions(conditionType, requiredDocType);
            if (standardConditionsResult.getSuccess()) {

                var standardConditions = standardConditionsResult.getOutput();
                for (con in standardConditions) {
                    var stdCondID = standardConditions[con].getConditionNbr();
                    aa.capCondition.createCapConditionFromStdCondition(capId, stdCondID);
                    logDebug("Added required condition document: " + requiredDocType);
                    //stop on first one
                    break;
                }
            }
        }
    }
}

function hasConditionDocument(vCapId, pType, pDesc) {
    // Checks to see if conditions have been added to CAP
    // 06SSP-00223
    //

    if (pType == null)
        var condResult = aa.capCondition.getCapConditions(vCapId);
    else
        var condResult = aa.capCondition.getCapConditions(vCapId, pType);

    if (condResult.getSuccess())
        var capConds = condResult.getOutput();
    else {
        logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
        logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
        return false;
    }

    var cStatus;
    var cDesc;
    var cImpact;

    for (cc in capConds) {
        var thisCond = capConds[cc];
        var cStatus = thisCond.getConditionStatus();
        var cDesc = thisCond.getConditionDescription();
        var cImpact = thisCond.getImpactCode();
        var cType = thisCond.getConditionType();
        if (cStatus == null)
            cStatus = " ";
        if (cDesc == null)
            cDesc = " ";
        if (cImpact == null)
            cImpact = " ";
        //Look for matching condition
        if (pDesc.toUpperCase().equals(cDesc.toUpperCase()))
            return true; //matching condition found
    }
    return false; //no matching condition found
} //function


function updateDocumentCategories(){
    var documentModels;
    var partialCap = !cap.isCompleteCap();
    logDebug("partialCap = " + partialCap);

    if (controlString && controlString == "DocumentUploadAfter") {
        if (partialCap && documentModelArray != null) {
            documentModels = documentModelArray.toArray();
        }
        else{
            documentModels = getDocumentList();
        }
    }
    else if(!documentModels){
        documentModels = getDocumentList();
    }
        
        
        
    var documentModel = null;
    var conditionNumber = 0;
 
    logDebug("documentModels.length = " + documentModels.length);
 
    for (var i in documentModels) {
        documentModel = documentModels[i];
        logDebug(" i = " + i);
        conditionNumber = documentModel.getConditionNumber();
        var documentCategory = documentModel.getDocCategory();

        if(matches(documentCategory,null,undefined,"")){

            if (conditionNumber != null && conditionNumber != 0) {
                var capConditionResult 
                //capConditionResult = aa.capCondition.getCapCondition(capId, conditionNumber);
                capConditionResult = aa.capCondition.getCapConditions(capId);
                if (capConditionResult.getSuccess()) {
                    
                    var capCondition // = capConditionResult.getOutput();
                    var capConditionArray = capConditionResult.getOutput();

                    for(iC in capConditionArray){
                        capCondition = capConditionArray[iC];
                                                
                        if(conditionNumber == capCondition.getReferenceConditionNumber()){
                            //logDebug("Found Doc Condition Number : " + conditionNumber + " = Cond Number : "+ capCondition.getReferenceConditionNumber())

                            var conditionGroup = capCondition.getConditionGroup();
                            var conditionName = capCondition.getConditionDescription();
                            //logDebug("Condition Name - " + conditionName);
                            //logDebug("Condition Group - " + conditionGroup);
                            documentModel.setDocCategory(conditionName);
                            documentModel.setDocGroup(conditionGroup);
                            if(documentModel.getDocDescription() == null){
                                documentModel.setDocDescription(conditionName);
                            }
                            
                            var updateDocumentResult = aa.document.updateDocument(documentModel);
                            if (updateDocumentResult.getSuccess()) {
                                logDebug("Update document model successfully - " + documentModel.getDocName());
                            } else {
                                logDebug("Update document model failed - " + documentModel.getDocName());
                            }
                        }  
                    
                    }
                
                } else {
                    logDebug("No condition number - " + documentModel.getDocName());
                }
            }
        }
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
} else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-1");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    } else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}
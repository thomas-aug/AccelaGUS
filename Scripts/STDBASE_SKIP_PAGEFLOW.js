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
          "step": "1",
          "page": "2"
        },
        "postScript": ""
      }
    ]
  }
}
 
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
var currentPageIndex = 2;
var currentStepIndex = 1;

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
var scriptSuffix = "PAGEFLOW_SKIP";

try {
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

			skipPageFlow(rules);

			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}

		}// for all settings
	}// isConfigurableScript()
} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * Check if script is being executed in required page/step (obtained from JSON rules) then Skips current page
 * @param a rules JSON rules element from array settingsArray
 * @returns {Boolean}
 */
function skipPageFlow(rules) {

	var step = rules.action.step;
	var page = rules.action.page;

	// check currentStepIndex and currentPageIndex with configuration step
	// and page
	if ((parseInt(step) != currentStepIndex) || (parseInt(page) != currentPageIndex)) {
		return false;
	}
	aa.env.setValue("ReturnData", "{'PageFlow':{'HidePage':'Y'}}");
	return true;
}

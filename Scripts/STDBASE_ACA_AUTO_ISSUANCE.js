/*Title : ACA Auto Issuance 
Purpose : to apply several actions based on the provided JSOn
Author: Haetham Eleisah
Functional Area : ACA CTRCA Event Only
Description : JSON Example :
{
  "Marijuana/Entity/Prequalification/Application": {
    "ConvertToRealCAPAfter": [
      {
        "metadata": {
          "description": "To apply several actions based on the provided JSON",
          "operators": {
            
          }
        },
        "criteria": {
          "feesPaid": false,
          "customFields": {
            "Legal Business Name": "bzns name"
          },
          
        },
        "preScript": "",
        "action": {
          "applicationStatus": "Issued",
          "updateTask": [
            {
              "task": "Intake",
              "status": "Accepted"
            },
            {
              "task": "Investigation",
              "status": "Completed"
            },
            {
              "task": "Pre Board Review",
              "status": "Recommend Approval"
            },
            {
              "task": "Board Review",
              "status": "Approved"
            },
            {
              "task": "Application Issuance",
              "status": "Issued"
            },
            
          ]
        },
        "postScript": ""
      }
    ]
  }
}
		
		
Available Types: contactFields, customFields, customLists, parcelFields, addressFields, lpFields

Available Attributes for each type: 
- Custom Fields and Custom Lists: ALL
- Address: All Custom Attributes, (primaryFlag,houseNumberStart,streetDirection,streetName,streetSuffix,city,state,zip,addressStatus,county,country,addressDescription,xCoordinate,yCoordinate)
- Parcel: All Custom Attributes, (ParcelNumber,Section,Block,LegalDesc,GisSeqNo,SourceSeqNumber,Page,I18NSubdivision,CouncilDistrict,RefAddressTypes,ParcelStatus,ExemptValue,PublicSourceSeqNBR,CensusTract,InspectionDistrict,NoticeConditions,ImprovedValue,PlanArea,Lot,ParcelArea,Township,LandValue)
- Licensed Professional: All Custom Attributes, (licType,lastName,firstName,businessName,address1,city,state,zip,country,email,phone1,phone2,lastRenewalDate,licExpirationDate,FEIN,gender,birthDate)
- Contact: All Custom Attributes, (firstName,lastName,middleName,businessName,contactSeqNumber,contactType,relation,phone1,phone2,email,addressLine1,addressLine2,city,state,zip,fax,notes,country,fullName,peopleModel)
 */

eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
var scriptSuffix = "ACA_AUTO_ISSUANCE";

var settingsArray = [];

//this script should ONLY run in ConvertToRealCAPAfter CTRCA
var allowedEvents = [ "ConvertToRealCAPAfter" ];

try {
	isConfigurableScript(settingsArray, scriptSuffix, allowedEvents);

	//script should run only if ACA (publicUser) settings array cleared in case not ACA
	if (!isPublicUser) {
		settingsArray = new Array();
	}

	for (s in settingsArray) {
		var rules = settingsArray[s];
		// run preScript
		if (!matches(rules.preScript, null, "")) {
			eval(getScriptText(rules.preScript, null, false));
		}

		if (cancelCfgExecution) {
			logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
			cancelCfgExecution = false;
			continue;
		}

		ACAIssueRecords(rules);

		/// run post script
		if (!matches(rules.postScript, null, "")) {
			eval(getScriptText(rules.postScript, null, false));
		}
	}

} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * this function will check the JSON Rules in order to issue the needed records.
 * @param rules is the JSON abject that provided from the JSON File CONF_"SOLUTION"_ACA_AUTO_ISSUANCE
 * 
 */
function ACAIssueRecords(rules) {

	var ValidBalance = true;
	if (rules.criteria.feesPaid) {
		if (balanceDue > 0)
			ValidBalance = false;
	}

	if (!ValidBalance) {
		return;
	}

	if (rules.action.applicationStatus != "" && rules.action.applicationStatus != null) {
		updateAppStatus(rules.applicationStatus, 'by script');
	}

	if (rules.action.updateTask != null && rules.action.updateTask != "") {
		for ( var t in rules.action.updateTask) {
			var taskItem = rules.action.updateTask[t];

			var taskResult = aa.workflow.getTask(capId, taskItem.task);
			var currentTask = taskResult.getOutput();
			if (currentTask != null && currentTask != "") {
				activateTask(taskItem.task);
				currentTask.setSysUser(aa.person.getCurrentUser().getOutput());
				currentTask.setDisposition(taskItem.status);
				var updateResult = aa.workflow.handleDisposition(currentTask.getTaskItem(), capId);
			}
		}
	}
}

//we need this in case INCLUDES_ACCELA_FUNCTION is Master Script in the ENV.
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

/*Title : Activity Automation
Purpose : Automate activity creation based on certain criteria
Author: Haetham Eleisah
Functional Area : All After Events
Description : JSON Example :
{
  "Building/Commercial/New Construction/NA": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "To Automate activity creation based on certain criteria",
          "operators": {
            
          }
        },
        "criteria": {
          "customFields": {
            "Custom Field 1": "Value 1",
            "Custom Field 2": "Value 2"
          },
          "customLists": [
            {
              "tableName": "CUSTOM LIST",
              "columnName": "Item Numer",
              "value": "12345"
            },
            {
              "tableName": "CUSTOM LIST",
              "columnName": "Item Description",
              "value": "haetham"
            }
          ],
          "contactFields": {
            "Contact Type": "Applicant",
            "Custom Field": "Value"
          },
          "addressFields": {
            "Zip Code": "12345",
            "Custom Field": "Value"
          },
          "parcelFields": {
            "Zone": "Historic"
          },
          "lpFields": {
            "Professional Type": "Engineer",
            "Custom Field": "Value"
          },
          "recordStatus": [
            "Waiting For Revisions"
          ]
        },
        "preScript": "",
        "action": {
          "activityName": "Urgent Override",
          "activityDescription": "This records need an override as it is for emergency work",
          "activityType": "Override",
          "activityStatus": "Active",
          "activityPriority": "",
          "activityStart": "12/01/2017",
          "activityDue": "",
          "activityDept": "",
          "activityUser": ""
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

try {
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var scriptSuffix = "ACTIVITY_AUTOMATION";
	var settingsArray = [];
	isConfigurableScript(settingsArray, scriptSuffix);
	for (s in settingsArray) {
		var rules = settingsArray[s];
		if (!matches(rules.preScript, null, "")) {
			eval(getScriptText(rules.preScript, null, false));
		}

		if (cancelCfgExecution) {
			logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
			cancelCfgExecution = false;
			continue;
		}

		ActivityAutomation(rules);

		/// run post script
		if (!matches(rules.postScript, null, "")) {
			eval(getScriptText(rules.postScript, null, false));
		}

	}
} catch (ex) {
	logDebug("**ERROR:Exception while verificaiton the rules for " + scriptSuffix + ". Error: " + ex);
}
/**
 * this function for the activity automation based on the provided JSON
 * @param rules the provided rules from the JSON
 */
function ActivityAutomation(rules) {
	var activityModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.servicerequest.ActivityModel").getOutput();
	activityModel.setCapID(capId);
	activityModel.setActivityName(rules.action.activityName);
	if (!isEmptyOrNull(rules.action.activityDescription))
		activityModel.setActivityDescription(rules.action.activityDescription);
	if (!isEmptyOrNull(rules.action.activityDue))
		activityModel.setActDueDate(getFormattedDate(rules.action.activityDue));
	if (!isEmptyOrNull(rules.action.activityUser)) {
		var user = aa.person.getUser(rules.action.activityUser).getOutput();
		activityModel.setAssignedStaffID(rules.action.activityUser);
	}
	if (!isEmptyOrNull(rules.action.activityDept))
		activityModel.setAssignedDeptNumber(rules.action.activityDept);

	if (!isEmptyOrNull(rules.action.activityPriority))
		activityModel.setPriority(rules.action.activityPriority);
	activityModel.setActivityType(rules.action.activityType);
	activityModel.setActStatus(rules.action.activityStatus);
	activityModel.setStatus(rules.action.activityStatus);
	activityModel.setActDate(getFormattedDate(rules.action.activityStart));
	activityModel.setServiceProviderCode(aa.getServiceProviderCode());
	activityModel.setAuditID(aa.getAuditID());
	activityModel.setInternalOnly("Y");
	var result = aa.activity.createActivity(activityModel).getOutput();
}

function getFormattedDate(dateString) {
	var date = new Date(dateString);
	return date;
}

/*==========================================================================================
Title : inspectionScheduling
Purpose : Schedules an inspection using the rules included in the JSON object. 
			Please see instructions in document InspectionScheduling Configurable Script Instructions.xlsx for important configuration information. 
Author: Nickie Albert
Functional Area : inspections
Description : JSON must contain :
	"Licenses/Business/Retail/Application": {						//record type to run
		"ApplicationSubmitAfter":[{									//event to run (supports workflow task and status and inspection type and status); structured as an array, another set of rules can be added
			"preScript": null,										//custom script to run prior to scheduling script
			"criteria":{
			    "isCreatedByACA": true,									//true or false
				"contactFields": {										//contact information (more fields can be added, as needed)
					"contactType": "Applicant",							//If other contact fields (ie. address, email, etc) are entered, they need to follow field name format for match to be made (see instructions) 
					"Custom Field": "Value"								// they need to follow field name format for match to be made (see instructions for available fields) 
				},													
				"customFields": {										//custom fields to be used in script (more fields can be added, as needed)
					"Custom Field 1": "Value 1",
					"Custom Field 2": "Value 2"
				},
				"customLists": [                                      //custom list fields (objects) to validate: tableName,columnName,value
			        {
			          "tableName": "tableName1",
			          "columnName": "columnName1",
			          "value": "val1"
			        },
			        {
			          "tableName": "tableName2",
			          "columnName": "columnName2",
			          "value": "value2"
			        }
			     ],
				"addressFields": {										//If other address fields (ie. house number, street name, etc) are entered
					"zip": "12345",										// they need to follow field name format for match to be made (see instructions for available fields) 
					"Custom Field": "Value"
				},
				"lpFields": {											//If other LP fields (ie. address1, lastRenewalDate, etc) are entered
					"licType": "Engineer",								// they need to follow field name format for match to be made (see instructions for available fields)
					"Custom Field": "Value"
				}
			},
			"action":{
				"inspectionType": "Initial Inspection",					//Inspection type to create,
				"feeItems": [
	            {                                                       //array of Fees to add
	              "schedule": "LIC_INSP",
	              "period": "FINAL",
	              "code": "INSP_001",
	              "qty": 1,
	              "invoice": "Y"
	            },
	            {
	              "schedule": "LIC_INSP",
	              "period": "FINAL",
	              "code": "INSP_002",
	              "qty": 3,
	              "invoice": "Y"
	            }
	          ],
			"rangeType":"Days",										//valid values are "Days" or "Months"
			"range": 14,											//number in rangeType (i.e., 30 Days, 2 Months, etc)
			"assignment":"Auto",									//how to assign an inspector, if "Auto", will use function autoAssign, if "Record", assign to person assigned to the record, if blank, will look for value in inspector field. If no value, will schedule w/o assignment.
			"inspector":"",											//specific inspector userid to assign inspection to, assignment field should be left blank
			"department":"",										//seven level structure of department (i.e., Agency/Licenses/Inspections/NA/NA/NA/NA)
			"comments": "Inspection Scheduled via EMSE",			//any comments to include on the inspection
			}
			"postScript": "CUSTOM_SCRIPT"							//custom script to run after the scheduling script
		},
	}],
Reviewed By: 
Script Type : (EMSE, EB, Pageflow, Batch): EMSE
General Purpose/Client Specific : General
Client developed for : Aurora
Parameters: capId, rules				
================================================================================================================*/
try {
	var scriptSuffix = "INSPECTION_SCHEDULING";
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var settingsArray = [];
	if (isConfigurableScript(settingsArray, scriptSuffix)) {

		for (s in settingsArray) {
			var rules = settingsArray[s];

			var preScript = rules.preScript;
			if (!matches(preScript, null, "")) {
				eval(getScriptText(preScript));
			}
			if (cancelCfgExecution) {
				logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
				cancelCfgExecution = false;
				continue;
			}
			inspectionScheduling(capId, rules);

			var postScript = rules.postScript;
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		}
	}

} catch (ex) {
	logDebug("**ERROR: Exception with JSON rules for script " + scriptSuffix + ". Error: " + ex);
}
// functions

function inspectionScheduling(capId, rules) {

	var inspecType = rules.action.inspectionType;
	var feeItems = rules.action.feeItems;
	var createdByACA = rules.criteria.isCreatedByACA;

	var rangeType = rules.action.rangeType;
	var range = rules.action.range;
	var assignment = rules.action.assignment;
	var inspector = rules.action.inspector;
	var dept = rules.action.department;
	var comments = rules.action.comments;

	// rules loop 
	logDebug("createdByACA: " + createdByACA);
	logDebug("isCreatedByACA: " + cap.isCreatedByACA());

	var schedule = true;
	if (!isEmptyOrNull(createdByACA)) {
		if (createdByACA && cap.isCreatedByACA()) {
			schedule = true;
		}
		if (createdByACA && !cap.isCreatedByACA()) {
			schedule = false;
		}
		if (!createdByACA && !cap.isCreatedByACA()) {
			schedule = true;
		}
		if (!createdByACA && cap.isCreatedByACA()) {
			schedule = false;
		}

	} else { // field not exist, so not a factor
		schedule = true;
	}

	logDebug("schedule: " + schedule);

	/*==========================================================================================
	|  all tests complete - schedule and assign inspection
	======================================================================================= */

	if (schedule) {
		//recId = getApplication(capId);

		//logDebug("should be in here: " + schedule);
		// get # of days out to schedule
		var daysToSched = 0
		if (!matches(range, null, "", 0)) {
			if (rangeType != "Days") {
				if (rangeType = "Months") {
					var today = new Date();
					var outDate = addMonths(today, range);
					daysToSched = dateDiff(today, outDate).toFixed();
				} else {
					logDebug("Unsupported rangeType");
				}
			} else {
				daysToSched = range;
			}
		}
		switch (assignment) {
		case "Auto":
			scheduleInspectionLocal(capId, inspecType, daysToSched, "", "", comments);
			// get inspectionID for inspection just created and assign
			var inspectionIdArray = new Array();
			var inspResultObj = aa.inspection.getInspections(capId);
			if (inspResultObj.getSuccess()) {
				inspList = inspResultObj.getOutput();
				for (xx in inspList) {
					var inspectionIdNumber = inspList[xx].getIdNumber();
					var idInspType = inspList[xx].getInspectionType();
					if (idInspType == inspecType) {
						// inspectionIdArray.push(inspectionIdNumber);
						//logDebug("inspectionIdNumber : " + inspectionIdNumber); 
						autoAssignInspection(inspectionIdNumber);
					}
				}
			}
			break;
		case "":
			// if assignment is blank, look for a value in the inspector field and assign to them 
			// if no value, schedule w/o assignment
			if (!matches(inspector, null, "")) {
				//scheduleInspection(inspecType, daysToSched, inspector, "", comments);
				scheduleInspectionLocal(capId, inspecType, daysToSched, inspector, "", comments);
				//logDebug("inspector: " + inspector);
			} else {
				// logDebug("inspector: " + inspector);
				// logDebug("inspecType: " + inspecType);
				scheduleInspectionLocal(capId, inspecType, daysToSched, "", "", comments);
			}
			break;
		case "Record":
			// if assignment = Record, schedule and assign to the record holder
			capDetail = aa.cap.getCapDetail(capId).getOutput();
			userObj = aa.person.getUser(capDetail.getAsgnStaff());
			if (userObj.getSuccess()) {
				staff = userObj.getOutput();
				userID = staff.getUserID();
				logDebug("userID: " + userID);
				scheduleInspectionLocal(capId, inspecType, daysToSched, userID, "", comments);
			} else {
				scheduleInspectionLocal(capId, inspecType, daysToSched, "", "", comments);
			}
			break;
		default:
			break;
		} // switch

		//add Fees
		if (!isEmptyOrNull(feeItems)) {
			for (f in feeItems) {
				var feeItm = feeItems[f];
				updateFee(feeItm.code, feeItm.schedule, feeItm.period, feeItm.qty, feeItm.invoice);
			}
		}
	}//okToSched	
}

/*==========================================================================================
| HELPER FUNCTIONS
========================================================================================== */

function addMonths(date, count) {
	if (date && count) {
		var m, d = (date = new Date(+date)).getDate()

		date.setMonth(date.getMonth() + count, 1)
		m = date.getMonth()
		date.setDate(d)
		if (date.getMonth() !== m)
			date.setDate(0)
	}
	return date
}

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

function scheduleInspectionLocal(itemCap, iType, DaysAhead) // optional inspector ID.  This function requires dateAdd function
{
	// DQ - Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110) 
	// DQ - Added Optional 5th parameter inspComm ex. to call without specifying other options params scheduleInspection("Type",5,null,null,"Schedule Comment");
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	if (arguments.length >= 3)
		if (arguments[3] != null) {
			var inspRes = aa.person.getUser(arguments[3])
			if (inspRes.getSuccess())
				var inspectorObj = inspRes.getOutput();
		}

	if (arguments.length >= 4)
		if (arguments[4] != null)
			inspTime = arguments[4];

	if (arguments.length == 5)
		if (arguments[5] != null)
			inspComm = arguments[5];

	var schedRes = aa.inspection.scheduleInspection(itemCap, inspectorObj, aa.date.parseDate(dateAdd(null, DaysAhead)), inspTime, iType, inspComm)

	if (schedRes.getSuccess())
		logDebug("Successfully scheduled inspection : " + iType + " for " + dateAdd(null, DaysAhead));
	else
		logDebug("**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
}

function getApplication(appNum)
//
// returns the capId object of an application
//
{
	var getCapResult = aa.cap.getCapID(appNum);
	if (getCapResult.getSuccess())
		return getCapResult.getOutput();
	else {
		logDebug("**ERROR: getting cap id (" + appNum + "): " + getCapResult.getErrorMessage())
	}
}

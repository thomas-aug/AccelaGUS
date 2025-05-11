/*Title : Record Validation
Purpose : TO validate record type based on the provided JSON 
Author: Haetham Eleisah
Functional Area : ACA,AV Events
Description : JSON Example :
 {
  "Marijuana/Retail/Retail Store/Renewal": {
    "ApplicationSubmitBefore": [
      {
        "metadata": {
          "description": "test records",
          "operators": {
            
          }
        },
        "preScript": " ",
        "criteria": {
          "customFields": {
            "Alarm Permit Number": "123455"
          },
        "customLists": [
            {
              "tableName": "Ownership Information",
              "columnName": "Name",
              "value": "33"
            }
          ],
          "requiredLP": [
            "test haetham"
          ],
          "validateLP": false,
          "requiredContact": [
            "Applicant"
          ],
          "allowBalance": true,
          "chkInvoicedFees":true,
          "parentRequired": [
            "Marijuana/Combo/Testing Facility/Application"
          ],
          "parentRecordStatus": [
            "Active"
          ],
          "childRequired": [
            "Marijuana/Combo/Testing Facility/Renewal"
          ],
          "childRecordStatus": [
            "Renewed"
          ],
          "requiredField": [
            "Name"
          ],
          "taskRequired": [
            "Accepted"
          ],
          "inspectionRequired": [
            "Initial Facility Insp"
          ],
          "assignedUserRequired": false,
          "assignedWorkflowTaskUser": false,
          "RowRequiredInASIT": [
            "OWNERSHIP INFORMATION",
            "TESTHAETHAM"
          ],
          "numberLP": 1,
          "numberContacts": 1,
          
        },
        "action": {
          "validationMessage": "",
          
        },
        "postScript": ""
      }
    ],
    
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
	var scriptSuffix = "RECORD_VALIDATION";
	var settingsArray = [];
	isConfigurableScript(settingsArray, scriptSuffix);
	for (s in settingsArray) {
		var validationMessage = "";
		var rules = settingsArray[s];
		var operators = rules.metadata.operators;
		// run preScript
		if (!isEmptyOrNull(rules.preScript)) {
			eval(getScriptText(rules.preScript, null, false));
		}
		if (cancelCfgExecution) {
			logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
			cancelCfgExecution = false;
			continue;
		}

		validateRecord(rules);

		/// run post script
		if (!isEmptyOrNull(rules.postScript)) {
			eval(getScriptText(rules.postScript, null, false));
		}
	}

} catch (ex) {
	logDebug("**ERROR: Exception while verifying the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * this function will validate the JSON Rules in order to verify if the rules matched or not.
 * @param rules is the JSON abject that provided from the JSON File CONF_"SOLUTION"_RECORD_VALIDATION
 * 
 * @returns true if the rules is matched otherwise will returns false
 */
function validateRecord(rules) {

	var lpArray = [];
	var LPrequiredCount = 0;
	var contactsArray = [];
	var contactrequiredCount = 0;
	// this to  check if there is required LP related to the record.
	if (!isEmptyOrNull(rules.criteria.requiredLP)) {
		var requiredLPArray = rules.criteria.requiredLP;
		var isExists = false;
		getLPFields(lpArray);
		if (lpArray.length == 0 || !lpArray)
			isExists = false;
		for ( var licene in requiredLPArray) {
			for (ca in lpArray) {

				if (lpArray[ca]["licType"] == requiredLPArray[licene]) {
					isExists = true
					LPrequiredCount += 1;
				}
			}
		}
		if (!isExists) {
			validationMessage += "these LP are requird " + rules.criteria.requiredLP + '</br>';
		}

	}
	// this to  check if related LP's is valid or not.
	if (!isEmptyOrNull(rules.criteria.validateLP)) {
		var isExpired = false;
		if (lpArray.length == 0)
			getLPFields(lpArray);
		for ( var licene in requiredLPArray) {
			for (ca in lpArray) {
				if (capHasExpiredLicProf("EXPIRE", lpArray[ca]["licType"])) {
					isExpired = true;
					break;
				}
			}
		}
		if (isExpired) {
			validationMessage += '</br>' + "this LP are expired " + rules.criteria.validateLP + '</br>';

		}
	}
	// this to  check if the count of  LP's is valid or not.
	if (!isEmptyOrNull(rules.criteria.numberLP) && parseInt(rules.criteria.numberLP) > 0 && !isNaN(parseInt(rules.criteria.numberLP))) {
		var lbCount = 0;
		var isValid = true;
		if (lpArray.length == 0)
			getLPFields(lpArray);

		lbCount = lpArray.length;
		if (LPrequiredCount > 0) {
			if (parseInt(rules.criteria.numberLP) > LPrequiredCount) {
				validationMessage += '</br>' + "there is should be " + rules.criteria.numberLP + " from these  Licenses " + requiredLPArray + '</br>';

			}
		} else if (lbCount < rules.criteria.numberLP) {
			validationMessage += '</br>' + "there is should be " + rules.criteria.numberLP + " Licenses" + '</br>';

		}

	}
	// this to  check if there is required contacts related to the record.
	if (!isEmptyOrNull(rules.criteria.requiredContact)) {
		contactsArray = getContacts();
		var requiredContactArray = rules.criteria.requiredContact;
		var isExists = false;
		if (!contactsArray)
			isExists = false;
		for ( var con in requiredContactArray) {
			for (ca in contactsArray) {
				if (contactsArray[ca]["contactType"] == requiredContactArray[con]) {
					isExists = true;
					contactrequiredCount += 1;
					contactLabel += requiredContactArray[con] + ",";

				}

			}
		}

		if (!isExists) {
			validationMessage += '</br>' + "these contacts are requird " + requiredContactArray + '</br>';

		}

	}
	// this to  check if the count of Contacts is valid or not.
	if (!isEmptyOrNull(rules.criteria.numberContacts)) {

		var countactsCount = 0;
		var isValid = true;
		if (isEmptyOrNull(contactsArray)) {
			contactsArray = getContacts();
		}
		countactsCount = contactsArray.length;
		if (contactrequiredCount > 0) {
			if (parseInt(rules.criteria.numberContacts) > parseInt(contactrequiredCount)) {
				validationMessage += '</br>' + " there is should be " + rules.criteria.numberContacts + " from these Contacts " + requiredContactArray + '</br>';

			}
		} else if (countactsCount < parseInt(rules.criteria.numberContacts)) {
			validationMessage += '</br>' + "there is should be " + rules.criteria.numberContacts + " Contacts" + '</br>';

		}

	}
	
	// this to  check if the record has balance or not.
	if (rules.criteria.hasOwnProperty("allowBalance") && !rules.criteria.allowBalance) {
		var capDetails = aa.cap.getCapDetail(capId).getOutput();
		if (capDetails.getBalance() > 0) {
			validationMessage += '</br>' + " this record has balance " + capDetails.getBalance() + '</br>';
		}else{
			if (rules.criteria.chkInvoicedFees) {
				var feesArr = loadFees(capId);
				for ( var i in feesArr) {
					if (feesArr[i].status == "NEW") {
						validationMessage += '</br>'
							+ " there are fees assessed but not invoiced "
							+ '</br>';
						break;
					}
				}
			}
		}

	}
	
	// this to check the parent records for the current record
	if (!isEmptyOrNull(rules.criteria.parentRequired)) {
		var parentRequiredArray = rules.criteria.parentRequired;
		var parentRecordStatusArray = rules.criteria.parentRecordStatus;
		var isMatched = true;
		var isStatusMatched = false;
		for ( var par in parentRequiredArray) {
			var parentCapID = getParentByCapId(capId);

			if (parentCapID != false) {
				var parnetCap = aa.cap.getCap(parentCapID).getOutput();
				var parentAppTypeResult = parnetCap.getCapType();
				var parentAppTypeString = parentAppTypeResult.toString();
				var parentCapStatus = parnetCap.getCapStatus();
				if (parentRequiredArray[par] != parentAppTypeString) {
					isMatched = false;

				}
				// this to check the parent record status if the record is exists
				if (!isEmptyOrNull(rules.criteria.parentRecordStatus)) {
					if (isMatched) {
						for ( var st in parentRecordStatusArray) {
							if (parentCapStatus == parentRecordStatusArray[st]) {
								isStatusMatched = true;
								break;

							}
						}
					}
				}

			} else {
				isMatched = false;

			}
		}

		if (!isMatched) {
			validationMessage += '</br>' + " this record should have parent </br> " + rules.criteria.parentRequired + '</br>';
		}

		if (!isStatusMatched && !isEmptyOrNull(rules.criteria.parentRecordStatus)) {
			validationMessage += '</br>' + " the parent records status should be in </br> " + rules.criteria.parentRecordStatus + '</br>';
		}
	}
	// this to check the child records for the current record
	if (!isEmptyOrNull(rules.criteria.childRequired)) {
		var childRequiredArray = rules.criteria.childRequired;
		var childCapList = aa.cap.getChildByMasterID(capId).getOutput();
		var childRecordStatusArray = rules.criteria.childRecordStatus;
		var isStatusMatched = false;
		var isMatched = true;
		if (childCapList != null) {
			for (var i = 0; i < childCapList.length; i++) {
				for ( var obj in childRequiredArray) {
					var childCapID = childCapList[i].getCapID()
					var childCap = aa.cap.getCap(childCapID).getOutput();
					var childAppTypeResult = childCapList[i].getCapType();
					var childAppTypeString = childAppTypeResult.toString();
					var childCapStatus = childCap.getCapStatus();

					if (childRequiredArray[obj] == childAppTypeString) {
						isMatched = true;
						// this to check the child record status if exists
						if (rules.criteria.childRecordStatus != null && rules.criteria.childRecordStatus != "") {
							if (isMatched) {
								for ( var st in childRecordStatusArray) {
									if (childCapStatus == childRecordStatusArray[st]) {
										isStatusMatched = true;
										break;
									}
								}
							}
						}

					} else {
						isMatched = false;
					}

				}

			}
		} else {
			isMatched = false;

		}

		if (!isMatched) {
			validationMessage += '</br>' + " this record should have child  " + rules.criteria.childRequired + '</br>';
		}
		if (!isStatusMatched) {
			validationMessage += '</br>' + " the child records status should be in </br> " + childRecordStatusArray + '</br>';
		}

	}

	if (!isEmptyOrNull(rules.criteria.requiredField)) {
		var requiredFieldsArray = rules.criteria.requiredField;
		for ( var f in requiredFieldsArray) {
			if (GetASIValue(requiredFieldsArray[f]) == "" || GetASIValue(requiredFieldsArray[f]) == null) {
				validationMessage += '</br>' + "these fields are required " + requiredFieldsArray + '</br>';
				break;
			}

		}
	}

	if (!isEmptyOrNull(rules.criteria.taskRequired)) {
		var taskRequiredArray = rules.criteria.taskRequired;
		for ( var t in taskRequiredArray) {
			if (!isTaskComplete(taskRequiredArray[t])) {
				validationMessage += '</br>' + "these tasks must be completed " + taskRequiredArray + '</br>';
				break;
			}
		}

	}

	if (!isEmptyOrNull(rules.criteria.inspectionRequired)) {

		var inspections = aa.inspection.getInspections(capId);
		var inspectionRequiredArray = rules.criteria.inspectionRequired;
		inspections = inspections.getOutput();
		if (inspections == null || inspections.length == 0) {

			validationMessage += '</br>' + "these inspections are required and should  be completed " + inspectionRequiredArray + '</br>';

		}
		for ( var obj in inspectionRequiredArray) {

			for ( var i in inspections) {
				if ((inspectionRequiredArray[obj] == inspections[i].getInspectionType() && (inspections[i].getInspectionStatus() == "Rescheduled"
						|| inspections[i].getInspectionStatus() == "Canceled" || inspections[i].getInspectionStatus() == "Scheduled"))
						|| (inspectionRequiredArray[obj] != inspections[i].getInspectionType())) {
					validationMessage += '</br>' + "these inspections are required and should  be completed " + inspectionRequiredArray + '</br>';

				}
			}

		}
	}

	// this to check if the record assign to the user for all before event except ASB 
	if (controlString != "ApplicationSubmitBefore") {
		if (!isEmptyOrNull(rules.criteria.assignedUserRequired)) {
			if (!getAssignedUser() && rules.criteria.assignedUserRequired) {
				validationMessage += '</br>' + "Record should be assigned to a user  " + '</br>';
			}
		}
	}

	// this to check the work flow assigned user 
	if (!isEmptyOrNull(rules.criteria.assignedWorkflowTaskUser) && typeof wfStaffUserID !== "undefined") {
		if (rules.criteria.assignedWorkflowTaskUser && (wfStaffUserID == null || wfStaffUserID == "")) {
			validationMessage += '</br>' + "Work flow task should be assigned to a user  " + '</br>';
		}

	}

	/// this to check if the ASIT has rows 
	if (!isEmptyOrNull(rules.criteria.RowRequiredInASIT)) {
		var rowRequiredASITArray = rules.criteria.RowRequiredInASIT;
		var tmpASITAry = null;
		for ( var r in rowRequiredASITArray) {
			if (controlString == "ApplicationSpecificInfoUpdateBefore") {
				var checkAsit = loadASITable(rowRequiredASITArray[r]);
				loadASITablesBefore();
				var currentASITRows = rowRequiredASITArray[r].replace(/[^a-zA-Z0-9]+/g, '');
				if (!isNaN(currentASITRows.substring(0, 1)))
					currentASITRows = "TBL" + currentASITRows // prepend with TBL if it starts with a number
				var rowExists = false;
				if (!isEmptyOrNull(checkAsit) || checkAsit != undefined) {
					for (j in tmpASITAry) {
						if (tmpASITAry[j] != null || tmpASITAry[j] != "undefined") {
							rowExists = true;
							break;
						}
					}
				}
				if (!rowExists) {
					validationMessage += '</br>' + "This ASIT should have at least one row " + rowRequiredASITArray[r] + '</br>';
				}
			} else if (controlString == "ApplicationSubmitBefore") {
				currentASITRows = getASITBefore(rowRequiredASITArray[r]);
				if (currentASITRows == null) {
					validationMessage += '</br>' + "This ASIT should have at least one row " + rowRequiredASITArray[r] + '</br>';
				}
			} else {
				currentASITRows = getASITable(rowRequiredASITArray[r]);

				if (currentASITRows == "undefined" || currentASITRows == null || !currentASITRows) {
					validationMessage += '</br>' + "This ASIT should have at least one row " + rowRequiredASITArray[r] + '</br>';
				}

			}

		}
	}
	if (validationMessage != "") {
		var validationMessageText = (rules.action.validationMessage == null || rules.action.validationMessage == "") ? validationMessage : rules.action.validationMessage;

		showMessage = true;
		cancel = true;
		if (isPublicUser) {
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validationMessageText);
		} else {
			comment(validationMessageText);
		}

	}
}
/**
 * this user will return the assigned user
 * @returns user id if the record already assigned else will return false
 */
function getAssignedUser() {
	if (capId != null) {
		capDetail = aa.cap.getCapDetail(capId).getOutput();

		userObj = aa.person.getUser(capDetail.getAsgnStaff());
		if (userObj.getSuccess()) {
			staff = userObj.getOutput();
			userID = staff.getUserID();
			return userID;
		} else {
			return false;
		}
	} else
		return false;
}

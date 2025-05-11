/*Title : People Automation , create public users and LP automatically
 Purpose : 
 Author: Israa Ismail
 Functional Area : After - All
 Description : JSON Example :

{
  "Marijuana/Combo/Testing Facility/xyz": {
    "ApplicationSpecificInfoUpdateAfter": [
      {
        "metadata": {
          "description": "To automate creation of reference contacts and reference licenses based on certain criteria",
          "operators": {
            
          }
        },
        "criteria": {
		  "publicUser": false,
          "contactFields": {
            "contactType": "Applicant"
          }
        },
        "preScript": "",
        "action": {
          "contactTypes": [
            "Applicant"
          ],
          "createReferenceContacts": true,
		  "updateReferenceContacts": true,
		  "compareFunction": "",
		  "referenceContactType" : "Individual",
          "licensedProfessionalType": "Contractor",
          "createReferenceLicense": true,
          "updatedReferenceLicense": true,
          "createReferenceLicenseFromContactTypes": [
            "Applicant"
		  ],
          "createPublicUser": true,
          "linkPublicUserReferenceContact": true,
          "linkPublicUserReferenceLicense": true,
          "addAKANamesFromContactTemplateTable": "AKA_NAME_TABLE"
        },
        "postScript": ""
      }
    ]
  }
}



 ** Available Types: customFields, customLists
 ** Available Attributes for each type:
 - Custom Fields and Custom Lists: ALL
 *
 Note : for the criteria contactFields: the name should be "contactType"
 */

try {
	// This should be included in all Configurable Scripts
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var settingsArray = [];
	var scriptSuffix = "PEOPLE_AUTOMATION";
	isConfigurableScript(settingsArray, scriptSuffix);

	for (s in settingsArray) {
		var rules = settingsArray[s];
		var preScript = rules.preScript;
		var postScript = rules.postScript;

		if (!isEmptyOrNull(preScript)) {
			eval(getScriptText(preScript, null, false));
		}
		if (cancelCfgExecution) {
			logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
			cancelCfgExecution = false;
			continue;
		}

		if(!isEmptyOrNull(rules.criteria.publicUser)){
			if(rules.criteria.publicUser == isPublicUser){
				// Check to see if this is a publicUser so that this automation is executed on ConvertToRealCAPAfter 
				// rather than ApplicationSubmitAfter for ACA
				peopleAutomation(rules);
			}
		}
		else{
			peopleAutomation(rules);
		}

		if (!isEmptyOrNull(postScript)) {
			eval(getScriptText(postScript, null, false));
		}
	}
} catch (ex) {
	logDebug("**ERROR: Exception while verifying the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * This function is used to : 
 * 1-create reference contacts for all contacts on the application
 * 2-create a License Professional outside of a License Issuance process
 * 3-create public user account and associate it to ref contact and/or ref LP , and add AKA 
 * @param rules is the JSON abject that provided from the JSON File CONF_{SOLUTION}_PEOPLE_AUTOMATION
 * 
 */
function peopleAutomation(rules) {
	try {

		//create reference contacts for all contacts on the application
		if (!isEmptyOrNull(rules.action.contactTypes)) {
			var contactTypes = rules.action.contactTypes;
			// check if it contains the value ALL , or have multiple items
			var contactTypesArray = null;
			if (contactTypes.length == 1 && String(contactTypes[0]).toUpperCase() == "ALL") {
				// default to null
			} else {
				contactTypesArray = contactTypes;
			}
			var createReferenceContacts = rules.action.createReferenceContacts;
			var updateReferenceContacts = rules.action.updateReferenceContacts;
			var compareFunction = rules.action.compareFunction;
			var referenceContactType = rules.action.referenceContactType;
			createOrUpdateRefContactsFromCapContactsAndLink(contactTypesArray, createReferenceContacts, updateReferenceContacts, compareFunction, referenceContactType);
		}

		// create a License Professional outside of a License Issuance process
		if (rules.action.createReferenceLicense || rules.action.updatedReferenceLicense) {
			createOrUpdateRefLicProfFromLicProfTypes(rules);
		}

		if (!isEmptyOrNull(rules.action.createReferenceLicenseFromContactTypes)) {
			createReferenceLicenseFromContactAndLink(rules);
		}

		//create a public user for each contact type mentioned in the criteria
		if (rules.action.createPublicUser) {
			var contactFields = rules.criteria.contactFields;
			var contactType = contactFields["contactType"];
			//create the new public user account
			createPublicUserFromContactTypeAndLink(contactType, rules);
		}

		// create AKA after creating the Ref Contatc if not exist
		if (!isEmptyOrNull(rules.action.addAKANamesFromContactTemplateTable)) {
			createAKAFromRefContact(rules);
		}

	} catch (e) {
		logDebug("**WARN Exception in people automation in script (" + scriptSuffix + ") ERROR:" + e);
	}
}

/**
 * This Function creates or update a ref contact from the specified contact types array
 * @param contactTypeArray [Array or null]
 * @param createRefContact [boolean]
 * @param overwriteRefContact [boolean]
 * @param refContactExists [String]
 * @param refContactType [String]
 */
function createOrUpdateRefContactsFromCapContactsAndLink(contactTypeArray, createRefContact, overwriteRefContact, compareFunctionName, refContactType) {

	var c = aa.people.getCapContactByCapID(capId).getOutput();
	var cCopy = aa.people.getCapContactByCapID(capId).getOutput() // must have two working datasets
	for ( var i in c) {
		var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
		var defaultRefContactType = "Individual"; // default behavior is create the ref contact as Individual
		var con = c[i];
		var p = con.getPeople();
		if (contactTypeArray != null && !exists(p.getContactType(), contactTypeArray))
			continue; //if ContacttypeArray is not "ALL" and Cap Contact not in the contact type list.  Move along.

		if(isEmptyOrNull(refContactType)) refContactType = defaultRefContactType;
		var refContactNum = con.getCapContactModel().getRefContactNumber();

		if (refContactNum) // This is a reference contact.   Let's refresh or overwrite as requested in parms.
		{
			if (overwriteRefContact) {

				p.setContactSeqNumber(refContactNum); // set the ref seq# to refresh
				p.setContactType(refContactType);

				var a = p.getAttributes();

				if (a) {
					var ai = a.iterator();
					while (ai.hasNext()) {
						var xx = ai.next();
						xx.setContactNo(refContactNum);
					}
				}

				var r = aa.people.editPeopleWithAttribute(p, p.getAttributes());

				if (!r.getSuccess())
					logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
				else
					logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
			}

		} else // user entered the contact freehand.   Let's create or link to ref contact.
		{

			// if the flag to create a ref contact is set to false , then do not create it.
			if (!createRefContact)
				continue;

			var ccmSeq = p.getContactSeqNumber();
			// Call the custom function to see if the REF contact exists
			// for now I will stop using the function until we get confirmation

			var existingContact = null;
			var refPeopleId = null;
			if (!isEmptyOrNull(compareFunctionName)) {
				existingContact = eval(compareFunctionName + "(p)");
			} else {
				existingContact = comparePeopleMatchCriteria(p);
			}

			var p = cCopy[i].getPeople(); // get a fresh version, had to mangle the first for the search

			if (existingContact) // we found a match with our custom function.  Use this one.
			{
				refPeopleId = existingContact;
			} else // did not find a match, let's create one
			{
				var a = p.getAttributes();

				if (a) {
					//
					// Clear unwanted attributes
					var ai = a.iterator();
					while (ai.hasNext()) {
						var xx = ai.next();
						if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(), ignoreAttributeArray))
							ai.remove();
					}
				}

				p.setContactType(refContactType);
				var r = aa.people.createPeopleWithAttribute(p, a);

				if (!r.getSuccess()) {
					logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage());
					continue;
				}

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

				var p = cCopy[i].getPeople();
				refPeopleId = p.getContactSeqNumber();

				logDebug("Successfully created reference contact #" + refPeopleId);

				// Need to link to an existing public user.

				var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
				if (getUserResult.getSuccess() && getUserResult.getOutput()) {
					var userModel = getUserResult.getOutput();
					logDebug("createRefContactsFromCapContactsAndLink: Found an existing public user: " + userModel.getUserID());

					if (refPeopleId) {
						logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);
						aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refPeopleId);
					}
				}
			}

			//
			// now that we have the reference Id, we can link back to reference
			//

			var ccm = aa.people.getCapContactByPK(capId, ccmSeq).getOutput();
			if (ccm != null) {
				ccm = ccm.getCapContactModel();
			}

			ccm.setRefContactNumber(refPeopleId);
			r = aa.people.editCapContact(ccm);

			if (!r.getSuccess()) {
				logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage());
			} else {
				logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);
			}

		} // end if user hand entered contact

	}// end for each CAP contact

}// end of function 

/**
 * This Function to create or update REF LP from specified LP types
 * @param rules is the JSON abject that provided from the JSON File CONF_"SOLUTION"_PEOPLE_AUTOMATION
 * @returns {Boolean}
 */
function createOrUpdateRefLicProfFromLicProfTypes(rules) {
	capLicenseResult = aa.licenseScript.getLicenseProf(capId);
	if (capLicenseResult.getSuccess()) {
		capLicenseArr = capLicenseResult.getOutput();
	} else {
		logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage());

		return false;
	}

	if (!capLicenseArr) {
		logDebug("WARNING: no license professional available on the application:");
		return false;
	}

	var licType = rules.action.licensedProfessionalType;
	for ( var l in capLicenseArr) {
		licProfScriptModel = capLicenseArr[l];
		if (licProfScriptModel.getLicenseType() != licType)
			continue; //if  licType is not "ALL" and Cap LP not in the LP list.  Move along.
		createOrUpdateRefLP(licProfScriptModel, rules);
	}// end of Cap LP loop

}// end of function

/**
 * This function to create or update Ref LP
 * @param licProfScriptModel
 * @param rules is the JSON abject that provided from the JSON File CONF_"SOLUTION"_PEOPLE_AUTOMATION
 */
function createOrUpdateRefLP(licProfScriptModel, rules) {

	rlpId = licProfScriptModel.getLicenseNbr();

	//
	// Now see if a reference version exists
	//
	var updating = false;
	var newLic = getRefLicenseProf(rlpId);
	if (newLic) {

		// if license exist and the flag is set to false , then do not update
		if (!rules.action.updatedReferenceLicense)
			return false;
		updating = true;
		logDebug("Updating existing Ref Lic Prof : " + rlpId);
	} else {

		if (rules.action.createReferenceLicense) {
			var newLic = aa.licenseScript.createLicenseScriptModel();
		}
		// if flag set to false , do not create the new license
		else
			return false;
	}

	//
	// Now add / update the ref lic prof
	//
	newLic.setStateLicense(rlpId);
	newLic.setAddress1(licProfScriptModel.getAddress1());
	newLic.setAddress2(licProfScriptModel.getAddress2());
	newLic.setAddress3(licProfScriptModel.getAddress3());
	newLic.setAgencyCode(licProfScriptModel.getAgencyCode());
	newLic.setAuditDate(licProfScriptModel.getAuditDate());
	newLic.setAuditID(licProfScriptModel.getAuditID());
	newLic.setAuditStatus(licProfScriptModel.getAuditStatus());
	newLic.setBusinessLicense(licProfScriptModel.getBusinessLicense());
	newLic.setBusinessName(licProfScriptModel.getBusinessName());
	newLic.setCity(licProfScriptModel.getCity());
	newLic.setCityCode(licProfScriptModel.getCityCode());
	newLic.setContactFirstName(licProfScriptModel.getContactFirstName());
	newLic.setContactLastName(licProfScriptModel.getContactLastName());
	newLic.setContactMiddleName(licProfScriptModel.getContactMiddleName());
	newLic.setContryCode(licProfScriptModel.getCountryCode());
	newLic.setCountry(licProfScriptModel.getCountry());
	newLic.setEinSs(licProfScriptModel.getEinSs());
	newLic.setEMailAddress(licProfScriptModel.getEmail());
	newLic.setFax(licProfScriptModel.getFax());
	newLic.setLicenseType(licProfScriptModel.getLicenseType());
	newLic.setLicOrigIssDate(licProfScriptModel.getLicesnseOrigIssueDate());
	newLic.setPhone1(licProfScriptModel.getPhone1());
	newLic.setPhone2(licProfScriptModel.getPhone2());
	newLic.setSelfIns(licProfScriptModel.getSelfIns());
	newLic.setState(licProfScriptModel.getState());
	newLic.setLicState(licProfScriptModel.getState());
	newLic.setSuffixName(licProfScriptModel.getSuffixName());
	newLic.setWcExempt(licProfScriptModel.getWorkCompExempt());
	newLic.setZip(licProfScriptModel.getZip());

	if (updating) {
		myResult = aa.licenseScript.editRefLicenseProf(newLic);
		var licSeqNbr = newLic.getLicSeqNbr();
	} else {
		myResult = aa.licenseScript.createRefLicenseProf(newLic);
		if (!myResult.getSuccess()) {
			logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
		}
		var licSeqNbr = myResult.getOutput()
	}

	if (myResult.getSuccess()) {
		logDebug("Successfully added/updated License ID : " + rlpId)
		//------------------------------------Updating the Cap LP ------------------------------------

		var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(aa.getServiceProviderCode(), licSeqNbr)
		if (!lpsmResult.getSuccess()) {
			logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage());
		}

		var lpsm = lpsmResult.getOutput();

		// Remove from CAP

		var isPrimary = false;

		logDebug("Removing license: " + rlpId + " from CAP.  We will link the new reference LP");
		if (licProfScriptModel.getPrintFlag() == "Y") {
			logDebug("...remove primary status...");
			isPrimary = true;
			licProfScriptModel.setPrintFlag("N");
			aa.licenseProfessional.editLicensedProfessional(licProfScriptModel);
		}
		var remCapResult = aa.licenseProfessional.removeLicensedProfessional(licProfScriptModel);
		if (remCapResult.getSuccess()) {
			logDebug("...Success.");
		} else {
			logDebug("**WARNING removing lic prof: " + remCapResult.getErrorMessage());
		}

		// add the LP to the CAP
		var asCapResult = aa.licenseScript.associateLpWithCap(capId, lpsm)

		if (!asCapResult.getSuccess()) {
			logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage())
		} else {
			logDebug("Associated the CAP to the new LP")
		}

		// Now make the LP primary again
		if (isPrimary) {
			var capLps = getLicenseProfessional(capId);

			for ( var thisCapLpNum in capLps) {
				if (capLps[thisCapLpNum].getLicenseNbr().equals(rlpId)) {
					var thisCapLp = capLps[thisCapLpNum];
					thisCapLp.setPrintFlag("Y");
					aa.licenseProfessional.editLicensedProfessional(thisCapLp);
					logDebug("Updated primary flag on Cap LP : " + rlpId);

				}
			}
		}

		//-----------------------------------------------------------------------------	
	} else {
		logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
	}

}

/**
 * This Function to create a public user from specified contact type
 * We need this because default one in (INCLUDES_XXX) already link contact to new user, in this automation, this is optional (based on JSON property)
 * @param contactType {String}
 * @param rules is the JSON abject that provided from the JSON File CONF_"SOLUTION"_PEOPLE_AUTOMATION
 */
function createPublicUserFromContactTypeAndLink(contactType, rules) {
	var contact;
	var refContactNum;
	var userModel;

	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) {
			if (String(contactType).toUpperCase() == String(Contacts[yy].getCapContactModel().getPeople().getContactType()).toUpperCase())
				contact = Contacts[yy];
		}
	}

	if (!contact) {
		logDebug("Couldn't create public user for " + contactType + ", no such contact");
		return false;
	}

	if (!contact.getEmail()) {
		logDebug("Couldn't create public user for " + contactType + ", no email address");
		return false;
	}

	if (!isEmptyOrNull(contact.getPeople().getContactTypeFlag()) && contact.getPeople().getContactTypeFlag().equals("organization")) {
		logDebug("Couldn't create public user for " + contactType + ", the contact is an organization");
		return false;
	}

	// get the reference contact ID.   We will use to connect to the new public user
	var refContactNum = contact.getCapContactModel().getRefContactNumber();

	// check to see if public user exists already based on email address
	var getUserResult = aa.publicUser.getPublicUserByEmail(contact.getEmail())
	if (getUserResult.getSuccess() && getUserResult.getOutput()) {
		userModel = getUserResult.getOutput();
		logDebug("CreatePublicUserFromContact: Found an existing public user: " + userModel.getUserID());
	}

	if (!userModel) // create one
	{
		var publicUser = aa.publicUser.getPublicUserModel();
		publicUser.setFirstName(contact.getFirstName());
		publicUser.setLastName(contact.getLastName());
		publicUser.setEmail(contact.getEmail());
		publicUser.setUserID(contact.getEmail());
		publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
		publicUser.setAuditID("PublicUser");
		publicUser.setAuditStatus("A");
		publicUser.setCellPhone(contact.getCapContactModel().getPeople().getPhone2());

		var result = aa.publicUser.createPublicUser(publicUser);
		if (result.getSuccess()) {
			var userSeqNum = result.getOutput();
			var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

			// create for agency
			aa.publicUser.createPublicUserForAgency(userModel);

			// activate for agency
			var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
			userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(servProvCode, userSeqNum, "ADMIN");

			// reset password
			var resetPasswordResult = aa.publicUser.resetPassword(contact.getEmail());
			if (resetPasswordResult.getSuccess()) {
				var resetPassword = resetPasswordResult.getOutput();
				userModel.setPassword(resetPassword);
				logDebug("Reset password for " + contact.getEmail() + "  sucessfully.");
			} else {
				logDebug("**ERROR: Reset password for  " + contact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
			}

			// send Activate email
			aa.publicUser.sendActivateEmail(userModel, true, true);

			// send another email
			aa.publicUser.sendPasswordEmail(userModel);
		} else {
			logDebug("**Warning creating public user " + contact.getEmail() + "  failure: " + result.getErrorMessage());
			return null;
		}

		if (rules.action.linkPublicUserReferenceContact) {
			//  connect the public user  to the reference contact		
			if (refContactNum) {
				aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), refContactNum);
			}
		}

		if (rules.action.linkPublicUserReferenceLicense && rules.criteria.lpFields) {
			// check if LP exist on cap then associate the public user to it
			var lpFields = rules.criteria.lpFields
			var lpType = lpFields["licType"];
			if (!isEmptyOrNull(lpType)) {
				var licSeqNum = getLPSeqNumByType(lpType);
				associateLicensedProfessionalWithPublicUser(licSeqNum, publicUser.getUserID());
			}
		}
		return userModel; // send back the new or existing public user
	}
	return false;
}

function getLPSeqNumByType(lpType) {
	var capLicenseResult = aa.licenseScript.getLicenseProf(capId);
	if (capLicenseResult.getSuccess()) {
		var capLicenseArr = capLicenseResult.getOutput();
	} else {
		logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage());
		return null;
	}

	if (!capLicenseArr) {
		logDebug("**WARNING: no licensed professionals on this CAP");
		return null;
	} else {
		for ( var thisLic in capLicenseArr) {
			if (capLicenseArr[thisLic].getLicenseType() == lpType) {
				var licResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), capLicenseArr[thisLic].getLicenseNbr());
				if (licResult.getSuccess()) {
					var licObj = licResult.getOutput();
					if (licObj != null) {
						licObj = licObj[0];
						var LicSeqNbr = licObj.getLicSeqNbr();
						return LicSeqNbr;
					}
				}
			}
		}
	}
}//getLPSeqNumByType()

/**
 * This function to associate Ref LP with the newly created public user 
 * @param licnumber {String}
 * @param publicUserID {String}
 */
function associateLicensedProfessionalWithPublicUser(licnumber, publicUserID) {
	var mylicense = aa.licenseScript.getRefLicenseProfBySeqNbr(aa.getServiceProviderCode(), licnumber);
	var puser = aa.publicUser.getPublicUserByPUser(publicUserID);
	if (puser.getSuccess()) {
		aa.licenseScript.associateLpWithPublicUser(puser.getOutput(), mylicense.getOutput());
	}
}

/**
 * Creates AKA for the Ref Contact of type specified in the criteria
 * @param rules is the JSON abject that provided from the JSON File CONF_"SOLUTION"_PEOPLE_AUTOMATION
 */
function createAKAFromRefContact(rules) {
	if (isEmptyOrNull(rules.criteria.contactFields)) {
		return;
	}

	var contactFields = rules.criteria.contactFields;
	var contactType = contactFields["contactType"];
	var result = aa.people.getCapContactByCapID(capId);
	if (result.getSuccess()) {

		Contacts = result.getOutput();
		for (cc in Contacts) {
			if (String(contactType).toUpperCase().equals(String(Contacts[cc].getCapContactModel().getPeople().getContactType()).toUpperCase())) {
				var capContactScriptModel = Contacts[cc];
				var capContact = capContactScriptModel.getCapContactModel();
				if (capContact == null)
					continue;

				var refContactNum = capContact.getRefContactNumber();
				if (refContactNum == null)
					continue;
				var template = capContact.getTemplate();

				var templateTable = template.getTemplateTables();
				var allRows = new Array();

				for (var i = 0; i < templateTable.size(); i++) {
					var eachtable = templateTable.get(i);
					var tablename = eachtable.getGroupName();
					var tableSubgroups = eachtable.getSubgroups();

					if (tablename == null) {
						continue;
					}

					for (var j = 0; j < tableSubgroups.size(); j++) {
						var eachSubGroup = tableSubgroups.get(j);

						if (eachSubGroup == null || eachSubGroup.getRows() == null
								|| String(eachSubGroup.getSubgroupName()).toUpperCase() != String(rules.action.addAKANamesFromContactTemplateTable).toUpperCase()) {
							continue;
						}

						var rows = eachSubGroup.getRows();

						for (var r = 0; r < rows.size(); r++) {
							var fieldList = rows.get(r).getValues();
							var rowsArray = new Array();

							for (var i = 0; i < fieldList.size(); i++) {

								var eachField = fieldList.get(i);

								if (eachField.getFieldName().equals("FirstName")) {
									rowsArray["FirstName"] = eachField.getValue();
								} else if (eachField.getFieldName().equals("MiddleName")) {
									rowsArray["MiddleName"] = eachField.getValue();
								} else if (eachField.getFieldName().equals("LastName")) {
									rowsArray["LastName"] = eachField.getValue();
								} else if (eachField.getFieldName().equals("FullName")) {
									rowsArray["FullName"] = eachField.getValue();
								} else if (eachField.getFieldName().equals("StartDate")) {
									rowsArray["StartDate"] = eachField.getValue();
								} else if (eachField.getFieldName().equals("EndDate")) {
									rowsArray["EndDate"] = eachField.getValue();
								}
								rowsArray["ContactNumber"] = refContactNum;
							} // end of Fields loop
							// add row
							addAKA(rowsArray);
						}// end of ASIT Rows
					}// end of Subgroups
				}// end of template	
			}// end of Contact Type Check
		}// end of Cap Contact Loop
	}// Cap Contact getSuccess()
}

/**
 * This function to create AKA name for the ref Contact 
 * @param row : array of fields
 * @returns {Boolean}
 */
function addAKA(row) {
	var refContactNum = row["ContactNumber"];
	if (!refContactNum) {
		logDebug("contactObj: Cannot add AKA name for non-reference contact");
		return false;
	}

	var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
	var args = new Array();
	var akaModel = aa.proxyInvoker.newInstance("com.accela.orm.model.contact.PeopleAKAModel", args).getOutput();
	var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel", args).getOutput();

	var a = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(), String(refContactNum));
	akaModel.setServiceProviderCode(aa.getServiceProviderCode());
	akaModel.setContactNumber(parseInt(refContactNum));
	akaModel.setFirstName(row["FirstName"]);
	akaModel.setMiddleName(row["MiddleName"]);
	akaModel.setLastName(row["LastName"]);
	akaModel.setFullName(row["FullName"]);
	akaModel.setStartDate(new Date(row["StartDate"]));
	akaModel.setEndDate(new Date(row["EndDate"]));
	auditModel.setAuditDate(new Date());
	auditModel.setAuditStatus("A");
	auditModel.setAuditID("ADMIN");
	akaModel.setAuditModel(auditModel);
	a.add(akaModel);

	aka.saveModels(aa.getServiceProviderCode(), refContactNum, a);

}

function createReferenceLicenseFromContactAndLink(rules) {
	var carray = rules.action.createReferenceLicenseFromContactTypes;

	if (carray) {
		var result = aa.people.getCapContactByCapID(capId);
		if (result.getSuccess()) {
			Contacts = result.getOutput();
			for (cc in Contacts) {
				if (!exists(Contacts[cc].getCapContactModel().getPeople().getContactType(), carray))
					continue;
				var capContactScriptModel = Contacts[cc];

				var capContact = capContactScriptModel.getCapContactModel();
				if (capContact == null)
					continue;
				var refContactNum = capContact.getRefContactNumber();
				if (refContactNum == null)
					continue;

				var contactSeqNumberInt = parseInt(refContactNum);
				var licenseService = com.accela.aa.emse.dom.service.CachedService.getInstance().getLicenseService();
				var licenseProfList = licenseService.getProfessionalListByContactNbr(aa.getServiceProviderCode(), contactSeqNumberInt);

				//  create a new ref LP for the Ref Contact if no ref lp associated to the ref con
				if (!licenseProfList || licenseProfList.size() == 0) {

					var newLic = aa.licenseScript.createLicenseScriptModel();
					peop = capContactScriptModel.getPeople();
					addr = peop.getCompactAddress();

					newLic.setContactFirstName(capContactScriptModel.getFirstName());
					newLic.setContactLastName(capContactScriptModel.getLastName());
					newLic.setBusinessName(peop.getBusinessName());
					newLic.setAddress1(addr.getAddressLine1());
					newLic.setAddress2(addr.getAddressLine2());
					newLic.setAddress3(addr.getAddressLine3());
					newLic.setCity(addr.getCity());
					newLic.setState(addr.getState());
					newLic.setZip(addr.getZip());
					newLic.setPhone1(peop.getPhone1());
					newLic.setPhone2(peop.getPhone2());
					newLic.setEMailAddress(peop.getEmail());
					newLic.setFax(peop.getFax());

					newLic.setAgencyCode(aa.getServiceProviderCode());
					newLic.setAuditDate(sysDate);
					newLic.setAuditID(currentUserID);
					newLic.setAuditStatus("A");

					//createReferenceLicenseFromLicenseTypes of 0
					var thisAltID = cap.getCapModel().getAltID();
					rlpType = rules.action.licensedProfessionalType;

					newLic.setLicenseType(rlpType);
					newLic.setLicState(addr.getState());
					newLic.setStateLicense(thisAltID);

					myResult = aa.licenseScript.createRefLicenseProf(newLic);
					if (!myResult.getSuccess()) {
						logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
						return false;
					}
					var licSeqNbr = myResult.getOutput();
					licSeqNbr = licSeqNbr * 1;

					//Link to Ref Contact License-Tab using contactSeqNumberInt and licSeqNbr
					var xRefContactEntity = aa.people.getXRefContactEntityModel().getOutput();
					xRefContactEntity.setServiceProviderCode(aa.getServiceProviderCode());
					xRefContactEntity.setEntityType(com.accela.aa.aamain.people.PeopleConstant.X_CONTACT_PROFESSIONAL);
					xRefContactEntity.setEntityID1(licSeqNbr);
					xRefContactEntity.setContactSeqNumber(contactSeqNumberInt);//Long.valueOf(targetContactNbr)
					var auditModel = com.accela.aa.aamain.people.ContactUtil.getAuditModel(aa.getServiceProviderCode(), com.accela.aa.constant.V360Constant.ACTIVE_STATUS, aa
							.getAuditID());
					xRefContactEntity.setAuditModel(auditModel);
					var createLinkList = aa.util.newArrayList();
					createLinkList.add(xRefContactEntity);
					var xRefContactEntityService = com.accela.aa.emse.dom.service.CachedService.getInstance().getXRefContactEntityService();
					xRefContactEntityService.batchCreateXRefContactEntity(createLinkList);
				}//LPs on contact = 0
			}//for all contacts
		}//contacts getSuccess()
	}//json conf is OK
}

/**
 * Uses the close match criteria configured in Agency Profile > Standard Choices stored in the 
 * INDIVIDUAL_CONTACT_MATCH_CRITERIA and ORGANIZATION_CONTACT_MATCH_CRITERIA to check the reference 
 * contact library for potential duplicates. Takes a single peopleModel as a parameter, 
 * and will return an array of people models (peopResult) returns null if there are no matches.
 * 
 * This is used in conjuction with the createRefContactsFromCapContactsAndLink function as shown in the example.
 * 
 * @requires 
 * @example createRefContactsFromCapContactsAndLink(itemCapId, ["Applicant"], null, null, true, comparePeopleMatchCriteria)
 * @memberof INCLUDES_ACCELA_FUNCTIONS
 * @param {peopleModel}
 * @return {ContactSeqNumber}
 *   
 */

function comparePeopleMatchCriteria(ipPeop)
{
	var fvContType = ipPeop.getContactType();

	var fvCriteriaStdChoice = "INDIVIDUAL_CONTACT_MATCH_CRITERIA";
	// default to individual unless flag is Org
	if (fvContType == "Organization")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}
	if (lookup("REF_CONTACT_CREATION_RULES",fvContType) == "O")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}

	//Add agency specific logic here if needed
	var fvBizDomainSR = aa.bizDomain.getBizDomain(fvCriteriaStdChoice);
	if (!fvBizDomainSR || !fvBizDomainSR.getSuccess())
	{
		logDebug("Standard Choice '" + fvCriteriaStdChoice + "' not defined.");
		return null;
	}
	var fvBizDomain = fvBizDomainSR.getOutput();
	if (!fvBizDomain || fvBizDomain.size() == 0)
	{
			logDebug("No criteria defined in Standard Choice '" + fvCriteriaStdChoice + "'.");
			return null;
	}

	for(var fvCounter1 = 0; fvCounter1 < fvBizDomain.size(); fvCounter1++)
	{
		var fvCloseMatchCriteriaObj = fvBizDomain.get(fvCounter1);
		var fvCriteriaStr = fvCloseMatchCriteriaObj.getDispBizdomainValue();
		if (!fvCriteriaStr || fvCriteriaStr == "")
			continue;

		var fvPeop = aa.people.createPeopleModel().getOutput().getPeopleModel();
		//make sure we are retrieving only active contacts
        fvPeop.setAuditStatus("A");
		
		var fvCriteriaArr = fvCriteriaStr.split(";");
        var fvSkipThisCriteria = false;
		for (var fvCounter2 in fvCriteriaArr)
		{
		   var fvCriteriaFld = fvCriteriaArr[fvCounter2];
		   if (ipPeop[fvCriteriaFld] == null)
		   {
			   fvSkipThisCriteria = true;
			   logDebug("Value for " + fvCriteriaFld + " is null.");
			   break;
		   }
		   fvPeop[fvCriteriaFld] = ipPeop[fvCriteriaFld];
		   logDebug("Search for " + fvCriteriaFld + " " + fvPeop[fvCriteriaFld]);
		}
		if (fvSkipThisCriteria)
		{
			logDebug("WARNING: One or more Values for the Fields defined in this Criteria are null. Skipping this criteria.");
			continue;
		}

		var fvResult = aa.people.getPeopleByPeopleModel(fvPeop);
		if ( !fvResult.getSuccess())
		{
			logDebug("WARNING: Error searching for duplicate contacts : " + fvResult.getErrorMessage());
			continue;
		}

		var fvPeopResult = fvResult.getOutput();
		if (fvPeopResult.length == 0)
		{
			logDebug("Searched for REF contact, no matches found.");
			continue;
		}

		if (fvPeopResult.length > 0)
		{
			logDebug("Searched for a REF Contact, " + fvPeopResult.length + " matches found! returning the first match : " + fvPeopResult[0].getContactSeqNumber());
			return fvPeopResult[0].getContactSeqNumber();
		}
	}
	logDebug("No matches found. Returning Null.");
	return null;
}

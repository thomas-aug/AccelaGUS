/*------------------------------------------------------------------------------------------------------/
| Accela Automation
| Accela, Inc.
| Copyright (C): 2012
|
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
|	    available to all master scripts
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/

function doConfigurableScriptActions(){
    
    var module 
    if(appTypeArray && appTypeArray[0] != undefined){
        module = appTypeArray[0];
    }
   
	if(module == null || module == undefined){
		var itemCap = aa.cap.getCap(capId).getOutput();
		var itemCapModel = itemCap.getCapModel();
		module = itemCapModel.getModuleName();
	}
	
	rulesetName = "CONFIGURABLE_RULESET_" + module;
	rulesetName = rulesetName.toUpperCase();
	logDebug("rulesetName: " + rulesetName);
	
	 var configRuleset = getScriptText(rulesetName);
	 if (configRuleset == ""){
		 logDebug("No JSON file exists for this module.");
	 }else{
		var configJSON = JSON.parse(configRuleset);

	// match event, run appropriate configurable scripts
		settingsArray = [];
		if(configJSON[controlString]) {
			var ruleSetArray = configJSON[controlString];
			var scriptsToRun = ruleSetArray.StandardScripts;
			
			for (s in scriptsToRun){
				logDebug("doConfigurableScriptActions scriptsToRun[s]: " + scriptsToRun[s]);
				var script = scriptsToRun[s];
				var validScript = getScriptText(script);
				if (validScript == ""){
					logDebug("Configurable script " + script + " does not exist.");
				}else{
					eval(getScriptText(scriptsToRun[s]));
				}
			}
		}
	}
}

function getStandardChoiceArray(stdChoice) {
	var cntItems = 0;
	var stdChoiceArray = new Array();
	var bizDomScriptResult = aa.bizDomain.getBizDomain(stdChoice);
	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		if(bizDomScriptObj != null){
			cntItems = bizDomScriptObj.size();
			logDebug("getStdChoiceArray: " + stdChoice + " size = " + cntItems);
			if (cntItems > 0) {
				var bizDomScriptItr = bizDomScriptObj.iterator();
				while (bizDomScriptItr.hasNext()) {
					var bizBomScriptItem = bizDomScriptItr.next();
					var stdChoiceArrayItem = new Array();
					stdChoiceArrayItem["value"] = bizBomScriptItem.getBizdomainValue();
					stdChoiceArrayItem["valueDesc"] = bizBomScriptItem.getDescription();
					stdChoiceArrayItem["active"] = bizBomScriptItem.getAuditStatus();
					stdChoiceArray.push(stdChoiceArrayItem);
				}
			}
		}
		else{
			logDebug("getStdChoiceArray: WARNING stdChoice not found - " + stdChoice);
		}
		
	}
	return stdChoiceArray;
}

function editAppSpecific(itemName,itemValue)  // optional: itemCap
{
	var itemCap = capId;
	var itemGroup = null;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
   	
  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		itemGroup = itemName.substr(0,itemName.indexOf("."));
		itemName = itemName.substr(itemName.indexOf(".")+1);
	}
   	// change 2/2/2018 - update using: aa.appSpecificInfo.editAppSpecInfoValue(asiField)
	// to avoid issue when updating a blank custom form via script. It was wiping out the field alias 
	// and replacing with the field name
	
	var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
	if(asiFieldResult.getSuccess()){
		var asiFieldArray = asiFieldResult.getOutput();
		if(asiFieldArray.length > 0){
			var asiField = asiFieldArray[0];
			if(asiField){
				var origAsiValue = asiField.getChecklistComment();
				asiField.setChecklistComment(itemValue);
	
				var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
				if(updateFieldResult.getSuccess()){
					logDebug("Successfully updated custom field: " + itemName + " with value: " + itemValue);
					if(arguments.length < 3) //If no capId passed update the ASI Array
					AInfo[itemName] = itemValue; 
				}
				else
				{ logDebug( "WARNING: (editAppSpecific) " + itemName + " was not updated."); }	
			}
			else
			{ logDebug( "WARNING: (editAppSpecific) " + itemName + " was not updated."); }
		}
	}
	else {
		logDebug("ERROR: (editAppSpecific) " + asiFieldResult.getErrorMessage());
	}
}

/**
 * Builds a URL path for the record in ACA that is appended to the ACA Site URL.
 * 
 * @param {capId}
 * 		capId - optional capId object
 * @returns {string}
 *		acaUrl - URL path for the record in ACA
 *
 */

function getACAUrl(){

	// returns the path to the record on ACA.  Needs to be appended to the site

	itemCap = (arguments.length == 1) ? arguments[0] : capId;
	var enableCustomWrapper = lookup("ACA_CONFIGS","ENABLE_CUSTOMIZATION_PER_PAGE");
   	var acaUrl = "";
	var id1 = itemCap.getID1();
	var id2 = itemCap.getID2();
	var id3 = itemCap.getID3();
	var itemCapModel = aa.cap.getCap(itemCap).getOutput().getCapModel();

	acaUrl += "/urlrouting.ashx?type=1000";
	acaUrl += "&Module=" + itemCapModel.getModuleName();
	acaUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaUrl += "&agencyCode=" + aa.getServiceProviderCode();
	if(matches(enableCustomWrapper,"Yes","YES")) acaUrl += "&FromACA=Y";

	return acaUrl;
}

/**
* Contact Object 
* <p>
* Properties: 
*	people - PeopleModel Object
*   capContact - CapContactModel Object
*	capContactScript - CapContactScriptModel Object
*	capId - capID Object
*	type - Contact Type
*	seqNumber - Transactional Seqence Number
*	asi - associative array of people template attributes
*	customFields - associative array of custom template fields
*	customTables - Not yet implemented
*	primary - Contact is Primary
*	relation - Contact Relation
*	addresses - associative array of address
*	validAttrs - Boolean indicating people template attributes
*	validCustomFields - Boolean indicating custom template fields
*	validCustomTables - Not implemented yet
*	infoTables - Table Array ex infoTables[name][row][column].getValue()
*	attribs - Array of LP Attributes ex attribs[name]
*	valid - Get the Attributes for LP
*	validTables - true if LP has infoTables
*	validAttrs - true if LP has attributes
* </p>
* <p>
* Methods:
*	toString() - Outputs a string of key contact fields 
*   getContactName() - Returns either First Name and Last Name, Business Name, or DBA Trade Name
*	getEmailTemplateParams(params,[vContactType]) - Contact Parameters for use in Notification Templates
*	replace(targetCapId) - send this contact to another record, optional new contact type
*	equals(contactObj) - Compares this contact to another contact by comparing key elements
*	saveBase() - Saves base information such as contact type, primary flag, relation
*	save() - Saves all current information to the transactional contact
*	syncCapContactToReference() - Synchronize the contact data from the record with the reference contact by pushing data from the record into reference.
*	syncCapContactFromReference() - Synchronize the reference contact data with the contact on the record by pulling data from reference into the record.
*	getAttribute(vAttributeName) - Get method for people template attributes
*	setAttribute(vAttributeName, vAttributeValue) - Set method for people template attributes
*	getCustomField(vFieldName) - Get method for Custom Template Fields
*	setCustomField(vFieldName,vFieldValue) - Set method for Custom Template Fields
*	remove() - Removes this contact from the transactional record
*	isSingleAddressPerType() - Boolean indicating if this contact has a Single Addresss Per Type
*	getAddressTypeCounts() - returns an associative array of how many adddresses are attached
*	createPublicUser() - For individual contact types, this function checkes to see if public user exists already based on email address then creates a public user and activates it for the agency. It also sends an Activate email and sends a Password Email. If there is a reference contact, it will assocated it with the newly created public user.
*	getCaps([record type filter]) - Returns an array of records related to the reference contact
*	getRelatedContactObjs([record type filter]) - Returns an array of contact objects related to the reference contact
*	getRelatedRefLicProfObjs() - Returns an array of Reference License Professional objects related to the reference contact
*	createRefLicProf(licNum,rlpType,addressType,licenseState, [servProvCode]) - Creates a Reference License Professional based on the contact information. If this contact is linked to a Reference Contact, it will link the new Reference License Professional to the Reference Contact.
*	linkRefContactWithRefLicProf(licnumber, [lictype]) - Link a Reference License Professional to the Reference Contact.
*	getAKA() - Returns an array of AKA Names for the assocated reference contact
*	addAKA(firstName,middleName,lastName,fullName,startDate,endDate) - Adds an AKA Name to the assocated reference contact
*	removeAKA(firstName,middleName,lastName) - Removes an AKA Name from the assocated reference contact
*	hasPublicUser() - Boolean indicating if the contact has an assocated public user account
*	linkToPublicUser(pUserId) - Links the assocated reference contact to the public user account
*	sendCreateAndLinkNotification() - Sends a Create and Link Notification using the PUBLICUSER CREATE AND LINK notification template to the contact for the scenario in AA where a paper application has been submitted
*	getRelatedRefContacts([relConsArray]) - Returns an array of related reference contacts. An optional relationship types array can be used
*   editName([fName], [mName], [lName], [fullName], [businessName], [dbaName]) - Edits the name fields of the contact
*   editEmail(emailAddress) - Edits the email address of the contact
*   editPhone([phone1],[phone2],[phone3],[fax]) - Edits the phone numbers of the contact
*   editContactAddress(addressType, addr1, addr2, addr3, city, state, zip, phone, countryCode, primary, effectiveDate, expirationDate, [addressStatus])
* </p>
* <p>
* Call Example:
* 	var vContactObj = new contactObj(vCCSM);
*	var contactRecordArray = vContactObj.getAssociatedRecords();
*	var cParams = aa.util.newHashtable();
*	vContactObj.getEmailTemplateParams(cParams);
* </p>
* @param ccsm {CapContactScriptModel}
* @return {contactObj}
*/

function contactObj(ccsm)  {

    this.people = null;         // for access to the underlying data
    this.capContact = null;     // for access to the underlying data
    this.capContactScript = null;   // for access to the underlying data
    this.capId = null;
    this.type = null;
    this.seqNumber = null;
    this.refSeqNumber = null;
    this.asiObj = null;
    this.asi = new Array();    // associative array of attributes
	this.customFieldsObj = null;
	this.customFields = new Array();
	this.customTablesObj = null;
	this.customTables = new Array();
    this.primary = null;
    this.relation = null;
    this.addresses = null;  // array of addresses
    this.validAttrs = false;
	this.validCustomFields = false;
	this.validCustomTables = false;
        
    this.capContactScript = ccsm;
    if (ccsm)  {
        if (ccsm.getCapContactModel == undefined) {  // page flow
            this.people = this.capContactScript.getPeople();
            this.refSeqNumber = this.capContactScript.getRefContactNumber();
            }
        else {
            this.capContact = ccsm.getCapContactModel();
            this.people = this.capContact.getPeople();
            this.refSeqNumber = this.capContact.getRefContactNumber();
			// contact ASI
			var tm = this.people.getTemplate();
			if (tm)	{
				var templateGroups = tm.getTemplateForms();
				var gArray = new Array();
				if (!(templateGroups == null || templateGroups.size() == 0)) {
                    var subGroups = templateGroups.get(0).getSubgroups();
                    if (subGroups != null) {
                        for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
                            var subGroup = subGroups.get(subGroupIndex);
                            var fields = subGroup.getFields();
                            for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
                                var field = fields.get(fieldIndex);
                                this.asi[field.getDisplayFieldName()] = field.getDefaultValue();
                            }
                        }
                    }
				}
			}

			// contact attributes
			// Load People Template Fields
            if (this.people.getAttributes() != null) {
                this.asiObj = this.people.getAttributes().toArray();
                if (this.asiObj != null) {
                    for (var xx1 in this.asiObj) this.asi[this.asiObj[xx1].attributeName] = this.asiObj[xx1];
                    this.validAttrs = true; 
                }   
            }
			// Load Custom Template Fields
			if (this.capContact.getTemplate() != null && this.capContact.getTemplate().getTemplateForms() != null) {
				var customTemplate = this.capContact.getTemplate();
				this.customFieldsObj = customTemplate.getTemplateForms();
				
				for (var i = 0; i < this.customFieldsObj.size(); i++) {
					var eachForm = this.customFieldsObj.get(i);

					//Sub Group
					var subGroup = eachForm.subgroups;

					if (subGroup == null) {
						continue;
					}

					for (var j = 0; j < subGroup.size(); j++) {
						var eachSubGroup = subGroup.get(j);

						if (eachSubGroup == null || eachSubGroup.fields == null) {
							continue;
						}

						var allFields = eachSubGroup.fields;
						for (var k = 0; k < allFields.size(); k++) {
							var eachField = allFields.get(k);
							this.customFields[eachField.displayFieldName] = eachField.defaultValue;
							logDebug("(contactObj) {" + eachField.displayFieldName + "} = " +  eachField.defaultValue);
							this.validCustomFields = true;
						}
					}
				}
			}
        }  

        //this.primary = this.capContact.getPrimaryFlag().equals("Y");
        this.relation = this.people.relation;
        this.seqNumber = this.people.contactSeqNumber;
        this.type = this.people.getContactType();
        this.capId = this.capContactScript.getCapID();
        var contactAddressrs = aa.address.getContactAddressListByCapContact(this.capContact);
        if (contactAddressrs.getSuccess()) {
            this.addresses = contactAddressrs.getOutput();
            var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
            this.people.setContactAddressList(contactAddressModelArr);
            }
        else {
            pmcal = this.people.getContactAddressList();
            if (pmcal) {
                this.addresses = pmcal.toArray();
            }
        }
    }       
        this.toString = function() { return this.capId + " : " + this.type + " " + this.people.getLastName() + "," + this.people.getFirstName() + " (id:" + this.seqNumber + "/" + this.refSeqNumber + ") #ofAddr=" + this.addresses.length + " primary=" + this.primary;  }
		
		this.getContactName = function(includeContactName, includeBusinessName, includeTradeName){
            var vContactName = "";
            var bFLName = false;
            // Set Defualts
            var vIncludeContactName = true;
            var vIncludeBusinessName = true;
            var vIncludeTradeName = false;
            if(!matches(includeContactName,null,undefined,"")) { vIncludeContactName = true }
            if(!matches(includeBusinessName,null,undefined,"")){ vIncludeBusinessName = true }
            if(!matches(includeTradeName,null,undefined,"")) { vIncludeTradeName = true }

			if (vIncludeContactName && this.people.getLastName() != null && this.people.getFirstName() != null){
                vContactName = this.people.getFirstName() + " " + this.people.getLastName()
                bFLName = true;
			}
			if(vIncludeContactName && vIncludeBusinessName && this.people.getBusinessName() != null && bFLName){
				vContactName = this.people.getBusinessName() + " - " + this.people.getFirstName() + " " + this.people.getLastName();
			}
			if(!vIncludeContactName && vIncludeBusinessName && !vIncludeTradeName && this.people.getBusinessName() != null){
				vContactName = this.people.getBusinessName();
            }
            if(!bFLName && vIncludeBusinessName && !vIncludeTradeName && this.people.getBusinessName() != null){
                // If there is no First or Last Name use the Business Name
				vContactName = this.people.getBusinessName();
            }
            if(!vIncludeContactName && vIncludeBusinessName && vIncludeTradeName && this.people.getBusinessName() != null){
				vContactName = this.people.getBusinessName() + " - " + this.people.getTradeName();
			}
			if(!vIncludeContactName && !vIncludeBusinessName && vIncludeTradeName && this.people.getTradeName() != null){
				vContactName = this.people.getTradeName();
            }
            if(vIncludeContactName && !vIncludeBusinessName && vIncludeTradeName && this.people.getTradeName() != null && bFLName){
				vContactName = this.people.getTradeName() + " - " + this.people.getFirstName() + " " + this.people.getLastName();
			}
            if(vIncludeContactName && vIncludeBusinessName && vIncludeTradeName && this.people.getBusinessName() != null && bFLName){
				vContactName = this.people.getBusinessName() + " - " + this.people.getTradeName() + " : " + this.people.getFirstName() + " " + this.people.getLastName();
			}
			return vContactName;
		}
        
        this.getEmailTemplateParams = function (params, vContactType) {
			var contactType = "Contact";
			if (arguments.length == 2) contactType = arguments[1];
			
            addParameter(params, "$$ContactName$$", this.getContactName());
            addParameter(params, "$$" + contactType + "LastName$$", this.people.getLastName());
            addParameter(params, "$$" + contactType + "FirstName$$", this.people.getFirstName());
            addParameter(params, "$$" + contactType + "MiddleName$$", this.people.getMiddleName());
            addParameter(params, "$$" + contactType + "BusinessName$$", this.people.getBusinessName());
            addParameter(params, "$$" + contactType + "TradeName$$", this.people.getTradeName());
            addParameter(params, "$$" + contactType + "SeqNumber$$", this.seqNumber);
            addParameter(params, "$$ContactType$$", this.type);
            addParameter(params, "$$" + contactType + "Relation$$", this.relation);
            addParameter(params, "$$" + contactType + "Phone1$$", this.people.getPhone1());
            addParameter(params, "$$" + contactType + "Phone2$$", this.people.getPhone2());
            addParameter(params, "$$" + contactType + "Email$$", this.people.getEmail());
            addParameter(params, "$$" + contactType + "AddressLine1$$", this.people.getCompactAddress().getAddressLine1());
            addParameter(params, "$$" + contactType + "AddressLine2$$", this.people.getCompactAddress().getAddressLine2());
            addParameter(params, "$$" + contactType + "City$$", this.people.getCompactAddress().getCity());
            addParameter(params, "$$" + contactType + "State$$", this.people.getCompactAddress().getState());
            addParameter(params, "$$" + contactType + "Zip$$", this.people.getCompactAddress().getZip());
            addParameter(params, "$$" + contactType + "Fax$$", this.people.getFax());
            addParameter(params, "$$" + contactType + "Country$$", this.people.getCompactAddress().getCountry());
            addParameter(params, "$$" + contactType + "FullName$$", this.people.getFullName());
            return params;
            }
        
        this.replace = function(targetCapId) { // send to another record, optional new contact type
        
            var newType = this.type;
            if (arguments.length == 2) newType = arguments[1];
            //2. Get people with target CAPID.
            var targetPeoples = getContactObjs(targetCapId,[String(newType)]);
            //3. Check to see which people is matched in both source and target.
            for (var loopk in targetPeoples)  {
                var targetContact = targetPeoples[loopk];
                if (this.equals(targetPeoples[loopk])) {
                    targetContact.people.setContactType(newType);
                    aa.people.copyCapContactModel(this.capContact, targetContact.capContact);
                    targetContact.people.setContactAddressList(this.people.getContactAddressList());
                    overwriteResult = aa.people.editCapContactWithAttribute(targetContact.capContact);
                    if (overwriteResult.getSuccess())
                        logDebug("overwrite contact " + targetContact + " with " + this);
                    else
                        logDebug("error overwriting contact : " + this + " : " + overwriteResult.getErrorMessage());
                    return true;
                    }
                }

                var tmpCapId = this.capContact.getCapID();
                var tmpType = this.type;
                this.people.setContactType(newType);
                this.capContact.setCapID(targetCapId);
                createResult = aa.people.createCapContactWithAttribute(this.capContact);
                if (createResult.getSuccess())
                    logDebug("(contactObj) contact created : " + this);
                else
                    logDebug("(contactObj) error creating contact : " + this + " : " + createResult.getErrorMessage());
                this.capContact.setCapID(tmpCapId);
                this.type = tmpType;
                return true;
        }

        this.equals = function(t) {
            if (t == null) return false;
            if (!String(this.people.type).equals(String(t.people.type))) { return false; }
            if (!String(this.people.getFirstName()).equals(String(t.people.getFirstName()))) { return false; }
            if (!String(this.people.getLastName()).equals(String(t.people.getLastName()))) { return false; }
            if (!String(this.people.getFullName()).equals(String(t.people.getFullName()))) { return false; }
            if (!String(this.people.getBusinessName()).equals(String(t.people.getBusinessName()))) { return false; }
            return  true;
        }
        
        this.saveBase = function() {
            // set the values we store outside of the models.
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            saveResult = aa.people.editCapContact(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) base contact saved : " + this);
            else
                logDebug("(contactObj) error saving base contact : " + this + " : " + saveResult.getErrorMessage());
            }               
        
        this.save = function() {
            // set the values we store outside of the models
            this.people.setContactType(this.type);
            this.capContact.setPrimaryFlag(this.primary ? "Y" : "N");
            this.people.setRelation(this.relation);
            this.capContact.setPeople(this.people);
            saveResult = aa.people.editCapContactWithAttribute(this.capContact);
            if (saveResult.getSuccess())
                logDebug("(contactObj) contact saved : " + this);
            else
                logDebug("(contactObj) error saving contact : " + this + " : " + saveResult.getErrorMessage());
            }
			
		this.syncCapContactToReference = function() {
			
			if(this.refSeqNumber){
				var vRefContPeopleObj = aa.people.getPeople(this.refSeqNumber).getOutput();
				var saveResult = aa.people.syncCapContactToReference(this.capContact,vRefContPeopleObj);
				if (saveResult.getSuccess())
					logDebug("(contactObj) syncCapContactToReference : " + this);
				else
					logDebug("(contactObj) error syncCapContactToReference : " + this + " : " + saveResult.getErrorMessage());
			}
			else{
				logDebug("(contactObj) error syncCapContactToReference : No Reference Contact to Syncronize With");
			}
            
		}
		this.syncCapContactFromReference = function() {
			
			if(this.refSeqNumber){
				var vRefContPeopleObj = aa.people.getPeople(this.refSeqNumber).getOutput();
				var saveResult = aa.people.syncCapContactFromReference(this.capContact,vRefContPeopleObj);
				if (saveResult.getSuccess())
					logDebug("(contactObj) syncCapContactFromReference : " + this);
				else
					logDebug("(contactObj) error syncCapContactFromReference : " + this + " : " + saveResult.getErrorMessage());
			}
			else{
				logDebug("(contactObj) error syncCapContactFromReference : No Reference Contact to Syncronize With");
			}
            
		}

        //get method for Attributes
        this.getAttribute = function (vAttributeName){
            var retVal = null;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null)
                    retVal = tmpVal.getAttributeValue();
            }
            return retVal;
        }
        
        //Set method for Attributes
        this.setAttribute = function(vAttributeName,vAttributeValue){
			var retVal = false;
            if(this.validAttrs){
                var tmpVal = this.asi[vAttributeName.toString().toUpperCase()];
                if(tmpVal != null){
                    tmpVal.setAttributeValue(vAttributeValue);
                    retVal = true;
                }
            }
            return retVal;
        }
		
		//get method for Custom Template Fields
        this.getCustomField = function(vFieldName){
            var retVal = null;
            if(this.validCustomFields){
                var tmpVal = this.customFields[vFieldName.toString()];
                if(!matches(tmpVal,undefined,null,"")){
                    retVal = tmpVal;
				}
            }
            return retVal;
        }
		
		//Set method for Custom Template Fields
        this.setCustomField = function(vFieldName,vFieldValue){
            
            var retVal = false;
            if(this.validCustomFields){
				
				for (var i = 0; i < this.customFieldsObj.size(); i++) {
					var eachForm = this.customFieldsObj.get(i);

					//Sub Group
					var subGroup = eachForm.subgroups;

					if (subGroup == null) {
						continue;
					}

					for (var j = 0; j < subGroup.size(); j++) {
						var eachSubGroup = subGroup.get(j);

						if (eachSubGroup == null || eachSubGroup.fields == null) {
							continue;
						}

						var allFields = eachSubGroup.fields;
						for (var k = 0; k < allFields.size(); k++) {
							var eachField = allFields.get(k);
							if(eachField.displayFieldName == vFieldName){
							logDebug("(contactObj) updating custom field {" + eachField.displayFieldName + "} = " +  eachField.defaultValue + " to " + vFieldValue);
							eachField.setDefaultValue(vFieldValue);
							retVal = true;
							}
						}
					}
				}
            }
            return retVal;
        }

        this.remove = function() {
            var removeResult = aa.people.removeCapContact(this.capId, this.seqNumber)
            if (removeResult.getSuccess())
                logDebug("(contactObj) contact removed : " + this + " from record " + this.capId.getCustomID());
            else
                logDebug("(contactObj) error removing contact : " + this + " : from record " + this.capId.getCustomID() + " : " + removeResult.getErrorMessage());
            }

        this.isSingleAddressPerType = function() {
            if (this.addresses.length > 1) 
                {
                
                var addrTypeCount = new Array();
                for (y in this.addresses) 
                    {
                    thisAddr = this.addresses[y];
                    addrTypeCount[thisAddr.addressType] = 0;
                    }

                for (yy in this.addresses) 
                    {
                    thisAddr = this.addresses[yy];
                    addrTypeCount[thisAddr.addressType] += 1;
                    }

                for (z in addrTypeCount) 
                    {
                    if (addrTypeCount[z] > 1) 
                        return false;
                    }
                }
            else
                {
                return true;    
                }

            return true;

            }

        this.getAddressTypeCounts = function() { //returns an associative array of how many adddresses are attached.
           
            var addrTypeCount = new Array();
            
            for (y in this.addresses) 
                {
                thisAddr = this.addresses[y];
                addrTypeCount[thisAddr.addressType] = 0;
                }

            for (yy in this.addresses) 
                {
                thisAddr = this.addresses[yy];
                addrTypeCount[thisAddr.addressType] += 1;
                }

            return addrTypeCount;

            }

        this.createPublicUser = function() {

            if (!this.capContact.getEmail())
            { logDebug("(contactObj) Couldn't create public user for : " + this +  ", no email address"); return false; }

            if (String(this.people.getContactTypeFlag()).equals("organization"))
            { logDebug("(contactObj) Couldn't create public user for " + this + ", the contact is an organization"); return false; }
            
            // check to see if public user exists already based on email address
            var getUserResult = aa.publicUser.getPublicUserByEmail(this.capContact.getEmail())
            if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                userModel = getUserResult.getOutput();
                logDebug("(contactObj) createPublicUserFromContact: Found an existing public user: " + userModel.getUserID());
            }

            if (!userModel) // create one
                {
                logDebug("(contactObj) CreatePublicUserFromContact: creating new user based on email address: " + this.capContact.getEmail()); 
                var publicUser = aa.publicUser.getPublicUserModel();
                publicUser.setFirstName(this.capContact.getFirstName());
                publicUser.setLastName(this.capContact.getLastName());
                publicUser.setEmail(this.capContact.getEmail());
                publicUser.setUserID(this.capContact.getEmail());
                publicUser.setPassword("e8248cbe79a288ffec75d7300ad2e07172f487f6"); //password : 1111111111
                publicUser.setAuditID("PublicUser");
                publicUser.setAuditStatus("A");
                publicUser.setCellPhone(this.people.getPhone2());

                var result = aa.publicUser.createPublicUser(publicUser);
                if (result.getSuccess()) {

                logDebug("(contactObj) Created public user " + this.capContact.getEmail() + "  sucessfully.");
                var userSeqNum = result.getOutput();
                var userModel = aa.publicUser.getPublicUser(userSeqNum).getOutput()

                // create for agency
                aa.publicUser.createPublicUserForAgency(userModel);

                // activate for agency
                var userPinBiz = aa.proxyInvoker.newInstance("com.accela.pa.pin.UserPINBusiness").getOutput()
                userPinBiz.updateActiveStatusAndLicenseIssueDate4PublicUser(aa.getServiceProviderCode(),userSeqNum,"ADMIN");

                // reset password
                var resetPasswordResult = aa.publicUser.resetPassword(this.capContact.getEmail());
                if (resetPasswordResult.getSuccess()) {
                    var resetPassword = resetPasswordResult.getOutput();
                    userModel.setPassword(resetPassword);
                    logDebug("(contactObj) Reset password for " + this.capContact.getEmail() + "  sucessfully.");
                } else {
                    logDebug("(contactObj **WARNING: Reset password for  " + this.capContact.getEmail() + "  failure:" + resetPasswordResult.getErrorMessage());
                }

                // send Activate email
                aa.publicUser.sendActivateEmail(userModel, true, true);

                // send another email
                aa.publicUser.sendPasswordEmail(userModel);
                }
                else {
                    logDebug("(contactObj) **WARNIJNG creating public user " + this.capContact.getEmail() + "  failure: " + result.getErrorMessage()); return null;
                }
            }

        //  Now that we have a public user let's connect to the reference contact       
            
        if (this.refSeqNumber)
            {
            logDebug("(contactObj) CreatePublicUserFromContact: Linking this public user with reference contact : " + this.refSeqNumber);
            aa.licenseScript.associateContactWithPublicUser(userModel.getUserSeqNum(), this.refSeqNumber);
            }
            

        return userModel; // send back the new or existing public user
        }

        this.getCaps = function() { // option record type filter
			var resultArray = new Array();
        
            if (this.refSeqNumber) {
                aa.print("ref seq : " + this.refSeqNumber);
                var capTypes = "*/*/*/*";
                
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput(); 
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ; 
                pm.setContactSeqNumber(this.refSeqNumber); 

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();
                
                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (appMatch(capTypes,thisCapId)) {
                        resultArray.push(thisCapId)
                        }
                    }
				} 
            
        return resultArray;
        }

        this.getRelatedContactObjs = function() { // option record type filter
        
            if (this.refSeqNumber) {
                var capTypes = null;
                var resultArray = new Array();
                if (arguments.length == 1) capTypes = arguments[0];

                var pm = aa.people.createPeopleModel().getOutput().getPeopleModel(); 
                var ccb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactDAOOracle").getOutput(); 
                pm.setServiceProviderCode(aa.getServiceProviderCode()) ; 
                pm.setContactSeqNumber(this.refSeqNumber); 

                var cList = ccb.getCapContactsByRefContactModel(pm).toArray();
                
                for (var j in cList) {
                    var thisCapId = aa.cap.getCapID(cList[j].getCapID().getID1(),cList[j].getCapID().getID2(),cList[j].getCapID().getID3()).getOutput();
                    if (capTypes && appMatch(capTypes,thisCapId)) {
                        var ccsm = aa.people.getCapContactByPK(thisCapId, cList[j].getPeople().contactSeqNumber).getOutput();
                        var newContactObj = new contactObj(ccsm);
                        resultArray.push(newContactObj)
                        }
                    }
            }
            
        return resultArray;
        }
        
		this.getRelatedRefLicProfObjs = function(){
			
			var refLicProfObjArray = new Array();
			
			// optional 2rd parameter serv_prov_code
				var updating = false;
				var serv_prov_code_4_lp = aa.getServiceProviderCode();
				if (arguments.length == 1) {
					serv_prov_code_4_lp = arguments[0];
					}
		
			if(this.refSeqNumber && serv_prov_code_4_lp)
			{
			  var xRefContactEntity = aa.people.getXRefContactEntityModel().getOutput();
			  xRefContactEntity.setServiceProviderCode(serv_prov_code_4_lp);
			  xRefContactEntity.setContactSeqNumber(parseInt(this.refSeqNumber));
			  xRefContactEntity.setEntityType("PROFESSIONAL");
			  //xRefContactEntity.setEntityID1(parseInt(refLicProfSeq));
			  var auditModel = xRefContactEntity.getAuditModel();
			  auditModel.setAuditDate(new Date());
			  auditModel.setAuditID(currentUserID);
			  auditModel.setAuditStatus("A")
			  xRefContactEntity.setAuditModel(auditModel);
			  var xRefContactEntityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
			  var xRefContactEntList = xRefContactEntityBusiness.getXRefContactEntityList(xRefContactEntity);
			  var xRefContactEntArray = xRefContactEntList.toArray();
			  if(xRefContactEntArray)
			  {
				 for(iLP in xRefContactEntArray){
					 var xRefContactEnt = xRefContactEntArray[iLP];
					 var lpSeqNbr = xRefContactEnt.getEntityID1();
					 var lpObjResult = aa.licenseScript.getRefLicenseProfBySeqNbr(aa.getServiceProviderCode(),lpSeqNbr);
					 var refLicNum = lpObjResult.getOutput().getStateLicense();
					 
					 refLicProfObjArray.push(new licenseProfObject(refLicNum));
				 
				 }
				
			  }
			  else
			  {
				  logDebug("(contactObj.getRelatedRefLicProfObjs) - No Related Reference License License Professionals");
			  }
			  
			  return refLicProfObjArray;
			}
			else
			{
			  logDebug("(contactObj.getRelatedRefLicProfObjs) Some Parameters were empty - unable to get related LPs");
			}

		}
		
		this.linkRefContactWithRefLicProf = function(licnumber, lictype){
			
			var lpObj = new licenseProfObject(licnumber,lictype);
			var refLicProfSeq = lpObj.refLicModel.getLicSeqNbr();
			// optional 2rd parameter serv_prov_code
				var updating = false;
				var serv_prov_code_4_lp = aa.getServiceProviderCode();
				if (arguments.length == 3) {
					serv_prov_code_4_lp = arguments[2];
					}
		
			if(this.refSeqNumber && refLicProfSeq && serv_prov_code_4_lp)
			{
			  var xRefContactEntity = aa.people.getXRefContactEntityModel().getOutput();
			  xRefContactEntity.setServiceProviderCode(serv_prov_code_4_lp);
			  xRefContactEntity.setContactSeqNumber(parseInt(this.refSeqNumber));
			  xRefContactEntity.setEntityType("PROFESSIONAL");
			  xRefContactEntity.setEntityID1(parseInt(refLicProfSeq));
			  var auditModel = xRefContactEntity.getAuditModel();
			  auditModel.setAuditDate(new Date());
			  auditModel.setAuditID(currentUserID);
			  auditModel.setAuditStatus("A")
			  xRefContactEntity.setAuditModel(auditModel);
			  var xRefContactEntityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
			  var existedModel = xRefContactEntityBusiness.getXRefContactEntityByUIX(xRefContactEntity);
			  if(existedModel.getContactSeqNumber())
			  {
				logDebug("(contactObj) The License Professional has been linked to the Reference Contact.");
			  }
			  else
			  {
				var XRefContactEntityCreatedResult = xRefContactEntityBusiness.createXRefContactEntity(xRefContactEntity);
				if (XRefContactEntityCreatedResult)
				{
				  logDebug("(contactObj) The License Professional has been linked to the Reference Contact.");
				}
				else
				{
				  logDebug("(contactObj) **ERROR:License professional failed to link to reference contact.  Reason: " +  XRefContactEntityCreatedResult.getErrorMessage());
				}
			  }
			}
			else
			{
			  logDebug("(contactObj.linkRefContactWithRefLicProf) Some Parameters are empty - License professional failed to link to reference contact.");
			}

		}
        
        this.createRefLicProf = function(licNum,rlpType,addressType,licenseState) {
            
            // optional 3rd parameter serv_prov_code
            var updating = false;
            var serv_prov_code_4_lp = aa.getServiceProviderCode();
            if (arguments.length == 5) {
                serv_prov_code_4_lp = arguments[4];
                aa.setDelegateAgencyCode(serv_prov_code_4_lp);
                }
            
            // addressType = one of the contact address types, or null to pull from the standard contact fields.
            var refLicProf = getRefLicenseProf(licNum,rlpType);
			var newLicResult = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.LicenseModel");
			var newLic
			if (newLicResult.getSuccess()){
				newLic = newLicResult.getOutput();
			}
			else{
				newLic = aa.licenseScript.createLicenseScriptModel();
			}

            if (refLicProf) {
                updating = true;
                logDebug("(contactObj) Updating existing Ref Lic Prof : " + licNum);
             }

            peop = this.people;
            cont = this.capContact;
            if (cont.getFirstName() != null) newLic.setContactFirstName(cont.getFirstName());
            if (peop.getMiddleName() != null) newLic.setContactMiddleName(peop.getMiddleName()); // use people for this
            if (cont.getLastName() != null)  newLic.setContactLastName(cont.getLastName());
			if (peop.getNamesuffix() != null) newLic.setSuffixName(peop.getNamesuffix());
			if (peop.getBirthDate() != null){ 
				var juDate = peop.getBirthDate();
				var sdtBirthDate = dateFormatted(1+juDate.getMonth(), juDate.getDate(), 1900+juDate.getYear(), "");
				newLic.setBirthDate(aa.util.parseDate(sdtBirthDate));
				logDebug("(contactObj.createRefLicProf) setBirthDate = " + sdtBirthDate);
			}
			if (peop.getMaskedSsn() != null) newLic.setMaskedSsn(peop.getMaskedSsn());
			if (peop.getFein() != null) newLic.setFein(peop.getFein());
			if (peop.getCountry() != null) newLic.setCountry(peop.getCountry());
			if (peop.getCountryCode() != null) newLic.setCountryCode(peop.getCountryCode()); 
            if (peop.getBusinessName() != null) newLic.setBusinessName(peop.getBusinessName());
            if (peop.getPhone1() != null) newLic.setPhone1(peop.getPhone1());
            if (peop.getPhone2() != null) newLic.setPhone2(peop.getPhone2());
			if (peop.getPhone3() != null) newLic.setPhone3(peop.getPhone3())
            if (peop.getEmail() != null) newLic.setEMailAddress(peop.getEmail());
            if (peop.getFax() != null) newLic.setFax(peop.getFax());
            newLic.setAgencyCode(serv_prov_code_4_lp);
			newLic.setServiceProviderCode(serv_prov_code_4_lp);
            //newLic.setAuditDate(sysDate);
			var today = new Date();
			newLic.setAuditDate(today);
            newLic.setAuditID(currentUserID);
            newLic.setAuditStatus("A");
            newLic.setLicenseType(rlpType);
            newLic.setStateLicense(licNum);
            newLic.setLicState(licenseState);
            //setting this field for a future enhancement to filter license types by the licensing board field. (this will be populated with agency names)
            var agencyLong = lookup("CONTACT_ACROSS_AGENCIES",servProvCode);
            if (!matches(agencyLong,undefined,null,"")) newLic.setLicenseBoard(agencyLong); else newLic.setLicenseBoard("");
 
            var addr = null;

            if (addressType) {
                for (var i in this.addresses) {
                    var cAddr = this.addresses[i];
                    if (addressType.equals(cAddr.getAddressType())) {
                        addr = cAddr;
                    }
                }
            }
            
            if (!addr) addr = peop.getCompactAddress();   //  only used on non-multiple addresses or if we can't find the right multi-address
            
            if (addr.getAddressLine1() != null) newLic.setAddress1(addr.getAddressLine1());
            if (addr.getAddressLine2() != null) newLic.setAddress2(addr.getAddressLine2());
            if (addr.getAddressLine3() != null) newLic.setAddress3(addr.getAddressLine3());
            if (addr.getCity() != null) newLic.setCity(addr.getCity());
            if (addr.getState() != null) newLic.setState(addr.getState());
            if (addr.getZip() != null) newLic.setZip(addr.getZip());
            if (addr.getCountryCode() != null) newLic.setCountryCode(addr.getCountryCode());
            
			var licBusResult = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.LicenseBusiness");
			
            if (updating){
				newLic.setLicSeqNbr(refLicProf.getLicSeqNbr());
				if (licBusResult.getSuccess()) {
					var licBus = licBusResult.getOutput();
					myResult = licBus.editLicenseByPK(newLic);
				}				
			}
            else{
				
				if (licBusResult.getSuccess()) {
					var licBus = licBusResult.getOutput();
					myResult = licBus.createLicense(newLic);
				}
				if (myResult)
                {
					var newRefLicSeqNbr = parseInt(myResult);
					this.linkRefContactWithRefLicProf(licNum,rlpType,serv_prov_code_4_lp);
				}
			}

            if (arguments.length == 5) {
                aa.resetDelegateAgencyCode();
            }
                
            if (myResult)
                {
                logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " From Contact " + this);
                return true;
                }
            else
                {
                logDebug("**WARNING: can't create ref lic prof: " + myResult);
                return false;
                }
        }
        
        this.getAKA = function() {
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            if (this.refSeqNumber) {
                return aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber)).toArray();
                }
            else {
                logDebug("contactObj: Cannot get AKA names for a non-reference contact");
                return false;
                }
            }
            
        this.addAKA = function(firstName,middleName,lastName,fullName,startDate,endDate) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot add AKA name for non-reference contact");
                return false;
                }
                
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var args = new Array();
            var akaModel = aa.proxyInvoker.newInstance("com.accela.orm.model.contact.PeopleAKAModel",args).getOutput();
            var auditModel = aa.proxyInvoker.newInstance("com.accela.orm.model.common.AuditModel",args).getOutput();

            var a = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));
            akaModel.setServiceProviderCode(aa.getServiceProviderCode());
            akaModel.setContactNumber(parseInt(this.refSeqNumber));
            akaModel.setFirstName(firstName);
            akaModel.setMiddleName(middleName);
            akaModel.setLastName(lastName);
            akaModel.setFullName(fullName);
            akaModel.setStartDate(startDate);
            akaModel.setEndDate(endDate);
            auditModel.setAuditDate(new Date());
            auditModel.setAuditStatus("A");
            auditModel.setAuditID("ADMIN");
            akaModel.setAuditModel(auditModel);
            a.add(akaModel);

            aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, a);
            }

        this.removeAKA = function(firstName,middleName,lastName) {
            if (!this.refSeqNumber) {
                logDebug("contactObj: Cannot remove AKA name for non-reference contact");
                return false;
                }
            
            var removed = false;
            var aka = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.PeopleAKABusiness").getOutput();
            var l = aka.getPeopleAKAListByContactNbr(aa.getServiceProviderCode(),String(this.refSeqNumber));
            
            var i = l.iterator();
            while (i.hasNext()) {
                var thisAKA = i.next();
                if ((!thisAKA.getFirstName() || thisAKA.getFirstName().equals(firstName)) && (!thisAKA.getMiddleName() || thisAKA.getMiddleName().equals(middleName)) && (!thisAKA.getLastName() || thisAKA.getLastName().equals(lastName))) {
                    i.remove();
                    logDebug("contactObj: removed AKA Name : " + firstName + " " + middleName + " " + lastName);
                    removed = true;
                    }
                }   
                    
            if (removed)
                aka.saveModels(aa.getServiceProviderCode(), this.refSeqNumber, l);
            }

        this.hasPublicUser = function() { 
            if (this.refSeqNumber == null) return false;
            var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(this.refSeqNumber));
            
            if (s_publicUserResult.getSuccess()) {
                var fpublicUsers = s_publicUserResult.getOutput();
                if (fpublicUsers == null || fpublicUsers.size() == 0) {
                    logDebug("The contact("+this.refSeqNumber+") is not associated with any public user.");
                    return false;
                } else {
                    logDebug("The contact("+this.refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                    return true;
                }
            } else { logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage()); return false; }
        }

        this.linkToPublicUser = function(pUserId) { 
           
            if (pUserId != null) {
                var pSeqNumber = pUserId.replace('PUBLICUSER','');
                
                var s_publicUserResult = aa.publicUser.getPublicUser(aa.util.parseLong(pSeqNumber));

                if (s_publicUserResult.getSuccess()) {
                    var linkResult = aa.licenseScript.associateContactWithPublicUser(pSeqNumber, this.refSeqNumber);

                    if (linkResult.getSuccess()) {
                        logDebug("Successfully linked public user " + pSeqNumber + " to contact " + this.refSeqNumber);
                    } else {
                        logDebug("Failed to link contact to public user");
                        return false;
                    }
                } else {
                    logDebug("Could not find a public user with the seq number: " + pSeqNumber);
                    return false;
                }


            } else {
                logDebug("No public user id provided");
                return false;
            }
        }

        this.sendCreateAndLinkNotification = function() {
            //for the scenario in AA where a paper application has been submitted
            var toEmail = this.people.getEmail();

            if (toEmail) {
                var params = aa.util.newHashtable();
                getACARecordParam4Notification(params,acaUrl);
                addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
                addParameter(params,"$$altID$$",capIDString);
                var notificationName;

                if (this.people.getContactTypeFlag() == "individual") {
                    notificationName = this.people.getFirstName() + " " + this.people.getLastName();
                } else {
                    notificationName = this.people.getBusinessName();
                }

                if (notificationName)
                    addParameter(params,"$$notificationName$$",notificationName);
                if (this.refSeqNumber) {
                    var v = new verhoeff();
                    var pinCode = v.compute(String(this.refSeqNumber));
                    addParameter(params,"$$pinCode$$",pinCode);

                    sendNotification(agencyReplyEmail,toEmail,"","PUBLICUSER CREATE AND LINK",params,null);                    
                }

                               
            }

        }

        this.getRelatedRefContacts = function() { //Optional relationship types array 
            
            var relTypes;
            if (arguments.length > 0) relTypes = arguments[0];
            
            var relConsArray = new Array();

            if (matches(this.refSeqNumber,null,undefined,"")) return relConsArray;

            //check as the source
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setContactSeqNumber(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);


            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getEntityID1());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }

            //check as the target
            var xrb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.XRefContactEntityBusiness").getOutput();
            xRefContactEntityModel = aa.people.getXRefContactEntityModel().getOutput();
            xRefContactEntityModel.setEntityID1(parseInt(this.refSeqNumber));
            x = xrb.getXRefContactEntityList(xRefContactEntityModel);

            if (x.size() > 0) {
                var relConList = x.toArray();

                for (var zz in relConList) {
                    var thisRelCon = relConList[zz];
                    var addThisCon = true;
                    if (relTypes) {
                        addThisCon = exists(thisRelCon.getEntityID4(),relTypes);
                    }

                    if (addThisCon) {
                        var peopResult = aa.people.getPeople(thisRelCon.getContactSeqNumber());
                        if (peopResult.getSuccess()) {
                            var peop = peopResult.getOutput();
                            relConsArray.push(peop);
                        }
                    }

                }
            }           

            return relConsArray;
        }
		
		this.editName = function(fName, mName, lName, fullName, businessName, dbaName){
				fNameStr = "" + fName;
				if (fNameStr != "undefined") {
					if (fNameStr == "null")
						this.capContact.setFirstName("");
					else
						this.capContact.setFirstName(fNameStr);
				}
				lNameStr = "" + lName;
				if (lNameStr != "undefined") {
					if (lNameStr == "null")
						this.capContact.setLastName("");
					else
						this.capContact.setLastName(lNameStr);
				}
				mNameStr = "" + mName;
				if (mNameStr != "undefined") {
					if (mNameStr == "null")
						this.capContact.setMiddleName("");
					else
						this.capContact.setMiddleName(mNameStr);
				}
				if (matches(fullName,undefined,null,"")) {
					if (mNameStr == "null")
						this.capContact.setFullName(fNameStr  + " " + lNameStr);
					else
						this.capContact.setFullName(fNameStr + " " + mNameStr + " " + lNameStr);
				}
				else{
					this.capContact.setFullName(String(fullName));
				}
				businessNameStr = "" + businessName;
				if (businessNameStr != "undefined") {
					if (businessNameStr == "null") 
						this.capContact.setBusinessName("");
					else
						this.capContact.setBusinessName(businessNameStr);
				}
				dbaNameStr = "" + dbaName;
				if (dbaNameStr != "undefined") {
					if (dbaNameStr == "null") 
						this.capContact.setTradeName("");
					else
						this.capContact.setTradeName(dbaNameStr);
				}
		}
		
		this.editEmail = function(emailAddress){
			if(!matches(emailAddress,undefined,null,"")) 
				this.capContact.setEmail(emailAddress);
		}

		this.editPhone = function(phone1,phone2,phone3,fax) {
			if(!matches(phone1,undefined,null,"")) 
				this.capContact.setPhone1(phone1);
			if(!matches(phone2,undefined,null,"")) 
				this.capContact.setPhone2(phone2);
			if(!matches(phone3,undefined,null,"")) 
				this.capContact.setPhone3(phone3);
			if(!matches(fax,undefined,null,"")) 
				this.capContact.setFax(fax);
		}

		this.editContactAddress = function(addressType, addr1, addr2, addr3, city, state, zip, phone, country, primary, effectiveDate, expirationDate, addressStatus, overwrite){
		var casm;
		var vOverwrite = (matches(overwrite,"N","No",false)) ? false : true;
		
		var contactAddressListResult = aa.address.getContactAddressListByCapContact(this.capContact);
			if (contactAddressListResult.getSuccess()) { 
					contactAddressList = contactAddressListResult.getOutput();
					for (var x in contactAddressList) {
						cal= contactAddressList[x];
						addrType = "" + cal.getAddressType();
							if (addrType == addressType) {
								cResult = aa.address.getContactAddressByPK(cal.getContactAddressModel());
								if (cResult.getSuccess()) {
									casm = cResult.getOutput();
									if(vOverwrite){
										casm.setAddressLine1(addr1);
										casm.setAddressLine2(addr2);
										casm.setAddressLine3(addr3);
										casm.setCity(city);
										casm.setState(state);
										casm.setZip(zip);
										casm.setPhone(phone);
										casm.setCountryCode(country);
										if(effectiveDate) casm.setEffectiveDate(aa.util.parseDate(effectiveDate));
										if(expirationDate) casm.setExpirationDate(aa.util.parseDate(expirationDate));
										if(matches(primary,"Y",true,"true"))
											casm.getContactAddressModel().setPrimary("Y");
										if(matches(addressStatus,"I",false,"false")){
											casm.getContactAddressModel().setStatus("I");
										}
										else{
											casm.getContactAddressModel().setStatus("A");
										}
										editResult = aa.address.editContactAddress(casm.getContactAddressModel());
										if (!editResult.getSuccess()) {
										logDebug("error modifying existing address : " + editResult.getErrorMessage());
										} else {
										logDebug("Address updated successfully");
										}
									} 
									else{
										// update the existing address expirationDate, deactivate
										// create a new address of the same type
										
										var conAdd = aa.address.createContactAddressModel().getOutput().getContactAddressModel();
										conAdd.setEntityType("CAP_CONTACT");
										conAdd.setEntityID(parseInt(this.capContact.getContactSeqNumber()));
										conAdd.setAddressType("Mailing");
										conAdd.setAddressLine1(addr1);
										conAdd.setAddressLine2(addr2);
										conAdd.setAddressLine3(addr3);
										conAdd.setCity(city);
										conAdd.setState(state);
										conAdd.setZip(zip);
										conAdd.setPhone(phone)
										conAdd.setCountryCode(country);
										if(effectiveDate){ 
											conAdd.setEffectiveDate(aa.util.parseDate(effectiveDate));
										}
										else{
											var today = dateAdd(null,0)
											conAdd.setEffectiveDate(aa.util.parseDate(today));
										}
										
										conAdd.setStatus("A");
										
										//Create AddressList 
										var contactAddrModelArr = aa.util.newArrayList();
										contactAddrModelArr.add(conAdd);
										
										// set the address
										this.people.setContactAddressList(contactAddrModelArr);
										
										editResult = aa.address.editContactAddress(conAdd.getContactAddressModel());
									}
									
									
									
								}
							}
						}	
						convertedContactAddressList = convertContactAddressModelArr(contactAddressList);
						this.people.setContactAddressList(convertedContactAddressList);
			}

		}
		
    }

/**
* License Professional Object 
* <p>
* Properties: 
*	refLicModel - Reference LP Model
*	capLicProfScriptModel - Transactional LP Model
*	infoTables - Table Array ex infoTables[name][row][column].getValue()
*	attribs - Array of LP Attributes ex attribs[name]
*	valid - Get the Attributes for LP
*	validTables - true if LP has infoTables
*	validAttrs - true if LP has attributes
* </p>
* <p>
* Methods: 
*	getEmailTemplateParams(params,[vLicenseType],[reference]) - LP Parameters for use in Notification Templates, defualts to reference
*	refreshTables() - Get all the Table Values, done this way to keep it clean when a row is added
*	getMaxRowByTable(vTableName) - Get max row from table for sequencing
*	addTableRow(vTableName, vValueArray) - Add Row to Table
*	addTableFromASIT(vTableName, vASITArray) - Process an ASIT row into People Info
*	removeTableRow(vTableName, vRowIndex) - Remove Row from Table
*	removeTable(vTableName) - Remove Table
*	setTableEnabledFlag(vTableName, vRowIndex, isEnabled) - Enable or Disable Table Row by index
*	setDisplayInACA4Table(vTableName, vIsVisible) - Makes table visible in ACA Lookup ('Y'/'N')
*	getAttribute(vAttributeName) - Get method for attributes
*	setAttribute(vAttributeName, vAttributeValue) - Set method for attributes
*	setPrimary(vCapId,vPrimary) - Sets the Primary flag on the Record License Professional ('Y'/'N')
*	updateFromRecordContactByType(vCapId, vContactType, vUpdateAddress, vUpdatePhoneEmail, [vAddressType]) - Update From Record Contact by Contact Type, uses first contact of type found. If contactType == "" then uses primary. If vAddressType is popualted it will use contact address list rather than compact address
*	updateFromAddress(vCapId) - Updates Reference License Prof address to the primary address on the record
*	updateFromRecordLicensedProf(vCapId) - Update Reference LP from Record Licensed Prof
*	copyToRecord(vCapId, vReplace) - Copy Reference Licensed Professional to a Record
*	enable() - Enable the Ref License Professional
*	disable() - Disable the Ref License Professional
*	getAssociatedRecords() - Returns an array of associated Record IDs
*	updateRecord() - Save Changes to this object to Reference Licensed Professional
* </p>
* <p>
* Call Example:
* 	var lPObj = new licenseProfObject("16LIC-00001","General Contractor");
*	var lpRecordArray = lPObj.getAssociatedRecords();
*	var lpParams = aa.util.newHashtable();
*	lPObj.getEmailTemplateParams(lpParams);
* </p>
* @param licnumber {String} license number
* @param [lictype] {String} license type (optional)
* @param [vCapId] {capIdModel} (optional)
* @return {licenseProfObject}
*/

function licenseProfObject(licnumber, lictype, vCapId) {
	//Populate the License Model
	this.refLicModel = null; //Reference LP Model
	this.capLicProfScriptModel = null; //Transactional LP Model
	this.infoTableGroupCodeObj = null;
	this.infoTableSubGroupCodesObj = null;
	this.infoTables = new Array(); //Table Array ex infoTables[name][row][column].getValue()
	this.attribs = new Array(); //Array of LP Attributes ex attribs[name]
	this.valid = false; //true if LP is valid
	this.validTables = false; //true if LP has infoTables
	this.validAttrs = false; //true if LP has attributes

	var itemCap = (vCapId) ? vCapId : capId;

	if(itemCap){
		var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
		if (capLicenseResult.getSuccess())
			{ capLicenseArr = capLicenseResult.getOutput();  }
		else
			{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }

		if (!capLicenseArr.length)
			{ logDebug("WARNING: no license professional available on the application:"); return false; }
		
		for(var iCapLP in capLicenseArr){
			var licProfScriptModel = capLicenseArr[iCapLP];
			var rlpId = licProfScriptModel.getLicenseNbr();
			var rlpType = licProfScriptModel.getLicenseType();

			if(rlpId==licnumber){
				this.capLicProfScriptModel = licProfScriptModel;
			}
		}
		
	}

	var result = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licnumber);
	if (result.getSuccess()) {
		var tmp = result.getOutput();
		if (lictype == null)
			lictype = "";
		if (tmp != null)
			for (lic in tmp)
				if (tmp[lic].getLicenseType().toUpperCase() == lictype.toUpperCase() || lictype == "") {
					this.refLicModel = tmp[lic];
					if (lictype == "") {
						lictype = this.refLicModel.getLicenseType();
					}
					break;
				}
	}
	
	//Get the People Info Tables
	if (this.refLicModel != null) {
		this.infoTableGroupCodeObj = this.refLicModel.getInfoTableGroupCodeModel();
		if (this.infoTableGroupCodeObj == null) {
			//12ACC-00187
			var infoSvc = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput();
			if (infoSvc.getInfoTableGroupCodeModel() != null) {
				infoSvc.getInfoTableGroupCodeModel().setServProvCode(aa.getServiceProviderCode());
				infoSvc.getInfoTableGroupCodeModel().setCategory(1);
				infoSvc.getInfoTableGroupCodeModel().setReferenceId("");
				infoSvc.getInfoTableGroupCodeModel().setName(lictype.toUpperCase());
				var tmpGrp = aa.licenseProfessional.getRefInfoTableGroupCode(infoSvc).getOutput();
				if (tmpGrp != null) { //If table was found set reference ID and write to DB
					tmpGrp.setReferenceId(this.refLicModel.getLicSeqNbr());
					infoSvc.setInfoTableGroupCodeModel(tmpGrp);
					aa.licenseProfessional.createRefInfoTable(infoSvc);

					//Recapture new data with Table Model
					var tmp = null;
					tmp = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licnumber).getOutput();
					for (lic in tmp)
						if (tmp[lic].getLicenseType().toUpperCase() == lictype.toUpperCase()) {
							this.refLicModel = tmp[lic];
							break;
						}
					//Get the Table Group Code and continue on
					this.infoTableGroupCodeObj = this.refLicModel.getInfoTableGroupCodeModel();
				}
			}
		}
	}

	if (this.infoTableGroupCodeObj != null) {
		var tmp = this.infoTableGroupCodeObj.getSubgroups();
		if (tmp != null)
			this.infoTableSubGroupCodesObj = tmp.toArray();
	}

	//Set flags that can be used for validation
	this.validTables = (this.infoTableSubGroupCodesObj != null);
	this.valid = (this.refLicModel != null);
	
	this.getEmailTemplateParams = function (params,vLicenseType,reference) {
		var vLicType = lictype;
		var vFromReferenece = true;
		if(vLicenseType) vLicType = vLicenseType;
		if(reference == false) vFromReferenece = false;
		
		if(this.refLicModel != null && vFromReferenece){
			addParameter(params, "$$" + vLicType + "LastName$$", this.refLicModel.getContactLastName());
			addParameter(params, "$$" + vLicType + "FirstName$$", this.refLicModel.getContactFirstName());
			addParameter(params, "$$" + vLicType + "MiddleName$$", this.refLicModel.getContactMiddleName());
			addParameter(params, "$$" + vLicType + "BusinesName$$", this.refLicModel.getBusinessName());
			addParameter(params, "$$" + vLicType + "BusinesLicense$$", this.refLicModel.getBusinessLicense());
			addParameter(params, "$$" + vLicType + "BusinesName2$$", this.refLicModel.getBusinessName2());
			addParameter(params, "$$" + vLicType + "LicSeqNbr$$", this.refLicModel.getLicSeqNbr());
			addParameter(params, "$$" + vLicType + "$$", this.refLicModel.getLicenseType());
			addParameter(params, "$$" + vLicType + "LicenseState$$", this.refLicModel.getLicState());
			addParameter(params, "$$" + vLicType + "LicenseExpirationDate$$", this.refLicModel.getLicenseExpirationDate());
			addParameter(params, "$$" + vLicType + "LicenseInsuranceExpDate$$", this.refLicModel.getInsuranceExpDate()); 
			addParameter(params, "$$" + vLicType + "LicenseIssueDate$$", this.refLicModel.getLicenseIssueDate()); 
			addParameter(params, "$$" + vLicType + "Phone1$$", this.refLicModel.getPhone1());
			addParameter(params, "$$" + vLicType + "Phone2$$", this.refLicModel.getPhone2());
			addParameter(params, "$$" + vLicType + "Phone3$$", this.refLicModel.getPhone3());
			addParameter(params, "$$" + vLicType + "Email$$", this.refLicModel.getEMailAddress());
			addParameter(params, "$$" + vLicType + "AddressLine1$$", this.refLicModel.getAddress1());
			addParameter(params, "$$" + vLicType + "AddressLine2$$", this.refLicModel.getAddress2());
			addParameter(params, "$$" + vLicType + "AddressLine3$$", this.refLicModel.getAddress3());
			addParameter(params, "$$" + vLicType + "City$$", this.refLicModel.getCity());
			addParameter(params, "$$" + vLicType + "State$$", this.refLicModel.getState());
			addParameter(params, "$$" + vLicType + "Zip$$", this.refLicModel.getZip());
			addParameter(params, "$$" + vLicType + "Fax$$", this.refLicModel.getFax());
			addParameter(params, "$$" + vLicType + "Country$$", this.refLicModel.getCountry());
			addParameter(params, "$$" + vLicType + "WcExpDate$$", this.refLicModel.getWcExpDate());
			addParameter(params, "$$" + vLicType + "WcPolicyNo$$", this.refLicModel.getWcPolicyNo());
			addParameter(params, "$$" + vLicType + "WcInsCoCode$$", this.refLicModel.getWcInsCoCode());	
		}
		else if(this.capLicProfScriptModel != null && !vFromReferenece){
			addParameter(params, "$$" + vLicType + "LastName$$", this.capLicProfScriptModel.getContactLastName());
			addParameter(params, "$$" + vLicType + "FirstName$$", this.capLicProfScriptModel.getContactFirstName());
			addParameter(params, "$$" + vLicType + "MiddleName$$", this.capLicProfScriptModel.getContactMiddleName());
			addParameter(params, "$$" + vLicType + "BusinesName$$", this.capLicProfScriptModel.getBusinessName());
			addParameter(params, "$$" + vLicType + "BusinesLicense$$", this.capLicProfScriptModel.getBusinessLicense());
			addParameter(params, "$$" + vLicType + "BusinesName2$$", this.capLicProfScriptModel.getBusName2());
			addParameter(params, "$$" + vLicType + "LicSeqNbr$$", this.capLicProfScriptModel.getLicenseNbr());
			addParameter(params, "$$" + vLicType + "$$", this.capLicProfScriptModel.getLicenseType());
			addParameter(params, "$$" + vLicType + "LicenseState$$", this.capLicProfScriptModel.getLicState());
			addParameter(params, "$$" + vLicType + "LicenseExpirationDate$$", this.capLicProfScriptModel.getLicenseExpirDate());
			addParameter(params, "$$" + vLicType + "LicenseIssueDate$$", this.capLicProfScriptModel.getLicesnseOrigIssueDate()); 
			addParameter(params, "$$" + vLicType + "Phone1$$", this.capLicProfScriptModel.getPhone1());
			addParameter(params, "$$" + vLicType + "Phone2$$", this.capLicProfScriptModel.getPhone2());
			addParameter(params, "$$" + vLicType + "Phone3$$", this.capLicProfScriptModel.getPhone3());
			addParameter(params, "$$" + vLicType + "Email$$", this.capLicProfScriptModel.getEmail());
			addParameter(params, "$$" + vLicType + "AddressLine1$$", this.capLicProfScriptModel.getAddress1());
			addParameter(params, "$$" + vLicType + "AddressLine2$$", this.capLicProfScriptModel.getAddress2());
			addParameter(params, "$$" + vLicType + "AddressLine3$$", this.capLicProfScriptModel.getAddress3());
			addParameter(params, "$$" + vLicType + "City$$", this.capLicProfScriptModel.getCity());
			addParameter(params, "$$" + vLicType + "State$$", this.capLicProfScriptModel.getState());
			addParameter(params, "$$" + vLicType + "Zip$$", this.capLicProfScriptModel.getZip());
			addParameter(params, "$$" + vLicType + "Fax$$", this.capLicProfScriptModel.getFax());
			addParameter(params, "$$" + vLicType + "Country$$", this.capLicProfScriptModel.getCountry());	
		}
		return params;

	}

	//Get all the Table Values, done this way to keep it clean when a row is added
	//Can also be used to refresh manually
	this.refreshTables = function () {
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				var tableArr = new Array()
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
				if (columnsList != null) {
					columnsList = columnsList.toArray();
					for (column in columnsList) {
						var tmpCol = columnsList[column].getTableValues();
						//aa.print(columnsList[column])
						if (tmpCol != null) {
							tmpCol = tmpCol.toArray();
							tmpCol.sort(function (a, b) {
								return a.getRowNumber() - b.getRowNumber()
							})
							//EMSE Dom gets by column, need to pivot to list by row to make usable
							for (var row = 0; row < tmpCol.length; row++) {
								tmpCol[row].setRowNumber(row); //Fix the row numbers
								if (tableArr[row] == null)
									tableArr[row] = new Array();
								tableArr[row][columnsList[column].getName()] = tmpCol[row];
							}
						}
					}
				}
				this.infoTables[this.infoTableSubGroupCodesObj[tbl].getName()] = tableArr;
			}
		}
	}
	this.refreshTables(); //Invoke the Table Refresh to popualte our table arrays

	//Get max row from table for sequencing
	this.getMaxRowByTable = function (vTableName) {
		var maxRow = -1;
		if (this.validTables) {
			var tbl = this.infoTables[vTableName];
			if (tbl != null) {
				for (row in tbl)
					for (col in tbl[row]) //due to way data is stored must loop through all row/columns
						if (maxRow < parseInt(tbl[row][col].getRowNumber()))
							maxRow = parseInt(tbl[row][col].getRowNumber());
			}
		}
		return maxRow;
	}

	//Add Row to Table
	this.addTableRow = function (vTableName, vValueArray) {
		var retVal = false;
		var newRowArray = new Array();
		if (this.validTables)
			for (tbl in this.infoTableSubGroupCodesObj)
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var maxRow = this.getMaxRowByTable(vTableName) + 1;
					var colsArr = this.infoTableSubGroupCodesObj[tbl].getColumnDefines().toArray();
					var colNum = 0;
					colsArr.sort(function (a, b) {
						return (parseInt(a.getDisplayOrder()) - parseInt(b.getDisplayOrder()))
					});
					for (col in colsArr) {
						//12ACC-00189
						var tmpTv = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput().getInfoTableValueModel();
						tmpTv.setAuditStatus("A");
						tmpTv.setServProvCode(aa.getServiceProviderCode());
						tmpTv.setColumnNumber(colNum++);
						tmpTv.setAuditDate(colsArr[col].getAuditDate()); //need proper date
						if (typeof(currentUserID) != 'undefined') //check to make sure a current userID exists
							tmpTv.setAuditId(currentUserID);
						else
							tmpTv.setAuditId("ADMIN"); //default to admin
						tmpTv.setInfoId(colsArr[col].getId());
						tmpTv.setRowNumber(maxRow); //use static new row variable from object
						for (val in vValueArray)
							if (val.toString().toUpperCase() == colsArr[col].getName().toString().toUpperCase()) {
								tmpTv.setValue(vValueArray[val].toString()); //Get Value from associative array
							}

						colsArr[col].addTableValue(tmpTv);
						retVal = true;
					}
					this.refreshTables(); //refresh associative arrays
				}
		return retVal;
	}

	//Process an ASIT row into People Info
	this.addTableFromASIT = function (vTableName, vASITArray) {
		var retVal = true;
		if (this.validTables)
			for (row in vASITArray) { //for Each Row in the ASIT execute the add
				if (!this.addTableRow(vTableName, vASITArray[row]))
					retVal = false;
			}
		else
			retVal = false;
		return retVal;
	}

	//Remove Row from Table
	this.removeTableRow = function (vTableName, vRowIndex) {
		var retVal = false;
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
					if (columnsList != null) {
						columnsList = columnsList.toArray();
						for (column in columnsList) {
							var tmpCol = columnsList[column].getTableValues();
							if (tmpCol != null) {
								tmpCol = tmpCol.toArray();
								//aa.print(tmpCol.length);
								if (vRowIndex <= tmpCol.length) {
									var tmpList = aa.util.newArrayList()
										for (row in tmpCol) {
											if (tmpCol[row].getRowNumber() != vRowIndex) {
												tmpList.add(tmpCol[row]);
												//aa.print(tmpCol[row].getColumnNumber() + " :" + tmpCol[row].getRowNumber());
											} else {
												retVal = true;
											}
										}
										columnsList[column].setTableValues(tmpList);
								} //End Remove
							} //end column Check
						} //end column loop
					} //end column list check
					break; //exit once table found
				} //end Table loop
			} //end table loop
		} //end table valid check

		return retVal;
	}

	this.removeTable = function (vTableName) {
		var retVal = false;
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
					if (columnsList != null) {
						columnsList = columnsList.toArray();
						for (column in columnsList) {
							var tmpCol = columnsList[column].getTableValues();
							if (tmpCol != null) {
								var tmpList = aa.util.newArrayList()
									columnsList[column].setTableValues(tmpList);
								retVal = true;
							} //End Remove
						} //end column loop
					} //end column list check
					break; //exit once table found
				} //end Table loop
			} //end table loop
		} //end table valid check

		return retVal;
	}

	//Enable or Disable Table Row by index
	this.setTableEnabledFlag = function (vTableName, vRowIndex, isEnabled) {
		var updated = false
			var tmp = null
			tmp = this.infoTables[vTableName];
		if (tmp != null)
			if (tmp[vRowIndex] != null) {
				for (col in tmp[vRowIndex]) {
					tmp[vRowIndex][col].setAuditStatus(((isEnabled) ? "A" : "I"));
					updated = true;
				}
			}
		return updated;
	}

	//Makes table visible in ACA Lookup
	//vIsVisible = 'Y' or 'N'
	this.setDisplayInACA4Table = function (vTableName, vIsVisible) {
		var retVal = false;
		if (this.validTables) {
			for (tbl in this.infoTableSubGroupCodesObj) {
				if (this.infoTableSubGroupCodesObj[tbl].getName() == vTableName) {
					var columnsList = this.infoTableSubGroupCodesObj[tbl].getColumnDefines();
					if (columnsList != null) {
						columnsList = columnsList.toArray();
						for (column in columnsList) {
							columnsList[column].setDisplayLicVeriForACA(vIsVisible);
							retVal = true;
						} //end column loop
					} //end column list check
					if (retVal) {
						var tmpList = aa.util.newArrayList();
						for (col in columnsList) {
							tmpList.add(columnsList[col]);
						}
						this.infoTableSubGroupCodesObj[tbl].setColumnDefines(tmpList);
					}
					break; //exit once table found
				} //end Table loop
			} //end table loop
		} //end table valid check
		return retVal;
	}

	//Get the Attributes for LP
	if (this.valid) {
		var tmpAttrs = this.refLicModel.getAttributes();
		if (tmpAttrs != null) {
			var tmpAttrsList = tmpAttrs.values()
				var tmpIterator = tmpAttrsList.iterator();
			if (tmpIterator.hasNext()) {
				var tmpAttribs = tmpIterator.next().toArray();
				for (x in tmpAttribs) {
					if(tmpAttribs[x].getAttributeLabel())
						this.attribs[tmpAttribs[x].getAttributeLabel().toUpperCase()] = tmpAttribs[x];
				}
				this.validAttrs = true;
			}
		}
	}

	//get method for Attributes
	this.getAttribute = function (vAttributeName) {
		var retVal = null;
		if (this.validAttrs) {
			var tmpVal = this.attribs[vAttributeName.toString().toUpperCase()];
			if (tmpVal != null)
				retVal = tmpVal.getAttributeValue();
		}
		return retVal;
	}

	//Set method for Attributes
	this.setAttribute = function (vAttributeName, vAttributeValue) {
		var retVal = false;
		if (this.validAttrs) {
			var tmpVal = this.attribs[vAttributeName.toString().toUpperCase()];
			if (tmpVal != null) {
				tmpVal.setAttributeValue(vAttributeValue);
				retVal = true;
			}
		}
		return retVal;
	}
	
	this.setPrimary = function(vCapId,vPrimary){
		//Get the LP from the Record
	
		if (this.valid) {
			var capLicenseResult = aa.licenseProfessional.getLicenseProf(vCapId);
			var capLicenseArr = new Array();
			var existing = false;
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			}

			if (capLicenseArr != null) {
				for (capLic in capLicenseArr) {
					var lpsm = capLicenseArr[capLic];
					if (lpsm.getLicenseNbr() + "" == this.refLicModel.getStateLicense() + ""
						 && lpsm.getLicenseType() + "" == this.refLicModel.getLicenseType() + "") {
							lpsm.setPrintFlag(vPrimary ? "Y" : "N");
							aa.licenseProfessional.editLicensedProfessional(lpsm);
					}
				}
			}
		}
	}

	//Update From Record Contact by Contact Type
	//Uses first contact of type found
	//If contactType == "" then uses primary
	//If vAddressType is popualted it will use contact address list rather than compact address
	this.updateFromRecordContactByType = function (vCapId, vContactType, vUpdateAddress, vUpdatePhoneEmail, vAddressType) {
		this.retVal = false;
		if (this.valid) {
			var conArr = new Array();
			var capContResult = aa.people.getCapContactByCapID(vCapId);

			if (capContResult.getSuccess()) {
				conArr = capContResult.getOutput();
			} else {
				retVal = false;
			}

			for (contact in conArr) {
				if (vContactType.toString().toUpperCase() ==
					conArr[contact].getPeople().getContactType().toString().toUpperCase()
					 || (vContactType.toString() == "" && conArr[contact].getPeople().getFlag() == "Y")) {

					cont = conArr[contact];
					peop = cont.getPeople();
					addr = peop.getCompactAddress();
					

					this.refLicModel.setContactFirstName(cont.getFirstName());
					this.refLicModel.setContactMiddleName(peop.getMiddleName()); //get mid from peop
					this.refLicModel.setContactLastName(cont.getLastName());
					this.refLicModel.setBusinessName(peop.getBusinessName());
					if (vUpdateAddress && vAddressType == null) {
						// Use Compact Address
						this.refLicModel.setAddress1(addr.getAddressLine1());
						this.refLicModel.setAddress2(addr.getAddressLine2());
						this.refLicModel.setAddress3(addr.getAddressLine3());
						this.refLicModel.setCity(addr.getCity());
						this.refLicModel.setState(addr.getState());
						this.refLicModel.setZip(addr.getZip());
					}
					if(vUpdateAddress && vAddressType){
						// Use Contact Address List
						var capContactModel = cont.getCapContactModel(); 
						var contactAddressListResult = aa.address.getContactAddressListByCapContact(capContactModel);
						
						if (contactAddressListResult.getSuccess()) { 
						var contactAddressList = contactAddressListResult.getOutput();
						foundAddressType = false;
							for (var x in contactAddressList) {
								var cal= contactAddressList[x];
								var addrType = cal.getAddressType();
								logDebug("Contact Address Type: " + addrType);
								if (addrType == vAddressType) {
									foundAddressType = true;
									contactAddressID = cal.getAddressID();
									cResult = aa.address.getContactAddressByPK(cal.getContactAddressModel());
									if (cResult.getSuccess()) {
										casm = cResult.getOutput(); // contactAddressScriptModel
										//aa.print(casm);
										this.refLicModel.setAddress1(casm.getAddressLine1());
										this.refLicModel.setAddress2(casm.getAddressLine2());
										this.refLicModel.setCity(casm.getCity());
										this.refLicModel.setState(casm.getState());
										this.refLicModel.setZip(casm.getZip());
									}
								}
							}	
						}
					}
					if (vUpdatePhoneEmail) {
						this.refLicModel.setPhone1(peop.getPhone1());
						this.refLicModel.setPhone2(peop.getPhone2());
						this.refLicModel.setPhone3(peop.getPhone3());
						this.refLicModel.setEMailAddress(peop.getEmail());
						this.refLicModel.setFax(peop.getFax());
					}
					//Audit Fields
					this.refLicModel.setAgencyCode(aa.getServiceProviderCode());
					this.refLicModel.setAuditDate(sysDate);
					this.refLicModel.setAuditID(currentUserID);
					this.refLicModel.setAuditStatus("A");

					retVal = true;
					break;
				}
			}
		}
		return retVal;
	}

	this.updateFromAddress = function (vCapId) {
		this.retVal = false;
		if (this.valid) {
			var capAddressResult = aa.address.getAddressByCapId(vCapId);
			var addr = null;
			if (capAddressResult.getSuccess()) {
				Address = capAddressResult.getOutput();
				for (yy in Address) {
					if ("Y" == Address[yy].getPrimaryFlag()) {
						addr = Address[yy];
						logDebug("Target CAP has primary address");
						break;
					}
				}
				if (addr == null) {
					addr = Address[0];
				}
			} else {
				logMessage("**ERROR: Failed to get addresses: " + capAddressResult.getErrorMessage());
			}

			if (addr != null) {
				var addrLine1 = addr.getAddressLine1();
				if (addrLine1 == null) {
					addrLine1 = addr.getHouseNumberStart();
					addrLine1 += (addr.getStreetDirection() != null ? " " + addr.getStreetDirection() : "");
					addrLine1 += (addr.getStreetName() != null ? " " + addr.getStreetName() : "");
					addrLine1 += (addr.getStreetSuffix() != null ? " " + addr.getStreetSuffix() : "");
					addrLine1 += (addr.getUnitType() != null ? " " + addr.getUnitType() : "");
					addrLine1 += (addr.getUnitStart() != null ? " " + addr.getUnitStart() : "");
				}
				this.refLicModel.setAddress1(addrLine1);
				this.refLicModel.setAddress2(addr.getAddressLine2());
				this.refLicModel.setCity(addr.getCity());
				this.refLicModel.setState(addr.getState());
				this.refLicModel.setZip(addr.getZip());
				retVal = true;
			} else {
				retVal = false;
			}
		}
		return retVal;
	}

	//Update From Record Licensed Prof
	//License Number and Type must match that of the Record License Prof
	this.updateFromRecordLicensedProf = function (vCapId) {
		var retVal = false;
		if (this.valid) {

			var capLicenseResult = aa.licenseProfessional.getLicenseProf(vCapId);
			var capLicenseArr = new Array();
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			} else {
				retVal = false;
			}

			for (capLic in capLicenseArr) {
				if (capLicenseArr[capLic].getLicenseNbr() + "" == this.refLicModel.getStateLicense() + ""
					 && capLicenseArr[capLic].getLicenseType() + "" == this.refLicModel.getLicenseType() + "") {

					licProfScriptModel = capLicenseArr[capLic];

					this.refLicModel.setAddress1(licProfScriptModel.getAddress1());
					this.refLicModel.setAddress2(licProfScriptModel.getAddress2());
					this.refLicModel.setAddress3(licProfScriptModel.getAddress3());
					this.refLicModel.setAgencyCode(licProfScriptModel.getAgencyCode());
					this.refLicModel.setAuditDate(licProfScriptModel.getAuditDate());
					this.refLicModel.setAuditID(licProfScriptModel.getAuditID());
					this.refLicModel.setAuditStatus(licProfScriptModel.getAuditStatus());
					this.refLicModel.setBusinessLicense(licProfScriptModel.getBusinessLicense());
					this.refLicModel.setBusinessName(licProfScriptModel.getBusinessName());
					this.refLicModel.setCity(licProfScriptModel.getCity());
					this.refLicModel.setCityCode(licProfScriptModel.getCityCode());
					this.refLicModel.setContactFirstName(licProfScriptModel.getContactFirstName());
					this.refLicModel.setContactLastName(licProfScriptModel.getContactLastName());
					this.refLicModel.setContactMiddleName(licProfScriptModel.getContactMiddleName());
					this.refLicModel.setContryCode(licProfScriptModel.getCountryCode());
					this.refLicModel.setCountry(licProfScriptModel.getCountry());
					this.refLicModel.setEinSs(licProfScriptModel.getEinSs());
					this.refLicModel.setEMailAddress(licProfScriptModel.getEmail());
					this.refLicModel.setFax(licProfScriptModel.getFax());
					this.refLicModel.setLicOrigIssDate(licProfScriptModel.getLicesnseOrigIssueDate());
					this.refLicModel.setPhone1(licProfScriptModel.getPhone1());
					this.refLicModel.setPhone2(licProfScriptModel.getPhone2());
					this.refLicModel.setSelfIns(licProfScriptModel.getSelfIns());
					this.refLicModel.setState(licProfScriptModel.getState());
					this.refLicModel.setLicState(licProfScriptModel.getState());
					this.refLicModel.setSuffixName(licProfScriptModel.getSuffixName());
					this.refLicModel.setWcExempt(licProfScriptModel.getWorkCompExempt());
					this.refLicModel.setZip(licProfScriptModel.getZip());

					//new
					this.refLicModel.setFein(licProfScriptModel.getFein());
					//licProfScriptModel.getBirthDate()
					//licProfScriptModel.getTitle()
					this.refLicModel.setPhone3(licProfScriptModel.getPhone3());
					this.refLicModel.setBusinessName2(licProfScriptModel.getBusName2());

					retVal = true;
				}
			}
		}
		return retVal;
	}

	//Copy Reference Licensed Professional to a Record
	//If replace is true will remove and readd lic_prof
	//Currently wont copy infoTables...
	this.copyToRecord = function (vCapId, vReplace) {
		var retVal = false;
		if (this.valid) {
			var capLicenseResult = aa.licenseProfessional.getLicenseProf(vCapId);
			var capLicenseArr = new Array();
			var existing = false;
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			}

			if (capLicenseArr != null) {
				for (capLic in capLicenseArr) {
					if (capLicenseArr[capLic].getLicenseNbr() + "" == this.refLicModel.getStateLicense() + ""
						 && capLicenseArr[capLic].getLicenseType() + "" == this.refLicModel.getLicenseType() + "") {
						if (vReplace) {
							aa.licenseProfessional.removeLicensedProfessional(capLicenseArr[capLic]);
							break;
						} else {
							existing = true;
						}
					}
				}
			}

			if (!existing) {
				capListResult = aa.licenseScript.associateLpWithCap(vCapId, this.refLicModel);
				retVal = capListResult.getSuccess();
				//Add peopleInfoTables via Workaround (12ACC-00186)
				if (this.validTables && retVal) {
					var tmpLicProfObj = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput();
					this.infoTableGroupCodeObj.setCapId1(vCapId.getID1());
					this.infoTableGroupCodeObj.setCapId2(vCapId.getID2());
					this.infoTableGroupCodeObj.setCapId3(vCapId.getID3());
					//save ref values
					var tmpRefId = this.infoTableGroupCodeObj.getReferenceId();
					var tmpRefType = this.infoTableGroupCodeObj.getReferenceType();
					var tmpRefDesc = this.infoTableGroupCodeObj.getReferenceDesc();
					//update Ref Values
					this.infoTableGroupCodeObj.setReferenceId(this.refLicModel.getStateLicense());
					this.infoTableGroupCodeObj.setReferenceType(this.refLicModel.getLicenseType());
					this.infoTableGroupCodeObj.setReferenceDesc("Description");
					this.infoTableGroupCodeObj.setCategory(1);
					tmpLicProfObj.setInfoTableGroupCodeModel(this.infoTableGroupCodeObj);
					aa.licenseProfessional.createInfoTable(tmpLicProfObj);
					//Set the cap back to null
					this.infoTableGroupCodeObj.setCapId1(null);
					this.infoTableGroupCodeObj.setCapId2(null);
					this.infoTableGroupCodeObj.setCapId3(null);
					//Set the ref values back
					this.infoTableGroupCodeObj.setReferenceId(tmpRefId);
					this.infoTableGroupCodeObj.setReferenceType(tmpRefType);
					this.infoTableGroupCodeObj.setReferenceDesc(tmpRefDesc);
				}
			}
		}
		return retVal;
	}

	this.enable = function () {
		this.refLicModel.setAuditStatus("A");
	}
	this.disable = function () {
		this.refLicModel.setAuditStatus("I");
	}

	//get records associated to license
	this.getAssociatedRecords = function () {
		var retVal = new Array();
		if (this.valid) {
			var resObj = aa.licenseScript.getCapIDsByLicenseModel(this.refLicModel);
			if (resObj.getSuccess()) {
				var tmp = resObj.getOutput();
				if (tmp != null) //make sure your not setting to null otherwise will not work like array
					retVal = tmp;
			}
		}
		return retVal;
	}

	//Save Changes to this object to Ref Licensed Professional
	this.updateRecord = function () {
		var retVal = false
			if (this.valid) {
				this.refreshTables(); //Must ensure row#s are good or wont show in ACA
				var res = aa.licenseScript.editRefLicenseProf(this.refLicModel);
				retVal = res.getSuccess();
			}
			return retVal;
	}

	return this
}

function sendNotificationGUS(eletricalId) {
	if (!appMatch("Building/Residential/Electrical/NA", electricalId)) return;

	var notificationTemplate = "BUILDING_ELECTRICAL_GUS";
	var fromEmail = "noreply@gus.com";
	var toEmail = "augustin.ravin@ks.gov";

	var eParams = aa.util.newHashtable();
	addParameter(eParams, "$$altID$$", String(electricalId.customID));
	
	sendNotification(fromEmail, toEmail, "", notificationTemplate, eParams, null);
	logDebug("Sending email temp: " + notificationTemplate + " to email " + toEmail);

}

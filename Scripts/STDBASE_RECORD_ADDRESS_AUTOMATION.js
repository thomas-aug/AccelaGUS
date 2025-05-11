/*

Title : Record Address Automation (After) 
Purpose : Automated Actions on Address and Ref-Address
Author: Yazan Barghouth 
 
 Functional Area : 
 
 JSON Example : 
{
  "Building/Commercial/Company/NA": {
    "ApplicationSpecificInfoUpdateAfter": [
      {
        "metadata": {
          "description": "Automated Actions on Address and Ref-Address",
          "operators": {
          }
        },
        "criteria": {
        },
        "preScript": "",
        "action": {
          "copyGISData": [
            {
              "service": "ADMA_GIS",
              "layer": "Parcels",
              "attribute": "ADDRESS",
              "mappingIdField": "FID",
              "field": "STREET NAME"
            },
            {
              "service": "ADMA_GIS",
              "layer": "Parcels",
              "attribute": "OFFICEAREA",
              "mappingIdField": "FID",
              "field": "BASIN NAME"
            }
          ],
          "recordTypeCreate": [
            {
              "type": "Building/Commercial/Company/Rec1",
              "status": "Open",
              "relationship": "",
              "createIfExists": ""
            },
            {
              "type": "Building/Commercial/Company/Rec2",
              "status": "Accepted",
              "relationship": "",
              "createIfExists": ""
            }
          ],
          "updateReferenceAddress": true,
          "geoCodeAdrress": "ESRI",
          "geoCodeInfo": "http://mycity.houstontx.gov/ArcGIS/rest/services/Geocode/GeocodeServer/findAddressCandidates",
          "copyConditions": true,
          "updateContactData": true,
          "contactType": "Applicant"
        },
        "postScript": ""
      }
    ]
  }
}

Note: regarding address/ref-address, ONLY Attributes (Custom Fields) are updated

GeoCode has 2 CONSTANTS added in code:

GOOGLE_ONLY_FULLMATCH: if only full-matched records should be considered
ESRI_MIN_SCORE: min score for ESRI results to be considered

--Parent/Child Record creation parameters:
recordTypeCreate: key-value pairs, key is appType, value is app status [optional, use "" to ignore] (used in search and create)

relationship: type of relation between current record and created record, options: parent, child

createIfExists: check if current record already have parent or child (based on relationship param), with same status
	if status in recordTypeCreate pair was set to "" , then it will be ignored
 * 
 */

var scriptSuffix = "RECORD_ADDRESS_AUTOMATION";

//CONSTANTS
var GOOGLE_ONLY_FULLMATCH = true; // for geoCode with Google (control result selecting)
var ESRI_MIN_SCORE = 100;// for geoCode with ESRI (control result selecting)

//needed in several places in this script, declared global
var addressesArray = new Array();

try {
	var settingsArray = [];

	if (isConfigurableScript(settingsArray, scriptSuffix)) {

		//needed in several places in this script, better to load it one time
		addressesArray = aa.address.getAddressByCapId(capId).getOutput();

		for (s in settingsArray) {
			var rules = settingsArray[s];

			//Execute PreScript
			var preScript = rules.preScript;
			if (!matches(preScript, null, "")) {
				eval(getScriptText(preScript));
			}
			if (cancelCfgExecution) {
				logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
				cancelCfgExecution = false;
				continue;
			}

			addressAutomation(rules);

			var postScript = rules.postScript;
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		}//for all settings
	}//isConf()
} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * update address fields from GIS attributes, ref address, and other actions
 * @param rules Json rules element (from settingsArray)
 */
function addressAutomation(rules) {

	if (!isEmptyOrNull(rules.action.copyGISData)) {
		var recordParcelAttributes = new Array();
		getParcel(recordParcelAttributes);
		if (recordParcelAttributes == null || recordParcelAttributes.length == 0) {
			logDebug("**INFO failed to load Parcels from record");
		} else {
			var parcelNumber = recordParcelAttributes[0]["ParcelNumber"];

			var newValuesMap = getGisAttributesMap(rules.action.copyGISData, parcelNumber);
			updateAddressAttributes(newValuesMap);
		}
	}//copyGISData

	if (addressesArray != null) {

		for (ad in addressesArray) {
			var geoResultArray = null;
			if (!isEmptyOrNull(rules.action.geoCodeAdrress) && rules.action.geoCodeAdrress.equalsIgnoreCase("ESRI")) {
				geoResultArray = geoCodeESRI(addressesArray[ad].getAddressLine1(), rules.action.geoCodeInfo, ESRI_MIN_SCORE, addressesArray[ad].getCity(), addressesArray[ad]
						.getState(), null);
			} else if (!isEmptyOrNull(rules.action.geoCodeAdrress) && rules.action.geoCodeAdrress.equalsIgnoreCase("Google")) {
				geoResultArray = geoCodeGoogle(addressesArray[ad].getAddressLine1(), rules.action.geoCodeInfo, GOOGLE_ONLY_FULLMATCH);
			}
			if (geoResultArray != null) {
				addressesArray[ad].setXCoordinator(geoResultArray["x"]);
				addressesArray[ad].setYCoordinator(geoResultArray["y"]);
				aa.address.editAddress(addressesArray[ad]);
			} else {
				logDebug("**INFO GeoCode result was null, geoCode type=" + rules.action.geoCodeAdrress + ", geoCodeInfo=" + rules.action.geoCodeInfo);
			}
		}//for all addresses
	}//addressesArray != null

	if (!isEmptyOrNull(rules.action.updateReferenceAddress) && rules.action.updateReferenceAddress) {
		updateRefAddressFromRecAddress();
	}//updateReferenceAddress

	if (!isEmptyOrNull(rules.action.copyConditions) && rules.action.copyConditions) {
		copyRefAddrCondToRecord();
	}//copyConditions

	if (!isEmptyOrNull(rules.action.updateContactData) && rules.action.updateContactData && !isEmptyOrNull(rules.action.contactType)) {
		updateRefAddressContact(rules.action.contactType);
	}//updateContactData

	if (!isEmptyOrNull(rules.action.recordTypeCreate)) {
		createAndRelateRecords(capId, rules.action.recordTypeCreate);
	}
}

/**
 * Updates Reference Address attached Contact(s) from Record Contact (of specified type)
 * reference address is selected based on address(es) added to the record
 * 
 * @param contactType the required contact type (copy from)
 * @returns {Boolean} true if process success, false if failed or related/required info was not found
 */
function updateRefAddressContact(contactType) {

	//get contacts on record
	var recordContacts = getContacts();
	if (recordContacts == null) {
		return false;
	}

	//Find if required contactType exist
	var contact = null;
	for (rc in recordContacts) {
		if (recordContacts[rc]["contactType"].equalsIgnoreCase(contactType)) {
			contact = recordContacts[rc];
			break;
		}
	}//for all recordContacts

	//no addresses on the record OR no contact of contactType on the record
	if (addressesArray == null || addressesArray.length == 0 || contact == null) {
		return false;
	}

	refAddressBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.RefAddressBusiness").getOutput();

	for (a in addressesArray) {
		var contactList = refAddressBusiness.getContactListByAddress(aa.getServiceProviderCode(), addressesArray[a].getRefAddressId(), null);

		for (var j = 0; j < contactList.size(); j++) {
			var contactModel = contactList.get(j);

			var contactSeq = contactModel.getContactSeqNumber();
			var peopleModel = aa.people.getPeople(contactSeq).getOutput();

			peopleModel.setFullName(contact["fullName"]);
			peopleModel.setPhone1(contact["phone1"]);
			peopleModel.setPhone2(contact["phone2"]);
			peopleModel.setEmail(contact["email"]);
			peopleModel.setFax(contact["fax"]);

			peopleModel.setFirstName(contact["firstName"]);
			peopleModel.setLastName(contact["lastName"]);
			peopleModel.setMiddleName(contact["middleName"]);
			peopleModel.setBusinessName(contact["businessName"]);

			peopleModel.setRelation(contact["relation"]);
			peopleModel.setCountryCode(contact["country"]);

			aa.people.editPeople(peopleModel);
		}//for all contacts in address
	}//all addresses
	return true;
}

/**
 * 
 * @param addressLine The street address that you want to geocode, in the format used by the national postal service of the country concerned
 * @param apiKey google API Key
 * @param onlyFullMatch if set to true only a result with full match is returned
 * @param OptionalParameters [country] (better 2 letters), [postalCode], [administrativeArea], [locality], [route]
 * @returns null if request failed, otherwise returns an Associative array -result- where result["x"]:Longitude, result["y"]:Latitude
 */
function geoCodeGoogle(addressLine, apiKey, onlyFullMatch) {
	//Optional: country (better 2 letters) postal_code administrative_area locality route    
	//&components=KEY:VAL|KEY:VAL|...
	//addressLine: The street address that you want to geocode, in the format used by the national postal service of the country concerned

	var url = "https://maps.googleapis.com/maps/api/geocode/json?";
	if (addressLine != null && addressLine != "") {
		addressLine = addressLine.split(" ").join("+");//urlDecode
		url += "address=" + addressLine;
	} else {
		return null;
	}

	var addressComponents = "";

	if (arguments.length > 3) {
		if (arguments[3] != null && arguments[3] != "") {
			addressComponents += "country:" + arguments[3] + "|";
		}
	}

	if (arguments.length > 4) {
		if (arguments[4] != null && arguments[4] != "") {
			addressComponents += "postal_code:" + arguments[4] + "|";
		}
	}

	if (arguments.length > 5) {
		if (arguments[5] != null && arguments[5] != "") {
			addressComponents += "administrative_area:" + arguments[5] + "|";
		}
	}

	if (arguments.length > 6) {
		if (arguments[6] != null && arguments[6] != "") {
			addressComponents += "locality:" + arguments[6] + "|";
		}
	}

	if (arguments.length > 7) {
		if (arguments[7] != null && arguments[7] != "") {
			addressComponents += "route:" + arguments[7] + "|";
		}
	}

	//append to URL
	if (addressComponents != "") {
		//remove last |
		addressComponents = addressComponents.substring(0, addressComponents.length - 1);
		url += "&components=" + addressComponents;
	}

	url += "&key=" + apiKey;

	var httpResp = aa.httpClient.get(url);
	if (httpResp.getSuccess()) {
		httpResp = httpResp.getOutput();
	} else {
		return null;
	}

	geoCodeJsonObj = JSON.parse(httpResp);

	if (!geoCodeJsonObj.status.equals("OK")) {
		return null;
	}

	var result = new Array();
	for (c in geoCodeJsonObj.results) {
		if (geoCodeJsonObj.results[c].partial_match && onlyFullMatch) {
			continue;
		} else if (onlyFullMatch && !geoCodeJsonObj.results[c].partial_match) {
			//onlyFullMatch && response has a fullMatch
			result["x"] = geoCodeJsonObj.results[c].geometry.location.lng;
			result["y"] = geoCodeJsonObj.results[c].geometry.location.lat;
			return result;
		} else if (!onlyFullMatch && !geoCodeJsonObj.results[c].partial_match) {
			//!onlyFullMatch but response has a fullMatch
			result["x"] = geoCodeJsonObj.results[c].geometry.location.lng;
			result["y"] = geoCodeJsonObj.results[c].geometry.location.lat;
			return result;
		} else if (!onlyFullMatch && geoCodeJsonObj.results[c].partial_match) {
			//!onlyFullMatch && response has a partial_match
			result["x"] = geoCodeJsonObj.results[c].geometry.location.lng;
			result["y"] = geoCodeJsonObj.results[c].geometry.location.lat;
			return result;
		}
	}//for all results
	return null;
}

/**
 * 
 * @param addressLine
 * @param esriUrl
 * @param minScore a result with score greater than or equals
 * @param city
 * @param state
 * @param zone
 * @returns null if request failed, otherwise returns an Associative array -result- where result["x"]:X-Coordinate (Longitude), result["y"]:Y-Coordinate (Latitude)
 */
function geoCodeESRI(addressLine, esriUrl, minScore, city, state, zone) {
	esriUrl += "?";

	if (addressLine != null && addressLine != "") {
		addressLine = addressLine.split(" ").join("+");//urlDecode
		esriUrl += "Address=" + addressLine;
	} else {
		return null;
	}
	if (city != null && city != "") {
		esriUrl += "&City=" + city;
	} else {
		esriUrl += "&City=";
	}
	if (state != null && state != "") {
		esriUrl += "&State=" + state;
	} else {
		esriUrl += "&State=";
	}
	if (zone != null && zone != "") {
		esriUrl += "&Zone=" + zone;
	} else {
		esriUrl += "&Zone=";
	}

	esriUrl += "&SingleLine=&outFields=&outSR=4326&f=pjson";

	var httpResp = aa.httpClient.get(esriUrl);

	if (httpResp.getSuccess()) {
		httpResp = httpResp.getOutput();
	} else {
		return null;
	}

	//which one to return?
	geoCodeJsonObj = JSON.parse(httpResp);

	if (geoCodeJsonObj.candidates == null || geoCodeJsonObj.candidates.length == 0) {
		return null;
	}

	var result = new Array();
	for (c in geoCodeJsonObj.candidates) {
		var candidate = geoCodeJsonObj.candidates[c];
		if (parseInt(candidate.score) >= minScore) {
			result["x"] = geoCodeJsonObj.candidates[c].location.x;
			result["y"] = geoCodeJsonObj.candidates[c].location.y;
			return result;
		}
	}//for all candidates
	return null;
}

/**
 * @param newAttrMap a key-value associative array, where key is the destination field name, and value is the new value
 * @returns true if update succeeded, otherwise false
 */
function updateAddressAttributes(newAttrMap) {
	//var addressesArray = aa.address.getAddressByCapId(capId).getOutput();
	if (addressesArray == null || addressesArray.length == 0) {
		return false;
	}

	var changed = false;
	for (ad in addressesArray) {
		changed = false;
		var addressAttributes = addressesArray[ad].getAttributes().toArray();
		for (a in addressAttributes) {
			for (n in newAttrMap) {
				if (n.equals(addressAttributes[a].getB1AttributeName())) {
					changed = true;
					addressAttributes[a].setB1AttributeValue(newAttrMap[n]);
					break;//stop and find next attribute
				}//attr name matched
			}//for all attrMap
		}//for all attributes

		//make sure DB-update is needed
		if (changed) {
			var updateResult = aa.address.editAddressWithAPOAttribute(capId, addressesArray[ad]);
			if (!updateResult.getSuccess()) {
				logDebug("**INFO failed to update address : " + updateResult.getErrorMessage());
			}
		}//changed
	}//for all addresses
	return true;
}

/**
 * updates fields and attributes of the reference address from record address values
 * @returns true if update succeeded, otherwise false
 */
function updateRefAddressFromRecAddress() {

	//var addressesArray = aa.address.getAddressByCapId(capId).getOutput();
	if (addressesArray == null || addressesArray.length == 0) {
		return false;
	}

	var ab = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.RefAddressBusiness").getOutput();

	for (ad in addressesArray) {
		var refAddressId = addressesArray[ad].getRefAddressId();

		var refAddress = aa.address.getRefAddressByPK(refAddressId);
		if (refAddress.getSuccess()) {
			refAddress = refAddress.getOutput().getRefAddressModel();
		} else {
			logDebug("**INFO Could not get refAddress " + refAddress.getErrorMessage());
			continue;
		}

		refAddress.setHouseNumberStartTo(addressesArray[ad].getHouseNumberStartTo());
		refAddress.setHouseNumberEnd(addressesArray[ad].getHouseNumberEnd());
		refAddress.setHouseNumberEndFrom(addressesArray[ad].getHouseNumberEndFrom());
		refAddress.setHouseNumberStartFrom(addressesArray[ad].getHouseNumberStartFrom());
		refAddress.setHouseNumberEndTo(addressesArray[ad].getHouseNumberEndTo());
		refAddress.setStreetNameStart(addressesArray[ad].getStreetNameStart());
		refAddress.setXCoordinator(addressesArray[ad].getXCoordinator());
		refAddress.setUnitRangeStart(addressesArray[ad].getUnitRangeStart());
		refAddress.setHouseNumberRangeStart(addressesArray[ad].getHouseNumberRangeStart());
		refAddress.setCrossStreetNameStart(addressesArray[ad].getCrossStreetNameStart());
		refAddress.setCrossStreetNameEnd(addressesArray[ad].getCrossStreetNameEnd());
		refAddress.setAddressLine1(addressesArray[ad].getAddressLine1());
		refAddress.setLocationType(addressesArray[ad].getLocationType());
		refAddress.setAddressLine2(addressesArray[ad].getAddressLine2());
		refAddress.setYCoordinator(addressesArray[ad].getYCoordinator());
		refAddress.setUnitRangeEnd(addressesArray[ad].getUnitRangeEnd());
		refAddress.setHouseNumberRangeEnd(addressesArray[ad].getHouseNumberRangeEnd());
		refAddress.setStreetNameEnd(addressesArray[ad].getStreetNameEnd());
		refAddress.setSecondaryRoadNumber(addressesArray[ad].getSecondaryRoadNumber());
		refAddress.setLevelNumberStart(addressesArray[ad].getLevelNumberStart());
		refAddress.setHouseNumberAlphaEnd(addressesArray[ad].getHouseNumberAlphaEnd());
		refAddress.setLevelPrefix(addressesArray[ad].getLevelPrefix());
		refAddress.setHouseNumberAlphaStart(addressesArray[ad].getHouseNumberAlphaStart());
		refAddress.setHouseNumberStart(addressesArray[ad].getHouseNumberStart());
		refAddress.setLevelNumberEnd(addressesArray[ad].getLevelNumberEnd());
		refAddress.setDistance(addressesArray[ad].getDistance());
		refAddress.setAddressType(addressesArray[ad].getAddressType());
		refAddress.setState(addressesArray[ad].getState());
		refAddress.setCountry(addressesArray[ad].getCountry());
		refAddress.setUnitStart(addressesArray[ad].getUnitStart());
		refAddress.setCity(addressesArray[ad].getCity());
		refAddress.setStreetName(addressesArray[ad].getStreetName());
		refAddress.setCounty(addressesArray[ad].getCounty());
		refAddress.setZip(addressesArray[ad].getZip());
		refAddress.setStreetPrefix(addressesArray[ad].getStreetPrefix());
		refAddress.setInspectionDistrictPrefix(addressesArray[ad].getInspectionDistrictPrefix());
		refAddress.setNeighberhoodPrefix(addressesArray[ad].getNeighberhoodPrefix());
		refAddress.setNeighborhood(addressesArray[ad].getNeighborhood());
		refAddress.setHouseFractionEnd(addressesArray[ad].getHouseFractionEnd());
		refAddress.setSecondaryRoad(addressesArray[ad].getSecondaryRoad());
		refAddress.setAddressTypeFlag(addressesArray[ad].getAddressTypeFlag());
		refAddress.setAddressDescription(addressesArray[ad].getAddressDescription());
		refAddress.setResStreetSuffixdirection(addressesArray[ad].getResStreetSuffixdirection());
		refAddress.setResStreetSuffix(addressesArray[ad].getResStreetSuffix());
		refAddress.setCountryCode(addressesArray[ad].getCountryCode());
		refAddress.setResUnitType(addressesArray[ad].getResUnitType());
		refAddress.setResStreetDirection(addressesArray[ad].getResStreetDirection());
		refAddress.setResCountryCode(addressesArray[ad].getResCountryCode());
		refAddress.setFullAddress(addressesArray[ad].getFullAddress());
		refAddress.setStreetDirection(addressesArray[ad].getStreetDirection());
		refAddress.setStreetSuffix(addressesArray[ad].getStreetSuffix());
		refAddress.setStreetSuffixdirection(addressesArray[ad].getStreetSuffixdirection());
		refAddress.setHouseFractionStart(addressesArray[ad].getHouseFractionStart());
		refAddress.setInspectionDistrict(addressesArray[ad].getInspectionDistrict());
		refAddress.setUnitEnd(addressesArray[ad].getUnitEnd());
		refAddress.setUnitType(addressesArray[ad].getUnitType());
		refAddress.setResState(addressesArray[ad].getResState());

		for (fa = 0; fa < refAddress.getAttributes().size(); fa++) {
			for (ra = fa; ra < addressesArray[ad].getAttributes().size(); ra++) {
				if (refAddress.getAttributes().get(fa).getAttributeName().equals(addressesArray[ad].getAttributes().get(ra).getB1AttributeName())) {
					refAddress.getAttributes().get(fa).setAttributeValue(addressesArray[ad].getAttributes().get(ra).getB1AttributeValue());
					break;//stop and find next attribute
				}//same attribute name
			}//for rec address attr
		}//for ref address attr

		try {
			ab.editRefAddressWithAPOAttribute(aa.getServiceProviderCode(), refAddress, refAddress.getAttributes());
		} catch (ex) {
			logDebug("**INFO failed editRefAddressWithAPOAttribute() " + ex);
		}
	}//for all addresses

	return true;
}

/**
 * Copies the condition(s) defined on the reference address to the record
 * @returns true if update succeeded, otherwise false
 */
function copyRefAddrCondToRecord() {

	if (addressesArray == null || addressesArray.length == 0) {
		return false;
	}
	for (ad in addressesArray) {
		var refAddressId = addressesArray[ad].getRefAddressId();

		var refAddress = aa.address.getRefAddressByPK(refAddressId);
		if (refAddress.getSuccess()) {
			refAddress = refAddress.getOutput().getRefAddressModel();
		} else {
			logDebug("**INFO could not get refAddress " + refAddress.getErrorMessage());
			continue;
		}

		var refAddrConds = aa.addressCondition.getAddressConditions(refAddressId);
		refAddrConds = refAddrConds.getOutput();
		var sysDate = aa.date.getCurrentDate();

		for (cc in refAddrConds) {
			var i = refAddrConds[cc].getAddressConditionModel();
			var s = aa.capCondition.addCapCondition(capId, i.getConditionType(), i.getConditionDescription(), i.getConditionComment(), i.getEffectDate(), i.getExpireDate(),
					sysDate, i.getRefNumber1(), i.getRefNumber2(), i.getImpactCode(), i.getIssuedByUser(), i.getStatusByUser(), i.getConditionStatus(), aa.getAuditID(), i
							.getAuditStatus());
		}//for all refAddrConds
	}//for all addresses
	return true;
}

function createAndRelateRecords(currCapId, recordTypeCreate) {
	//prevent errors when running script with old JSON config files
	if (typeof recordTypeCreate === 'undefined' || recordTypeCreate == null) {
		logDebug("**WARN config JSON is missing some properties? recordTypeCreate, relationship, createIfExist");
		return false;
	}

	var relatedRecords = null;
	var createRecords = true;

	for (t in recordTypeCreate) {

		var recItem = recordTypeCreate[t];
		var reqStatus = recItem.status;

		//if createIfExist = no, check if we need to search for exist records same type/status
		if (recItem.createIfExists.equalsIgnoreCase("no")) {
			if (recItem.relationship.equalsIgnoreCase("parent")) {
				relatedRecords = getParents(recItem.type);
			} else if (recItem.relationship.equalsIgnoreCase("child")) {
				relatedRecords = getChildren(recItem.type, currCapId);
			} else {
				logDebug("**WARN invalid relationship: " + recItem.relationship);
				return false;
			}

			var createThisRecord = true;
			//check status
			if (relatedRecords != null && relatedRecords.length > 0) {
				for (r in relatedRecords) {
					if (reqStatus == "") {
						createThisRecord = false;
						break;
					}

					var tmpCap = aa.cap.getCap(relatedRecords[r]).getOutput();
					if (tmpCap.getCapStatus() != null && tmpCap.getCapStatus().equalsIgnoreCase(reqStatus)) {
						createThisRecord = false;
						break;
					}
				}//for all related records
			}//if we have related records
		} else {
			createThisRecord = true;
		}//createIfExist

		//if we can createThisRecord, create and relate record
		if (createThisRecord) {
			//Create
			var appTypeAry = recItem.type.split("/");
			var newRecordId = aa.cap.createApp(appTypeAry[0], appTypeAry[1], appTypeAry[2], appTypeAry[3], "");
			if (!newRecordId.getSuccess()) {
				logDebug("**WARN failed to create new record: " + t + ", Error:" + newRecordId.getErrorMessage());
				continue;
			}//create error
			newRecordId = newRecordId.getOutput();

			//Update Status
			if (reqStatus != "") {
				updateAppStatus(reqStatus, "By address-automation script", newRecordId);
			}

			//Add Relation
			var relationResult = null;
			if (recItem.relationship.equalsIgnoreCase("parent")) {
				relationResult = aa.cap.createAppHierarchy(newRecordId, currCapId);
			} else if (recItem.relationship.equalsIgnoreCase("child")) {
				relationResult = aa.cap.createAppHierarchy(currCapId, newRecordId);
			}

			if (!relationResult.getSuccess()) {
				logDebug("**WARN createAppHierarchy failed: currID=" + currCapId + " newID=" + newRecordId + ", Error:" + relationResult.getErrorMessage());
			}
		}//createThisRecord
	}//for all record types
}

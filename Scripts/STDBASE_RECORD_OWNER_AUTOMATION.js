/*

Title : Record Owner Automation (After) 
Purpose : Automate owner maintenance on a record.
Author: Yazan Barghouth 
 
 Functional Area : 
 
 JSON Example :

{
  "Marijuana/Entity/Prequalification/Application": {
    "ApplicationSpecificInfoUpdateAfter": [
      {
        "metadata": {
          "description": "To Automate owner maintenance on a record",
          "operators": {
            
          }
        },
        "criteria": {
          
        },
        "preScript": "",
        "action": {
          "copyGISData": [
            {
              "service": "BPTALM",
              "layer": "Parcel_Owner",
              "attribute": "OwnerName",
              "mappingIdField": "FID",
              "field": "OwnerFullName"
            },
            {
              "service": "BPTALM",
              "layer": "Parcel_Owner",
              "attribute": "OwnerAddress",
              "mappingIdField": "FID",
              "field": "Address1"
            }
          ],
          "updateRecordOwnerFromRef": "Y",
          "updateReferenceOwnerFromRec": "N",
          "retainHistory": "N",
          "copyConditions": "Y",
          
        },
        "postScript": ""
      }
    ]
  }
}

- deleted GISLayer as it's now part of the newly added JSON property (check below 'copyGISData')
- added copyGISData property, it's a mapping between Owner object and GIS attributes
- added mappingIdField property, values can be FID or OBJECTID
	- copyGISData entries GIS_INFO:ATTRIBUTE TO UPDATE, 
	- GIS_INFO is bar separated SERVICE|LAYER|GIS-ATTRIBUTE
	- ATTRIBUTE TO UPDATE: a field in owner object, available fields are listed below:
- copyGISData/ATTRIBUTE TO UPDATE: (State, City, Address1, Address2, Address3, Zip, Email, Fax, Country, Phone, OwnerFullName, OwnerFirstName, OwnerMiddleName, OwnerLastName)
 * 
 */

var scriptSuffix = "RECORD_OWNER_AUTOMATION";

try {
	// This should be included in all Configurable Scripts
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));

	var settingsArray = [];

	if (isConfigurableScript(settingsArray, scriptSuffix)) {

		for (s in settingsArray) {
			var rules = settingsArray[s];

			//Execute PreScript
			var preScript = handleUndefined(rules.preScript);
			if (!matches(preScript, null, "")) {
				eval(getScriptText(preScript));
			}
			if (cancelCfgExecution) {
				logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
				cancelCfgExecution = false;
				continue;
			}

			updateOwnerAndConditions(rules, capId);

			var postScript = handleUndefined(rules.postScript);
			if (!matches(postScript, null, "")) {
				eval(getScriptText(postScript));
			}
		}//for all settings
	}//isConf()
} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * find owner on Cap that have same RefId as ownerRefId
 * @param capId record capIdModel
 * @param ownerRefId owner refId to find on Cap owners
 * @returns OwnerScriptModel if found, null otherwise
 */
function getCapOwnerByRefId(capId, ownerRefId) {
	var owners = aa.owner.getOwnerByCapId(capId);
	if (!owners.getSuccess()) {
		logDebug("WARN getOwnerByCapId, " + owners.getErrorMessage());
		return null;
	}
	owners = owners.getOutput();
	if (owners == null || owners.length == 0) {
		logDebug("WARN No owners found for capId " + recordCapId);
		return null;
	}

	for (a in owners) {

		if (owners[a].getCapOwnerModel().toOwnerModel().getOwnerNumber() == ownerRefId) {
			return owners[a];
		}
	}
	return null;
}

/**
 * updates (based on JSON rules):<br/>record owner from ref owner or vice versa.<br/>record owner from GIS<br/>copy refOwner conditions to record
 * @param rules
 * @param recordCapId
 * @returns {Boolean}
 */
function updateOwnerAndConditions(rules, recordCapId) {
	var result = getRefOwnerAndParcelNumberByAddress(recordCapId);
	if (result == null || result[0] == null) {
		logDebug("WARN getRefOwnerAndParcelNumberByAddress() return null for capId " + recordCapId);
		return false;
	}

	var tmpRefOwner = result[0];
	var parcelNumber = result[1];

	var refOwnerFullName = null, owner = null;
	var ownerScriptModel = getCapOwnerByRefId(capId, tmpRefOwner.getOwnerNumber());
	if (ownerScriptModel != null) {
		refOwnerFullName = ownerScriptModel.getCapOwnerModel().getOwnerFullName();
		owner = ownerScriptModel.getCapOwnerModel().toOwnerModel();
	}

	if (parcelNumber != null) {
		updateOwnerFromGIS(ownerScriptModel, rules.action.copyGISData, parcelNumber);
	}

	if (!isEmptyOrNull(rules.action.updateRecordOwnerFromRef) && rules.action.updateRecordOwnerFromRef.equalsIgnoreCase("Y")) {
		if (ownerScriptModel == null) {
			//no owner with same refIdon cap, no need to check retainHistory
			createCapOwnerFromRefOwner(recordCapId, tmpRefOwner);
		} else {
			if (!isEmptyOrNull(rules.action.retainHistory) && rules.action.retainHistory.equalsIgnoreCase("Y")) {
				if (tmpRefOwner.getOwnerFullName() == refOwnerFullName) {
					aa.owner.removeCapOwnerModel(ownerScriptModel);
					createCapOwnerFromRefOwner(recordCapId, tmpRefOwner);
				} else {
					//Create trx cap owner (a copy but without ref owner ID) 
					createCapTrxOwnerFromRefOwner(recordCapId, ownerScriptModel);

					//delete current capOwner that is connected to refOwenr
					aa.owner.removeCapOwnerModel(ownerScriptModel);

					//create (add) refOwner to cap
					createCapOwnerFromRefOwner(recordCapId, tmpRefOwner);
				}
			} else {
				aa.owner.removeCapOwnerModel(ownerScriptModel);
				createCapOwnerFromRefOwner(recordCapId, tmpRefOwner);
			}
		}//ownerScriptModel !null
	} else {
		if (!isEmptyOrNull(rules.action.updateReferenceOwnerFromRec) && rules.action.updateReferenceOwnerFromRec.equalsIgnoreCase("Y")) {
			updateRefOwnerFromOwner(owner, ownerScriptModel);
		}//updateReferenceOwnerFromRec
	}

	if (!isEmptyOrNull(rules.action.copyConditions) && rules.action.copyConditions.equalsIgnoreCase("Y")) {
		copyOwnerConditions(refOwnerId, capId);
	}//copyConditions
}

function copyOwnerConditions(refOwnerId, recordCapId) {
	var conds = aa.ownerCondition.getOwnerConditions(refOwnerId);
	conds = conds.getOutput();

	var sysDate = aa.date.getCurrentDate();
	for (c in conds) {
		var cond = conds[c];
		if (!appHasCondition(cond.getConditionType(), cond.getConditionStatus(), cond.getConditionDescription(), cond.getImpactCode())) {
			var s = aa.capCondition.addCapCondition(recordCapId, cond.getConditionType(), cond.getConditionDescription(), cond.getConditionComment(), cond.getEffectDate(), cond
					.getExpireDate(), sysDate, cond.getRefNumber1(), cond.getRefNumber2(), cond.getImpactCode(), cond.getIssuedByUser(), cond.getStatusByUser(), cond
					.getConditionStatus(), aa.getAuditID(), String("A"), null, cond.getDisplayConditionNotice(), cond.getIncludeInConditionName(), cond
					.getIncludeInShortDescription(), cond.getInheritable(), cond.getLongDescripton(), cond.getPublicDisplayMessage(), cond.getResolutionAction(), null, null, cond
					.getConditionNumber(), cond.getConditionGroup(), cond.getDisplayNoticeOnACA(), cond.getDisplayNoticeOnACAFee(), null, "N");
		}//!appHasCond()
	}//for all owner conds
}

function createCapOwnerFromRefOwner(recordCapId, refOwner) {
	var newCapOwnerScriptModel = aa.owner.getCapOwnerScriptModel().getOutput();

	newCapOwnerScriptModel.setCapID(recordCapId);
	newCapOwnerScriptModel.setL1OwnerNumber(refOwner.getOwnerNumber());

	newCapOwnerScriptModel.setOwnerFullName(refOwner.getOwnerFullName());
	newCapOwnerScriptModel.setOwnerFirstName(refOwner.getOwnerFirstName());
	newCapOwnerScriptModel.setOwnerLastName(refOwner.getOwnerLastName());
	newCapOwnerScriptModel.setOwnerMiddleName(refOwner.getOwnerMiddleName());
	newCapOwnerScriptModel.setPhone(refOwner.getPhone());
	newCapOwnerScriptModel.setEmail(refOwner.getEmail());
	newCapOwnerScriptModel.setAddress1(refOwner.getAddress1());
	newCapOwnerScriptModel.setAddress2(refOwner.getAddress2());
	newCapOwnerScriptModel.setAddress3(refOwner.getAddress3());
	newCapOwnerScriptModel.setCity(refOwner.getCity());
	newCapOwnerScriptModel.setCountry(refOwner.getCountry());
	newCapOwnerScriptModel.setZip(refOwner.getZip());
	newCapOwnerScriptModel.setFax(refOwner.getFax());
	newCapOwnerScriptModel.setState(refOwner.getState());

	aa.owner.createCapOwnerWithAPOAttribute(newCapOwnerScriptModel);
}
function createCapTrxOwnerFromRefOwner(recordCapId, capOwnerScriptModel) {
	var newCapOwnerScriptModel = aa.owner.getCapOwnerScriptModel().getOutput();

	newCapOwnerScriptModel.setCapID(recordCapId);

	newCapOwnerScriptModel.setOwnerFullName(capOwnerScriptModel.getOwnerFullName());
	newCapOwnerScriptModel.setOwnerFirstName(capOwnerScriptModel.getOwnerFirstName());
	newCapOwnerScriptModel.setOwnerLastName(capOwnerScriptModel.getOwnerLastName());
	newCapOwnerScriptModel.setOwnerMiddleName(capOwnerScriptModel.getOwnerMiddleName());
	newCapOwnerScriptModel.setPhone(capOwnerScriptModel.getPhone());
	newCapOwnerScriptModel.setEmail(capOwnerScriptModel.getEmail());
	newCapOwnerScriptModel.setAddress1(capOwnerScriptModel.getAddress1());
	newCapOwnerScriptModel.setAddress2(capOwnerScriptModel.getAddress2());
	newCapOwnerScriptModel.setAddress3(capOwnerScriptModel.getAddress3());
	newCapOwnerScriptModel.setCity(capOwnerScriptModel.getCity());
	newCapOwnerScriptModel.setCountry(capOwnerScriptModel.getCountry());
	newCapOwnerScriptModel.setZip(capOwnerScriptModel.getZip());
	newCapOwnerScriptModel.setFax(capOwnerScriptModel.getFax());
	newCapOwnerScriptModel.setState(capOwnerScriptModel.getState());

	aa.owner.createCapOwnerWithAPOAttribute(newCapOwnerScriptModel);
}

function updateRefOwnerFromOwner(owner, capOwner) {

	owner.setOwnerFullName(capOwner.getOwnerFullName());
	owner.setOwnerFirstName(capOwner.getOwnerFirstName());
	owner.setOwnerLastName(capOwner.getOwnerLastName());
	owner.setOwnerMiddleName(capOwner.getOwnerMiddleName());
	owner.setPhone(capOwner.getPhone());
	owner.setEmail(capOwner.getEmail());
	owner.setAddress1(capOwner.getAddress1());
	owner.setAddress2(capOwner.getAddress2());
	owner.setAddress3(capOwner.getAddress3());
	owner.setCity(capOwner.getCity());
	owner.setCountry(capOwner.getCountry());
	owner.setZip(capOwner.getZip());
	owner.setFax(capOwner.getFax());
	owner.setState(capOwner.getState());

	owner.setAuditID(aa.getAuditID());
	owner.setAuditDate(new Date());

	var ob = aa.proxyInvoker.newInstance("com.accela.aa.aamain.owner.OwnerBusiness").getOutput();
	ob.editOwnerByPK(owner);
}

function getRefOwnerAndParcelNumberByAddress(recordCapId) {
	var addresses = aa.address.getAddressByCapId(recordCapId, null);
	if (addresses.getSuccess()) {
		addresses = addresses.getOutput();

		if (addresses == null || addresses.length == 0) {
			return null;
		}
	} else {
		logDebug("WARN getAddressByCapId failed, error " + addresses.getErrorMessage());
		return null;
	}

	var addressScriptModel = addresses[0];
	var address = addressScriptModel.getAddressModel();
	var refAddressId = address.getRefAddressId();

	var primaryParcel = aa.parcel.getPrimaryParcelByRefAddressID(refAddressId, "Y");
	if (!primaryParcel.getSuccess()) {
		logDebug("WARN getPrimaryParcelByRefAddressID failed, " + primaryParcel.getErrorMessage());
		return [ null, null ];
	}

	primaryParcel = primaryParcel.getOutput();
	var parcels = aa.parcel.getParceListForAdmin(primaryParcel.getParcelNumber(), null, null, null, null, null, null, null, null, null);
	if (parcels.getSuccess()) {
		parcels = parcels.getOutput();
		if (parcels.length == 0) {
			return null;
		}
	} else {
		logDebug("WARN getParceListForAdmin failed, error " + parcels.getErrorMessage());
		return null;
	}

	return [ parcels[0].getOwnerModel(), parcels[0].getParcelModel().getParcelNumber() ];
}

function updateOwnerFromGIS(ownerScriptModel, copyGISData, parcelNumber) {

	if (copyGISData == null || copyGISData == "") {
		return;
	}

	var newValuesMap = getGisAttributesMap(copyGISData, parcelNumber);
	if (newValuesMap['State'] != null && newValuesMap['State'] != '') {
		ownerScriptModel.setState(newValuesMap['State']);
	}
	if (newValuesMap['City'] != null && newValuesMap['City'] != '') {
		ownerScriptModel.setCity(newValuesMap['City']);
	}
	if (newValuesMap['Address1'] != null && newValuesMap['Address1'] != '') {
		ownerScriptModel.setAddress1(newValuesMap['Address1']);
	}
	if (newValuesMap['Address2'] != null && newValuesMap['Address2'] != '') {
		ownerScriptModel.setAddress2(newValuesMap['Address2']);
	}
	if (newValuesMap['Address3'] != null && newValuesMap['Address3'] != '') {
		ownerScriptModel.setAddress3(newValuesMap['Address3']);
	}
	if (newValuesMap['Zip'] != null && newValuesMap['Zip'] != '') {
		ownerScriptModel.setZip(newValuesMap['Zip']);
	}
	if (newValuesMap['Email'] != null && newValuesMap['Email'] != '') {
		ownerScriptModel.setEmail(newValuesMap['Email']);
	}
	if (newValuesMap['Fax'] != null && newValuesMap['Fax'] != '') {
		ownerScriptModel.setFax(newValuesMap['Fax']);
	}
	if (newValuesMap['Country'] != null && newValuesMap['Country'] != '') {
		ownerScriptModel.setCountry(newValuesMap['Country']);
	}
	if (newValuesMap['Phone'] != null && newValuesMap['Phone'] != '') {
		ownerScriptModel.setPhone(newValuesMap['Phone']);
	}
	if (newValuesMap['OwnerFullName'] != null && newValuesMap['OwnerFullName'] != '') {
		ownerScriptModel.setOwnerFullName(newValuesMap['OwnerFullName']);
	}
	if (newValuesMap['OwnerFirstName'] != null && newValuesMap['OwnerFirstName'] != '') {
		ownerScriptModel.setOwnerFirstName(newValuesMap['OwnerFirstName']);
	}
	if (newValuesMap['OwnerMiddleName'] != null && newValuesMap['OwnerMiddleName'] != '') {
		ownerScriptModel.setOwnerMiddleName(newValuesMap['OwnerMiddleName']);
	}
	if (newValuesMap['OwnerLastName'] != null && newValuesMap['OwnerLastName'] != '') {
		ownerScriptModel.setOwnerLastName(newValuesMap['OwnerLastName']);
	}

	aa.owner.updateDailyOwnerWithAPOAttribute(ownerScriptModel);

	return true;
}

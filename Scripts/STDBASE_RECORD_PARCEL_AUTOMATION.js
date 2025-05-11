/*

Title : Record Parcel Automation (After all events) 
Purpose : Perform a set of actions on Record Parcel, Record ASI and Ref-Parcel
		Only custom fields will be changed.
Author: Yazan Barghouth 
 
 Functional Area : All
 
 JSON Example : 
{
  "Marijuana/Retail/Retail Store/Renewal": {
    "ApplicationSpecificInfoUpdateAfter": [
      {
        "metadata": {
          "description": "test records",
          "operators": {
            
          }
        },
        "preScript": "",
        "criteria": {
          
        },
        "action": {
          "copyTo": "Record",
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
          "updateReferenceParcel": true,
          "copyConditions": false,
          "updateOwnerData": true,
		  "contactType": "Applicant",
		  "getInspectionDistricts": [
    â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚{
    â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚"service": "LJCMG",
    â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚"layer": "PM Inspection Areas",
    â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚"idField": "AREA_ID",
    â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚"bufferDistance": -1
    â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚}
    â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚â€‚]
          
        },
        "postScript": ""
      }
    ]
  }
}

Note: 
	- mappingIdField values can be FID or OBJECTID
	- copyTo values can be Parcel or Record
	- copyGISData format: "SERVICE|LAYER|ATTRIBUTE": "ASI FIELD NAME or Parcel Attribute name"
 * 
 */

// This should be included in all Configurable Scripts
try {
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var scriptSuffix = "RECORD_PARCEL_AUTOMATION";
	var settingsArray = [];
	if (isConfigurableScript(settingsArray, scriptSuffix)) {
		for (s in settingsArray) {
			var rules = settingsArray[s];
			var operators = rules.metadata.operators;
			//Execute PreScript
			var preScript = rules.preScript;
			if (!isEmptyOrNull(preScript)) {
				eval(getScriptText(preScript));
			}

			if (cancelCfgExecution) {
				logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
				cancelCfgExecution = false;
				continue;
			}

			RecordParcelAutomation(rules.action);

			var postScript = rules.postScript;
			if (!isEmptyOrNull(postScript)) {
				eval(getScriptText(postScript));
			}
		}//for all settings array
	}//isConfigurable()
} catch (ex) {
	logDebug("**ERROR: Exception while verifying the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 * this function will do the needed logic based on the provided rules from JSON
 * @param rules json rules.
 */
function RecordParcelAutomation(rules) {
	var recordParcelAttributes = new Array();
	getParcel(recordParcelAttributes);

	if (recordParcelAttributes.length < 1) {
		logDebug("**INFO failed to load Parcels from record");
		return false;
	} else {
		if (rules.copyTo.equalsIgnoreCase("Parcel")) {
			//Copy from GIS to Parcel

			for (p in recordParcelAttributes) {
				var parcelNumber = recordParcelAttributes[p]["ParcelNumber"];
				var newValuesMap = getGisAttributesMap(rules.copyGISData, parcelNumber);
				updateParcelAttributes(newValuesMap, parcelNumber);
			}//for all parcels in record

		} else if (rules.copyTo.equalsIgnoreCase("Record")) {
			//Copy from GIS to record ASI
			var parcelNumber = recordParcelAttributes[0]["ParcelNumber"];
			var newValuesMap = getGisAttributesMap(rules.copyGISData, rules.mappingIdField, parcelNumber);

			for (n in newValuesMap) {
				editAppSpecific(n, newValuesMap[n]);
			}//for all values in neMap
		}//copy to Record
	}//parcels array not empty

	if (!isEmptyOrNull(rules.getInspectionDistricts)) {
		var inspectionDistrictsArray = rules.getInspectionDistricts;

		for (iD in inspectionDistrictsArray) {
			var gisInspectionDistrictRule = inspectionDistrictsArray[iD];
			var gisService = gisInspectionDistrictRule.service;
			var gisLayer = gisInspectionDistrictRule.layer;
			var gisIdField = gisInspectionDistrictRule.idField;
			var gisBufferDistance = gisInspectionDistrictRule.bufferDistance;

			var gisDistrict = getGISInfo(gisService, gisLayer, gisIdField);
			var gisDistrictFormatted = gisLayer + "-" + gisDistrict;

			addParcelDistrictLocal(null, null, gisDistrictFormatted);
		}

	}

	if (!isEmptyOrNull(rules.updateReferenceParcel) && rules.updateReferenceParcel) {
		var dailyParcels = aa.parcel.getParcelandAttribute(capId, null);
		dailyParcels = dailyParcels.getOutput().toArray();
		for (d in dailyParcels) {
			var parcelAttr = dailyParcels[d].getParcelAttribute().toArray();

			var parcelsForAdmin = aa.parcel.getParceListForAdmin(dailyParcels[d].getParcelNumber(), null, null, null, null, null, null, null, null, null);
			parcelsForAdmin = parcelsForAdmin.getOutput();

			if (parcelsForAdmin == null || parcelsForAdmin.length == 0) {
				logDebug("**INFO No RefParcel for dailyParcel " + dailyParcels[d].getParcelNumber());
				continue;
			}

			refParcelModel = parcelsForAdmin[0].getParcelModel();
			var refParcelAttrs = refParcelModel.getParcelAttribute().toArray();

			var newParcelAttributeList = aa.util.newArrayList();

			for (a in parcelAttr) {
				for (r in refParcelAttrs) {
					if (parcelAttr[a].getB1AttributeName() == refParcelAttrs[a].getAttributeName()) {
						refParcelAttrs[a].setAttributeValue(parcelAttr[a].getB1AttributeValue());
						newParcelAttributeList.add(refParcelAttrs[a]);
						break;
					}//attribute matched
				}//for all ref attr
			}//for all attr

			try {
				if (newParcelAttributeList != null && newParcelAttributeList.size() > 0) {
					var pb = aa.proxyInvoker.newInstance("com.accela.aa.aamain.parcel.ParcelBusiness").getOutput();
					pb.editParcelWithAttributes(aa.getServiceProviderCode(), refParcelModel, newParcelAttributeList, "ADMIN");
				}//new array is not empty
			} catch (err) {
				logDebug("**INFO Updating Reference Parcel: " + err.message);
			}
		}//for all dailyParcels
	}//updateReferenceParcel

	if (!isEmptyOrNull(rules.copyConditions) && rules.copyConditions) {
		//Copy conditions from Parcel to ??

		var r = aa.parcel.getParcelandAttribute(capId, null);
		if (r.getSuccess()) {
			var n = r.getOutput().toArray();
			for (i in n) {
				copyConditionsFromParcel(n[i].getParcelNumber());
			}//for all parcels
		}//getParcelandAttribute success

	}//copyConditions

	if (!isEmptyOrNull(rules.updateOwnerData) && rules.updateOwnerData) {
		var recordContacts = getContacts();
		for (rc in recordContacts) {
			if (recordContacts[rc]["contactType"].equalsIgnoreCase(rules.contactType)) {
				var contact = recordContacts[rc];

				//get parcels
				var parcelsArray = aa.parcel.getParcelDailyByCapID(capId, null);
				parcelsArray = parcelsArray.getOutput();
				for (p in parcelsArray) {
					//get owners of Parcel P
					var ownersArray = aa.owner.getOwnersByParcel(parcelsArray[p]).getOutput();
					for (o in ownersArray) {
						var owner = ownersArray[o];

						var refOwner = owner.getCapOwnerModel();
						owner = refOwner.toOwnerModel();

						owner.setOwnerFullName(contact["fullName"]);
						owner.setOwnerFirstName(contact["firstName"]);
						owner.setOwnerLastName(contact["lastName"]);
						owner.setOwnerMiddleName(contact["middleName"]);
						owner.setPhone(contact["phone1"]);
						owner.setEmail(contact["email"]);
						owner.setAddress1(contact["addressLine1"]);
						owner.setAddress2(contact["addressLine2"]);
						owner.setAddress3(contact["addressLine2"]);
						owner.setCity(contact["city"]);
						owner.setCountry(contact["country"]);
						owner.setZip(contact["zip"]);
						owner.setFax(contact["fax"]);
						owner.setState(contact["state"]);

						//Prevent a Null error
						owner.setAuditID(aa.getAuditID());
						owner.setAuditDate(new Date());

						try {
							var ob = aa.proxyInvoker.newInstance("com.accela.aa.aamain.owner.OwnerBusiness").getOutput();
							ob.editOwnerByPK(owner);
						} catch (err) {
							logDebug("**INFO Update owner failed, " + err);
						}

					}//for all owners
				}//for all parcels

				//requested contact type was found no need to continue
				break;
			}//contactType exist in record
		}//for all contacts in record
	}//updateOwnerData

}

/**
 * 
 * @param attributesMap Associative array KEY:attributeName, VALUE:newValue) 
 * @param parcelNumber to update
 * @returns true if update succeeded , false if failed
 */
function updateParcelAttributes(attributesMap, parcelNumber) {

	//Prevent loading array for every GIS request (on same event)
	if (recordParcelsArray == null) {
		recordParcelsArray = aa.parcel.getParcelandAttribute(capId, null);
		if (recordParcelsArray.getSuccess()) {
			recordParcelsArray = recordParcelsArray.getOutput().toArray();
		}
	}//not loaded

	if (recordParcelsArray != null) {
		for (p in recordParcelsArray) {

			var parcelScriptModel = recordParcelsArray[p];
			var parcelNo = parcelScriptModel.getParcelNumber();

			//find parcel to update
			if (!parcelNo.equals(parcelNumber)) {
				continue;
			}

			var attributes = parcelScriptModel.getParcelAttribute();

			if (attributes == null) {
				continue;
			}

			var changed = false;

			//Update Attributes:
			for (var k = 0; k < attributes.size(); k++) {
				var attributeModel = attributes.get(k);
				var attrName = attributeModel.getB1AttributeName();
				for (atr in attributesMap) {
					if (attrName.equalsIgnoreCase(atr)) {
						attributeModel.setB1AttributeValue(attributesMap[atr]);
						changed = true;
						break;
					}//if match
				}//for all in ValuesMap
			}//for all attributes in scriptParcelModel

			if (changed) {
				//Update Parcel:
				var capParcelModel = aa.parcel.getCapParcelModel().getOutput();
				capParcelModel.setCapIDModel(capId);
				capParcelModel.setParcelNo(parcelNo);
				capParcelModel.setParcelModel(parcelScriptModel);
				var updateResult = aa.parcel.updateDailyParcelWithAPOAttribute(capParcelModel);
			}//changed
		}//for all parcels attached to record

		return true;
	} else {
		logDebug("**INFO No parcels found for cap " + capId);
		return false;
	}
	return false;
}

function addParcelDistrictLocal(vCapId, parcelNum, districtValue)
//if parcelNum is null, district is is added to all parcels on CAP
{
	var itemCap = capId;

	if (vCapId) {
		itemCap = vCapId; // use cap ID specified in args
	}

	if (!parcelNum) {
		var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
		if (capParcelResult.getSuccess()) {
			var Parcels = capParcelResult.getOutput().toArray();
			for (zz in Parcels) {
				apdResult = aa.parcel.addParceDistrictForDaily(itemCap.getID1(), itemCap.getID2(), itemCap.getID3(), Parcels[zz].getParcelNumber(), districtValue);

				if (!apdResult.getSuccess()) {
					logDebug("**ERROR Adding District " + districtValue + " to parcel #" + Parcels[zz].getParcelNumber() + " : " + apdResult.getErrorMessage());
					return false;
				} else
					logDebug("Successfully added district " + districtValue + " to parcel #" + Parcels[zz].getParcelNumber());

			}
		}
	} else {
		apdResult = aa.parcel.addParceDistrictForDaily(itemCap.getID1(), itemCap.getID2(), itemCap.getID3(), parcelNum, districtValue);

		if (!apdResult.getSuccess()) {
			logDebug("**ERROR Adding District " + districtValue + " to parcel #" + parcelNum + " : " + apdResult.getErrorMessage());
			return false;
		} else
			logDebug("Successfully added district " + districtValue + " to parcel #" + parcelNum);
	}
}

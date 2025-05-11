/*Title : Condition Management Automation
Purpose : to copy related cap conditions and add child records based on the JSON.
Author: Haetham Eleisah
Functional Area : ACA,AV after events
Description : JSON Example :{
"Planning/Subdivision/ConstructionPlan/NA": {
"ApplicationSpecificInfoUpdateAfter":[{
"preScript":" ",
"identifyType": "GIS",
"processingType":"Case",
"caseStatus":"Started|Open",
"identifyStatus": "Started|Open",
"gisLayer": "ZoinigCases",
"gisField": "CaseNum",
"mappingIdField": "FID",
"conditionRecordTypes": "Planning/Subdivision/ConstructionPlan/NA",
"copyGroups": "WATERQ",
"copyTypes": "CP32",
"copyConditionsFrom": false,
"copyConditionsTo": true,
"ignoreStatus": "",
"postScript": ""
}

]
}
}
we update the JSON as below :
adding processingType in order to check if Permit or Case.
adding caseStatus in order to check the statuses for the cases.
adding mappingIdField in order to get the GIS attribute will be FID or OBJECTID.

Available Types:parcelFields, addressFields, GIS fields
Available Attributes for each type:

- Address: All Custom Attributes, (primaryFlag,houseNumberStart,streetDirection,streetName,streetSuffix,city,state,zip,addressStatus,county,country,addressDescription,xCoordinate,yCoordinate)
- Parcel: All Custom Attributes, (ParcelNumber,Section,Block,LegalDesc,GisSeqNo,SourceSeqNumber,Page,I18NSubdivision,CouncilDistrict,RefAddressTypes,ParcelStatus,ExemptValue,PublicSourceSeqNBR,CensusTract,InspectionDistrict,NoticeConditions,ImprovedValue,PlanArea,Lot,ParcelArea,Township,LandValue)
- Additional Note : Regarding the Condition template it should be named as RECORD TYPES and the columns should be Group ,Type ,Subtype and Category to work check on the record types  .

 */

try {
	// This should be included in all Configurable Scripts
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	
	var settingsArray = [];
	var scriptSuffix = "CONDITION_MANAGMENT_AUTOMATION";
	isConfigurableScript(settingsArray, scriptSuffix);

	//not supported in ASA (ACA)
	if (controlString == "ApplicationSubmitAfter" && isPublicUser) {
		//reset settingsArray, this will make script do nothing.
		settingsArray = new Array();
	}

	for (s in settingsArray) {
		var rules = settingsArray[s];

		// run preScript
		if (!matches(rules.preScript, null, " ")) {
			eval(getScriptText(rules.preScript, null, false));
		}

		// this to get related cap that needs to be copied based on the identifyType and identifyStatus from JSON.
		var RelatedCapsArray = [];
		if (rules.identifyType != null && rules.identifyType != "") {
			RelatedCapsArray = getRelatedCapsByIdentifyTypeAndStatus(rules.identifyType, rules.identifyStatus, rules.conditionRecordTypes);
		}
		// this function will add condition based on the Condition group and Condition type from JSON.
		addChildRecordsAndCopyConditions(rules.copyGroups, rules.copyTypes, rules.copyConditionsFrom, rules.copyConditionsTo, rules.conditionRecordTypes, rules.ignoreStatus);
		/// run post script
		if (!matches(rules.postScript, null, "")) {
			eval(getScriptText(rules.postScript, null, false));
		}
	}
} catch (ex) {
	logDebug("**ERROR: Exception while verification the rules for " + scriptSuffix + ". Error: " + ex);
}

/**
 *  this function will check if there are other records linked to the same parcel ,address or both and filter
 *  them based on the provided statuses and app types.
 * @param identifyType the type that we need to check on (parcel ,address or both) from JSON
 * @param identifyStatus child record status that we need to match from JSON
 * @param conditionRecordTypes the 4 levels for the child record status from JSON
 * @returns relatedCaps array which has the related caps that has the same address or parcel and matched the status and the app type.
 */
function getRelatedCapsByIdentifyTypeAndStatus(identifyType, identifyStatus, conditionRecordTypes) {
	var relatedCaps = [];
	var addrArray = [];
	var parcelArray = [];

	var identitfiedStatuesArray = [];
	if (identifyStatus != null && identifyStatus != "")
		identitfiedStatuesArray = identifyStatus.split("|");

	if (identifyType == "Both") {
		getParcel(parcelArray);
		getAddress(addrArray);
		for (pa in parcelArray) {
			var capIdsArray = capIdsGetByParcel(parcelArray[pa]["ParcelNumber"]);
			for ( var ci in capIdsArray) {
				hasRecord = false;
				for (rc in relatedCaps) {
					if (relatedCaps[rc].equals(capIdsArray[ci]))
						hasRecord = true;
				}
				var CurrentCap = aa.cap.getCap(capIdsArray[ci]).getOutput();
				var CurrentCapStatus = CurrentCap.getCapStatus();
				var CurrentCapType = CurrentCap.getCapType().toString();
				if (identitfiedStatuesArray.length > 0) {
					for ( var st in identitfiedStatuesArray) {
						if (CurrentCapStatus == identitfiedStatuesArray[st] && checkRecordAppType(conditionRecordTypes, CurrentCapType) && !capIdsArray[ci].equals(capId)) {
							if (!hasRecord) {
								relatedCaps.push(capIdsArray[ci]);
								break;
							}
						}
					}
				} else {
					if (!hasRecord)
						relatedCaps.push(capIdsArray[ci]);
				}
			}
		}

		for (pa in addrArray) {

			var capIdsArray = getRelatedCapsByAddressAttributes(addrArray[pa]["streetName"], addrArray[pa]["houseNumberStart"], addrArray[pa]["streetSuffix"],
					addrArray[pa]["streetDirection"]);

			for ( var ci in capIdsArray) {
				hasRecord = false;
				for (rc in relatedCaps) {
					if (relatedCaps[rc].equals(capIdsArray[ci].getCapID()))
						hasRecord = true;
				}
				var CurrentCap = aa.cap.getCap(capIdsArray[ci].getCapID()).getOutput();
				var CurrentCapStatus = CurrentCap.getCapStatus();
				var CurrentCapType = CurrentCap.getCapType().toString();
				if (identitfiedStatuesArray.length > 0) {
					for ( var st in identitfiedStatuesArray) {
						if (CurrentCapStatus == identitfiedStatuesArray[st] && checkRecordAppType(conditionRecordTypes, CurrentCapType)
								&& !capIdsArray[ci].getCapID().equals(capId)) {
							if (!hasRecord) {
								relatedCaps.push(capIdsArray[ci].getCapID());
								break;
							}
						}
					}
				} else {
					if (!hasRecord)
						relatedCaps.push(capIdsArray[ci].getCapID());
				}
			}
		}

	} else if (identifyType == "Address") {
		getAddress(addrArray);
		for (pa in addrArray) {
			var capIdsArray = getRelatedCapsByAddressAttributes(addrArray[pa]["streetName"], addrArray[pa]["houseNumberStart"], addrArray[pa]["streetSuffix"],
					addrArray[pa]["streetDirection"]);
			for ( var ci in capIdsArray) {
				hasRecord = false;
				for (rc in relatedCaps) {
					if (relatedCaps[rc].equals(capIdsArray[ci].getCapID()))
						hasRecord = true;
				}
				var CurrentCap = aa.cap.getCap(capIdsArray[ci].getCapID()).getOutput();
				var CurrentCapStatus = CurrentCap.getCapStatus();
				var CurrentCapType = CurrentCap.getCapType().toString();
				if (identitfiedStatuesArray.length > 0) {
					for ( var st in identitfiedStatuesArray) {
						if (CurrentCapStatus == identitfiedStatuesArray[st] && checkRecordAppType(conditionRecordTypes, CurrentCapType)
								&& !capIdsArray[ci].getCapID().equals(capId)) {
							if (!hasRecord) {
								relatedCaps.push(capIdsArray[ci].getCapID());
								break;
							}
						}
					}
				} else {
					if (!hasRecord)
						relatedCaps.push(capIdsArray[ci].getCapID());
				}
			}
		}
	} else if (identifyType == "Parcel") {
		getParcel(parcelArray);
		for (pa in parcelArray) {
			var capIdsArray = capIdsGetByParcel(parcelArray[pa]["ParcelNumber"]);
			for ( var ci in capIdsArray) {
				hasRecord = false;
				for (rc in relatedCaps) {
					if (relatedCaps[rc].equals(capIdsArray[ci]))
						hasRecord = true;
				}
				var CurrentCap = aa.cap.getCap(capIdsArray[ci]).getOutput();
				var CurrentCapStatus = CurrentCap.getCapStatus();
				var CurrentCapType = CurrentCap.getCapType().toString();
				if (identitfiedStatuesArray.length > 0) {
					for ( var st in identitfiedStatuesArray) {

						if (CurrentCapStatus == identitfiedStatuesArray[st] && checkRecordAppType(conditionRecordTypes, CurrentCapType) && !capIdsArray[ci].equals(capId)) {
							if (!hasRecord) {
								relatedCaps.push(capIdsArray[ci]);
								break;
							}
						}
					}
				} else {
					if (!hasRecord)
						relatedCaps.push(capIdsArray[ci]);
				}
			}
		}
	} else if (identifyType == "GIS") {

		var gisBusiness = aa.proxyInvoker.newInstance("com.accela.aa.gis.gis.GISBusiness").getOutput();
		var serviceProviderCode = aa.getServiceProviderCode();
		var svc = gisBusiness.getDefaultGISServiceID(serviceProviderCode, "ADMIN");

		var caseStatusesArray = [];
		if (rules.caseStatus != null && rules.caseStatus != "") {
			caseStatusesArray = rules.caseStatus.split("|");
		}

		if (rules.processingType == "Permit") {
			/// in this case get the GIS field from the GIS objects based on the current parcel/s.
			/// will check the related cases status with the case status from the JSON
			/// and check the related cases 4 levels with the condition record types from the JSON if passed we will pushed to the related cap array.

			// when permit will copy from the case to permit
			rules.copyConditionsFrom = true;
			rules.copyConditionsTo = false;

			var parcelArray = [];
			getParcel(parcelArray);

			for (pa in parcelArray) {
				var relatedGiScasesCaps = [];
				var gisUtil = new GisUtils(null);
				var attibutes = getGISInfoArraybyGIsId(svc, rules.gisLayer, rules.gisField, parcelArray[pa]["ParcelNumber"]);

				for ( var at in attibutes) {
					if (aa.cap.getCapID(attibutes[at]).getOutput() != null) {
						relatedGiScasesCaps.push(aa.cap.getCapID(attibutes[at]).getOutput());
					}
				}

				hasRecord = false;
				for ( var rsg in relatedGiScasesCaps) {
					hasRecord = false;
					for (rc in relatedCaps) {
						if (relatedCaps[rc].equals(relatedGiScasesCaps[rsg]))
							hasRecord = true;
					}
					var CurrentCap = aa.cap.getCap(relatedGiScasesCaps[rsg]).getOutput();
					var CurrentCapStatus = CurrentCap.getCapStatus();
					var CurrentCapType = CurrentCap.getCapType().toString();
					if (caseStatusesArray.length > 0) {
						for ( var st in caseStatusesArray) {
							if (CurrentCapStatus == caseStatusesArray[st] && checkRecordAppType(conditionRecordTypes, CurrentCapType) && !relatedGiScasesCaps[rsg].equals(capId)) {
								if (!hasRecord) {
									relatedCaps.push(relatedGiScasesCaps[rsg]);
									break;
								}
							}
						}
					} else {
						if (!hasRecord)
							relatedCaps.push(relatedGiScasesCaps[rsg]);
					}

				}
			}

		} else if (rules.processingType == "Case") {

			/// in this case we will get the GIS objects that related to the current cap and get the parcels for each one and for each parcel we will get the related caps and do the filter.
			/// in this case we will consider the case status from JSON to check the current case status.
			/// and consider rules.gisLayer from the JSON as the parcel layer in order to check the parcels.
			/// and no need for gisField .

			// will copy from the case to the case related permits.
			rules.copyConditionsFrom = false;
			rules.copyConditionsTo = true;

			var currentCaseStatus = cap.getCapStatus();
			var isCaseStatusMatched = false;
			if (caseStatusesArray.length == 0)
				isCaseStatusMatched = true;
			for ( var st in caseStatusesArray) {
				if (currentCaseStatus == caseStatusesArray[st]) {
					isCaseStatusMatched = true;
					break;
				}
			}
			if (!isCaseStatusMatched)
				return;
			var capRelatedGisObjects = aa.gis.getCapGISObjects(capId);

			var relatedGiScasesCaps = [];
			if (capRelatedGisObjects.getSuccess()) {
				capRelatedGisObjects = capRelatedGisObjects.getOutput();
			
			}

			for ( var cgis in capRelatedGisObjects) {

				var parcels = getParcelsBasedOnGisObject(svc, rules.gisLayer, "0", capRelatedGisObjects[cgis]);
				for ( var p in parcels) {
					var parcelcapIds = capIdsGetByParcel(parcels[p].getGisId());
					for ( var pcId in parcelcapIds) {
						hasRecord = false;
						for (rc in relatedCaps) {
					
							if (relatedCaps[rc].equals(parcelcapIds[pcId]))
								hasRecord = true;

						}
						if (hasRecord)
							continue;

						var CurrentCap = aa.cap.getCap(parcelcapIds[pcId]).getOutput();
						var CurrentCapStatus = CurrentCap.getCapStatus();
						var CurrentCapType = CurrentCap.getCapType().toString();
						if (identitfiedStatuesArray.length > 0) {
							for ( var st in identitfiedStatuesArray) {
								if (CurrentCapStatus == identitfiedStatuesArray[st] && checkRecordAppType(conditionRecordTypes, CurrentCapType)
										&& !parcelcapIds[pcId].equals(capId)) {

									if (!hasRecord) {
										relatedCaps.push(parcelcapIds[pcId]);
										break;
									}
								}
							}
						} else {
							if (!hasRecord && !parcelcapIds[pcId].equals(capId)) {

								relatedCaps.push(parcelcapIds[pcId]);

							}
						}
					}
				}

			}

		}
	}

	return relatedCaps;
}

/**
 * this function will check the record apptype between the related records and the  conditionRecordTypes that provided in JSOn.
 * @param conditionRecordTypes  the 4 levels for the child record status from JSON
 * @param RecordAppType the 4 levels of the related records that need to be matched with the conditionRecordTypes
 * @returns true if its matched else return false
 */
function checkRecordAppType(conditionRecordTypes, RecordAppType) {
	var conditionRecordTypesArray = [];
	if (conditionRecordTypes != "" && conditionRecordTypes != null) {
		conditionRecordTypesArray = conditionRecordTypes.split("|");
		for ( var i in conditionRecordTypesArray) {
			if (conditionRecordTypesArray[i] == RecordAppType)
				return true;
		}

		return false;
	} else {
		return true;
	}
}

/**
 * this function is to add child records and copy the related conditions if matched the JSON.
 * @param copyGroups the condition groups that we need to copy from JSOn.
 * @param copyTypes the condition types that we need to copy from JSOn
 * @param copyConditions true or false if true then we will copy the condition that matched the JSOn.
 */
function addChildRecordsAndCopyConditions(copyGroups, copyTypes, copyConditionsFrom, copyConditionsTo, conditionRecordTypes, ignoreStatus) {
	if (capId != null) {
		var CurrentCapConditions = aa.capCondition.getCapConditions(capId).getOutput();
	}

	for ( var ind in RelatedCapsArray) {
		var CurrentCap = aa.cap.getCap(RelatedCapsArray[ind]).getOutput();
		var CurrentCapStatus = CurrentCap.getCapStatus();
		var childRecordStuctureString = CurrentCap.getCapType().toString();
		var childRecordStucture = childRecordStuctureString.split("/");
		//aa.cap.createAppHierarchy(capId, RelatedCapsArray[ind]);
		var projectBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.ProjectBusiness").getOutput();
		projectBusiness.createAppHierarchy(capId, RelatedCapsArray[ind], null, false, aa.getAuditID());

		var capConditionsList = aa.capCondition.getCapConditions(RelatedCapsArray[ind]).getOutput();
		if (copyConditionsFrom) {

			for ( var i in capConditionsList) {
				// this because of the getTemplateModel() in the CapConditionsList objects is null.
				var cond = aa.capCondition.getCapCondition(RelatedCapsArray[ind], capConditionsList[i].getConditionNumber()).getOutput();
				if (cond.getTemplateModel() == null) {
					copyAndUpdateConditionByTypeAndGroup(RelatedCapsArray[ind], capId, copyTypes, copyGroups, capConditionsList[i]);
					continue;
				}
				var tmpObj = genericTemplateObject(cond.getTemplateModel());

				if (tmpObj.ASIT["RECORD TYPES"].length > 0) {

					for ( var xi in tmpObj.ASIT["RECORD TYPES"]) {

						var conditionRecordTypeDetails = tmpObj.ASIT["RECORD TYPES"][xi]["Group"].trim() + "/" + tmpObj.ASIT["RECORD TYPES"][xi]["Type"].trim() + "/"
								+ tmpObj.ASIT["RECORD TYPES"][xi]["Subtype"].trim() + "/" + tmpObj.ASIT["RECORD TYPES"][xi]["Category"].trim();

						conditionRecordTypeDetails = conditionRecordTypeDetails.replace(new RegExp("ALL", 'g'), "*");
						if (checkConditionTemplateRecordTypes(conditionRecordTypeDetails, appTypeString)) {
							copyAndUpdateConditionByTypeAndGroup(RelatedCapsArray[ind], capId, copyTypes, copyGroups, capConditionsList[i]);
							break;
						}

					}
				} else {
					copyAndUpdateConditionByTypeAndGroup(RelatedCapsArray[ind], capId, copyTypes, copyGroups, capConditionsList[i]);
					break;
				}
			}

		} else if (copyConditionsTo) {
			var isIgnoreStatus = false;
			var ignoreStatusArray = [];
			if (ignoreStatus != null && ignoreStatus != "") {
				ignoreStatusArray = ignoreStatus.split("|");
			}
			for ( var igx in ignoreStatusArray) {
				if (CurrentCapStatus == ignoreStatusArray[igx]) {
					isIgnoreStatus = true;
					break;
				}
			}

			// this to ignore the cap Id as per the ignore status in the JSON.
			if (isIgnoreStatus)
				continue;

			for ( var cix in CurrentCapConditions) {
				// this because of the getTemplateModel() in the CapConditionsList objects is null.
				var cond = aa.capCondition.getCapCondition(capId, CurrentCapConditions[cix].getConditionNumber()).getOutput();
				if (cond.getTemplateModel() == null) {
					copyAndUpdateConditionByTypeAndGroup(capId, RelatedCapsArray[ind], copyTypes, copyGroups, CurrentCapConditions[cix]);
				} else {
					var tmpObj = genericTemplateObject(cond.getTemplateModel());
					if (tmpObj.ASIT["RECORD TYPES"].length > 0) {
						for ( var xi in tmpObj.ASIT["RECORD TYPES"]) {
							var conditionRecordTypeDetails = tmpObj.ASIT["RECORD TYPES"][xi]["Group"].trim() + "/" + tmpObj.ASIT["RECORD TYPES"][xi]["Type"].trim() + "/"
									+ tmpObj.ASIT["RECORD TYPES"][xi]["Subtype"].trim() + "/" + tmpObj.ASIT["RECORD TYPES"][xi]["Category"].trim();

							conditionRecordTypeDetails = conditionRecordTypeDetails.replace(new RegExp("ALL", 'g'), "*");
							if (checkConditionTemplateRecordTypes(conditionRecordTypeDetails, appTypeString)) {
								copyAndUpdateConditionByTypeAndGroup(capId, RelatedCapsArray[ind], copyTypes, copyGroups, CurrentCapConditions[cix]);
							}

						}
					} else {
						copyAndUpdateConditionByTypeAndGroup(capId, RelatedCapsArray[ind], copyTypes, copyGroups, CurrentCapConditions[cix]);

					}
				}
			}
		}
	}

}

/**
 *  this function will copy conditions from source to destination based on the types and groups.
 *  and will update the condition name by the source cap ID.
 * @param capIdFrom source cap Id
 * @param capIdTo destination cap ID
 * @param typesArray the conditions types that we need to copy
 * @param conditionGroupsArray the conditions groups that we need to copy
 * @returns {Boolean}
 */
function copyAndUpdateConditionByTypeAndGroup(capIdFrom, capIdTo, typesArray, conditionGroupsArray, ConditionObject) {
	var isByType = typesArray != null && typesArray != "";
	var isByGroup = conditionGroupsArray != null && conditionGroupsArray != "";

	if (isByType) {
		typesArray = typesArray.split("|");
	}
	if (isByGroup) {
		conditionGroupsArray = conditionGroupsArray.split("|");
	}

	var n = aa.capCondition.getCapConditions(capIdFrom);
	if (n.getSuccess())
		var r = n.getOutput();
	else {
		logDebug("**INFO: failed getting cap conditions: " + n.getErrorMessage());
		return false;
	}

	var i = ConditionObject;

	if (isByType && !arrayContainsValue(typesArray, i.getConditionType())) {
		return false;
	}

	if (isByGroup && !arrayContainsValue(conditionGroupsArray, i.getConditionGroup())) {
		return false;
	}

	// this to update the condition name by the source cap ID as per the requirement
	var newConditionName = capIdFrom.getCustomID() + "-" + i.getConditionDescription();

	//////////
	var s = aa.capCondition.addCapCondition(capIdTo, i.getConditionType(), newConditionName, i.getConditionComment(), i.getEffectDate(), i.getExpireDate(), aa.date
			.getCurrentDate(), i.getRefNumber1(), i.getRefNumber2(), i.getImpactCode(), i.getIssuedByUser(), i.getStatusByUser(), i.getConditionStatus(), currentUserID,
			String("A"), null, i.getDisplayConditionNotice(), i.getIncludeInConditionName(), i.getIncludeInShortDescription(), i.getInheritable(), i.getLongDescripton(), i
					.getPublicDisplayMessage(), i.getResolutionAction(), null, null, i.getReferenceConditionNumber(), i.getConditionGroup(), i.getDisplayNoticeOnACA(), i
					.getDisplayNoticeOnACAFee(), i.getPriority(), i.getConditionOfApproval());

	return true;
}

/**
 * @param conditionRecordTypeDetails  the 4 levels record type from the condition template
 * @param conditionRecordType the app type from JSON
 * @returns true if matches else return false.
 */
function checkConditionTemplateRecordTypes(conditionRecordTypeDetails, conditionRecordType) {
	var ruleSetOptions = [];
	var conditionRecordTypeDetailsArray = conditionRecordType.split("/");

	var isExists = false;
	ruleSetOptions.push("*/*/*/*");
	ruleSetOptions.push(conditionRecordTypeDetailsArray[0] + "/*/*/*");
	ruleSetOptions.push(conditionRecordTypeDetailsArray[0] + "/" + conditionRecordTypeDetailsArray[1] + "/*/*");
	ruleSetOptions.push(conditionRecordTypeDetailsArray[0] + "/" + conditionRecordTypeDetailsArray[1] + "/" + conditionRecordTypeDetailsArray[2] + "/*");
	ruleSetOptions.push(conditionRecordTypeDetailsArray[0] + "/" + conditionRecordTypeDetailsArray[1] + "/" + conditionRecordTypeDetailsArray[2] + "/"
			+ conditionRecordTypeDetailsArray[3]);
	ruleSetOptions.push(conditionRecordTypeDetailsArray[0] + "/*/" + conditionRecordTypeDetailsArray[2] + "/" + conditionRecordTypeDetailsArray[3]);
	ruleSetOptions.push(conditionRecordTypeDetailsArray[0] + "/" + conditionRecordTypeDetailsArray[1] + "/*/" + conditionRecordTypeDetailsArray[3]);
	ruleSetOptions.push(conditionRecordTypeDetailsArray[0] + "/" + conditionRecordTypeDetailsArray[1] + "/" + conditionRecordTypeDetailsArray[2] + "/*");
	ruleSetOptions.push(conditionRecordTypeDetailsArray[0] + "/*/" + conditionRecordTypeDetailsArray[2] + "/*");
	for (ro in ruleSetOptions) {

		if (conditionRecordTypeDetails == ruleSetOptions[ro]) {

			isExists = true;
			break;
		}
	}

	return isExists;
}

/**
 * this function will return the GIS objects based on the buffer check from a GIS object
 * @param svc GIS service
 * @param layer GIS layer
 * @param numDistance the distance that we want to check the GIS objects
 * @param gisObject the GIS object that we need to get the GIS objects around it.
 * @returns GIS objects array if exists else returns false.
 */
function getParcelsBasedOnGisObject(svc, layer, numDistance, gisObject) // optional: distanceType
{
	// returns true if the app has a gis object in proximity
	// use with all events except ApplicationSubmitBefore
	// 6/20/07 JHS - Changed errors to Warnings in case GIS server unavailable.
	var distanceType = "feet"
	if (arguments.length == 4)
		distanceType = arguments[3]; // use distance type in arg list

	var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
	if (bufferTargetResult.getSuccess()) {
		var buf = bufferTargetResult.getOutput();

	} else {
		logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage());
		return false;
	}
	var bufchk = aa.gis.getBufferByRadius(gisObject, numDistance, distanceType, buf);

	if (bufchk.getSuccess())
		var proxArr = bufchk.getOutput();
	else {
		logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage());
		return false;
	}

	for (a2 in proxArr) {
		var proxObjs = proxArr[a2].getGISObjects(); // if there are GIS Objects here, we're done
		if (proxObjs.length > 0) {
			return proxObjs;
		}

	}

	return false;

}

function getGISInfoArraybyGIsId(svc, layer, attributename, GISID) {
	// use buffer info to get info on the current object by using distance 0
	// usage:
	//
	// x = getGISInfo("flagstaff","Parcels","LOT_AREA");
	//

	var distanceType = "feet";
	var retArray = new Array();

	var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
	if (bufferTargetResult.getSuccess()) {
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
	} else {
		logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage());
		return false
	}

	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess())
		var fGisObj = gisObjResult.getOutput();
	else {
		logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage());
		return false
	}

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
	{
		var gisobjects = fGisObj[a1].getGISObjects()
		for ( var g in gisobjects) {
			if (gisobjects[g].getGisId() != GISID)
				continue;
			var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

			if (bufchk.getSuccess())
				var proxArr = bufchk.getOutput();
			else {
				logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage());
				return false
			}

			for (a2 in proxArr) {
				var proxObj = proxArr[a2].getGISObjects(); // if there are GIS Objects here, we're done
				for (z1 in proxObj) {
					var v = proxObj[z1].getAttributeValues();
					retArray.push(v[0]);
				}

			}
		}
	}
	return retArray;
}

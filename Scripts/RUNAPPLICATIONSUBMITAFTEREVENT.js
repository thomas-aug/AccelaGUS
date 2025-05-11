/*------------------------------------------------------------------------------------------------------/
| Program		: RUNAPPLICATIONSUBMITAFTEREVENT.js
| Event			: run application submit after event
|
| Usage			: to run the ASA event for specific cap
| Notes			: 
| Created by	: Haitham Eleisah
| Created at	: 19/10/2017 15:45:48
|
/------------------------------------------------------------------------------------------------------*/

function RunApplicationSubmitAfterEvent(newCapId) {
	//Set Variables
	//Save the existing system variables so that they can be reset after the function
	var pvScriptName = vScriptName;
	var pvEventName = vEventName;
	var pprefix = ((typeof prefix === 'undefined') ? null : prefix);
	var pcapId = capId;
	var pcap = cap;
	var pcapIDString = capIDString;
	var pappTypeResult = appTypeResult;
	var pappTypeString = appTypeString;
	var pappTypeArray = appTypeArray;
	var pcapName = capName;
	var pcapStatus = capStatus;
	var pfileDateObj = fileDateObj;
	var pfileDate = fileDate;
	var pfileDateYYYYMMDD = fileDateYYYYMMDD;
	var pparcelArea = parcelArea;
	var pestValue = estValue;
	var pbalanceDue = balanceDue;
	var phouseCount = houseCount;
	var pfeesInvoicedTotal = feesInvoicedTotal;
	var pcapDetail = capDetail;
	var pAInfo = AInfo;
	var ppartialCap;
	if (typeof (partialCap) !== "undefined") {
		ppartialCap = partialCap;
	} else {
		ppartialCap = null;
	}
	var pparentCapId;
	if (typeof (parentCapId) !== "undefined") {
		pparentCapId = parentCapId;
	} else {
		pparentCapId = null;
	}
	var pCreatedByACA;
	if (typeof (CreatedByACA) !== "undefined") {
		pCreatedByACA = CreatedByACA;
	} else {
		CreatedByACA = 'N';
	}
	//read ASA Specific variables from session.
	var OLDAdditionalInfoBuildingCount = aa.env.getValue("AdditionalInfoBuildingCount");
	var OLDAdditionalInfoConstructionTypeCode = aa.env.getValue("AdditionalInfoConstructionTypeCode");
	var OLDAdditionalInfoHouseCount = aa.env.getValue("AdditionalInfoHouseCount");
	var OLDAdditionalInfoPublicOwnedFlag = aa.env.getValue("AdditionalInfoPublicOwnedFlag");
	var OLDAdditionalInfoValuation = aa.env.getValue("AdditionalInfoValuation");
	var OLDAdditionalInfoWorkDescription = aa.env.getValue("AdditionalInfoWorkDescription");
	var OLDAddressCity = aa.env.getValue("AddressCity");
	var OLDAddressHouseFraction = aa.env.getValue("AddressHouseFraction");
	var OLDAddressHouseNumber = aa.env.getValue("AddressHouseNumber");
	var OLDAddressLine1 = aa.env.getValue("AddressLine1");
	var OLDAddressLine2 = aa.env.getValue("AddressLine2");
	var OLDAddressPrimaryFlag = aa.env.getValue("AddressPrimaryFlag");
	var OLDAddressState = aa.env.getValue("AddressState");
	var OLDAddressStreetDirection = aa.env.getValue("AddressStreetDirection");
	var OLDAddressStreetName = aa.env.getValue("AddressStreetName");
	var OLDAddressStreetSuffix = aa.env.getValue("AddressStreetSuffix");
	var OLDAddressType = aa.env.getValue("AddressType");
	var OLDAddressUnitNumber = aa.env.getValue("AddressUnitNumber");
	var OLDAddressUnitType = aa.env.getValue("AddressUnitType");
	var OLDAddressValidatedNumber = aa.env.getValue("AddressValidatedNumber");
	var OLDAddressZip = aa.env.getValue("AddressZip");
	var OLDAppDetailFirstIssuedDate = aa.env.getValue("AppDetailFirstIssuedDate");
	var OLDAppDetailStatusReason = aa.env.getValue("AppDetailStatusReason");
	var OLDApplicantAddressLine1 = aa.env.getValue("ApplicantAddressLine1");
	var OLDApplicantAddressLine2 = aa.env.getValue("ApplicantAddressLine2");
	var OLDApplicantAddressLine3 = aa.env.getValue("ApplicantAddressLine3");
	var OLDApplicantBirthDate = aa.env.getValue("ApplicantBirthDate");
	var OLDApplicantBusinessName = aa.env.getValue("ApplicantBusinessName");
	var OLDApplicantCity = aa.env.getValue("ApplicantCity");
	var OLDApplicantContactAddressModelList = aa.env.getValue("ApplicantContactAddressModelList");
	var OLDApplicantContactType = aa.env.getValue("ApplicantContactType");
	var OLDApplicantCountry = aa.env.getValue("ApplicantCountry");
	var OLDApplicantEmail = aa.env.getValue("ApplicantEmail");
	var OLDApplicantFaxCountryCode = aa.env.getValue("ApplicantFaxCountryCode");
	var OLDApplicantFirstName = aa.env.getValue("ApplicantFirstName");
	var OLDApplicantGender = aa.env.getValue("ApplicantGender");
	var OLDApplicantId = aa.env.getValue("ApplicantId");
	var OLDApplicantLastName = aa.env.getValue("ApplicantLastName");
	var OLDApplicantMiddleName = aa.env.getValue("ApplicantMiddleName");
	var OLDApplicantNamesuffix = aa.env.getValue("ApplicantNamesuffix");
	var OLDApplicantPhone1 = aa.env.getValue("ApplicantPhone1");
	var OLDApplicantPhone1CountryCode = aa.env.getValue("ApplicantPhone1CountryCode");
	var OLDApplicantPhone2 = aa.env.getValue("ApplicantPhone2");
	var OLDApplicantPhone2CountryCode = aa.env.getValue("ApplicantPhone2CountryCode");
	var OLDApplicantPhone3 = aa.env.getValue("ApplicantPhone3");
	var OLDApplicantPhone3CountryCode = aa.env.getValue("ApplicantPhone3CountryCode");
	var OLDApplicantPostOfficeBox = aa.env.getValue("ApplicantPostOfficeBox");
	var OLDApplicantRelation = aa.env.getValue("ApplicantRelation");
	var OLDApplicantSalutation = aa.env.getValue("ApplicantSalutation");
	var OLDApplicantState = aa.env.getValue("ApplicantState");
	var OLDApplicantZip = aa.env.getValue("ApplicantZip");
	var OLDApplicationStatus = aa.env.getValue("ApplicationStatus");
	var OLDApplicationSubmitMode = aa.env.getValue("ApplicationSubmitMode");
	var OLDApplicationTypeLevel1 = aa.env.getValue("ApplicationTypeLevel1");
	var OLDApplicationTypeLevel2 = aa.env.getValue("ApplicationTypeLevel2");
	var OLDApplicationTypeLevel3 = aa.env.getValue("ApplicationTypeLevel3");
	var OLDApplicationTypeLevel4 = aa.env.getValue("ApplicationTypeLevel4");
	var OLDCAEAddressLine1 = aa.env.getValue("CAEAddressLine1");
	var OLDCAEAddressLine2 = aa.env.getValue("CAEAddressLine2");
	var OLDCAEAddressLine3 = aa.env.getValue("CAEAddressLine3");
	var OLDCAEBirthDate = aa.env.getValue("CAEBirthDate");
	var OLDCAEBusinessName = aa.env.getValue("CAEBusinessName");
	var OLDCAEBusName2 = aa.env.getValue("CAEBusName2");
	var OLDCAECity = aa.env.getValue("CAECity");
	var OLDCAECountry = aa.env.getValue("CAECountry");
	var OLDCAECountryCode = aa.env.getValue("CAECountryCode");
	var OLDCAEEmail = aa.env.getValue("CAEEmail");
	var OLDCAEFirstName = aa.env.getValue("CAEFirstName");
	var OLDCAEGender = aa.env.getValue("CAEGender");
	var OLDCAELastName = aa.env.getValue("CAELastName");
	var OLDCAELienseNumber = aa.env.getValue("CAELienseNumber");
	var OLDCAELienseType = aa.env.getValue("CAELienseType");
	var OLDCAEMiddleName = aa.env.getValue("CAEMiddleName");
	var OLDCAEPhone1 = aa.env.getValue("CAEPhone1");
	var OLDCAEPhone2 = aa.env.getValue("CAEPhone2");
	var OLDCAEPhone2CountryCode = aa.env.getValue("CAEPhone2CountryCode");
	var OLDCAEPhone3 = aa.env.getValue("CAEPhone3");
	var OLDCAEPhone3CountryCode = aa.env.getValue("CAEPhone3CountryCode");
	var OLDCAEPostOfficeBox = aa.env.getValue("CAEPostOfficeBox");
	var OLDCAESalutation = aa.env.getValue("CAESalutation");
	var OLDCAEState = aa.env.getValue("CAEState");
	var OLDCAESuffixName = aa.env.getValue("CAESuffixName");
	var OLDCAETitle = aa.env.getValue("CAETitle");
	var OLDCAEValidatedNumber = aa.env.getValue("CAEValidatedNumber");
	var OLDCAEZip = aa.env.getValue("CAEZip");
	var OLDCapCommentText = aa.env.getValue("CapCommentText");
	var OLDComplainantAddressLine1 = aa.env.getValue("ComplainantAddressLine1");
	var OLDComplainantAddressLine2 = aa.env.getValue("ComplainantAddressLine2");
	var OLDComplainantAddressLine3 = aa.env.getValue("ComplainantAddressLine3");
	var OLDComplainantBusinessName = aa.env.getValue("ComplainantBusinessName");
	var OLDComplainantCity = aa.env.getValue("ComplainantCity");
	var OLDComplainantContactType = aa.env.getValue("ComplainantContactType");
	var OLDComplainantCountry = aa.env.getValue("ComplainantCountry");
	var OLDComplainantEmail = aa.env.getValue("ComplainantEmail");
	var OLDComplainantFax = aa.env.getValue("ComplainantFax");
	var OLDComplainantFirstName = aa.env.getValue("ComplainantFirstName");
	var OLDComplainantId = aa.env.getValue("ComplainantId");
	var OLDComplainantLastName = aa.env.getValue("ComplainantLastName");
	var OLDComplainantMiddleName = aa.env.getValue("ComplainantMiddleName");
	var OLDComplainantPhone1 = aa.env.getValue("ComplainantPhone1");
	var OLDComplainantRelation = aa.env.getValue("ComplainantRelation");
	var OLDComplainantState = aa.env.getValue("ComplainantState");
	var OLDComplainantZip = aa.env.getValue("ComplainantZip");
	var OLDComplaintDate = aa.env.getValue("ComplaintDate");
	var OLDComplaintReferenceId1 = aa.env.getValue("ComplaintReferenceId1");
	var OLDComplaintReferenceId2 = aa.env.getValue("ComplaintReferenceId2");
	var OLDComplaintReferenceId3 = aa.env.getValue("ComplaintReferenceId3");
	var OLDComplaintReferenceSource = aa.env.getValue("ComplaintReferenceSource");
	var OLDComplaintReferenceType = aa.env.getValue("ComplaintReferenceType");
	var OLDContactList = aa.env.getValue("ContactList");
	var OLDCreatedByACA = aa.env.getValue("CreatedByACA");
	var OLDCurrentUserID = aa.env.getValue("CurrentUserID");
	var OLDLicProfList = aa.env.getValue("LicProfList");
	var OLDOwnerEmail = aa.env.getValue("OwnerEmail");
	var OLDOwnerFirstName = aa.env.getValue("OwnerFirstName");
	var OLDOwnerFullName = aa.env.getValue("OwnerFullName");
	var OLDOwnerLastName = aa.env.getValue("OwnerLastName");
	var OLDOwnerMailAddressLine1 = aa.env.getValue("OwnerMailAddressLine1");
	var OLDOwnerMailAddressLine2 = aa.env.getValue("OwnerMailAddressLine2");
	var OLDOwnerMailAddressLine3 = aa.env.getValue("OwnerMailAddressLine3");
	var OLDOwnerMailCity = aa.env.getValue("OwnerMailCity");
	var OLDOwnerMailState = aa.env.getValue("OwnerMailState");
	var OLDOwnerMailZip = aa.env.getValue("OwnerMailZip");
	var OLDOwnerMiddleName = aa.env.getValue("OwnerMiddleName");
	var OLDOwnerPhone = aa.env.getValue("OwnerPhone");
	var OLDOwnerPrimaryFlag = aa.env.getValue("OwnerPrimaryFlag");
	var OLDOwnerValidatedNumber = aa.env.getValue("OwnerValidatedNumber");
	var OLDParcelArea = aa.env.getValue("ParcelArea");
	var OLDParcelBlock = aa.env.getValue("ParcelBlock");
	var OLDParcelBook = aa.env.getValue("ParcelBook");
	var OLDParcelExcemptValue = aa.env.getValue("ParcelExcemptValue");
	var OLDParcelImprovedValue = aa.env.getValue("ParcelImprovedValue");
	var OLDParcelLandValue = aa.env.getValue("ParcelLandValue");
	var OLDParcelLegalDescription = aa.env.getValue("ParcelLegalDescription");
	var OLDParcelLot = aa.env.getValue("ParcelLot");
	var OLDParcelPage = aa.env.getValue("ParcelPage");
	var OLDParcelParcel = aa.env.getValue("ParcelParcel");
	var OLDParcelPrimaryFlag = aa.env.getValue("ParcelPrimaryFlag");
	var OLDParcelRange = aa.env.getValue("ParcelRange");
	var OLDParcelSection = aa.env.getValue("ParcelSection");
	var OLDParcelSubdivision = aa.env.getValue("ParcelSubdivision");
	var OLDParcelTownship = aa.env.getValue("ParcelTownship");
	var OLDParcelTract = aa.env.getValue("ParcelTract");
	var OLDParcelValidatedNumber = aa.env.getValue("ParcelValidatedNumber");
	var OLDParentCapID = aa.env.getValue("ParentCapID");
	var OLDPermitId1 = aa.env.getValue("PermitId1");
	var OLDPermitId2 = aa.env.getValue("PermitId2");
	var OLDPermitId3 = aa.env.getValue("PermitId3");
	var OLDRefAddressType = aa.env.getValue("RefAddressType");
	var OLDStructEstabScriptList = aa.env.getValue("StructEstabScriptList");
	var OLDViolationAddressLine1 = aa.env.getValue("ViolationAddressLine1");
	var OLDViolationAddressLine2 = aa.env.getValue("ViolationAddressLine2");
	var OLDViolationCity = aa.env.getValue("ViolationCity");
	var OLDViolationComment = aa.env.getValue("ViolationComment");
	var OLDViolationLocation = aa.env.getValue("ViolationLocation");
	var OLDViolationState = aa.env.getValue("ViolationState");
	var OLDViolationZip = aa.env.getValue("ViolationZip");

	capId = newCapId;
	vEventName = "ApplicationSubmitAfter";
	if (capId !== null) {
		prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", "ApplicationSubmitAfter");
		parentCapId = pcapId;
		servProvCode = capId.getServiceProviderCode();
		capIDString = capId.getCustomID();
		cap = aa.cap.getCap(capId).getOutput();
		appTypeResult = cap.capType;
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		if (appTypeArray[0].substr(0, 1) != "_") {
			var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput();
			if (currentUserGroupObj)
				currentUserGroup = currentUserGroupObj.getGroupName();
		}
		capName = cap.getSpecialText();
		capStatus = cap.getCapStatus();
		partialCap = !cap.isCompleteCap();
		fileDateObj = cap.getFileDate();
		fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
		fileDateYYYYMMDD = dateFormatted(fileDateObj.getMonth(), fileDateObj.getDayOfMonth(), fileDateObj.getYear(), "YYYY-MM-DD");
		var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput();
		if (valobj.length) {
			estValue = valobj[0].getEstimatedValue();
			calcValue = valobj[0].getCalculatedValue();
			feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
		}

		var capDetailObjResult = aa.cap.getCapDetail(capId);
		if (capDetailObjResult.getSuccess()) {
			capDetail = capDetailObjResult.getOutput();
			houseCount = capDetail.getHouseCount();
			feesInvoicedTotal = capDetail.getTotalFee();
			balanceDue = capDetail.getBalance();
		}
		loadAppSpecific(AInfo);
		loadTaskSpecific(AInfo);
		loadParcelAttributes(AInfo);
		loadASITables();

		CreatedByACA = 'N';

	}

	doScriptActions();

	//Reset global variables to the original records
	vScriptName = pvScriptName;
	vEventName = pvEventName;
	prefix = pprefix;
	capId = pcapId;
	cap = pcap;
	capIDString = pcapIDString;
	appTypeResult = pappTypeResult;
	appTypeString = pappTypeString;
	appTypeArray = pappTypeArray;
	capName = pcapName;
	capStatus = pcapStatus;
	fileDateObj = pfileDateObj;
	fileDate = pfileDate;
	fileDateYYYYMMDD = pfileDateYYYYMMDD;
	parcelArea = pparcelArea;
	estValue = pestValue;
	feesInvoicedTotal = pfeesInvoicedTotal;
	balanceDue = pbalanceDue;
	houseCount = phouseCount;
	feesInvoicedTotal = pfeesInvoicedTotal;
	capDetail = pcapDetail;
	AInfo = pAInfo;
	partialCap = ppartialCap;
	parentCapId = pparentCapId;
	CreatedByACA = pCreatedByACA;
	//reset session variables with the old variables
	aa.env.setValue("AdditionalInfoBuildingCount", OLDAdditionalInfoBuildingCount)
	aa.env.setValue("AdditionalInfoConstructionTypeCode", OLDAdditionalInfoConstructionTypeCode)
	aa.env.setValue("AdditionalInfoHouseCount", OLDAdditionalInfoHouseCount)
	aa.env.setValue("AdditionalInfoPublicOwnedFlag", OLDAdditionalInfoPublicOwnedFlag)
	aa.env.setValue("AdditionalInfoValuation", OLDAdditionalInfoValuation)
	aa.env.setValue("AdditionalInfoWorkDescription", OLDAdditionalInfoWorkDescription)
	aa.env.setValue("AddressCity", OLDAddressCity)
	aa.env.setValue("AddressHouseFraction", OLDAddressHouseFraction)
	aa.env.setValue("AddressHouseNumber", OLDAddressHouseNumber)
	aa.env.setValue("AddressLine1", OLDAddressLine1)
	aa.env.setValue("AddressLine2", OLDAddressLine2)
	aa.env.setValue("AddressPrimaryFlag", OLDAddressPrimaryFlag)
	aa.env.setValue("AddressState", OLDAddressState)
	aa.env.setValue("AddressStreetDirection", OLDAddressStreetDirection)
	aa.env.setValue("AddressStreetName", OLDAddressStreetName)
	aa.env.setValue("AddressStreetSuffix", OLDAddressStreetSuffix)
	aa.env.setValue("AddressType", OLDAddressType)
	aa.env.setValue("AddressUnitNumber", OLDAddressUnitNumber)
	aa.env.setValue("AddressUnitType", OLDAddressUnitType)
	aa.env.setValue("AddressValidatedNumber", OLDAddressValidatedNumber)
	aa.env.setValue("AddressZip", OLDAddressZip)
	aa.env.setValue("AppDetailFirstIssuedDate", OLDAppDetailFirstIssuedDate)
	aa.env.setValue("AppDetailStatusReason", OLDAppDetailStatusReason)
	aa.env.setValue("ApplicantAddressLine1", OLDApplicantAddressLine1)
	aa.env.setValue("ApplicantAddressLine2", OLDApplicantAddressLine2)
	aa.env.setValue("ApplicantAddressLine3", OLDApplicantAddressLine3)
	aa.env.setValue("ApplicantBirthDate", OLDApplicantBirthDate)
	aa.env.setValue("ApplicantBusinessName", OLDApplicantBusinessName)
	aa.env.setValue("ApplicantCity", OLDApplicantCity)
	aa.env.setValue("ApplicantContactAddressModelList", OLDApplicantContactAddressModelList)
	aa.env.setValue("ApplicantContactType", OLDApplicantContactType)
	aa.env.setValue("ApplicantCountry", OLDApplicantCountry)
	aa.env.setValue("ApplicantEmail", OLDApplicantEmail)
	aa.env.setValue("ApplicantFaxCountryCode", OLDApplicantFaxCountryCode)
	aa.env.setValue("ApplicantFirstName", OLDApplicantFirstName)
	aa.env.setValue("ApplicantGender", OLDApplicantGender)
	aa.env.setValue("ApplicantId", OLDApplicantId)
	aa.env.setValue("ApplicantLastName", OLDApplicantLastName)
	aa.env.setValue("ApplicantMiddleName", OLDApplicantMiddleName)
	aa.env.setValue("ApplicantNamesuffix", OLDApplicantNamesuffix)
	aa.env.setValue("ApplicantPhone1", OLDApplicantPhone1)
	aa.env.setValue("ApplicantPhone1CountryCode", OLDApplicantPhone1CountryCode)
	aa.env.setValue("ApplicantPhone2", OLDApplicantPhone2)
	aa.env.setValue("ApplicantPhone2CountryCode", OLDApplicantPhone2CountryCode)
	aa.env.setValue("ApplicantPhone3", OLDApplicantPhone3)
	aa.env.setValue("ApplicantPhone3CountryCode", OLDApplicantPhone3CountryCode)
	aa.env.setValue("ApplicantPostOfficeBox", OLDApplicantPostOfficeBox)
	aa.env.setValue("ApplicantRelation", OLDApplicantRelation)
	aa.env.setValue("ApplicantSalutation", OLDApplicantSalutation)
	aa.env.setValue("ApplicantState", OLDApplicantState)
	aa.env.setValue("ApplicantZip", OLDApplicantZip)
	aa.env.setValue("ApplicationStatus", OLDApplicationStatus)
	aa.env.setValue("ApplicationSubmitMode", OLDApplicationSubmitMode)
	aa.env.setValue("ApplicationTypeLevel1", OLDApplicationTypeLevel1)
	aa.env.setValue("ApplicationTypeLevel2", OLDApplicationTypeLevel2)
	aa.env.setValue("ApplicationTypeLevel3", OLDApplicationTypeLevel3)
	aa.env.setValue("ApplicationTypeLevel4", OLDApplicationTypeLevel4)
	aa.env.setValue("CAEAddressLine1", OLDCAEAddressLine1)
	aa.env.setValue("CAEAddressLine2", OLDCAEAddressLine2)
	aa.env.setValue("CAEAddressLine3", OLDCAEAddressLine3)
	aa.env.setValue("CAEBirthDate", OLDCAEBirthDate)
	aa.env.setValue("CAEBusinessName", OLDCAEBusinessName)
	aa.env.setValue("CAEBusName2", OLDCAEBusName2)
	aa.env.setValue("CAECity", OLDCAECity)
	aa.env.setValue("CAECountry", OLDCAECountry)
	aa.env.setValue("CAECountryCode", OLDCAECountryCode)
	aa.env.setValue("CAEEmail", OLDCAEEmail)
	aa.env.setValue("CAEFirstName", OLDCAEFirstName)
	aa.env.setValue("CAEGender", OLDCAEGender)
	aa.env.setValue("CAELastName", OLDCAELastName)
	aa.env.setValue("CAELienseNumber", OLDCAELienseNumber)
	aa.env.setValue("CAELienseType", OLDCAELienseType)
	aa.env.setValue("CAEMiddleName", OLDCAEMiddleName)
	aa.env.setValue("CAEPhone1", OLDCAEPhone1)
	aa.env.setValue("CAEPhone2", OLDCAEPhone2)
	aa.env.setValue("CAEPhone2CountryCode", OLDCAEPhone2CountryCode)
	aa.env.setValue("CAEPhone3", OLDCAEPhone3)
	aa.env.setValue("CAEPhone3CountryCode", OLDCAEPhone3CountryCode)
	aa.env.setValue("CAEPostOfficeBox", OLDCAEPostOfficeBox)
	aa.env.setValue("CAESalutation", OLDCAESalutation)
	aa.env.setValue("CAEState", OLDCAEState)
	aa.env.setValue("CAESuffixName", OLDCAESuffixName)
	aa.env.setValue("CAETitle", OLDCAETitle)
	aa.env.setValue("CAEValidatedNumber", OLDCAEValidatedNumber)
	aa.env.setValue("CAEZip", OLDCAEZip)
	aa.env.setValue("CapCommentText", OLDCapCommentText)
	aa.env.setValue("ComplainantAddressLine1", OLDComplainantAddressLine1)
	aa.env.setValue("ComplainantAddressLine2", OLDComplainantAddressLine2)
	aa.env.setValue("ComplainantAddressLine3", OLDComplainantAddressLine3)
	aa.env.setValue("ComplainantBusinessName", OLDComplainantBusinessName)
	aa.env.setValue("ComplainantCity", OLDComplainantCity)
	aa.env.setValue("ComplainantContactType", OLDComplainantContactType)
	aa.env.setValue("ComplainantCountry", OLDComplainantCountry)
	aa.env.setValue("ComplainantEmail", OLDComplainantEmail)
	aa.env.setValue("ComplainantFax", OLDComplainantFax)
	aa.env.setValue("ComplainantFirstName", OLDComplainantFirstName)
	aa.env.setValue("ComplainantId", OLDComplainantId)
	aa.env.setValue("ComplainantLastName", OLDComplainantLastName)
	aa.env.setValue("ComplainantMiddleName", OLDComplainantMiddleName)
	aa.env.setValue("ComplainantPhone1", OLDComplainantPhone1)
	aa.env.setValue("ComplainantRelation", OLDComplainantRelation)
	aa.env.setValue("ComplainantState", OLDComplainantState)
	aa.env.setValue("ComplainantZip", OLDComplainantZip)
	aa.env.setValue("ComplaintDate", OLDComplaintDate)
	aa.env.setValue("ComplaintReferenceId1", OLDComplaintReferenceId1)
	aa.env.setValue("ComplaintReferenceId2", OLDComplaintReferenceId2)
	aa.env.setValue("ComplaintReferenceId3", OLDComplaintReferenceId3)
	aa.env.setValue("ComplaintReferenceSource", OLDComplaintReferenceSource)
	aa.env.setValue("ComplaintReferenceType", OLDComplaintReferenceType)
	aa.env.setValue("ContactList", OLDContactList)
	aa.env.setValue("CreatedByACA", OLDCreatedByACA)
	aa.env.setValue("CurrentUserID", OLDCurrentUserID)
	aa.env.setValue("LicProfList", OLDLicProfList)
	aa.env.setValue("OwnerEmail", OLDOwnerEmail)
	aa.env.setValue("OwnerFirstName", OLDOwnerFirstName)
	aa.env.setValue("OwnerFullName", OLDOwnerFullName)
	aa.env.setValue("OwnerLastName", OLDOwnerLastName)
	aa.env.setValue("OwnerMailAddressLine1", OLDOwnerMailAddressLine1)
	aa.env.setValue("OwnerMailAddressLine2", OLDOwnerMailAddressLine2)
	aa.env.setValue("OwnerMailAddressLine3", OLDOwnerMailAddressLine3)
	aa.env.setValue("OwnerMailCity", OLDOwnerMailCity)
	aa.env.setValue("OwnerMailState", OLDOwnerMailState)
	aa.env.setValue("OwnerMailZip", OLDOwnerMailZip)
	aa.env.setValue("OwnerMiddleName", OLDOwnerMiddleName)
	aa.env.setValue("OwnerPhone", OLDOwnerPhone)
	aa.env.setValue("OwnerPrimaryFlag", OLDOwnerPrimaryFlag)
	aa.env.setValue("OwnerValidatedNumber", OLDOwnerValidatedNumber)
	aa.env.setValue("ParcelArea", OLDParcelArea)
	aa.env.setValue("ParcelBlock", OLDParcelBlock)
	aa.env.setValue("ParcelBook", OLDParcelBook)
	aa.env.setValue("ParcelExcemptValue", OLDParcelExcemptValue)
	aa.env.setValue("ParcelImprovedValue", OLDParcelImprovedValue)
	aa.env.setValue("ParcelLandValue", OLDParcelLandValue)
	aa.env.setValue("ParcelLegalDescription", OLDParcelLegalDescription)
	aa.env.setValue("ParcelLot", OLDParcelLot)
	aa.env.setValue("ParcelPage", OLDParcelPage)
	aa.env.setValue("ParcelParcel", OLDParcelParcel)
	aa.env.setValue("ParcelPrimaryFlag", OLDParcelPrimaryFlag)
	aa.env.setValue("ParcelRange", OLDParcelRange)
	aa.env.setValue("ParcelSection", OLDParcelSection)
	aa.env.setValue("ParcelSubdivision", OLDParcelSubdivision)
	aa.env.setValue("ParcelTownship", OLDParcelTownship)
	aa.env.setValue("ParcelTract", OLDParcelTract)
	aa.env.setValue("ParcelValidatedNumber", OLDParcelValidatedNumber)
	aa.env.setValue("ParentCapID", OLDParentCapID)
	aa.env.setValue("PermitId1", OLDPermitId1)
	aa.env.setValue("PermitId2", OLDPermitId2)
	aa.env.setValue("PermitId3", OLDPermitId3)
	aa.env.setValue("RefAddressType", OLDRefAddressType)
	aa.env.setValue("StructEstabScriptList", OLDStructEstabScriptList)
	aa.env.setValue("ViolationAddressLine1", OLDViolationAddressLine1)
	aa.env.setValue("ViolationAddressLine2", OLDViolationAddressLine2)
	aa.env.setValue("ViolationCity", OLDViolationCity)
	aa.env.setValue("ViolationComment", OLDViolationComment)
	aa.env.setValue("ViolationLocation", OLDViolationLocation)
	aa.env.setValue("ViolationState", OLDViolationState)
	aa.env.setValue("ViolationZip", OLDViolationZip)

}

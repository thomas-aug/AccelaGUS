/**
 * INCLUDES_RECORD
 * 	- this object is used to read any Accela records
 * @module INCLUDES_RECORD
 * @namespace INCLUDES_RECORD
 * Dependencies:
 * INCLUDES_SYSTEM
 */
/*-USER-----------DATE----------------COMMENTS----------------------------------------------------------/
 | SLEIMAN         06/01/2016 10:11:10 formatting code
 | SLEIMAN         06/01/2016 11:29:29 fixing updateAsitColumns bug, invalid indexes
 | SLEIMAN         06/01/2016 11:32:16 fixing asittoarray function
 | TCHANSEN        10/26/2017 16:41:00 Formatted code, fixed code syntax problems, added JSDOC to each prototype and function
 /-----END CHANGE LOG-----------------------------------------------------------------------------------*/

/*    IMPORTANT 
 * PROTOTYPES ARE NAMED IN THIS FORMAT <primaryObject>.prototype.<verb><modifier><invalidTag>
 * For example - 
 * Record.prototype.addContact would take a contact object and add it to the primary object.
 * Record.prototype.getAllCustomFields would retrieve all of the custom fields for the primary object.
 */

/**
 * Retrieves the CapID object for the passed in standard or custom identifier for use with the prototype functions.
 * 
 * @param {string} Record id. This is either the standard identifier (B1_PER_ID1-B1_PER_ID2-B1_PER_ID3) custom identifier for the record (B1_ALT_ID). 
 */
function Record(id) {
	if (id == null || id == "") {
		var constructorName = (this.constructor == null) ? "undefined" : this.constructor.name;
		throw "ID cannot be null or empty when initialize [" + constructorName + "]";
	}
	this.CACHEMAP = aa.util.newHashMap();
	if (id.getClass && id.getClass().getName().equals("com.accela.aa.aamain.cap.CapIDModel")) {
		this.capId = id;
		this.altId = id.getCustomID();
		if (!this.altId) {
			this.capId = aa.cap.getCapID(id.getID1(), id.getID2(), id.getID3()).getOutput();
			this.altId = this.capId.getCustomID();
		}
	} else {
		id = id + "";
		this.altId = id;
		this.capId = aa.cap.getCapID(id).getOutput();
	}
	if (this.capId == null) {
		throw "record with ID " + id + " does not exist";
	}
}

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.addContact = function (capContactModel) {
	aa.people.createCapContactWithRefPeopleModel(this.getCapID(), capContactModel.getPeople()).getOutput();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.addStdCondition = function (condtionType, condtionname) {
	var standardConditions = aa.capCondition.getStandardConditions(condtionType, condtionname).getOutput();

	for (var i = 0; i < standardConditions.length; i++) {
		var standardCondition = standardConditions[i];
		aa.capCondition.createCapConditionFromStdCondition(this.capId, standardCondition);
	}
};

/**
 * copy address from passed cap id to current record.
 * 
 * @param addressSrcCapId
 * @param {string|Record|CapIDModel}
 *            addressSrcCapId - custom id or Cap id object or record object to
 *            get address from.
 * @memberof Record
 */
Record.prototype.copyAddress = function (addressSrcCapId) {
	var sourceRecord = null;
	if (addressSrcCapId instanceof Record) {
		sourceRecord = addressSrcCapId;
	} else {
		sourceRecord = new Record(addressSrcCapId);
	}

	var srcAddressModel = sourceRecord.getAddressesCaps();

	if (srcAddressModel != null) {
		for (var index in srcAddressModel) {
			var address = srcAddressModel[index];
			address.setCapID(this.getCapID());
			aa.address.createAddress(address);
		}
	}
};

/**
 * copy license from passed cap id to current record.
 * 
 * @param licenseSrcCapId
 *            {CapIDModel|String} - Cap id or custom id to get license and link
 *            it to current record.
 * @memberof Record
 * @returns {LicenseScriptModel} license model which copied to record.
 */
Record.prototype.copyLicense = function (licenseSrcCapId) {
	var licenseSrcRecord = new Record(licenseSrcCapId);
	var srcLicenseModel = licenseSrcRecord.getLicense();

	var copiedLicense = null;
	if (srcLicenseModel != null) {
		var newLicenseNbr = srcLicenseModel.getLicenseNbr();

		if (newLicenseNbr != this.getLicenseNumber()) {
			copiedLicense = this.addLicense(newLicenseNbr);
		} else {
			copiedLicense = this.getLicense();
		}
	}

	return copiedLicense;
};

/**
 * get All ASI fields on the cap
 * 
 * @param {bool} - if true each subgroup will be in its own object under the root object,
 *  necessary if you have duplicate label names under different subgroups
 * @memberof Record
 *  
 *  @return {object} - 
 *  if groupBySubgroup is false an object with ASI labels and values,
 *  if groupBySubgroup is true an object with ASI subgroups and objects that contain ASI labels and values
 */
Record.prototype.getAllASI = function (groupBySubgroup) {
	var asi = {};
	var result = aa.appSpecificInfo.getByCapID(this.capId);
	if (result.getSuccess()) {
		result = result.getOutput();
		for (var i in result) {
			var value = result[i].getChecklistComment();
			if (value == null || value + "" == "") {
				value = "";
			}
			var asiLabel = result[i].getCheckboxDesc();
			if (groupBySubgroup) {
				var subGroupName = result[i].getCheckboxType();
				if (!asi.hasOwnProperty(subGroupName)) {
					asi[subGroupName] = {};
				}
				asi[subGroupName][asiLabel] = value;
			} else {
				asi[asiLabel] = value;
			}
		}
	}
	return asi;
};

/**
 * [[DESCRIPTION]]
 * 
 * @memberof Record
 * @returns {String} the name of the updated ASIT, applicable only in ASIUB and ASIUA events
 */
Record.prototype.getApplicationSpecificInfoUpdatedTable = function () {
	var updatedTable = "";
	var gm = aa.env.getValue("AppSpecificTableGroupModel");

	var gmItem = gm;

	if (gm != null && typeof (gm).size != "undefined" && gm.size() > 0) {
		gmItem = gm.get(0);

	} else {
		gmItem = gm;

	}

	if (null != gmItem && gmItem != "") {
		var tables = gmItem.getTablesMap();
		if (tables != null && tables.size() > 0) {
			var ta = tables.values().toArray()[0];
			updatedTable = ta.getTableName();

		}

	}
	return updatedTable;
};

/**
 * Retrieve the value of a custom field by the field name and field group.
 * @param {*} custom field group.
 * @param {*} custom field name.
 * @param {*} value to return if the requested value is missing or empty.
 * @memberof Record
 * @returns {*} either the custom field value or the default value depending on if the custom field is there and populated or not.
 */
Record.prototype.getASI = function (asiGroup, name, defaultValue) {
	if (typeof defaultValue === "undefined") {
		defaultValue = "";
	}
	var valDef = aa.appSpecificInfo.getAppSpecificInfos(this.capId, asiGroup, name).getOutput();
	if (valDef.length > 0) {
		val = valDef[0].getChecklistComment();
		if (val == null || val + "" == "") {
			val = defaultValue;
		}
	} else {
		val = defaultValue;
	}
	return val;
};

/**
 * get the ASIT attached to this record
 * @param {string} custom table name
 * @param {boolean} flag to indicate whether or not to ignore the cache
 * @memberof Record
 * @returns {array} the custom table as an array
 */
Record.prototype.getASIT = function (tname, ignoreCache) {
	var ret = null;
	if (ignoreCache == null) {
		ignoreCache = false;
	}
	if (!ignoreCache && this.CACHEMAP.containsKey(tname)) {
		ret = this.CACHEMAP.get(tname);
	} else {
		var asit = aa.appSpecificTableScript.getAppSpecificTableModel(this.capId, tname).getOutput();
		if (asit == null) {
			throw "Couldn't load ASI Table " + tname + ", maybe it is empty or Invalid cap ID " + this.capId;
		}
		ret = Record.asitToArray(asit);
		this.CACHEMAP.put(tname, ret);
	}
	return ret;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getBalance = function () {
	var capDetailScriptModel = aa.cap.getCapDetail(this.capId).getOutput();
	if (capDetailScriptModel == null) {
		throw "capDetail is null";
	}
	var capDetail = capDetailScriptModel.getCapDetailModel();
	return capDetail.getBalance();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getCapType = function () {
	return aa.cap.getCap(this.capId).getOutput().getCapType();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getDocumentList = function () {
	var docListArray = [];
	docListResult = aa.document.getCapDocumentList(this.capId, aa.getAuditID());
	if (docListResult.getSuccess()) {
		docListArray = docListResult.getOutput();
	}
	return docListArray;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getCapID = function () {
	return this.capId;
};

/**
 * get contacts of certain type linked to current record.
 * @memberof Record
 * @returns {Array} - array of contact model.
 */
Record.prototype.getContacts = function () {
	var capContactArray = [];
	var capContactResult = aa.people.getCapContactByCapID(this.capId);
	if (capContactResult.getSuccess()) {
		capContactArray = capContactResult.getOutput();
	}
	return capContactArray;
};

/**
 * get contacts linked to current record.
 * 
 * @param {String} contactType - type of contact to filter with
 * @memberof Record
 * @returns {Array} - array of contact model.
 */
Record.prototype.getContactsByType = function (contactType) {
	return this.getContacts().filter(function (contact) {
		return contact.getCapContactModel().getContactType() == contactType;
	});
};

/**
 * get the user id who created to record
 * @memberof Record
 * @returns {string} the CapModel.getCreatedBy() string.
 */
Record.prototype.getCreatedBy = function () {
	var cap = aa.cap.getCap(this.capId).getOutput();
	var capModel = cap.getCapModel();

	return capModel.getCreatedBy();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getCreationDate = function () {
	var date = aa.cap.getCapViewByID(this.capId).getOutput().getAuditDate();
	return new Date(date.getTime());
};

/**
 * this is a function to get custom id
 */
Record.prototype.getCustomID = function () {
	return this.altId;
};

/**
 * returns all fee items on record
 * @memberof Record
 * @returns {Array} record fee items
 */
Record.prototype.getFeeItems = function () {
	var feeItems = aa.finance.getFeeItemByCapID(this.capId);
	if (!feeItems.getSuccess()) {
		throw feeItems.getErrorMessage();
	}
	return feeItems.getOutput();
};

/**
 * returns all paid fee items on record
 * @memberof Record
 * @returns {Array} record paid fee items
 */
Record.prototype.getPaidFeeItems = function () {
	var paidFeeItems = aa.finance.getPaymentFeeItems(this.capId, null);
	if (!paidFeeItems.getSuccess()) {
		throw paidFeeItems.getErrorMessage();
	}
	return paidFeeItems.getOutput();
};

/**
 * 
 * [[DESCRIPTION]]
 * @param Optional. The attribute value to search by. [attr] 
 * @returns in case attr is not specified: HashMap of related parcels attributes with the parcel number as the key and attribute hash map as the value in case attr is specified: HashMap with the parcel number as the key and the value of the specified attribute as the value
 */
Record.prototype.getRelatedParcelAttribute = function (attr) {
	var lookupAttr = null;
	if (arguments.length > 0) {
		lookupAttr = arguments[0];
	}
	var Parcels = aa.parcel.getParcelByCapId(this.getCapID(), aa.util.newQueryFormat()).getOutput();
	var parcelHashMap = aa.util.newHashMap();
	for (var index = 0; index < Parcels.size(); index++) {
		var parcelModel = Parcels.get(index);
		var parcelNumber = parcelModel.getParcelNumber();
		var parcelAttributes = parcelModel.getParcelAttribute();
		if (parcelAttributes != null) {
			var parcelAttHashMap = aa.util.newHashMap();
			for (var i = 0; i < parcelAttributes.size(); i++) {
				var parcelAttribute = parcelAttributes.get(i);
				var fieldName = parcelAttribute.getB1AttributeName();
				var value = parcelAttribute.getB1AttributeValue();
				if (lookupAttr != null && fieldName == attr && value != null && value != "") {
					parcelHashMap.put(parcelNumber, value);
				} else {
					if (value != null && value != "")
						parcelAttHashMap.put(fieldName, value);
				}
			}
			if (lookupAttr == null)
				parcelHashMap.put(parcelNumber, parcelAttHashMap);
		}
	}
	return parcelHashMap;
};

/**
 * this function returns in an array all the parcels linked to this record.
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getRelatedParcels = function () {
	return aa.parcel.getParcelByCapId(this.getCapID(), aa.util.newQueryFormat()).getOutput();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getScheduledDate = function () {
	var date = aa.cap.getCapDetail(this.capId).getOutput().getScheduledDate();
	return Record.toDate(date);
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getTaskASI = function (taskName, fieldName, defaultValue) {
	if (typeof defaultValue === "undefined") {
		defaultValue = "";
	}
	var task = aa.workflow.getTask(this.capId, taskName).getOutput();
	var processID = task.getProcessID();
	var stepNumber = task.getStepNumber();
	var valDef = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(this.capId, processID, stepNumber, fieldName).getOutput();

	if (valDef != null) {
		val = valDef.getChecklistComment();
		if (val == null || val + "" == "") {
			val = defaultValue;
		}
	} else {
		val = defaultValue;
	}

	return val;
};

/**
 * returns all invoiced and unpaid fee items on record
 * @memberof Record
 * @returns {Array} record unpaid fee items
 */
Record.prototype.getUnpaidFeeItems = function () {
	var feeItems = this.getFeeItems();
	var paidFeeItems = this.getPaidFeeItems();
	var paidFeeItemsMap = {};
	for (var i = 0; i < paidFeeItems.length; i++) {
		paidFeeItemsMap[paidFeeItems[i].getFeeSeqNbr()] = true;
	}

	// Only keep unpaid and invoiced fee items
	return feeItems.filter(function (feeItem) {
		var paid = paidFeeItemsMap.hasOwnProperty(feeItem.getFeeSeqNbr());

		return (!paid && feeItem.getFeeitemStatus() == "INVOICED");
	});
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getApplicationName = function () {
	return this.getCap().getSpecialText();
};

/**
 * get license number linked to this record.
 * 
 * @memberof Record
 * @returns {String} license number linked to current record.
 */
Record.prototype.getLicenseNumber = function () {
	var licenseModel = this.getLicense();

	var licenseNumber = null;
	if (licenseModel != null) {
		licenseNumber = licenseModel.getLicenseNbr();
	}

	return licenseNumber;
};

/**
 * Returns map contains all rows in passed ASIT using primary column values as
 * keys and related row as value.
 * 
 * @param {string}
 *            asitName - ASIT Name to be represented as map.
 * @param {string}
 *            primaryColName - column name which will be the map key (must be
 *            unique).
 * @memberof Record
 * @returns map represents ASIT.
 */
Record.prototype.getAsitMap = function (asitName, primaryColName) {
	var asitRows = this.getASIT(asitName);
	var asitMap = aa.util.newHashMap();
	for (var idx in asitRows) {
		var row = asitRows[idx];
		asitMap.put(String(row[primaryColName]), row);
	}
	return asitMap;
};

/**
 * Returns list contains all values in specific column of passed ASIT, skip
 * empty values.
 * 
 * @param {string}
 *            asitName - ASIT Name to get column data.
 * @param {string}
 *            colName - column name to get related values.
 * @param {boolean}
 *            skipEmptyValues - skip empty values if true
 * @memberof Record
 * @returns {Array} contains all values of this column.
 */
Record.prototype.getAsitColumList = function (asitName, colName, skipEmptyValues) {
	var asitRows = this.getASIT(asitName);
	var asitList = [];

	skipEmptyValues = skipEmptyValues || true;

	for (var idx in asitRows) {
		var row = asitRows[idx];
		var colVal = row[colName];
		if (skipEmptyValues == true && (colVal == null || colVal == "")) {
			continue;
		}

		asitList.push(String(colVal));
	}

	return asitList;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getReportContent = function (reportName, parameters) {
	var report = aa.reportManager.getReportInfoModelByName(reportName).getOutput();
	report.setModule(this.getCap().getCapType().getGroup());

	report.setCapId(this.capId);

	report.setReportParameters(parameters);

	var reportResult = aa.reportManager.getReportResult(report).getOutput();
	return reportResult.getContent();
};

/**
 * gets the flag indicating if the record is complete or not.
 * @memberof Record
 * @returns {boolean} the CapModel.IsCompleteCap() boolean.
 */
Record.prototype.isComplete = function () {
	return this.getCap().isCompleteCap();
};

/**
 * Write message to server logs.
 * 
 * @param {String} message label.
 * @param {Object} Message Content, By default it will call toString() of current object.
 * @param {*}   not used, for future use.
 * @memberof Record
 */
Record.prototype.logMsg = function (msgLabel, msgContent, logLevel) {
	if (msgContent == null || (typeof msgContent === "undefined")) {
		msgContent = this.toString();
	}

	aa.debug(msgLabel, msgContent);
};

/**
 * remove contact from current record.
 * 
 * @param {long} - the contact id to remove.
 * @memberof Record
 * 
 */
Record.prototype.removeContact = function (contactId) {
	aa.people.removeCapContact(this.getCapID(), contactId);
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.renewExpirationDateFromSettings = function () {
	var expirationRes = aa.expiration.getLicensesByCapID(this.capId);
	if (!expirationRes.getSuccess()) {
		throw "Update expiration failed, error while getting expiration model for cap " + this.capId + ": " + expirationModel.getErrorMessage();

	}
	var exp = expirationRes.getOutput();
	var expUnit = exp.getExpUnit();
	var expInterval = exp.getExpInterval();
	var expDate = Record.toDate(exp.getExpDate());
	if (expUnit == "Days") {
		expDate.setDate(expDate.getDate() + expInterval);
	} else if (expUnit == "Months") {
		expDate.setMonth(expDate.getMonth() + expInterval);
	} else if (expUnit == "Years") {
		expDate.setFullYear(expDate.getFullYear() + expInterval);
	}

	this.setExpiration(expDate, "Active");
};

/**
 * set the user id who created to record
 * @memberof Record
 * @returns {string}
 */
Record.prototype.setCreatedBy = function (pubUserID) {
	var cap = aa.cap.getCap(this.capId).getOutput();
	var capModel = cap.getCapModel();

	capModel.setCreatedBy(pubUserID);

	aa.cap.editCapByPK(capModel);
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.setExpiration = function (date, status) {
	var expRes = aa.expiration.getLicensesByCapID(this.capId);
	if (!date && !status) {
		throw "please specify date or status";
	}
	if (!expRes.getSuccess()) {
		throw "Error While Retreiving Expiration for " + this.capId + ": " + expRes.getErrorMessage();
	}
	expRes = expRes.getOutput();
	if (date) {
		expRes.getB1Expiration().setExpDate(date);
	}
	if (status) {
		expRes.setExpStatus(status);
	}

	var res = aa.expiration.editB1Expiration(expRes.getB1Expiration());
	if (!res.getSuccess()) {
		throw "Error While saving Expiration for " + this.capId + ": " + res.getErrorMessage();
	}

};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.updateCustomID = function (id) {
	var result = aa.cap.updateCapAltID(this.capId, id);
	if (!result.getSuccess()) {
		throw result.getErrorMessage();
	}
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.voidFeesAndPayment = function (isVoidCapBalance) {
	var fees = aa.finance.getFeeItemByCapID(this.capId).getOutput();
	var voidedInvoices = [];
	var status = "VOIDED";
	if (fees != null) {
		for (var i = 0; i < fees.length; i++) {
			var feelItem = fees[i].getF4FeeItem();
			var feeID = feelItem.getFeeSeqNbr();
			feelItem.setFeeitemStatus(status);
			feelItem.setFee(0.0);
			aa.finance.editFeeItem(feelItem);
			var feeInvoiceScriptModel = aa.finance.getValidFeeItemInvoiceByFeeNbr(this.capId, feeID).getOutput();
			if (feeInvoiceScriptModel != null) {
				var feeInvoice = feeInvoiceScriptModel.getX4FeeItemInvoice();
				var invoiceID = feeInvoice.getInvoiceNbr();
				feeInvoice.setFeeitemStatus(status);
				feeInvoice.setFee(0.0);
				aa.finance.editFeeItemInvoice(feeInvoice);
				aa.finance.editInvoiceBalanceDue(invoiceID, 0.0, 0.0);
				voidedInvoices.push(invoiceID);
			}
		}

		if (isVoidCapBalance) {
			var capDetailScriptModel = aa.cap.getCapDetail(this.capId).getOutput();
			if (capDetailScriptModel != null) {
				var capDetail = capDetailScriptModel.getCapDetailModel();
				capDetail.setBalance(0.0);
				aa.cap.editCapDetail(capDetail);
			}
		}
	}
	return voidedInvoices;
};

/**
 * copy values of passed ASIT from specific record into current record if there
 * is difference in names between source ASIT column names and destination
 * column names, passed map will be used to copy values.
 * 
 * @param {Record}
 *            record - record which contains ASIT values to be copied
 * @param {string}
 *            asitName - ASIT name which will be copied from source record to
 *            destination record.
 * @param {HashMap}
 *            differentColNamesMap - map contains different column names to be
 *            mapped dynamically during updating ASIT
 * @memberof Record
 */
Record.prototype.copyAsitFromOtherRecord = function (record, asitName, differentColNamesMap) {
	var dataSet = [];
	var asit = record.getASIT(asitName);
	for (var x in asit) {
		var row = asit[x];

		dataSet.push(Record.toAsiTableValObj(row, differentColNamesMap));
	}
	this.updateASIT(asitName, dataSet);
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getReferenceFee = function (code, feeSchedule) {
	var serviceProviderCode = aa.getServiceProviderCode();
	var refFeeServer = aa.proxyInvoker.newInstance("com.accela.aa.finance.fee.RefFeeBusiness").getOutput();
	var version = refFeeServer.getDefaultVersionBySchedule(serviceProviderCode, feeSchedule, "");
	if (version == null || version == "") {
		throw "Fee schedule[" + feeSchedule + "] does not exist";
	}
	var dao = Record.getDao("com.accela.aa.finance.fee.RFeeItemDAO");

	var res = dao.getRefFeeItemByFeeCode(serviceProviderCode, feeSchedule, version, code);

	return res;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getScheduleFees = function (feeSchedule) {
	var serviceProviderCode = aa.getServiceProviderCode();
	var refFeeServer = aa.proxyInvoker.newInstance("com.accela.aa.finance.fee.RefFeeBusiness").getOutput();
	return refFeeServer.getFeeItemList(serviceProviderCode, feeSchedule, "", "A", aa.util.newQueryFormat(), aa.getAuditID());
};

/**
 * create or update fee if exists.
 * 
 * @param {string}
 *            fcode - fee code
 * @param {string}
 *            fsched - fee schedule
 * @param {number}
 *            [fqty=1] - fee quantity
 * @param {string}
 *            [fperiod="FINAL"] - fee period
 * @param {boolean}
 *            [pDuplicate="false"] - update existing fee if false
 * @memberof Record
 * 
 * @returns {number} created or updated fee sequence number.
 */
Record.prototype.createOrUpdateFee = function (fcode, fsched, fqty, fperiod, pDuplicate, fdesc, amount) {

	if (fqty == null || fqty == "") {
		fqty = 1;
	}

	if (fperiod == null || fperiod == "") {
		fperiod = "FINAL";
	}

	if (pDuplicate == null || pDuplicate.length == 0) {
		pDuplicate = false;
	}

	var invFeeFound = false;
	var adjustedQty = fqty;
	var feeSeq = null;
	var createFee;
	feeUpdated = false;
	getFeeResult = aa.finance.getFeeItemByFeeCode(this.capId, fcode, fperiod);
	if (getFeeResult.getSuccess()) {
		var feeList;

		feeList = getFeeResult.getOutput();

		for (var feeNum in feeList) {

			if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
				if (pDuplicate == true) {
					logDebug("Invoiced fee " + fcode + " found, subtracting invoiced amount from update qty.");
					adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
					invFeeFound = true;
				} else {
					invFeeFound = true;
					logDebug("Invoiced fee " + fcode + " found.  Not updating this fee. Not assessing new fee " + fcode);
				}
			}

			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
				adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
			}
		}

		for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW") && !feeUpdated) {
				feeSeq = feeList[feeNum].getFeeSeqNbr();
				var editResult = aa.finance.editFeeItemUnit(this.capId, adjustedQty + feeList[feeNum].getFeeUnit(), feeSeq);

				if (fdesc != null && fdesc != "" && amount != null) {
					createFee = aa.finance.getFeeItemByPK(this.getCapID(), feeSeq).getOutput();
					createFee.setFeeDescription(fdesc);
					createFee.setFee(amount);
					aa.finance.editFeeItem(createFee.getF4FeeItem());
				}
				feeUpdated = true;
				if (editResult.getSuccess()) {
					logDebug("Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty);

				} else {
					throw "**ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage();

				}
			}
	} else {
		throw "**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage();
	}

	// Add fee if no fee has been updated OR invoiced fee already exists and
	// duplicates are allowed
	if (!feeUpdated && adjustedQty != 0 && (!invFeeFound || invFeeFound && pDuplicate == true)) {
		var assessFeeResult = aa.finance.createFeeItem(this.capId, fsched, fcode, fperiod, fqty);
		if (!assessFeeResult.getSuccess()) {
			throw "**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage();

		} else {
			logDebug("fee created");
			feeSeq = assessFeeResult.getOutput();

			if (fdesc != null && fdesc != "" && amount != null) {
				createFee = aa.finance.getFeeItemByPK(this.getCapID(), feeSeq).getOutput();
				logDebug("editin fee with pk=" + feeSeq);
				createFee.setFeeDescription(fdesc);
				createFee.setFee(amount);

				var editFeeResult = aa.finance.editFeeItem(createFee.getF4FeeItem());
				if (!editFeeResult.getSuccess()) {
					throw "**ERROR: editing fee items (" + fcode + "): " + editFeeResult.getErrorMessage();
				}
			}

		}
	} else {
		feeSeq = null;
	}

	return feeSeq;

};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.invoiceFees = function () {

	var feesRequest = aa.fee.getFeeItems(this.capId);
	if (!feesRequest.getSuccess()) {
		throw feesRequest.getErrorMessage();
	}
	var fees = feesRequest.getOutput();
	var invFeeSeqList = [];
	var invPaymentPeriodList = [];

	for (var x in fees) {
		thisFee = fees[x];
		if (thisFee.getFeeitemStatus().equals("NEW")) {
			invFeeSeqList.push(thisFee.getFeeSeqNbr());
			invPaymentPeriodList.push(thisFee.getPaymentPeriod());
			logDebug("Assessed fee " + thisFee.getFeeCod() + " found and tagged for invoicing");
		}
	}

	if (invFeeSeqList.length) {
		invoiceResult = aa.finance.createInvoice(this.capId, invFeeSeqList, invPaymentPeriodList);
		if (!invoiceResult.getSuccess()) {
			throw invoiceResult.getErrorMessage();
		}
	}

};

/**
 * make application editable
 * 
 * @param [bCompleteWorkflow=true]
 * @memberof Record
 */
Record.prototype.sendBack = function (bCompleteWorkflow) {
	var cap = aa.cap.getCap(this.capId).getOutput().getCapModel();

	cap.setCapClass("EDITABLE");
	aa.cap.editCapByPK(cap);

	if (bCompleteWorkflow == null || bCompleteWorkflow == true) {
		this.completeWorkflow();

	}
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.setExpirationDate = function (date) {
	this.setExpiration(date);
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.sendReportAsEmail = function (reportName, mailFrom, arrTo, reportParams, emailTemplate, emailParams) {
	logDebug("INSIDE SEND EMAIL");
	report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput();
	if (!report) {
		throw "Report with name [" + reportName + "] does not exist";
	}
	report.setModule(this.getCap().getCapModel().getModuleName());
	report.setCapId(this.capId);
	report.setReportParameters(reportParams);

	var permit = aa.reportManager.hasPermission(reportName, aa.getAuditID());
	logDebug("USER run Report=" + aa.getAuditID());
	if (!permit.getOutput().booleanValue()) {
		logDebug("ERROR:USER " + aa.getAuditID() + " has no permission");
		throw "You dont have permission to run report [" + reportName + "]";
	}
	logDebug("User " + aa.getAuditID() + " has right to execute [" + reportName + "], executing report");
	var reportResult = aa.reportManager.getReportResult(report);
	if (!reportResult.getSuccess()) {
		throw reportResult.getErrorMessage();
	}
	logDebug("Report [" + reportName + "] executed");
	reportResult = reportResult.getOutput();
	report.getReportInfoModel().setIsFrom("EMSE");

	var savetodisk = aa.reportManager.storeReportToDisk(reportResult);
	if (!savetodisk.getSuccess()) {
		throw savetodisk.getErrorMessage();
	}
	var rFile = savetodisk.getOutput();

	if (!rFile) {

		throw "Could not save report to disk";
	}
	logDebug("Report [" + reportName + "] saved to [" + rFile + "]");
	var rFiles = [rFile];

	for (var k in arrTo) {
		var res = aa.document.sendEmailByTemplateName(mailFrom, arrTo[k], "", emailTemplate, emailParams, rFiles);
		if (!res.getSuccess()) {
			throw res.getErrorMessage();
		}
		logDebug("Report [" + reportName + "] send to " + arrTo[k]);
	}

};

/**
 * return the number of status taken on a workflow task, matching the defined
 * parameters
 * 
 * @param {string} The workflow task name
 * @param {string} The workflow value
 * @memberof Record
 * @returns {Number} the history count of this status
 */
Record.prototype.getWorkflowTaskStatusHistoryCount = function (wfTask, wfStatus) {
	var Count = 0;
	var history = aa.workflow.getWorkflowHistory(this.capId, aa.util.newQueryFormat()).getOutput();
	for (var i = 0; i < history.length; i++) {
		if ((history[i].getTaskDescription() == wfTask || !wfTask) && history[i].getDisposition() == wfStatus) {
			Count++;
		}

	}
	return Count;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getWorkflowTaskComment = function (task, status) {
	var wfObj = aa.workflow.getTasks(this.capId).getOutput();
	var wfTaskComment = "";
	for (var i in wfObj) {
		fTask = wfObj[i];
		taskDescription = fTask.getTaskDescription();
		wfDisposition = fTask.getDisposition();
		taskItem = fTask.getTaskItem();
		if (taskDescription == task) {
			if (wfDisposition == status) {
				var cmt = taskItem.getDispositionComment();
				if (cmt) {
					wfTaskComment = cmt;
				}
			}
			break;
		}
	}
	return wfTaskComment;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.hasDocumentOfType = function (documentType) {
	var bret = false;
	var documentModels = aa.document.getDocumentListByEntity(this.capId, "CAP").getOutput().toArray();
	for (i = 0; i < documentModels.length; i++) {
		if (documentModels[i].getDocCategory() == documentType) {
			bret = true;
			break;
		}
	}
	return bret;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getInspection = function (id) {
	var ret = null;
	var r = aa.inspection.getInspections(this.capId);

	if (r.getSuccess()) {
		var inspArray = r.getOutput();

		for (var i in inspArray) {
			if (inspArray[i].getIdNumber() == id) {
				ret = inspArray[i];
				break;
			}
		}
	}
	return ret;
};

/**
 * get last inspection on the record, null if empty
 * 
 * @memberof Record
 * @returns {Number} Index of the last inspection record.
 */
Record.prototype.getLastInspection = function () {
	var ret = null;
	var r = aa.inspection.getInspections(this.capId);

	if (r.getSuccess()) {
		var maxId = -1;
		var maxInsp = null;
		var inspArray = r.getOutput();

		for (var i in inspArray) {
			var id = inspArray[i].getIdNumber();
			if (id > maxId) {
				maxId = id;
				maxInsp = inspArray[i];
			}
		}
		if (maxId >= 0) {
			ret = maxInsp;
		}
	} else {
		aa.debug("LIST INSP ERROR:", r.getErrorMessage());
	}
	return ret;
};

/**
 * Deletes the inspection.
 * 
 * @param {*} Required. InspectionModel.
 * @memberof Record
 */
Record.prototype.deleteInspection = function (inspectionModel) {
	var removeResult = null;
	var gsiBiz = aa.proxyInvoker.newInstance("com.accela.aa.inspection.inspection.InspectionBusiness").getOutput();
	if (gsiBiz) {
		try {
			removeResult = gsiBiz.removeInspection(inspectionModel);
		} catch (err) {

			throw (err);
		}
	}
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.deleteASIT = function (tableName) {
	var res = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName, this.capId, currentUserID);
	if (!res.getSuccess()) {
		throw "**WARNING: error removing ASI table " + tableName + " " + res.getErrorMessage();
	}
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.addASITRows = function (tableName, dataSet) {
	var asitData = this.getASIT(tableName, true);
	var data = [];
	for (var r in asitData) {
		var rRow = asitData[r];
		data.push(Record.toAsiTableValObj(rRow));
	}
	for (var s in dataSet) {
		var sRow = dataSet[s];
		data.push(sRow);
	}
	this.updateASIT(tableName, data);
};

/**
 * update ASIT with passed values.
 * 
 * @param {string}
 *            tableName - ASIT name to be updated
 * @param {asiTableValObj[][]}
 *            dataSet
 * @memberof Record
 */
Record.prototype.updateASIT = function (tableName, dataSet) {

	this.deleteASIT(tableName);

	var r = aa.appSpecificTableScript.getAppSpecificTableModel(this.capId, tableName);
	if (!r.getSuccess()) {
		throw "**WARNING: error retrieving app specific table " + tableName + ". ERROR= " + r.getErrorMessage();

	}
	var i = r.getOutput();
	var tableModel = i.getAppSpecificTableModel();
	var o = tableModel.getTableField();
	var u = tableModel.getReadonlyField();
	for (var thisrow in dataSet) {
		var a = tableModel.getColumns();
		var f = a.iterator();
		while (f.hasNext()) {
			var l = f.next();
			var dt = dataSet[thisrow][l.getColumnName()];
			var val;
			if (typeof dt == "object") {
				val = dataSet[thisrow][l.getColumnName()].fieldValue;
				if (val == null) {
					val = "";
				}
				o.add(val);
				u.add(null);
			} else {
				val = dataSet[thisrow][l.getColumnName()];
				if (val == null) {
					val = "";
				}
				o.add(val);
				u.add(null);
			}
		}
		tableModel.setTableField(o);
		tableModel.setReadonlyField(u);
	}
	var c = aa.appSpecificTableScript.editAppSpecificTableInfos(tableModel, this.capId, currentUserID);
	if (!c.getSuccess()) {
		throw "**WARNING: error adding record to ASI Table:  " + tableName + " " + c.getErrorMessage();
	}

	this.CACHEMAP.remove(tableName);
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.updateASITColumn = function (tableName, rowIndex, colName, newValue) {
	var asit = new ASIT(tableName);
	asit.modifyFieldValue(rowIndex, colName, newValue);
	return this.updateASITColumns(asit);
};

/**
 * Adds an address to the record
 * @param {JSON Object} REQUIRED. JSON object containing the address fields.
 * @memberof Record
 * @returns {number} Address sequence number.
 */
Record.prototype.addAddress = function (address) {
	var functTitle = ".addAddress: ";
	var addressModelResult = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.RefAddressModel");
	if (addressModelResult.getSuccess()) {
		var addressModel = addressModelResult.getOutput();

		addressModel.fullAddress = address.fullAddress || "";
		addressModel.addressLine1 = address.addressLine1 || "";
		addressModel.addressLine2 = address.addressLine2 || "";
		addressModel.county = address.county || "";
		addressModel.houseNumberStart = address.houseNumberStart || "";
		addressModel.houseNumberEnd = address.houseNumberEnd || "";
		addressModel.houseNumberAlphaStart = address.houseNumberAlphaStart || "";
		addressModel.houseNumberAlphaEnd = address.houseNumberAlphaEnd || "";
		addressModel.levelPrefix = address.levelPrefix || "";
		addressModel.levelNumberStart = address.levelNumberStart || "";
		addressModel.levelNumberEnd = address.levelNumberEnd || "";
		addressModel.validateFlag = address.validateFlag || "";
		addressModel.streetDirection = address.streetDirection || "";
		addressModel.streetPrefix = address.streetPrefix || "";
		addressModel.streetName = address.streetName || "";
		addressModel.streetSuffix = address.streetSuffix || "";
		addressModel.unitType = address.unitType || "";
		addressModel.unitStart = address.unitStart || "";
		addressModel.unitEnd = address.unitEnd || "";
		addressModel.streetSuffixdirection = address.streetSuffixdirection || "";
		addressModel.countryCode = address.countryCode || "";
		addressModel.city = address.city || "";
		addressModel.state = address.state || "";
		addressModel.zip = address.zip || "";
		addressModel.refAddressId = address.refAddressId || "";
		addressModel.auditStatus = "A";
		addressModel.auditID = "ADMIN";
		addressModel.auditDate = aa.util.now();
		addressModel.addressType = address.addressType || "";

		try {
			createAddressResult = aa.address.createAddressWithRefAddressModel(this.capId, addressModel);
		} catch (error) {
			logDebug(functTitle + "Error creating address: " + error.message);
			return "";
		}

		if (createAddressResult.getSuccess()) {
			var addressType = address.addressType || "";
			var updateAddressModel = aa.address.getAddressByPK(this.capId, createAddressResult.getOutput()).getOutput().getAddressModel();
			updateAddressModel.setAddressType(addressType);
			var updateResult = aa.address.editAddress(updateAddressModel);
			if (updateResult.getSuccess()) {
				logDebug(functTitle + "Updated address type to " + addressType);
			}
			else {
				logDebug(functTitle + "Error updating address type to " + addressType + ": " + updateResult.getErrorMessage());
			}
		} else {
			logDebug(functTitle + "Unable to add address to the record: " + address.fullAddress);
			return "";
		}
	}

	return createAddressResult.getOutput();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.updateASITFromArray = function (tableName, dataSet) {

	var asit = new ASIT(tableName);
	for (var x in dataSet) {
		var row = dataSet[x];
		for (var f in row) {
			var field = row[f];
			var name = field.columnName;
			var value = field.fieldValue;

			asit.modifyFieldValue(x, name, value);
		}

	}
	this.updateASITColumns(asit);

};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.updateASITColumns = function (asit) {

	if (!asit.getTableName) {
		throw "**ERROR: use ASIT object declared in INCLUDE_RECORD as a parameter";
	}
	if (asit.isEmpty()) {
		throw "**ERROR: : noting was sent to update";

	}
	var tableName = asit.getTableName();
	if (tableName == "") {
		throw "**ERROR: tableName cannot be Empty";
	}
	var tsm = aa.appSpecificTableScript.getAppSpecificTableModel(this.capId, tableName);

	if (!tsm.getSuccess()) {
		throw "**ERROR: error retrieving app specific table " + tableName + " " + tsm.getErrorMessage();

	}

	tsm = tsm.getOutput();
	tsm = tsm.getAppSpecificTableModel();
	var cells = tsm.getTableField();
	var NumberOfCells = cells.size();
	var newtableFields = aa.util.newArrayList();
	var fields = tsm.getTableFields().iterator();
	var columns = aa.util.newArrayList();
	var columnScripts = tsm.getColumns();
	var NumberOfColumns = columnScripts.size();
	var NumberOfRows = Math.ceil(NumberOfCells / NumberOfColumns);

	if (NumberOfColumns < 0) {
		throw "invalid number of columns";
	}
	// set columns
	var colNames = [];
	for (var iterator = columnScripts.iterator(); iterator.hasNext();) {
		var scriptModel = iterator.next();
		columns.add(scriptModel.getColumnModel());
		colNames.push(scriptModel.getColumnName());
	}
	tsm.setColumns(columns);
	// set table fields
	var editedMsg = "";
	var edited = 0;
	for (var ri = 0; ri < NumberOfRows; ri++) {

		for (var colIndex = 0; colIndex < NumberOfColumns; colIndex++) {
			var cname = colNames[colIndex];
			var rowinIndexDB = fields.next().getRowIndex();
			var val = cells.get((ri * NumberOfColumns) + colIndex);
			if (asit.hasField(ri, cname)) {
				var newValue = asit.getFieldValue(ri, cname);

				editedMsg += "** " + cname + "[" + ri + "]=" + newValue + ", was " + val + "\n";
				val = newValue;
				edited++;
			}

			if (val == null) {
				val = "";
			}

			var res = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableField", [val, columns.get(colIndex)]);

			if (!res.getSuccess()) {
				throw "field creationg failed: " + res.getErrorMessage();
			}

			field = res.getOutput();
			field.setFieldLabel(cname);
			field.setRowIndex(rowinIndexDB);
			newtableFields.add(field);
		}
	}

	if (edited != asit.fields.length) {
		throw "**ERROR: Could not edit all edited fields! only " + edited + "/" + asit.fields.length + " was edited:\n" + editedMsg;
	}

	tsm.setTableFields(newtableFields);

	var gsiBiz = aa.proxyInvoker.newInstance("com.accela.aa.aamain.appspectable.AppSpecificTableBusiness").getOutput();
	gsiBiz.editAppSpecificTableInfos(tsm, this.capId, aa.getAuditID());
	logDebug("Successfully edited ASI Table: " + tableName + ". " + edited + " Cell(s) was edited:\n" + editedMsg);
	return edited;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.scheduleInspection = function (inspectionGroup, checkListGroup, inspectionDate, autoAssign, units, inspector) {
	var inspModel = aa.inspection.getInspectionScriptModel().getOutput().getInspection();
	var activityModel = inspModel.getActivity();
	var inspTypeModel = Record.getInspectionTypeModel(inspectionGroup, checkListGroup);
	if (inspTypeModel == null) {
		throw "Inspection [" + inspectionGroup + "].[" + checkListGroup + "] is not defined in accela";
	}
	var inspSequenceNumber = inspTypeModel.getSequenceNumber();
	activityModel.setInspSequenceNumber(inspSequenceNumber);

	activityModel.setCapIDModel(this.capId);
	activityModel.setAutoAssign("Y");

	activityModel.setActivityType(checkListGroup);

	activityModel.setInspectionGroup(inspectionGroup);
	activityModel.setActivityDate(inspectionDate);
	if (units != null && units != "") {
		activityModel.setInspUnits(units);
	} else {
		activityModel.setInspUnits(inspTypeModel.getInspUnits());
	}

	var inspectorObj = null;
	if (inspector != null) {
		inspectorObj = inspector;
		logDebug("FORCING INSPECTOR:" + inspector.getUserID());
		activityModel.setSysUser(inspector);
	}
	if (autoAssign) {

		var atm = this.AutoScheduleInspectionInfo(inspModel, inspectionDate);
		if (!atm.isSuccessful()) {
			var inspInfo = "inspSequenceNumber=[" + inspSequenceNumber + "] inspectionGroup=[" + inspectionGroup + "] " + "checkListGroup=[" + checkListGroup + "] inspModel=[" +
				inspModel + "] inspectionDate=[" + inspectionDate + "]";
			throw "Auto Assign Failed of " + inspInfo + ": " + atm.getMessage();
		}
		if (inspector != null) {
			inspectorObj = inspector;
		} else {
			inspectorObj = atm.getInspector();
		}

		// logDebug("auto Assign to:" + inspectorObj.getFullName() + " of agency
		// ["
		// + inspectorObj.getServiceProviderCode() + "] at " +
		// atm.getScheduleDate());
		activityModel.setActivityDate(atm.getScheduleDate());
	}
	if (inspectorObj != null) {
		logDebug("**Scheduling inspection [" + inspectionGroup + "].[" + checkListGroup + "] for [" + inspectorObj.getUserID() + "]");
	}
	var schedRes = aa.inspection.scheduleInspection(inspModel, inspectorObj);

	if (!schedRes.getSuccess()) {
		throw "**ERROR: Failed to schedule inspection: " + schedRes.getErrorMessage();
	}
	var inspection = this.getInspection(schedRes.getOutput());
	if (inspection.getInspection().getInspector() != null) {
		logDebug("**INSPECTION SCHEDULED FOR[" + inspection.getInspection().getInspector().getUserID() + "]");
	}
	var ret = {};
	ret.inspection = inspection;
	ret.inspector = inspectorObj;

	return ret;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getCapStatus = function () {
	return this.getCap().getCapStatus();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getCap = function () {
	return aa.cap.getCap(this.getCapID()).getOutput();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.updateStatus = function (stat, cmt) {
	var updateStatusResult = aa.cap.updateAppStatus(this.getCapID(), "APPLICATION", stat, aa.date.getCurrentDate(), cmt, Record.getCurrentUserObj());
	if (!updateStatusResult.getSuccess()) {
		throw "**ERROR: application status update to " +
			stat +
			" was unsuccessful.  The reason is " +
			updateStatusResult.getErrorType() +
			":" +
			updateStatusResult.getErrorMessage();
	}
};

/**
 * Overrides the toString function
 * 
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.toString = function () {
	var stringVal = this.constructor.name + ' ID : [' + this.getCapID() + '], custom ID : [' + this.getCustomID() + '] ';
	return stringVal;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.editASI = function (group, name, value) {
	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(this.capId, name, value, group);

	if (!appSpecInfoResult.getSuccess()) {
		logDebug("WARNING: ASI " + group + "." + name + " was not updated." + appSpecInfoResult.getErrorMessage());
	}
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getAddressesCaps = function () {
	return aa.address.getAddressByCapId(this.capId).getOutput();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.updateDistrict = function (district) {
	var bupdated = false;
	if (district == "") {
		throw "district cannot be empty";
	}
	var vCapAddArr = this.getAddressesCaps();
	if (vCapAddArr.length == 0) {
		throw "Address not found on " + this.toString();
	}
	var address = vCapAddArr[0];
	var vDistArr = aa.address.getAssignedAddressDistrictForDaily(this.capId.ID1, this.capId.ID2, this.capId.ID3, address.addressId).getOutput();
	var isDisctrictDefined = false;
	for (var x in vDistArr) {
		if (vDistArr[x].getDistrict().equals(district)) {
			isDisctrictDefined = true;

			break;
		}
	}

	if (!isDisctrictDefined) {
		var res = aa.address.addAddressDistrictForDaily(this.capId.ID1, this.capId.ID2, this.capId.ID3, address.addressId, district);
		if (!res.getSuccess()) {
			throw "**Error Adding District " + res.getErrorMessage();

		} else {
			bupdated = true;
		}
	}
	return bupdated;
};

/**
 * get children records with specific type.
 * 
 * @param {string}
 *            pCapType - cap type to filter children, i.e.
 *            "GeneralServices/Financial/Fine Record/FINE"
 * @param {object}
 *            [returnClass=Record] - any class extends Record, to cast result
 *            array objects to it.
 * @memberof Record
 * @returns {Record[]|returnClass[]} - array of Record or of any other class
 *          extends Record.
 */
Record.prototype.getChildren = function (pCapType, returnClass) {
	returnClass = returnClass || Record;
	var retArray = [];
	var childCapIdSkip = null;
	var typeArray = pCapType.split("/");

	if (typeArray.length != 4) {

		throw ("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
	}
	var getCapResult = aa.cap.getChildByMasterID(this.capId);
	if (!getCapResult.getSuccess()) {
		var error = getCapResult.getErrorMessage();
		if (error == "") {
			return [];
		} else {
			throw ("**ERROR: getChildren returned an error: " + error);
		}
	}

	var childArray = getCapResult.getOutput();
	var childCapId;
	var capTypeStr = "";
	var childTypeArray;
	var isMatch;
	for (var xx in childArray) {
		childCapId = childArray[xx].getCapID();
		if (childCapIdSkip != null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) {
			continue;
		}

		capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();
		childTypeArray = capTypeStr.split("/");
		isMatch = true;
		for (var yy in childTypeArray) // looking for matching cap type
		{
			if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*")) {
				isMatch = false;
				continue;
			}
		}
		if (isMatch) {

			var childObj = Object.create(returnClass.prototype);
			returnClass.apply(childObj, [childCapId]);

			retArray.push(childObj);
		}

	}

	return retArray;
};

/**
 * get record parents with specific type and relationship.
 * 
 * @param {String}
 *            pAppType - application type of required parent objects.
 * @param {object}
 *            [returnClass=Record] - any class inherits Record, to cast result
 *            array objects to it.
 * @param {String}
 *            relationshipType=Relationship Type with the Parent Record which
 *            could have the below values ["Amendment"] in case the child record
 *            is an amendment record ["Renewal"] in case the child record is a
 *            renewal record ["AssoForm"] in case the child record is an
 *            associated form record ["R"] in case the child record is a regular
 *            related record, this is the default value [""] in other cases
 * @memberof Record
 * @returns {(Record[]|returnClass[])} - array of Record or of any other class
 *          inherits Record.
 */
Record.prototype.getParents = function (pAppType, returnClass, relationshipType) {
	returnClass = returnClass || Record;
	pAppType = pAppType || "";
	var resultArr = [];
	if (!relationshipType || relationshipType == "") {
		relationshipType = "R";
	}
	var recordParents = aa.cap.getProjectByChildCapID(this.getCapID(), relationshipType, "").getOutput();

	for (var record in recordParents) {
		var parentId = recordParents[record].getProjectID();
		var parentCapId = aa.cap.getCap(parentId).getOutput();

		if (pAppType != "" && !String(parentCapId.getCapType()).equalsIgnoreCase(pAppType)) {
			continue;
		}

		var parentObj = Object.create(returnClass.prototype);
		returnClass.apply(parentObj, [parentCapId.getCapID()]);

		resultArr.push(parentObj);
	}

	return resultArr;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.updateTaskAndHandleDisposition = function (taskName, taskStatus, taskComments) {
	try {

		var taskResult = aa.workflow.getTask(this.capId, taskName);

		if (!taskResult.getSuccess()) {
			throw "Error while getting task " + taskResult.getErrorMessage();
		}
		task = taskResult.getOutput();
		task.setDisposition(taskStatus);
		if (taskComments != null && taskComments != "") {
			task.setDispositionComment(taskComments);
		}
		var updateResult = aa.workflow.handleDisposition(task.getTaskItem(), this.capId);
		if (!updateResult.getSuccess()) {
			throw "Error while updating workflow " + updateResult.getErrorMessage();
		}

	} catch (e) {
		aa.debug("**EXCEPTION in Record.updateTaskAndHandleDisposition", e);
		throw "ERROR AT Record.updateTaskAndHandleDisposition: " + e;
	}
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getPriority = function () {
	var cdScriptObjResult = aa.cap.getCapDetail(this.capId).getOutput();
	var fitrCapDetailModel = cdScriptObjResult.getCapDetailModel();
	return fitrCapDetailModel.getPriority();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.setPriority = function (priority) {
	var cdScriptObjResult = aa.cap.getCapDetail(this.capId).getOutput();
	var fitrCapDetailModel = cdScriptObjResult.getCapDetailModel();
	fitrCapDetailModel.setPriority(priority);
	var r = aa.cap.editCapDetail(fitrCapDetailModel);
	if (!r.getSuccess()) {
		throw "**ERROR: Failed to get set priority for [" + this + "]: " + r.getErrorMessage();
	}
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.AutoScheduleInspectionInfo = function (inspModel, date) {
	inspModel.getActivity().setActivityDate(date);
	inspSchedDate = aa.util.formatDate(date, "MM/dd/yyyy");

	var assignSwitch = aa.proxyInvoker.newInstance("com.accela.aa.inspection.assign.model.AssignSwitch").getOutput();

	assignSwitch.setGetNextAvailableTime(true);
	assignSwitch.setOnlyAssignOnGivenDate(false);
	assignSwitch.setValidateCutOffTime(false);
	assignSwitch.setValidateScheduleNumOfDays(false);
	assignSwitch.setAutoAssignOnGivenDeptAndUser(true);
	assignSwitch.setCheckingCalendar(true);
	var assignService = aa.proxyInvoker.newInstance("com.accela.aa.inspection.assign.AssignInspectionBusiness").getOutput();

	var inspectionList = aa.util.newArrayList();
	inspectionList.add(inspModel);

	var specifiedDate = aa.proxyInvoker.newInstance("com.accela.aa.inspection.assign.model.SpecifiedDateTime").getOutput();
	specifiedDate.setDate(date);
	var result = assignService.autoAssign4AddOns(aa.getServiceProviderCode(), inspectionList, specifiedDate, assignSwitch);
	var assinfo = null;
	if (result.size() > 0) {
		var atm = result.get(0);
		assinfo = atm;

	}
	return assinfo;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.activateTask = function (task, desactivateCurrent) {
	var r = aa.workflow.getTaskItems(this.capId, "", "", null, null, null);
	if (!r.getSuccess()) {
		throw "**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage();
	}
	var s = r.getOutput();
	for (var i in s) {
		var wfTask = s[i];
		var stepNumber = wfTask.getStepNumber();
		if (wfTask.getTaskDescription().toUpperCase().equals(task.toUpperCase())) {
			aa.workflow.adjustTask(this.capId, stepNumber, "Y", "N", null, null);
		}
		if (desactivateCurrent && wfTask.getActiveFlag().equals("Y")) {
			var completeFlag = wfTask.getCompleteFlag();
			aa.workflow.adjustTask(this.capId, stepNumber, "N", completeFlag, null, null);
		}
	}
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getExpirationDate = function () {
	var date = null;
	var exp = aa.expiration.getLicensesByCapID(this.capId).getOutput();
	var scriptDate = exp.getExpDate();
	if (scriptDate) {
		date = Record.toDate(scriptDate);
	}
	return date;
};

/**
 * this function is called to delete a task and its sub process
 * 
 * @param taskName
 *            is the task Description
 * @memberof Record
 * @returns {Boolean}
 */
Record.prototype.deleteTaskAndItsSubProcess = function (taskName) {
	var o = aa.workflow.getTask(this.capId, taskName);
	if (!o.getSuccess()) {
		throw "**ERROR: Failed to get workflow object: " + o.getErrorMessage();
	}
	var t = o.getOutput();
	o = aa.workflow.removeSubProcess(t);
	if (!o.getSuccess()) {
		throw "**ERROR: Failed to remove workflow Task Sub Process object: " + o.getErrorMessage();
	}
	o = aa.workflow.removeTask(t);
	if (!o.getSuccess()) {
		throw "**ERROR: Failed to remove workflow Task object: " + o.getErrorMessage();
	}
	return true;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.completeWorkflow = function () {
	var r = aa.workflow.getTaskItems(this.capId, "", "", null, null, null);
	if (!r.getSuccess()) {
		throw "**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage();
	}
	var s = r.getOutput();
	for (var i in s) {
		var wfTask = s[i];
		var stepNumber = wfTask.getStepNumber();

		if (wfTask.getActiveFlag().equals("Y")) {
			var completeFlag = wfTask.getCompleteFlag();
			aa.workflow.adjustTask(this.capId, stepNumber, "N", completeFlag, null, null);
		}
	}
	logDebug("Complete Workflow called on " + this);
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.setCurrentWorkflowTaskStatus = function (taskStatus, comment) {
	var r = aa.workflow.getTaskItems(this.capId, "", "", null, null, null);
	if (!r.getSuccess()) {
		throw "**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage();
	}
	var s = r.getOutput();
	for (var i in s) {
		var wfTask = s[i];
		var stepNumber = wfTask.getStepNumber();

		if (wfTask.getActiveFlag().equals("Y")) {
			wfTask.setDisposition(taskStatus);
			wfTask.setSysUser(aa.person.getUser(aa.getAuditID()).getOutput());

			if (comment && comment != "") {
				wfTask.setDispositionComment(comment);

			}
			var updateResult = aa.workflow.handleDisposition(wfTask.getTaskItem(), this.getCapID());
			if (!updateResult.getSuccess()) {
				throw "Problem while updating workflow " + updateResult.getErrorMessage();
			}
		}
	}
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.hasActiveTask = function () {
	return this.getCurrentWorkflowTask() != null;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getCurrentWorkflowTask = function () {
	var ret = null;
	var r = aa.workflow.getTaskItems(this.capId, "", "", null, null, null);
	if (!r.getSuccess()) {
		throw "**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage();
	}
	var s = r.getOutput();
	for (var i in s) {
		var wfTask = s[i];
		var stepNumber = wfTask.getStepNumber();

		if (wfTask.getActiveFlag().equals("Y")) {
			ret = wfTask;
			break;
		}
	}
	return ret;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.isTaskActive = function (task) {
	var ret = false;

	var workflowResult = aa.workflow.getTaskItems(this.capId, task, "", null, null, "Y");
	if (!workflowResult.getSuccess()) {
		throw "**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage();
	}
	var wfObj = workflowResult.getOutput();

	for (var i in wfObj) {
		fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(task.toUpperCase())) {
			if (fTask.getActiveFlag().equals("Y")) {
				ret = true;
				break;
			}

		}
	}
	return ret;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.findSimilarRecords = function (arrASIFields, sameLicense) {
	var ret = [];
	if (arrASIFields.length > 0) {
		var firstField = Record.parseFieldName(arrASIFields[0]);
		var firstFieldValue = this.getASI(firstField.TABLENAME, firstField.NAME, "");
		var capType = this.getCapType().toString();
		logDebug(capType);
		var records = Record.getByAsi(firstField.NAME, firstFieldValue, capType);
		if (records.length > 0) {
			for (var x in records) {
				var rec = records[x];
				if (rec.getCapID().toString() + "" != this.capId.toString() + "") {
					var match = true;
					for (var i = 1; i < arrASIFields.length; i++) {
						var field = Record.parseFieldName(arrASIFields[i]);
						var curValue = this.getASI(field.TABLENAME, field.NAME, "");
						var recValue = rec.getASI(field.TABLENAME, field.NAME, "");
						match = curValue == recValue;

						if (!match) {
							break;
						}
					}

					if (match) {
						if (sameLicense) {
							var curLic = this.getLicense();
							var recLic = rec.getLicense();
							if (curLic != null && recLic != null) {
								if (curLic.getLicenseNbr() == recLic.getLicenseNbr()) {
									ret.push(rec);
								}
							} else {
								if (recLic == null && curLic == null) {
									ret.push(rec);
								}
							}

						} else {
							ret.push(rec);
						}
					}
				}
			}
		}
	}
	return ret;
};

/**
 * get license linked to current record.
 * @memberof Record
 * 
 * @returns {LicenseProfessionalScriptModel}
 */
Record.prototype.getLicense = function () {
	var lic = null;
	var arrLic = this.getLicenses();

	if (arrLic && arrLic.length > 0) {
		lic = arrLic[0];
	}
	return lic;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.getLicenses = function () {
	return aa.licenseProfessional.getLicensedProfessionalsByCapID(this.capId).getOutput();
};

/**
 * link specific record as parent to current record.
 * 
 * @param {(string|CapIDModel)}
 *            parentAltId - custom id or cap id for the parent record
 * @memberof Record
 */
Record.prototype.addParent = function (parentAltId) {
	var parentRecord = new Record(parentAltId);

	parentRecord.addChild(this.getCapID());
};

/**
 * link specific record as child to current record.
 * 
 * @param {(string|CapIDModel)}
 *            childAltId - custom id or cap id for the child record
 * @memberof Record
 */
Record.prototype.addChild = function (childAltId) {
	var childRecord = new Record(childAltId);

	var result = aa.cap.createAppHierarchy(this.getCapID(), childRecord.getCapID());

	if (!result.getSuccess()) {
		throw "Could not link [" + childRecord.getCustomID() + "] to Record [" + this.getCustomID() + "]";
	}
};

/**
 * add license to current record by number.
 * 
 * @param {string}
 *            licenseNo license number get related model.
 * @memberof Record
 * 
 * @returns {LicenseScriptModel}
 */
Record.prototype.addLicense = function (licenseNo) {
	var licenseScriptResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licenseNo);

	if (!licenseScriptResult.getSuccess() || licenseScriptResult.getOutput() == null) {
		throw "**ERROR: can not get license model with number [" + licenseNo + "]";
	}

	var licenseScriptModel = licenseScriptResult.getOutput()[0];
	var associateResult = aa.licenseScript.associateLpWithCap(this.getCapID(), licenseScriptModel);

	if (!associateResult.getSuccess()) {
		throw "**ERROR: can not link license model number [" + licenseNo + "] with cap id [" + this.getCustomID() + "]";
	}

	return licenseScriptModel;
};

/**
 * Copy ASI field value into another ASI field in same record, if source ASI
 * field has value.
 * 
 * @param {string}
 *            srcGroupName - source group name.
 * @param {string}
 *            srcFieldName - source field name.
 * @param {string}
 *            destGroupName - destination group name.
 * @param {string}
 *            destFieldName - destination field name.
 * @memberof Record
 * 
 * @returns {object} - Source ASI Field value or empty string.
 */
Record.prototype.copyASIValue = function (srcGroupName, srcFieldName, destGroupName, destFieldName) {
	if (srcGroupName == null || srcGroupName == "") {
		throw "source group name is required.";
	}

	if (srcFieldName == null || srcFieldName == "") {
		throw "source field name is required.";
	}

	if (destGroupName == null || destGroupName == "") {
		throw "destination group name is required.";
	}

	if (destFieldName == null || destFieldName == "") {
		throw "destination field name is required.";
	}

	var asiValue = this.getASI(srcGroupName, srcFieldName, "");
	if (asiValue != null && asiValue != "") {
		this.editASI(destGroupName, destFieldName, asiValue);
	}

	return asiValue;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.copyASIFromOtherRecord = function (rec, srcGroupName, srcFieldName, destGroupName, destFieldName) {
	if (srcGroupName == null || srcGroupName == "") {
		throw "source group name is required.";
	}

	if (srcFieldName == null || srcFieldName == "") {
		throw "source field name is required.";
	}

	if (destGroupName == null || destGroupName == "") {
		throw "destination group name is required.";
	}

	if (destFieldName == null || destFieldName == "") {
		throw "destination field name is required.";
	}

	var asiValue = rec.getASI(srcGroupName, srcFieldName, "");
	if (asiValue != null && asiValue != "") {
		this.editASI(destGroupName, destFieldName, asiValue);
	}

	return asiValue;
};

/**
 * assign work flow task to specific user.
 * 
 * @param {string}
 *            userId - user id to assign current task to him.
 * @memberof Record
 */
Record.prototype.assignCurrentWfTaskToUser = function (userId) {
	if (userId == null || userId == "" || userId == "null") {
		throw "user id can not be null";
	}

	var sysUserModelObj = aa.people.getSysUserByID(userId).getOutput();

	if (sysUserModelObj == null) {
		throw "No system user linked to user id [" + userId + "].";
	}

	var curTask = this.getCurrentWorkflowTask();

	curTask.setAssignedUser(sysUserModelObj);
	curTask.setAssignmentDate(aa.util.now());

	var res = aa.workflow.assignTask(curTask.getTaskItem());
	if (!res.getSuccess()) {
		throw "**ERROR: Could not assign task: " + res.getErrorMessage();
	}

	logDebug(" Assign Workflow task [" + curTask + "] to user [" + sysUserModelObj.getFullName() + "].");
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.prototype.setApplicationName = function (name) {
	var cap = this.getCap().getCapModel();
	cap.setSpecialText(name);
	aa.cap.editCapByPK(cap);
};

/**
 * set cap class value.
 * 
 * @param {string}
 *            capCalss - cap class to be set (ex. COMPLETE, EDITABLE, ...).
 * @memberof Record
 */
Record.prototype.setCapClass = function (capCalss) {
	var cap = aa.cap.getCap(this.capId).getOutput();
	var capModel = cap.getCapModel();
	capModel.setCapClass(capCalss);
	aa.cap.editCapByPK(capModel);
};

/**
 * copy contacts from specific record to current record.
 * 
 * @param {Record}
 *            srcRecord - source record to copy contacts from it.
 * @memberof Record
 * 
 */
Record.prototype.copyContacts = function (srcRecord) {
	if (srcRecord == null) {
		throw "Record.prototype.copyContacts :: source record can not be null";
	}

	var srcContacts = srcRecord.getContacts();

	for (var index in srcContacts) {

		var contact = srcContacts[index].getCapContactModel();

		var contactType = contact.getContactType();

		// FARAG review with Tony
		contact.setCapID(this.capId);
		var addedContact = aa.people.createCapContact(contact).getOutput();
		var peopleObj = contact.getPeople();
		peopleObj.setFlag("Y");
		contact.setPeople(peopleObj);
		var editResult = aa.people.editCapContact(contact);
		logDebug("Contact [" + contact.getLastName() + "] copied to " + this.toString());
	}
};

/**
 * Convert Custom Table to an array.
 * @param {*} Custom table to convert to an array.
 * @memberof Record
 * @returns {*} Array of table rows, each array item has an array of column values.
 */
Record.asitToArray = function (asit) {
	var tsmfldi = asit.getTableField().iterator();
	var tsmcoli = asit.getColumns();
	var rows = [];
	var numrows = 0;

	while (tsmfldi.hasNext()) {
		var row = {};
		for (var i = 0; i < tsmcoli.size() && tsmfldi.hasNext(); i++) // cycle

		{
			row[tsmcoli.get(i).getColumnName()] = tsmfldi.next();

		}
		rows.push(row);
		numrows++;
	}

	return rows;
};

/**
 * convert script date to Date object
 * 
 * @param {Date} Script date. [scriptDate]
 * @memberof Record
 * @returns {DateObject} Returns a Javascript date object or null if unable to format input into a Date object.
 */
Record.toDate = function (scriptDate) {
	var jsdate = null;
	if (scriptDate == null) {
		return null;
	}

	try {
		jsdate = new Date(scriptDate.getEpochMilliseconds());
	} catch (err) {
		logDebug("ERROR*** Record.toDate prototype function. Message: " + err.message);
	}
	return jsdate;
};

/**
 * construct array of asiTableValObj to represent ASIT row.
 * 
 * @param {Array}
 *            row - each row in this array must has the column name as property
 *            and column value as property value.
 * @param {HashMap}
 *            differentColNamesMap - map contains different column names to be
 *            mapped dynamically during constructing ASIT value object.
 * @memberof Record
 * @returns {asiTableValObj[]} - array of column name as property and
 *          asiTableValObj as property value.
 */
Record.toAsiTableValObj = function (row, differentColNamesMap) {
	var newRow = [];
	for (var field in row) {
		var newAsitFieldName = differentColNamesMap != null && differentColNamesMap.get(field) || field;
		var fieldValue = row[field] == null ? "" : String(row[field]);
		var f = new asiTableValObj(newAsitFieldName, fieldValue, "N");
		newRow[newAsitFieldName] = f;
	}
	return newRow;
};

/**
 * construct array of AIST rows valid to be passed updateASIT.
 * 
 * @param {Array}
 *            rows - each row in this array must be an array with the column
 *            name as property and column value as property value.
 * @memberof Record
 * @returns {asiTableValObj[][]} - array of rows each row is an array of column
 *          name as property and asiTableValObj as property value.
 */
Record.toAsiTableValObjArr = function (rows) {
	var newRows = [];

	for (var x in rows) {
		newRows.push(Record.toAsiTableValObj(rows[x]));
	}

	return newRows;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getCurrentUserObj = function () {
	var systemUserObjResult = aa.person.getUser(aa.getAuditID().toUpperCase());

	if (!systemUserObjResult.getSuccess()) {
		throw systemUserObjResult.getErrorMessage();
	}
	return systemUserObjResult.getOutput();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.listAll = function (recordType, capStatus, returnClass) {
	returnClass = returnClass || Record;
	var capList = [];
	var splited = recordType.split("/");
	if (splited.length != 4) {
		throw "invalid record type:" + recordType;
	}
	var emptyCm1 = aa.cap.getCapModel().getOutput();
	var emptyCt1 = emptyCm1.getCapType();
	emptyCt1.setGroup(splited[0]);
	emptyCt1.setType(splited[1]);
	emptyCt1.setSubType(splited[2]);
	emptyCt1.setCategory(splited[3]);
	emptyCm1.setCapStatus(capStatus);
	var vCapList;
	var vCapListResult = aa.cap.getCapIDListByCapModel(emptyCm1);
	if (!vCapListResult.getSuccess()) {
		throw vCapListResult.getErrorMessage();
	}
	vCapList = vCapListResult.getOutput();
	for (var thisCap in vCapList) {
		var cpid = aa.cap.getCapID(vCapList[thisCap].getCapID().getID1(), vCapList[thisCap].getCapID().getID2(), vCapList[thisCap].getCapID().getID3()).getOutput();
		var childObj = Object.create(returnClass.prototype);
		returnClass.apply(childObj, [cpid]);

		capList.push(childObj);
	}
	return capList;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getInspectionTypeModel = function (inspectionGroup, checklist) {
	var inspectionTypeModel = null;
	var inspectionTypesResult = aa.inspection.getInspectionType(inspectionGroup, checklist);
	if (inspectionTypesResult.getSuccess()) {
		var inspectionTypes = inspectionTypesResult.getOutput();
		if (inspectionTypes) {
			for (var i in inspectionTypes) {
				inspectionTypeModel = inspectionTypes[i];

				break;
			}
		}
	}
	return inspectionTypeModel;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getStandardChoices = function (name) {
	var outArr = aa.bizDomain.getBizDomain(name).getOutput().toArray();
	return outArr;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberof Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getLookupVal = function (sControl, sValue) {
	var desc = "";
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(sControl, sValue);
	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		desc = "" + bizDomScriptObj.getDescription();
	}
	return desc;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.createNew = function (type, desc) {
	if (desc == null) {
		desc = "";
	}
	if (type == null) {
		throw "Record Type is Not defined";
	}
	var args = type.split("/");

	if (args.length != 4) {
		throw "invalid Record type, must contains 4 /";
	}
	var grp = args[0];
	var typ = args[1];
	var stype = args[2];
	var cat = args[3];
	var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (!appCreateResult.getSuccess()) {
		throw "**ERROR: Creating App: " + appCreateResult.getErrorMessage();
	}
	var newId = appCreateResult.getOutput();
	var record = new Record(newId);
	record.setCapClass("COMPLETE");
	// create Detail Record
	var capDetailModel = aa.cap.getCapDetail(newId).getOutput();
	if (capDetailModel == null) {
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);
	}
	return newId;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.createNewWithAltID = function (type, appName, altId) {
	if (appName == null) {
		appName = "";
	}
	if (type == null) {
		throw "Record Type is Not defined";
	}
	var args = type.split("/");

	if (args.length != 4) {
		throw "invalid Record type, must contains 4 /";
	}
	var grp = args[0];
	var typ = args[1];
	var stype = args[2];
	var cat = args[3];
	var newAppTyp = aa.cap.getCapTypeModel().getOutput();

	newAppTyp.setGroup(grp);
	newAppTyp.setType(typ);
	newAppTyp.setSubType(stype);
	newAppTyp.setCategory(cat);
	var serviceProviderCode = aa.getServiceProviderCode();
	newAppTyp.setServiceProviderCode(serviceProviderCode);
	newAppTyp.setAuditStatus("A");

	var newAppModel = aa.cap.getCapModel().getOutput();
	newAppModel.setCapType(newAppTyp);
	newAppModel.setSpecialText(appName);

	var capServer = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapBusiness").getOutput();
	newAppModel = capServer.createCap(serviceProviderCode, currentUserID, newAppModel, altId, false);
	return newAppModel.getCapID();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getByLicense = function (licenseNbr, type) {
	var lic = aa.licenseProfessional.getLicenseProfessionScriptModel().getOutput();
	lic.setLicenseNbr(licenseNbr);
	var vLPres = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licenseNbr);
	if (!vLPres.getSuccess()) {
		throw vLPres.getErrorMessage();
	}

	if (vLPres.getOutput() == null) {
		throw "**ERROR:getRecordByLicense: License does not exists";
	}
	var seqNumber = vLPres.getOutput()[0].getLicSeqNbr();
	lic = lic.getLicenseProfessionalModel();
	lic.setLicSeqNbr(seqNumber);

	var ret = [];
	var ata = type.split("/");
	if (ata.length != 4) {

		throw "**ERROR:getRecordByLicense: The following Application Type String is incorrectly formatted: " + type;
	}

	var capTypeModel = aa.cap.getCapTypeModel().getOutput();
	capTypeModel.setServiceProviderCode(aa.getServiceProviderCode());
	capTypeModel.setGroup(ata[0]);
	capTypeModel.setType(ata[1]);
	capTypeModel.setSubType(ata[2]);
	capTypeModel.setCategory(ata[3]);

	var capModel = aa.cap.getCapModel().getOutput();
	capModel.setCapType(capTypeModel);
	capModel.setLicenseProfessionalModel(lic);

	var capCollectionResult = aa.cap.getCapIDListByCapModel(capModel);

	if (!capCollectionResult.getSuccess()) {
		throw "Could not get capIds for Licensed Professional in getCapIDListByCapModel()";
	}
	var capCollection = capCollectionResult.getOutput();
	for (var cap in capCollection) {
		var myCap = capCollection[cap].getCapID();
		var rec = new Record(myCap);

		ret.push(rec);

	}

	return ret;
};

/**
 * get records of specific type which has ASI field with specific value.
 * 
 * @param {string} ASI field name [ASIName]
 * @param {(string|Date)} ASI field value to filter records. [ASIValue]
 * @param {string} record type [type]
 * @memberof Record
 * @returns {Record[]}
 */
Record.getByAsi = function (ASIName, ASIValue, type) {
	var ret = [];
	var ata = type.split("/");
	if (ata.length != 4) {

		throw "**ERROR: getAppIdByASI in appMatch.  The following Application Type String is incorrectly formatted: " + type;
	}
	if (ASIValue instanceof Date) {
		ASIValue = formatDate(ASIValue, "MM/dd/yyyy");
	}
	var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField(ASIName, ASIValue);
	if (!getCapResult.getSuccess()) {
		throw "**ERROR: getting caps by app type: " + getCapResult.getErrorMessage();
	}

	var apsArray = getCapResult.getOutput();
	for (var aps in apsArray) {
		myCapRes = aa.cap.getCap(apsArray[aps].getCapID());
		if (!myCapRes.getSuccess()) {
			var error = myCapRes.getErrorMessage();
			if (error == "CapByPKNotFoundException") {
				continue;
			} else {
				throw "**ERROR: getting cap for capID [" + apsArray[aps].getCapID() + "]: " + error;
			}

		}
		myCap = myCapRes.getOutput();
		myAppTypeString = myCap.getCapType().toString();
		myAppTypeArray = myAppTypeString.split("/");

		isMatch = true;
		for (var xx in ata) {
			if (!ata[xx].equalsIgnoreCase(myAppTypeArray[xx]) && !ata[xx].equals("*")) {
				isMatch = false;
			}
		}

		if (isMatch) {
			var debugMsg = "getAppIdByName(" + ASIName + "," + ASIValue + "," + type + ") Returns " + apsArray[aps].getCapID().toString();
			aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), debugMsg);

			ret.push(new Record(apsArray[aps].getCapID()));
		}
	}
	return ret;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getByAppName = function (recordType, appName, capStatus, returnClass) {
	returnClass = returnClass || Record;
	var capBusiness = com.accela.aa.emse.dom.service.CachedService.getInstance().getCapService();

	var capList = [];
	var capModel = aa.cap.getCapModel().getOutput();
	if (recordType) {
		var splited = recordType.split("/");
		if (splited.length != 4) {
			throw "invalid record type:" + recordType;
		}

		capModel.getCapType().setGroup(splited[0]);
		capModel.getCapType().setType(splited[1]);
		capModel.getCapType().setSubType(splited[2]);
		capModel.getCapType().setCategory(splited[3]);
	}
	if (appName) {
		capModel.setSpecialText(appName);
	}

	if (capStatus) {
		capModel.setCapStatus(capStatus);
	}

	var response = capBusiness.getCapListByCollection(aa.getServiceProviderCode(), capModel, null, null, null, null, aa.util.newQueryFormat(), null, null, null, null, null);
	var res = response.getResult().toArray();
	for (var x in res) {
		var cap = res[x];

		var childObj = Object.create(returnClass.prototype);
		returnClass.apply(childObj, [cap.getCapID()]);

		capList.push(childObj);
	}

	return capList;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.parseFieldName = function (fieldfullname) {
	var ret = {};

	if (fieldfullname.indexOf("::" > 0)) {
		var parts = fieldfullname.split("::");
		if (parts.length != 3) {
			throw "invalid field full name";
		}

		ret.TYPE = parts[0];
		ret.TABLENAME = parts[1];
		ret.NAME = parts[2];
	} else {
		ret.TYPE = "";
		ret.TABLENAME = "";
		ret.NAME = fieldfullname;
	}

	return ret;
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getProxyClass = function (clazz) {
	return aa.proxyInvoker.newInstance(clazz).getOutput();
};

/**
 * [[DESCRIPTION]]
 * @param {*} [[OPTIONAL/REQUIRED]]. [[DESCRIPTION]].
 * @memberOf Record
 * @returns {*} [[DESCRIPTION]].
 */
Record.getDao = function (className) {
	var itemDaoClass = java.lang.Class.forName(className);
	return com.accela.aa.util.ObjectFactory.getDAOObject(itemDaoClass);
};

/**
 * [[DESCRIPTION]]
 * 
 * @param {any} tableName
 * @memberof Record
 * @returns {*} Returns  
 */
function ASIT(tableName) {
	this.tableName = tableName;
	this.fields = [];
	this.modifyFieldValue = function (row, name, value) {
		var field = {};
		field.row = row;
		field.name = name;
		if (value == null) {
			value = "";
		}
		field.value = value;
		this.fields.push(field);
	};
	this.getFieldValue = function (row, name) {
		var ret = null;
		for (var x in this.fields) {
			var f = this.fields[x];
			if (f.row == row && f.name.toLowerCase() == name.toLowerCase()) {
				ret = f.value + "";
				break;
			}
		}
		return ret;
	};
	this.hasField = function (row, name) {
		var ret = false;
		for (var x in this.fields) {
			var f = this.fields[x];
			if (f.row == row && f.name.toLowerCase() == name.toLowerCase()) {
				ret = true;
				break;
			}
		}
		return ret;
	};
	this.getTableName = function () {
		return this.tableName;
	};
	this.isEmpty = function () {
		return this.fields.length == 0;
	};
}

/**
 * get localized message description of specific message key.
 * 
 * @param {String} message key to get related description
 * @memberof Record
 * @returns {String} localized message description.
 */
Record.translate = function (msgKey) {
	return aa.messageResources.getLocalMessage(msgKey);
};

/**
 * get ASIT from session, before submitted to data base.
 * 
 * @param {String} ASIT name.
 * @memberof Record
 * @returns {Array} array of specific ASIT rows.
 */
Record.getASITableBefore = function (asitName) {
	var gm = aa.env.getValue("AppSpecificTableGroupModel");
	var gmItem = gm;
	if (gm != null && typeof gm.size != "undefined" && gm.size() > 0) {
		gmItem = gm.get(0);
	} else {
		gmItem = gm;
	}

	if (null != gmItem && gmItem != "") {
		var ta = gmItem.getTablesMap().values();
		var tai = ta.iterator();
		while (tai.hasNext()) {
			var tsm = tai.next();
			if (tsm.rowIndex.isEmpty())
				continue;
			var tempObject = [];
			var tempArray = [];
			var tn = tsm.getTableName();
			var numrows = 0;
			if (!tsm.rowIndex.isEmpty()) {
				var tsmfldi = tsm.getTableField().iterator();
				var tsmcoli = tsm.getColumns().iterator();
				numrows = 1;
				while (tsmfldi.hasNext()) {
					if (!tsmcoli.hasNext()) {
						tsmcoli = tsm.getColumns().iterator();
						tempArray.push(tempObject);
						tempObject = [];
						numrows++;
					}
					var tcol = tsmcoli.next();
					var tval = tsmfldi.next();
					var readOnly = "N";
					var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
					tempObject[tcol.getColumnName()] = fieldInfo;
				}

				tempArray.push(tempObject);

				if (tn == asitName) {
					return tempArray;
				} else {
					return null;
				}
			}
		}
	}
};

/**
 * returns a record instance for the Cap ID string
 * 
 * @param {string} capIdStr - cap ID in YYxxx-00000-xxxxx format
 * @memberof Record
 * @returns {Record} the record instance
 */
Record.getByCapID = function (capIdStr) {
	var capIdArr = capIdStr.split("-");

	if (capIdArr.length != 3) {
		throw "The Cap ID " + capIdStr + " format is invalid";
	}

	var capId = aa.cap.getCapID(capIdArr[0], capIdArr[1], capIdArr[2]);

	if (!capId.getSuccess()) {
		throw capId.getErrorMessage();
	}

	return new Record(capId.getOutput());
};

/**
 * Get Communication Helper.
 * @memberof Record
 * @returns {CommunicationHelper} - CommunicationHelper instance.
 */
Record.getCommunicationHelper = function () {
	return aa.proxyInvoker.newInstance("com.accela.aa.communication.CommunicationHelper").getOutput();
};

/**
 * delete record
 * 
 * @param {CapIDModel} capId - cap id.
 * @memberof Record
 */
Record.deleteRecord = function (capId) {
	aa.cap.removeRecord(capId);
};

/**
 * [[DESCRIPTION]]
 * 
 * @deprecated please use System.require
 * @param {*} 
 * @memberof Record
 */
Record.require = function (serviceName) {
	System.require(serviceName);
};

if (typeof logDebug === "undefined") {
	logDebug = function (dstr) {
		vLevel = 1;
		if (typeof showDebug === "undefined") {
			showDebug = false;
		}
		if (typeof debug === "undefined") {
			debug = "";
		}
		if (typeof br === "undefined") {
			br = "<br/>";
		}
		if (arguments.length > 1)
			vLevel = arguments[1];
		if ((showDebug & vLevel) == vLevel || vLevel == 1)
			debug += dstr + br;
		if ((showDebug & vLevel) == vLevel)
			aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
	};
}
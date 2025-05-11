/**
 * STDBASE_BATCH_LICENSE_ABOUT_TO_EXPIRE
 * This is the first step of the batch renewal process
 * 	 - searches for records as configured in the CONF_LIC_RENEWAL > searchCriteria JSON
 * 	 - updates each license record as defined int the CONF_LIC_RENEWAL_NOTIFICATION JSON configuration
 * DEPENDENCIES:
- THIS BATCH SCRIPT
- BATCH CONFIGURATION SCRIPT(S): CONF_LIC_RENEWAL
- BATCH RESULT NOTIFICATION TEMPLATE:  BATCH_LICENSE_RENEWAL_RESULTS
- ASI SUBGROUP: RENEWAL INFO (NEXT NOTIFICATION, NEXT NOTIFICATION DATE)
	** Update the Next Notification DDL values to match the notification frequencies in
		CONF_LIC_RENEWAL
- SET TYPE: RENEWAL
- SET STATUSES: Open, Ready for Mailing, Completed
- Set Saved Search: Renewal Mass Mailer - Open, Renewal Mass Mailer - Ready for Mailing, Renewal Mass Mailer - Completed
 */

//aa.env.setValue("confScriptName", "CONF_MARIJUANA_LICENSE_EXPIRATION_SEARCH");
var confScriptName = aa.env.getValue("confScriptName");

var batchProcess = "License About to Expire"
var publicUser = "";
var useAppSpecificGroupName = false;
var currentUserID = aa.getAuditID();
aa.env.setValue("CurrentUserID", "ADMIN");
if (currentUserID != null) {
	systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
}
var br = "\n";
var startDate = new Date();
var startTime = startDate.getTime();
emailText = "";

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

eval(getScriptText("INCLUDES_RECORD"));
eval(getScriptText("INCLUDES_BASEBATCH"));

Batch.prototype.execute = function() {
	try {
		//execute main()
		if (!confScriptName) {
			logDebug("ERROR: Missing required batch parameter confScriptName: " + confScriptName);
			return false;
		}
		processExpiration(confScriptName);

	} catch (e) {
		this.log("ERROR: ", e + "");
	}

}
//logDebug("run()")	
run();

// end user code
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", message);
if (showDebug)
	aa.env.setValue("ScriptReturnMessage", debug);

/**
 * processExpiration
 * 
 * @param {*} confScriptName 
 */
function processExpiration(confSearchScriptName) {

	try {

		// get configuration
		var searchRuleConf = "aboutToExpireSearchRules";
		logDebug("Using Search Rule: " + searchRuleConf + " in " + confSearchScriptName);
		var cfgJsonStr = getScriptText(confSearchScriptName);
		var searchRules = JSON.parse(cfgJsonStr)
		if (!searchRules) {
			logDebug("ERROR: Search rules not found. Script Name: " + confSearchScriptName);
			return false;
		}

		var ruleSet = searchRules[searchRuleConf];
		var thisSearchRule = ruleSet["searchCriteria"];

		//prepare search rule parameters
		var searchByRecordGroup = thisSearchRule.searchByRecordGroup;
		var searchByRecordType = thisSearchRule.searchByRecordType;
		var searchByRecordSubType = thisSearchRule.searchByRecordSubType;
		var searchByRecordCategory = thisSearchRule.searchByRecordCategory;
		var searchStatus = thisSearchRule.searchStatus;
		var fromDate = thisSearchRule.searchByFromDate;
		var toDate = thisSearchRule.searchByToDate;
		var lookAheadDays = 0;
		var expiringInterval = thisSearchRule.expiringInterval;
		var searchDays = thisSearchRule.searchByDaysOut;
		var notificationConfScript = thisSearchRule.notificationConfScript;

		/**
		 * TO DO:
		 * 		1) Ability to disable this logging
		 */
		logDebug("searchByRecordGroup: " + searchByRecordGroup);
		logDebug("searchByRecordType: " + searchByRecordType);
		logDebug("searchByRecordSubType: " + searchByRecordSubType);
		logDebug("searchByRecordCategory: " + searchByRecordCategory);
		logDebug("searchStatus: " + searchStatus);
		logDebug("fromDate: " + fromDate);
		logDebug("toDate: " + toDate);
		logDebug("searchDays: " + searchDays);
		logDebug("expiringInterval: " + expiringInterval);
		logDebug("notificationConfScript: " + notificationConfScript);

		/**
		 * TO DO: 
		 * 		1) Add validation for params from rules
		 */

		//to use expiringInterval, all date related parameters should be unset (false, empty, null)
		if ((fromDate == null || fromDate == "" || !fromDate || fromDate.length < 10) && (toDate == null || toDate == "" || !toDate || toDate.length < 10)
				&& (searchDays == null || searchDays == "" || !searchDays || parseInt(searchDays) < 0)) {

			logDebug("INFO: obtain dates using expiringInterval");

			if (expiringInterval == null || !expiringInterval || expiringInterval == "") {
				logDebug("ERROR: All date related search parameters are inactive or not set");
				return false;
			}

			//convert "this month" --> "thismonth" [cover more user input possibilities]
			expiringInterval = expiringInterval.replace(" ", "");

			//calculate fromDate, toDate based on selected interval
			var dateRange = getIntervalDates(expiringInterval);
			if (dateRange == null) {
				logDebug("ERROR: invalid expiringInterval=" + expiringInterval);
				return false;
			} else {
				fromDate = dateRange[0];
				toDate = dateRange[1];
			}
		} else {

			logDebug("INFO: obtain dates using fromDate, toDate, searchDays");

			// calculate from and to dates if searchDays is used
			if (!fromDate || fromDate.length < 10) // no "from" date, assume today + number of days to look ahead
				fromDate = dateAdd(null, parseInt(lookAheadDays))

			if (!toDate || toDate.length < 10) { // no "to" date, assume today + number of look ahead days + span
				toDate = dateAdd(null, parseInt(lookAheadDays) + parseInt(searchDays));
			}
		}//expiringInterval not used

		logDebug("Date Range -- fromDate: " + fromDate + ", toDate: " + toDate);

		/**
		 * TO DO:
		 * 		1) CHANGE EMSE API WHEN NEW API IS AVAILABLE WITH CAP MODEL
		 * 		2) BUILD CAP MODEL TO USE IN SEARCH: use searchByRecord_ to build capModel
		 *
		 * 
		 * EXAMPLE:
		 * 
		 * 		var searchResult = aa.expiration.getLicensesByDateAndModel(capModel, searchStatus, fromDate, toDate);
		 */

		// execute record search
		var searchResult = aa.expiration.getLicensesByDate(searchStatus, fromDate, toDate);
		if (searchResult.getSuccess()) {
			searchResultArray = searchResult.getOutput();
			logDebug("Processing " + searchResultArray.length + " expiration records");
		} else {
			logDebug("ERROR: Getting Expirations, reason is: " + searchResult.getErrorType() + ":" + searchResult.getErrorMessage());
			return false
		}

		// if records were found, execute processBatchNotification
		if (searchResultArray.length > 0) {

			// get JSON notification rules script
			var cfgNoticeJsonStr = getScriptText(notificationConfScript);
			var noticeRules = JSON.parse(cfgNoticeJsonStr)
			if (!noticeRules) {
				logDebug("ERROR: Cannot find configuration rules for notifications. Script: " + notificationConfScript);
				return false;
			}

			processBatchNotification(searchResultArray, thisSearchRule, noticeRules);
		}

	} catch (e) {
		logDebug("ERROR:" + e + "");
	}
}

/**
 * calculate start and end date based on interval type
 * @param interval type to calculate dates based on,<br/>**Available Types: this month, next month, this quarter, next quarter<br/>
 * **Interval Type is case insensitive and spaces are ignored.<br/><b>ex</b>, thismonth, this month, ThisMonth THISMONTH are all valid.
 * @returns {Array} of Strings (range): range[0] is startDate, range[1] is endDate<br/>Or null if anything went wrong
 */
function getIntervalDates(interval) {
	var now = aa.date.getCurrentDate();
	var nowDay = now.getDayOfMonth();
	var nowMonth = now.getMonth();
	var nowYear = now.getYear();

	var tmpFromDate = null;
	var tmpToDate = null;

	if (interval.equalsIgnoreCase("thismonth")) {
		tmpFromDate = leftPadding(nowMonth) + "/01/" + nowYear;
		tmpToDate = leftPadding(nowMonth) + "/" + getDaysInMonth(nowMonth, nowYear) + "/" + nowYear;
	} else if (interval.equalsIgnoreCase("nextmonth")) {
		var theMonth = null;
		var theYear = null;
		if (nowMonth != 12) {
			theMonth = 1 + nowMonth;
			theYear = nowYear;
		} else {
			theMonth = 1;
			theYear = 1 + nowYear;
		}
		tmpFromDate = leftPadding(theMonth) + "/01/" + theYear;
		tmpToDate = leftPadding(theMonth) + "/" + getDaysInMonth(theMonth, theYear) + "/" + theYear;
	} else if (interval.equalsIgnoreCase("thisquarter") || interval.equalsIgnoreCase("nextquarter")) {
		var nextQuarter = interval.equalsIgnoreCase("nextquarter");
		return calculateQuarterDateRange(nowMonth, nowYear, nextQuarter);
	} else {
		return null;
	}

	return [ tmpFromDate, tmpToDate ];
}

/**
 * calculate number of days in the month
 * @param month
 * @param year
 * @returns number of days in month
 */
function getDaysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

/**
 * adds 0 padding to left of value (padded value will be 2 digits)
 * @param value
 * @returns padded value
 */
function leftPadding(value) {
	if (parseInt(value) < 10) {
		return "0" + value;
	} else {
		return value;
	}
}

/**
 * calculates which quarter the month falls in, then calculate start and end dates of the quarter
 * @param month
 * @param year
 * @param nextQuarter {boolean} if true, then next quarter is calculated
 * @returns {Array} of Strings (range): range[0] is startDate, range[1] is endDate<br/>Or null if anything went wrong
 */
function calculateQuarterDateRange(month, year, nextQuarter) {
	var q = parseInt(month) / 3;
	q = Math.ceil(q);
	if (nextQuarter && q == 4) {
		//Last quarter in the year, next quarter will be 1st quarter of nextYear
		q = 1
		year = year + 1;
	} else if (nextQuarter && q < 4) {
		++q;
	}

	if (q == 1) {
		return [ "01/01/" + year, "31/03/" + year ];
	} else if (q == 2) {
		return [ "01/04/" + year, "30/06/" + year ];
	} else if (q == 3) {
		return [ "01/07/" + year, "30/09/" + year ];
	} else if (q == 4) {
		return [ "01/10/" + year, "31/12/" + year ];
	} else {
		return null;
	}
}
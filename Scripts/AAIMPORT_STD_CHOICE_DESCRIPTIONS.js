/*

Update all standard choice with descriptions to help understand the
use of each system switch, and tags organize them by features.

This script will replace all existing "SystemSwitch" standard choice descriptions.

It will NOT update EMSE Standard Choice control strings or SharedDropDown lists.

If you want the script to skip specific standard choices, enter a hash tag into the
standard choice description. This script will skip any standard choices that
have a hash tag in the description.

*/

myUserId="ADMIN";
showMessage=true;
showDebug = 1;
aa.env.setValue("CurrentUserID",myUserId);
var SCRIPT_VERSION = 3.0; eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS")); eval(getScriptText("INCLUDES_ACCELA_GLOBALS")); function getScriptText(vScriptName){	vScriptName = vScriptName.toUpperCase();	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);	return emseScript.getScriptText() + ""; }

// custom code:

try {

	//JSON string containing standard choices and tags
	var importJSON = getDescJSON();

	// Create header for the debug and message output
	message="<br>======================================<br>";
	message+="EXCEPTIONS";
	message+="<br>======================================<br>";
	debug="<br>======================================<br>";
	debug+="DEBUG LOG";
	debug+="<br>======================================<br>";

	//use bizDomainService to get and edit standard choice descriptions
	var bizDomainService = aa.proxyInvoker.newInstance("com.accela.aa.aamain.systemConfig.BizDomainBusiness").getOutput();

	var rowCount = 0;
	var exceptionCount = 0;
	var skipCount = 0;
	var successCount = 0;

	for (var i in importJSON) {

		// row counter for testing
		rowCount++;
		//if(rowCount>10) { break; };

		row = importJSON[i];
		stdChoiceName = row.StdChoice;
		stdChoiceDesc = row.Desc;
		logDebug("<br>---------------------------------------------------------------------------")
		logDebug("Processing Standard Choice: " + stdChoiceName);

		var rBizDomains = bizDomainService.getRBizDomainByPkAndStatus(servProvCode,stdChoiceName,null);

		// if the standard choice does not exist, log exception, else update description
		if(rBizDomains==null) {
			//result of get biz domain was null
			logDebug("Exception: "+ stdChoiceName + " does not exist in your agency.");
			logMessage(stdChoiceName + ", Exception: does not exist in your agency.");
			exceptionCount++;
			continue;
		}
		else {

			// interrogate the description for existing tags
			thisDesc = "" + rBizDomains.getDescription();
			if (thisDesc.indexOf("#") > -1) {
				logDebug("Skipping: " + stdChoiceName + " has already been tagged.")
				skipCount++;
				continue;
			}

			/**************************
			// Considering to do: code to add tags without replacing the entire description
			// check the existing desc length to ensure there is enough space for tags
			thisDescChars = thisDesc.length();
			tagsLength = stdChoiceTags.length;
			totalChars = thisDescChars + tagsLength;
			//logDebug("Length comparison: Desc Length=" + thisDescChars + ", Tags Length=" + tagsLength + ", TOTAL: " + totalChars);

			// create exception list for descriptions that don't have room for the hashtag
			if(totalChars > 254){
				logDebug("Exception: " + stdChoiceName + " could not be tagged because the description is too long (255 Max). Total length with tags: " + totalChars);
				logMessage("Exception: " + stdChoiceName + " could not be tagged because the description is too long (255 Max). Total length with tags: " + totalChars);
				continue;
			}
			//add tags to the description and save
			var newDescription = thisDesc + " " + stdChoiceTags;
			*****************************/

			// Replace description with the new, tagged description
			var newDescription = stdChoiceDesc;
			logDebug("New Description: " + newDescription);
			rBizDomains.setDescription(newDescription);
			var saveBizDomain = bizDomainService.editRBizDomain(rBizDomains);
			logDebug("Successfully updated standard choice description for: " + stdChoiceName);
			successCount++;

		}
	}

	//add the exception messages to the end of the debug.
	var stats="<br>======================================<br>";
	stats+="STATS";
	stats+="<br>======================================<br>";	stats += "<br>Total Processed: " + rowCount;
	stats += "<br>Total Updated: " + successCount;
	stats += "<br>Total Skipped: " + skipCount;
	stats += "<br>Total Exceptions: " + exceptionCount;
	stats += "<br><br>**See the exception list at the bottom of the debug log.<br>"

	debug=stats+debug+message;
	//debug+=message;


}
catch(err){
	logDebug(err);
}


/***********************************************
Show the debug window
***********************************************/
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);


function exploreObject (objExplore) {

	logDebug("Methods:")
	for (x in objExplore) {
		if (typeof(objExplore[x]) == "function") {
			logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
			logDebug("   " + objExplore[x] + "<br>");
		}
	}

	logDebug("");
	logDebug("Properties:")
	for (x in objExplore) {
		if (typeof(objExplore[x]) != "function") logDebug("  <b> " + x + ": </b> " + objExplore[x]);
	}

}

function getDescJSON () {
	descJSON = [{"StdChoice":"ALLOW_PAYMENT_OF_FUTURE_FEES","Desc":"This Standard Choice controls the Apply to Future Invoice check box which allows you to transfer any unchecked payments on the Generate Receipt page to a future invoice #FeesPayments"},
{"StdChoice":"ALLOW_STANDARD_DUPLICATE_FILENAME","Desc":"This standard choice allows a client to turn off the duplicate name validation for external EDMS file uploading. If this standard choice is not configured, duplicate filenames of uploaded files are not permitted #EDMS"},
{"StdChoice":"APO_CHECK_DUPLICATE","Desc":"This Standard Choice applies to multi-agency administration and provides a way to check for duplicate information in a shared database between agencies. #APO"},
{"StdChoice":"APPLICATION SPEC INFO UNIT","Desc":"Provides the drop-down list options for the Unit property of the field for ASI and TSI Fields. The unit property is used in the calculation of fees. #CustomFields"},
{"StdChoice":"ASI_ALIGNMENT_OPTIONS","Desc":"This Standard Choice allows administrators to set application specific information (ASI) fields to either left or right justification. #UserInterface #CustomFields"},
{"StdChoice":"ASSET_SIZE_UNIT","Desc":"Defines the valid values for the following drop down lists: unit of asset size and the unit of work order start location and end location on linear assets.  #Assets"},
{"StdChoice":"CONDITION_PRIORITIES","Desc":"Defines the priorities for conditions including conditions of approval and general conditions. The value descriptions describe options in the Priority field while the Standard Choice values  specify the priority sequence for conditions. #Conditions"},
{"StdChoice":"CONTACT TYPE","Desc":"Contact types for reference, which are generic contact types such as Individual and organization used in reference #Contacts"},
{"StdChoice":"COST_ACCOUNT","Desc":"Used in Asset Management cost item definition and work order costing to get cost account. #Assets"},
{"StdChoice":"BATCH_JOB_TYPE","Desc":"Indicates the types of batch job available in the batch job type drop down list.  #Batch"},
{"StdChoice":"EXPORT_MAX_RECORDS","Desc":"Determines how many records you can export in CSV (Comma Separated Value) format. By default, agency users can export up to 1000 records. #System"},
{"StdChoice":"DISABLE_FEE_CALC_FACTOR_DROPDOWN_FOR_MODULES","Desc":"Defines the modules in which the Fee Calc. Factor  drop-down list field would hide. If a  record belongs to one of the specified  modules, the Fee tab of the record does  not show the Fee Calc. #FeesPayments"},
{"StdChoice":"DISABLE_GIS_NEARBY_QUERY","Desc":"Disables users to search for records, inspections, and asset condition assessments  within the map extent, within one or more selected GIS features, or near one or more selected GIS features. #GIS"},
{"StdChoice":"DISPLAY_RECORD_DOCUMENTS (INSPECTION)","Desc":"This Standard Choice defines whether to include inspection documents on the Documents tab of a record #EDMS  "},
{"StdChoice":"EMSE_CREATE_DISABLED_RECORD_TYPE","Desc":"Allow scripts to create disabled record types. #EMSE"},
{"StdChoice":"ENABLE_AUTO_POPULATE_PARCEL_OWNER","Desc":"Automatically populate the parcel owner information in the application intake form and the renewal form #UserInterface #APO"},
{"StdChoice":"ENABLE_MERCHANT_ACCOUNT_BY_MODULE","Desc":"Allow an agency to enable payment transactions in Civic Platform and Citizen Access to use merchant accounts at the module level. #FeesPayments #8.0.2"},
{"StdChoice":"ENABLE_SELECT_ADDRESS_OWNER_AFTER_PARCEL","Desc":"Defines the way users attach address and owner objects to a record. #APO"},
{"StdChoice":"ENABLE_SELECT_PARCEL_OWNER_AFTER_ADDRESS","Desc":"Defines the way users attach parcel objects and owner objects to a record. #APO"},
{"StdChoice":"ENF_SOURCE","Desc":"Populates the Source of Complaint drop down list  #Enforcement"},
{"StdChoice":"EPaymentAdapter","Desc":"ACAAdapterType defines the ePayment adapter for Citizen Access, and AdapterType defines the ePayment adapter for Civic Platform. Fill the Value Desc with the LEVEL_DATA value from the XPOLICY table settings of the adapter. #FeesPayments"},
{"StdChoice":"LIMIT_WORKSTATION_ACCEPT_PAYMENT","Desc":"Only workstations defined in CASHIER_STATION can accept payments. Civic Platform displays an error message when the user clicks a cashier function, including, for example, the Pay, Refund, Apply, Void, or Fund Transfer buttons. #FeesPayments"},
{"StdChoice":"PARTIALLY_COMPLETED_CAP_PURGE_DAYS","Desc":"Uses CLEAREXPIREDINCOMPLETECAP script and also the batch job for running the script, can periodically purge those partial applications that users Save without Submitting in Civic Platform, or Save and Resume later in Citizen Access #Batch"},
{"StdChoice":"PASSWORD_CALCULATION_SCORE","Desc":"Allows agencies modify the password strength calculation score. #Security"},
{"StdChoice":"PAYMENT_PROCESSING_RECORD_RECEIPT","Desc":"Defines the receipt mask to use in the Payment Processing portlet. See the Configuration Reference. #FeesPayments"},
{"StdChoice":"FEE_QUANTITY_ACCURACY","Desc":"defines the maximum number of digits allowed in the decimal portion of the Quantity. You can set the Standard Choice Value to a number between 2 and 10. #FeesPayments"},
{"StdChoice":"REGIONAL MODIFIER","Desc":"Regional Modifier for Valuation Calculator  #Land"},
{"StdChoice":"RELATED_RECORDS_DEFAULT_VIEW","Desc":"This standard choice defines the default view mode of the Related Records tab: TreeView or ListView #UserInterface #Records #RelatedRecords"},
{"StdChoice":"REMOVE_REQUIRED_IN_ADMIN_CONDITIONS","Desc":"Controls the display of the Required option associated with condition severity in the Condition Maintenance portlets. If the value description is set to Yes, then the Required option is not available.  #Conditions"},
{"StdChoice":"REPORT_CRITERIA_LANGUAGE","Desc":"Defines the available reporting languages. A language abbreviation is listed as the Standard Choice value, and the language name is listed as the Standard Choice value description.  #Reports"},
{"StdChoice":"SG-PERCENTAGE_ EXCLUDE_ INVOICED_ FEE","Desc":"Fee item using SG-PERCENTAGE formula calculates its fee based on sum of other fees in the same subgroup. This defines whether to include all the fees in the sum, or New fees only. Also if users can recalculate an Invoiced fee. #FeesPayments"},
{"StdChoice":"STREET SUFFIXES","Desc":"Populates the street suffixes drop down list.  #APO"},
{"StdChoice":"STRUCTURE_APO_ASSOCIATION","Desc":"Controls the auto association of APO data when you associate an establishment with a structure. Valid values: Yes, No, Prompt  #StructuresEstablishments"},
{"StdChoice":"TURN_OFF_DAILY_MENU_IN_AA_CLASSIC","Desc":"This standard choice disables the Daily tab in the Classic Administration.  #UserInterface #v360Only"},
{"StdChoice":"USER_DISTRICTS","Desc":"The Standard Choice values determine the districts available when assigning user districts to a users inspector profile.    Values must follow the format:  <district type>-<district name>    #Inspections"},
{"StdChoice":"VALUATION_CALCULATOR_VERSION","Desc":"This Standard Choice controls valuation calculator versioning, which enables users to track multiple versions of an occupancy code. Additionally, this Standard Choice controls the availability of the occupancy grouping feature. #Land"},
{"StdChoice":"WORKFLOW_CONFIGS","Desc":"This Standard Choice enables the ability to display the e-mail address associated with a workflow task to public users in the Record Processing Status area on the website. #Workflow"},
{"StdChoice":"ALLOW_NEGATIVE_FEE_TRANSFER_AS_CREDIT","Desc":"Use this Standard Choice to allow processing set payments when the total amount of an invoiced fee item is negative. #FeesPayments"},
{"StdChoice":"ACA_PAGE_PICKER","Desc":"Defines the pages in the page picker in Shopping Cart functionality, such as to continue shopping. #FeesPayments #ACA"},
{"StdChoice":"ADDRESS_TYPE","Desc":"Specify the type of address to appear in the Address Types field when users are completing the address #APO  portion of an application"},
{"StdChoice":"CENSUS_BUREAU_CONSTRUCTION_TYPE_CODE","Desc":"Construction Code for Census Bureau  #Land"},
{"StdChoice":"CONTACT_ADDRESS_TYPE","Desc":"This Standard Choice determines the contact address types which can be added to contact records #Contacts"},
{"StdChoice":"COUNTRY","Desc":"Defines a list of countries that can be available for selection in the Country/Region drop-down list across Civic Platform and Citizen Access #APO"},
{"StdChoice":"ASSET_USAGE_UNIT_TYPE","Desc":"This Standard Choice allows administrators to create asset usage types. When you define these types, agency administrators can associate multiple unit types with a specific asset type. #Assets"},
{"StdChoice":"AUTO_OPEN_CASH_DRAWER","Desc":"With this Standard Choice, you can specify the payment methods with which the cash drawer opens when users handle a payment. By default, the drawer opens for every payment. #FeesPayments"},
{"StdChoice":"BATCH_JOB_SERVER","Desc":"This Standard Choice enables you to specify a particular business server on which to run a batch job.  The value you enter for this Standard Choice populates the Job Server drop-down list in the Batch Job portlet. #Batch"},
{"StdChoice":"BATCH_JOB_STATUS","Desc":"Controls the indicator of the current, real time status of a batch job.  #Batch"},
{"StdChoice":"CALENDAR_SETTING","Desc":"This Standard Choice determines which calendars the Auto Assign and the Get Next Working Date  functionality uses in Citizen Access, IVR, Accela Wireless, and EMSE.  #Calendars"},
{"StdChoice":"CAPSET_SCRIPT_LIST","Desc":"Allows you to execute EMSE scripts on a record set. Enter the EMSE script name as the Standard Choices value. Then, in the Value Desc field, enter the name to display in the drop-down list for this script. #Sets"},
{"StdChoice":"CASH_DRAWER_STARTING_ENDING_BALANCE","Desc":"Determines whether Civic Platform requires users to enter the money amount of the cash drawer when starting or ending a cashier session. #FeesPayments"},
{"StdChoice":"DEPOSIT_FOR","Desc":"The Standard Choice values define the choices in the Deposit For drop-down list on the Transactions tab of the Trust Account detail portlet. #FeesPayments"},
{"StdChoice":"DISABLE_CITY_STATE_DEFAULT","Desc":"Controls whether your agency applies the default City and State values in the licensed professional search form #Professionals"},
{"StdChoice":"DISPLAY_INSPECTION_COMMENT_IN_ACA","Desc":"Defines whether all the inspection comments are viewable by all users in Citizen Access. #Inspections #ACA"},
{"StdChoice":"DOCUMENT STATUS","Desc":"This Standard Choice defines a document status  group. Each document status group can have several values, each value representing a document status. #EDR"},
{"StdChoice":"EDUCATION_DEGREE","Desc":"Defines the value options in the Education Degree drop-down list. Civic Platform provides four values by default, Bachelor, Master, MBA, and PhD. #Education"},
{"StdChoice":"ENABLE_CONTACT_ADDRESS","Desc":"This Standard Choice controls the contact address feature.  If the Standard Choice Value is Yes, the Contact Address tab displays in the reference contact portlet so users can manage contact addresses for reference contacts and record contacts #Contacts"},
{"StdChoice":"ENABLE_CONTACT_ADDRESS_VALIDATION","Desc":"Controls whether you can require users to validate a new contact address against the external address source that you specify. #Contacts"},
{"StdChoice":"ENABLE_CONTACT_TYPE_FILTERING_BY_MODULE","Desc":"This Standard Choice enables or disables the limit on using specific contact types by module in Accela Automation, Accela Citizen Access and Accela Mobile Office #Contacts"},
{"StdChoice":"ENABLE_EXPRESSION_AND_SCRIPT_CACHE","Desc":"controls whether Civic Platform caches EMSE scripts and expressions for performance enhancement. #System"},
{"StdChoice":"EXAM_CSV_FORMAT","Desc":"Define the column titles to use in the CSV examination upload file. #Education"},
{"StdChoice":"RANDOM_AUDIT","Desc":"Configures the random audit functionality. See configuration guide for details.  #Sets"},
{"StdChoice":"MASTER_SCRIPT_DEFAULT_VERSION","Desc":"When using the Productized Master Scripts this defines the version of INCLUDES_ACCELA_FUNCTIONS to apply in the scripts. Civic Platform 8.0.1.0.0 provides Master Scripts 3.0 which supports the JavaScript framework. #EMSE"},
{"StdChoice":"MEETING MAX TIME","Desc":"Determines the length (in minutes) of meetings. For example, you can measure meeting times in fifteen minute increments: 15, 30, 45, 60, 75, and 90. Replaces HEARING MAX TIME Standard Choice. #Meetings"},
{"StdChoice":"MEETING_NOTIFICATION_OUTLOOK_REMINDER","Desc":"Specifies the reminder time for Outlook meeting invites #Meetings"},
{"StdChoice":"PAYMENT_PROCESSING_METHOD","Desc":"Defines the payment methods for each module. If you do not configure this Standard Choice, Civic Platform provides all available payment methods. See Config Guide for acceptable methods. #FeesPayments"},
{"StdChoice":"PORTLET_ICONTEXT_FLAG_ACA","Desc":"Control whether to show menu bar 's text in ACA. Default is NO.  #ACA"},
{"StdChoice":"PROX_ALERT_ACTION","Desc":"This Standard Choice is required for proximity alerts to function. #GIS"},
{"StdChoice":"GIS_ATTACHMENT_SELECTION","Desc":"Defines user notification when GIS objects attach to a record. The two options  indicate whether all GIS objects attach without a prompt to the user or if the system provides a selection page prompt. #GIS"},
{"StdChoice":"GLOBAL_SEARCH_BUILD_INDEX_ENTITIES","Desc":"Defines the objects for which the global search batch job builds the index server. #System #Batch"},
{"StdChoice":"INSPECTION_CATEGORY","Desc":"7.1 adds the ability to configure inspection types to display in ACA according to their categories as an alternative to the current display of a complete list of all inspections applicable to a record #Inspections"},
{"StdChoice":"RULE TYPES","Desc":"Defines the drop down values for rule types in the Rules Admin configuration.  #Communications"},
{"StdChoice":"SINGLE_INVOICE_REPORT","Desc":"Enables single invoice generation when batch printing from the Invoices page. Define the invoice report name to enable the custom invoice report when a single invoice is generated.  #FeesPayments"},
{"StdChoice":"SOCIAL_MEDIA_SETTINGS","Desc":"Enter the consumer key and consumer secret you get from the Twitter in order to customize the application name (instead of  Civic Platform) displayed in tweets on Twitter. #Communications"},
{"StdChoice":"STRUCTURE_CAP_ASSOCIATION","Desc":"Controls the automatic association of establishment, structure, and APO data to an application intake form when you search for an address, parcel, owner, structure, or establishment. Valid Values: Yes, No, Prompt  #StructuresEstablishments"},
{"StdChoice":"USER_DISCIPLINES","Desc":"The Standard Choice values determine the disciplines available when assigning user disciplines to a users inspector profile.  #Inspections"},
{"StdChoice":"USE_GIS_REST_API","Desc":"This Standard Choice enables the usage of the Civic Platform GIS REST API.  Yes = Uses the Civic Platform GIS REST API to perform search and retrieve XAPO data.  No = The default value is No, which uses the legacy SOAP-based API.  #GIS #8.0.2"},
{"StdChoice":"VOID_PAYMENT_REASON","Desc":"This Standard Choice defines all possible options in the Reason field that users can select  when voiding payments. #FeesPayments"},
{"StdChoice":"APOSE_SYNCHRONIZE","Desc":"This Standard Choice determines how Civic Platform synchronizes associated reference data in new record intake forms or on the tabs in the record detail portlet. [Auto/Prompt/Manual] #APO"},
{"StdChoice":"ASI_CONFIGS","Desc":"Controls functionality for Application Specific Information data fields #CustomFields"},
{"StdChoice":"ACA_CONDITION_AGENCY_USER","Desc":"This Standard Choice provides the ability to assign conditions to records by EMSE when public users create records. #Conditions #ACA"},
{"StdChoice":"ACA_CONNECT_LICENSE_EMAIL_ENABLE","Desc":"Enables sending a notification email to the public user when their LP added to their account has been approved. #ACA"},
{"StdChoice":"ACA_SECURITY_SETTING","Desc":"This Standard Choice controls whether Citizen Access validates the referer header in POST requests to prevent cross-site request forgery. See Configuration Reference. #Security #ACA"},
{"StdChoice":"ALERT_EMAIL_EXTERNAL_RECIPIENT","Desc":"A list of contact types on a record that should receive emails. #Communications"},
{"StdChoice":"CONTACT RELATIONSHIP","Desc":"With this Standard Choice, you can define the value options for the contact relationship drop-down list. #Contacts"},
{"StdChoice":"ATTRIBUTE TEMPLATE UNIT","Desc":"Populates the Unit drop down list on the APO template attribute creation screen.  #APO"},
{"StdChoice":"BATCH_JOB_PM_ADVANCE_PERIOD","Desc":"Defines the period options for the PM Generate field on the schedule form of PM Schedule batch jobs. This allows you to select an amount of time, in advance of a PM Schedule, to run a batch job. #Batch #Assets"},
{"StdChoice":"BATCH_JOB_SCHEDULE_FREQUENCY","Desc":"Defines the batch job frequency drop down list values.  #Batch"},
{"StdChoice":"BATCH_JOB_SERVICE_CATEGORY","Desc":"Determines the types of service categories from which you can select when you create a batch job.  #Batch"},
{"StdChoice":"CALENDAR_BLOCK_UNIT","Desc":"CALENDAR_BLOCK_SIZE and this Standard Choice CALENDAR_BLOCK_UNIT jointly determine the time length for the default calendar time block.  #Calendars"},
{"StdChoice":"CAP_RETAIN_FEESCHEDULE","Desc":"To have existing applications retain their original fee schedule even after you change the application type, enable this Standard Choice and enter a value of Yes. #FeesPayments"},
{"StdChoice":"CREATE_NEW_ITEM_DEFULT_SIZE","Desc":"Defines the size of the Create New drop-down menu accessed from the Create New button, the numeric Standard Choices Value controls how many items you want to display by default.  Remaining items can be seen by clicking the See All link.  #UserInterface"},
{"StdChoice":"DEFAULT_JOB_VALUE","Desc":"Populates a default Job Value amount in the Job Value field. #Land"},
{"StdChoice":"DEPARTMENT_PICKER_TYPE","Desc":"Defines how the department options are available for users to select in a record search or activity search. #UserInterface"},
{"StdChoice":"DISABLE_APO_TEMPLATE_DATA_VALIDATION","Desc":"When you enable address, parcel, or owner validation in the application intake form, this   determines whether to validate address, parcel, or owner template data against default values. #APO"},
{"StdChoice":"ENABLE_CONTACT_TYPE_SECURITY","Desc":"This Standard Choice controls whether Accela Automation and Accela Mobile Office enforce contact type security on record contacts and reference contacts #Contacts"},
{"StdChoice":"ENF_COMPLAINT_TYPE","Desc":"Type of complaint #Enforcement"},
{"StdChoice":"ENF_SUBMITTED","Desc":"Populates the submittal method drop down list.  #Enforcement"},
{"StdChoice":"INSPECTION_UNIT_NUMBER_VALUES","Desc":"Together with INSPECTIONS_BY_UNIT, allows users to specify inspection unit number (IUN) for scheduling inspections and displaying inspection results of the same type multiple times for the same record. #Inspections"},
{"StdChoice":"KEEP_COMPLETED_INSPECTION_ACTIVE","Desc":"Controls whether a user can view and access an inspection after the inspection completes. #Inspections"},
{"StdChoice":"LICENSED_PROF_ACTIVE_STATUS","Desc":"Indicates all license statuses that Civic Platform would consider active. Any status in  this Standard Choice can apply for a permit. #Licensing"},
{"StdChoice":"RECENTLY_HISTORY_SIZE","Desc":"Sets the number of items that display in the Recently Viewed drop-down list when users click the Navigation button on the toolbar. Default value is 10. #UserInterface #Records"},
{"StdChoice":"LONG_TERM_TIME_TRACKING","Desc":"Defines regular working hours for a typical work day. The Time Tracker function uses the regular working hours to calculate In Possession time. #Workflow"},
{"StdChoice":"MEETING_TYPE_STATUS_PLANNING","Desc":"Defines the status values for each meeting status group. You can enter three different meeting status values: APPROVED, PENDING, and DENIED. #Meetings"},
{"StdChoice":"MULTI_SERVICE_SETTINGS","Desc":"Applies to multi-agency administration. The settings define which agency is the super agency for the management of services from multiple agencies and provides the ability to lock a service from licensed professionals or addresses by a condition. #System"},
{"StdChoice":"PARTIAL_CAP_CONDITION_ENABLE","Desc":"Determines which step on the application intake form to display the conditions. When  enabled, this Standard Choice displays the conditions applied to partial applications in the pop-up window for the application intake form #Conditions"},
{"StdChoice":"PAYMENT_GROUP","Desc":"Defines one service fee structure for each module in Citizen Access. This provides  the flexibility to use service fee structure for one module and to use another service fee structure for another module. #FeesPayments"},
{"StdChoice":"PAYMENT_PROCESSING_DEFAULT_METHOD","Desc":"Set the default payment method for the current user ID. If you do not define this Standard Choice, Civic Platform uses cash as the payment method. #FeesPayments"},
{"StdChoice":"PENALTY_INTERVAL_UNITS","Desc":"Populates the Penalty Fee Interval Units drop down list in the expiration code configuration screen.  #Licensing"},
{"StdChoice":"PRINT_INVOICE_REPORT","Desc":"Defines the custom invoice report for the agency. This report will be used when printing invoices from the UI. Enter the report name from Report Manager. #FeesPayments"},
{"StdChoice":"PRODUCTION_UNIT_TYPE","Desc":"Specifies choice values for the Unit of Production Field drop-down list used for tracking work order production. #Assets"},
{"StdChoice":"EXTERNAL_REVIEWERS","Desc":"Used for the third party plan review tool. If you have plan reviewers who are not Civic Platform users, configure this standard choice. #EDR"},
{"StdChoice":"FILE_UPLOAD_BEHAVIOR","Desc":"Configures the file upload behavior for attaching documents to a record. #EDMS"},
{"StdChoice":"FOOD_FACILITY_INSPECTION","Desc":"Controls the food facility search functionality in Citizen Access #Inspections"},
{"StdChoice":"GIS_ASSET_SYNC_BLOCK_SIZE","Desc":"Defines the number of records to sync at once for Asset Management. #GIS"},
{"StdChoice":"GIS_NEARBY_QUERY_LIMITATION","Desc":"This Standard Choice sets various limits on the Nearby Query functionality, for example, the maximum number of features that users can select to perform a nearby query. #GIS"},
{"StdChoice":"HEARING BODY","Desc":"Defines the value options for the hearing bodies drop-down list. Users can update this list from either the Standard Choices or Hearing Bodies. #Meetings"},
{"StdChoice":"HEARING LOCATION","Desc":"Determines the venues where you can conduct hearings, such as a city hall or a county administration building.#Meetings"},
{"StdChoice":"RELATED_CAP_SUMMARY","Desc":"Controls whether the record summary page is available on the related records and renewal records portlets.   #Records #RelatedRecords"},
{"StdChoice":"REPRINT_REASONS","Desc":"Populates the reprint reason drop down list for authorized agents or clerks to select when they want to reprint a license tag in Citizen Access.  #Licensing"},
{"StdChoice":"STRUCTURETYPE","Desc":"Determines the values of the Structure Type drop down list.  #StructuresEstablishments"},
{"StdChoice":"STRUCTURE_ESTABLISHMENT_APO_ASSOCIATION","Desc":"Enables the auto association of APO data to existing associated establishments when you associate APO data with their parent structure. Valid values: Yes, No, Prompt  #StructuresEstablishments"},
{"StdChoice":"STRUCTURE_ESTABLISHMENT_STATUS","Desc":"Determines the structure and establishment status drop down list values. #StructuresEstablishments"},
{"StdChoice":"TEMPLATE_EMSE_DROPDOWN","Desc":"Controls the ability to populate licensed professional template field information by calling an external web service and publishing the data to the field. Default is No. #Professionals"},
{"StdChoice":"TIME_ACCOUNTING_SETTINGS","Desc":"Controls whether the Equipment/Materials section is available for users to add equipment and material cost when creating a time accounting record. #TimeAccounting"},
{"StdChoice":"TIME_MODULES","Desc":"controls the drop down menu that displays beside the time in Structures and Establishments records and indicates whether the time is a.m. or p.m. #StructuresEstablishments"},
{"StdChoice":"UNIT DESC","Desc":"This Standard Choice defines the fee item units available when adding a new fee.   #FeesPayments"},
{"StdChoice":"UNIT TYPES","Desc":"This Standard Choice populates the drop-down list in the Unit Type field in ACA.  #APO"},
{"StdChoice":"VOID_INVOICE_REASON","Desc":"This Standard Choice defines all possible options in the Reason field that users can select  when voiding invoices. #FeesPayments"},
{"StdChoice":"WO_CLOSE_CHECK_TASK","Desc":"When this standard choice is set to Yes, daily users cannot close a work order until the user marks all attached work order tasks as Complete. #Assets"},
{"StdChoice":"ASSET_GROUP","Desc":"Defines the groups available in the Asset Group drop down list.  #Assets"},
{"StdChoice":"ACA_AUTO_ASSIGN_INSPECTOR","Desc":"Configure this Standard Choice to prevent inspections from being auto-assigned if no inspector is availablewith the appropriate discipline or in the appropriate district. #Inspections #ACA"},
{"StdChoice":"ACA_ONLINEPAYMENT_WEBSERVICE_URL","Desc":"Configured at Agency level the Web Service URL of the Online Payment.  #ACA"},
{"StdChoice":"AGENCY_EMAIL_REGISTRATION_TO","Desc":"This Standard Choice sends the registration activation e-mails to a specific e-mail address of an agency employee for managing the activation of public user accounts internally. #Communications"},
{"StdChoice":"ALLOW_CROSS_AGENCY_RECORDS_IN_CART","Desc":"Use this Standard Choice to restrict users from adding records from multiple agencies into a single shopping cart transaction. By default, this feature is enabled; #Superagency #ACA"},
{"StdChoice":"CONDITION TYPE","Desc":"This Standard Choice defines the values displayed in the drop-down list of values for the condition type. #Conditions"},
{"StdChoice":"CONDITIONS_OF_APPROVALS","Desc":"Enables the Conditions of Approvals feature. Conditions with a different user experience, useful for License/Permit requirements, checklist style user experience. #Conditions"},
{"StdChoice":"AUTO_GENERATE_RECEIPT","Desc":"You can use this Standard Choice to streamline the payment process by automatically generating a receipt.   whenever a cashier intakes a payment transaction. #FeesPayments"},
{"StdChoice":"BUDGET_ACCOUNT","Desc":"Defines budget accounts and budget numbers that users can associate with parts for costs tracking in part transactions. Each budget account must have a unique budget number. #FeesPayments"},
{"StdChoice":"CASHIER_STATION","Desc":"You can uniquely identify, by an ID, any cash drawer receiving payment. Mapping the computer name to the workstation name allows each client computer to find its cash drawer ID in the Standard Choice. #FeesPayments"},
{"StdChoice":"EXPORT_IMPORT_ITEM","Desc":"Populates the import/export type drop down list in Administration > System Tools.  #System"},
{"StdChoice":"COUNTRY_DEFAULT_VALUE","Desc":"Defines the default country for selection in the Country/Region drop-down list across Civic Platform and Citizen Access. #APO"},
{"StdChoice":"CREATE_NEW_INSPECTION_WHEN_RESCHEDULE","Desc":"This Standard Choice controls whether Civic Platform creates a new inspection record or whether Civic Platform updates the original inspection record when an agency user reschedules an inspection. #Inspections"},
{"StdChoice":"CREATE_NEW_ITEM_DEFAULT_SIZE","Desc":"Defines the size of the Create New drop-down menu accessed from the Create New button. The numeric Standard Choice value controls how many items you want to display by default #UserInterface"},
{"StdChoice":"DEFAULT_HOUSING_UNITS","Desc":"Populates a default value in the Housing Units field. #Land"},
{"StdChoice":"E-MAIL_PAYMENT_NOTICE_DISABLE","Desc":"ACA sends a receipt when a public user completes a record and the fee payment for the record. It also sends an email with instructions for the next step in a workflow #Communications"},
{"StdChoice":"EDMS","Desc":"Defines the EDMS server configuration information. The value specifies the EDMS system name. The Value Description contains all configuration parameters for the EDMS system #EDMS"},
{"StdChoice":"ENABLE_AMO_ONLINE_REPORT","Desc":"Allow Mobile Office users to run online reports for inspections from the Inspection list page, Inspection detail page, or the Job List page. Refers to the reports configured the Mobile Office Reports category in Report Manager #Reports"},
{"StdChoice":"ENFORCEMENT DEFENDANT EYE COLOR","Desc":"Enforcement Defendant Eye color #Enforcement"},
{"StdChoice":"EVIDENCE_DISPOSITION","Desc":"Populates the values in the Reasons drop-down list related to the chain of custody  for the evidence #Enforcement"},
{"StdChoice":"INSPECTION_RESULT_CSV_FORMAT","Desc":"Defines the format of an inspection result CSV file. The Standard Choice value specifies the columns in the CSV file. Make sure you enter the value exactly as Table 99: INSPECTION_RESULT_CSV_FORMAT Standard Choice Values listed. #Inspections"},
{"StdChoice":"INSPECTION_SETTING","Desc":"Common settings for inspections. #Inspections"},
{"StdChoice":"INSPECTOR_WORKLOAD_CALENDAR_TIME","Desc":"Defines the default start time and default end time for the inspector workload calendars. Users cannot schedule inspections before or after the start time and end time. #Inspections"},
{"StdChoice":"Plan Review Document Review Status - General","Desc":"You can add multiple status SC for each document review status group and assign them to document types. Each value represents a value in the document review status DDList. Value desc can be either empty (default) or 'Validation Required'.  #EDR"},
{"StdChoice":"LICENSED_PROF_EXPIRE_STATUS","Desc":"Indicates all license statuses that Civic Platform would consider expired. Any status  in this Standard Choice cannot apply for a permit. #Licensing"},
{"StdChoice":"MEETING_TYPE_STATUS_PLANNING_COMMISSION","Desc":"Defines the status values for each meeting status group. You can enter three different meeting status values: APPROVED, PENDING, and DENIED. #Meetings"},
{"StdChoice":"MENU_NAVIGATION_ENABLED","Desc":"Turns on the Menu customization on v360 Admin.  #UserInterface"},
{"StdChoice":"MODULE_AUDIT_FREQUENCY","Desc":"Defines the frequency of random audits at the module level. Enter any modules for which you want to define a random audit frequency as a value, and enter the frequency, in number of months, as the value description. #RandomAudit"},
{"StdChoice":"NEW_SPEAR_FORM_ENABLE","Desc":"Gives agencies the option to use the redesigned single portlet entry and review form available since Civic Platform 6.5.0 release. #UserInterface #Records"},
{"StdChoice":"ONE_INVOICE_FOR_ALL_CAPS","Desc":"Enables single invoice for multiple records functionality. When configuring this Standard Choice, you can select from three values: Yes, No, and Prompt #FeesPayments"},
{"StdChoice":"ONLINE_PAYMENT_MAX_AMOUNT","Desc":"Defines the maximum payment amount per transaction for each payment method. If the value contains a module name, the payment limit applies to that module only. Otherwise, it applies to all modules. #FeesPayments"},
{"StdChoice":"PART_CALCULATE_TYPE","Desc":"Defines the formula options for calculating the costs of parts. #Assets"},
{"StdChoice":"PART_STATUS","Desc":"Asset Management Part Statuses #Assets"},
{"StdChoice":"Find App Date Range","Desc":"Defines a default date range when public users search for permits. #Records #UserInterface"},
{"StdChoice":"GIS_BUFFER_DISTANCE","Desc":"Sets buffer distance for Civic Platform to artificially shrink a parcel that overlays multiple GIS objects, when mapping the parcel attribute in the GIS map to an ASI field, or when auto assigning inspectors to records that deal with the parcel #GIS"},
{"StdChoice":"STREET DIRECTIONS","Desc":"Populates the drop-down list of street directions. The Standard Choices values are the directions, such as North, South, East, West, N, S, E, W, NE, NW, SE, SW.  #APO"},
{"StdChoice":"VEHICLE","Desc":"This Standard Choice identifies the types of vehicles reported during one-time accounting.  Standard Choice values can include:  Motorcycle  Bicycle  Car    #TimeAccounting"},
{"StdChoice":"APO_ATTACHMENT_SELECTION","Desc":"This Standard Choice defines user notification when APO objects are attached to a record. The two options indicate whether all APO objects attach without a message to the user or if Civic Platform provides a selection page message. #APO"},
{"StdChoice":"APPLICATION_TYPE_SECURITY_FID","Desc":"Use this Standard Choice to control access to an application based on its status. Enter each workflow, or process, by FID. #Security #Records"},
{"StdChoice":"APPLY_ SYSTEM_ DEFAULT_ FORMAT","Desc":"With this Standard Choice, you can specify the receipt templates that must apply the system default alignment style, even though administrators define the alignment differently in the templates. #FeesPayments"},
{"StdChoice":"ASSET_CALENDAR_BUILD_INDEX_DURATION","Desc":"This Standard Choice defines the start date and end date of a duration. When you run a batch job whose type is Asset Calendar Rebuild Index, the batch job only builds indexes for the asset events whose event time falls in the duration. #Batch"},
{"StdChoice":"ACA_AGENCY_EMAIL_REGISTRATION_TO","Desc":"This Standard Choice enables the feature that sends an  activation required email to an agency  employee. The email is a notification that the public user does not meet the basic requirements for automatic activation. #Communications #ACA"},
{"StdChoice":"ACA_CONNECT_LICENSE_AUTO_APPROVED","Desc":"Controls whether Civic Platform automatically approves a license when a public user associates the license with their account in Citizen Access. #Licensing #ACA"},
{"StdChoice":"ACA_EMAIL_REGISTRATION_TO","Desc":"Provides the ability to designate the  CC email address on the registration confirmation emails which Civic Platform sends to users that register for an ACA account. NOTE: Enabling overrides Communication Manager #Communications #ACA"},
{"StdChoice":"ACA_FILTER_CAP_BY_LICENSE","Desc":"This Standard Choice provides a way to incorporate filters so that the licensed professional avoids choosing inapplicable options online. #Licensing #ACA"},
{"StdChoice":"COMPLAINT REFERRED SOURCE","Desc":"This Standard Choice is specific to the Code Enforcement module. Activate this Standard Choice to display a drop-down list of values for the Referred Source. #Enforcement."},
{"StdChoice":"COST_ITEM","Desc":"Work Order Cost Item Information #Assets"},
{"StdChoice":"COST_TYPE","Desc":"Used in Asset Management cost type definition and work order costing. #Assets"},
{"StdChoice":"BATCH_INVOICE_REPORT","Desc":"Define the invoice report name to enable the custom invoice report when a invoices are generated in batch from the Invoices page. #FeesPayments"},
{"StdChoice":"BATCH_JOB_RESULT","Desc":"Defines the values that populate the batch job result status in the Batch Engine log.  #Batch"},
{"StdChoice":"BATCH_JOB_SCHEDULE_TYPE","Desc":"Defines the batch job schedule type drop down (batch job status.  #Batch"},
{"StdChoice":"EXTERNAL_DOC_REVIEW","Desc":"Used for connectivity and authentication of the third party plan review tool. It also enables the mapping portlet for the named plan review tool. #EDR"},
{"StdChoice":"DISABLED_AEDR_CHECK","Desc":"Provides the ability to suppress the pop-up message that displays to indicate an upgrade of the EDR client is required, which is the default behavior in Civic Platform. #EDR"},
{"StdChoice":"DISABLE_EXPAND_RECORDSET","Desc":"This Standard Choice determines whether the query engine is on or off in the Address Search, Asset, Asset Condition Assessment, Part Inventory, and Preventative Maintenance Schedule list portlets. #UserInterface"},
{"StdChoice":"EMSEToolConfig","Desc":"An administrator can configure the EMSE Tool to connect to the appropriate SCCS repository. Although the EMSE Tool supports both Github and TortoiseSVN SCCS repositories, it only supports one SCCS per configuration. #EMSE"},
{"StdChoice":"ENABLE_80_UI","Desc":"Enables the 8.0 User Interface and turns on the  Switch to new UI link on the V360 interface. Once this link is available, users can access the new user interface at  will. #UserInterface #8.0"},
{"StdChoice":"INSPECTION_ROUTE_TYPE","Desc":"defines the routing types that users can select to optimize the inspection route #Inspections"},
{"StdChoice":"INSPECTOR_AUTO_ASSIGN_CRITERIA","Desc":"defines the criteria for auto-assigning inspections in Civic Platform, Citizen Access, and IVR. Configure this Standard Choice to prevent inspections from being auto-assigned if no inspector is available. #Inspections"},
{"StdChoice":"LEGISLATIVE_MANAGEMENT","Desc":"Configure this standard choice to define the location of the Legislative Management instance. #LegMan"},
{"StdChoice":"LICENSE EXPIRATION STATUS","Desc":"THIS SC IS OBSOLETE! The license exp status values are set in the R1SERVER_CONSTANT table. SELECT CONSTANT_VALUE, CONSTANT_NAME   FROM R1SERVER_CONSTANT   WHERE SERV_PROV_CODE = '{agencycode}'   AND CONSTANT_NAME LIKE 'EXPIRATION%_STATUS'  #Licensing"},
{"StdChoice":"MAX_ATTACHMENT_SELECTION_NUMBER","Desc":"Defines the maximum number of APO/GIS record attachment to an application, when you select the Select All option #APO"},
{"StdChoice":"MEETING_TYPE_STATUS_GROUP","Desc":"Determines the types of meetings your agency conducts. For example, you might create a different meeting status group for each commission in your agency s planning and zoning division. #Meetings"},
{"StdChoice":"ONLINEPAYMENT_WEBSERVICE_URL","Desc":"Gives agencies the ability to accept payments online. This Standard Choice stores the URL for the web service for the online payment. #FeesPayments"},
{"StdChoice":"PART_TYPE","Desc":"Asset Management Part Types #Assets"},
{"StdChoice":"PASSWORD_POLICY_SETTINGS","Desc":"Create new password policy settings, or to modify settings within an existing password policy setting. Use double pipes (||) to split standard value descriptions and a colon (:) to split elements #Security"},
{"StdChoice":"PAYMENT_CREDITCARD_TYPE","Desc":"Defines the acceptable credit card types. When accepting credit card payments, cashiers can use magnetic card reader to automatically read credit card information into Civic Platform, or manually enter the information. #FeesPayments"},
{"StdChoice":"PRINT_PAYMENT_RECEIPT_REPORT","Desc":"This Standard Choice defines the report name for custom payment receipts.  #FeesPayments"},
{"StdChoice":"E_CODES","Desc":"Defines an external URL as an Accela toolbar button in Adobe Acrobat Pro. The value specifies the button name, and the Value Desc specifies the URL address. #EDR"},
{"StdChoice":"FEE_CALCULATION_BASED_ON_FEECALC","Desc":"Enable this standard choice to calculate fees based on FeeCalc and Fee Calc Criteria. This enables the Calculated, Calculation Record fields.  #FeesPayments"},
{"StdChoice":"FILE_REVIEW_STATUS","Desc":"Document Review Status type, each with a unique Standard Choice name. The Standard Choice names are the document review status group names. #EDR"},
{"StdChoice":"FULL_PAY_ALLOCATION_OPTIONS","Desc":"determines the allocation method of the full pay functionality which allocates the payment amount in sequence until the applied payment goes to zero. #FeesPayments"},
{"StdChoice":"GLOBAL_SEARCH_MAX_COUNT","Desc":"This Standard Choice sets the maximum number of results returned in a global search. The default value is 10000.  #System"},
{"StdChoice":"GRACE_PERIOD_INTERVAL_UNITS","Desc":"Defines the value options for the time unit to be used for the Grace Period Interval #Licensing"},
{"StdChoice":"I18N_ADDRESS_FORMAT","Desc":"This Standard Choice allows users to define the format for addresses. #APO"},
{"StdChoice":"INSPECTION_DISTRICT_ON_PARCEL","Desc":"Determines whether the Inspection (User) District field displays on parcel pages. If the Standard Choice is inactive, or its value is No, the field does not display on parcel pages. #APO"},
{"StdChoice":"REF_CONTACT_CREATION_RULES","Desc":"Required for the master script func createRefContactsFromCapContactsAndLink(). For each contact type, enter either I for Individual, O for Organization, F for follow the transaction contact flag, or D Do not create a ref contact #EMSE"},
{"StdChoice":"ROUTE_OPTIMIZER_PROVIDER","Desc":"Defines the approach to integrating the third-party route optimizer. For detailed integration instructions, see  Configuring Inspection Route Sheets in the Inspections chapter of the Civic Platform Administrator Guide. #Inspections"},
{"StdChoice":"SSO_ADAPTER","Desc":"Allows an agency to specify a custom SSO adapter such as LDAP and Oracle Access Manager.   #Security"},
{"StdChoice":"State/Province (Canada)","Desc":"Defines a custom list of states or provinces that can be available for selection in the State (or Province) drop-down lists. Additional custom lists can be defined. Search State/Province (User-defined name) on Community for more info. #APO"},
{"StdChoice":"TEMPLATE_TEXT_PARAMS","Desc":"Defines agency-specific parameters that can apply to display text in text settings. The value defines the parameter name, the Value Desc defines the parameter value. Add $$ParamName$$ to text settings to display in UI. #UserInterface"},
{"StdChoice":"UI_SKIN","Desc":"This standard choice adjusts the v360 user interface skin for clearer display in the following two aspects:  1. Higher contrast in record list rows  2. Read-only text displays in dark grey.  #UserInterface #v360Only"},
{"StdChoice":"UPDATE_REFERENCE_CONDITION","Desc":"This Standard Choice provides the ability to prompt the user to update reference conditions during the cloning of a record and saves the update as an ad hoc in condition history. #Conditions"},
{"StdChoice":"WITHOUT_INSPECTION_TIME","Desc":"This Standard Choice controls whether IVR or a third party IVR can schedule inspections without passing the scheduled start time to Civic Platform. Valid value: IVR  #Inspections"},
{"StdChoice":"WORKFLOW_FIDS","Desc":"Use this Standard Choice in conjunction with APPLICATION_TYPE_SECURITY_FID to limit users with Workflow Supervisor access (FID 8090-Workflow Supervisor enabled). #Workflow"},
{"StdChoice":"ALLOW_SHARED_DROPDOWN_LIST","Desc":"This Standard Choice defines whether administrators can bind a shared drop-down list for an application specific information (ASI) or task-specific information (TSI) field in the ASI or TSI definition page. #CustomFields"},
{"StdChoice":"ASI_EDIT_CONTROL_SYSTEM_LEVEL","Desc":"Controls who can edit application-specific info you create. Non-supervisor users can enter or change the ASI information during creation. Only supervisors to update them after a user saves the app. #CustomFields #Security"},
{"StdChoice":"ASSET_STATUS","Desc":"Defines the status values in the Asset status drop down list.  #Assets"},
{"StdChoice":"ACA_CACHE_CONFIG","Desc":"This Standard Choice enables the ability to move global data, including labels and system settings into cache in a .NET layer to provide the ability to share this data and improve performance when multiple users access the data.  #System #ACA"},
{"StdChoice":"ADDRESSSET_SCRIPT_LIST","Desc":"This Standard Choice allows you to execute EMSE scripts on an address set. Value: {EMSE Script Name} Value Desc: {Enter the name to display in the drop-down list for this script.} #Sets"},
{"StdChoice":"CLONE_REFERENCE_CONDITION","Desc":"Decides whether to save or update the address, parcel, owner, or licensed professional condition when users override or unlock the conditions on a record. #APO"},
{"StdChoice":"CONTACT_PREFERRED_CHANNEL","Desc":"Define the value options for the Preferred Channel drop-down list in a contact. #Contacts"},
{"StdChoice":"COST_FACTOR","Desc":"Defines the cost factors to use in the calculation of total cost quantity. You must specify both a numeric value and a description for each cost factor. #FeesPayments"},
{"StdChoice":"ATTRIBUTE_GROUP","Desc":"Populates the attribute group drop down list in Asset Attribute Admin.  #Assets"},
{"StdChoice":"AUTHENTICATION_BY_SECURITY_QUESTION","Desc":"This enables 2 step authentication in ACA. The user will be required to answer their security question every time they login. #ACA"},
{"StdChoice":"AUTO_SYNC_PEOPLE","Desc":"Enable or disable the contact or perfessional auto sync. Enables the use of the contact sync flag, close match, and ACA auto match. #Contacts"},
{"StdChoice":"CAP_CREATE_SETTINGS","Desc":"Sets the default option in the Record Type Select portlet when users create a record. For Each Parcel will default to create a new record for each parcel. #Records"},
{"StdChoice":"EXTERNAL_ADDRESS_SOURCE","Desc":"Defines the external address source. Agencies can use existing APO repository information and maintain just one APO repository for all their needs. #APO"},
{"StdChoice":"EXTERNAL_OWNER_SOURCE","Desc":"Defines the external owner source. Agencies can use existing external APO repository information and maintain just one APO repository for all its needs. #APO"},
{"StdChoice":"CREATE_NEW_ITEMS","Desc":"Controls which items Civic Platform lists in the Create New portlet, which affects the display and display order of the Create New drop-down list. #UserInterface"},
{"StdChoice":"DOCUMENT_AUDIT_ACTION_TYPES","Desc":"Defines the value options of the Action Type drop-down list on the Document Audit  Log #EDMS"},
{"StdChoice":"ENABLE_CONDITION_RESOLVED_DATE","Desc":"Changes the behavior of the status date in conditions and conditions of approval. When enabled, Civic Platform only updates the status date when you satisfy the conditions or conditions of approval. #Conditions"},
{"StdChoice":"ENFORCEMENT DEFENDANT HAIR COLOR","Desc":"Enforcement Defendant Hair color #Enforcement"},
{"StdChoice":"EVIDENCE_UNITS_MEASURE","Desc":"Defines the value options for the Evidence Unit of Measure drop-down list in the  evidence form (new/edit). #Enforcement"},
{"StdChoice":"EXPIRATION_INTERVAL_UNITS","Desc":"Defines the value options for the drop-down list of license expiration intervals #Licensing"},
{"StdChoice":"Plan Review Document Status - General","Desc":"You can add multiple status SC for each document status group and assign them to document types. Each value represents a value in the document status ddlist.  #EDR #Attachments"},
{"StdChoice":"RACE","Desc":"Defines the list of values available in the Race drop down list on a contact.  #Contacts"},
{"StdChoice":"REASON_FOR_RESCHEDULING_CANCELLING_EXAMINATION","Desc":"Defines the reasons users can select when rescheduling or cancelling an exam.  #Education #Licensing"},
{"StdChoice":"LICENSE_TYPE","Desc":"Defines the value options for the license type drop-down list. #Licensing"},
{"StdChoice":"PRIMARY_CONTACT_ADDRESS_REQUIRED","Desc":"Determines whether users must specify a  primary contact address for any contact in a record.  Currently set to not require primary address #Contacts"},
{"StdChoice":"PRIORITY","Desc":"Define the priority levels for the Priority drop down list on the record detail. #Records"},
{"StdChoice":"PROFESSIONALSET_SCRIPT_LIST","Desc":"Allows you to execute EMSE scripts on a licensed professional set. Enter the EMSE Script Name as the Standard Choices value. Then, in the Value Desc field, enter the name to display in the drop-down list for this script. #EMSE"},
{"StdChoice":"GIS_PROX_ALERT_TRIGGERS","Desc":"You must configure this Standard Choice for proximity alerts to function. #GIS"},
{"StdChoice":"GLOBAL_TRUST_ACCOUNT","Desc":"Defines the global trust account ID and the module to which it is applicable. #FeesPayments"},
{"StdChoice":"I18N_SETTINGS","Desc":"This standard choice cannot be configured in classic. See admin guide for international language configuration.  #System"},
{"StdChoice":"REMOVE_PAY_FEE","Desc":"Controls the display of the Pay Fee link from the Fees section of the Record Detail page and the Status column on the Record List page. Yes=Remove the pay fee link from ACA. Default is No.  #FeesPayments #ACA"},
{"StdChoice":"STATES","Desc":"Populates the drop down list of states.  #APO"},
{"StdChoice":"STREET FRACTIONS","Desc":"Populates the street fractions drop down list on an address.  #APO"},
{"StdChoice":"TIME_FORMAT","Desc":"Set the display format of Reported Time field   on the Intake and Record Detail form. Example: hh:mm a  #Records #System"},
{"StdChoice":"WO_TASK_DURATION_UNIT","Desc":"This Standard Choice determines the anticipated unit of time needed to complete the task. #Assets"},
{"StdChoice":"APO_SUBDIVISIONS","Desc":"If you activate FIDs 0241-Parcel Subdivision and Lot Search and 8327-Search Select Parcel Function, you can define the subdivisions that display as choices in a drop-down list of the Subdivision field. #APO"},
{"StdChoice":"ACA_CONFIGS_TABS","Desc":"Controls most Citizen Access features and is mostly configured via the ACA Admin tool. See the Configuration Reference. #ACA"},
{"StdChoice":"ACA_SPELL_CHECKER_ENABLED","Desc":"This Standard Choice controls the spell checker in Citizen Access. When the Standard Choice value is Yes, the spell checker is available for public users in Citizen Access. #ACA"},
{"StdChoice":"CONDITION STATUS","Desc":"Populates the condition status drop down list.   #Conditions"},
{"StdChoice":"COST_UNIT_TYPE","Desc":"Used in Asset Management cost unit type definition and work order costing. #Assets"},
{"StdChoice":"ASSET_TREE_NODE_CONFIG","Desc":"This Standard Choice Value defines which information a Linked Asset tree node displays and the maximum length of the text displayed by a Linked Asset tree node. #Assets"},
{"StdChoice":"CAP_DETAIL_ICON_FILE_FORMATS","Desc":"This Standard Choice enables the icon image on a record type, and thus the image in the records of  the record type. The Standard Choices values define which file types Civic Platform accepts for display images. #System"},
{"StdChoice":"EXTERNAL_PARCEL_SOURCE","Desc":"Defines the external parcel source. Agencies can use existing external APO repository information and maintain just one APO repository for all its needs.#APO"},
{"StdChoice":"CUSTOMIZED_TRACKING_NBR","Desc":"If set to Yes, all records use customized tracking numbers which administrators must define for the B1PERMIT.B1_TRACKING_NBR database field in the EMSE events #System #Records"},
{"StdChoice":"DEBUG","Desc":"Standard Choice value descriptions for DEBUG/ENABLE_DOCUMENT_DEBUG include:  YES to enable the document upload log.  NO to disable the document upload log (default value is NO). #EMSE"},
{"StdChoice":"DEFAULT_LIST_ROWS","Desc":"This Standard Choice defines how many result rows display for each group list page in the Global Search result portlet. #UserInterface"},
{"StdChoice":"DISPOSITION","Desc":"You can define the value options in the Disposition drop-down list, which are  possible reasons for change in chain of custody #UserInterface"},
{"StdChoice":"EMSE_Settings","Desc":"At the triggering of an event, the EMSE Message List window appears in the front of other windows so that users can easily notice the event execution results. Configure the length of period during which the window has the focus. #EMSE"},
{"StdChoice":"ENABLE_ADD_MULTIPLE_CONDITIONS","Desc":"Users can add multiple conditions to a record or other object in one submit process #Conditions"},
{"StdChoice":"ENABLE_EXPIRED_LICENSE","Desc":"With Standard Choice value ENABLE_EXPIRED turns on expired license functionality and insurance notification functionality. #Licensing #Communications"},
{"StdChoice":"EVENT_ACTION","Desc":"Use this Standard Choice to identify all possible event actions for the event manager and the script engine. The Standard Choice values you create populate the Action list in the script. #EMSE"},
{"StdChoice":"EVIDENCE_LOCATION","Desc":"Defines the value options for the Evidence Location drop-down list in the evidence  form (new/edit). #Enforcement"},
{"StdChoice":"EVIDENCE_TYPE","Desc":"Defines the value options for the Evidence Type drop-down list in the evidence form  (new/edit) #Enforcement"},
{"StdChoice":"EXPIRATIONDATE_DISPLAY_FLAG","Desc":"Allows you to control the display of the expiration date field on the credit card payment review screen. #FeesPayments"},
{"StdChoice":"LOOKUP_TABLE_PAGE_SIZE","Desc":"Defines the page size for ASI look-up tables. #UserInterface #CustomFields"},
{"StdChoice":"MEETING BODY","Desc":"Defines the value options for meeting bodies. Users can update this list from either  Standard Choices or Meeting Bodies. #Meetings"},
{"StdChoice":"MEETING LOCATION","Desc":"Determines the venues where you can conduct meetings, such as a City Hall or a County Administration Building. #Meetings"},
{"StdChoice":"MEETING_REASON_COMMENT","Desc":"Determines the types of meeting reasons agency users can select, such as Tax Hearing or Application Review. Agency users select a meeting reason for each application on a  meeting agenda. #Meetings"},
{"StdChoice":"MEETING_TYPE_STATUS_CITY_COUNCIL","Desc":"Defines the status values for each meeting status group. You can enter three different meeting status values: APPROVED, PENDING, and DENIED. #Meetings"},
{"StdChoice":"PART_CONTACT_TYPE","Desc":"Asset Management Part Contact Types #Assets"},
{"StdChoice":"PART_UNIT_OF_MEASURE","Desc":"Asset Management Part Units of Measure #Assets"},
{"StdChoice":"PAYMENT_CHECK_ACCOUNT_TYPE","Desc":"This Standard Choice defines the acceptable check account types. #FeesPayments"},
{"StdChoice":"PENALTY_FEE_FUNC","Desc":"Populates the Penalty Fee Function drop down list in the expiration code configuration screen.  #Licensing"},
{"StdChoice":"PORTLET_ICONTEXT_FLAG_INTERNAL","Desc":"Changes the view of the buttons in the UI.  Yes=Display button labels and help text. No=Small icon buttons. Default is NO.   #UserInterface"},
{"StdChoice":"HEARING MAX TIME","Desc":"Determines the length (in minutes) of hearings. For example, you might want to measure hearing times in fifteen minute increments: 15, 30, 45, 60, 75, and 90. #Meetings"},
{"StdChoice":"INSPECTIONS_BY_UNIT","Desc":"Defines the IUN field type. Choices are either free text entry (TEXTBOX) or a list of options (SELECTLIST). #Inspections"},
{"StdChoice":"REMOVE_REQUIRED_IN_DAILY_CONDITIONS","Desc":"Controls whether Required displays as an option in the Severity field on daily conditions. You can set this configuration for each module, Building for example. Set Value Desc=Yes to remove Required from drop down list.   #Conditions"},
{"StdChoice":"RENEWAL_FEE_FUNC","Desc":"Populates the Renewal Fee Function drop down list in the expiration code configuration screen.  #Licensing"},
{"StdChoice":"SALUTATION","Desc":"The Standard Choice values populate in the Salutation drop-down list in the Contact, Licensed Professional, and Record portlets. #Contacts #Professionals"},
{"StdChoice":"STRUCTURE_ESTABLISHMENT_LAND_USE","Desc":"Determines the land use drop down values for structures and establishments. #StructuresEstablishments"},
{"StdChoice":"TRUST_ACCOUNT_ONLY","Desc":"Controls the ability to display a prompt so a user can choose to pay with a trust account or an alternative payment method.    Yes - Pay with trust account only.  No - Prompt for alternate payment method.  #FeesPayments"},
{"StdChoice":"VALUE_DATA_TYPE","Desc":"Populates the Value Data Type DDList on the Structures and Establishments attribute creation page.  #StructuresEstablishments"},
{"StdChoice":"APPLICATION_STATUS_REASON","Desc":"This Standard Choice controls the reasons a user can choose from when changing record status. #UserInterface"},
{"StdChoice":"AA_EDMS_DISALLOWED_FILE_TYPES","Desc":"This Standard Choice specifies the disallowed file extensions for uploading to EDMS.  #EDMS"},
{"StdChoice":"ACA_APPLICANT_DISPLAY_RULE","Desc":"Controls whether or not the applicant information is displayed on the record detail page in ACA. THIS IS CONFIGURED IN ACA ADMIN.  #ACA"},
{"StdChoice":"ACA_CONFIGS","Desc":"Controls most Citizen Access features and is mostly configured via the ACA Admin tool. See the Configuration Reference. #ACA"},
{"StdChoice":"ACA_CONFIGS_LINKS","Desc":"Controls most Citizen Access features and is mostly configured via the ACA Admin tool. See the Configuration Reference. #ACA"},
{"StdChoice":"ACA_EMAIL_REGISTRATION_FROM","Desc":"Provides the ability to designate the From email address from which Civic Platform sends the registration confirmation email to users that register for an Citizen Access account. NOTE: Enabling overrides Communication Manager #Communications #ACA"},
{"StdChoice":"ADHOC_REPORT_DB_VIEW","Desc":"Controls which DB views are available in the Ad hoc report designer. Administrators can set permissions to define who can access the data for ad hoc reporting. #Reporting"},
{"StdChoice":"ALERT_MESSAGE_TYPE","Desc":"Determines the valid values for the Alert Message Type drop down list in Alert administration.  #Communications"},
{"StdChoice":"COMMUNICATION_SMS_PROVIDERS","Desc":"This Standard Choice includes the values available for agency users to choose from in Communication Manager configuration settings #Communications"},
{"StdChoice":"COMPLAINT REFERRED TYPE","Desc":"Specific to the Code Enforcement module. Activate this it to display a drop-down list of values in the Reported Type field.  #Enforcement"},
{"StdChoice":"CONTACT_TYPE_ENABLE","Desc":"Determines whether user can specify the type of contact (individual or organization). #Contacts"},
{"StdChoice":"CALENDAR_BLOCK_SIZE","Desc":"CALENDAR_BLOCK_SIZE and CALENDAR_BLOCK_UNIT jointly determine the time length for the default calendar time block. #Calendars"},
{"StdChoice":"CAP_CHILD_DOCUMENT","Desc":"Allows you to associate the related or renewal document of a child record to the parent record. #RelatedRecords #EDMS"},
{"StdChoice":"DEFAULT_NUMBER_BUILDINGS","Desc":"Populates a default value in the Number of Buildings field. #Land"},
{"StdChoice":"DISABLE_TAB_RECORD_COUNT","Desc":"Disables the counts displayed on Record detail tabs. For example, Documents (5), Inspections(2). Try this to troubleshoot page load performance issues.   #System  #System"},
{"StdChoice":"DOCUMENT REVIEW STATUS","Desc":"This Standard Choice defines a document  review status group. Each document review  status group can have several values, each  value representing a document review status.  A document type can be associated with a  document review status group. #EDR"},
{"StdChoice":"EMSE_EXECUTE_OPTIONS","Desc":"Specifies whether to invoke JavaScript, Standard Choice Control scripts, or both. This is used by Master Scripts 3.0 or Higher #EMSE"},
{"StdChoice":"EMSE_VARIABLE_BRANCH_PREFIX","Desc":"Specifies a list of events with their corresponding abbreviation prefixes. The Value Desc specifies the prefix used by the JavaScript filename. This is used by Master Scripts 3.0 or Higher #EMSE"},
{"StdChoice":"ENABLE_ANONYMOUS_REPORT","Desc":"Provides the ability to extend or limit report functionality to anonymous users in Citizen Access #Reports"},
{"StdChoice":"ENABLE_CAP_TYPE_ALIAS","Desc":"Allows users to view record type alias names instead of viewing the standard four level  record type of group, type, subtype, and category. #UserInterface #Records"},
{"StdChoice":"ENABLE_DISPLAY_ISLAMIC_CALENDAR","Desc":"Controls whether to support HRIJI (Islamic) dates and HRIJI (Islamic) calendar date  picker. #Calendar"},
{"StdChoice":"ENABLE_EMAIL_NOTIFICATION_PROMPT","Desc":"Determines whether a user can choose an email template for meeting invites, and also controls whether email notification pop-up window displays #Communications"},
{"StdChoice":"ENABLE_MULTIPLE_CONDITION_GROUP_FOR_TYPE","Desc":"Determines whether you can associate multiple condition groups with the same condition type. #Conditions"},
{"StdChoice":"ENABLE_PARCEL_ENDORSEMENT","Desc":"Deleting a GIS object from the application intake form or from the GIS tab on the record detail portlet removes parcels associated with the object. #APO"},
{"StdChoice":"ENABLE_PAYMENT_ENDORSEMENT","Desc":"Display the Print Application Endorsement button on the receipt summary of a record (Record > Payment tab > Check receipt number > receipt summary). #FeesPayments"},
{"StdChoice":"ENABLE_THE_DISPLAY_OF_SECURITY_ANSWER","Desc":"Defines whether to display the answers to security questions as text or dots in the  Public User administration portlet. #ACA #Security"},
{"StdChoice":"LICENSED PROFESSIONAL TYPE","Desc":"Defines the value options for the drop-down list of the licensed professional type. Adds the ability to store Education Providers in the Licensed Professional list. #Licensing"},
{"StdChoice":"REFERENCE_CONTACT_RELATIONSHIP","Desc":"Defines the drop down list values that describe the relationships between two reference contacts.  #Contacts"},
{"StdChoice":"REFUND_PAYMENT_REASON","Desc":"Defines the drop down list values in the Reason field that users can select when refunding payments.   #FeesPayments"},
{"StdChoice":"REF_ADDRESS_TYPE","Desc":"Use this Standard Choice for the reference address in conjunction with FID 0276-Address Type Group and FID 0277-Address Type for the reference address (when enabled). #APO"},
{"StdChoice":"LICENSING BOARD","Desc":"License Type for contractor license records and LP records #Licensing"},
{"StdChoice":"LOAD_TO_RECORD_PORTLET","Desc":"Determines whether a record always opens in the record portlet when users select it from the Navigation drop-down list. #UserInterface #Records #v360Only"},
{"StdChoice":"LOGO_TYPE_CATEGORY","Desc":"Logo Type Dropdown Values for the Civic Platform, Citizen Access, Ad Hoc Reporing, and Food Facility Inspections. #System"},
{"StdChoice":"MASKS","Desc":"Controls the configuration of a mask for the parcel number, SSN and FEIN fields. #System"},
{"StdChoice":"MULTIPLE_APO_GIS_SELECTION","Desc":"Enables the ability to select multiple APO or GIS data and attach them to a record. This must be enabled for GIS Attribute Mapping to ASI Fields to work. #APO #GIS"},
{"StdChoice":"MULTIPLE_LICENSE_PROFESSIONAL","Desc":"Associate more than one licensed professional with an application, set a primary professional, add professionals, and remove professionals from the application. #Licenses"},
{"StdChoice":"PARCELSET_SCRIPT_LIST","Desc":"Allows EMSE scripts to execute on a parcel set. Enter the EMSE script name as the Standard Choices value. Then, in the Value Desc field, enter the name to display in the drop-down list for this script. #EMSE"},
{"StdChoice":"PARTS_ALLOW_NEGATIVE_QUANTITY","Desc":"Allows the quantity of a part inventory to be negative. Civic Platform sends an alert message when a user attempts a part transaction that requests a quantity greater than the quantity on hand. #Assets"},
{"StdChoice":"PART_LOCATION_TYPE","Desc":"Asset Management Part Location Types #Assets"},
{"StdChoice":"PAYMENT_CHECK_TYPE","Desc":"allows agencies to take payments from electronic checks and from account debit cards. After you create this Standard Choice, you can accept electronic checks and accept account debit cards. #FeesPayments"},
{"StdChoice":"PAYMENT_RECEIVED_TYPE","Desc":"Defines the value options for the Received drop-down list field on all payment locations in Civic Platform, and the value options for the Refunded drop-down list field on the Refund page. #FeesPayments"},
{"StdChoice":"PAYMENT_REMITTER_CONTACT_TYPE","Desc":"Defines a remitter contact type, which displays on the check endorsement page.  Set the value of this Standard Choice to a valid contact type, for example, Applicant. #FeesPayments"},
{"StdChoice":"PHONE_NUMBER_IDD_ENABLE","Desc":"Expands the phone and fax number fields to allow users to enter a country code. Once you enable this Standard Choice, you must enable and add values to the Standard Choice  PHONE_NUMBER_IDD. #Contacts"},
{"StdChoice":"POINT_OF_SALE_FEE_SCHEDULE","Desc":"Allows an agency to specify the fee schedule category that you want to apply to point  of sale items. Use the Value and Value Desc fields to relate a fee item and to a specific fee schedule. #POS"},
{"StdChoice":"POINT_OF_SALE_TYPE","Desc":"Provides an agency with a way to customize a unique record ID for different values in the Value Desc field. See Configuration Reference. #POS"},
{"StdChoice":"POPULATE_CURRENT_USER_TO_APPLICANT","Desc":"Each module listed populates the current user as the applicant in the Single Portlet Entry and Renewal form in Citizen Access. #Records"},
{"StdChoice":"EXTERNAL_PROVIDER_ADAPTER","Desc":"Stores the agency customized external provider adapter web service URL. #Education"},
{"StdChoice":"FIND_TIME_ACCOUNTING_LOGGED_DATE_RANGE","Desc":"Configures the default Logged From date in the time accounting search portlet. The default Logged To date is the current date. #TimeAccounting"},
{"StdChoice":"FISCAL_YEAR_START","Desc":"Specifies that the sequence number generator uses the fiscal year instead of calendar year to generate numbering. #System"},
{"StdChoice":"RELATED_CAP_CONFIG","Desc":"Formats the record fields for the related record tree view  #Records #RelatedRecords"},
{"StdChoice":"REPORTS FROM GIS OBJECTS","Desc":"This Standard Choice enables users to run reports based on GIS objects.  #GIS"},
{"StdChoice":"SESSION_TIMEOUT","Desc":"Configures the session time-out value (in seconds) at the agency level and overrides the session time-out setting at the web server level.  #Security"},
{"StdChoice":"SPELL_CHECKER_ENABLED","Desc":"Enables the built in spell checker on text area fields (comments). #UserInterface"},
{"StdChoice":"STATUS_OF_CONDITIONS_OF_APPROVAL","Desc":"Defines the statuses available in the status drop down list for conditions of approval. You define the Standard Choice values as the options in the status field for a condition of approval.  #Conditions"},
{"StdChoice":"TRUST_ACCOUNT_ADMINISTRATOR","Desc":"Defines the trust account administrator name and the email address for sending notifications. For example, you can set up a threshold amount in a trust account and automatically send a notification administrator. #FeesPayments"},
{"StdChoice":"UNIT_TYPE","Desc":"This standard choice determines the unit values available in the Asset Management attribute unit types drop down list. #Assets"},
{"StdChoice":"VAL_CALC_BY_RECORD_TYPE","Desc":"This Standard Choice controls the default state of the Filter by Record Type option in the Valuation Calculator section of Civic Platform.  This functionality also extends into Citizen Access. #Land"},
{"StdChoice":"WO_TASK_DURATION_SAME_AS_DEFAULT","Desc":"When this standard choice is set to No, the work order task duration defaults to zero. #Assets"}];

	return descJSON;
}

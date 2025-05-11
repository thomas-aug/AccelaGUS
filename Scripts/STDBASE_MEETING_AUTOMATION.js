/*==========================================================================================
Title : Meeting Automation

Purpose : Creates and/or schedules a meeting using the rules included in the JSON object. 

Author: Nickie Albert

Functional Area : Meetings

Description:
{
  "Marijuana/Combo/Testing Facility/License": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Meeting Automation",
          "operators": {
            
          }
        },
        "criteria": {
          "task": [
            "Zoning Review"
          ],
          "status": [
            "Meeting Required"
          ]
        },
        "action": {
          "meetingAction": "",         // options are "schedule" or "create", if option = "create", script will also schedule the record for the newly created meeting
          "meetingCalendarName": "",   //configured meeting calendar name	
          "meetingName": "",           //configured meeting name
          "meetingBody": "",           //configured meeting body
          "meetingSubject": "",        //subject for the meeting
          "meetingLocation": "",       //configured meeting location
          "meetingStatus": "",         //configured meeting status
          "meetingDate": "",           //meeting date mm/dd/yyyy
          "startTime": "",             //start time hh:mm
          "endTime": "",               //end time hh:mm
          "comments": "",              //misc comments
          "reason": "",                //configured Reason, only used for scheduling
          "emailTo": "",               //contact type to whom email should be sent (i.e., Applicant)
          "emailNotificationTemplate": "", //configured notification template name
          "addOutlookMeetingFor": ""       //user to whom outlook meeting should be added (choices are "Workflow User", "Cap Assigned User")
        },
        "postScript": ""
      }
    ]
  }
}
Reviewed By: 

Script Type : (EMSE, EB, Pageflow, Batch): EMSE

General Purpose/Client Specific : General

Client developed for : Aurora

Parameters: capId, rules			
================================================================================================================*/
try {
	var scriptSuffix = "MEETING_AUTOMATION";
	eval(getScriptText("CONFIGURABLE_SCRIPTS_COMMON"));
	var settingsArray = [];
	if (isConfigurableScript(settingsArray, scriptSuffix)) {

		for (s in settingsArray) {
			var rules = settingsArray[s];
			var preScript = rules.preScript;
			// run preScript
			if (!isEmptyOrNull(preScript)) {
				eval(getScriptText(preScript, null, false));
			}
			if (cancelCfgExecution) {
				logDebug("**WARN STDBASE Script [" + scriptSuffix + "] canceled by cancelCfgExecution");
				cancelCfgExecution = false;
				continue;
			}

			meetingAutomation(capId, rules);
			var postScript = rules.postScript;
			// / run post script
			if (!isEmptyOrNull(postScript)) {
				eval(getScriptText(postScript, null, false));
			}
		}
	}

} catch (ex) {
	logDebug("**ERROR: Exception with JSON rules for script " + scriptSuffix + ". Error: " + ex);
}

// functions

function meetingAutomation(capId, rules) {

	//	var meetingCalendarId = rules.action.meetingCalendarID;
	var meetingCalendarName = rules.action.meetingCalendarName;
	var meetingAction = rules.action.meetingAction;
	var meetingName = rules.action.meetingName;
	var meetingBody = rules.action.meetingBody;
	var meetingSubject = rules.action.meetingSubject;
	var meetingLocation = rules.action.meetingLocation;
	var meetingStatus = rules.action.meetingStatus;
	var meetingDate = rules.action.meetingDate;
	var startTime = rules.action.startTime;
	var endTime = rules.action.endTime;
	var comments = rules.action.comments;
	var reason = isEmptyOrNull(rules.action.reason) ? "" : rules.action.reason;
	var emailTo = rules.action.emailTo;
	var emailNotificationTemplate = rules.action.emailNotificationTemplate;
	var addOutlookMeetingFor = rules.action.addOutlookMeetingFor;

	// check to see if meeting exists and is available 
	// if so, schedule
	// if not, create meeting and schedule
	if (!isEmptyOrNull(meetingStatus)) {
		meetingStatus = "Scheduled";
	}
	var startDatetime, endDatetimevar, jStartDate, jEndDate, jsReqDate;
	//set up dates and times
	if (!isEmptyOrNull(meetingDate) && !isEmptyOrNull(startTime))
		startDatetime = meetingDate + " " + startTime;
	if (!isEmptyOrNull(meetingDate) && !isEmptyOrNull(endTime))
		endDatetime = meetingDate + " " + endTime;
	if (!isEmptyOrNull(startDatetime)) {
		jStartDate = new java.util.Date(startDatetime);
		var cal = java.util.Calendar.getInstance();
		cal.setTime(jStartDate); // sets calendar time/date 
		cal.getTime();
		var jEndDate = new java.util.Date(endDatetime);
		jEndDate = cal.getTime();
		recDate = new java.util.Date();
		jsReqDate = convertDate(startDatetime);

	}

	var meetingCalendarId = null;
	if (!isEmptyOrNull(meetingCalendarName)) {
		var cals = aa.meeting.getMeetingCalendars(meetingCalendarName);
		cals = cals.getOutput(); //[MeetingGroupModel
		if (cals != null && cals.length > 0) {
			meetingCalendarId = cals[0].getMeetingGroupId();
		}
	}

	//scheduleMeeting function will return either false if no meeting scheduled or the meeting id if it was
	var meetingId;
	if (!isEmptyOrNull(jsReqDate) && !isEmptyOrNull(meetingBody) && !isEmptyOrNull(meetingCalendarName) && !isEmptyOrNull(meetingCalendarId) && !isEmptyOrNull(meetingLocation)) {

		//either create or try to find available:
		if (meetingAction.toLowerCase() == "create") {
			meetingId = addMeeting(meetingCalendarId, meetingName, meetingBody, meetingStatus, meetingLocation, startDatetime, jStartDate, jEndDate);
		} else if (meetingAction.toLowerCase() == "schedule") {
			meetingId = getAvailableMeeting(startDatetime, meetingBody, meetingCalendarName, meetingLocation);
		} else {
			logDebug("Unsupported meeting action " + meetingAction);
		}

		//if we have ID, schedule it
		if (meetingId) {
			scheduleMeeting(meetingId, meetingCalendarId, reason);
		}
	}//meeting parameters are OK

	// send notification
	if (!isEmptyOrNull(emailTo)) {
		var replyAddr = "noreply@accela.com";
		var contEmail = null;
		var contArr = getContactArray(capId);
		if (contArr.length > 0) {
			for (x in contArr) {
				if (contArr[x]["contactType"] == emailTo) {
					contEmail = contArr[x]["email"];
					var emailParameters = aa.util.newHashtable();
					addParameter(emailParameters, "$$meetingName$$", meetingName);
					addParameter(emailParameters, "$$meetingDate$$", meetingDate);
					addParameter(emailParameters, "$$meetingTime$$", startTime);
					addParameter(emailParameters, "$$meetingSubject$$", meetingSubject);
					addParameter(emailParameters, "$$meetingComments$$", comments);
					addParameter(emailParameters, "$$meetingLocation$$", meetingLocation);
					addParameter(emailParameters, "$$meetingBody$$", meetingBody);
					sendNotification(replyAddr, contEmail, "", emailNotificationTemplate, emailParameters, null);
				} else {
					logDebug("No contact of type of " + emailTo + " exists on this record. No email was sent.");
				}
			}
		} else {
			logDebug("No contacts exist on this record. No email was sent.");
		}
	}

	// add to Outlook calendar
	if (!isEmptyOrNull(addOutlookMeetingFor)) {
		var userID = addOutlookMeetingFor;

		if (addOutlookMeetingFor == "Workflow User") {
			userID = getTaskAssignedStaff(wfTask);
		}
		if (addOutlookMeetingFor == "Cap Assigned User") {
			capDetail = aa.cap.getCapDetail(capId).getOutput();
			userObj = aa.person.getUser(capDetail.getAsgnStaff());
			if (userObj.getSuccess()) {
				staff = userObj.getOutput();
				userID = staff.getUserID();
			}
		}
		//logDebug("userID: " + userID);

		var taskModel = aa.communication.getNewTaskModel().getOutput();
		taskModel.setSubject(meetingSubject);
		taskModel.setBody(meetingBody);
		taskModel.setStartDate(jStartDate);
		taskModel.setStatus(meetingStatus);
		taskModel.setAssignedStaffID(userID);
		taskModel.setServiceProviderCode(aa.getServiceProviderCode());

		var taskResult = aa.communication.createTask(taskModel);
		if (taskResult.getSuccess()) {
			var taskOutput = taskResult.getOutput();
			logDebug("May have created Outlook invite #" + taskOutput);
		}
	}

}

/*==========================================================================================
| HELPER FUNCTIONS
========================================================================================== */

function addMeeting(meetingCalendarId, meetingName, meetingBody, meetingStatus, meetingLocation, startDatetime, jStartDate, jEndDate) {
	var addMtg = aa.meeting.addMeeting(meetingCalendarId, meetingName, "MEETING", startDatetime);
	addMtg = addMtg.getOutput();
	if (addMtg == null || addMtg.size() == 0) {
		var calBiz = aa.proxyInvoker.newInstance("com.accela.calendar.business.CalendarBusiness").getOutput();
		var eventList = new java.util.ArrayList();
		var eventModel = aa.proxyInvoker.newInstance("com.accela.aa.calendar.calendar.CalendarEventModel").getOutput();
		eventModel.setServiceProviderCode(aa.getServiceProviderCode());
		eventModel.setEventType("MEETING");
		eventModel.setCalendarID(meetingCalendarId);
		eventModel.setStartDate(jStartDate);
		eventModel.setEndDate(jEndDate);
		eventModel.setDayOfWeek(jStartDate.getDay());
		eventModel.setEventName(meetingName);
		eventModel.setRecStatus("A");
		eventModel.setRecFullName("ADMIN");
		eventModel.setRecDate(recDate);
		eventModel.setHearingBody(meetingBody);
		eventModel.setEventDuration(60);
		eventModel.setMaxUnits(1.0);
		eventModel.setEventStatus(meetingStatus);
		eventModel.setEventStatusType("Scheduled");
		eventModel.setEventLocation(meetingLocation);
		eventList.add(eventModel);
		var eventCreated = calBiz.createEvent(eventList, "ADMIN");
		logDebug("Successfully created meeting ID: " + eventCreated);
		return eventCreated;
	} else {//addMeeting() failed
		return addMtg.get(0);
	}
	return false;
}

function getAvailableMeeting(jsRequestDateStr, mtgBody, mtgCal, mtgLoc) {
	var startDate = aa.date.parseDate(jsRequestDateStr);
	var endDate = aa.date.parseDate(dateAdd(jsRequestDateStr, 1, "Y"));

	var jsRequestDate = convertDate(jsRequestDateStr);
	var mtgRes = aa.meeting.getAvailableMeetings(mtgBody, 0, mtgCal, startDate, endDate, null, mtgLoc);
	var meetings = []
	if (mtgRes.getSuccess())
		meetings = mtgRes.getOutput();
	else
		return false;

	for ( var m in meetings) {
		startMtg = "" + meetings[m].getStartDate();
		meetDate = new Date(startMtg.substring(5, 7) + "/" + startMtg.substring(8, 10) + "/" + startMtg.substring(0, 4) + " " + startMtg.split(" ")[1].slice(0, 8))
		if (meetDate >= jsRequestDate && meetDate <= jsRequestDate) {
			return meetings[m].getMeetingId();
		}
	}//for all meetings

	logDebug("Meeting date requested is not available")
	return false;
}

function scheduleMeeting(meetingId, meetingCalendarId, reason) {
	try {
		var scheduledResult = aa.meeting.scheduleMeeting(capId, meetingCalendarId, meetingId, "0", reason, "");
		if (scheduledResult.getSuccess()) {
			logDebug("Meeting successfully scheduled meetingId=" + meetingId + ".");
			return meetingId;
		} else {
			logDebug("Failed to schedule meeting.  Please manually schedule the meeting.");
			return false;
		}
	} catch (err) {
		logDebug("Error in script " + scriptSuffix + "function scheduleMeeting: " + err)
	}
}

function getTaskAssignedStaff(wfstr) // optional process name.
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var taskDesc = wfstr;
	if (wfstr == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(capId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var vStaffUser = aa.cap.getStaffByUser(fTask.getAssignedStaff().getFirstName(), fTask.getAssignedStaff().getMiddleName(), fTask.getAssignedStaff().getLastName(),
					fTask.getAssignedStaff().toString()).getOutput();
			if (vStaffUser != null) {
				return vStaffUser.getUserID();
			}
		}
	}
	return false;
}

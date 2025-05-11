/*===========================================

Title : INCLUDES_EXPRESSIONS

Functional Area : Accela Product Management and Delivery Solutions

Description : This INCLUDES script contains utility functions to support advanced expression developement

=========================================== */
logDebug("====IMPORTING INCLUDES_EXPRESSIONS====");

function getMessageStyle()
	{
	var cssStyle = "<style>.infoMsg, .successMsg, .warningMsg, .errorMsg, .validationMsg {	\
		margin: 10px 0px; \
		padding:12px;	\
	}	\
	.infoMsg {	\
		color: #00529B;	\
		background-color: #BDE5F8;	\
	}	\
	.successMsg {	\
		color: #4F8A10;	\
		background-color: #DFF2BF;	\
	}	\
	.warningMsg {	\
		color: #9F6000;	\
		background-color: #FEEFB3;	\
	}	\
	.errorMsg {	\
		color: #D8000C;	\
		background-color: #FFBABA;	\
	}	\
	.infoMsg i, .successMsg i, .warningMsg i, .errorMsg i {	\
    margin:10px 22px;	\
    font-size:2em;	\
    vertical-align:middle;	\
	}</style>";
	return cssStyle;
}

function logDebug(dstr)
	{
		var vLevel = "info";
		if (arguments.length == 2) {
			vLevel = arguments[1]; // debug level
		}
		var levelCSS="infoMsg";
		if(vLevel.toUpperCase()=="INFO") levelCSS="infoMsg";
		if(vLevel.toUpperCase()=="SUCCESS") levelCSS="successMsg";
		if(vLevel.toUpperCase()=="WARNING") levelCSS="warningMsg";
		if(vLevel.toUpperCase()=="ERROR") levelCSS="errorMsg";
		var msgFormatted = "<div class=\"" + levelCSS + "\">" + dstr + "</div>";
		debug += msgFormatted;
	}

function notice(dstr)
	{
		var vLevel = "info";
		if (arguments.length == 2) {
			vLevel = arguments[1];
		}
		var levelCSS="infoMsg";
		if(vLevel.toUpperCase()=="INFO") levelCSS="infoMsg";
		if(vLevel.toUpperCase()=="SUCCESS") levelCSS="successMsg";
		if(vLevel.toUpperCase()=="WARNING") levelCSS="warningMsg";
		if(vLevel.toUpperCase()=="ERROR") levelCSS="errorMsg";
		var msgFormatted = getMessageStyle();
		msgFormatted += "<div class=\"" + levelCSS + "\">" + dstr + "</div>";

		return msgFormatted;
	}


function lookup(stdChoice,stdValue)
	{
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);

   	if (bizDomScriptResult.getSuccess())
   		{
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
		}
	return strControl;
	}

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

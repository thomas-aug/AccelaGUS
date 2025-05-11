/** 
 * INCLUDES_LOGGING contains enhanced logMessage and logDebug functions for formatting popup windows.
 * @namespace INCLUDES_LOGGING
 * @example Add an eval to INCLUDES_CUSTOM to get INCLUDES_LOGGING
    //Get INCLUDES_LOGGING for formatting message windows.
    eval(getScriptText("INCLUDES_LOGGING", null, false));
*/

function logMessage(dstr)
{
  var vLevel = "info";
  if (arguments.length == 2) {
    vLevel = arguments[1];
  }
  var levelCSS="infoMsg";
  if(vLevel.toUpperCase()=="INFO") levelCSS="alert-info";
  if(vLevel.toUpperCase()=="SUCCESS") levelCSS="alert-success";
  if(vLevel.toUpperCase()=="WARNING") levelCSS="alert-warning";
  if(vLevel.toUpperCase()=="ERROR") levelCSS="alert-danger";
  
  msgFormatted = "<div class=\"" + "alert " + levelCSS + "\">" + dstr + "</div>";
  message += msgFormatted + br;
}

function getMessageStyle(){
  var css = "<style>" + 
  ".overEventWindow { "     +
  "    float: left; " +
  "    clear: both; "     +
  "    position: absolute; "     +
  "    top: 0px; "     +
  "    left: 0px; "     +
  "    padding: 10px; " +
  "    background-color: white; "     +
  "    width: 100%; "     +
  "    height: 100%;  "     +
  "}"   +
  ".overEventWindow i { "   +
  "    display: none; "    +
  "}" +
  " .alert {  "     +
  "    padding: 10px; "     +
  "    border: 1px solid transparent; "     +
  "    border-radius: 4px; "     +
  "}  "     +
  ".alert-success {  "     +
  "    color: #3c763d; "     +
  "    background-color: #dff0d8; "     +
  "    border-color: #d6e9c6; "     +
  "}  "     +
  ".alert-warning { "     +
  "    color: #8a6d3b; "     +
  "    background-color: #fcf8e3; "     +
  "    border-color: #faebcc; "     +
  "} "     +
  ".alert-info { "     +
  "    color: #31708f; "     +
  "    background-color: #d9edf7; "     +
  "    border-color: #bce8f1; "     +
  "} "     +
  ".alert-danger { "     +
  "    color: #a94442; "     +
  "    background-color: #f2dede; "     +
  "    border-color: #ebccd1; "     +
  "} "     +
  ".alert-dismissable, .alert-dismissible {  "     +
  "    padding-right: 35px; "     +
  "}  "     +
  "</style>";
  return css; 
}

var messageCSS = getMessageStyle();
var messageDiv = "<div class='overEventWindow'>";
message += messageCSS;
message += messageDiv;

var timer = "<div>This message will close in <span id=\"time\">05</span> seconds..</div>";
var timerJs = "function startTimer(duration,display){var timer=duration,seconds;setInterval(function(){seconds=parseInt(timer%60,10);seconds=seconds<10?'0'+seconds:seconds;if(seconds==0){display.textContent='Closing'; window.close(); return true}display.textContent=seconds;if(--timer<0){timer=duration}},1000)}var fiveSeconds=5,display=document.querySelector('#time');startTimer(fiveSeconds,display);";
var jsImg = "<img style=\"display:none; margin:10px; \" onLoad=\"" + timerJs + "\" src=\"http://www.accela.com/media/system/images/arrow.png\"></img>"
message += timer + jsImg;
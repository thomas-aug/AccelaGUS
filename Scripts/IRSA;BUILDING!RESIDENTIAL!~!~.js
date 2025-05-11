showDebug = true;
  
if (inspType == "Footing & Foundation" && (inspResult == "Passed") || (inspResult == "Waived")) {

	closeTask("Utilities Review","Approved",inspComment,"Closed via script");
}
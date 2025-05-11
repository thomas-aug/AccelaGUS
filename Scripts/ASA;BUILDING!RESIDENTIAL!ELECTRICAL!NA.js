try{
	
//Start Group Exercise 2
//@TODO - Clarify with client any criteria
//My name is Tom
	
	addStdCondition("Building Permit","Utility Locate");

//End Group Exercise 2

} catch (err){
	logDebug("A JavaScript Error occured in ASA:BUILDING/RESIDENTIAL/ELECTRICAL/NA: " + err.message + " In Line " + err.lineNumber);
}
//DUA test for parcel document upload

// if(currentUserID == "ADMIN"){
//	showDebug=true;
// }
logDebug("DUA:*/*/*/* capId: " + capId);

var capList = aa.env.getValue("CapIDList");
logDebug("capList: " + capList);
 capIdArray = aa.env.getValue("CapIDList").toArray();
    if (capIdArray) {
        for (var thisCapId in capIdArray) {
			if (capIdArray[thisCapId] != null){
				logDebug("capIdArray[thisCapId] !null: " + capIdArray[thisCapId]);
				aa.env.setValue("PermitId1",capIdArray[thisCapId].getID1());
				aa.env.setValue("PermitId2",capIdArray[thisCapId].getID2());
				aa.env.setValue("PermitId3",capIdArray[thisCapId].getID3());
				//eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
			}
	    }    	
    }
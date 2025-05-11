showDebug = true;

if (wfTask == "Public Works Review" && wfStatus == "Approved") {

	showMessage = true;
	comment("There is a balance due of: " + balanceDue);
	cancel = true;
}
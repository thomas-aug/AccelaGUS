if (wfTask == "Background Investigation" && wfStatus == "Completed" && balanceDue > 0){
showMessage = true;
comment("There is a balance due on the record of " + balanceDue);
cancel = true;
}
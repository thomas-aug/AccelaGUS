/*------------------------------------------------------------------------------------------------------/
| Program: SET_CLONE_TEST_RECORDS.js  Trigger: Set
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Script Test Parameters
/------------------------------------------------------------------------------------------------------*/
/*
//  SCRIPT TEST PARAMETERS
var mySetID = "CLONE_EH_SOLAUTO_20180905";
var setMemberArray = new Array(); 
var setMemberResult = aa.set.getCAPSetMembersByPK(mySetID);
if (setMemberResult.getSuccess()) 
{
	setMemberArray = setMemberResult.getOutput().toArray();
	aa.env.setValue("SetMemberArray",setMemberArray);
	aa.env.setValue("SetID",mySetID);
	aa.env.setValue("ScriptName","CLONE TEST RECORDS");
	aa.env.setValue("CurrentUserID","JPLAISTED");
} 
else 
{
	logDebug("Error: Could not find set by PK: " + mySetID);
}
*/
/*------------------------------------------------------------------------------------------------------/
| END Script Test Parameters
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 3.0
batchJobName="";
batchJobID="";
var capId;
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
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
/*------------------------------------------------------------------------------------------------------/
| END Includes
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Initialize Standard Variables
/------------------------------------------------------------------------------------------------------*/
debug = "";	
br = "<BR>";
message =	"";
emailText = "";
currentUserID = aa.env.getValue("CurrentUserID");
systemUserObj = aa.person.getUser(currentUserID).getOutput();
SetMemberArray= aa.env.getValue("SetMemberArray");
SetId =  aa.env.getValue("SetID");
ScriptName =  aa.env.getValue("ScriptName");
sysDate = aa.date.getCurrentDate();
wfObjArray = null;
startDate = new Date();
startTime = startDate.getTime();			// Start timer
systemUserObj = aa.person.getUser(currentUserID).getOutput();
/*------------------------------------------------------------------------------------------------------/
| END Initialize Standard Variables
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Load Script Parameters
/------------------------------------------------------------------------------------------------------*/
var configStdChoice = "SET_SCRIPT_CLONE_TEST_RECORDS";  // the standard choice that contains the batch renewal configuration information

// script administration parameters
var script_email_address = lookup(configStdChoice, "script_email_address");
var showDebug = lookup(configStdChoice, "showDebug");	//debug level
if(showDebug=="false" || showDebug=="null" || showDebug==undefined) showDebug=false;

// set header cloning parameters
var set_new_set_id_prefix = lookup(configStdChoice, "set_new_set_id_prefix");
var set_new_set_name_prefix = lookup(configStdChoice, "set_new_set_name_prefix");
var set_new_set_status = lookup(configStdChoice, "set_new_set_status");
var set_new_set_type = lookup(configStdChoice, "set_new_set_type");
var set_copy_comment = lookup(configStdChoice, "set_copy_comment");

// record cloning parameters
var rec_new_app_status = lookup(configStdChoice, "rec_new_app_status");
var rec_new_exp_date = lookup(configStdChoice, "rec_new_exp_date");
var rec_new_exp_status = lookup(configStdChoice, "rec_new_exp_status");
var rec_copy_workflow = lookup(configStdChoice, "rec_copy_workflow");
var rec_copy_fees = lookup(configStdChoice, "rec_copy_fees");
var rec_auto_pay_fees = lookup(configStdChoice, "rec_copy_fees");
/*------------------------------------------------------------------------------------------------------/
| END Load Script Parameters
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Custom Code
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");
logDebug("Processing Set: " + SetId);

var success=false;

success = mainProcess();

if(success)
{
	logDebug("Job completed successfully.");
}
else 
{
	logDebug("Job failed, see log.");
}

logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

emailText = "Set Script Executed: " + ScriptName + "<br>" + emailText;

if (script_email_address=="false" || script_email_address=="null" || script_email_address==undefined)
	aa.sendMail("noreply@accela.com", script_email_address, "", ScriptName + " Results", emailText);


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess()
{

	var capCount = 0;

	var originalSetId = SetId;
	var originalSet = aa.set.getSetByPK(originalSetId).getOutput();
	var originalSetType = originalSet.getRecordSetType();
	var originalSetName = originalSet.getSetTitle();
	var originalSetComment = originalSet.getSetComment();
	var originalSetStatus = originalSet.getSetStatus();
	var originalSetStatusDate = originalSet.getSetStatusDate();

	// Create a new Set for clone
	var newSetName = set_new_set_name_prefix + "_" + aa.util.formatDate(aa.util.now(),"yyyyMMdd:hhmmss");
	var newSetID = set_new_set_id_prefix + "_" + aa.util.formatDate(aa.util.now(),"yyyyMMdd:hhmmss");
	var newSetType = set_new_set_type;
	var newSetStatus = set_new_set_status
	var newSetComment = "";
	if (set_copy_comment.substr(0,1)=='Y')
		newSetComment = originalSetComment; 

	var setCreateResult= aa.set.createSet(newSetID,newSetName);

	if (setCreateResult.getSuccess())
	{
		// update set type and status
		setScriptResult = aa.set.getSetByPK(newSetID);
		if (setScriptResult.getSuccess())
		{
			setScript = setScriptResult.getOutput();
			setScript.setRecordSetType(newSetType);
			setScript.setSetStatus(newSetStatus);
			setScript.setSetComment(newSetComment);
			updSet = aa.set.updateSetHeader(setScript).getOutput();
		}
		logMessage("Cloned Set: " + originalSetId + " to " +newSetID+"<br>");
	}
	else
	{
		logDebug("ERROR: Unable to create new Set ID "+newSetName+" created for CAPs processed by this batch job.");
		return false;
	}
	
	/*------------------------------------------------------------------------------------------------------/
	| BEGIN Loop through Set Members and Clone to new Set
	/-----------------------------------------------------------------------------------------------------*/
	for(var i=0; i < SetMemberArray.length; i++) 
	{
		var id= SetMemberArray[i];
		capId = aa.cap.getCapID(id.getID1(), id.getID2(),id.getID3()).getOutput();	  
		var clonedCapId = null;

		if (!capId)
			{
			logDebug("Could not get a Cap ID for " + id.getID1() + "-" + id.getID2() + "-" + id.getID3());
			continue;
		}
		
		var altId = capId.getCustomID();
		parentCapId = capId;
		logDebug("Cloning Record: " + altId);
		
		var cap = aa.cap.getCap(capId).getOutput();
		var capStatus = cap.getCapStatus();
		appTypeResult = cap.getCapType();		//create CapTypeModel object
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		appTypeAlias = cap.getCapModel().getAppTypeAlias();
		appName = cap.getCapModel().getSpecialText();

		capCount++;
		
		clonedCapId = createCap(appTypeString,appName);
		clonedCap = aa.cap.getCap(clonedCapId).getOutput();
		clonedAltId = clonedCapId.getCustomID();
		capId = clonedCapId;
		
		// add to the new set 
		var addMemberResult = aa.set.add(newSetID,clonedCapId);
		if (addMemberResult.getSuccess())
		{
			addMember = addMemberResult.getOutput();
			logDebug(clonedAltId + ": Successfully added to the Set: " + newSetName);
		}
		else
		{
			logDebug("Unable not add record: " + clonedAltId + " to the Set: " + newSetName);
		}
		
		logMessage("Cloned Record: " + altId + " to " + clonedAltId);
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(clonedCapId);
		aa.cap.createCapDetail(capDetailModel);

		aa.cap.copyCapDetailInfo(parentCapId, clonedCapId);

		//for Description Field
		aa.cap.copyCapWorkDesInfo(parentCapId, clonedCapId);
		
		// copy contacts
		copyContacts(parentCapId,clonedCapId);
		// copy addresses
		copyAddresses(parentCapId,clonedCapId);
		// copy licensed professionals
		copyLicensedProf(parentCapId,clonedCapId);
		// copy parcel gis objects
		copyParcelGisObjects(parentCapId,clonedCapId);
		// copy owner information
		copyOwnerLocal(parentCapId,clonedCapId);
		// copy scheduled inspections
		copySchedInspections(parentCapId,clonedCapId);
		// copy conditions
		copyConditions(parentCapId,clonedCapId);
		// copy valuation
		copyCalcVal(parentCapId,clonedCapId);				
		// copy fees
		if (rec_copy_fees.substr(0,1)=='Y')
		{
			var feeArr = new Array();
			var feeResult = aa.fee.getFeeItems(parentCapId);
			if (feeResult.getSuccess())
			{ 
				feeObjArr = feeResult.getOutput(); 
			}
			else
			{ 
				logDebug( "**ERROR: getting fee items: " + feeResult.getErrorMessage()); 
			}

			for (ff in feeObjArr)
			{
				fFee = feeObjArr[ff];
				
				feesched = fFee.getF4FeeItemModel().getFeeSchudle();	
				feecode =  fFee.getFeeCod();
				feeDesc = fFee.getFeeDescription();
				feeQty = fFee.getFeeUnit();
				feeAmount = fFee.getFee();
				feeStatus = fFee.getFeeitemStatus();
				feeperiod = fFee.getPaymentPeriod();
				applyDate = aa.date.getCurrentDate();
				if (fFee.getApplyDate()) applyDate = convertDate(fFee.getApplyDate());
				feeItemStatus = fFee.getFeeitemStatus();
				gfDisplay = fFee.getDisplay();
				accCod1 = fFee.getAccCodeL1();
				accCod2 = fFee.getAccCodeL2();
				accCod3 = fFee.getAccCodeL3();
				feeFormula = fFee.getFormula();
				udf1 = fFee.getUdf1();
				udf2 = fFee.getUdf2();
				udf3 = fFee.getUdf3();
				udf4 = fFee.getUdf4();
				calcFlag = fFee.getCalcFlag();
				feeCalcProc = fFee.getFeeCalcProc();
				
				if (feeStatus == "INVOICED")
				{
					var feeItemResult = aa.finance.createFeeItem(clonedCapId, feesched, feecode, feeperiod, feeQty);	
					var feeItemSeq;
					if(feeItemResult.getSuccess())
					{
						feeItemSeq = feeItemResult.getOutput();
						logDebug("Fee Item Created successfully. FEEITEM_SEQ_NBR: " + feeItemSeq + " | Fee Amount: " + feeAmount);
					}
					else
					{
						logDebug("Fee Item could not be created.");
					} 
					var feeSeqArray = new Array();
					var paymentPeriodArray = new Array();

					feeSeqArray.push(feeItemSeq);
					paymentPeriodArray.push(feeperiod);
					var invoiceResult_L = aa.finance.createInvoice(parentCapId, feeSeqArray, paymentPeriodArray);
					if (!invoiceResult_L.getSuccess())
						aa.print("**ERROR: Invoicing the fee items voided " + feecode + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
					
					// make cash payments for all fees
					if (rec_auto_pay_fees.substr(0,1)=="Y")
					{
						var feeInvoiceArray = aa.finance.getFeeItemInvoiceByFeeNbr(clonedCapId, feeItemSeq, null).getOutput();	
						var invoiceNbr = feeInvoiceArray[0].getInvoiceNbr();
						var cashierId = currentUserID;      //aa.print(cashierId);
						var payee = currentUserID;      //aa.print(payee);
						var paymentMethod = "Cash";      //aa.print(paymentMethod);
						var paymentComment = "Paid by Set Clone Script";      //aa.print(paymentComment);
						var paymentStatus = "Paid";      //aa.print(paymentStatus);
						var paymentAmount = feeAmount;      //aa.print(paymentAmount);
						var payDate = aa.date.getCurrentDate(); //payment date today
						var paymentSeqNbr = 0;
						
						// make payment if paymentAmount > 0
						if (paymentAmount > 0)
						{
						
							var tranBatchNbr = aa.finance.getTranBatchNbr().getOutput();
							//myDebug("tranBatchNbr: " + tranBatchNbr);
							
							var paymentScriptModel = aa.finance.createPaymentScriptModel();
							paymentScriptModel.setCapID(clonedCapId); //set the cap id
							paymentScriptModel.setAuditID(cashierId); //set the rec_ful_nam
							
							paymentScriptModel.setAuditDate(payDate); //set rec_date = the payment date
							paymentScriptModel.setAuditStatus("A"); //set rec_status
							
							paymentScriptModel.setCashierID(cashierId); //set the cashier id
							paymentScriptModel.setPayee(payee); //set payee
							paymentScriptModel.setPaymentDate(payDate); //set the payment date
							paymentScriptModel.setPaymentMethod(paymentMethod); //set payment method
							paymentScriptModel.setPaymentComment(paymentComment);  //set payment comment
							paymentScriptModel.setPaymentStatus(paymentStatus);  //set payment status
							paymentScriptModel.setPaymentAmount(paymentAmount); //set payment amount
							paymentScriptModel.setAmountNotAllocated(paymentAmount); //set not allocated to the payment amount
							paymentScriptModel.setTranNbr(tranBatchNbr);
							
							var payResult = aa.finance.makePayment(paymentScriptModel);

							if(payResult.getSuccess())
							{
								paymentSeqNbr = payResult.getOutput();
								logDebug("Payment made successfully. PAYMENT_SEQ_NBR: " + paymentSeqNbr + " | Payment Amount: " + paymentAmount);
							}
							else
							{
								logDebug("Failed to make payment.");
							}
							
							// generate a receipt
							var receiptResult = aa.finance.generateReceipt(clonedCapId, payDate, paymentSeqNbr, cashierId, "");
							var receiptNumber;
							if(receiptResult.getSuccess())
							{
								receiptNumber = receiptResult.getOutput();
								//logDebug("Receipt generated successfully.");
							}
							else
							{
								logDebug("Receipt could not be generated.");
							}
							
							var allocAmount=feeAmount;			
							// only allocate money if alloc amount > 0
							if (allocAmount > 0)
							{
								var paymentMadeResult = aa.finance.getPaymentByPK(clonedCapId, paymentSeqNbr, "");
								var payment;
								if (paymentMadeResult.getSuccess())
								{
									payment = paymentMadeResult.getOutput();
								}
								else
								{ 
									logDebug("**ERROR: getting the payment just made " +  paymentMadeResult.getErrorMessage()) ; 
								}
								
								var fseqlist = new Array();
								var finvlist = new Array();
								var fpaylist = new Array();
								fseqlist.push(feeItemSeq);
								finvlist.push(invoiceNbr);
								fpaylist.push(allocAmount);

								try{
									logDebug("Apply Pament to RecordID " +clonedCapId.getCustomID() + " feeItemSeq: " + feeItemSeq + " invoiceNbr: " + invoiceNbr+ " to fee: " + feeDesc + ".  Payment Balance: $" + payBalance + ".  Fee Balance: $" + feeBalance);
									applyResult = aa.finance.applyPayment(clonedCapId, payment, fseqlist, finvlist, fpaylist, "NA", "NA", "0")
								
									if (applyResult.getSuccess())
									{
										payBalance = paymentAmount - allocAmount;
										feeBalance = feeAmount - allocAmount;
										logDebug("Applied $" + fpaylist[0] + " to fee: " + feeDesc + ".  Payment Balance: $" + payBalance + ".  Fee Balance: $" + feeBalance);
									}
									else
									{ 
										logDebug("**ERROR: error applying payment " +  applyResult.getErrorMessage()) ; 
									} 
								}
								catch(err){
									logDebug("**ERROR: error applying payment " + err.message + " Line " + err.lineNumber);
								}
								
							
							}

						}
					}
				}
				if (feeStatus == "NEW")
				{
					addFee(feecode,feesched,feeperiod,feeunit,"N",clonedCapId)
				}
			}
		}
		// copy asit
		copyASITables(parentCapId,clonedCapId);
		// copy asi
		copyASIFields(parentCapId,clonedCapId);
		// copy workflow	
		if (rec_copy_workflow.substr(0,1)=='Y')
		{
			var taskArr = new Array();
			var workflowResult = aa.workflow.getTasks(parentCapId);
			if (workflowResult.getSuccess())
				wfObj = workflowResult.getOutput();
			else
				{ logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage()); }

			for (i in wfObj)
			{
				fTask = wfObj[i];
				
				if(fTask.getActiveFlag()=="N") 
				{
					wfdesc = fTask.getTaskDescription();
					stepnumber = fTask.getStepNumber();
					processID = fTask.getProcessID();
					wfstat = fTask.getDisposition();
					dispositionDate = aa.date.getCurrentDate();
					wfnote = fTask.getDispositionNote();
					wfcomment = fTask.getDispositionComment();

					wfresult = aa.workflow.handleDisposition(clonedCapId,stepnumber,wfstat,dispositionDate, wfnote,wfcomment,systemUserObj,"Y");
					if(wfresult.getSuccess())
					{
						logDebug("Copying Workflow Task: " + wfdesc + " with status " + wfstat);
					}
					else
					{
						aa.print("ERROR updating workflow: " +wfresult.getErrorMessage());
					}
				}
			}
		}
		// update CAP status from clone config or copy from original
		if (rec_new_app_status.length > 0 && rec_new_app_status != null && rec_new_app_status != "null")
		{
			updateAppStatus(rec_new_app_status, "", capId);
		}
		else
		{
			updateAppStatus(capStatus, "", capId);
		}
		
		// update expiration info from clone config or copy from original
		if(rec_new_exp_status.length > 0 && rec_new_exp_status != null && rec_new_exp_status != "null")
		{
			var expResult = aa.expiration.getLicensesByCapID(clonedCapId);
			logDebug("exp: " + expResult.getOutput().getB1Expiration());
	 		if(!expResult.getOutput().getB1Expiration())
			{
				logDebug(altId + ": ERROR Could not get Renewal Information");
			}
			else
			{
 				var b1Exp = expResult.getOutput();
				var b1Status = b1Exp.getExpStatus();
				var	expDate = b1Exp.getExpDate();
				var b1ExpDate;
				//if (expDate) b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
				//logDebug(clonedAltId + ": Current Renewal Status : " + b1Status + ", Expires on " + b1ExpDate);
					
				b1Exp.setExpStatus(rec_new_exp_status);
				aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
				logDebug(clonedAltId + ": Update expiration status: " + rec_new_exp_status); 

				// update expiration date based on interval
				if (rec_new_exp_date != null && rec_new_exp_status != "null")
				{
					//rec_new_exp_date = dateAdd(b1ExpDate,parseInt(gracePeriodDays));
					b1Exp.setExpDate(aa.date.parseDate(rec_new_exp_date));
					aa.expiration.editB1Expiration(b1Exp.getB1Expiration());

					logDebug(clonedAltId + ": updated CAP expiration to " + rec_new_exp_date);
				}
			}   
		}
		else
		{	//copy expiration from original record
			var origExpResult = aa.expiration.getLicensesByCapID(parentCapId);
			if(!origExpResult.getOutput().getB1Expiration())	
			{
				logDebug(clonedAltId + ": No Renewal Information found on the original record(" + altId + ")");
			}
			else
			{
				var originalExp = origExpResult.getOutput();
				var originalExpStatus = originalExp.getExpStatus();
				var	originalExpDate = originalExp.getExpDate();
				
				// update cloned record renewal status
				var newExpResult = aa.expiration.getLicensesByCapID(clonedCapId);
				if(!newExpResult)	
				{
					logDebug("No Renewal Information found on original record(" + clonedCapId + ")");
				}
				else
				{
					var newExp = newExpResult.getOutput();
					newExp.setExpStatus(originalExpStatus);
					newExp.setExpDate(originalExpDate);
					aa.expiration.editB1Expiration(newExp.getB1Expiration());
					logDebug(clonedAltId + ": Update expiration status: " + originalExpStatus);
				}
			}	
		}
	}
					
 	logDebug("Total Records in set: " + SetMemberArray.length);
 	logDebug("Total Records cloned: " + capCount);
	
	aa.env.setValue("ScriptReturnCode","0");
	aa.env.setValue("ScriptReturnMessage", message); 
	return true;
}

//Function will copy all owners from source CAP (sCapID) to target CAP (tCapId)
function copyOwnerLocal(sCapID, tCapID)
{ 
	var ownrReq = aa.owner.getOwnerByCapId(sCapID);
	if(ownrReq.getSuccess())
	{
        var ownrObj = ownrReq.getOutput();

        if(ownrObj !=null && typeof(ownrObj) != "undefined"){
			for (xx in ownrObj)
			{
				ownrObj[xx].setCapID(tCapID);
				aa.owner.createCapOwnerWithAPOAttribute(ownrObj[xx]);
				logDebug("Copied Owner: " + ownrObj[xx].getOwnerFullName());
			}
		}else{
			logDebug("Warning: Error Copying Owner :: ownrObj = " + ownrObj);
		}
	}else{ 
		logDebug("Warning: No owners exist to copy");
	}
}

/**
 * Time tracker to timeout batch job
 */
function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}
 
 /*------------------------------------------------------------------------------------------------------/
| END Custom Code
/-----------------------------------------------------------------------------------------------------*/
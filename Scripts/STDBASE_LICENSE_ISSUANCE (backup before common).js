/*==========================================================================================
Title : licenseIssuance

Purpose : Creates license record, LPs, expiration dates and relationships

Author: David Bischof

Functional Area : 

Description : JSON must contain :
				"Licenses/Taxi/Business/Application" : {  							//record type to run
						"WorkflowTaskUpdateAfter/Issuance/Issued":{					//event to run (supports workflow task and status and inspection type and status)
							"parentLicense" : "Licenses/Taxi/Business/License",		//OPTIONAL parent license to create
							"issuedStatus" : "Active",								//Record Status and Expiration Status of the license
							"copyCF" : true,										//copy custom fields
							"copyCT" : true,										//copy custom tables
							"expirationType" : "Expiration Code",					//expiration type.  Supports "Expiration Code" configuration or "Days"
							"expirationPeriod" : "", 								//OPTIONAL Required only if using Days
							"refLPType"  : "Business",                              //Which LP type to create
							"contactType"  : "Agent",                               //Which contact to use for LP data
							"createLP" : true,                                      //create LP or not
							"licenseTable" : "VEHICLE INFORMATION",                 //OPTIONAL create license from a table.  Will turn ASIT to ASI on license
							"childLicense" : "Licenses/Taxi/Vehicle/License",		//What type of child recprd type if above is entered
							"recordIdField" : "Child App Number Link"               //OPTIONAL Which field to enter in the license number for tracking
						}
					}


Reviewed By: 

Script Type : (EMSE, EB, Pageflow, Batch): EMSE

General Purpose/Client Specific : General

Client developed for : Louisville

Parameters:
				itemCap - optional capId
================================================================================================================*/

function licenseIssuance() {
                itemCapId = capId;
                if (arguments.length > 1) itemCapId = arguments[0];
				
				licIssueanceJSON = getScriptText("LICENSE_ISSUANCE", null, false);
				
				//general settings
				hasParent = false;
				newLicIdString = itemCapId.getCustomID();
                itemCap = aa.cap.getCap(itemCapId).getOutput();
				recordAlias = itemCap.getCapType().getAlias();
				recordStatus = itemCap.getCapStatus();				
                itemAppTypeResult = itemCap.getCapType();
                itemAppTypeString = itemAppTypeResult.toString();
                itemAppTypeArray = itemAppTypeString.split('/');
				capModel = itemCap.getCapModel();
				capDetailModel = capModel.getCapDetailModel();
							
				if (licIssueanceJSON != "") {
					licIssueanceJSON = JSON.parse(licIssueanceJSON);
					//Identify Event and Rule Set
					if (controlString.indexOf("Workflow") > -1) {
						ruleSet = controlString + "/" + wfTask + "/" + wfStatus;
					}else if (controlString.indexOf("Inspection") > -1) {
						ruleSet = controlString + "/" + inspType + "/" + inspResult;
					} else {
						ruleSet = controlString;
					}
					
					settingsArray = [];
					if(licIssueanceJSON["*/*/*/*"]) {
						if (licIssueanceJSON["*/*/*/*"][ruleSet]) settingsArray.push(licIssueanceJSON["*/*/*/*"][ruleSet]);
					}
					if(licIssueanceJSON[itemAppTypeArray[0] + "/*/*/*"]) {
						if(licIssueanceJSON[itemAppTypeArray[0] + "/*/*/*"][ruleSet]) settingsArray.push(licIssueanceJSON[itemAppTypeArray[0] + "/*/*/*"][ruleSet]);
					}
					if(licIssueanceJSON[itemAppTypeArray[0] + itemAppTypeArray[1] + "/*/*"]) {
						if(licIssueanceJSON[itemAppTypeArray[0] + itemAppTypeArray[1] + "/*/*"][ruleSet]) settingsArray.push(licIssueanceJSON[itemAppTypeArray[0] + itemAppTypeArray[1] + "/*/*"][ruleSet]);
					}
					if(licIssueanceJSON[itemAppTypeArray[0] + itemAppTypeArray[1] + itemAppTypeArray[2] + "/*"]) {
						if(licIssueanceJSON[itemAppTypeArray[0] + itemAppTypeArray[1] + itemAppTypeArray[2] + "/*"][ruleSet]) settingsArray.push(licIssueanceJSON[itemAppTypeArray[0] + itemAppTypeArray[1] + itemAppTypeArray[2] + "/*"][ruleSet]);
					}
					if(licIssueanceJSON[itemAppTypeString]) {
						if(licIssueanceJSON[itemAppTypeString][ruleSet]) settingsArray.push(licIssueanceJSON[itemAppTypeString][ruleSet]);
					}

					for(r in settingsArray) {										
						recordSettings = settingsArray[r];
						
						if (recordSettings.parentLicense != "") {
							hasParent = true;
							licAppArray = recordSettings.parentLicense.split("/");
							
							//create license
							newLicId = createParent(licAppArray[0], licAppArray[1], licAppArray[2], licAppArray[3],null,itemCapId);
							newLicIdString = newLicId.getCustomID();
							updateAppStatus(recordSettings.issuedStatus,"",newLicId);
							if (recordSettings.copyCF) {
								copyAppSpecific(newLicId);								
							}
							if (recordSettings.copyCT) {
								copyASITables(itemCapId, newLicId);
							}							
							editAppName(capName, newLicId);
							
														
							//handle Expiration	
							b1ExpResult = aa.expiration.getLicensesByCapID(newLicId).getOutput();
							
							//Get Next Expiration Date if using Expiration Code
							if (recordSettings.expirationType == "Expiration Code") {
								var expBiz = aa.proxyInvoker.newInstance("com.accela.aa.license.expiration.ExpirationBusiness").getOutput();
								b1Model = b1ExpResult.getB1Expiration();

								nextDate = expBiz.getNextExpDate(b1Model);
								b1ExpResult.setExpDate(aa.date.parseDate(dateAdd(nextDate,0)));
							}							
														
							if (recordSettings.expirationType == "Days") {
								b1ExpResult.setExpDate(aa.date.parseDate(dateAdd(aa.util.now(),recordSettings.expirationPeriod)));
							}
							b1ExpResult.setExpStatus(recordSettings.issuedStatus);
							aa.expiration.editB1Expiration(b1ExpResult.getB1Expiration());							
						}
						
						if (recordSettings.createLP) {
						//create LP
							createRefLP4Lookup(newLicIdString,recordSettings.refLPType,recordSettings.contactType,null);
							
							//Set Business Name and Exp Date
							newLP = aa.licenseScript.getRefLicensesProfByLicNbr(aa.serviceProvider,newLicIdString).getOutput();
							thisLP = newLP[0];
							thisLP.setBusinessName(capName);
							thisLP.setLicenseIssueDate(aa.date.parseDate(dateAdd(aa.util.now(),0)));
							
							if (hasParent && recordSettings.expirationType == "Expiration Code") {
								thisLP.setLicenseExpirationDate(aa.date.parseDate(dateAdd(nextDate,0)));
							}

							if (!hasParent && recordSettings.expirationType == "Expiration Code") {
								b1ExpResult = aa.expiration.getLicensesByCapID(itemCapId).getOutput();
								var expBiz = aa.proxyInvoker.newInstance("com.accela.aa.license.expiration.ExpirationBusiness").getOutput();						
								b1Model = b1ExpResult.getB1Expiration();

								nextDate = expBiz.getNextExpDate(b1Model);
								b1ExpResult.setExpDate(aa.date.parseDate(dateAdd(nextDate,0)));
								aa.expiration.editB1Expiration(b1ExpResult.getB1Expiration());
								thisLP.setLicenseExpirationDate(aa.date.parseDate(dateAdd(nextDate,0)));
							}							
							
							if (recordSettings.expirationType == "Days") {
								thisLP.setLicenseExpirationDate(aa.date.parseDate(dateAdd(aa.util.now(),recordSettings.expirationPeriod)));
							}

							aa.licenseScript.editRefLicenseProf(thisLP);
							
							//Tie LP to both CAPs
							aa.licenseScript.associateLpWithCap(itemCapId, thisLP);
							if (hasParent)  { aa.licenseScript.associateLpWithCap(newLicId, thisLP); }
						}
						
						//Handle Tabular Licensing
						if (recordSettings.licenseTable != "") {
							licChildArray = recordSettings.childLicense.split("/");
							licTable = loadASITable(recordSettings.licenseTable);
							
							for (x in licTable) {
								vehData = licTable[x];
								if (hasParent) {
									childVehId = createChild(licChildArray[0], licChildArray[1], licChildArray[2], licChildArray[3],null,newLicId);
								} else {
									childVehId = createChild(licChildArray[0], licChildArray[1], licChildArray[2], licChildArray[3],null,itemCapId);
								}
								updateAppStatus(recordSettings.issuedStatus,"",childVehId);
								editAppName(capName, childVehId);
								c1ExpResult = aa.expiration.getLicensesByCapID(childVehId).getOutput();
								
								//Get Next Expiration Date if using Expiration Code
								if (recordSettings.expirationType == "Expiration Code") {
									var expBiz = aa.proxyInvoker.newInstance("com.accela.aa.license.expiration.ExpirationBusiness").getOutput();
									b1Model = c1ExpResult.getB1Expiration();

									nextDate = expBiz.getNextExpDate(b1Model);
									c1ExpResult.setExpDate(aa.date.parseDate(dateAdd(nextDate,0)));
								}									
								
								if (recordSettings.expirationType == "Days") {
									c1ExpResult.setExpDate(aa.date.parseDate(dateAdd(aa.util.now(),recordSettings.expirationPeriod)));
								}
								c1ExpResult.setExpStatus(recordSettings.issuedStatus);
								aa.expiration.editB1Expiration(c1ExpResult.getB1Expiration());
								
								for (var v in licTable[0])
								{
									if (v == recordSettings.recordIdField) {
										editAppSpecific(v, childVehId.getCustomID(), childVehId);
									} else {
										editAppSpecific(v, vehData[v], childVehId);
									}
								}
										
								if (recordSettings.createLP) {
									aa.licenseScript.associateLpWithCap(childVehId, thisLP);
								}
							}
							
						}						

					}					
					
				}
}

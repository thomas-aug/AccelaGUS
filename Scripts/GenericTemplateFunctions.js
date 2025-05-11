function getTemplateValueByTable (templateModel, subGroupName, fieldName) {
	try {
		var valueAttributes = getTableValueAttributesByName(templateModel.getTemplateTables(), subGroupName, fieldName);
		if (valueAttributes != null && valueAttributes.length > 0) {
			var values = new Array();
			for (var rowIndex = 0; rowIndex < valueAttributes.length; rowIndex++) {
				values.push(valueAttributes[rowIndex].getValue());
			}
			return values;
		}

		return null;
	} catch (exception) {
		logDebug(exception);
	}
}

function getFieldAttributeByName (templateGroups, subGroupName, fieldName) {
	if (templateGroups == null || templateGroups.size() == 0) {
		return null;
	}
	var subGroups = templateGroups.get(0).getSubgroups();
	for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
		var subGroup = subGroups.get(subGroupIndex);
		if (subGroupName == subGroup.getSubgroupName()) {
			var fields = subGroup.getFields();
			for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
				var field = fields.get(fieldIndex);
				if (field.getDisplayFieldName() == fieldName) {
					return field;
				}
			}
		}
	}
}

function InsertTemplateTableRow (templateModel, tableSubgroup, tablevalue, colNames) {
	try {
		var subGroup = null;
		var groupExists = false;
		var isNewItem = false;
		var newItems = new Array();
		var allRows = new Array();
		var rebuildRows = null;
		var fieldObj = null;
		var gttv = null;
		var tr = null;
		var rowCheck = 0;

		// Loop counters
		var subGroupIndex = 0;
		var tvIndex = 0;
		var eiIndex = 0;
		var rebuildIndex = 0;

		if (tablevalue == null || typeof tablevalue == "undefined") {
			throw "Missing required parameter tablevalue";
		}

		// As written, this function would only work for 1 column. (Otherwise needs 2-dimensional array of column/value pairs)
		// Have to keep the column parameter as an array for backwards compatibility, but might as well flatten it
		var tableColumn = colNames[0];

		// Can use another DLW function to get the existing values in the target table (Function returns null if no values)
		var existingItems = getTemplateValueByTable(templateModel, tableSubgroup, tableColumn);

		// Get the "template" groups/tables (returned as ArrayList, not JS array)
		var templateGroups = templateModel.getTemplateTables();

		// Get the table's group name (used when rebuilding the table)
		var groupName = templateGroups.get(0).getGroupName();

		// The actual tables (i.e. "subgroups") should all be on the first "group" item returned (ArrayList, not JS array)
		var subGroups = templateGroups.get(0).getSubgroups();

		// Compare the existing items to the ones want to add.  Only keep unique new items.
		if (existingItems != null) {
			// Compare values to add to existing values
			for (tvIndex = 0; tvIndex < tablevalue.length; tvIndex++) {
				isNewItem = true;

				for (eiIndex = 0; eiIndex < existingItems.length; eiIndex++) {
					if (tablevalue[tvIndex] == existingItems[eiIndex]) {
						isNewItem = false;
						break;
					}
				}

				// Only insert new values into the array of values to add
				if (isNewItem) {
					newItems.push(tablevalue[tvIndex]);
				}
			}
		}
		// No existing items, so process all the new items
		else {
			newItems = tablevalue;
		}

		// If no new items to add, then no point in continuing (Since defined newItems as an array, it should be empty, not null)
		if (newItems.length == 0) {
			return "No new unique rows to add. Terminating table replacement.";
		}

		// If have both new items and existing items, merge into new array
		if (newItems.length > 0 && existingItems != null) {
			allRows = existingItems.concat(newItems);
		}
		// Or the new rows are the only rows
		else {
			allRows = newItems;
		}

		//Sort them
		allRows.sort(function (a, b) { return a.toUpperCase() > b.toUpperCase() ? 1 : -1; });


		// Loop through the tables until find the targeted one
		for (subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
			subGroup = subGroups.get(subGroupIndex);

			// Check if table/subgroup is the target
			if (tableSubgroup == subGroup.getSubgroupName()) {
				groupExists = true;

				// Get an ArrayList to hold all the rows (i.e. what will be the new table)
				rebuildRows = aa.util.newArrayList();

				// Loop through all the rows (old and new) to rebuild the table
				for (rebuildIndex = 0; rebuildIndex < allRows.length; rebuildIndex++) {

					// New ArrayList to hold all the column entry's "table value" objects
					fieldObj = aa.util.newArrayList();

					// Get empty table value object (defines each row/column entry) and update the parts needed
					gttv = aa.proxyInvoker.newInstance("com.accela.aa.template.field.GenericTemplateTableValue").getOutput();
					gttv.setFieldName(tableColumn);
					gttv.setValue(allRows[rebuildIndex]);
					gttv.setRowIndex(rebuildIndex + 1);  // "+ 1" required because of the initial "zero" value
					gttv.setSubgroupName(tableSubgroup);
					gttv.setGroupName(groupName);

					// Put the value object into the column entry's ArrayList
					fieldObj.add(gttv);

					// Create a table row object and insert the specific row into the ArrayList of rows
					tr = aa.proxyInvoker.newInstance("com.accela.aa.template.subgroup.TemplateRow").getOutput();
					tr.setValues(fieldObj);

					// Add the row object to the ArrayList of rows
					rebuildRows.add(tr);
				}

				// Replace any existing table rows with the rebuilt ones
				subGroup.setRows(rebuildRows);

				rowCheck = subGroup.getRows();

				// Check table is now empty and return error if so
				if (rowCheck.empty == true) {
					LogError("Error: Table is now empty.");
					return "Error: Table is now empty.";
				}
			}
		}

		// If specified table/group doesn't exist, return error.
		if (!groupExists) {
			LogError("Error: The specified condition table was not found.");
			return "Error: The specified condition table was not found.";
		}

		// Return the number of rows now in the table object.  (Again, this function does NOT update Accela.)
		logDebug("Table object has been updated and contains " + rowCheck + " rows.");
		return rowCheck.size();
	}
	catch (exception) {
		logDebug(exception);
	}
}

function getTableValueAttributesByName (templateGroups, subGroupName, fieldName) {
	try {
		var field = getFieldAttributeByName(templateGroups, subGroupName, fieldName);
		if (field == null) {
			return null;
		}
		var subGroups = templateGroups.get(0).getSubgroups();
		for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
			var subGroup = subGroups.get(subGroupIndex);
			if (subGroupName == subGroup.getSubgroupName()) {
				var postion = subGroup.getFields().indexOf(field);
				var valueAttributes = new Array();
				var rows = subGroup.getRows();
				if (rows == null || rows.size() == 0) {
					return null;
				}
				for (var rowIndex = 0; rowIndex < rows.size(); rowIndex++) {
					valueAttributes.push(rows.get(rowIndex).getValues().get(postion));
				}
				return valueAttributes;
			}
		}
		return null;
	}
	catch (exception) {
		logDebug(exception);
	}
}

function editStdConditionASI (thisCondNumberPar, vAppSpecName, vAppSpecVal, itemCap) {
	var retStatus = true;
	if (arguments.length == 4) itemCap = arguments[3]; // use cap ID specified in args
	var thisResultPar = aa.capCondition.getCapCondition(itemCap, thisCondNumberPar);
	if (thisResultPar.getSuccess()) {
		condCurrPar = thisResultPar.getOutput();
		templateModelPar = condCurrPar.getTemplateModel();
		if (templateModelPar != null) {
			var templateGroups = templateModelPar.getTemplateForms();
			var gArray = new Array();
			if (!(templateGroups == null || templateGroups.size() == 0)) {
				var subGroups = templateGroups.get(0).getSubgroups();
				for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
					var subGroup = subGroups.get(subGroupIndex);
					var fArray = new Array();
					var fields = subGroup.getFields();
					for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
						var field = fields.get(fieldIndex);
						fArray[field.getDisplayFieldName()] = field.getDefaultValue();
						if (field.getDisplayFieldName().toString().toUpperCase() == vAppSpecName.toString().toUpperCase()) {
							if (vAppSpecVal != null) {
								field.setDefaultValue(vAppSpecVal);
								condCurrPar.setTemplateModel(templateModelPar);
								aa.capCondition.editCapCondition(condCurrPar).getOutput();
								retStatus = aa.capCondition.editCapCondition(condCurrPar).getSuccess();
							}
						}
					}
					gArray[subGroup.getSubgroupName()] = fArray;
				}
			}
		}
	}
	return retStatus;
}

// inserting rows into asit on condition
function copyAdHocASITtoChild (thisCondNumberPar, childCondId, chCapId, subGroupName, colName, itemCap) {
	try {
		var retStatus = true;
		if (arguments.length == 6) itemCap = arguments[5]; // use cap ID specified in params
		var thisResultPar = aa.capCondition.getCapCondition(itemCap, thisCondNumberPar);
		if (thisResultPar.getSuccess()) {
			condCurrPar = thisResultPar.getOutput();
			templateModelPar = condCurrPar.getTemplateModel();
			if (templateModelPar != null) {
				var thisResultChild = aa.capCondition.getCapCondition(chCapId, childCondId);
				if (thisResultChild.getSuccess()) {
					condCurrChild = thisResultChild.getOutput();
					templateModelChild = condCurrChild.getTemplateModel();
					if (templateModelChild != null) {
						var allTableValue = new Array();
						allTableValue = getTemplateValueByTable(templateModelPar, subGroupName, colName);

						// Only continue if table has rows to copy
						if (allTableValue != null && typeof allTableValue != "undefined") {
							var colNames = new Array();
							colNames[0] = colName;
							InsertTemplateTableRow(templateModelChild, subGroupName, allTableValue, colNames);
							condCurrChild.setTemplateModel(templateModelChild);
							var result = aa.capCondition.editCapCondition(condCurrChild);
							if (result.getSuccess()) {
								if (subGroupName == "BUILDING CONDITION RECORD TYPE") {
									for (dd in allTableValue) {
										if (appMatch(allTableValue[dd])) {
											condCurrChild.setConditionStatus("Applied");
											condCurrChild.setConditionStatusType("Applied");
											condCurrChild.setImpactCode("Notice");
											aa.capCondition.editCapCondition(condCurrChild);
										}
									}
								}
							}
							else {
								LogError("ERROR: " + result.getErrorMessage());
							}
						}
						else {
							logDebug("Table " + subGroupName + " on parent " + itemCap.customID + " doesn't have rows. Nothing to copy.");
						}
					}
				}
			}
		}
		return retStatus;
	}
	catch (exception) {
		logDebug(exception);
	}
}

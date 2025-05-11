{
  "RentalHousing/Licenses/*/*": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update the application name to be the business entity's business name",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "updateAppName": {
            "includeAddress": false,
            "addressType": "",
            "contactType": "Applicant",
            "includeContactName": true,
            "includeBusinessName": true,
            "includeDBATradeName": false
          }
        },
        "postScript": ""
      }
    ]
  },
  "RentalHousing/Enforcement/*/*": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update the application name to be the business entity's business name",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "updateAppName": {
            "includeAddress": true,
            "addressType": "",
            "contactType": "Complainant",
            "includeContactName": true,
            "includeBusinessName": true,
            "includeDBATradeName": false
          }
        },
        "postScript": ""
      }
    ]
  }
}
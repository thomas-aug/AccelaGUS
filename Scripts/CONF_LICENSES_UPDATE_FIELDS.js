{
  "Licenses/Contractor/*/*": {
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
            "contactType": "Business Entity",
            "includeContactName": false,
            "includeBusinessName": true,
            "includeDBATradeName": false
          }
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Electrician/*/*": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update the application name to be the applicant's name",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "updateAppName": {
            "includeAddress": false,
            "addressType": "",
            "contactType": "Applicant",
            "includeContactName": true,
            "includeBusinessName": false,
            "includeDBATradeName": false
          }
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Plumber/*/*": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update the application name to be the applicant's name",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "updateAppName": {
            "includeAddress": false,
            "addressType": "",
            "contactType": "Applicant",
            "includeContactName": true,
            "includeBusinessName": false,
            "includeDBATradeName": false
          }
        },
        "postScript": ""
      }
    ]
  }
}
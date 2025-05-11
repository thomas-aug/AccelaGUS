{
  "RentalHousing/Licenses/Short Term/Renewal": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Updates parent License record",
          "operators": {}
        },
        "criteria": {
          "task": [
            "License Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "preScript": "",
        "action": {
          "issuedRecordStatus": "Issued",
          "issuedExpirationStatus": "Active",
          "issuedLPStatus": "",
          "expirationType": "Expiration Code",
          "expirationPeriod": "RH_GENERAL",
          "customExpirationFunction": "",
          "copyComponents": [
            "Custom Fields"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "RentalHousing/Licenses/Business/Renewal": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Updates parent License record",
          "operators": {}
        },
        "criteria": {
          "task": [
            "License Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "preScript": "",
        "action": {
          "issuedRecordStatus": "Issued",
          "issuedExpirationStatus": "Active",
          "issuedLPStatus": "",
          "expirationType": "Expiration Code",
          "expirationPeriod": "RH_GENERAL",
          "customExpirationFunction": "",
          "copyComponents": [
            "Custom Fields"
          ]
        },
        "postScript": ""
      }
    ]
  }
}
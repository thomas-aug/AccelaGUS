{
  "RentalHousing/Licenses/Short Term/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Short Term Rental Housing License",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "parentLicense": "RentalHousing/Licenses/Short Term/License",
          "issuedStatus": "Active",
          "copyCustomFields": [
            "HOUSING DETAILS",
            "RENTING DETAILS"
          ],
          "copyCustomTables": [
            "ALL"
          ],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": false,
          "copyContacts": [
            "ALL"
          ],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "RH_GENERAL",
          "refLPType": "",
          "contactType": "Applicant",
          "contactAddressType": "Mailing",
          "createLP": false,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  },
  "RentalHousing/Licenses/Business/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Rental Housing Business License",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "parentLicense": "RentalHousing/Licenses/Business/License",
          "issuedStatus": "Active",
          "copyCustomFields": [
            "HOUSING DETAILS",
            "RENTING DETAILS"
          ],
          "copyCustomTables": [
            "ALL"
          ],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": false,
          "copyContacts": [
            "ALL"
          ],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "RH_GENERAL",
          "refLPType": "",
          "contactType": "Applicant",
          "contactAddressType": "Mailing",
          "createLP": false,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  }
}
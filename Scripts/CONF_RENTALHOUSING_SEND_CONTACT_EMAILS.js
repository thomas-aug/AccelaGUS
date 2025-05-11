{
  "RentalHousing/Licenses/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Send notification when additional information is required",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [],
          "status": [
            "Additional Info Required"
          ]
        },
        "action": {
          "notificationTemplate": "SS_ADDITIONAL_INFO_REQD",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when application is denied",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [],
          "status": [
            "Denied"
          ]
        },
        "action": {
          "notificationTemplate": "SS_APP_DENIED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": ""
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when application is withdrawn",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [],
          "status": [
            "Withdrawn"
          ]
        },
        "action": {
          "notificationTemplate": "SS_APP_WITHDRAWAL",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": ""
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when license is issued, with license form attached",
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
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "reportParamContactType":"Applicant",
          "notificationReport": ["Rental Housing License Report"],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": true,
          "reportingInfoStandards": ""
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when the license renewal is issued, with license attached",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "reportParamContactType":"Applicant",
          "notificationReport": ["Rental Housing License Report"],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": true,
          "reportingInfoStandards": ""
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when the license status changes",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            ""
          ],
          "status": [
            ""
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": ""
        },
        "postScript": ""
      }
    ],
    "InspectionScheduleAfter": [
      {
        "metadata": {
          "description": "Send notification when inspection is scheduled",
          "operators": {}
        },
        "preScript": "",
        "criteria": {},
        "action": {
          "notificationTemplate": "SS_INSPECTION_SCHEDULED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": ""
        },
        "postScript": ""
      }
    ],
    "V360InsepctionResultSubmitAfter": [
      {
        "metadata": {
          "description": "Send notification when an inspection is resulted",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "inspectionTypePerformed": [
            "Short-term Rental Inspection"
          ],
          "inspectionResult": [
            "ALL"
          ]
        },
        "action": {
          "notificationTemplate": "SS_INSPECTION_RESULT",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": ""
        },
        "postScript": ""
      }
    ],
    "InsepctionResultSubmitAfter": [
      {
        "metadata": {
          "description": "Send notification when an inspection is resulted",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "inspectionTypePerformed": [
            "Short-term Rental Inspection"
          ],
          "inspectionResult": [
            "ALL"
          ]
        },
        "action": {
          "notificationTemplate": "SS_INSPECTION_RESULT",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": ""
        },
        "postScript": ""
      }
    ]
  }
}
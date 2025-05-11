{
  "Cannabis/Medical/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Sends Additional Info Required Email Template with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Denied Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Withdrawn Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends License Status Email Template when Licese Status is updated to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends License Issued Email Template with attached Agency License Report to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "notificationReport": ["Agency License Report"],
          "createFromParent": true,
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends License Renewal Email Template with updated Agency Licese Report to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "notificationReport": ["Agency License Report"],
          "createFromParent": true,
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Adult-Use/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "notificationReport": ["Agency License Report"],
          "createFromParent": true,
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "notificationReport": ["Agency License Report"],
          "createFromParent": true,
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Combo/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "notificationReport": ["Agency License Report"],
          "createFromParent": true,
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "notificationReport": ["Agency License Report"],
          "createFromParent": true,
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Retail/*/*": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "notificationReport": ["Agency License Report"],
          "createFromParent": true,
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Renewal"
          ],
          "status": [
            "Renewed"
          ]
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_ISSUED_REPORT",
          "notificationReport": ["Agency License Report"],
          "createFromParent": true,
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Entity/Prequalification/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Application Issuance"
          ],
          "status": [
            "Approved"
          ]
        },
        "action": {
          "notificationTemplate": "MJ_PREQUAL_APPROVED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "*"
          ],
          "status": [
            "Withdrawn"
          ]
        },
        "action": {
          "notificationTemplate": "SS_APP_WITHDRAWAL",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Business Entity"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Entity/Registration/Business": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Sends Additional Info Required notification",
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
            "Authorized Agent",
            "Affiliate Entity",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Affiliate Entity",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Affiliate Entity",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Affiliate Entity",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Investigation"
          ],
          "status": [
            "Registered"
          ]
        },
        "action": {
          "notificationTemplate": "MJ_ENTR_REGISTERED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Affiliate Entity",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Investigation"
          ],
          "status": [
            "Registered with Conditions"
          ]
        },
        "action": {
          "notificationTemplate": "MJ_ENTR_REGISTERED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Affiliate Entity"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Entity/Registration/Individual": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Affiliate Individual",
            "Independent Contractor"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Affiliate Individual",
            "Independent Contractor"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Authorized Agent",
            "Affiliate Individual",
            "Independent Contractor"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Affiliate Individual",
            "Independent Contractor"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Affiliate Entity",
            "Business Entity"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Investigation"
          ],
          "status": [
            "Registered"
          ]
        },
        "action": {
          "notificationTemplate": "MJ_INDR_REGISTERED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Affiliate Individual",
            "Independent Contractor"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Investigation"
          ],
          "status": [
            "Registered with Conditions"
          ]
        },
        "action": {
          "notificationTemplate": "MJ_ENTR_REGISTERED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Authorized Agent",
            "Affiliate Individual",
            "Independent Contractor"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Entity/Registration/Employee": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "License Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Investigation"
          ],
          "status": [
            "Registered"
          ]
        },
        "action": {
          "notificationTemplate": "MJ_INDR_REGISTERED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Investigation"
          ],
          "status": [
            "Registered with Conditions"
          ]
        },
        "action": {
          "notificationTemplate": "MJ_ENTR_REGISTERED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Enforcement/Complaint/NA": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {},
        "action": {
          "notificationTemplate": "SS_ENFORCEMENT_CASE_RECEIVED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Complainant"
          ]
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Complainant"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Incident Status"
          ],
          "status": [
            "Assigned"
          ]
        },
        "action": {
          "notificationTemplate": "SS_ENFORCEMENT_CASE_RECEIVED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Complainant"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
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
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Incident Status"
          ],
          "status": []
        },
        "action": {
          "notificationTemplate": "SS_LICENSE_STATUS",
          "notificationReport": [],
          "notifyContactTypes": [
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Sends Email Template to necessary Contact Types with available parameters",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Investigation"
          ],
          "status": [
            "Registered with Conditions"
          ]
        },
        "action": {
          "notificationTemplate": "MJ_ENTR_REGISTERED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Employee",
            "Volunteer"
          ]
        },
        "postScript": ""
      }
    ]
  }
}
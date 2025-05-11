{
  "Licenses/Contractor/General/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a General Building Contractor License",
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
          "parentLicense": "Licenses/Contractor/General/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "General Contractor",
          "contactType": "Business Entity",
          "contactAddressType": "Business",
          "createLP": true,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Contractor/Electrical/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Electrical Contractor License",
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
          "parentLicense": "Licenses/Contractor/Electrical/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "Electrical Contractor",
          "contactType": "Business Entity",
          "contactAddressType": "Business",
          "createLP": true,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Contractor/Mechanical/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Mechanical Contractor License",
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
          "parentLicense": "Licenses/Contractor/Mechanical/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "Mechanical Contractor",
          "contactType": "Business Entity",
          "contactAddressType": "Business",
          "createLP": true,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Contractor/Plumbing/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Plumbing Contractor License",
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
          "parentLicense": "Licenses/Contractor/Plumbing/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "Plumbing Contractor",
          "contactType": "Business Entity",
          "contactAddressType": "Business",
          "createLP": true,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Electrician/Apprentice/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Electrician Apprentice License",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Registration"
          ],
          "status": [
            "Registered"
          ]
        },
        "action": {
          "parentLicense": "Licenses/Electrician/Apprentice/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
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
  "Licenses/Electrician/Journey/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Journey Electrician License",
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
          "parentLicense": "Licenses/Electrician/Journey/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "Journey Electrician",
          "contactType": "Applicant",
          "contactAddressType": "Mailing",
          "createLP": true,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Electrician/Master/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Master Electrician License",
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
          "parentLicense": "Licenses/Electrician/Master/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "Master Electrician",
          "contactType": "Applicant",
          "contactAddressType": "Mailing",
          "createLP": true,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Plumber/Apprentice/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Apprentice Plumber License",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Registration"
          ],
          "status": [
            "Registered"
          ]
        },
        "action": {
          "parentLicense": "Licenses/Plumber/Apprentice/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
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
  "Licenses/Plumber/Journey/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Journey Plumber License",
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
          "parentLicense": "Licenses/Plumber/Journey/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "Journey Plumber",
          "contactType": "Applicant",
          "contactAddressType": "Mailing",
          "createLP": true,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Plumber/Master/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Issues a Master Plumber License",
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
          "parentLicense": "Licenses/Plumber/Master/License",
          "issuedStatus": "Active",
          "copyCustomFields": ["ALL"],
          "copyCustomTables": ["ALL"],
          "copyEducation": true,
          "copyContinuingEducation": false,
          "copyExamination": true,
          "copyContacts": ["ALL"],
          "expirationType": "Expiration Code",
          "customExpirationFunction": "",
          "expirationPeriod": "",
          "refLPType": "Master Plumber",
          "contactType": "Applicant",
          "contactAddressType": "Mailing",
          "createLP": true,
          "licenseTable": "",
          "childLicense": "",
          "recordIdField": ""
        },
        "postScript": ""
      }
    ]
  }
}
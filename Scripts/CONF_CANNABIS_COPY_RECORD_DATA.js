{
  "Cannabis/*/*/Renewal": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Pageflow copy License Info from Parent Cannabis License to Renewal",
          "operators": {}
        },
        "criteria": {
          "recordType": "Cannabis/*/*/License"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": true,
          "CONTACTS": ["ALL"],
          "ASI": ["ALL"],
          "ASIT": ["ALL"],
          "CONDITIONS": ["ALL"],
          "ADDRESS": ["ALL"],
          "LICENSEDPROFESSIONALS": ["ALL"],
          "ASSETS": ["ALL"],
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": true,
          "OWNER": true,
          "ADDITIONALINFO": true,
          "EDUCATION": true,
          "CONTEDUCATION": true,
          "EXAM": true,
          "DOCUMENT": true
        },
        "postScript": ""
      }
    ],
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy License Info from Parent Cannabis License to Renewal",
          "operators": {}
        },
        "criteria": {
          "recordType": "Cannabis/*/*/License"
        },
        "action": {
          "usageType": "copyToChild",
          "Renewal": true,
          "CONTACTS": ["ALL"],
          "ASI": ["ALL"],
          "ASIT": ["ALL"],
          "CONDITIONS": ["ALL"],
          "ADDRESS": ["ALL"],
          "LICENSEDPROFESSIONALS": ["ALL"],
          "ASSETS": ["ALL"],
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": true,
          "EDUCATION": true,
          "CONTEDUCATION": true,
          "EXAM": true,
          "DOCUMENT": true
        },
        "postScript": ""
      }
    ]
  },
  "Cannabis/Amendment/*/*": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy License Info from Parent Cannabis License to Renewal",
          "operators": {}
        },
        "criteria": {
          "recordType": "Cannabis/*/*/License"
        },
        "action": {
          "preScript": "",
          "usageType": "copyToChild",
          "CONTACTS": ["ALL"],
          "ASI": ["ALL"],
          "ASIT": ["ALL"],
          "CONDITIONS": ["ALL"],
          "ADDRESS": ["ALL"],
          "LICENSEDPROFESSIONALS": ["ALL"],
          "ASSETS": ["ALL"],
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": true,
          "OWNER": true,
          "ADDITIONALINFO": true,
          "EDUCATION": true,
          "CONTEDUCATION": true,
          "EXAM": true,
          "DOCUMENT": true
        },
        "postScript": ""
      }
    ],
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy License Info from Parent Cannabis License to Renewal",
          "operators": {}
        },
        "criteria": {
          "recordType": "Cannabis/*/*/License"
        },
        "action": {
          "usageType": "copyFromParent",
          "CONTACTS": ["ALL"],
          "ASI": ["ALL"],
          "ASIT": ["ALL"],
          "CONDITIONS": ["ALL"],
          "ADDRESS": ["ALL"],
          "LICENSEDPROFESSIONALS": ["ALL"],
          "ASSETS": ["ALL"],
          "keepExistingAPO": true,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": true,
          "EDUCATION": true,
          "CONTEDUCATION": true,
          "EXAM": true,
          "DOCUMENT": true
        },
        "postScript": ""
      }
    ]
  }
}
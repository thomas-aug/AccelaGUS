{
  "RentalHousing/*/*/Renewal": {
    "Pageflow": [
      {
        "metadata": {
          "description": "Copy data between parent and child records",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "recordType": "RentalHousing/*/*/License"
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
        "metadata": {
          "description": "Copy data between parent and child records",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "recordType": "RentalHousing/*/*/License"
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
  "RentalHousing/Amendment/*/*": {
    "Pageflow": [
      {
        "metadata": {
          "description": "Copy data between parent and child records",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "recordType": "RentalHousing/*/*/License"
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
        "metadata": {
          "description": "Copy data between parent and child records",
          "operators": {}
        },
        "preScript": "",
        "criteria": {
          "recordType": "RentalHousing/*/*/License"
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
{
  "Building/Amendment/Contact Info/NA": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Pageflow copy Building Amendment Contact Info",
          "operators": {}
        },
        "criteria": {
          "recordType": "Building/*/*/*"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": false,
          "CONTACTS": [
            "ALL"
          ],
          "ASI": [],
          "ASIT": [],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [
            "ALL"
          ],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": false,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": true,
          "OWNER": true,
          "ADDITIONALINFO": true,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy Building Amendment Contact Info on Workflow Task Modification Review - Status Modification Request Approved",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Modification Review"
          ],
          "status": [
            "Modification Request Approved"
          ],
          "recordType": "Building/*/*/*"
        },
        "action": {
          "usageType": "copyToParent",
          "Renewal": false,
          "CONTACTS": [
            "ALL"
          ],
          "ASI": [],
          "ASIT": [],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": false,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": true
        },
        "postScript": ""
      }
    ]
  },
  "Building/Amendment/Extension/NA": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Pageflow copy Building Amendment Contact Info",
          "operators": {}
        },
        "criteria": {
          "recordType": "Building/*/*/*"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": false,
          "CONTACTS": [
            "ALL"
          ],
          "ASI": [],
          "ASIT": [],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [
            "ALL"
          ],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": false,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": true,
          "OWNER": true,
          "ADDITIONALINFO": true,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy Building Amendment Contact Info on Workflow Task Modification Review - Status Modification Request Approved",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Modification Review"
          ],
          "status": [
            "Modification Request Approved"
          ],
          "recordType": "Building/*/*/*"
        },
        "action": {
          "usageType": "copyToParent",
          "Renewal": false,
          "CONTACTS": [
            "ALL"
          ],
          "ASI": [],
          "ASIT": [],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": false,
          "RECORDDETAILS": true,
          "RECORDNAME": true,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": true
        },
        "postScript": ""
      }
    ]
  },
  "Building/Amendment/Licensed Professional/NA": {
    "Pageflow": [
      {
        "preScript": "",
        "metadata": {
          "description": "Pageflow copy LPs from parent",
          "operators": {}
        },
        "criteria": {
          "recordType": "Building/*/*/*"
        },
        "action": {
          "usageType": "copyFromParent",
          "Renewal": false,
          "CONTACTS": [],
          "ASI": [],
          "ASIT": [],
          "CONDITIONS": [],
          "ADDRESS": [],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": false,
          "RECORDDETAILS": false,
          "RECORDNAME": false,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": false
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Copy Building Amendment Contact Info on Workflow Task Modification Review - Status Modification Request Approved",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Modification Review"
          ],
          "status": [
            "Modification Request Approved"
          ],
          "recordType": "Building/*/*/*"
        },
        "action": {
          "usageType": "copyToParent",
          "Renewal": false,
          "CONTACTS": [],
          "ASI": [],
          "ASIT": [],
          "CONDITIONS": [
            "ALL"
          ],
          "ADDRESS": [],
          "LICENSEDPROFESSIONALS": [
            "ALL"
          ],
          "ASSETS": [],
          "keepExistingAPO": false,
          "RECORDDETAILS": false,
          "RECORDNAME": false,
          "PARCEL": false,
          "OWNER": false,
          "ADDITIONALINFO": false,
          "EDUCATION": false,
          "CONTEDUCATION": false,
          "EXAM": false,
          "DOCUMENT": true
        },
        "postScript": ""
      }
    ]
  }
}
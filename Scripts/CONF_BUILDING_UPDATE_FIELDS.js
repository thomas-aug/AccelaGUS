{
  "Building/*/*/*": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update the application name to be the address",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "updateAppName": {
            "includeAddress": true,
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
  "Building/Commercial/Accessory/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Addition/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Alteration/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Demolition/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Electrical/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Foundation/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Mechanical/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/New/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Plumbing/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/PoolSpa/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Roofing/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/SolarPV/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Communication Facility/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Driveway/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Grading/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Parking Lot/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Accessory/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Addition/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Alteration/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Demolition/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Electrical/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Foundation/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Mechanical/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/New/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Plumbing/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/PoolSpa/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Roofing/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/SolarPV/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Sign/Permanent/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Sign/Temporary/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Street Cut/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Temporary Structure/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Application Expiration Date when application is received",
          "operators": {}
        },
        "criteria": {},
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Application Expiration Date"
        },
        "postScript": ""
      }
    ],
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Issued Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "0",
          "customFieldToUpdate": "Permit Issued Date"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Update custom field Permit Expiration Date upon permit issuance ",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "daysOut": "180",
          "customFieldToUpdate": "Permit Expiration Date"
        },
        "postScript": ""
      }
    ]
  }
}
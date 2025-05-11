{
  "Building/*/*/*": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "Rule for all permit issuance",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Rule for all permit issuance",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because one (or more) contractor has an invalid license."
        },
        "postScript": ""
      }
    ],
    "InspectionScheduleBefore": [
      {
        "metadata": {
          "description": "Rule for inspection scheduling with balance",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "inspectionTypePerformed": [],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        }
      }
    ]
  },
  "Building/Commercial/Accessory/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid licensed professional must be present before plans are distributed for review and their license must be valid",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "General Contractor"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Addition/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid General Contractor license must be present before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "General Contractor"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a General contractor is not listed or has an expired license"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Application cannot be closed with a balance due",
          "operator": ""
        },
        "criteria": {
          "task": [
            "Certificate of Occupancy"
          ],
          "status": [
            "Final CO Issued",
            "Not Required"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        }
      }
    ]
  },
  "Building/Commercial/Alteration/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid General Contractor license must be present before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "General Contractor"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a General contractor is not listed or has an expired license"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Application cannot be closed with a balance due",
          "operator": ""
        },
        "criteria": {
          "task": [
            "Certificate of Occupancy"
          ],
          "status": [
            "Final CO Issued",
            "Not Required"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        }
      }
    ]
  },
  "Building/Commercial/Demolition/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid General Contractor license must be present before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "General Contractor"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a General contractor is not listed or has an expired license"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Electrical/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid licensed professional must be present before plans are distributed for review and their license must be valid",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "Electrical Contractor",
            "Master Electrician",
            "Journey Electrician"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Foundation/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid General Contractor license must be present before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "General Contractor"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a General contractor is not listed or has an expired license"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Application cannot be closed with a balance due",
          "operator": ""
        },
        "criteria": {
          "task": [
            "Certificate of Occupancy"
          ],
          "status": [
            "Final CO Issued",
            "Not Required"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        }
      }
    ]
  },
  "Building/Commercial/Mechanical/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid licensed professional must be present before plans are distributed for review and their license must be valid",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "Mechanical Contractor"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/New/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid General Contractor license must be present before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "General Contractor"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a General contractor is not listed or has an expired license"
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Application cannot be closed with a balance due",
          "operator": ""
        },
        "criteria": {
          "task": [
            "Certificate of Occupancy"
          ],
          "status": [
            "Final CO Issued",
            "Not Required"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        }
      }
    ]
  },
  "Building/Commercial/Plumbing/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid General Contractor license must be present before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "Plumbing Contractor",
            "Master Plumber",
            "Journey Plumber"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/PoolSpa/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid licensed professional must be present before plans are distributed for review and their license must be valid",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "Plumbing Contractor",
            "Master Plumber",
            "Journey Plumber"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Commercial/Roofing/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid General Contractor license must be present before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": [
            "General Contractor"
          ],
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Communication Facility/NA/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Driveway/NA/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Grading/NA/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Parking Lot/NA/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Addition/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Alteration/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "Application cannot be closed with a balance due",
          "operator": ""
        },
        "criteria": {
          "task": [
            "Certificate of Occupancy"
          ],
          "status": [
            "Final CO Issued",
            "Not Required"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        }
      },
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Demolition/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Electrical/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid licensed professional must be present before plans are distributed for review and their license must be valid",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": "Electrical Contractor|Master Electrician|Journey Electrician",
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/Foundation/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Application cannot be closed with a balance due",
          "operator": ""
        },
        "criteria": {
          "task": [
            "Certificate of Occupancy"
          ],
          "status": [
            "Final CO Issued",
            "Not Required"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        }
      }
    ]
  },
  "Building/Residential/Mechanical/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid licensed professional must be present before plans are distributed for review and their license must be valid",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": "Mechanical Contractor",
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/New/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Application cannot be closed with a balance due",
          "operator": ""
        },
        "criteria": {
          "task": [
            "Certificate of Occupancy"
          ],
          "status": [
            "Final CO Issued",
            "Not Required"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        }
      }
    ]
  },
  "Building/Residential/Plumbing/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid General Contractor license must be present before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": "Plumbing Contractor|Master Plumber|Journey Plumber",
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Residential/PoolSpa/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "A valid licensed professional must be present before plans are distributed for review and their license must be valid",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "requiredLP": "Plumbing Contractor|Master Plumber|Journey Plumber",
          "validateLP": true
        },
        "action": {
          "validationMessage": "This action cannot be taken because a Licensed Professional is not listed or has an expired license"
        },
        "postScript": ""
      }
    ]
  },
  "Building/Sign/Permanent/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Sign/Temporary/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Street Cut/NA/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  },
  "Building/Temporary Structure/NA/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before plans are distributed for review",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Distribution"
          ],
          "status": [
            "Routed for Review"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all outstanding fees are paid in full."
        },
        "postScript": ""
      }
    ]
  }
}
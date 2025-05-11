{
  "Planning/Conditional Use/NA/NA": {
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
          "description": "All invoiced fees must be paid before decision notification is sent",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Decision Notification"
          ],
          "status": [
            "Notification Sent"
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
  "Planning/General Plan Amendment/NA/NA": {
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
          "description": "All invoiced fees must be paid before decision notification is sent",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Decision Notification"
          ],
          "status": [
            "Notification Sent"
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
  "Planning/Rezoning/NA/NA": {
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
          "description": "All invoiced fees must be paid before decision notification is sent",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Decision Notification"
          ],
          "status": [
            "Notification Sent"
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
  "Planning/Site Plan/Major/NA": {
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
          "description": "All invoiced fees must be paid before decision notification is sent",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Decision Notification"
          ],
          "status": [
            "Notification Sent"
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
  "Planning/Subdivision/Major/NA": {
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
          "description": "All invoiced fees must be paid before decision notification is sent",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Decision Notification"
          ],
          "status": [
            "Notification Sent"
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
  "Planning/Variance/NA/NA": {
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
          "description": "All invoiced fees must be paid before decision notification is sent",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Decision Notification"
          ],
          "status": [
            "Notification Sent"
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
  "Planning/Zoning/Verification/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All balance need to be paid before the letter is sent",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Verification Letter"
          ],
          "status": [
            "Letter Sent"
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
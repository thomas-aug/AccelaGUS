{
  "ApplicationSubmitAfter": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_COPY_RECORD_DATA",
      "STDBASE_CONDITION_DOCUMENTS"
    ]
  },
  "WorkflowTaskUpdateAfter": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_ENTITY_ISSUANCE",
      "STDBASE_ENTITY_REGISTRATION",
      "STDBASE_LICENSE_ISSUANCE",
      "STDBASE_LICENSE_RENEWAL_ISSUANCE",
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  },
  "InspectionResultSubmitAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_AUTOMATION",
      "STDBASE_RECORD_AUTOMATION"
    ]
  }
}
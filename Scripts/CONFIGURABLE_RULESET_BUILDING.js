{
  "ApplicationSubmitBefore": {
    "StandardScripts": [
      "STDBASE_RECORD_VALIDATION",
      "STDBASE_COPY_RECORD_DATA"
    ]
  },
  "ApplicationSubmitAfter": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_COPY_RECORD_DATA",
      "STDBASE_UPDATE_FIELDS"
    ]
  },
  "FeeInvoiceAfter": {
    "StandardScripts": [
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  },
  "WorkflowTaskUpdateBefore": {
    "StandardScripts": [
      "STDBASE_RECORD_VALIDATION"
    ]
  },
  "WorkflowTaskUpdateAfter": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_PERMIT_ISSUANCE",
      "STDBASE_LICENSE_RENEWAL_ISSUANCE",
      "STDBASE_SEND_CONTACT_EMAILS",
      "STDBASE_UPDATE_FIELDS"
    ]
  },
  "InspectionResultSubmitAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_AUTOMATION",
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  },
  "InspectionScheduleAfter": {
    "StandardScripts": [
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  },
  "InspectionScheduleBefore": {
    "StandardScripts": [
      "STDBASE_RECORD_VALIDATION"
    ]
  },
  "V360InspectionResultSubmitAfter": {
    "StandardScripts": [
      "STDBASE_INSPECTION_AUTOMATION",
      "STDBASE_RECORD_AUTOMATION",
      "STDBASE_SEND_CONTACT_EMAILS"
    ]
  }
}
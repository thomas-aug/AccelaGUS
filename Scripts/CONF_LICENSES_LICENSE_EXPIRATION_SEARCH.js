{
  "aboutToExpireSearchRules": {
    "searchCriteria": {
      "searchByRecordGroup": "Licenses",
      "searchByRecordType": "",
      "searchByRecordSubType": "",
      "searchByRecordCategory": "License",
      "searchStatus": "Active",
      "searchByDaysOut": -1,
      "searchByFromDate": false,
      "searchByToDate": false,
      "expiringInterval": "nextquarter",
      "notificationConfScript": "CONF_LICENSES_LICENSE_EXPIRATION_NOTICE",
      "firstNotice": "60 Day Notice",
      "excludeRecordType": [],
      "excludeRecordStatus": [
        {
          "status": "Revoked"
        },
        {
          "status": "Closed"
        }
      ],
      "adminEmail": "cli@accela.com",
      "batchResultEmailTemplate": "BATCH_LICENSE_RENEWAL_RESULTS"
    }
  },
  "expirationNoticeSearchRules": {
    "searchCriteria": {
      "searchByRecordGroup": "Licenses",
      "searchByRecordType": "",
      "searchByRecordSubType": "",
      "searchByRecordCategory": "License",
      "searchByRecordStatus": "",
      "searchByDaysOut": 1,
      "searchByFromDate": false,
      "searchByToDate": false,
      "notificationConfScript": "CONF_LICENSES_LICENSE_EXPIRATION_NOTICE",
      "excludeRecordType": [],
      "excludeRecordStatus": [
        {
          "status": "Revoked"
        },
        {
          "status": "Closed"
        }
      ],
      "adminEmail": "cli@accela.com",
      "batchResultEmailTemplate": "BATCH_LICENSE_RENEWAL_RESULTS"
    }
  }
}
{
  "RentalHousing/*/*/Application": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "To automate creation and updating of reference contacts for Individuals on ASA for back office users",
          "operators": {}
        },
        "criteria": {
          "publicUser": false
        },
        "preScript": "",
        "action": {
          "contactTypes": [
            "Authorized Agent",
            "Applicant"
          ],
          "createReferenceContacts": true,
          "updateReferenceContacts": true,
          "compareFunction": "comparePeopleMatchCriteria",
          "referenceContactType": "Individual",
          "licensedProfessionalType": "",
          "createReferenceLicense": false,
          "updatedReferenceLicense": false,
          "createPublicUser": true,
          "linkPublicUserReferenceContact": true,
          "linkPublicUserReferenceLicense": false,
          "addAKANamesFromContactTemplateTable": ""
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "To automate creation and updating of reference contacts for Businesses on ASA for back office users",
          "operators": {}
        },
        "criteria": {
          "publicUser": false
        },
        "preScript": "",
        "action": {
          "contactTypes": [
            "Business Entity"
          ],
          "createReferenceContacts": true,
          "updateReferenceContacts": true,
          "compareFunction": "comparePeopleMatchCriteria",
          "referenceContactType": "Organization",
          "licensedProfessionalType": "",
          "createReferenceLicense": false,
          "updatedReferenceLicense": false,
          "createPublicUser": true,
          "linkPublicUserReferenceContact": true,
          "linkPublicUserReferenceLicense": false,
          "addAKANamesFromContactTemplateTable": ""
        },
        "postScript": ""
      }
    ],
    "ConvertToRealCAPAfter": [
      {
        "metadata": {
          "description": "To automate creation and updating of reference contacts on CTRCA for Public Users",
          "operators": {}
        },
        "criteria": {},
        "preScript": "",
        "action": {
          "contactTypes": [
            "Authorized Agent",
            "Applicant"
          ],
          "createReferenceContacts": true,
          "updateReferenceContacts": true,
          "compareFunction": "comparePeopleMatchCriteria",
          "referenceContactType": "Individual",
          "licensedProfessionalType": "",
          "createReferenceLicense": false,
          "updatedReferenceLicense": false,
          "createPublicUser": true,
          "linkPublicUserReferenceContact": true,
          "linkPublicUserReferenceLicense": false,
          "addAKANamesFromContactTemplateTable": ""
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "To automate creation and updating of reference contacts for Businesses on CTRCA for Public Users",
          "operators": {}
        },
        "criteria": {},
        "preScript": "",
        "action": {
          "contactTypes": [
            "Business Entity"
          ],
          "createReferenceContacts": true,
          "updateReferenceContacts": true,
          "compareFunction": "comparePeopleMatchCriteria",
          "referenceContactType": "Organization",
          "licensedProfessionalType": "",
          "createReferenceLicense": false,
          "updatedReferenceLicense": false,
          "createPublicUser": false,
          "linkPublicUserReferenceContact": true,
          "linkPublicUserReferenceLicense": false,
          "addAKANamesFromContactTemplateTable": ""
        },
        "postScript": ""
      }
    ]
  }
}
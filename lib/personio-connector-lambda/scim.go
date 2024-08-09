package main

// Struct for users based on the SCIM standard with extensions for enterprises and by atlassian
type User struct {
	ID                                                string        `json:"id"`
	ExternalID                                        string        `json:"externalId"`
	UserName                                          string        `json:"userName"`
	Name                                              Name          `json:"name"`
	DisplayName                                       string        `json:"displayName"`
	NickName                                          string        `json:"nickName,omitempty"`
	ProfileURL                                        string        `json:"profileUrl,omitempty"`
	Emails                                            []Email       `json:"emails"`
	Addresses                                         []Adress      `json:"addresses,omitempty"`
	PhoneNumbers                                      []PhoneNumber `json:"phoneNumbers,omitempty"`
	Meta                                              []Meta        `json:"meta,omitempty"`
	Groups                                            []Groups      `json:"groups,omitempty"`
	UserType                                          string        `json:"userType,omitempty"`
	Title                                             string        `json:"title,omitempty"`
	PreferredLanguage                                 string        `json:"preferredLanguage,omitempty"`
	Department                                        string        `json:"department,omitempty"`
	Organization                                      string        `json:"organization,omitempty"`
	Locale                                            string        `json:"locale,omitempty"`
	Timezone                                          string        `json:"timezone,omitempty"`
	Active                                            bool          `json:"active"`
	UrnIetfParamsScimSchemasExtensionEnterprise21User *UIPSSEE21U   `json:"urn:ietf:params:scim:schemas:extension:enterprise:2.1:User,omitempty"`
	UrnScimSchemasExtensionAtlassianExternal11        *USSEAE11     `json:"urn:scim:schemas:extension:atlassian-external:1.1,omitempty"`
}

// Struct for name based on the SCIM standard
type Name struct {
	Formatted       string `json:"formatted,omitempty"`
	FamilyName      string `json:"familyName"`
	GivenName       string `json:"givenName"`
	MiddleName      string `json:"middleName,omitempty"`
	HonorificPrefix string `json:"honorificPrefix,omitempty"`
	HonorificSuffix string `json:"honorificSuffix,omitempty"`
}

//  SCIM Schemas Extension Enterprise 2.1 User
type UIPSSEE21U struct {
	EmployeeNumber string `json:"employeeNumber,omitempty"`
	CostCenter     string `json:"costCenter,omitempty"`
	Organization   string `json:"organization,omitempty"`
	Division       string `json:"division,omitempty"`
	Department     string `json:"department"`
	Manager        struct {
		Value string `json:"value,omitempty"`
		Ref   string `json:"$ref,omitempty"`
	} `json:"manager,omitempty"`
}

type USSEAE11 struct {
	AtlassianAccountID string `json:"atlassianAccountId,omitempty"`
}

// Struct for address based on the SCIM standard
type Adress struct {
	Type          string `json:"type"`
	StreetAddress string `json:"streetAddress"`
	Locality      string `json:"locality"`
	Region        string `json:"region"`
	PostalCode    string `json:"postalCode"`
	Country       string `json:"country"`
	Formatted     string `json:"formatted"`
	Primary       bool   `json:"primary"`
}

// Struct for phone number based on the SCIM standard
type PhoneNumber struct {
	Value string `json:"value"`
	Type  string `json:"type"`
}

// Struct for email based on the SCIM standard
type Email struct {
	Value   string `json:"value"`
	Type    string `json:"type"`
	Primary bool   `json:"primary"`
}

// Struct for metadata based on the SCIM standard
type Meta struct {
	ResourceType string    `json:"resourceType"`
	Created      time.Time `json:"created"`
	LastModified time.Time `json:"lastModified"`
}

// Struct for groups based on the SCIM standard
type Groups struct {
	Type    string `json:"type"`
	Value   string `json:"value"`
	Display string `json:"display"`
	Ref     string `json:"$ref"`
}



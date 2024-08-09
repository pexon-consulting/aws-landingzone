package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "os"
    "bytes"
    "time"

    "github.com/aws/aws-lambda-go/lambda"
    "github.com/aws/aws-sdk-go/aws"
    "github.com/aws/aws-sdk-go/aws/session"
    "github.com/aws/aws-sdk-go/service/secretsmanager"
)

// TODO This Event has to be adjusted to a personio User later
func handler(event Event) (string, error) {
    scimUser := MapPersonioToSCIM(event)
    SecretsArn := os.Getenv("PERSONIO_SCIM_LAMBDA_SECRETS")
    tenantID, err := getSecret(SecretsArn, "id")
    if err != nil {
        return "", fmt.Errorf("failed to retrieve tenant ID: %v", err)
    }

    bearerToken, err := getSecret(SecretsArn, "token")
    if err != nil {
        return "", fmt.Errorf("failed to retrieve bearer token: %v", err)
    }

    region := getRegion()
    scimURL := fmt.Sprintf("https://scim.%s.amazonaws.com/%s/scim/v2/Users", region, tenantID)
    // TODO This still has to be implemented, depending on the event received from the make personio integration
    switch scimUser.Action {
    case "create":
        return createUser(scimURL, bearerToken, scimUser)
    case "delete":
        return deleteUser(scimURL, bearerToken, scimUser.Email)
    default:
        return "", fmt.Errorf("unknown action: %s", scimUser.Action)
    }
}

// function for creating an AWS user account from an scim.User object.
func CreateUser(scimURL, bearerToken string, user scim.User) scim.User {
	returnuser := scim.User{}
	jsonbody, _ := json.Marshal(user)
	req, err := http.NewRequest("POST", scimURL, bytes.NewBuffer(jsonbody))
	if err != nil {
		log.Println(string(jsonbody))
		log.Println(req)
		return scim.User{}
	}
	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+bearerToken)

	res, err := http.DefaultClient.Do(req)
	if res.StatusCode != 201 {
		log.Println(string(jsonbody))
		log.Printf("ERROR: AWS Returned HTTP Status Code %d", res.StatusCode)
		log.Println(res)
		return scim.User{}
	}
	log.Println(res)
	if err != nil {
		log.Fatal(err)
	} else {
		log.Println("AWS User" + user.UserName + "with mail:" + user.Emails[0].Value + " created")
	}
	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	log.Println(res)
	log.Println(string(body))
	json.Unmarshal(body, &returnuser)
	return returnuser
}

func deleteUser(scimURL, bearerToken, email string) (string, error) {
    userID, err := findUserByEmail(scimURL, bearerToken, email)
    if err != nil {
        return "", err
    }

    deleteURL := fmt.Sprintf("%s/%s", scimURL, userID)
    req, err := http.NewRequest("DELETE", deleteURL, nil)
    if err != nil {
        return "", fmt.Errorf("failed to create request: %v", err)
    }
    req.Header.Set("Authorization", bearerToken)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", fmt.Errorf("failed to send request: %v", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusNoContent {
        body, _ := ioutil.ReadAll(resp.Body)
        return "", fmt.Errorf("failed to delete user, status: %d, response: %s", resp.StatusCode, string(body))
    }

    return "User deleted successfully", nil
}

func findUserByEmail(scimURL, bearerToken, email string) (string, error) {
    queryURL := fmt.Sprintf("%s?filter=emails.value eq \"%s\"", scimURL, email)
    req, err := http.NewRequest("GET", queryURL, nil)
    if err != nil {
        return "", fmt.Errorf("failed to create request: %v", err)
    }
    req.Header.Set("Authorization", bearerToken)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return "", fmt.Errorf("failed to send request: %v", err)
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return "", fmt.Errorf("failed to read response body: %v", err)
    }

    if resp.StatusCode != http.StatusOK {
        return "", fmt.Errorf("failed to find user, status: %d, response: %s", resp.StatusCode, string(body))
    }

    var result struct {
        Resources []struct {
            ID string `json:"id"`
        } `json:"Resources"`
    }

    err = json.Unmarshal(body, &result)
    if err != nil {
        return "", fmt.Errorf("failed to unmarshal response: %v", err)
    }

    if len(result.Resources) == 0 {
        return "", fmt.Errorf("user not found")
    }

    return result.Resources[0].ID, nil
}

func getSecret(secretArn, key string) (string, error) {
    sess, err := session.NewSession()
    if err != nil {
        return "", fmt.Errorf("failed to create session: %v", err)
    }
    svc := secretsmanager.New(sess)

    input := &secretsmanager.GetSecretValueInput{
        SecretId: aws.String(secretArn),
    }

    result, err := svc.GetSecretValue(input)
    if err != nil {
        return "", fmt.Errorf("failed to retrieve secret: %v", err)
    }

    if result.SecretString != nil {
        var secretMap map[string]string
        err := json.Unmarshal([]byte(*result.SecretString), &secretMap)
        if err != nil {
            return "", fmt.Errorf("failed to unmarshal secret: %v", err)
        }

        value, exists := secretMap[key]
        if !exists {
            return "", fmt.Errorf("key '%s' not found in the secret", key)
        }

        return value, nil
    }

    return "", fmt.Errorf("secret binary not supported")
}

func getRegion() string {
	return os.Getenv("AWS_REGION")
}

// Map Personio Event to SCIM user
// TODO This untested Mapping function was written under the assumption that the event received does not differ much from the personio API
func MapPersonioToSCIM(event personio.Event) scim.User {
	return scim.User{
		ID:        employee.ID.Value,
		ExternalID: "", // TODO Assuming external ID isn't provided by Personio, maybe employee.ID?
		UserName:  employee.Email.Value, // Using email as the username
		Name: Name{
			Formatted:  employee.FirstName.Value + " " + employee.LastName.Value,
			FamilyName: employee.LastName.Value,
			GivenName:  employee.FirstName.Value,
		},
		DisplayName: employee.FirstName.Value + " " + employee.LastName.Value,
		Emails: []Email{
			{
				Value:   employee.Email.Value,
				Type:    "work",
				Primary: true,
			},
		},
		PhoneNumbers: nil,
		Title:        employee.Position.Value,
		Department:   employee.Department.Value.Attributes.Name,
		Organization: employee.Subcompany.Value.Attributes.Name,
		Active:       employee.Status.Value == "active",
		UrnIetfParamsScimSchemasExtensionEnterprise21User: &UIPSSEE21U{
			EmployeeNumber: employee.ID.Value,
			Department:     employee.Department.Value.Attributes.Name,
			Manager: struct {
				Value string `json:"value,omitempty"`
				Ref   string `json:"$ref,omitempty"`
			}{
				Value: employee.Supervisor.Value.Attributes.ID.Value,
				Ref:   "",
			},
		},
		Meta: []Meta{
			{
				ResourceType: "User",
				Created:      employee.CreatedAt.Value,
				LastModified: employee.LastModifiedAt.Value,
			},
		},
	}
}

func main() {
    lambda.Start(handler)
}

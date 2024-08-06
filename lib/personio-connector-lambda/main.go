package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "os"
    "bytes"

    "github.com/aws/aws-lambda-go/lambda"
    "github.com/aws/aws-sdk-go/aws"
    "github.com/aws/aws-sdk-go/aws/session"
    "github.com/aws/aws-sdk-go/service/secretsmanager"
)

/*
Sample Events for User Creation/Deletion //TODO Groups need to be added

{
    "action": "create",
    "userName": "johndoe",
    "givenName": "John",
    "familyName": "Doe",
    "email": "johndoe@example.com"
}

{
    "action": "delete",
    "email": "johndoe@example.com"
}
*/

type User struct {
    UserName string `json:"userName"`
    Name     struct {
        GivenName  string `json:"givenName"`
        FamilyName string `json:"familyName"`
    } `json:"name"`
    Emails []struct {
        Value   string `json:"value"`
        Primary bool   `json:"primary"`
    } `json:"emails"`
    Schemas []string `json:"schemas"`
}

type Event struct {
    Action     string `json:"action"`
    UserName   string `json:"userName,omitempty"`
    GivenName  string `json:"givenName,omitempty"`
    FamilyName string `json:"familyName,omitempty"`
    Email      string `json:"email"`
}

func handler(event Event) (string, error) {
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
    switch event.Action {
    case "create":
        return createUser(scimURL, bearerToken, event)
    case "delete":
        return deleteUser(scimURL, bearerToken, event.Email)
    default:
        return "", fmt.Errorf("unknown action: %s", event.Action)
    }
}

func createUser(scimURL, bearerToken string, event Event) (string, error) {
    user := User{
        UserName: event.UserName,
        Schemas:  []string{"urn:ietf:params:scim:schemas:core:2.0:User"},
    }
    user.Name.GivenName = event.GivenName
    user.Name.FamilyName = event.FamilyName
    user.Emails = []struct {
        Value   string `json:"value"`
        Primary bool   `json:"primary"`
    }{
        {
            Value:   event.Email,
            Primary: true,
        },
    }

    userJSON, err := json.Marshal(user)
    if err != nil {
        return "", fmt.Errorf("failed to marshal user: %v", err)
    }

    req, err := http.NewRequest("POST", scimURL, bytes.NewBuffer(userJSON))
    if err != nil {
        return "", fmt.Errorf("failed to create request: %v", err)
    }
    req.Header.Set("Content-Type", "application/json")
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

    if resp.StatusCode != http.StatusCreated {
        return "", fmt.Errorf("failed to create user, status: %d, response: %s", resp.StatusCode, string(body))
    }

    return "User created successfully", nil
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

func main() {
    lambda.Start(handler)
}

package main

import (
    "github.com/joho/godotenv"
    "encoding/json"
    "os"
    "strings"
    "log"
)

func main() {
  var env map[string]string
  whitelist := make(map[string]string)
  env, err := godotenv.Read()

  if err != nil {
    log.Fatal("Error loading .env file")
  }

  for key, value := range env { 
    if strings.HasPrefix(key, "REACT_APP_") {
      var safeKey = strings.TrimPrefix(key, "REACT_APP_")
      if len(safeKey) > 0 {
        whitelist[safeKey] = value
      }
    }
  }

  jsonString, err := json.Marshal(whitelist)

  if err != nil {
    log.Fatal("Error reading .env file")
  }

  f, err := os.Create("env.js")
  
  if err != nil {
    log.Fatal("Error creating env.js file")
  }

  defer f.Close()

  var windowEnv string = "window._env = " + string(jsonString) + ";"

  _, err = f.WriteString(windowEnv)

  if err != nil {
    log.Fatal("Error writing to env.js file")
  }  
}
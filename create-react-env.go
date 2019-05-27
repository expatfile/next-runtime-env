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

  for k, v := range env { 
    if strings.HasPrefix(k, "REACT_APP_") {
      var safeKey = strings.TrimLeft(k, "REACT_APP_")
      if len(safeKey) > 0 {
        whitelist[safeKey] = v
      }
    }
  }

  jsonString, err := json.Marshal(whitelist)

  if err != nil {
    log.Fatal("Error reading .env file")
  }

  f, err := os.Create("env.json")
  
  if err != nil {
    log.Fatal("Error creating env.json file")
  }

  defer f.Close()

  _, err = f.WriteString(string(jsonString))

  if err != nil {
    log.Fatal("Error writing to env.json file")
  }  
}
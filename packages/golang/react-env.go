package main

import (
    "github.com/joho/godotenv"
    "encoding/json"
    "os"
    "strings"
    "log"
    "flag"
)

func getSystemEnv() map[string]string {
  getenvironment := func(data []string, getkeyval func(item string) (key, val string)) map[string]string {
      items := make(map[string]string)
      for _, item := range data {
          key, val := getkeyval(item)
          items[key] = val
      }
      return items
  }
  environment := getenvironment(os.Environ(), func(item string) (key, val string) {
      splits := strings.Split(item, "=")
      key = splits[0]
      val = splits[1]
      return
  })
  return environment
}

func getFlagEnv() map[string]string {
  var svar string
  flag.StringVar(&svar, "env", "", "path to an .env file")
  flag.Parse()
  if "" != svar {
    env, _ := godotenv.Read(svar)
    return env
  }
  return make(map[string]string)
}

func mergeMap(a map[string]string, b map[string]string) {
    for k,v := range b {
        a[k] = v
    }
}

func getEnvMap() map[string]string {
  nodeEnv := os.Getenv("NODE_ENV")
  env := map[string]string{"NODE_ENV": nodeEnv}
  if "" == nodeEnv {
    nodeEnv = "development"
  }
  ///
  env6 := getSystemEnv()
  mergeMap(env, env6)  
  ///
  env5 := getFlagEnv()
  mergeMap(env, env5)    
  ///
  env4, _ := godotenv.Read()
  mergeMap(env, env4)  
  ///
  if "test" != nodeEnv {
    env3, _ := godotenv.Read(".env.local")
    mergeMap(env, env3)
  }
  ///  
  env2, _ := godotenv.Read(".env." + nodeEnv)
  mergeMap(env, env2)
  ///  
  env1, _ := godotenv.Read(".env." + nodeEnv + ".local")
  mergeMap(env, env1)
  ///
  return env
}

func main() {
  whitelist := make(map[string]string)

  env := getEnvMap()

  for key, value := range env { 
    if strings.HasPrefix(key, "REACT_APP_") {
      var safeKey = strings.TrimPrefix(key, "REACT_APP_")
      if len(safeKey) > 0 {
        whitelist[safeKey] = value
      }
    }
  }

  jsonString, _ := json.Marshal(whitelist)

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
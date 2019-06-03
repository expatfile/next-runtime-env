### Next.js

This folder contains an example app using Next.js server rendered framework. First create a `static` directory where we will generate our `env.js` file.

Next we need to include this file in the head of our pages:


```javascript
import React from "react";
import Head from "next/head";

export default (props) => (
  <div>
    <Head>
      <script src="/static/env.js" />
    </Head>
    <h1>My Page</h1>
  </div>
)
```

Install the package:

```bash
yarn add @beam-australia/react-env --dev
## Or
npm install @beam-australia/react-env --save-dev
```

Change your `package.json` scripts file to look like the following:

```javascript
{
  // ...
  "scripts": {
    "dev": "react-env next --dest ./static",
    "build": "next build",
    "start": "react-env next start --dest ./static"
  },  
  // ...
}
```

#### Accessing values

In the browser your variables will be available on the `window._env` object e.g. `window._env.REACT_APP_FOO`. On the server the same variables will be available on `process.env` e.g. `process.env.REACT_APP_FOO`. 

We Have included a helper function to easily retrieve these values:

```bash
# .env
NODE_ENV="development"
REACT_APP_FOO="Not a secret code"
REACT_APP_NOT_SECRET_CODE="1234"
```

becomes...

```jsx
import env from "@beam-australia/react-env";

export default props => (
  <div>
    <small>
      This is: <b>{env("FOO")}</b>.
    </small>
    <small>
      Current environment: <b>{env("NODE_ENV")}</b>.
    </small>    
    <form>
      <input type="hidden" defaultValue={env("NOT_SECRET_CODE")} />
    </form>
  </div>
);
```

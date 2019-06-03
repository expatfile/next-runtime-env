# tty-aware-progress

The excellent `progress` package from npm will unfortunately ignore non-TTY environments like CI (circle-ci, travis, etc). This package uses `progress`, but in case of non-TTY, the progress will be output as rolling logs.

## Install

```bash
npm install tty-aware-progress
# or
yarn add tty-aware-progress
```

## Use

`tty-aware-progress` will only need the total number of expected ticks like shown below. It returns a function that emits progress.

```js
import createProgress from 'tty-aware-progress';

const progress = createProgress(100);
for (var i = 0; i < 100; i++) {
  progress();
}

// OR

const progress = createProgress(100);
for (var i = 0; i < 10; i++) {
  progress(10);
}
```

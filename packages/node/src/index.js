function translateArch() {
  switch (process.arch) {
    default:
    case "x64":
      return "amd64";
    case "ia32":
      return "386";
    case "arm":
      return "arm";
  }
}

function getBinary() {
  return `react-env_${process.platform}-${translateArch()}`;
}

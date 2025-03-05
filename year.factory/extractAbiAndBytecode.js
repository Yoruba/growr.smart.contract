const fs = require("fs");
const path = require("path");

const artifactsDir = path.join(__dirname, "artifacts", "contracts");
const abiDir = path.join(__dirname, "abi");
const bytecodeDir = path.join(__dirname, "byte");

console.log(artifactsDir);
console.log(abiDir);
console.log(bytecodeDir);

function isFile(filePath) {
  return fs.statSync(filePath).isFile();
}

function extractAbiAndBytecode() {
  const childFolders = fs.readdirSync(artifactsDir);

  childFolders.forEach((childFolder) => {
    const childFolderPath = path.join(artifactsDir, childFolder);
    console.log(childFolderPath);

    // for each folder get the files
    const childFolderFiles = fs.readdirSync(childFolderPath);
    childFolderFiles.forEach((childFolderFile) => {
      console.log(childFolderFile);
      const filePath = path.join(childFolderPath, childFolderFile);

      // skip if file has .dbg.
      if (childFolderFile.includes(".dbg")) {
        return;
      }
      console.log(filePath);
      const content = fs.readFileSync(filePath, "utf8");
      const jsonContent = JSON.parse(content);

      const abi = JSON.stringify(jsonContent.abi);
      const bytecode = jsonContent.bytecode;

      const abiFilePath = path.join(
        abiDir,
        `${path.basename(childFolder, ".json")}.abi.json`
      );
      const bytecodeFilePath = path.join(
        bytecodeDir,
        `${path.basename(childFolder, ".json")}.bytecode`
      );

      // format json with 2 spaces
      fs.writeFileSync(abiFilePath, JSON.stringify(jsonContent.abi, null, 2))
      fs.writeFileSync(bytecodeFilePath, bytecode);
    });
  });
}

extractAbiAndBytecode();
console.log("ABI and bytecode extraction completed.");

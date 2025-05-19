const fs = require("fs");
const { parse } = require("csv-parse");

const dataPath = "a path to some data"

const data = fs.readFileSync(dataPath, "utf-8");
const lines = data.split("\n");
const header = lines[0].split(",");

var csvData = [];
fs.createReadStream("../data/database_updated.csv")
  .pipe(parse({ delimiter: "," }))
  .on("data", function (csvrow) {
    //do something with csvrow
    csvData.push(csvrow);
  })
  .on("end", function () {
    //do something with csvData
    csvData.shift();
    console.log(header);
    console.log(getUnique(csvData, "materialMetal"));
    // console.log(csvData);
  });

function getUnique(data, fieldName) {
  let set = new Set();
  const index = header.indexOf(fieldName);
  for (const entity of data) {
    set.add(entity[index]);
  }
  return Array.from(set);
}
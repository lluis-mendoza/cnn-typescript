import { Data, Network, NetworkLayerInfo, NetworkObj } from "./structures/Network";
import * as model from '../models/best.json'
import * as fs from 'fs';
import * as csv from 'csv-parser';

const digitRecognizerData: Data[] = [];

fs.createReadStream("./data/train.csv")
  .pipe(csv())
  .on('data', (row: Record<string, string | number>) => {
    const inputs = Array.from({ length: 28 * 28 }, (_, i) => +row[`pixel${i}`]).map(e => e / 255);
    const targets: number[] = Array(10).fill(0)
    targets[+row['label']] = 1
    digitRecognizerData.push({ inputs, targets });
  })
  .on('end', () => {
    console.log('CSV file successfully processed.');
    const rowSize = 28
    const inputLength = rowSize * rowSize;
    const layers: NetworkLayerInfo[] = [
      {
        numFilters: 3,
        filterSize: 5,
        rowSize,
        activationFn: "relu",
        poolSize: 2
      },
      {
        numNeurons: 60,
        activationFn: "sigmoid"
      },
      {
          numNeurons: 10,
          activationFn: "softmax"
      }
  ]
    const network = new Network();
    network.init(inputLength, layers);
    network.load(model as NetworkObj)
    network.train(digitRecognizerData)

    const exportedModel = JSON.stringify(network.export())
    const timeStamp = Math.floor(Date.now() / 1000)
    fs.writeFile(`./models/model_${timeStamp}.json`, exportedModel, function(err) {
        if (err) {
            console.log(err);
        }
    });
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error.message);
});


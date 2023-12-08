import { ConvLayer, ConvLayerInfo, ConvLayerObj } from "./ConvLayer";
import { ActivationFnImps, Layer, LayerInfo, LayerObj } from "./Layer";

export interface Data{
    inputs: number[]
    targets: number[]
}
export type NetworkLayerObj = LayerObj | ConvLayerObj
export type NetworkObj = NetworkLayerObj[]
export type NetworkLayer = Layer | ConvLayer
export type NetworkLayerInfo = LayerInfo | ConvLayerInfo

export class Network {
    layers: NetworkLayer[]

    constructor(){
        this.layers = []
    }
    init(inputLength: number, layers: NetworkLayerInfo[]){
        let prevInputLength = inputLength
        for(let i = 0; i < layers.length; ++i){
            const layer = layers[i]
            if ("filterSize" in layer){
                const newConvLayer = new ConvLayer()
                newConvLayer.init({...layer})
                const k = Math.ceil((layer.rowSize - 2) / layer.poolSize)
                prevInputLength = layer.numFilters * k * k
                this.layers.push(newConvLayer)
            }
            else{
                const newLayer = new Layer()
                newLayer.init({...layer}, prevInputLength)
                prevInputLength = layer.numNeurons
                this.layers.push(newLayer)
            }
        }
    }
    train(trainData: Data[], epochs: number = 100, learningRate: number = 0.001) {
        for (let e = 0; e < epochs; ++e) {
            for (const { inputs, targets } of trainData) {
                const layerOutputs: number[][] = [];
                let layerOutput = inputs;
    
                // Forward pass
                for (let i = 0; i < this.layers.length; i++) {
                    layerOutput = this.layers[i].calculate(layerOutput)
                    layerOutputs.push([...layerOutput]);
                }
    
                // Backward pass
                let error = layerOutput.map((output, i) => output - targets[i]);
                for (let i = this.layers.length - 1; i >= 0; --i) {
                    const layer = this.layers[i];
                    layerOutput = layerOutputs[i]
                    const layerInputs = i > 0 ? layerOutputs[i - 1] : inputs
                    
                    const activationFnImp = ActivationFnImps[layer.activationFn]
                    const activationFnDerivatives = "calculateAllDerivative" in activationFnImp ? 
                        activationFnImp.calculateAllDerivative(layerOutput) : 
                        error.map((_, k) => activationFnImp.calculateDerivative(layerOutput[k]))

                    const delta = error.map((error, k) => error * activationFnDerivatives[k])
                    // Update weights and bias  
                    layer.neurons.forEach((neuron, n) => {
                        neuron.weights = neuron.weights.map((weight, w) => weight - learningRate * delta[n] * layerInputs[w])
                    })
                    layer.neurons.forEach((neuron, n) => {
                        neuron.bias -= learningRate * delta[n]
                    })
                    if (i > 0) {
                        error = this.layers[i - 1].neurons.map((_, n) =>
                            layer.neurons.reduce((acc, val, k) => acc + val.weights[n] * delta[k], 0)
                        )
                    }
                }
            }
            if (e % 10 == 0){
                const predictions = trainData.map(d => this.calculate(d.inputs))
                const targets = trainData.map(d => d.targets)
                console.log(`Epoch nº${e}, accuracy: ${this.getAccuracy(predictions, targets)}`)
            }
        }
    }
    findMaxIndex(arr: number[]): number {
        const maxValue = Math.max(...arr);
        const maxIndex = arr.indexOf(maxValue);
        return maxIndex;
    }
    
    getAccuracy(predictions: number[][], targets: number[][]){
        return predictions.reduce((acc, val, i) => acc + Number(this.findMaxIndex(val) == this.findMaxIndex(targets[i])), 0)/predictions.length
    }
    calculate(inputs: number[]){
        for(let i = 0; i < this.layers.length; ++i){
            inputs = this.layers[i].calculate(inputs)
        }
        return inputs
    }
    load(network: NetworkObj){
        this.layers = []
        for( const layerObj of network){
            if ("filterSize" in layerObj){
                const newConvLayer = new ConvLayer()
                newConvLayer.load(layerObj)
                this.layers.push(newConvLayer)
            }
            else{
                const newLayer = new Layer()
                newLayer.load(layerObj)
                this.layers.push(newLayer)
            }
        }
    }
    export(): NetworkObj {
        return this.layers.map(layer => layer.export())
    }
}
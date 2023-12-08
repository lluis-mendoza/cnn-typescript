import { ActivationFunction, MultiInputActivationFunction, Relu, Sigmoid, Softmax } from "./ActivationFunction";
import { Neuron, NeuronObj } from "./Neuron";

export interface ConvLayerInfo {
    numFilters: number
    activationFn: ActivationFnType
    rowSize: number
    filterSize: number
    poolSize: number
}
export interface ConvLayerObj{
    neurons: NeuronObj[]
    activationFn: ActivationFnType
    rowSize: number
    filterSize: number
    poolSize: number
}
export type ActivationFnType = "relu" | "softmax" | "sigmoid"
export type ActivationFn = ActivationFunction | MultiInputActivationFunction

export const ActivationFnImps: Record<ActivationFnType, ActivationFn> = {
    "sigmoid": new Sigmoid,
    "relu": new Relu,
    "softmax": new Softmax
}

export class ConvLayer {
    neurons: Neuron[] // Each neuron is a filter
    activationFn: ActivationFnType
    rowSize: number
    filterSize: number
    poolSize: number

    constructor(){
        this.neurons = []
        this.activationFn = "softmax"
        this.rowSize = 0
        this.filterSize = 0
        this.poolSize = 0
    }
    init({ rowSize, filterSize, numFilters, activationFn, poolSize }: ConvLayerInfo){
        this.rowSize = rowSize
        this.filterSize = filterSize
        this.activationFn = activationFn
        this.poolSize = poolSize
        for(let i = 0; i < numFilters; ++i){
            const filter = new Neuron();
            filter.init(filterSize * filterSize);
            this.neurons.push(filter);
        }
    }
    calculate(inputs: number[]): number[]{
        const n = inputs.length / this.rowSize
        const m = this.rowSize
        const k = (this.filterSize - 1) / 2
        const res: number[][][] = []
        for(let f = 0; f < this.neurons.length; ++f){
            const filterRes: number[][] = []
            for(let i = k; i < n - k; ++i){
                const row: number[] = []
                for(let j = k; j < m - k; ++j){
                    const inputKernel: number[] = []
                    for(let fi = -k; fi <= k; ++fi){
                        for(let fj = -k; fj <= k; ++fj){
                            const value = inputs[(i+fi)*this.rowSize + j +fj]
                            inputKernel.push(value)
                        }
                    }
                    row.push(this.neurons[f].calculate(inputKernel))
                }
                filterRes.push(row)
            }
            res.push(filterRes)
        }
        
        return this.flattenOutput(res.map(f => {
            const values = this.flattenOutput(this.applyMaxPooling(f))
            const activationFnImp = ActivationFnImps[this.activationFn]
            if ("calculateAll" in activationFnImp) return activationFnImp.calculateAll(values)
            return values.map(value => activationFnImp.calculate(value))
        }))
    }
    applyMaxPooling(inputs: number[][]): number[][] {
        const pooledValues: number[][] = [];
        for (let i = 0; i < inputs.length; i += this.poolSize) {
            const row: number[] = [];
            for (let j = 0; j < inputs[i].length; j += this.poolSize) {
                let maxVal = Number.NEGATIVE_INFINITY;
                for (let ii = i; ii < i + this.poolSize; ii++) {
                    for (let jj = j; jj < j + this.poolSize; jj++) {
                        if (ii < inputs.length && jj < inputs[i].length) {
                            maxVal = Math.max(maxVal, inputs[ii][jj])
                        }
                    }
                }
                row.push(maxVal);
            }
            pooledValues.push(row);
        }
        return pooledValues;
    }

    flattenOutput(output: number[][]): number[] {
        return output.flat();
    }
    load({neurons, activationFn, rowSize, filterSize, poolSize}: ConvLayerObj){
        this.neurons = []
        this.activationFn = activationFn
        this.rowSize = rowSize
        this.filterSize = filterSize
        this.poolSize = poolSize
        for( const filter of neurons){
            const newFilter = new Neuron();
            newFilter.load(filter);
            this.neurons.push(newFilter);
        }
    }
    export(): ConvLayerObj{
        return {
            neurons: this.neurons,
            activationFn: this.activationFn,
            rowSize: this.rowSize,
            filterSize: this.filterSize,
            poolSize: this.poolSize
        }
    }
}

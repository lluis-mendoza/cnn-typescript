export interface NeuronObj {
    weights: number[]
    bias: number
}

export class Neuron {
    weights: number[]
    bias: number

    constructor() {
        this.weights = []
        this.bias = 0
    }
    init(numInputs: number){
        for (let i = 0; i < numInputs; ++i) {
            this.weights.push(Math.random() - 0.5);
        }
    }
    calculate(inputs: number[]): number{
        if(inputs.length !== this.weights.length){
            throw new Error(`Length of inputs (${inputs.length}) does not match length of weights (${this.weights.length})`);
          }
        let sum = 0;
        for(let i = 0; i < inputs.length; ++i){
            sum += inputs[i] * this.weights[i]
        }
        sum += this.bias
        return sum
    }
    load(neuron: NeuronObj){
        const { weights, bias } = neuron
        this.weights = weights
        this.bias = bias
    }
    export(): NeuronObj {
        return {
            weights : this.weights,
            bias: this.bias,
        }
    }
 }
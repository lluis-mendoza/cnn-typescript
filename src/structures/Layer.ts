import { ActivationFunction, MultiInputActivationFunction, Relu, Sigmoid, Softmax } from "./ActivationFunction";
import { Neuron, NeuronObj } from "./Neuron";

export interface LayerInfo {
    numNeurons: number
    activationFn: ActivationFnType
}
export interface LayerObj{
    neurons: NeuronObj[]
    activationFn: ActivationFnType
}
export type ActivationFnType = "relu" | "softmax" | "sigmoid"
export type ActivationFn = ActivationFunction | MultiInputActivationFunction

export const ActivationFnImps: Record<ActivationFnType, ActivationFn> = {
    "sigmoid": new Sigmoid,
    "relu": new Relu,
    "softmax": new Softmax
}
export class Layer {
    neurons: Neuron[]
    activationFn: ActivationFnType
    constructor() {
        this.neurons = []
        this.activationFn = "softmax"
    }
    init({ numNeurons, activationFn }: LayerInfo, numInputsPerNeuron: number){
        this.activationFn = activationFn
        for (let i = 0; i < numNeurons; i++) {
            const neuron = new Neuron();
            neuron.init(numInputsPerNeuron);
            this.neurons.push(neuron);
        }
    }
    calculate(inputs: number[]): number[]{
        const values = this.neurons.map(neuron => neuron.calculate(inputs))
        const activationFnImp = ActivationFnImps[this.activationFn]
        if ("calculateAll" in activationFnImp) return activationFnImp.calculateAll(values)
        return values.map(value => activationFnImp.calculate(value))
    }
    load({ neurons, activationFn }: LayerObj){
        this.neurons = []
        this.activationFn = activationFn
        for( const neuron of neurons){
            const newNeuron = new Neuron();
            newNeuron.load(neuron);
            this.neurons.push(newNeuron);
        }
    }
    export(): LayerObj {
        return {
            neurons: this.neurons,
            activationFn: this.activationFn
        }
    }
}
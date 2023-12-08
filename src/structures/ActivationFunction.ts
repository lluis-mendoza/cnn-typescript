export interface ActivationFunction  {
    calculate(value: number): number
    calculateDerivative(value: number): number
}
export interface MultiInputActivationFunction {
    calculateAll(values: number[]): number[]
    calculateAllDerivative(values: number[]): number[]
}

export class Sigmoid implements ActivationFunction  {
    calculate(value: number): number {
        return ( 1 / ( 1 + Math.pow( Math.E, (-1)*value)))
    }
    calculateDerivative(value: number): number {
        return value*(1 - value)
    }
}

export class Relu implements ActivationFunction  {
    calculate(value: number): number {
        return Math.max(value, 0)
    }
    calculateDerivative(value: number): number {
        return value > 0 ? 1 : 0
    }
}

export class Softmax implements MultiInputActivationFunction  {
    calculateAll(values: number[]): number[] {
        const maxValue = Math.max(...values);
        const expArray = values.map((x) => Math.exp(x - maxValue));
        const sumExp = expArray.reduce((acc, val) => acc + val, 0);
        return expArray.map((exp) => exp / sumExp);
    }
    calculateAllDerivative(values: number[]): number[] {
        return this.calculateAll(values).map((softmaxValue) => softmaxValue * (1 - softmaxValue))
    }
}
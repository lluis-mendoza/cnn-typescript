import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css'
import GridCanvas from './components/GridCanvas'
import { Network, NetworkLayerInfo, NetworkObj } from './structures/Network';
import model from '../models/best.json'
import NumberDisplay from './components/NumberDisplay';

const App = () => {
  const networkRef = useRef<Network | null>(null)
  const [result, setResult] = useState<number[]>(Array(10).fill(0))
  const rowSize = 28

  useEffect(() => {  
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
        activationFn: "relu"
      },
      {
          numNeurons: 10,
          activationFn: "softmax"
      }
  ]
    const network = new Network();
    network.init(inputLength, layers);
    network.load(model as NetworkObj)
    networkRef.current = network
  },[])
  
  const onDrawEnd = useCallback((values: number[][]) => {
    if (networkRef.current === null) return
    const input = values.flat()
    const isNotEmpty = input.some(e => e !== 0)
    if (!isNotEmpty) return
    const res = networkRef.current.calculate(input)
    setResult(res)
  }, [])
  const onClear = useCallback(() => {
    setResult(Array(10).fill(0))
  },[])
  const maxNumber = useMemo(() => {
    const max = Math.max(...result)
    return max > 0 ? result.indexOf(max) : -1
  },[result])
  return (
    <>
      <div style={{display: "flex", flexDirection: "row", gap: "5px"}}>
        {
          result.map((value, i) => <NumberDisplay key={i} value={value} label={i} maxNumber={maxNumber}/>)
        }
      </div>
      <GridCanvas onDrawEnd={onDrawEnd} onClear={onClear} gridSize={rowSize}/>
    </>
  )
}

export default App

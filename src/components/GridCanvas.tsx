import { useEffect, useState } from 'react';

export interface GridCanvasProp{
  onDrawEnd: (value: number[][]) => void
  onClear: () => void
  gridSize: number
}
const GridCanvas = ({ onDrawEnd, gridSize, onClear }: GridCanvasProp) => {
  const [grid, setGrid] = useState<number[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(0))
  )
  
  const [isDrawing, setIsDrawing] = useState(false)

  const handlePixelClick = (row: number, col: number) => {
    const newGrid = [...grid]
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i
            const newCol = col + j
            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                const distance = Math.sqrt(i ** 2 + j ** 2)
                const brushValue = 1 - distance * 0.6
                newGrid[newRow][newCol] = Math.max(brushValue, grid[newRow][newCol])
            }
        }
    }
    setGrid(newGrid);
  }
  const handleMouseDown = () => {
    setIsDrawing(true);
  }

  const handleMouseUp = () => {
    setIsDrawing(false);
  }
  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) {
      handlePixelClick(row, col);
    }
  }
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, 15px)`,
    gridTemplateRows: `repeat(${gridSize}, 15px)`,
    gap: '2px',
    cursor: "crosshair"
  }

  const cellStyle = {
    width: '15px',
    height: '15px',
    borderRadius: "3px"
  }

  useEffect(() => {
    onDrawEnd(grid)
  },[isDrawing])

  const handleClear = () => {
    setGrid(Array.from({ length: gridSize }, () => Array(gridSize).fill(0)))
    setIsDrawing(false)
    onClear()
  }
  const handleDragStart = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
  };
  return (
    <>
      <div style={gridStyle}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDragStart={handleDragStart}>

        {grid.map((row, rowIndex) =>
            row.map((value, colIndex) => (
            <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                ...cellStyle,
                backgroundColor: `rgba(100, 100, 100, ${0.3 + value})`,
                }}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onClick={() => handlePixelClick(rowIndex, colIndex)}
            />
            ))
        )}
        </div>
        <button onClick={handleClear}>Clear</button>
    </>
  );
};

export default GridCanvas;
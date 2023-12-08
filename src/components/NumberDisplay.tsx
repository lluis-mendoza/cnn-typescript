
export interface NumberDisplayProps {
    value: number
    label: number
    maxNumber: number
}
const NumberDisplay = ({ value, label, maxNumber}: NumberDisplayProps) => {
    return (
        <div>
            <span style={{display: "inline-block", fontSize: "4rem", padding: "0 1rem", marginBottom: "10px", transition: "all 0.2s ease-in", ...(label === maxNumber) && {backgroundColor: "#4e4e4e", color: "#f1f1f1"}}}>{label}</span>
            <div style={{border: 3, borderRadius: 5, borderColor: "#4e4e4e", borderStyle: "solid", height: "4rem", width: "4rem", padding: "5px", display: "flex", alignItems: "flex-end"}}>
                <div style={{backgroundColor: "#4e4e4e", width: "100%", height: `${value*100}%`, transition: "all 0.5s ease-in"}}></div>
            </div>
        </div>
    )
}
export default NumberDisplay
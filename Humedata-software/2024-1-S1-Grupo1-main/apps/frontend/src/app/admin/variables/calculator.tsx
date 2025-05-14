import { Parameter } from "@/types/parameters"
import { Button } from "@ui/components/button"
import * as React from "react"

interface CalculatorProps {
  formula: string,
  setFormula: React.Dispatch<React.SetStateAction<string>>,
  handleEraseClick: (value: string) => void,
  handleParamClick: (value: string) => void,
  params: Parameter[],
}

const Calculator: React.FC<CalculatorProps> = ( { formula, setFormula, handleEraseClick, handleParamClick, params} ) => {
  
  const [operacionIsSelected, setOperacionIsSelected] = React.useState<boolean>(false)
  const [operacionValue, setOperacionValue] = React.useState<string>("0")


  const handleParentesis = () => {
    // TODO: contar cantidad de "(" y ")" si es igual -> (, si no )
    const formulaWithoutOpenParentesis: string = formula.replaceAll("(", "")
    const formulaWithoutCloseParentesis: string = formula.replaceAll(")", "")

    const countOpenParentesis: number = formula.length - formulaWithoutOpenParentesis.length
    const countCloseParentesis: number = formula.length - formulaWithoutCloseParentesis.length

    if (countOpenParentesis === countCloseParentesis) {
      const new_formula = formula + "("
      setFormula(new_formula.replaceAll("( ", "("))
    }
    else if (countOpenParentesis > countCloseParentesis) {
      const new_formula = formula + ")"
      setFormula(new_formula.replaceAll(" )", ")"))
    }
  }

  const handleNormalClick = (value: string) => {

    setFormula(value.replaceAll("  ", " "))
  }

  return (
    <div>
      <div 
        className="flex flex-row">
        {/* Numeros */}
        <div className="flex flex-col items-center">
          <div className="flex flex-row">
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "7")}>7</Button>
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "8")}>8</Button>
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "9")}>9</Button>
          </div>
          <div className="flex flex-row">
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "4")}>4</Button>
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "5")}>5</Button>
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "6")}>6</Button>
          </div>
          <div className="flex flex-row">
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "1")}>1</Button>
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "2")}>2</Button>
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "3")}>3</Button>
          </div>
          <div className="flex flex-row">
            <Button className="m-1" type="button" onClick={() => setFormula(formula + "0")}>0</Button>
          </div>
        </div>
        
        {/* Operaciones basicas */}
        <div className="flex flex-col">
          <Button className="m-1" type="button" onClick={() => handleNormalClick(formula + " / ")}>/</Button>
          <Button className="m-1" type="button" onClick={() => handleNormalClick(formula + " * ")}>*</Button>
          <Button className="m-1" type="button" onClick={() => handleNormalClick(formula + " - ")}>-</Button>
          <Button className="m-1" type="button" onClick={() => handleNormalClick(formula + " + ")}>+</Button>
        </div>

        {/* Operaciones complejas */}
        <div className="flex flex-col">
          <Button className="m-1" type="button" onClick={handleParentesis}>( )</Button>
          <Button className="m-1" type="button" onClick={() => setFormula(formula + "log(")} >log</Button>
          <Button className="m-1" type="button" onClick={() => setFormula(formula + "^(")}>( )^( )</Button>
          <Button className="m-1" type="button" onClick={() => setFormula(formula + "^(1/")}>raíz</Button>
        </div>

        {/* Borrar */}
        <div className="flex flex-col">
          <Button className="m-1 bg-red-600 hover:bg-red-700 hover:text-white text-white" type="button" onClick={() => handleEraseClick(formula)}>Borrar</Button>
          <Button className="m-1 bg-red-600 hover:bg-red-700 hover:text-white text-white" type="button" onClick={() => handleEraseClick("")}>Borrar todo</Button>
        </div>
      </div>

      <div className="mt-2">
        {/* Parametros */}
        {params?.map((param) => (
          <Button key={param.id} className="m-1 bg-purple-700 hover:bg-purple-900 hover:text-white text-white" type="button" onClick={() => handleParamClick(param.id)}> {param.name} </Button>
        ))}

      </div>
    </div>
  )
}

export default Calculator
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select"

import { Button } from "@ui/components/button"
import { Label } from "@ui/components/label"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/popover"
import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@ui/utils"
import { Calendar } from "@ui/components/calendar"
import { Input } from "@ui/components/input"
import { formatDateToISO } from "@/hooks/date-to-string-format"
import { differenceInDays } from "date-fns"

interface FilterTimeRangeProps {
  onRangeChange: (startDate: Date | undefined, endDate: Date | undefined, quickRange: string | undefined) => void;
}

export function FilterTimeRange({ onRangeChange }: FilterTimeRangeProps) {
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [quickRange, setQuickRange] = useState<string | undefined>("l-7-day")
  const [quickRangePlaceholder, setQuickRangePlaceholder] = useState<string>("l-7-day")
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [msgError, setMsgError] = useState<string | null>(null)
  const [buttonText, setButtonText] = useState<string>("Últimos 7 días")

  const startDateInputRef = useRef<HTMLInputElement>(null)
  const endDateInputRef = useRef<HTMLInputElement>(null)

  const handleRangeChange = () => {
    if (quickRange || (startDate && endDate && (endDate >= startDate) && (differenceInDays(endDate, startDate) <= 365))) {
      onRangeChange(startDate, endDate, quickRange)
      setMsgError(null)
      setIsOpen(false)
    } else {
      if (!quickRange && (!startDate || !endDate)) {
        setMsgError("Debes selccionar una fecha o un rango rápido")
      }
      // Error por ahora porque con un rango mayor a un año backend colapsa
      else if (startDate && endDate && (differenceInDays(endDate, startDate) > 365)) {
        setMsgError("El rango de tiempo debe ser menor o igual a un año")
      }
      else if (startDate && endDate && endDate < startDate) {
        setMsgError("La fecha de término no puede ser menor que la fecha de inicio")
      }
      else {
        setMsgError("Error al seleccionar un rango de tiempo")
      }
      setQuickRange(undefined)
      setStartDate(undefined)
      setEndDate(undefined)
      setIsOpen(false)
    } 
  }

  const determineButtonText = () => {
    if (quickRange) {
      return quickRange === "l-30-min"
        ? "Últimos 30 minutos"
        : quickRange === "l-1-hr"
          ? "Última hora"
          : quickRange === "l-3-hr"
            ? "Últimas 3 horas"
            : quickRange === "l-6-hr"
              ? "Últimas 6 horas"
              : quickRange === "l-12-hr"
                ? "Últimas 12 horas"
                : quickRange === "l-24-hr"
                  ? "Últimas 24 horas"
                  : quickRange === "l-2-day"
                    ? "Últimos 2 días"
                    : quickRange === "l-7-day"
                      ? "Últimos 7 días"
                      : quickRange === "l-15-day"
                        ? "Últimos 15 días"
                        : quickRange === "l-30-day"
                          ? "Últimos 30 días"
                          : quickRange === "l-90-day"
                            ? "Últimos 90 días"
                            : quickRange === "l-6-month"
                              ? "Últimos 6 meses"
                              : "Último año"
                              // : quickRange === "l-1-year"
                              //   ? "Último año" 
                              //   : "Últimos 5 años" // rango mayor a 1 año colapsa el backend
    } else if (startDate && endDate && endDate >= startDate) {
      return `${format(startDate, "dd/MM/yy HH:mm")} - ${format(endDate, "dd/MM/yy HH:mm")}`
    } else {
      return "Selecciona rango de tiempo"
    }
  }

  const handleQuickRangeChange = (value: string | undefined) => {
    setQuickRange(value)
    setStartDate(undefined)
    setEndDate(undefined)

    if (startDateInputRef.current) {
      startDateInputRef.current.value = ""
    }
    if (endDateInputRef.current) {
      endDateInputRef.current.value = ""
    }
    
    if (value) {
      setQuickRangePlaceholder(value)
    }
  }

  // Los handle comentados son en caso de que se use el componente Calendar de Shadcn
  // const handleStartDateChange = (date: Date | undefined) => {    
  //   if (date) {
  //     setStartDate(date)
  //     setQuickRange(undefined)
  //     setQuickRangePlaceholder("Rango rápido")
  //   }
  // }

  // const handleEndDateChange = (date: Date | undefined) => {    
  //   if (date) {
  //     setEndDate(date)
  //     setQuickRange(undefined)
  //     setQuickRangePlaceholder("Rango rápido")
  //   }
  // }

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : undefined
    setStartDate(date)
    setQuickRange(undefined)
    setQuickRangePlaceholder("Rango rápido")
  }

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : undefined
    setEndDate(date)
    setQuickRange(undefined)
    setQuickRangePlaceholder("Rango rápido")
  }

  useEffect(() => {
    const new_name = determineButtonText()
    setButtonText(new_name)
  }, [quickRange, startDate, endDate])

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">{buttonText}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Rango de tiempo</h4>
              <p className="text-sm text-muted-foreground">
              Selecciona una opción entre Desde-Hasta y Rango Rápido para el rango de tiempo de los datos.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label>Desde:</Label>
                {/* <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-[180px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar initialFocus mode="single" selected={startDate} onSelect={(startDate) => handleStartDateChange(startDate)} toDate={new Date()} />
                  </PopoverContent>
                </Popover> */}
                <Input type="datetime-local" name="startDate" id="startDate" 
                  className={cn("w-[190px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground")}
                  ref={startDateInputRef}
                  max={formatDateToISO(new Date())}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label>Hasta:</Label>
                {/* <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-[180px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar initialFocus mode="single" selected={endDate} onSelect={(endDate) => handleEndDateChange(endDate)} toDate={new Date()} />
                  </PopoverContent>
                </Popover> */}
                <Input type="datetime-local" name="endDate" id="endDate" 
                  className={cn("w-[190px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground")}
                  ref={endDateInputRef}
                  max={formatDateToISO(new Date())}
                  onChange={handleEndDateChange}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label>Alternativa rango rápido:</Label>
                <Select 
                  value={quickRangePlaceholder}
                  onValueChange={(value) => handleQuickRangeChange(value)} 
                >
                  <SelectTrigger className="w-[180px] focus:ring-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="l-30-min">Últimos 30 minutos</SelectItem>
                      <SelectItem value="l-1-hr">Última hora</SelectItem>
                      <SelectItem value="l-3-hr">Últimas 3 horas</SelectItem>
                      <SelectItem value="l-6-hr">Últimas 6 horas</SelectItem>
                      <SelectItem value="l-12-hr">Últimas 12 horas</SelectItem>
                      <SelectItem value="l-24-hr">Últimas 24 horas</SelectItem>
                      <SelectItem value="l-2-day">Últimos 2 días</SelectItem>
                      <SelectItem value="l-7-day">Últimos 7 días</SelectItem>
                      <SelectItem value="l-15-day">Últimos 15 días</SelectItem>
                      <SelectItem value="l-30-day">Últimos 30 días</SelectItem>
                      <SelectItem value="l-90-day">Últimos 90 días</SelectItem>
                      <SelectItem value="l-6-month">Últimos 6 meses</SelectItem>
                      <SelectItem value="l-1-year">Último año</SelectItem>
                      {/* <SelectItem value="l-5-year">Últimos 5 años</SelectItem> */}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Button onClick={handleRangeChange} className="mt-8">Aplicar</Button>
        </PopoverContent>
      </Popover>
      {msgError && <div className="text-red-600 text-sm xs:text-xs ml-2 mt-2">{msgError}</div>}
    </div>
  )
}
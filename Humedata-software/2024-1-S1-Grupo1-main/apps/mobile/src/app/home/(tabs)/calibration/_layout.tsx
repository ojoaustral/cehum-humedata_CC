import React, { useState } from "react"
import FormScreen from "./form"
import CalibrationModule from "./calibration"
import useStore from "@/utils/useStore"

export default function CalibrationScreen() {
  const [shouldShowForm, setShouldShowForm] = useState<boolean>(true)
  const [shouldShowSuccess, setShouldShowSuccess] = useState<boolean>(false)
  const device = useStore((state) => state.currentBluetoothDevice)

  if (shouldShowForm) {
    return <FormScreen setForm={setShouldShowForm} />
  }

  if (!shouldShowForm && !shouldShowSuccess && device) {
    return <CalibrationModule setSuccess={setShouldShowSuccess} setForm={setShouldShowForm} />
  }
}

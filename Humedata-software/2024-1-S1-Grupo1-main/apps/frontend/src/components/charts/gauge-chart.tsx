import React from "react"
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
} from "recharts"

interface Props {
  name: string;
  value: number;
  maxValue: number;
  color: string;
}

const CustomLabel: React.FC<{ viewBox: any, value: any }> = ({ viewBox, value }) => {
  const { cx, cy } = viewBox
  const formattedValue = parseFloat(value).toFixed(2) 
  return (
    <text x={cx} y={cy} fill="#333" textAnchor="middle" dominantBaseline="central" fontSize={30}>
      {formattedValue}
    </text>
  )
}

const GaugeChart: React.FC<Props> = ({ name, value, maxValue, color }) => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <h3 className="text-center font-semibold mb-2 text-lg">{name}</h3>
    <ResponsiveContainer width="100%" height={200}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="80%" barSize={10} data={[{ value }]} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, maxValue]} angleAxisId={0} tick={false} />
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          fill={color}
          label={<CustomLabel viewBox={undefined} value={value} />}
          background={{ fill: "#eee" }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  </div>
)

export default GaugeChart

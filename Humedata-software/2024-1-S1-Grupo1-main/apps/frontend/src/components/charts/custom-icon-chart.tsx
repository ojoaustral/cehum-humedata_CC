import React from "react"

interface IconProps {
  size: number;
}

export const IconStartAnnotation: React.FC<IconProps> = ({ size }) => (
  <svg fill="red" width={size} height={size} viewBox="0 0 20 20" >
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
    <g id="SVGRepo_iconCarrier">
      <path d="M15 10l-9 5V5l9 5z" />
    </g>
  </svg>
)

export const IconEndAnnotation: React.FC<IconProps> = ({ size }) => (
  <svg fill="red" width={size} height={size} viewBox="0 0 20 20">
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
    <g id="SVGRepo_iconCarrier">
      <path d="M14 5v10l-9-5 9-5z" /> 
    </g>
  </svg>
)
import React from "react"

const LoadingIcon: React.FC = () => (
  <svg className="animate-spin ml-3" width="40px" height="40px" viewBox="0 0 16 16" fill="none">
    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
    <g id="SVGRepo_iconCarrier"> 
      <g fill="#3498DB" fillRule="evenodd" clipRule="evenodd"> 
        <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" opacity=".2" /> 
        <path d="M7.25.75A.75.75 0 018 0a8 8 0 018 8 .75.75 0 01-1.5 0A6.5 6.5 0 008 1.5a.75.75 0 01-.75-.75z" /> 
      </g> 
    </g>
  </svg>
)

interface LoadingSkeletonProps {
  text: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ text }) => {
  return (
    <div className="flex justify-center items-center">
      <h2 className="flex items-center p-4">
        Cargando {text} <LoadingIcon />
      </h2>
    </div>
  )
}

export default LoadingSkeleton

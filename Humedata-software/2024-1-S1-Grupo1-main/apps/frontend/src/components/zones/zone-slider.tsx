"use client"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import React, { useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Slider from "react-slick"
import ZoneCard from "./zone-card"

interface ZoneData {
  dev_id: string; 
  zone_id: string; 
  zone_name: string; 
  location_name: string; 
  organization: string; 
  imageUrl: string;
}

interface ZoneSliderProps {
  activeId?: string | null;
  itemsToShow?: number;
  zoneData: ZoneData[];
}

function SampleNextArrow(props: { className: any; style: any; onClick: any; }) {
  const { className, style, onClick } = props
  return (
    <svg 
      className={`${className} w-6 h-6 text-gray-800 dark:text-white `} 
      style={{ ...style, display: "block", color: "black"}} 
      onClick={onClick} 
      aria-hidden="true" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="currentColor" 
      viewBox="0 0 10 16"
    >
      <path d="M3.414 1A2 2 0 0 0 0 2.414v11.172A2 2 0 0 0 3.414 15L9 9.414a2 2 0 0 0 0-2.828L3.414 1Z"/>
    </svg>
  )
}

function SamplePrevArrow(props: { className: any; style: any; onClick: any; }) {
  const { className, style, onClick } = props
  return (
    <svg 
      className={`${className} w-6 h-6 text-gray-800 dark:text-white`} 
      style={{ ...style, display: "block", color: "black"}} 
      onClick={onClick} 
      aria-hidden="true" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="currentColor" 
      viewBox="0 0 10 16"
    >
      <path d="M8.766.566A2 2 0 0 0 6.586 1L1 6.586a2 2 0 0 0 0 2.828L6.586 15A2 2 0 0 0 10 13.586V2.414A2 2 0 0 0 8.766.566Z"/>
    </svg>
  )
}

const ZoneSlider: React.FC<ZoneSliderProps> = ({ activeId, itemsToShow, zoneData }) => {

  const sliderRef = useRef<Slider | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (activeId) {
      const index = zoneData.findIndex(zone => zone.zone_id === activeId)
      if (index !== -1 && sliderRef.current) {
        sliderRef.current.slickGoTo(index)
      }
    }
  }, [activeId])

  const settings = {
    dots: true,
    speed: 500,
    slidesToShow: itemsToShow,
    slidesToScroll: itemsToShow,
    nextArrow: <SampleNextArrow className={undefined} style={undefined} onClick={undefined} />,
    prevArrow: <SamplePrevArrow className={undefined} style={undefined} onClick={undefined} />,
  }
  if (zoneData.length === 1) {
    return (
      <div className="w-100% mx-auto my-auto p-6">
        <div className="max-w-screen-sm">
          <div onClick={() => router.push(`/zona/${zoneData[0]?.zone_id}`)}>
            <ZoneCard 
              dev_id={zoneData[0]?.dev_id || ""} 
              zone_name={zoneData[0]?.zone_name || ""} 
              zone_id={zoneData[0]?.zone_id || ""} 
              location_name={zoneData[0]?.location_name || ""} 
              organization={zoneData[0]?.organization || ""} 
              imageUrl={zoneData[0]?.imageUrl || ""} 
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-3/4 mx-auto my-auto p-6">
      <div className="max-w-screen-sm">
        <Slider ref={sliderRef} {...settings}>
          {zoneData.map((zone, index) => (
            <div key={index} onClick={() => router.push(`/zona/${zone.zone_id}`)}>
              <ZoneCard dev_id={zone.dev_id} zone_name={zone.zone_name} zone_id={zone.zone_id} location_name={zone.location_name} organization={zone.organization} imageUrl={zone.imageUrl} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  )
}

export default ZoneSlider
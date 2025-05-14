import React from "react"
import Image from "next/image"
import { Popover, PopoverTrigger, PopoverContent } from "@ui/components/popover"
import { FiInfo } from "react-icons/fi"

interface ZoneCardProps {
  dev_id: string;
  zone_name: string;
  zone_id: string;
  location_name: string;
  organization: string;
  imageUrl: string;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ dev_id, zone_name, zone_id, location_name, organization, imageUrl }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg m-2 hover:bg-gray-200">

      <Image className="w-full" src={imageUrl} alt="Humedat@" width={500} height={500} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 inline-block transition-transform transform hover:translate-x-1 cursor-pointer">
          Zona {zone_name}
        </div>
        <div className="flex items-center text-gray-700 text-base mb-2">
          <span>Información</span>
          <Popover>
            <PopoverTrigger asChild>
              <button className="ml-2 text-xl">
                <FiInfo />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="p-2">
                <ul className="list-disc list-inside space-y-1">
                  <li className="text-sm text-gray-700">Humedat@ ID: {dev_id}</li>
                  <li className="text-sm text-gray-700">Zona ID: {zone_id}</li>
                </ul>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-gray-700 text-base">
          Cluster/Proyecto: {location_name}
        </p>
        <p className="text-gray-700 text-base">
          Organización: {organization}
        </p>
      </div>
    </div>
  )
}

export default ZoneCard

import Link from "next/link"
import Image from "next/image"
import Logo from "@ui/assets/humedat@os_banner.png"
import MenuNavegacion from "./menu_navegacion"

export default function Sidebar(){
  return (
    <div className="h-full md:w-[180px] lg:w-[220px] hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center justify-center border-b px-4 lg:h-[80px] lg:px-6">
          <Link href="/" className="flex font-semibold">
            <Image src={Logo} alt="logo" className=' w-max h-max object-contain' />          
          </Link>
        </div>
        <MenuNavegacion />
      </div>
    </div>
  )
};
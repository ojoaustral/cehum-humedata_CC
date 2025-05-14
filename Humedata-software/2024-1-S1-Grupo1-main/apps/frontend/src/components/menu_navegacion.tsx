import Link from "next/link"
import { adminDashboardRoutes, publicDashboardRoutes } from "@/routes"
import { Home } from "lucide-react"
import { Protect } from "@clerk/nextjs"


export default function MenuNavegacion() {
  return(
    <div className="flex-1">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {
          publicDashboardRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              prefetch={false}
              className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
            >
              <Home className="h-4 w-4" />
              {route.label}
            </Link>
          ))
        }
        <Protect role="org:admin">
          {
            adminDashboardRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                prefetch={false}
                className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary'
              >
                {route.icon}
                {route.label}
              </Link>
            ))
          }  
        </Protect>
      </nav>
    </div> 
  )
}
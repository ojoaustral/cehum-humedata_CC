
import { SlidersVertical, NotebookText, ArrowDownToLine, MapPinned  } from "lucide-react"

export const routes = {
  home: "/",
  signin: "/sign-in",
  variables: "/admin/variables",
  anotations: "/admin/anotaciones",
  downloads: "/admin/descargas",
  clusterszones: "/admin/clusters-zonas", 
}

export const publicDashboardRoutes = [
  {
    href: routes.home,
    label: "Inicio",
  },
]

export const adminDashboardRoutes = [
  {
    href: routes.clusterszones,
    label: "Clusters/Zonas",
    icon: <MapPinned className="h-4 w-4" />,
  },
  
  {
    href: routes.variables,
    label: "Variables",
    icon: <SlidersVertical className="h-4 w-4" />,
  },
  {
    href: routes.anotations,
    label: "Anotaciones",
    icon: <NotebookText className="h-4 w-4" />,
  },
  {
    href: routes.downloads,
    label: "Descargas",
    icon: <ArrowDownToLine className="h-4 w-4" />,
  }
]
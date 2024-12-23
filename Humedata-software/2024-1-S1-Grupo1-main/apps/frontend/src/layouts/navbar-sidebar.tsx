import { ReactNode } from "react"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"

interface NavbarSidebarLayoutProps {
  children: ReactNode;
  isFooter?: boolean;
}

const NavbarSidebarLayout = ({ children, isFooter = true }: NavbarSidebarLayoutProps) => {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[180px_1fr] lg:grid-cols-[220px_1fr]">
      <Sidebar/>
      <div className="flex flex-col overflow-hidden">
        <Header/>
        <MainContent isFooter={isFooter}>{children}</MainContent>
      </div>
    </div>
  )
}

const MainContent = ({ children, isFooter }: { children: ReactNode; isFooter: boolean }) => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {children}
      {isFooter && (
        <footer>
          {/* Footer content, optional */}
        </footer>
      )}
    </main>
  )
}

export default NavbarSidebarLayout

import { SignIn } from "@clerk/nextjs"
import { routes } from "@/routes"

export default function Page() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <SignIn 
        redirectUrl={routes.home}
        appearance={{
          elements: {
            formButtonPrimary: "bg-primary",
            footerActionLink: "text-secondary",
          },
        }} />
    </div>
  )
}
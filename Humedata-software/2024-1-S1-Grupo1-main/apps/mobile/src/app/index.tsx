import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import HomeLayout from "./home/_layout";
import LoginLayout from "./login/_layout";


export default function IndexRoute() {

  return (
    <>
      <SignedIn>
        <HomeLayout />
      </SignedIn>
      <SignedOut>
        <LoginLayout />
      </SignedOut>
    </>
  )
}

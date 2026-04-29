import { SignupFlow } from "@/components/auth/signup-flow"
import { SynkLogo } from "@/components/synk-logo"

export default function SignupPage() {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="flex items-center justify-between lg:hidden">
        <SynkLogo variant="light" />
      </div>
      <SignupFlow />
    </div>
  )
}

import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { credentialsClient } from "better-auth-credentials-plugin/client"

import type { auth } from "@/lib/auth"
import { mpfLoginInputSchema } from "@/lib/mpf-login"

export const authClient = createAuthClient({
  plugins: [
    credentialsClient<
      typeof auth.$Infer.Session.user,
      "/sign-in/credentials",
      typeof mpfLoginInputSchema
    >(),
    inferAdditionalFields<typeof auth>(),
  ],
})

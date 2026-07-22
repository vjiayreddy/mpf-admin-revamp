import { betterAuth } from "better-auth"
import type { User } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { APIError } from "better-auth/api"
import { twoFactor } from "better-auth/plugins"
import { credentials } from "better-auth-credentials-plugin"

import { authDb } from "@/lib/auth-db"
import * as schema from "@/lib/auth-schema"
import { patchTwoFactorCredentialsMatcher } from "@/lib/auth/with-credentials-two-factor"
import {
  authenticateWithMpfGraphQL,
  mpfLoginInputSchema,
  type MpfAuthUser,
} from "@/lib/mpf-login"

type MpfSessionUser = User & MpfAuthUser

export const auth = betterAuth({
  appName: "My Perfect Fit Admin",
  database: drizzleAdapter(authDb, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: false,
  },
  session: {
    expiresIn: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      firstName: { type: "string", required: false, returned: true },
      lastName: { type: "string", required: false, returned: true },
      phone: { type: "string", required: false, returned: true },
      countryCode: { type: "string", required: false, returned: true },
      isEmailVerified: { type: "boolean", required: false, returned: true },
      role: { type: "string", required: false, returned: true },
      isSuspended: { type: "boolean", required: false, returned: true },
      mpfAccessToken: { type: "string", required: false, returned: true },
      permissionsJson: { type: "string", required: false, returned: true },
      teamsJson: { type: "string", required: false, returned: true },
      activeStylistSessionId: { type: "string", required: false, returned: true },
    },
  },
  plugins: [
    credentials({
      autoSignUp: true,
      providerId: "mpf-graphql",
      path: "/sign-in/credentials",
      inputSchema: mpfLoginInputSchema,
      UserType: {} as MpfSessionUser,
      async callback(_ctx, parsed) {
        try {
          const user = await authenticateWithMpfGraphQL(parsed)
          return user
        } catch (error) {
          throw new APIError("UNAUTHORIZED", {
            message:
              error instanceof Error ? error.message : "Invalid credentials",
          })
        }
      },
    }),
    patchTwoFactorCredentialsMatcher(
      twoFactor({
        issuer: "My Perfect Fit Admin",
        // Passwords live in MPF GraphQL, not Better Auth credential accounts.
        allowPasswordless: true,
      })
    ),
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session

import type { BetterAuthPlugin } from "better-auth"

/**
 * Better Auth's twoFactor plugin only challenges
 * /sign-in/email|username|phone-number. We authenticate via
 * /sign-in/credentials (MPF GraphQL), so extend the after-hook matcher.
 *
 * Mutates in place so Better Auth plugin type inference stays intact.
 */
export function patchTwoFactorCredentialsMatcher<T extends BetterAuthPlugin>(
  plugin: T
): T {
  const afterHooks = plugin.hooks?.after
  if (!afterHooks?.length) return plugin

  for (const hook of afterHooks) {
    const originalMatcher = hook.matcher
    hook.matcher = (context) =>
      originalMatcher(context) || context.path === "/sign-in/credentials"
  }

  return plugin
}

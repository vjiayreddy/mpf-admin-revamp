import path from "node:path"
import type { NextConfig } from "next"

const appRoot = path.join(__dirname)

const nextConfig: NextConfig = {
  // Parent folder `uidevs/` has its own `.git` + sibling apps. Without this,
  // Next treats the parent as the workspace root and first compile hangs forever.
  outputFileTracingRoot: appRoot,
  turbopack: {
    root: appRoot,
  },
}

export default nextConfig

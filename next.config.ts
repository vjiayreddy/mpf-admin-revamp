import path from "node:path"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Parent folder also has a package-lock.json; pin Turbopack to this app.
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig

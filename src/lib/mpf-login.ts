import { z } from "zod"
import { jwtDecode } from "jwt-decode"

export const mpfLoginInputSchema = z.object({
  source: z.string().email(),
  password: z.string().min(5),
  name: z.string().min(1),
  city: z.string().optional(),
  countryName: z.string().optional(),
  ip: z.string().optional(),
  ipversion: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  postal: z.string().optional(),
  region: z.string().optional(),
  browser: z.string().optional(),
  device: z.string().optional(),
})

export type MpfLoginInput = z.infer<typeof mpfLoginInputSchema>

type MpfJwtPayload = {
  _id?: string
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  countryCode?: string
  isEmailVerified?: boolean
  role?: string[]
  teams?: unknown
  image?: string
  profileImage?: string
  picture?: string
  avatar?: string
}

type MpfLoginResponse = {
  data?: {
    login?: {
      token?: string
      activeStylistSessionId?: string
      isSuspended?: boolean
      permissions?: unknown
      user?: {
        _id?: string
        firstName?: string
        lastName?: string
        images?: {
          profile?: string | null
        } | null
      }
    }
  }
  errors?: { message?: string }[]
}

const LOGIN_QUERY = `
  query Login(
    $source: String!
    $password: String!
    $name: String
    $locationDetails: LocationDetailsInput
  ) {
    login(
      source: $source
      password: $password
      name: $name
      locationDetails: $locationDetails
    ) {
      activeStylistSessionId
      token
      isSuspended
      permissions {
        roleId
        access {
          allowedControls
          isAvailable
          resource {
            name
            isAvailable
            label
          }
        }
      }
      user {
        firstName
        lastName
        _id
        images {
          profile
        }
      }
    }
  }
`

export type MpfAuthUser = {
  email: string
  name: string
  image?: string
  firstName: string
  lastName: string
  phone: string
  countryCode: string
  isEmailVerified: boolean
  role: string
  isSuspended: boolean
  mpfAccessToken: string
  permissionsJson: string
  teamsJson: string
  activeStylistSessionId: string
}

export async function authenticateWithMpfGraphQL(
  input: MpfLoginInput
): Promise<MpfAuthUser> {
  const apiUrl = process.env.MPF_API_URL
  if (!apiUrl) {
    throw new Error("MPF_API_URL is not configured")
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: LOGIN_QUERY,
      variables: {
        source: input.source,
        password: input.password,
        name: input.name,
        locationDetails: {
          city: input.city,
          countryName: input.countryName,
          ip: input.ip,
          ipversion: input.ipversion,
          latitude: input.latitude,
          longitude: input.longitude,
          postal: input.postal,
          region: input.region,
          browser: input.browser,
          device: input.device,
        },
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`MPF login failed (${res.status})`)
  }

  const json = (await res.json()) as MpfLoginResponse
  const login = json.data?.login
  const token = login?.token

  if (json.errors?.length || !token) {
    throw new Error(json.errors?.[0]?.message ?? "Invalid email or password")
  }

  if (login?.isSuspended) {
    throw new Error("Account is suspended")
  }

  const tokenData = jwtDecode<MpfJwtPayload>(token)
  const firstName =
    tokenData.firstName ?? login.user?.firstName ?? input.name.split(" ")[0] ?? ""
  const lastName = tokenData.lastName ?? login.user?.lastName ?? ""
  const email = tokenData.email ?? input.source
  const image =
    login.user?.images?.profile ||
    tokenData.image ||
    tokenData.profileImage ||
    tokenData.picture ||
    tokenData.avatar ||
    undefined

  return {
    email,
    name:
      tokenData.fullName ??
      (`${firstName} ${lastName}`.trim() || input.name),
    ...(image ? { image } : {}),
    firstName,
    lastName,
    phone: tokenData.phone ?? "",
    countryCode: tokenData.countryCode ?? "",
    isEmailVerified: Boolean(tokenData.isEmailVerified),
    role: tokenData.role?.[0] ?? "",
    isSuspended: Boolean(login.isSuspended),
    mpfAccessToken: token,
    permissionsJson: JSON.stringify(login.permissions ?? null),
    teamsJson: JSON.stringify(tokenData.teams ?? null),
    activeStylistSessionId: login.activeStylistSessionId ?? "",
  }
}

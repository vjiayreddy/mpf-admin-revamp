/** Static body-profile attribute lookups (legacy bodyProfileUserAttributes). */

export type BodyProfileAttributeOption = {
  _id: string
  name: string
}

export const BODY_PROFILE_ATTRIBUTES = {
  shoulderType: [
    { _id: "5ebce96f77d4223128f4371b", name: "High" },
    { _id: "5ebce99177d4223128f4371c", name: "Normal" },
    { _id: "5ebce99e77d4223128f4371d", name: "Sloping" },
  ],
  postureType: [
    { _id: "5ebcec7077d4223128f4371f", name: "Stooped" },
    { _id: "5ebcec5077d4223128f4371e", name: "Normal" },
  ],
  shapeType: [
    { _id: "5d9784da3563743450ab94a2", name: "Triangle" },
    { _id: "5d9784da3563743450ab94a5", name: "Inverted Triangle" },
    { _id: "5d9784da3563743450ab94a3", name: "Trapezoid" },
    { _id: "5d9784da3563743450ab94a6", name: "Oval" },
    { _id: "5d9784da3563743450ab94a4", name: "Rectangle" },
  ],
  preferenceType: [
    { _id: "5ebf70cc8883f7112c0346be", name: "Tight" },
    { _id: "5ebf71208883f7112c0346bf", name: "Slim" },
    { _id: "5ebf71448883f7112c0346c1", name: "Regular" },
    { _id: "5ebf712f8883f7112c0346c0", name: "Loose" },
  ],
} as const satisfies Record<string, BodyProfileAttributeOption[]>

export function resolveBodyAttributeName(
  id: string | null | undefined,
  options: readonly BodyProfileAttributeOption[]
): string {
  if (!id) return "N/A"
  return options.find((o) => o._id === id)?.name ?? "N/A"
}

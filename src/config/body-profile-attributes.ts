/** Static body-profile attribute lookups (legacy bodyProfileUserAttributes). */

export type BodyProfileAttributeOption = {
  _id: string
  name: string
  image: string
}

export const BODY_PROFILE_ATTRIBUTES = {
  shoulderType: [
    {
      _id: "5ebce96f77d4223128f4371b",
      name: "High",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/shoulderType/high.jpg",
    },
    {
      _id: "5ebce99177d4223128f4371c",
      name: "Normal",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/shoulderType/normal.jpg",
    },
    {
      _id: "5ebce99e77d4223128f4371d",
      name: "Sloping",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/shoulderType/slopping.jpg",
    },
  ],
  postureType: [
    {
      _id: "5ebcec7077d4223128f4371f",
      name: "Stooped",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/bodyPosture/stopped.jpg",
    },
    {
      _id: "5ebcec5077d4223128f4371e",
      name: "Normal",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/bodyPosture/normal.jpg",
    },
  ],
  shapeType: [
    {
      _id: "5d9784da3563743450ab94a2",
      name: "Triangle",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/bodyShape/triangle.png",
    },
    {
      _id: "5d9784da3563743450ab94a5",
      name: "Inverted Triangle",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/bodyShape/inverted_triangle.png",
    },
    {
      _id: "5d9784da3563743450ab94a3",
      name: "Trapezoid",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/bodyShape/trapezoid.png",
    },
    {
      _id: "5d9784da3563743450ab94a6",
      name: "Oval",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/bodyShape/oval.png",
    },
    {
      _id: "5d9784da3563743450ab94a4",
      name: "Rectangle",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/bodyShape/rectangle.png",
    },
  ],
  preferenceType: [
    {
      _id: "5ebf70cc8883f7112c0346be",
      name: "Tight",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/fitPreference/tight.jpg",
    },
    {
      _id: "5ebf71208883f7112c0346bf",
      name: "Slim",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/fitPreference/slim.png",
    },
    {
      _id: "5ebf71448883f7112c0346c1",
      name: "Regular",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/fitPreference/normal.png",
    },
    {
      _id: "5ebf712f8883f7112c0346c0",
      name: "Loose",
      image:
        "https://mpf-public-data.s3.ap-south-1.amazonaws.com/Images/MPFTypeImages/fitPreference/loose.png",
    },
  ],
} as const satisfies Record<string, BodyProfileAttributeOption[]>

export function resolveBodyAttributeName(
  id: string | null | undefined,
  options: readonly BodyProfileAttributeOption[]
): string {
  if (!id) return "N/A"
  return options.find((o) => o._id === id)?.name ?? "N/A"
}

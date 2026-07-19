export type LoadStepStatus = "pending" | "done" | "none" | "error"

export type MeasurementLoadStep = {
  id: string
  label: string
  status: LoadStepStatus
}

export function defaultLoadSteps(): MeasurementLoadStep[] {
  return [
    {
      id: "fetch",
      label: "Getting last saved measurements",
      status: "pending",
    },
    {
      id: "defaults",
      label: "Applied default loosenings / saved values",
      status: "pending",
    },
    {
      id: "formulas",
      label: "Finished formula calculations",
      status: "pending",
    },
  ]
}

export function shirtCommonLoadSteps(): MeasurementLoadStep[] {
  return [
    {
      id: "fetch-shirt",
      label: "Getting last saved shirt measurements",
      status: "pending",
    },
    {
      id: "apply-shirt",
      label: "Applying shirt common measurements",
      status: "pending",
    },
    {
      id: "formulas",
      label: "Finished formula calculations",
      status: "pending",
    },
  ]
}

export function trouserCommonLoadSteps(): MeasurementLoadStep[] {
  return [
    {
      id: "fetch-trouser",
      label: "Getting last saved trouser measurements",
      status: "pending",
    },
    {
      id: "apply-trouser",
      label: "Applying trouser common measurements",
      status: "pending",
    },
    {
      id: "formulas",
      label: "Finished formula calculations",
      status: "pending",
    },
  ]
}

export function suitCommonLoadSteps(): MeasurementLoadStep[] {
  return [
    {
      id: "fetch-shirt",
      label: "Getting last saved shirt measurements",
      status: "pending",
    },
    {
      id: "fetch-trouser",
      label: "Getting last saved trouser measurements",
      status: "pending",
    },
    {
      id: "apply-common",
      label: "Applying common suit measurements",
      status: "pending",
    },
    {
      id: "formulas",
      label: "Finished formula calculations",
      status: "pending",
    },
  ]
}

export function markStep(
  steps: MeasurementLoadStep[],
  id: string,
  status: LoadStepStatus
): MeasurementLoadStep[] {
  return steps.map((s) => (s.id === id ? { ...s, status } : s))
}

export function markAll(
  steps: MeasurementLoadStep[],
  status: LoadStepStatus
): MeasurementLoadStep[] {
  return steps.map((s) => ({ ...s, status }))
}

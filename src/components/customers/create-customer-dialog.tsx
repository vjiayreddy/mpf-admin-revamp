"use client"

import {
  RegisterUserSheet,
  type RegisterUserSheetProps,
} from "@/components/customers/register-user-sheet"

export type CreateCustomerDialogProps = Omit<
  RegisterUserSheetProps,
  "endpoint"
>

/**
 * Customers / CIF / client-connect register sheet.
 * Thin wrapper around {@link RegisterUserSheet} with `createUserForCIF`.
 * For orders, use `<RegisterUserSheet endpoint="order" />` instead.
 */
export function CreateCustomerDialog(props: CreateCustomerDialogProps) {
  return <RegisterUserSheet {...props} endpoint="cif" />
}

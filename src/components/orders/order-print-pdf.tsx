import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import {
  getOrderPrintStudio,
  ORDER_PRINT_BANK,
  ORDER_PRINT_TERMS,
} from "@/config/order-print-studios"
import type {
  StoreOrderDetail,
  StoreOrderItem,
} from "@/lib/apollo/queries/store-orders"
import { firstName } from "@/lib/embroidery/format"
import { formatProductLabel } from "@/lib/orders/form"
import { mapOrderImageSrc } from "@/lib/orders/resolve-order-print-images"
import {
  customerFullName,
  formatRupees,
  formatStoreOrderDate,
} from "@/lib/track-orders/format"

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 24,
    paddingHorizontal: 22,
    fontSize: 9,
    color: "#111",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  logo: {
    width: 120,
    height: 48,
    objectFit: "contain",
  },
  logoFallback: {
    width: 120,
    height: 40,
    justifyContent: "center",
  },
  brandBlock: {
    flex: 1,
    alignItems: "flex-end",
  },
  brandName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
    textAlign: "right",
  },
  brandLine: {
    fontSize: 8,
    lineHeight: 1.35,
    textAlign: "right",
    color: "#333",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 14,
  },
  metaCol: {
    flex: 1,
  },
  metaItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  metaLabel: {
    width: 78,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  metaValue: {
    flex: 1,
    fontSize: 8,
  },
  table: {
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: "#222",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 0.5,
    borderBottomColor: "#222",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    minHeight: 36,
    alignItems: "center",
  },
  th: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  td: {
    fontSize: 7.5,
    paddingVertical: 3,
    paddingHorizontal: 3,
  },
  colNo: { width: "11%" },
  colProduct: { width: "14%" },
  colColor: { width: "10%" },
  colFab: { width: "10%" },
  colImg: { width: "9%", alignItems: "center" },
  colTrial: { width: "11%" },
  colPrice: { width: "9%", textAlign: "right" },
  thumb: {
    width: 28,
    height: 28,
    objectFit: "cover",
  },
  thumbEmpty: {
    width: 28,
    height: 28,
    backgroundColor: "#e8e8e8",
    borderWidth: 0.5,
    borderColor: "#ccc",
  },
  totalsWrap: {
    marginTop: 2,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    width: "42%",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  totalsLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  totalsValue: {
    fontSize: 8,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    marginTop: 10,
  },
  term: {
    fontSize: 7.5,
    lineHeight: 1.35,
    marginBottom: 2,
    color: "#222",
  },
  bank: {
    fontSize: 7.5,
    lineHeight: 1.4,
    marginTop: 6,
  },
})

type OrderPrintPdfDocumentProps = {
  order: StoreOrderDetail
  imageMap: Record<string, string>
}

function MetaLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value?.trim() || "—"}</Text>
    </View>
  )
}

function Thumb({
  imageMap,
  url,
}: {
  imageMap: Record<string, string>
  url?: string | null
}) {
  const src = mapOrderImageSrc(imageMap, url)
  if (!src) return <View style={styles.thumbEmpty} />
  return <Image src={src} style={styles.thumb} />
}

function itemTrialDate(item: StoreOrderItem) {
  return formatStoreOrderDate(item.trialDate)
}

export function orderPrintPdfFilename(order: StoreOrderDetail) {
  const no = order.orderNo != null ? String(order.orderNo) : order._id || "order"
  return `order-${no}.pdf`
}

export function OrderPrintPdfDocument({
  order,
  imageMap,
}: OrderPrintPdfDocumentProps) {
  const studio = getOrderPrintStudio(order.studioId)
  const logoSrc = mapOrderImageSrc(imageMap, studio.logoPath)
  const items = (order.orderItems ?? []).filter(Boolean) as StoreOrderItem[]
  const phone = order.customerPhone
    ? `+${(order.customerCountryCode || "91").replace(/^\+/, "")} ${order.customerPhone}`
    : "—"
  const fullName = customerFullName(
    order.customerFirstName,
    order.customerLastName
  )
  const studioLabel = studio.name

  return (
    <Document
      title={orderPrintPdfFilename(order)}
      author="MyPerfectFit"
      subject={`Order ${order.orderNo ?? ""}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <View style={styles.logoFallback}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 }}>
                {studio.name}
              </Text>
            </View>
          )}
          <View style={styles.brandBlock}>
            <Text style={styles.brandName}>{studio.name}</Text>
            {studio.subtitle ? (
              <Text style={styles.brandLine}>{studio.subtitle}</Text>
            ) : null}
            <Text style={styles.brandLine}>Address: {studio.address}</Text>
            <Text style={styles.brandLine}>
              Call: {studio.phone} | Email: {studio.email}
            </Text>
            {studio.website ? (
              <Text style={styles.brandLine}>Website: {studio.website}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <MetaLine label="Studio" value={studioLabel} />
            <MetaLine
              label="Order No"
              value={order.orderNo != null ? String(order.orderNo) : null}
            />
            <MetaLine label="Name" value={fullName} />
            <MetaLine label="Mobile" value={phone} />
            <MetaLine label="Email" value={order.customerEmail} />
            <MetaLine label="Stylist" value={firstName(order.stylist)} />
            <MetaLine label="Source" value={order.sourceChannel} />
            <MetaLine label="Sub source" value={order.sourceSubChannel} />
          </View>
          <View style={styles.metaCol}>
            <MetaLine label="Customer Id" value={order.customerId} />
            <MetaLine
              label="Height"
              value={
                order.customerHeight != null
                  ? String(order.customerHeight)
                  : null
              }
            />
            <MetaLine
              label="Weight"
              value={
                order.customerWeight != null
                  ? String(order.customerWeight)
                  : null
              }
            />
            <MetaLine label="City" value={order.customerCity} />
            <MetaLine
              label="Order date"
              value={formatStoreOrderDate(order.orderDate)}
            />
            <MetaLine
              label="Event date"
              value={formatStoreOrderDate(order.eventDate)}
            />
            <MetaLine
              label="Ready date"
              value={formatStoreOrderDate(order.readyDate)}
            />
            <MetaLine
              label="Trial date"
              value={formatStoreOrderDate(order.trialDate)}
            />
            <MetaLine
              label="Delivery"
              value={formatStoreOrderDate(order.deliveryDate)}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colNo]}>P.No</Text>
            <Text style={[styles.th, styles.colProduct]}>Product</Text>
            <Text style={[styles.th, styles.colColor]}>Colour</Text>
            <Text style={[styles.th, styles.colFab]}>Fab-code</Text>
            <Text style={[styles.th, styles.colImg]}>Fabric</Text>
            <Text style={[styles.th, styles.colImg]}>Ref</Text>
            <Text style={[styles.th, styles.colImg]}>Fit</Text>
            <Text style={[styles.th, styles.colTrial]}>Trial Date</Text>
            <Text style={[styles.th, styles.colPrice]}>Price</Text>
          </View>

          {items.map((item, index) => (
            <View
              key={item._id || String(item.itemNumber) || index}
              style={styles.tableRow}
              wrap={false}
            >
              <Text style={[styles.td, styles.colNo]}>
                {item.itemNumber != null ? String(item.itemNumber) : "—"}
              </Text>
              <Text style={[styles.td, styles.colProduct]}>
                {formatProductLabel(item.itemName || "") ||
                  item.itemName ||
                  "—"}
              </Text>
              <Text style={[styles.td, styles.colColor]}>
                {item.itemColor || "—"}
              </Text>
              <Text style={[styles.td, styles.colFab]}>
                {item.fabricCode || "—"}
              </Text>
              <View style={[styles.td, styles.colImg]}>
                <Thumb imageMap={imageMap} url={item.fabricImage} />
              </View>
              <View style={[styles.td, styles.colImg]}>
                <Thumb imageMap={imageMap} url={item.referenceImage} />
              </View>
              <View style={[styles.td, styles.colImg]}>
                <Thumb imageMap={imageMap} url={item.fitImage} />
              </View>
              <Text style={[styles.td, styles.colTrial]}>
                {itemTrialDate(item)}
              </Text>
              <Text style={[styles.td, styles.colPrice]}>
                {formatRupees(item.itemPrice)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          {(
            [
              ["Total", formatRupees(order.orderTotal)],
              ["Other Charges", formatRupees(order.otherCharges)],
              ["Deductions", formatRupees(order.deductions)],
              ["Net Amount", formatRupees(order.afterDeductionsTotal)],
              ["Advance", formatRupees(order.payment)],
              ["Balance", formatRupees(order.balanceAmount)],
              ["Order Status", order.orderStatus?.trim() || "—"],
            ] as const
          ).map(([label, value]) => (
            <View key={label} style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>{label}</Text>
              <Text style={styles.totalsValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Terms and Conditions</Text>
        {ORDER_PRINT_TERMS.map((term, i) => (
          <Text key={i} style={styles.term}>
            {i + 1}. {term}
          </Text>
        ))}

        {!studio.hideBank ? (
          <Text style={styles.bank}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Bank Account{"\n"}</Text>
            {ORDER_PRINT_BANK}
          </Text>
        ) : null}
      </Page>
    </Document>
  )
}

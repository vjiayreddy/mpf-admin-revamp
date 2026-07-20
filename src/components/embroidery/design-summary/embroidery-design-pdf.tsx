import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer"

import type {
  EmbroideryBoota,
  EmbroideryDetail,
  EmbroideryMonogram,
} from "@/lib/apollo/queries/embroidery"
import {
  firstImageUrl,
  firstName,
  formatDistanceAttr,
  formatEmbroideryDate,
  formatWorkType,
  getFractionLabel,
  parseWorkAreaGroups,
} from "@/lib/embroidery/format"
import { mapImageSrc } from "@/lib/embroidery/resolve-pdf-images"

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    fontSize: 9,
    color: "#111",
    fontFamily: "Helvetica",
  },
  strip: {
    backgroundColor: "#000",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stripText: {
    color: "#fff",
    fontSize: 9,
  },
  section: {
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
  },
  th: {
    flex: 1,
    backgroundColor: "#000",
    color: "#fff",
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  td: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
    fontSize: 8,
  },
  heroRow: {
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: "#000",
    height: 180,
    marginBottom: 6,
  },
  heroMain: {
    flex: 1.4,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  heroSide: {
    flex: 1,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },
  heroImage: {
    width: 280,
    height: 160,
    objectFit: "contain",
  },
  thumbRow: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 6,
  },
  thumbBox: {
    flex: 1,
    height: 90,
    borderWidth: 0.5,
    borderColor: "#000",
    backgroundColor: "#d4d4d4",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  thumbImage: {
    width: 150,
    height: 70,
    objectFit: "contain",
  },
  cardRefImage: {
    width: 110,
    height: 70,
    objectFit: "contain",
  },
  thumbLabel: {
    position: "absolute",
    bottom: 2,
    left: 0,
    right: 0,
    textAlign: "center",
    backgroundColor: "#000",
    color: "#fff",
    fontSize: 7,
    paddingVertical: 1,
  },
  noteBox: {
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 6,
    marginBottom: 4,
    fontSize: 8,
  },
  workRow: {
    flexDirection: "row",
  },
  workBar: {
    width: 6,
    backgroundColor: "#000",
    borderWidth: 0.5,
    borderColor: "#000",
  },
  workCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 5,
    fontSize: 8,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  card: {
    borderWidth: 0.5,
    borderColor: "#000",
    marginBottom: 6,
  },
  cardHeader: {
    backgroundColor: "#000",
    color: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  cardImageRow: {
    flexDirection: "row",
    height: 80,
  },
  cardImageCell: {
    flex: 1,
    backgroundColor: "#d4d4d4",
    borderRightWidth: 0.5,
    borderRightColor: "#e5e5e5",
    justifyContent: "center",
    alignItems: "center",
  },
  cardNoteCell: {
    flex: 1,
    padding: 4,
    borderLeftWidth: 0.5,
    borderLeftColor: "#000",
    fontSize: 8,
  },
  metricsRow: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#000",
  },
  metricCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 0.5,
    borderRightColor: "#000",
    fontSize: 8,
  },
  metricDivider: {
    width: 5,
    backgroundColor: "#000",
  },
  sampleGrid: {
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: "#000",
  },
  sampleCol: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: "#000",
  },
  sampleHeader: {
    backgroundColor: "#000",
    color: "#fff",
    textAlign: "center",
    paddingVertical: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  sampleBody: {
    padding: 4,
    fontSize: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
  },
  footer: {
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#000",
    textAlign: "center",
    fontSize: 7,
    color: "#555",
  },
  muted: {
    color: "#666",
    fontSize: 8,
  },
})

function PdfImage({
  src,
  style,
}: {
  src: string | null
  style?: object
}) {
  if (!src) return null
  return <Image src={src} style={style} />
}

function hasBootaMetrics(boota: EmbroideryBoota) {
  return (
    Number(boota.size1H) > 0 ||
    Number(boota.size1V) > 0 ||
    Number(boota.backSizeH) > 0 ||
    Number(boota.backSizeV) > 0
  )
}

function BootaBlock({
  title,
  boota,
  imageMap,
}: {
  title: string
  boota: EmbroideryBoota
  imageMap: Record<string, string>
}) {
  const imgs = (boota.referenceImages ?? [])
    .map((u) => mapImageSrc(imageMap, u))
    .filter(Boolean) as string[]
  return (
    <View style={styles.card} wrap={false}>
      <Text style={styles.cardHeader}>{title}</Text>
      <View style={styles.cardImageRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.cardImageCell}>
            <PdfImage src={imgs[i] ?? null} style={styles.cardRefImage} />
          </View>
        ))}
        <View style={styles.cardNoteCell}>
          <Text>
            <Text style={styles.bold}>Note: </Text>
            {boota.note || "N/A"}
          </Text>
        </View>
      </View>
      <View style={styles.metricsRow}>
        <View style={styles.metricCell}>
          <Text style={styles.bold}>Boota Size (in)</Text>
          <Text>
            V: {boota.size1V ?? "N/A"} {getFractionLabel(boota.fractionSize1V)}
          </Text>
          <Text>
            H: {boota.size1H ?? "N/A"} {getFractionLabel(boota.fractionSize1H)}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricCell}>
          <Text style={styles.bold}>Boota Distance (in)</Text>
          <Text>
            V: {boota.distance1C2CV ?? "N/A"}{" "}
            {getFractionLabel(boota.fractionDistance1C2CV)}
          </Text>
          <Text>
            H: {boota.distance1C2CH ?? "N/A"}{" "}
            {getFractionLabel(boota.fractionDistance1C2CH)}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={[styles.metricCell, { borderRightWidth: 0 }]}>
          <Text style={styles.bold}>Boota Back Size (in)</Text>
          <Text>
            V: {boota.backSizeV ?? "N/A"}{" "}
            {getFractionLabel(boota.fractionBackSizeV)}
          </Text>
          <Text>
            H: {boota.backSizeH ?? "N/A"}{" "}
            {getFractionLabel(boota.fractionBackSizeH)}
          </Text>
        </View>
      </View>
    </View>
  )
}

function MonogramBlock({
  title,
  monogram,
  imageMap,
}: {
  title: string
  monogram: EmbroideryMonogram
  imageMap: Record<string, string>
}) {
  const imgs = (monogram.referenceImages ?? [])
    .map((u) => mapImageSrc(imageMap, u))
    .filter(Boolean) as string[]
  const positions = Array.isArray(monogram.positions)
    ? monogram.positions.join(", ")
    : monogram.positions || "NA"
  return (
    <View style={styles.card} wrap={false}>
      <Text style={styles.cardHeader}>{title}</Text>
      <View style={styles.cardImageRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.cardImageCell}>
            <PdfImage src={imgs[i] ?? null} style={styles.cardRefImage} />
          </View>
        ))}
        <View style={styles.cardNoteCell}>
          <Text>
            <Text style={styles.bold}>Note: </Text>
            {monogram.note || "N/A"}
          </Text>
        </View>
      </View>
      <View style={styles.metricsRow}>
        <View style={styles.metricCell}>
          <Text>
            <Text style={styles.bold}>Monogram Color: </Text>
            {monogram.color || "N/A"}
          </Text>
          <Text>
            <Text style={styles.bold}>Monogram Position: </Text>
            {positions}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={[styles.metricCell, { borderRightWidth: 0 }]}>
          <Text>
            <Text style={styles.bold}>Msize-H: </Text>
            {monogram.hsize ? `${monogram.hsize} Inch` : "N/A"}
          </Text>
          <Text>
            <Text style={styles.bold}>Color Shade: </Text>
            {monogram.shadeCard || "N/A"}
          </Text>
          <Text>
            <Text style={styles.bold}>Msize-V: </Text>
            {monogram.vsize ? `${monogram.vsize} Inch` : "N/A"}
          </Text>
          <Text>
            <Text style={styles.bold}>Color Card: </Text>
            {monogram.shadeNumber || "N/A"}
          </Text>
        </View>
      </View>
    </View>
  )
}

type EmbroideryDesignPdfDocumentProps = {
  row: EmbroideryDetail
  imageMap?: Record<string, string>
}

export function embroideryDesignPdfFilename(row: EmbroideryDetail) {
  const raw = (row.embroideryReqNo || row._id || "design").replace(
    /[^\w.-]+/g,
    "-"
  )
  return `emb-design-${raw}.pdf`
}

export function EmbroideryDesignPdfDocument({
  row,
  imageMap = {},
}: EmbroideryDesignPdfDocumentProps) {
  const productLabel = row.storeOrderProductName
    ? `${row.storeOrderProductName} (${row.storeOrderProductNumber || "—"})`
    : row.storeOrderProductNumber || "—"
  const trialDate =
    row.orderItemAttributes?.trialDate ?? row.trialDate ?? row.embTrialDate

  const headerCells = [
    { label: "P.No", value: productLabel },
    { label: "Cust. ID", value: row.customerId || "—" },
    { label: "Name", value: row.customerName || "—" },
    { label: "Stylist", value: firstName(row.stylist) },
    { label: "Order Date", value: formatEmbroideryDate(row.orderDate) },
    { label: "Trial Date", value: formatEmbroideryDate(trialDate) },
    {
      label: "Marking Exp.",
      value: formatEmbroideryDate(row.markingExpectedDate),
    },
    { label: "Comp. Date", value: formatEmbroideryDate(row.embReadyDate) },
  ]

  const designUrls = (
    row.designReferencesImageUrls?.filter(Boolean) ??
    row.designReferenceImages?.filter(Boolean) ??
    []
  )
    .map((u) => mapImageSrc(imageMap, u))
    .filter(Boolean) as string[]
  const hero = designUrls[0] ?? null
  const designRef2 = designUrls[1] ?? null
  const fabric = mapImageSrc(
    imageMap,
    firstImageUrl(row.orderItemAttributes?.fabricImage, row.fabricImage)
  )
  const reference = mapImageSrc(
    imageMap,
    firstImageUrl(row.orderItemAttributes?.referenceImage, row.referenceImage)
  )
  const styleSketch = mapImageSrc(
    imageMap,
    firstImageUrl(
      row.orderItemAttributes?.styleDesignImage,
      row.styleDesignImage
    )
  )

  const workTypes = Array.isArray(row.workType)
    ? row.workType.filter(Boolean)
    : row.workType
      ? [row.workType]
      : []
  const groupedAreas = parseWorkAreaGroups(row.workAreas)

  const bootas = (row.bootas ?? []).filter(hasBootaMetrics)
  const frontBootas = bootas.filter((b) => b.bootaSide === "FRONT")
  const backBootas = bootas.filter((b) => b.bootaSide !== "FRONT")
  const monograms = row.monograms ?? []
  const samples = row.workMaterialSamples ?? []

  return (
    <Document
      title={`Embroidery design ${row.embroideryReqNo || row._id}`}
      author="MyPerfectFit"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.strip}>
          <Text style={styles.stripText}>
            Fabric Color: {row.fabricColor || "N/A"} | Fabric Name:{" "}
            {row.fabricName || "N/A"}
          </Text>
          <Text style={styles.stripText}>{row.embroideryReqNo || ""}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.tableRow}>
            {headerCells.map((c) => (
              <Text key={c.label} style={styles.th}>
                {c.label}
              </Text>
            ))}
          </View>
          <View style={styles.tableRow}>
            {headerCells.map((c) => (
              <Text key={c.label} style={styles.td}>
                {c.value}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.heroRow} wrap={false}>
          <View style={styles.heroMain}>
            {hero ? (
              <PdfImage src={hero} style={styles.heroImage} />
            ) : (
              <Text style={styles.muted}>No design reference</Text>
            )}
          </View>
          <View style={styles.heroSide}>
            {styleSketch ? (
              <PdfImage src={styleSketch} style={styles.heroImage} />
            ) : (
              <Text style={styles.muted}>
                {row.storeOrderProductName || "Category sketch"}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.thumbRow} wrap={false}>
          {[
            { src: designRef2, label: "Design Reference Img" },
            { src: fabric, label: "Fabric Img" },
            { src: reference, label: "Reference Img" },
          ].map((item) => (
            <View key={item.label} style={styles.thumbBox}>
              <PdfImage src={item.src} style={styles.thumbImage} />
              <Text style={styles.thumbLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.noteBox}>
          <Text>
            <Text style={styles.bold}>Emb Ref Img Note: </Text>
            {row.designReferenceImageNote || "N/A"}
          </Text>
        </View>
        <View style={styles.noteBox}>
          <Text>
            <Text style={styles.bold}>Fabric Note: </Text>
            {row.orderItemAttributes?.fabricImageNote ||
              row.fabricImageNote ||
              "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.workRow}>
            <View style={styles.workBar} />
            <View style={styles.workCell}>
              <Text style={styles.bold}>Work Type:</Text>
              {workTypes.length > 0 ? (
                workTypes.map((w) => (
                  <Text key={w}>• {formatWorkType(w)}</Text>
                ))
              ) : (
                <Text>• NA</Text>
              )}
            </View>
            <View style={styles.workBar} />
            <View style={styles.workCell}>
              <Text style={styles.bold}>Work Area:</Text>
              {groupedAreas.length > 0 ? (
                groupedAreas.map((g) => (
                  <Text key={g.group}>
                    • {g.group}: {g.names.join(", ")}
                  </Text>
                ))
              ) : (
                <Text>• NA</Text>
              )}
            </View>
          </View>
          <View style={styles.workRow}>
            <View style={styles.workBar} />
            <View style={styles.workCell}>
              <Text>
                <Text style={styles.bold}>Cuff Distance: </Text>
                {formatDistanceAttr(row.otherAttributes, "cuff_distance")}
              </Text>
              <Text>
                <Text style={styles.bold}>Placket Distance: </Text>
                {formatDistanceAttr(row.otherAttributes, "placket_distance")}
              </Text>
              <Text>
                <Text style={styles.bold}>Daman Distance: </Text>
                {formatDistanceAttr(row.otherAttributes, "daman_distance")}
              </Text>
            </View>
            <View style={styles.workBar} />
            <View style={styles.workCell}>
              <Text>
                <Text style={styles.bold}>Length: </Text>
                {row.length ?? "N/A"}
              </Text>
              <Text>
                <Text style={styles.bold}>BBS: </Text>
                {row.bbs ?? "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.workRow}>
            <View style={styles.workBar} />
            <View style={styles.workCell}>
              <Text>
                <Text style={styles.bold}>Embroidery Type: </Text>
                {row.embType ?? "N/A"}
              </Text>
            </View>
            <View style={styles.workBar} />
            <View style={styles.workCell}>
              <Text>
                <Text style={styles.bold}>Artwork: </Text>
                {row.artworkType ?? "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {frontBootas.map((boota, i) => (
          <BootaBlock
            key={`f-${i}`}
            title={`Front Boota ${i + 1}`}
            boota={boota}
            imageMap={imageMap}
          />
        ))}
        {backBootas.map((boota, i) => (
          <BootaBlock
            key={`b-${i}`}
            title={`Back Boota ${i + 1}`}
            boota={boota}
            imageMap={imageMap}
          />
        ))}

        {monograms.map((monogram, i) => (
          <MonogramBlock
            key={`m-${i}`}
            title={`Monogram ${i + 1}`}
            monogram={monogram}
            imageMap={imageMap}
          />
        ))}

        {samples.length > 0 ? (
          <View style={styles.sampleGrid} wrap={false}>
            {samples.map((material, index) => (
              <View
                key={index}
                style={[
                  styles.sampleCol,
                  index === samples.length - 1 ? { borderRightWidth: 0 } : {},
                ]}
              >
                <Text style={styles.sampleHeader}>Sample {index + 1}</Text>
                {(material.attributes ?? []).map((attribute, attrIndex) => (
                  <View key={attrIndex} style={styles.sampleBody}>
                    <Text>Material: {attribute?.name || "N/A"}</Text>
                    <Text>Color: {attribute?.color || "N/A"}</Text>
                    <Text>Custom Color: {attribute?.customColor || "N/A"}</Text>
                    <Text>Note: {attribute?.note || "N/A"}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.footer}>
          MyPerfectFit · Embroidery design summary
        </Text>
      </Page>
    </Document>
  )
}

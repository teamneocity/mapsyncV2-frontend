import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "@/assets/Isolation_Mode.png";

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: "Helvetica",
    padding: 0,
  },

  headerBox: {
    border: "1pt solid #ccc",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  headerBottom: {
    border: "1pt solid #ccc",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 20,
  },

  logo: {
    width: 205,
    height: 31,
  },

  osNumber: {
    fontSize: 12,
    fontWeight: "bold",
  },

  titleBlock: {
    padding: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
  },

  infoBox: {
    border: "1pt solid #ccc",
    borderRadius: 6,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 12,
    marginHorizontal: 10,
  },
  column: {
    width: "48%",
    flexDirection: "column",
    rowGap: 6,
  },
  field: {
    border: "1pt solid #ccc",
    padding: 4,
    borderRadius: 4,
  },

  // 4. Foto + localização (borda)
  photoBox: {
    border: "1pt solid #ccc",
    borderRadius: 6,
    margin: 10,
    padding: 10,
  },
  photo: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    marginBottom: 8,
    border: "1pt solid #ccc",
  },
  row3: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 10,
  },
  locationField: {
    border: "1pt solid #ccc",
    borderRadius: 6,
    padding: 4,
    borderRadius: 4,
    width: "32%",
  },

  // 5. Anotações
  notesBlock: {
    margin: 10,
  },
  notesLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  notesBox: {
    border: "1pt solid #ccc",
    borderRadius: 6,
    minHeight: 120,
    padding: 6,
    borderRadius: 4,
  },

  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 30,
  },
  signatureBox: {
    width: "45%",
    borderTop: "1pt solid #000",

    paddingTop: 4,
    textAlign: "center",
  },
});

export function ServiceOrderPdf({ occurrence }) {
  const address = occurrence?.occurrence?.address;
  const photo = occurrence?.occurrence?.photos?.initial?.[0];

  const startedAt = occurrence.startedAt
    ? new Date(occurrence.startedAt).toLocaleDateString()
    : "—";
  const finishedAt = occurrence.finishedAt
    ? new Date(occurrence.finishedAt).toLocaleDateString()
    : "—";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1. Header com borda */}
        <View style={styles.headerBox}>
          {/* Linha 1 - texto e data (sem borda) */}
          <View style={styles.headerTop}>
            <Text>MapSync - OS Nº {occurrence.protocolNumber || "—"}</Text>
            <Text>
              {new Date().toLocaleDateString("pt-BR")},{" "}
              {new Date().toLocaleTimeString("pt-BR").slice(0, 5)}
            </Text>
          </View>

          {/* Linha 2 - logo e número (com borda) */}
          <View style={styles.headerBottom}>
            <Image src={logo} style={styles.logo} />
            <Text style={styles.osNumber}>
              OS {occurrence.protocolNumber || "—"}
            </Text>
          </View>
        </View>

        {/* 2. Título */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Ordem de Serviço</Text>
          <Text style={styles.subtitle}>
            ARACAJU - EMPRESA MUNICIPAL DE OBRAS E URBANIZACAO - EMURB
          </Text>
        </View>

        {/* 3. Bloco com duas colunas */}
        <View style={styles.infoBox}>
          <View style={styles.column}>
            <Text style={styles.field}>
              Solicitado por: {occurrence.occurrence?.author?.name || "—"}
            </Text>
            <Text style={styles.field}>
              Enviado por: {occurrence.occurrence?.author?.name || "—"}
            </Text>
            <Text style={styles.field}>
              Técnico: {occurrence.inspector?.name || "—"}
            </Text>
            <Text style={styles.field}>
              Equipe: {occurrence.team?.name || "—"}
            </Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.field}>
              Responsável: {occurrence.occurrence?.approvedBy?.name || "—"}
            </Text>
            <Text style={styles.field}>
              Encarregado: {occurrence.foreman?.name || "—"}
            </Text>
            <Text style={styles.field}>
              Natureza de Serviço: {occurrence.serviceNature?.name || "—"}
            </Text>
            <Text style={styles.field}>Status: {occurrence.status || "—"}</Text>
          </View>
        </View>

        {/* 4. Foto + localização */}
        <View style={styles.photoBox}>
          {photo && (
            <Image
              src={`https://mapsync-media.s3.sa-east-1.amazonaws.com/${photo}`}
              style={styles.photo}
            />
          )}

          <View style={styles.row3}>
            <Text style={styles.locationField}>
              Endereço: {address?.street || "—"}, {address?.number || "—"}
            </Text>
            <Text style={styles.locationField}>
              Long.: {address?.longitude || "—"}
            </Text>
            <Text style={styles.locationField}>
              Lat.: {address?.latitude || "—"}
            </Text>
          </View>
        </View>

        {/* 5. Anotações */}
        <View style={styles.notesBlock}>
          <Text style={styles.notesLabel}>ANOTAÇÕES:</Text>
          <View style={styles.notesBox}>
            <Text>
              {occurrence.occurrence?.description || "Sem anotações."}
            </Text>
          </View>
        </View>

        {/* 6. Assinaturas */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text>Responsável</Text>
            <Text>Iniciado em: {startedAt}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>Responsável</Text>
            <Text>Concluído em: {finishedAt}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

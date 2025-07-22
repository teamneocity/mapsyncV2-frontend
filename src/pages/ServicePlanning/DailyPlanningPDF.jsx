"use client";

import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

// Importando logos
import AjuLogo from "@/assets/Aju2.png";
import EmurbLogo from "@/assets/Emurb.png";

// Colunas da tabela
const columns = [
  { label: "Ordem", flex: 1, key: "ordem" },
  { label: "Fiscal", flex: 1, key: "inspector" },
  { label: "Encarregado", flex: 1, key: "foreman" },
  { label: "Equipe", flex: 1, key: "team" },
  { label: "Bairro", flex: 1, key: "neighborhood" },
  { label: "Endereço", flex: 2, key: "address" },
  { label: "Serviço", flex: 1, key: "service" },
  { label: "Data", flex: 1, key: "date" },
  { label: "Status", flex: 1, key: "status" },
];

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  titleSection: {
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: "#000000",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "#000000",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  infoRight: {
    alignItems: "flex-end",
  },
  infoText: {
    fontSize: 10,
    color: "#000000",
  },
  logoContainer: {
    flexDirection: "row",
    gap: 10,
  },
  logoImage: {
    width: 60,
    height: 30,
    objectFit: "contain",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    height: 40,
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    borderColor: "#D9DCE2",
    borderWidth: 1,
    borderRadius: 4,
    height: 40,
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 4,
    backgroundColor: "#FFFFFF",
  },
  cell: {
    fontSize: 8,
    color: "#4B4B62",
    paddingHorizontal: 2,
    textAlign: "left",
  },
});

// Cores de status
const getStatusStyle = (status) => {
  const map = {
    em_analise: { backgroundColor: "#E8F7FF", color: "#33CFFF" },
    emergencial: { backgroundColor: "#FFE8E8", color: "#FF2222" },
    aprovada: { backgroundColor: "#FFF4D6", color: "#986F00" },
    os_gerada: { backgroundColor: "#f0ddee", color: "#733B73" },
    aguardando_execucao: { backgroundColor: "#FFE4B5", color: "#CD853F" },
    pendente: { backgroundColor: "#E8F7FF", color: "#33CFFF" },
    em_execucao: { backgroundColor: "#FFF4D6", color: "#986F00" },
    finalizada: { backgroundColor: "#DDF2EE", color: "#40C4AA" },
  };
  return map[status] || { backgroundColor: "#f0f0f0", color: "#666" };
};

// Componente principal
export function DailyPlanningPDF({ data, formattedDate }) {
  const today = new Date(formattedDate + "T00:00:00");
  const dayName = today.toLocaleDateString("pt-BR", { weekday: "long" });

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Cabeçalho */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Diretoria de Operações</Text>
          <Text style={styles.subtitle}>Programação de atividades diárias</Text>
          <Text style={styles.infoText}>Equipe de manutenção</Text>
        </View>

        {/* Logos + Data */}
        <View style={styles.infoRow}>
          <View style={styles.logoContainer}>
            <Image src={AjuLogo} style={styles.logoImage} />
            <Image src={EmurbLogo} style={styles.logoImage} />
          </View>
          <View style={styles.infoRight}>
            <Text style={styles.infoText}>{formattedDate}</Text>
            <Text style={styles.infoText}>{dayName}</Text>
          </View>
        </View>

        {/* Cabeçalho da tabela */}
        <View style={styles.headerRow}>
          {columns.map((col, i) => (
            <Text key={i} style={{ ...styles.cell, flex: col.flex, fontWeight: 600 }}>
              {col.label}
            </Text>
          ))}
        </View>

        {/* Linhas da tabela */}
        {data.map((item, index) => {
          const statusStyle = getStatusStyle(item.status);
          return (
            <View key={item.id || index} style={styles.row}>
              {columns.map((col, i) => {
                let content = "—";

                switch (col.key) {
                  case "ordem":
                    content = item.ordem;
                    break;
                  case "inspector":
                    content = item.inspector?.name;
                    break;
                  case "foreman":
                    content = item.foreman?.name;
                    break;
                  case "team":
                    content = item.team?.name;
                    break;
                  case "neighborhood":
                    content = item.fullOccurrence?.address?.neighborhoodName;
                    break;
                  case "address":
                    content = `${item.fullOccurrence?.address?.street || ""}, ${
                      item.fullOccurrence?.address?.number || ""
                    }`;
                    break;
                  case "service":
                    content = item.serviceNature?.name;
                    break;
                  case "date":
                    content = item.scheduledDate
                      ? new Date(item.scheduledDate).toLocaleDateString("pt-BR")
                      : "—";
                    break;
                  case "status":
                    return (
                      <View
                        key={i}
                        style={{
                          ...styles.cell,
                          flex: col.flex,
                          backgroundColor: statusStyle.backgroundColor,
                          color: statusStyle.color,
                          borderRadius: 4,
                          paddingHorizontal: 2,
                          paddingVertical: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        <Text style={{ fontSize: 7 }}>
                          {(item.status || "—")
                            .replace("_", " ")
                            .replace(/^\w/, (c) => c.toUpperCase())}
                        </Text>
                      </View>
                    );
                  default:
                    break;
                }

                return (
                  <Text
                    key={i}
                    style={{
                      ...styles.cell,
                      flex: col.flex,
                      textAlign: "left",
                    }}
                  >
                    {content || "—"}
                  </Text>
                );
              })}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

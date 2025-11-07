"use client";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import AjuLogo from "@/assets/Aju2.png";
import EmurbLogo from "@/assets/Emurb.png";

function parseDateSafe(value) {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value)) return value;

  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d) ? null : d;
  }

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;

    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const d = new Date(s);
      return isNaN(d) ? null : d;
    }

    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d) ? null : d;
    }

    const fallback = new Date(s);
    return isNaN(fallback) ? null : fallback;
  }

  return null;
}

function formatDatePtBR(value) {
  const d = parseDateSafe(value);
  return d ? d.toLocaleDateString("pt-BR") : "—";
}

// Helper para exibir período
function formatPeriodPtBR(start, end) {
  const ds = parseDateSafe(start);
  const de = parseDateSafe(end);

  if (!ds && !de) return "—";
  if (ds && !de) return `de ${formatDatePtBR(ds)}`;
  if (!ds && de) return `até ${formatDatePtBR(de)}`;

  const left = formatDatePtBR(ds);
  const right = formatDatePtBR(de);

  if (left === right) return `em ${left}`;
  return `de ${left} até ${right}`;
}

// Colunas da tabela
const columns = [
  { label: "Ordem", flex: 1, key: "ordem" },
  { label: "Fiscal", flex: 1, key: "inspector" },
  { label: "Encarregado", flex: 1, key: "foreman" },
  { label: "Equipe", flex: 1, key: "team" },
  { label: "Bairro", flex: 1, key: "neighborhood" },
  { label: "Endereço", flex: 2, key: "address" },
  { label: "Serviço", flex: 1, key: "service" },
  { label: "Período", flex: 1, key: "period" },
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

// Máscaras 
const statusLabels = {
  em_analise: "Em análise",
  emergencial: "Emergencial",
  aprovada: "Aprovada",
  os_gerada: "O.S. gerada",
  aguardando_execucao: "Agendada",
  em_execucao: "Andamento",
  finalizada: "Finalizada",
  pendente: "Pendente",
  aceita: "Aceita",
  verificada: "Verificada",
  rejeitada: "Rejeitada",
};

const toTitle = (s) =>
  s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");

// Componente principal
export function DailyPlanningPDF({ data = [], formattedDate }) {
  const today = parseDateSafe(formattedDate) || new Date();
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
            <Text style={styles.infoText}>{formatDatePtBR(today)}</Text>
            <Text style={styles.infoText}>{dayName}</Text>
          </View>
        </View>

        {/* Cabeçalho da tabela */}
        <View style={styles.headerRow}>
          {columns.map((col, i) => (
            <Text
              key={i}
              style={{ ...styles.cell, flex: col.flex, fontWeight: 600 }}
            >
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
                    // só uma sequência
                    content = index + 1;
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
                    }`
                      .trim()
                      .replace(/,\s*$/, "");
                    break;
                  case "service":
                    content = item.serviceNature?.name;
                    break;
                  case "period":
                    content = formatPeriodPtBR(
                      item.scheduledStart,
                      item.scheduledEnd
                    );
                    break;
                  case "status": {
                    const raw = (item.status || "")
                      .toString()
                      .trim()
                      .toLowerCase();
                    const masked =
                      statusLabels[raw] ||
                      (raw ? toTitle(raw.replace(/_/g, " ")) : "—");

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
                        <Text style={{ fontSize: 7 }}>{masked}</Text>
                      </View>
                    );
                  }
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

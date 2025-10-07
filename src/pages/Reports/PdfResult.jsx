// src/pages/Reports/PdfResultado.jsx
import React, { useMemo } from "react";

export default function PdfResultado({
  base64 = "",
  filename = "relatorio.pdf",
}) {
  
  const blobUrl = useMemo(() => {
    if (!base64) return null;

    try {
     
      const byteChars = atob(base64); 
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const byteArray = new Uint8Array(byteNums);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Falha ao criar Blob do PDF:", e);
      return null;
    }
  }, [base64]);

  const handleBaixar = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "relatorio.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleVisualizar = () => {
    if (!blobUrl) return;
    window.open(blobUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow flex flex-col gap-4">
      <div className="flex gap-3">
        <button
          onClick={handleVisualizar}
          className="px-4 py-2 rounded-lg bg-[#5E56FF] text-white text-sm hover:brightness-110 transition"
        >
          Visualizar PDF
        </button>
        <button
          onClick={handleBaixar}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition"
        >
          Baixar PDF
        </button>
      </div>

      {/* dica opcional para o usuário */}
      <p className="text-xs text-gray-500">
        Arquivo: <span className="font-medium">{filename || "relatorio.pdf"}</span>
      </p>
    </div>
  );
}

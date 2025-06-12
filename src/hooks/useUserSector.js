// src/hooks/useUserSector.js
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/auth";

export function useUserSector() {
  const { user } = useAuth();
  const [setor, setSetor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSector() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/sector/responsavel/${user.id}`);
        setSetor(response.data.data); // só pega o setor direto
      } catch (error) {
        console.error("Erro ao buscar setor do usuário:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSector();
  }, [user]);

  return { setor, loading };
}

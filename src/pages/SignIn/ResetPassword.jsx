import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "@/hooks/auth";

import logo from "../../assets/logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { useNavigate } from "react-router-dom";

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast({
        variant: "destructive",
        title: "Campo obrigatório",
        description: "Por favor, preencha seu e-mail.",
      });
      return;
    }

    try {
      await resetPassword(trimmedEmail);
      setResent(true);

      toast({
        title: "E-mail enviado com sucesso!",
        description: "Verifique sua caixa de entrada ou spam.",
      });

      navigate("/password-reset"); // ⬅️ redireciona para a tela do código
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: "Tente novamente em instantes.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-manrope px-4 bg-[#EBEBEB]">
      <div className="w-full max-w-[400px] min-h-[30rem] flex flex-col items-center justify-center gap-8 bg-[#EBEBEB] p-6 rounded-2xl text-center overflow-hidden">
        <div className="w-full text-left flex flex-col gap-1 max-w-[366px]">
          <p className="text-2xl font-bold">Esqueceu sua senha</p>
          <p className="text-sm text-[#4B4B62]">Podemos ajudar a recuperar</p>
        </div>

        <div className="w-full text-left flex flex-col gap-2 max-w-[366px]">
          <p className="font-bold">Email</p>
          <Input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[55px] w-full"
          />
        </div>

        <div className="text-left w-full max-w-[366px]">
          <p className="text-sm">
            Não recebeu o código?{" "}
            <span
              onClick={handleSubmit}
              className="font-bold cursor-pointer hover:underline"
            >
              Reenviar código
            </span>
          </p>
        </div>

        <div className="w-full max-w-[366px]">
          <Button
            className="w-full h-[55px] rounded-[16px]"
            onClick={handleSubmit}
          >
            Receber Email
          </Button>
        </div>
      </div>
    </div>
  );
}

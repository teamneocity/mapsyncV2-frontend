import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";

export function PasswordReset() {
  const { toast } = useToast();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleCodeChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
    }
  };

  const handleSubmit = async () => {
    const token = code.join("").trim();
    const newPassword = password.trim();

    if (token.length < 4 || !newPassword) {
      toast({
        variant: "destructive",
        title: "Preencha todos os campos corretamente.",
      });
      return;
    }

    try {
      await api.post("/employees/password/reset", {
        token,
        newPassword,
      });

      navigate("/password-reset-success");


      // Redirecionar para login se quiser
      // navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: "Verifique se o código está correto.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-manrope px-4 bg-[#EBEBEB]">
      <div className="w-full max-w-[400px] flex flex-col gap-6 bg-[#EBEBEB] p-6 rounded-2xl text-center items-center">
        <div className="text-left w-full">
          <p className="text-2xl font-bold">Verifique seu e-mail</p>
          <p className="text-sm text-[#4B4B62]">
            Por favor, digite o código de segurança que acabamos de enviar.
          </p>
        </div>

        <div className="flex justify-between w-full max-w-[366px] gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !code[index] && index > 0) {
                  const prev = document.getElementById(`code-${index - 1}`);
                  prev?.focus();
                }
              }}
              id={`code-${index}`}
              className="w-12 h-14 rounded-md bg-white text-center text-2xl font-bold border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          ))}
        </div>

        <Input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-[55px] w-full"
        />

        <p className="text-sm">
          Não recebeu o código?{" "}
          <span className="font-bold cursor-pointer hover:underline">
            Reenviar código
          </span>
        </p>

        <Button
          onClick={handleSubmit}
          className="w-full h-[55px] rounded-[16px]"
        >
          Verificar
        </Button>
      </div>
    </div>
  );
}

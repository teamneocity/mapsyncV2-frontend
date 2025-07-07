// React e bibliotecas externas
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Hooks customizados
import { useToast } from "@/hooks/use-toast";

// Componentes globais
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Serviços e utilitários
import { api } from "@/services/api";



export function ResetPassword() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Nova Senha
    const { toast } = useToast()
    const navigate = useNavigate();


    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleOtpChange = (e) => setOtp(e.target.value);
    const handlePasswordChange = (e) => setNewPassword(e.target.value);

    const sendOtp = async () => {
        setLoading(true);
        try {
            const response = await api.post("/reset-password", { email });
            setMessage(response.data.message);
            setStep(2); // Avança para a etapa de inserir OTP
        } catch (error) {
            setMessage(error.response?.data?.error || "Erro ao enviar OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        setLoading(true);
        try {
            const response = await api.post("/reset-password/reset", { email, OTP: otp, newPassword });
            setMessage(response.data.message);
            toast({
                description: response.data.message,
            })

            setTimeout(() => {
                navigate("/"); // Redireciona para a página inicial
            }, 5000); // 5000 ms = 5 segundos
            
        } catch (error) {
            setMessage(error.response?.data?.error || "OTP inválido");
            toast({
                variant: "destructive",
                title: error.response?.data?.error,
                description: "Teve um problema na sua requisição.",
            })
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center font-manrope px-5">
            <div className="w-full max-w-[400px] min-h-[30rem] flex flex-col items-center gap-6 bg-white text-center p-6 rounded-lg shadow-md justify-between">
                <h1 className="text-[#262626] text-2xl font-bold">Esqueceu sua senha</h1>
                <p className="text-[#808080] text-sm">
                    Podemos ajudar a recuperar a senha e acompanhar o progresso.
                </p>

                {/* Etapa 1: Inserir E-mail */}
                {step === 1 && (
                    <>
                        <div className="w-full text-left">
                            <p className="font-bold">Email</p>
                            <Input
                                type="email"
                                placeholder="Insira seu e-mail"
                                value={email}
                                onChange={handleEmailChange}
                                className="w-full h-12 px-4 py-2 rounded-md border border-gray-300"
                            />
                        </div>

                        <Button
                            onClick={sendOtp}
                            className="w-full h-12 bg-black text-white rounded-md hover:bg-black/90"
                            disabled={loading}
                        >
                            {loading ? "Enviando OTP..." : "Enviar OTP"}
                        </Button>
                    </>
                )}

                {/* Etapa 2: Inserir OTP */}
                {step === 2 && (
                    <>
                        <div className="w-full text-left">
                            <p className="font-bold">OTP</p>
                            <Input
                                type="text"
                                placeholder="Insira o OTP recebido"
                                value={otp}
                                onChange={handleOtpChange}
                                className="w-full h-12 px-4 py-2 rounded-md border border-gray-300"
                            />
                        </div>

                        <div className="w-full text-left">
                            <p className="font-bold">Nova Senha</p>
                            <Input
                                type="password"
                                placeholder="Insira sua nova senha"
                                value={newPassword}
                                onChange={handlePasswordChange}
                                className="w-full h-12 px-4 py-2 rounded-md border border-gray-300"
                            />
                        </div>

                        <Button
                            onClick={verifyOtp}
                            className="w-full h-12 bg-black text-white rounded-md hover:bg-black/90"
                            disabled={loading}
                        >
                            {loading ? "Verificando OTP..." : "Verificar OTP"}
                        </Button>
                    </>
                )}


                {/* Link para voltar à página inicial */}
                <div className="text-center w-full max-w-[366px]">
                    <Link
                        to="/"
                        className="font-bold hover:underline text-sm"
                    >
                        <span className="hover:underline cursor-pointer">Voltar para a página inicial</span>
                    </Link>
                </div>

                {/* Mensagem de feedback */}
                {message && <p className="mt-4 text-center text-sm text-[#808080]">{message}</p>}
            </div>
        </div>
    );
}
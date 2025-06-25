import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "@/hooks/auth";

import logo from "../../assets/logo.png";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/passwordInput";
import { Button } from "@/components/ui/button";

import Cell from "@/assets/icons/Cell.svg?react";

export function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  function handleSignIn() {
    signIn({ email, password });
  }

  return (
    <div className="min-h-screen flex items-center justify-center font-manrope px-4 bg-[#EBEBEB]">
      <div className="w-full max-w-[400px] min-h-[30rem] flex flex-col items-center justify-center gap-8 bg-[#EBEBEB] p-6 rounded-2xl text-center overflow-hidden">
        <div className="w-full text-left flex flex-col gap-2 max-w-[366px]">
          <p className="font-bold">Email</p>
          <Input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={handleEmailChange}
            className="h-[55px] w-full"
          />
        </div>

        <div className="w-full max-w-[366px] text-left flex flex-col gap-2">
          <p className="font-bold">Senha</p>
          <PasswordInput
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="******"
            className="h-[55px] w-full"
          />
        </div>

        <div className="text-left w-full max-w-[366px]">
          <p>
            Esqueceu a senha?{" "}
            <span className="font-bold">
              <Link to="/resetPassword">Vamos recuperar?</Link>
            </span>
          </p>
        </div>

        <div className="w-full max-w-[366px] flex gap-2">
          <Button
            className="flex-1 h-[55px] rounded-[16px]"
            onClick={handleSignIn}
          >
            Login
          </Button>
          <div className="h-[55px] w-[55px] bg-white flex items-center justify-center rounded-[16px]">
            <Cell className="w-6 h-6 text-[#4B4B62]" />
          </div>
        </div>
      </div>
    </div>
  );
}

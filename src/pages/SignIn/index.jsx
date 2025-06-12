import { Link } from "react-router-dom"
import React, { useState } from 'react';
import { useAuth } from "@/hooks/auth";

import logo from "../../assets/logo.png"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/passwordInput"
import { Button } from "@/components/ui/button"


export function SignIn() {


    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
    };

    function handleSignIn() {
        signIn({ email, password })
    }

    return(
        <div className="min-h-screen flex items-center justify-center font-manrope">
            <div className="w-full max-w-[375px] min-h-[30rem] flex items-center gap-8 flex-col bg-white   text-center overflow-hidden ">
                <img src={logo} alt=""  />

                <div className="w-full text-left flex flex-col gap-2 max-w-[366px]">
                    <p className="font-bold ">Email</p>
                    <Input 
                        type="email" 
                        placeholder="Digite seu email" 
                        value={email}
                        onChange={handleEmailChange}
                    />
                </div>

                <div className="w-full max-w-[366px] text-left flex flex-col gap-2 ">
                    <p className="font-bold ">Senha</p>
                    <PasswordInput 
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="******"
                    />
                </div>

                <div className="text-left w-full max-w-[366px]"> 
                    <p>Esqueceu a senha? <span className="font-bold"><Link to="/resetPassword">Vamos recuperar?</Link></span></p>
                </div>


                <div className="w-full ">
                   <Button className="w-full h-14 rounded-[16px]" onClick={handleSignIn}>Login</Button>
                </div>
            </div>
        </div>
    )
}
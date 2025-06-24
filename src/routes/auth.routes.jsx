import { Routes, Route, Navigate } from "react-router-dom";

import { SignIn } from "@/pages/SignIn";



export function AuthRoutes() {

    const user = localStorage.getItem("@popcity:user")

    return (
        <Routes>
            <Route path="/" element={<SignIn/>}/>
           



            {!user && <Route path="*" element={<Navigate to="/"/>}/> } 
        </Routes>
    )
}
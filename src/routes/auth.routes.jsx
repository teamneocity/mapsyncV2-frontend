import { Routes, Route, Navigate } from "react-router-dom";
import { SignIn } from "@/pages/SignIn";
import { ResetPassword } from "@/pages/SignIn/ResetPassword"; 
import { PasswordReset } from "@/pages/SignIn/PasswordReset";
import { SuccessPasswordReset } from "@/pages/SignIn/SuccessPasswordReset";


export function AuthRoutes() {
  const user = localStorage.getItem("@popcity:user");

  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/resetPassword" element={<ResetPassword />} /> 
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/password-reset-success" element={<SuccessPasswordReset />} />


      {!user && <Route path="*" element={<Navigate to="/" />} />}
    </Routes>
  );
}

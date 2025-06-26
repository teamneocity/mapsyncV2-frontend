import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function SuccessPasswordReset() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EBEBEB] font-manrope px-4">
      <div className="w-full max-w-[400px] flex flex-col items-center justify-center gap-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="bg-green-200 w-24 h-24 rounded-full flex items-center justify-center"
        >
          <svg
            className="w-10 h-10 text-green-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <h2 className="text-2xl font-bold">Sucesso!</h2>
        <p className="text-sm text-[#4B4B62]">
          Sua senha foi redefinida com sucesso
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full h-[55px] rounded-[16px] bg-black text-white font-semibold"
        >
          Login
        </button>
      </div>
    </div>
  );
}

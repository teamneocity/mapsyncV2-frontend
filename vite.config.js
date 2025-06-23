import path from "path";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr"; 
import { defineConfig } from "vite"; 


export default defineConfig({
  plugins: [react(), svgr()], // 👈 adiciona svgr aqui
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  envPrefix: 'REACT_',
});

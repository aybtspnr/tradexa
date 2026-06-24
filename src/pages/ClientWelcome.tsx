import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, BarChart3, Search, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Logo from "@/components/Logo";

export default function ClientWelcome() {
  const { profile } = useAuth();
  const displayName = profile?.company_name || profile?.email?.split("@")[0] || "usuário";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-green-100 p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <Logo className="h-12" />
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Bem-vindo, {displayName}!
        </h1>
        <p className="text-gray-500 mb-8">
          Seu email foi confirmado. Sua conta TRADEXA está pronta para uso.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-4">
            <Search className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-700">Buscar</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <Globe className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-700">Comparar</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <BarChart3 className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <p className="text-xs font-medium text-gray-700">Analisar</p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Ir para o Dashboard
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          Explore dados de importação, exportação, alíquotas e muito mais.
        </p>
      </motion.div>
    </div>
  );
}

"use client";

import { Plane, Ship, Truck, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Hook utilitário para operações comuns de envios
 */
export const useShipmentUtils = () => {
  const getModalIcon = (modal: string): LucideIcon => {
    switch (modal) {
      case "Aéreo":
        return Plane;
      case "Marítimo":
        return Ship;
      case "Rodoviário":
        return Truck;
      default:
        return Package;
    }
  };

  const getModalConfig = (modal: string) => {
    switch (modal) {
      case "Aéreo":
        return {
          icon: Plane,
          color: "from-sky-500 to-blue-600",
          bgColor: "bg-sky-500/10",
          textColor: "text-sky-600",
          gradient: "from-sky-50 to-blue-50",
        };
      case "Marítimo":
        return {
          icon: Ship,
          color: "from-blue-600 to-indigo-700",
          bgColor: "bg-blue-500/10",
          textColor: "text-blue-600",
          gradient: "from-blue-50 to-indigo-50",
        };
      case "Rodoviário":
        return {
          icon: Truck,
          color: "from-orange-500 to-red-600",
          bgColor: "bg-orange-500/10",
          textColor: "text-orange-600",
          gradient: "from-orange-50 to-red-50",
        };
      default:
        return {
          icon: Package,
          color: "from-slate-500 to-slate-700",
          bgColor: "bg-slate-500/10",
          textColor: "text-slate-600",
          gradient: "from-slate-50 to-slate-100",
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Entregue":
        return {
          color: "from-green-500 to-blue-600",
          bgColor: "bg-green-500/10",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          pulse: false,
        };
      case "Em Trânsito":
        return {
          color: "from-blue-500 to-cyan-600",
          bgColor: "bg-blue-500/10",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          pulse: true,
        };
      case "Aguardando Pagamento":
        return {
          color: "from-red-500 to-rose-600",
          bgColor: "bg-red-500/10",
          textColor: "text-red-700",
          borderColor: "border-red-200",
          pulse: true,
        };
      case "Desembaraço":
        return {
          color: "from-amber-500 to-orange-600",
          bgColor: "bg-amber-500/10",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          pulse: false,
        };
      case "Disponível para Entrega":
        return {
          color: "from-purple-500 to-pink-600",
          bgColor: "bg-purple-500/10",
          textColor: "text-purple-700",
          borderColor: "border-purple-200",
          pulse: true,
        };
      case "Cancelado":
        return {
          color: "from-slate-400 to-gray-500",
          bgColor: "bg-slate-400/10",
          textColor: "text-slate-600",
          borderColor: "border-slate-200",
          pulse: false,
        };
      default:
        return {
          color: "from-slate-500 to-slate-600",
          bgColor: "bg-slate-500/10",
          textColor: "text-slate-700",
          borderColor: "border-slate-200",
          pulse: false,
        };
    }
  };

  const getProgressByStatus = (status: string): number => {
    switch (status) {
      case "Aguardando Pagamento":
        return 10;
      case "Aguardando Coleta":
        return 20;
      case "Coletado":
        return 35;
      case "Em Trânsito":
        return 55;
      case "Desembaraço":
        return 70;
      case "Disponível para Entrega":
        return 85;
      case "Entregue":
        return 100;
      case "Cancelado":
        return 0;
      default:
        return 25;
    }
  };

  const getCityFromAddress = (address: string): string => {
    if (!address) return "Não informado";
    const parts = address.split(",");
    return parts[0]?.trim() || "Não informado";
  };

  return {
    getModalIcon,
    getModalConfig,
    getStatusConfig,
    getProgressByStatus,
    getCityFromAddress,
  };
};
"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-[#D80E16]/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-[#D80E16]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F111A] mb-3">
              Algo deu errado
            </h1>
            <p className="text-[#5E6278] mb-8 leading-relaxed">
              Um erro inesperado ocorreu. Nossa equipe foi notificada.
              Tente recarregar a página ou voltar ao início.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-2xl h-12 px-6 font-bold border-0"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl h-12 px-6 font-bold border-[#0F111A]/15"
                asChild
              >
                <Link to="/">
                  Voltar ao Início
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-xs text-[#5E6278] cursor-pointer hover:text-[#0F111A]">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 p-4 bg-slate-50 rounded-xl text-xs text-[#5E6278] overflow-auto max-h-32">
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack?.split("\n").slice(1, 5).join("\n")}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

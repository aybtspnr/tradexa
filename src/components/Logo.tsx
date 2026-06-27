import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

interface LogoProps {
  className?: string;
  variant?: "default" | "white";
  to?: string;
}

const Logo = ({ className, variant = "default", to }: LogoProps) => {
  const content = (
    <img
      src={logoImg}
      alt="Tradexa — Inteligência de Mercado para Comércio Exterior"
      width={691}
      height={124}
      className={cn("h-full w-auto object-contain block", variant === "white" && "brightness-0 invert")}
      onError={() => {
        console.error("[Logo] erro ao carregar logo local");
      }}
    />
  );

  if (to) {
    return (
      <Link to={to} className={cn("flex shrink-0 items-center", className)} aria-label="Ir para a página inicial da Tradexa">
        {content}
      </Link>
    );
  }

  return <div className={cn("flex shrink-0 items-center", className)}>{content}</div>;
};

export default Logo;

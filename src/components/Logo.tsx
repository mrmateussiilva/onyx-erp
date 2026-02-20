import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showText?: boolean;
    variant?: "light" | "dark";
}

export function Logo({ className, showText = true, variant = "dark" }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <svg
                width="40"
                height="40"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                {/* Ícone Geométrico Onyx - Reprodução fiel à imagem enviada */}
                <path
                    d="M30 30 L45 25 L65 35 L70 65 L50 75 L30 65 Z"
                    fill="url(#gold-gradient)"
                />
                <path d="M30 30 L45 25 L50 50 L30 65 Z" fill="white" fillOpacity="0.15" />
                <path d="M45 25 L65 35 L50 50 Z" fill="white" fillOpacity="0.05" />
                <path d="M65 35 L70 65 L50 50 Z" fill="black" fillOpacity="0.1" />
                <path d="M70 65 L50 75 L50 50 Z" fill="black" fillOpacity="0.2" />
                <path d="M50 75 L30 65 L50 50 Z" fill="black" fillOpacity="0.15" />

                <defs>
                    <linearGradient id="gold-gradient" x1="30" y1="25" x2="70" y2="75" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#D4B96A" />
                        <stop offset="0.5" stopColor="#C6A75E" />
                        <stop offset="1" stopColor="#8E7332" />
                    </linearGradient>
                </defs>
            </svg>

            {showText && (
                <div className="flex flex-col leading-none items-start">
                    <span className={cn(
                        "text-xl font-bold tracking-[0.1em] uppercase",
                        variant === "dark" ? "text-white" : "text-foreground"
                    )}>
                        Onyx
                    </span>
                    <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase mt-0.5">
                        ERP
                    </span>
                </div>
            )}
        </div>
    );
}

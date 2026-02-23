import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function GlassPageHeader({ title, description, children, className }: {
    title: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", className)}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#3a0ca3] uppercase drop-shadow-sm">{title}</h1>
                {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </div>
            {children}
        </div>
    );
}

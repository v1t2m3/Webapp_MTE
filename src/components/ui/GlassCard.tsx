import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_32px_0_hsl(var(--primary)/0.15)]",
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
                <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-sm pb-1">{title}</h1>
                {description && <p className="text-muted-foreground mt-1 text-sm font-medium">{description}</p>}
            </div>
            {children}
        </div>
    );
}

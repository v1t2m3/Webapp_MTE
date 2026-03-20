import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary/10 text-primary neon-glow-primary",
                secondary:
                    "border-transparent bg-secondary/10 text-secondary neon-glow-accent",
                destructive:
                    "border-transparent bg-destructive/10 text-destructive neon-glow-destructive",
                outline: "text-foreground border-border",
                success: "border-transparent bg-[#10b981]/10 text-[#10b981] neon-glow-success",
                warning: "border-transparent bg-[#f59e0b]/10 text-[#f59e0b] neon-glow-warning",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }

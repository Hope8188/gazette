'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BentoCardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  gradient?: boolean
  delay?: number
  accent?: 'blue' | 'emerald' | 'purple' | 'amber'
}

export function BentoCard({ 
  children, 
  className, 
  title, 
  subtitle, 
  icon,
  size = 'md',
  gradient = false,
  delay = 0,
  accent = 'blue'
}: BentoCardProps) {
  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-1 md:col-span-2 row-span-1',
    lg: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2',
    xl: 'col-span-1 md:col-span-2 lg:col-span-4 row-span-2'
  }

  const accentStyles = {
    blue: 'from-blue-600 to-blue-700',
    emerald: 'from-emerald-600 to-emerald-700',
    purple: 'from-purple-600 to-purple-700',
    amber: 'from-amber-600 to-amber-700'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-300",
        "hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-[1.01] cursor-default",
        gradient 
          ? `bg-gradient-to-br ${accentStyles[accent]} border-transparent text-white glow-blue`
          : "bg-slate-900/60 border-slate-700/50 hover:border-slate-600/50 backdrop-blur-sm",
        sizeClasses[size],
        className
      )}
    >
      <div className="p-6 h-full flex flex-col">
        {(title || icon) && (
          <div className="flex items-start justify-between mb-4">
            <div>
              {title && (
                <h3 className={cn(
                  "text-lg font-semibold font-display",
                  gradient ? "text-white" : "text-slate-100"
                )}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={cn(
                  "text-sm mt-1",
                  gradient ? "text-white/80" : "text-slate-400"
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            {icon && (
              <div className={cn(
                "p-2.5 rounded-xl transition-colors",
                gradient ? "bg-white/20" : "bg-slate-800/80"
              )}>
                {icon}
              </div>
            )}
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

interface BentoGridProps {
  children: ReactNode
  className?: string
  columns?: 2 | 3 | 4
}

export function BentoGrid({ children, className, columns = 4 }: BentoGridProps) {
  const colClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={cn(
      "grid gap-4 auto-rows-min",
      colClasses[columns],
      className
    )}>
      {children}
    </div>
  )
}

import React from 'react'
import { motion } from 'motion/react'

interface JarvisLogoProps {
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

export function JarvisLogo({ size = 'md', animate = false }: JarvisLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  }

  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.05, rotate: 5 },
    tap: { scale: 0.95 }
  }

  const innerShapeVariants = {
    initial: { rotate: 0 },
    animate: { rotate: 360 },
    hover: { rotate: 45 }
  }

  const LogoContent = () => (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Outer hexagonal frame - blue gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg transform rotate-45">
        {/* Inner white geometric shapes */}
        <motion.div 
          className="absolute inset-1 bg-white rounded-sm flex items-center justify-center"
          variants={innerShapeVariants}
          initial="initial"
          animate={animate ? "animate" : "initial"}
          whileHover="hover"
          transition={{ duration: animate ? 8 : 0.2, repeat: animate ? Infinity : 0, ease: "linear" }}
        >
          {/* Central diamond/rhombus */}
          <div className="w-2.5 h-2.5 bg-blue-600 transform rotate-45"></div>
          
          {/* Corner accents - tiny white dots */}
          <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-blue-400 rounded-full"></div>
          <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-blue-400 rounded-full"></div>
          <div className="absolute bottom-0.5 left-0.5 w-0.5 h-0.5 bg-blue-400 rounded-full"></div>
          <div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-blue-400 rounded-full"></div>
        </motion.div>
      </div>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        variants={logoVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="cursor-pointer"
      >
        <LogoContent />
      </motion.div>
    )
  }

  return <LogoContent />
}
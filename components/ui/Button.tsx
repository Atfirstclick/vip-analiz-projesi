import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
  href?: string
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      variant = 'primary', 
      size = 'md', 
      children, 
      className = '', 
      fullWidth = false,
      disabled,
      ...props 
    }, 
    ref
  ) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    // Variant styles - GÜNCELLENDİ
    const variants = {
      primary: 'bg-vip-navy text-white hover:bg-vip-navy-light focus:ring-vip-navy shadow-lg hover:shadow-xl hover:-translate-y-0.5',
      secondary: 'bg-vip-gold text-vip-navy hover:bg-vip-gold-light focus:ring-vip-gold shadow-md hover:shadow-lg font-bold',
      outline: 'border-2 border-vip-navy text-vip-navy hover:bg-vip-navy hover:text-white focus:ring-vip-navy'
    }
    
    // Size styles
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    }
    
    const widthClass = fullWidth ? 'w-full' : ''
    
    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`
    
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
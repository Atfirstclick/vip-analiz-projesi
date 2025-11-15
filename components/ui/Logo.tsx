import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  href = '/',
  className = ''
}) => {
  const sizes = {
    sm: { width: 50, height: 50 },   // Küçültüldü
    md: { width: 60, height: 60 },   // Küçültüldü
    lg: { width: 80, height: 80 }    // Küçültüldü
  }

  const { width, height } = sizes[size]

  const logoImage = (
    <Image
      src="/images/logo.svg"
      alt="VipAnaliz"
      width={width}
      height={height}
      priority
      className={`object-contain ${className}`}  // object-contain eklendi
    />
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoImage}
      </Link>
    )
  }

  return logoImage
}

export default Logo
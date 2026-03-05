import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <div className='relative bottom-0 h-14 px-2 md:px-14  border-t w-full'
    style={{ backgroundColor: "oklch(1 0 0)",
        borderColor: "oklch(0.823 0.003 48.717)" }}>
      <div className="text-sm mt-4 flex justify-center items-center"
      style={{ color: "oklch(0.423 0.003 48.717)" }}
      >
        © {currentYear} TimeX. All rights reserved.
      </div>
    </div>
  )
}

export default Footer
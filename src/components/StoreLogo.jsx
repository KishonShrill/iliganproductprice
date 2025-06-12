// StoreLogo.jsx
import React from 'react'

const storeImages = {
  'gaisano': '/images/logos/gaisano-logo.jpg',
  '7-eleven': '/images/logos/7-eleven_logo.svg',
  'shoppe 24': '/images/logos/shoppe24-logo.webp',
  // Add more mappings as needed
}

const StoreLogo = ({ storeName, width = 80 }) => {
  if (!storeName) return null

  const lowerName = storeName.toLowerCase()
  const match = Object.keys(storeImages).find(key => lowerName.includes(key))

  if (!match) return null // or return a default icon

  return (
    <img
      className='location__image'
      src={storeImages[match]}
      alt={`${match} logo`}
    />
  )
}

export default StoreLogo

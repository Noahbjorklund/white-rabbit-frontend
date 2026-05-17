'use client'

import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void
}

function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface MapComponentProps {
  searchLocation: { lat: number; lng: number } | null
  radius: number
  onLocationSelect: (lat: number, lng: number) => void
}

export default function MapComponent({ searchLocation, radius, onLocationSelect }: MapComponentProps) {
  const defaultCenter: [number, number] = [59.3293, 18.0686] // Stockholm

  return (
    <MapContainer
      center={searchLocation || defaultCenter}
      zoom={searchLocation ? 10 : 6}
      style={{ height: '400px', width: '100%' }}
      key={searchLocation ? `${searchLocation.lat}-${searchLocation.lng}` : 'default'}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onLocationSelect={onLocationSelect} />
      
      {searchLocation && (
        <>
          <Marker position={[searchLocation.lat, searchLocation.lng]} />
          <Circle
            center={[searchLocation.lat, searchLocation.lng]}
            radius={radius * 1000} // Convert km to meters
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
          />
        </>
      )}
    </MapContainer>
  )
}

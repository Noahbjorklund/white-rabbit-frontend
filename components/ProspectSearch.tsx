'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { api, type ProspectSearchRequest, type ProspectSearchResult } from '@/lib/api'

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

export default function ProspectSearch() {
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(50) // km
  const [address, setAddress] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  
  const [filters, setFilters] = useState({
    bransch: '',
    min_omsattning_msek: undefined as number | undefined,
    max_omsattning_msek: undefined as number | undefined,
  })

  const [results, setResults] = useState<ProspectSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingProspect, setAddingProspect] = useState<string | null>(null)

  const handleGeocodeAddress = async () => {
    if (!address.trim()) return
    
    setGeocoding(true)
    setError(null)
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=se&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setSearchLocation({ lat: parseFloat(lat), lng: parseFloat(lon) })
      } else {
        setError('Kunde inte hitta adressen')
      }
    } catch (err) {
      setError('Geocoding misslyckades')
    } finally {
      setGeocoding(false)
    }
  }

  const handleSearch = async () => {
    if (!searchLocation) {
      setError('Välj en plats på kartan eller sök efter en adress')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const searchRequest: ProspectSearchRequest = {
        ...filters,
        region: `${searchLocation.lat},${searchLocation.lng},${radius}km`,
        max_results: 20,
      }
      
      const response = await api.ai.prospectSearch(searchRequest)
      setResults(response.prospects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPipeline = async (prospect: ProspectSearchResult) => {
    setAddingProspect(prospect.name)
    try {
      await api.prospects.create({
        name: prospect.name,
        industry: filters.bransch || 'unknown',
        revenue_msek: prospect.revenue_msek,
        employees: prospect.employees,
        profitability: 'unknown',
        tech_stack: [],
        website: prospect.allabolag_url || null,
      })
      alert(`${prospect.name} har lagts till i pipeline!`)
    } catch (err) {
      alert(`Kunde inte lägga till: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setAddingProspect(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Map and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Sök Prospects</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Address Search */}
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGeocodeAddress()}
                placeholder="Sök adress (t.ex. Stockholm, Göteborg...)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleGeocodeAddress}
                disabled={geocoding}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
              >
                {geocoding ? 'Söker...' : 'Sök'}
              </button>
            </div>

            {/* Map */}
            <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
              <MapComponent
                searchLocation={searchLocation}
                radius={radius}
                onLocationSelect={(lat, lng) => setSearchLocation({ lat, lng })}
              />
            </div>

            {/* Radius Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sökradie: {radius} km
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10 km</span>
                <span>50 km</span>
                <span>100 km</span>
                <span>200 km</span>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Filter</h3>
            
            {/* Bransch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bransch
              </label>
              <select
                value={filters.bransch}
                onChange={(e) => setFilters({ ...filters, bransch: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alla branscher</option>
                <option value="IT">IT</option>
                <option value="Bygg">Bygg</option>
                <option value="Logistik">Logistik</option>
                <option value="E-handel">E-handel</option>
                <option value="Bemanning">Bemanning</option>
                <option value="Fastighet">Fastighet</option>
              </select>
            </div>

            {/* Min Omsättning */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Omsättning (MSEK)
              </label>
              <input
                type="number"
                value={filters.min_omsattning_msek || ''}
                onChange={(e) => setFilters({ ...filters, min_omsattning_msek: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="t.ex. 50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Omsättning */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Omsättning (MSEK)
              </label>
              <input
                type="number"
                value={filters.max_omsattning_msek || ''}
                onChange={(e) => setFilters({ ...filters, max_omsattning_msek: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="t.ex. 300"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading || !searchLocation}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Söker...' : 'Sök Prospects'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Hittade {results.length} prospects
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((prospect, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{prospect.name}</h4>
                  {prospect.has_gasell && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      🏆 Gasell
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  {prospect.revenue_msek && (
                    <p>💰 Omsättning: {prospect.revenue_msek.toFixed(1)} MSEK</p>
                  )}
                  {prospect.employees && (
                    <p>👥 Anställda: {prospect.employees}</p>
                  )}
                  {prospect.address && (
                    <p>📍 {prospect.address}</p>
                  )}
                </div>

                <button
                  onClick={() => handleAddToPipeline(prospect)}
                  disabled={addingProspect === prospect.name}
                  className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addingProspect === prospect.name ? 'Lägger till...' : 'Lägg till i pipeline'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && !error && (
        <div className="text-center text-gray-500 py-8">
          Klicka på kartan eller sök efter en adress för att börja söka prospects.
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { api, type ProspectSearchRequest, type ProspectSearchResult } from '@/lib/api'

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

// Priority industries
const PRIORITY_INDUSTRIES = [
  'Ecommerce / Detaljhandel',
  'Logistik / Transport',
  'Bemanning / Rekrytering',
  'Bygg / Fastighet',
  'Partihandel / Distribution',
  'Vård / Omsorg administration',
  'Tillverkning / Industri',
  'B2B Tjänster',
]

const LOW_PRIORITY_INDUSTRIES = [
  'IT / Mjukvara',
  'Konsultbolag IT',
  'SaaS / Tech startup',
  'Fintech',
]

export default function ProspectSearch() {
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(55) // km
  const [address, setAddress] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [showLowPriority, setShowLowPriority] = useState(false)
  
  // Initialize with all priority industries selected
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(PRIORITY_INDUSTRIES)
  
  const [filters, setFilters] = useState({
    min_omsattning_msek: undefined as number | undefined,
    max_omsattning_msek: undefined as number | undefined,
  })

  const [results, setResults] = useState<ProspectSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingProspect, setAddingProspect] = useState<string | null>(null)

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Default to Stockholm if geolocation fails
          setSearchLocation({ lat: 59.3293, lng: 18.0686 })
        }
      )
    } else {
      // Default to Stockholm if geolocation not supported
      setSearchLocation({ lat: 59.3293, lng: 18.0686 })
    }
  }, [])

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    )
  }

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
        bransch: selectedIndustries.join(','),
        region: `${searchLocation.lat},${searchLocation.lng},${radius}km`,
        max_results: 20,
      }
      
      console.log('🔍 Prospect Search Request:', searchRequest)
      
      const response = await api.ai.prospectSearch(searchRequest)
      
      console.log('✅ Prospect Search Response:', response)
      
      setResults(response.prospects)
    } catch (err) {
      console.error('❌ Prospect Search Error:', err)
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
        industry: selectedIndustries[0] || 'unknown',
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
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Sök Prospects
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Hitta företag baserat på bransch, plats och omsättning
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Search */}
            <div className="card">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGeocodeAddress()}
                placeholder="Sök adress eller stad..."
                style={{
                  width: '100%',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
            </div>

            {/* Map */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', height: 500 }}>
              <MapComponent
                searchLocation={searchLocation}
                radius={radius}
                onLocationSelect={(lat, lng) => setSearchLocation({ lat, lng })}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="space-y-6">
            {/* Bransch Pills */}
            <div className="card">
              <h3 style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)', 
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Branscher
              </h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PRIORITY_INDUSTRIES.map((industry) => {
                  const isSelected = selectedIndustries.includes(industry)
                  return (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isSelected ? '#6D28D9' : '#1a1f2e',
                        color: isSelected ? 'white' : '#A0A8B8',
                      }}
                    >
                      {industry}
                    </button>
                  )
                })}
              </div>

              {/* Low Priority Toggle */}
              <button
                onClick={() => setShowLowPriority(!showLowPriority)}
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {showLowPriority ? '− Dölj' : '+ Visa fler'}
              </button>

              {showLowPriority && (
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 8, 
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border)',
                }}>
                  {LOW_PRIORITY_INDUSTRIES.map((industry) => {
                    const isSelected = selectedIndustries.includes(industry)
                    return (
                      <button
                        key={industry}
                        onClick={() => toggleIndustry(industry)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: isSelected ? '#6D28D9' : '#1a1f2e',
                          color: isSelected ? 'white' : '#A0A8B8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>⚠</span>
                        {industry}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Radius Slider */}
            <div className="card">
              <h3 style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)', 
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Sökradie
              </h3>
              
              <div style={{ 
                fontSize: 32, 
                fontWeight: 600, 
                color: 'var(--accent)', 
                marginBottom: 16,
                textAlign: 'center',
              }}>
                {radius} km
              </div>

              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  background: 'var(--bg)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Omsättning */}
            <div className="card">
              <h3 style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: 'var(--text-primary)', 
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Omsättning (MSEK)
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="number"
                  value={filters.min_omsattning_msek || ''}
                  onChange={(e) => setFilters({ ...filters, min_omsattning_msek: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Min"
                  style={{
                    flex: 1,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>—</span>
                <input
                  type="number"
                  value={filters.max_omsattning_msek || ''}
                  onChange={(e) => setFilters({ ...filters, max_omsattning_msek: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Max"
                  style={{
                    flex: 1,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading || !searchLocation}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 14,
                fontWeight: 600,
                background: loading ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #6D28D9 0%, #8B5CF6 100%)',
                opacity: loading || !searchLocation ? 0.5 : 1,
              }}
            >
              {loading ? 'Söker...' : `Sök prospects · ${selectedIndustries.length} branscher valda`}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card" style={{ 
            background: 'var(--error-light)', 
            borderColor: 'var(--error)',
            color: 'var(--error)',
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
              Hittade {results.length} prospects
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((prospect, index) => (
                <div key={index} className="card animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {prospect.name}
                    </h4>
                    {prospect.has_gasell && (
                      <span className="badge badge-warning">🏆 Gasell</span>
                    )}
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    {prospect.revenue_msek && (
                      <p>💰 {prospect.revenue_msek.toFixed(1)} MSEK</p>
                    )}
                    {prospect.employees && (
                      <p>👥 {prospect.employees} anställda</p>
                    )}
                    {prospect.address && (
                      <p>📍 {prospect.address}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToPipeline(prospect)}
                    disabled={addingProspect === prospect.name}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: 13 }}
                  >
                    {addingProspect === prospect.name ? 'Lägger till...' : 'Lägg till i pipeline'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && !error && searchLocation && (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: 'var(--text-muted)' }}>
              Justera dina filter och tryck på sök för att hitta prospects.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

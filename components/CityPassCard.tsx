'use client'

import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'

interface CityPassCardProps {
  holderName: string
  referenceNumber: string
  userId: string
  vettedAt?: string | null
  approvedAt?: string | null
}

function computeExpiryDate(approvedAt?: string | null): string {
  const base = approvedAt ? new Date(approvedAt) : new Date()
  const expiry = new Date(base)
  expiry.setFullYear(expiry.getFullYear() + 1)
  return expiry.toISOString()
}

export default function CityPassCard({ holderName, referenceNumber, userId, vettedAt, approvedAt }: CityPassCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  const issuedAtIso = useMemo(() => approvedAt || vettedAt || new Date().toISOString(), [approvedAt, vettedAt])
  const expiresAtIso = useMemo(() => computeExpiryDate(approvedAt), [approvedAt])

  const qrPayload = useMemo(() => ({
    type: 'city_pass',
    ref: referenceNumber,
    uid: userId,
    issued_at: issuedAtIso,
    expires_at: expiresAtIso
  }), [referenceNumber, userId, issuedAtIso, expiresAtIso])

  useEffect(() => {
    let mounted = true
    const generate = async () => {
      try {
        const data = await QRCode.toDataURL(JSON.stringify(qrPayload), { width: 256, errorCorrectionLevel: 'M' })
        if (mounted) setQrDataUrl(data)
      } catch (e) {
        console.error('QR generation failed:', e)
      }
    }
    generate()
    return () => { mounted = false }
  }, [qrPayload])

  return (
    <div className="relative bg-yellow-400 rounded-xl shadow-lg border-4 border-black w-full max-w-5xl mx-auto overflow-hidden">
      {/* PNG National Emblem as full card background */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          backgroundImage: "url('/images/png-national-emblem.png')",
          backgroundSize: '60%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          opacity: 0.10
        }}
      ></div>
      {/* Header Section with Yellow/Black Theme */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black overflow-hidden">
        
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 shadow-md border-2 border-black">
            <img 
              src="/images/ncdc-logo.jpg" 
              alt="NCDC Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-wider">CITY RESIDENT PASS</h2>
            <p className="text-sm font-medium italic">Access to Services in Port Moresby City</p>
          </div>
        </div>
        <div className="relative z-10 text-right">
          <p className="text-xs font-black uppercase tracking-wide mb-1">Reference Number</p>
          <p className="text-lg font-black bg-black text-yellow-400 px-4 py-2 rounded-lg border-2 border-white shadow-md">
            {referenceNumber}
          </p>
        </div>
      </div>

      {/* Main Content - Optimized Landscape Layout */}
      <div className="relative z-10 flex">
        {/* Left Side - Card Details */}
        <div className="flex-1 p-6 space-y-4">
          {/* Card Holder Information */}
          <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-black shadow-sm">
            <p className="text-xs font-black text-black uppercase tracking-wide mb-1">Card Holder</p>
            <p className="text-2xl font-black text-black break-words">{holderName}</p>
          </div>

          {/* Dates Grid - Yellow/Black Theme */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border-2 border-black shadow-md">
              <div className="text-center">
                <p className="text-xs font-black text-black uppercase tracking-wide">Issued</p>
                <p className="text-sm font-bold text-yellow-600 mt-1">
                  {new Date(issuedAtIso).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit'
                  })}
                </p>
                <p className="text-lg font-black text-black">
                  {new Date(issuedAtIso).getFullYear()}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border-2 border-black shadow-md">
              <div className="text-center">
                <p className="text-xs font-black text-black uppercase tracking-wide">Expires</p>
                <p className="text-sm font-bold text-yellow-600 mt-1">
                  {new Date(expiresAtIso).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit'
                  })}
                </p>
                <p className="text-lg font-black text-black">
                  {new Date(expiresAtIso).getFullYear()}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge - Yellow/Black Theme */}
          <div className="flex items-center justify-center">
            <div className="bg-black text-yellow-400 px-6 py-3 rounded-full font-black text-lg shadow-lg border-2 border-yellow-400">
              ✓ AUTHORIZED CITY RESIDENT
            </div>
          </div>
        </div>

        {/* Right Side - QR Code Section */}
        <div className="w-64 bg-yellow-50 p-4 border-l-2 border-black">
          <div className="text-center h-full flex flex-col justify-between">
            <div>
              <p className="text-xs font-black text-black uppercase tracking-wide mb-3">
                Scan for Verification
              </p>
              {qrDataUrl ? (
                <div className="bg-white p-2 rounded-lg border-2 border-black shadow-md">
                  <img 
                    src={qrDataUrl} 
                    alt="NCDC City Pass QR Code" 
                    className="w-40 h-40 mx-auto" 
                  />
                </div>
              ) : (
                <div className="w-40 h-40 mx-auto bg-white border-2 border-black rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto mb-1"></div>
                    <p className="text-xs text-black font-bold">Loading...</p>
                  </div>
                </div>
              )}
            </div>
            
            {qrDataUrl && (
              <div className="mt-3 space-y-2">
                <a
                  href={qrDataUrl}
                  download={`city-resident-pass-qr-${referenceNumber}.png`}
                  className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-black rounded-md text-yellow-400 bg-black hover:bg-gray-800 transition-all duration-200 shadow-md border-2 border-yellow-400"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M7 7h10" />
                  </svg>
                  Download QR
                </a>
                <p className="text-xs text-black font-bold text-center">Card download options available in cards page</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-3 bg-yellow-50 border-t-2 border-black">
        <p className="text-xs text-black text-center leading-relaxed font-bold">
          This digital CITY RESIDENT PASS is valid for identification and city services access. 
          Keep secure and report issues immediately to NCDC.
        </p>
      </div>
    </div>
  )
}




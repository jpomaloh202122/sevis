'use client'

import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'

interface PublicServantPassCardProps {
  holderName: string
  referenceNumber: string
  userId: string
  publicServantId: string
  department: string
  position?: string
  vettedAt?: string | null
  approvedAt?: string | null
}

function computeExpiryDate(approvedAt?: string | null): string {
  const base = approvedAt ? new Date(approvedAt) : new Date()
  const expiry = new Date(base)
  expiry.setFullYear(expiry.getFullYear() + 5) // Public Servant Pass valid for 5 years
  return expiry.toISOString()
}

export default function PublicServantPassCard({ 
  holderName, 
  referenceNumber, 
  userId, 
  publicServantId,
  department,
  position,
  vettedAt, 
  approvedAt 
}: PublicServantPassCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  const issuedAtIso = useMemo(() => approvedAt || vettedAt || new Date().toISOString(), [approvedAt, vettedAt])
  const expiresAtIso = useMemo(() => computeExpiryDate(approvedAt), [approvedAt])

  const qrPayload = useMemo(() => ({
    type: 'public_servant_pass',
    ref: referenceNumber,
    uid: userId,
    ps_id: publicServantId,
    dept: department,
    issued_at: issuedAtIso,
    expires_at: expiresAtIso
  }), [referenceNumber, userId, publicServantId, department, issuedAtIso, expiresAtIso])

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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-5xl mx-auto overflow-hidden relative">
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
      {/* Header Section */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 shadow-md border-2 border-white">
            <img 
              src="/images/dict-logo.png" 
              alt="DICT Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">Public Servant Pass</h2>
            <p className="text-sm opacity-90">Government Employee ID</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-90 mb-1">Reference Number</p>
          <p className="text-lg font-bold bg-white bg-opacity-20 px-3 py-1 rounded-md">
            {referenceNumber}
          </p>
        </div>
      </div>

      {/* Main Content - Optimized Landscape Layout */}
      <div className="relative z-10 flex">
        {/* Left Side - Card Details */}
        <div className="flex-1 p-6 space-y-4">
          {/* Employee Information */}
          <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-600">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Employee Name</p>
            <p className="text-2xl font-bold text-gray-900 break-words">{holderName}</p>
          </div>

          {/* Employment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Public Servant ID</p>
              <p className="text-lg font-bold text-orange-800 font-mono">
                {publicServantId}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Department</p>
              <p className="text-sm font-bold text-orange-800">
                {department}
              </p>
            </div>
          </div>

          {/* Position (if available) */}
          {position && (
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Position</p>
              <p className="text-lg font-bold text-orange-800">
                {position}
              </p>
            </div>
          )}

          {/* Dates Grid - Compact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
              <div className="text-center">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Issued</p>
                <p className="text-sm font-bold text-orange-800 mt-1">
                  {new Date(issuedAtIso).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
              <div className="text-center">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Expires</p>
                <p className="text-sm font-bold text-orange-800 mt-1">
                  {new Date(expiresAtIso).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <div className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-md">
              ✓ AUTHORIZED GOVERNMENT EMPLOYEE
            </div>
          </div>
        </div>

        {/* Right Side - QR Code Section */}
        <div className="w-64 bg-gray-50 p-4 border-l border-gray-200">
          <div className="text-center h-full flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Scan for Verification
              </p>
              {qrDataUrl ? (
                <div className="bg-white p-2 rounded-lg border-2 border-gray-300 shadow-sm">
                  <img 
                    src={qrDataUrl} 
                    alt="Public Servant Pass QR Code" 
                    className="w-40 h-40 mx-auto" 
                  />
                </div>
              ) : (
                <div className="w-40 h-40 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-1"></div>
                    <p className="text-xs text-gray-500">Loading...</p>
                  </div>
                </div>
              )}
            </div>
            
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`public-servant-pass-${referenceNumber}.png`}
                className="mt-3 inline-flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M7 7h10" />
                </svg>
                Download QR
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center leading-relaxed">
          This digital pass authorizes access to Papua New Guinea government systems and facilities. 
          Unauthorized use is prohibited.
        </p>
      </div>
    </div>
  )
}
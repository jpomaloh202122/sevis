'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { CameraIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface WebcamCaptureProps {
  onPhotoCapture: (photoData: string) => void
  onPhotoClear: () => void
  photoData?: string
  isRequired?: boolean
}

export default function WebcamCapture({ 
  onPhotoCapture, 
  onPhotoClear, 
  photoData, 
  isRequired = false 
}: WebcamCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please ensure camera permissions are granted.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to base64
        const photoData = canvas.toDataURL('image/jpeg', 0.8)
        onPhotoCapture(photoData)
        
        // Stop camera after capture
        stopCamera()
      }
    }
  }, [onPhotoCapture, stopCamera])

  const clearPhoto = useCallback(() => {
    onPhotoClear()
    setError(null)
  }, [onPhotoClear])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Profile Photo {isRequired && <span className="text-red-500">*</span>}
        </label>
        {photoData && (
          <button
            type="button"
            onClick={clearPhoto}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear Photo
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {photoData ? (
        // Show captured photo
        <div className="relative">
          <img
            src={photoData}
            alt="Captured profile photo"
            className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-300"
          />
          <div className="mt-2 flex space-x-2">
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red"
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Retake Photo
            </button>
            <div className="inline-flex items-center px-3 py-2 text-sm text-green-600">
              <CheckIcon className="h-4 w-4 mr-2" />
              Photo Captured
            </div>
          </div>
        </div>
      ) : (
        // Show camera interface
        <div className="space-y-4">
          {!isCameraActive ? (
            // Camera not active - show start button
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-png-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <CameraIcon className="h-4 w-4 mr-2" />
                      Start Camera
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Click to start your camera and take a profile photo
              </p>
            </div>
          ) : (
            // Camera active - show video and capture button
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-300"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-full p-2">
                    <CameraIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-png-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red"
                >
                  <CameraIcon className="h-4 w-4 mr-2" />
                  Capture Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

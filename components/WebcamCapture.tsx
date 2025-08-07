'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { CameraIcon, ArrowPathIcon, CheckIcon, XMarkIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline'

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
  const [isCapturing, setIsCapturing] = useState(false)
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

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current && !isCapturing) {
      setIsCapturing(true)
      
      try {
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
      } catch (err) {
        console.error('Error capturing photo:', err)
        setError('Failed to capture photo. Please try again.')
      } finally {
        setIsCapturing(false)
      }
    }
  }, [onPhotoCapture, stopCamera, isCapturing])

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
          <div className="relative w-full max-w-xs mx-auto">
            <img
              src={photoData}
              alt="Captured profile photo"
              className="w-full h-48 object-cover rounded-lg border border-gray-300 shadow-md"
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
              <CheckIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red transition-colors"
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Retake Photo
            </button>
          </div>
        </div>
      ) : (
        // Show camera interface
        <div className="space-y-4">
          {!isCameraActive ? (
            // Camera not active - show start button
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <CameraIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Capture Profile Photo</h3>
              <p className="text-sm text-gray-500 mb-4">
                Take a clear photo of your face for your profile
              </p>
              <button
                type="button"
                onClick={startCamera}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-png-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                    Starting Camera...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Start Camera
                  </>
                )}
              </button>
            </div>
          ) : (
            // Camera active - show video with integrated controls
            <div className="space-y-4">
              <div className="relative w-full max-w-xs mx-auto">
                {/* Video container with overlay */}
                <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Camera overlay with capture button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-30 rounded-full p-1">
                      <div className="bg-white rounded-full p-2">
                        <CameraIcon className="h-6 w-6 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Capture button overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={isCapturing}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-png-red hover:bg-red-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                    >
                      {isCapturing ? (
                        <ArrowPathIcon className="animate-spin h-5 w-5" />
                      ) : (
                        <CameraIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Stop camera button */}
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red transition-colors"
                    >
                      <StopIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">
                    Position your face in the center and click the camera button to capture
                  </p>
                </div>
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

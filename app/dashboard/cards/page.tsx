'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { applicationService } from '@/lib/database'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CityPassCard from '@/components/CityPassCard'
import PublicServantPassCard from '@/components/PublicServantPassCard'
import { 
  CreditCardIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Application {
  id: string
  reference_number: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  service_name: string
  application_data: any
  submitted_at: string
  updated_at: string
  user_id: string
}

export default function CardsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCard, setSelectedCard] = useState<Application | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent('/dashboard/cards'))
      return
    }
    fetchUserCards()
  }, [user, router])

  const fetchUserCards = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      console.log('Fetching applications for user:', user.id)
      const { data, error } = await applicationService.getUserApplications(user.id)
      
      console.log('Applications response:', { data, error })
      
      if (error) {
        console.error('Error fetching applications:', error)
        setError(`Failed to load your cards: ${error.message}`)
        return
      }

      // For debugging - temporarily show all applications, then filter for completed ones
      const allApplications = data || []
      const approvedCards = data?.filter(app => app.status === 'completed') || []
      console.log('All applications:', allApplications)
      console.log('Approved cards:', approvedCards)
      
      // Temporarily show all applications in development mode for debugging
      if (process.env.NODE_ENV === 'development' && approvedCards.length === 0 && allApplications.length > 0) {
        console.log('No completed applications found, showing all for debugging')
        setApplications(allApplications)
      } else {
        setApplications(approvedCards)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCardTypeIcon = (serviceName: string) => {
    if (serviceName?.toLowerCase().includes('city pass')) {
      return <CreditCardIcon className="h-6 w-6" />
    }
    if (serviceName?.toLowerCase().includes('public servant pass')) {
      return <CreditCardIcon className="h-6 w-6" />
    }
    return <DocumentTextIcon className="h-6 w-6" />
  }

  const getCardTypeName = (serviceName: string) => {
    if (serviceName?.toLowerCase().includes('city pass')) {
      return 'City Pass'
    }
    if (serviceName?.toLowerCase().includes('public servant pass')) {
      return 'Public Servant Pass'
    }
    return 'Digital Card'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50'
      case 'pending':
        return 'text-blue-600 bg-blue-50'
      case 'rejected':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const downloadCard = async (application: Application, format: 'png' | 'pdf' = 'png') => {
    try {
      // Import QRCode for generating QR codes
      const QRCode = (await import('qrcode')).default
      
      // Create a temporary div to render the card for download
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '1200px' // Increased width for better quality
      document.body.appendChild(tempDiv)

      // Import html2canvas and jsPDF dynamically
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = format === 'pdf' ? (await import('jspdf')).default : null
      
      // Create a React element for the card
      const cardElement = document.createElement('div')
      
      if (application.service_name.toLowerCase().includes('public servant pass')) {
        // Generate QR code for Public Servant Pass
        const qrPayload = {
          type: 'public_servant_pass',
          ref: application.reference_number,
          uid: user?.id || '',
          ps_id: application.application_data?.employmentInfo?.publicServantId || 'N/A',
          dept: application.application_data?.employmentInfo?.department || 'N/A',
          issued_at: application.submitted_at,
          expires_at: new Date(new Date(application.submitted_at).setFullYear(new Date(application.submitted_at).getFullYear() + 5)).toISOString()
        }
        
        // Generate QR code with better settings for embedding
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), { 
          width: 300, 
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 1,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        // Verify QR code was generated
        console.log('Public Servant Pass QR Code generated:', qrDataUrl ? 'Success' : 'Failed')
        if (!qrDataUrl) {
          throw new Error('Failed to generate Public Servant Pass QR code')
        }
        
        // Public Servant Pass card layout - Using same structure as working City Pass
        cardElement.innerHTML = `
          <div style="background: white; border-radius: 12px; border: 4px solid black; width: 800px; height: 500px; font-family: Arial, sans-serif; position: relative; overflow: hidden;">
            <!-- PNG National Emblem background -->
            <div style="position: absolute; inset: 0; background-image: url('/images/png-national-emblem.png'); background-size: 60%; background-repeat: no-repeat; background-position: center center; opacity: 0.10;"></div>
            <!-- Header Section -->
            <div style="position: relative; z-index: 10; background: linear-gradient(to right, #ea580c, #c2410c, #ea580c); color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
              <div style="position: relative; z-index: 10; display: flex; align-items: center; gap: 16px;">
                <div style="width: 64px; height: 64px; background: white; border-radius: 8px; padding: 8px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                  <img src="/images/dict-logo.png" style="width: 100%; height: 100%; object-fit: contain;" alt="DICT Logo" />
                </div>
                <div>
                  <h2 style="font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px;">PUBLIC SERVANT PASS</h2>
                  <p style="font-size: 14px; margin: 0; font-weight: 500; font-style: italic;">Papua New Guinea Government Employee</p>
                </div>
              </div>
              <div style="position: relative; z-index: 10; text-align: right;">
                <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; margin: 0 0 4px 0;">Reference Number</p>
                <p style="font-size: 18px; font-weight: 900; background: white; color: #ea580c; padding: 8px 16px; border-radius: 8px; margin: 0; border: 2px solid white;">${application.reference_number}</p>
              </div>
            </div>

            <!-- Main Content -->
            <div style="position: relative; z-index: 10; display: flex; height: calc(100% - 120px);">
              <!-- Left Side - Card Details -->
              <div style="flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                <!-- Card Holder -->
                <div style="background: #fff7ed; padding: 16px; border-radius: 8px; border-left: 4px solid #ea580c;">
                  <p style="font-size: 12px; font-weight: 900; text-transform: uppercase; color: #ea580c; margin: 0 0 4px 0;">Employee Name</p>
                  <p style="font-size: 24px; font-weight: 900; color: black; margin: 0; word-break: break-word;">${application.application_data?.personalInfo?.firstName || ''} ${application.application_data?.personalInfo?.lastName || ''}</p>
                </div>

                <!-- Employment Info -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div style="background: white; padding: 12px; border-radius: 8px; border: 2px solid #ea580c;">
                    <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #ea580c; margin: 0;">Public Servant ID</p>
                    <p style="font-size: 14px; font-weight: 700; color: black; margin: 4px 0 0 0; font-family: monospace;">${application.application_data?.employmentInfo?.publicServantId || 'N/A'}</p>
                  </div>
                  <div style="background: white; padding: 12px; border-radius: 8px; border: 2px solid #ea580c;">
                    <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #ea580c; margin: 0;">Department</p>
                    <p style="font-size: 12px; font-weight: 700; color: black; margin: 4px 0 0 0;">${application.application_data?.employmentInfo?.department || 'N/A'}</p>
                  </div>
                </div>

                <!-- Dates -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 2px solid black; text-align: center;">
                    <p style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: black; margin: 0 0 2px 0;">Issued</p>
                    <p style="font-size: 12px; font-weight: 700; color: #ea580c; margin: 0;">${new Date(application.submitted_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                  </div>
                  <div style="background: white; padding: 8px 12px; border-radius: 6px; border: 2px solid black; text-align: center;">
                    <p style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: black; margin: 0 0 2px 0;">Expires</p>
                    <p style="font-size: 12px; font-weight: 700; color: #ea580c; margin: 0;">${new Date(new Date(application.submitted_at).setFullYear(new Date(application.submitted_at).getFullYear() + 5)).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                  </div>
                </div>

                <!-- Status Badge -->
                <div style="display: flex; justify-content: center; margin-top: auto;">
                  <div style="background: #ea580c; color: white; padding: 12px 24px; border-radius: 20px; font-weight: 900; font-size: 16px; border: 2px solid #ea580c;">
                    ✓ AUTHORIZED GOVERNMENT EMPLOYEE
                  </div>
                </div>
              </div>

              <!-- Right Side - QR Code -->
              <div style="width: 256px; background: #fff7ed; border-left: 2px solid black; padding: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <p style="font-size: 12px; font-weight: 900; text-transform: uppercase; color: black; margin: 0 0 12px 0; text-align: center;">Scan for Verification</p>
                <div style="background: white; padding: 12px; border-radius: 8px; border: 2px solid black;">
                  <img src="${qrDataUrl}" style="width: 160px; height: 160px; display: block;" alt="QR Code" />
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="position: relative; z-index: 10; padding: 12px 24px; background: #fff7ed; border-top: 2px solid black;">
              <p style="font-size: 10px; color: black; text-align: center; margin: 0; font-weight: 700;">
                This digital PUBLIC SERVANT PASS authorizes access to Papua New Guinea government systems and facilities. Unauthorized use is prohibited.
              </p>
            </div>
          </div>
        `
      } else {
        // Generate QR code for City Pass
        const cityPassQrPayload = {
          type: 'city_pass',
          ref: application.reference_number,
          uid: user?.id || '',
          issued_at: application.submitted_at,
          expires_at: new Date(new Date(application.submitted_at).setFullYear(new Date(application.submitted_at).getFullYear() + 1)).toISOString()
        }
        
        // Generate QR code with better settings for embedding
        const cityPassQrDataUrl = await QRCode.toDataURL(JSON.stringify(cityPassQrPayload), { 
          width: 300, 
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 1,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        // Verify QR code was generated
        console.log('QR Code generated:', cityPassQrDataUrl ? 'Success' : 'Failed')
        if (!cityPassQrDataUrl) {
          throw new Error('Failed to generate QR code')
        }
        
        // City Resident Pass card layout - Simple clean design matching original
        cardElement.innerHTML = `
          <div style="background: yellow; border-radius: 12px; border: 4px solid black; width: 800px; height: 500px; font-family: Arial, sans-serif; position: relative; overflow: hidden;">
            <!-- PNG National Emblem background -->
            <div style="position: absolute; inset: 0; background-image: url('/images/png-national-emblem.png'); background-size: 60%; background-repeat: no-repeat; background-position: center center; opacity: 0.10;"></div>
            
            <!-- Header Section -->
            <div style="position: relative; z-index: 10; background: linear-gradient(to right, #f59e0b, #eab308, #f59e0b); color: black; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
              
              <div style="position: relative; z-index: 10; display: flex; align-items: center; gap: 16px;">
                <div style="width: 64px; height: 64px; background: white; border-radius: 8px; padding: 8px; border: 2px solid black; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                  <img src="/images/ncdc-logo.jpg" style="width: 100%; height: 100%; object-fit: contain;" alt="NCDC Logo" />
                </div>
                <div>
                  <h2 style="font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 2px;">CITY RESIDENT PASS</h2>
                  <p style="font-size: 14px; margin: 0; font-weight: 500; font-style: italic;">Access to Services in Port Moresby City</p>
                </div>
              </div>
              <div style="position: relative; z-index: 10; text-align: right;">
                <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; margin: 0 0 4px 0;">Reference Number</p>
                <p style="font-size: 18px; font-weight: 900; background: black; color: #f59e0b; padding: 8px 16px; border-radius: 8px; margin: 0; border: 2px solid white;">${application.reference_number}</p>
              </div>
            </div>

            <!-- Main Content -->
            <div style="position: relative; z-index: 10; display: flex; height: calc(100% - 120px);">
              <!-- Left Side - Card Details -->
              <div style="flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
                <!-- Card Holder -->
                <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid black;">
                  <p style="font-size: 12px; font-weight: 900; text-transform: uppercase; color: black; margin: 0 0 4px 0;">Card Holder</p>
                  <p style="font-size: 24px; font-weight: 900; color: black; margin: 0; word-break: break-word;">${user?.name || 'N/A'}</p>
                </div>

                <!-- Dates -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div style="background: white; padding: 12px; border-radius: 8px; border: 2px solid black; text-align: center;">
                    <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: black; margin: 0;">Issued</p>
                    <p style="font-size: 14px; font-weight: 700; color: #f59e0b; margin: 4px 0 0 0;">${new Date(application.submitted_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</p>
                    <p style="font-size: 18px; font-weight: 900; color: black; margin: 0;">${new Date(application.submitted_at).getFullYear()}</p>
                  </div>
                  <div style="background: white; padding: 12px; border-radius: 8px; border: 2px solid black; text-align: center;">
                    <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: black; margin: 0;">Expires</p>
                    <p style="font-size: 14px; font-weight: 700; color: #f59e0b; margin: 4px 0 0 0;">${new Date(new Date(application.submitted_at).setFullYear(new Date(application.submitted_at).getFullYear() + 1)).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</p>
                    <p style="font-size: 18px; font-weight: 900; color: black; margin: 0;">${new Date(new Date(application.submitted_at).setFullYear(new Date(application.submitted_at).getFullYear() + 1)).getFullYear()}</p>
                  </div>
                </div>

                <!-- Status Badge -->
                <div style="display: flex; justify-content: center; margin-top: auto;">
                  <div style="background: black; color: #f59e0b; padding: 12px 24px; border-radius: 20px; font-weight: 900; font-size: 16px; border: 2px solid #f59e0b;">
                    ✓ AUTHORIZED CITY RESIDENT
                  </div>
                </div>
              </div>

              <!-- Right Side - QR Code -->
              <div style="width: 256px; background: #fef3c7; border-left: 2px solid black; padding: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <p style="font-size: 12px; font-weight: 900; text-transform: uppercase; color: black; margin: 0 0 12px 0; text-align: center;">Scan for Verification</p>
                <div style="background: white; padding: 12px; border-radius: 8px; border: 2px solid black;">
                  <img src="${cityPassQrDataUrl}" style="width: 160px; height: 160px; display: block;" alt="QR Code" />
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="position: relative; z-index: 10; padding: 12px 24px; background: #fef3c7; border-top: 2px solid black;">
              <p style="font-size: 10px; color: black; text-align: center; margin: 0; font-weight: 700;">
                This digital CITY RESIDENT PASS is valid for identification and city services access. Keep secure and report issues immediately to NCDC.
              </p>
            </div>
          </div>
        `
      }
      
      tempDiv.appendChild(cardElement)

      // Wait for all images to load with enhanced handling
      const images = cardElement.querySelectorAll('img')
      console.log(`Found ${images.length} images to load`)
      
      const imagePromises = Array.from(images).map((img, index) => {
        return new Promise((resolve) => {
          console.log(`Loading image ${index + 1}: ${img.src.substring(0, 50)}...`)
          
          if (img.complete && img.naturalWidth > 0) {
            console.log(`Image ${index + 1} already loaded`)
            resolve(true)
          } else {
            img.onload = () => {
              console.log(`Image ${index + 1} loaded successfully`)
              resolve(true)
            }
            img.onerror = (error) => {
              console.error(`Image ${index + 1} failed to load:`, error)
              resolve(false)
            }
            // Longer timeout for QR codes
            setTimeout(() => {
              console.log(`Image ${index + 1} timed out`)
              resolve(false)
            }, 10000)
          }
        })
      })
      
      const loadResults = await Promise.all(imagePromises)
      console.log('Image loading results:', loadResults)
      
      // Extra wait time specifically for QR codes
      if (application.service_name.toLowerCase().includes('public servant pass')) {
        console.log('Adding extra wait time for Public Servant Pass QR code...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Capture the element as canvas with enhanced settings for QR codes
      console.log('Starting canvas capture...')
      const canvas = await html2canvas(cardElement, {
        scale: 3, // Higher scale for better QR code quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: application.service_name.toLowerCase().includes('public servant pass') ? '#ffffff' : '#ffff00',
        logging: true, // Enable logging for debugging
        imageTimeout: 15000, // Longer timeout
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Ensure all QR code images are properly set in the cloned document
          const clonedImages = clonedDoc.querySelectorAll('img')
          console.log(`Found ${clonedImages.length} images in cloned document`)
          clonedImages.forEach((img, index) => {
            console.log(`Cloned image ${index + 1} src:`, img.src.substring(0, 50))
          })
        }
      })
      console.log('Canvas capture completed')

      if (format === 'pdf') {
        // Create PDF
        const pdf = new jsPDF!({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        })

        const imgData = canvas.toDataURL('image/png')
        const imgWidth = 280
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
        pdf.save(`city-resident-pass-${application.reference_number}.pdf`)
      } else {
        // Convert to PNG blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `city-resident-pass-${application.reference_number}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          }
        }, 'image/png')
      }

      // Cleanup
      document.body.removeChild(tempDiv)
    } catch (error) {
      console.error('Download failed:', error)
      setError('Failed to download card. Please try again.')
    }
  }

  const deleteCard = async (application: Application) => {
    if (!user?.id) return
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${getCardTypeName(application.service_name)}? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setDeleteLoading(application.id)
      setError('')

      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete card')
      }

      // Remove the deleted application from the list
      setApplications(prev => prev.filter(app => app.id !== application.id))
      
      // Close modal if this card was being viewed
      if (selectedCard?.id === application.id) {
        setSelectedCard(null)
      }

      // Success feedback could be added here if needed
    } catch (error: any) {
      console.error('Delete card error:', error)
      setError(`Failed to delete card: ${error.message}`)
    } finally {
      setDeleteLoading(null)
    }
  }

  const deleteAllCards = async () => {
    if (!user?.id) return
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${applications.length} of your cards/applications? This action cannot be undone and will remove all your digital cards from the system.`
    )
    
    if (!confirmed) return

    try {
      setBulkDeleteLoading(true)
      setError('')

      const response = await fetch('/api/applications/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id, 
          deleteScope: 'user'
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete all cards')
      }

      // Clear all applications from the list
      setApplications([])
      
      // Close modal if any card was being viewed
      setSelectedCard(null)

      // Show success message
      const message = `Successfully deleted ${result.deletedCount} card(s)${result.errorCount > 0 ? ` (${result.errorCount} failed)` : ''}`
      alert(message)
      
    } catch (error: any) {
      console.error('Delete all cards error:', error)
      setError(`Failed to delete all cards: ${error.message}`)
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cards...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="h-8 w-8 text-png-red" />
              <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
            </div>
            {applications.length > 0 && (
              <button
                onClick={deleteAllCards}
                disabled={bulkDeleteLoading}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete all your cards/applications"
              >
                {bulkDeleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Deleting All...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete All Cards ({applications.length})
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-gray-600">View and manage your approved digital cards</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Debug:</strong> Total applications: {applications.length}
              {applications.length > 0 && (
                <>
                  <br />
                  <strong>Statuses:</strong> {applications.map(app => `${app.service_name}(${app.status})`).join(', ')}
                </>
              )}
            </p>
          </div>
        )}

        {/* Cards Grid */}
        {applications.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-png-red bg-opacity-10 rounded-lg text-png-red">
                      {getCardTypeIcon(application.service_name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getCardTypeName(application.service_name)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ref: {application.reference_number}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    <div className="flex items-center space-x-1">
                      <CheckCircleIcon className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Issued:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(application.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {application.application_data?.category?.replace('_', ' ') || 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(application.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedCard(application)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Card
                  </button>
                  <button
                    onClick={() => downloadCard(application, 'png')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    title="Download PNG"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    PNG
                  </button>
                  <button
                    onClick={() => downloadCard(application, 'pdf')}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                    title="Download PDF"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    PDF
                  </button>
                  <button
                    onClick={() => deleteCard(application)}
                    disabled={deleteLoading === application.id}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Card"
                  >
                    {deleteLoading === application.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-24 w-24 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No cards yet</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              You don't have any approved digital cards yet. Apply for services to get your cards.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/services')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700 transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Apply for Services
              </button>
            </div>
          </div>
        )}

        {/* Card Viewer Modal */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setSelectedCard(null)}
              />

              {/* Modal content */}
              <div className="inline-block align-middle bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full sm:p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getCardTypeName(selectedCard.service_name)}
                  </h3>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Card Display */}
                <div className="mb-6">
                  {selectedCard.service_name.toLowerCase().includes('public servant pass') ? (
                    /* Public Servant Pass Card */
                    <PublicServantPassCard
                      userId={user?.id || ''}
                      holderName={`${selectedCard.application_data?.personalInfo?.firstName || ''} ${selectedCard.application_data?.personalInfo?.lastName || ''}`.trim() || user?.name || 'N/A'}
                      referenceNumber={selectedCard.reference_number}
                      publicServantId={selectedCard.application_data?.employmentInfo?.publicServantId || 'N/A'}
                      department={selectedCard.application_data?.employmentInfo?.department || 'N/A'}
                      position={selectedCard.application_data?.employmentInfo?.position}
                      vettedAt={selectedCard.submitted_at}
                      approvedAt={selectedCard.updated_at}
                    />
                  ) : (
                    /* City Pass or other cards */
                    <CityPassCard
                      userId={user?.id || ''}
                      holderName={user?.name || ''}
                      referenceNumber={selectedCard.reference_number}
                      vettedAt={selectedCard.submitted_at}
                      approvedAt={selectedCard.updated_at}
                    />
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={() => deleteCard(selectedCard)}
                    disabled={deleteLoading === selectedCard.id}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading === selectedCard.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Card
                      </>
                    )}
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => downloadCard(selectedCard, 'png')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download PNG
                    </button>
                    <button
                      onClick={() => downloadCard(selectedCard, 'pdf')}
                      className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
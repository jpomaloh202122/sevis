'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  referenceNumber: string
  applicationId: string
  processingTime?: string
  nextSteps?: string[]
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  referenceNumber,
  applicationId,
  processingTime = '2-3 weeks',
  nextSteps = []
}: SuccessModalProps) {
  const defaultNextSteps = [
    'You will receive an email confirmation shortly',
    'Our team will review your documents within 5 business days',
    'You will be contacted to schedule your written and practical tests',
    'Processing typically takes 2-3 weeks from submission'
  ]

  const steps = nextSteps.length > 0 ? nextSteps : defaultNextSteps

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-png-red focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        {message}
                      </p>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-green-900 mb-2">Application Details:</h4>
                        <div className="text-sm text-green-800 space-y-1">
                          <p><strong>Reference Number:</strong> {referenceNumber}</p>
                          <p><strong>Application ID:</strong> {applicationId}</p>
                          <p><strong>Estimated Processing Time:</strong> {processingTime}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Next Steps:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {steps.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-medium">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 sm:flex sm:flex-row-reverse sm:gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex w-full justify-center rounded-md bg-png-red px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:w-auto"
                    onClick={onClose}
                  >
                    View Dashboard
                  </Link>
                  <Link
                    href={`/dashboard/applications/${applicationId}`}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Track Application
                  </Link>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
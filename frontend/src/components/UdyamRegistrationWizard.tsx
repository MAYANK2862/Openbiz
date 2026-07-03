import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schema } from '../lib/schema';
import { step1Schema, step2Schema, type FormData } from '../lib/validation';
import UdyamInputField from './UdyamInputField';
import FlowProgressBar from './FlowProgressBar';

export default function UdyamRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [wizardData, setWizardData] = useState<Partial<FormData>>({});

  const stepsCount = schema.steps.length;
  const totalSteps = stepsCount + 1; // Step 3 is Review & Submit
  const stepTitles = [...schema.steps.map(step => step.title), 'Review & Submit'];

  // Initialize theme based on preference
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Get current step details (only for input steps)
  const currentStepData = currentStep <= stepsCount ? schema.steps[currentStep - 1] : null;

  // Resolve validation schema for the active step
  const currentSchema = currentStep === 1 ? step1Schema : step2Schema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(currentSchema) as any,
    mode: 'onChange',
  });

  const watchedValues = watch();

  const handleValidateAndGenerateOtp = async () => {
    const isValid = await trigger();
    if (isValid) {
      setShowOtpInput(true);
      setOtpError('');
    }
  };

  const handleOtpSubmit = () => {
    if (otpValue === '112233') {
      setShowOtpInput(false);
      const currentValues = watch();
      setWizardData(prev => ({
        ...prev,
        aadhaar_number: currentValues.aadhaar_number,
        owner_name: currentValues.owner_name,
        declaration: currentValues.declaration,
      }));
      setOtpValue('');
      setOtpError('');
      setCurrentStep(2);
    } else {
      setOtpError('Invalid OTP. Please enter mock verification code 112233.');
    }
  };

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      const currentValues = watch();
      setWizardData(prev => ({
        ...prev,
        type_of_organisation: currentValues.type_of_organisation,
        pan_number: currentValues.pan_number,
      }));
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Call the backend API on form submission
  const onSubmit = async () => {
    setIsSubmitting(true);
    setApiError('');
    setApiSuccess(null);

    try {
      const response = await fetch('http://localhost:3001/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaar_number: wizardData.aadhaar_number,
          owner_name: wizardData.owner_name,
          declaration: wizardData.declaration,
          type_of_organisation: wizardData.type_of_organisation,
          pan_number: wizardData.pan_number || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errMsg = result.error;
        if (!errMsg && result.errors) {
          errMsg = Object.values(result.errors).join(', ');
        }
        throw new Error(errMsg || 'Failed to submit registration application.');
      }

      setApiSuccess(result.data);
    } catch (err: any) {
      setApiError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Label resolving for Organisation Type values
  const getOrgTypeLabel = (val: string) => {
    const labels: Record<string, string> = {
      '1': 'Proprietorship (Proprietary)',
      '2': 'Hindu Undivided Family (HUF)',
      '3': 'Partnership',
      '4': 'Co-Operative',
      '5': 'Private Limited Company',
      '6': 'Public Limited Company',
      '7': 'Self Help Group (SHG)',
      '9': 'Limited Liability Partnership (LLP)',
      '10': 'Society',
      '11': 'Trust',
      '8': 'Others',
    };
    return labels[val] || val || 'Not Provided';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header Widget */}
        <header className="relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-2xl p-6 mb-8 flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-3">
            <img 
              src="/indian_flag.png" 
              alt="Logo" 
              className="w-10 h-10 rounded-full object-cover border border-slate-200/50 dark:border-slate-800 shadow-sm"
            />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {schema.formTitle}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Single Window System for MSME Registration
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-blue-500 transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m3.343-5.657l-.707.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            )}
          </button>
        </header>

        {/* Progress Tracker Card */}
        <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 mb-8 transition-all duration-300">
          <FlowProgressBar 
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepTitles={stepTitles}
          />
        </section>

        {/* Two-column layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Card (Form/Success/Summary) - Left 2 Columns */}
          <main className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/85 rounded-2xl shadow-xl shadow-slate-100/40 dark:shadow-none p-6 md:p-8 transition-all duration-300">
              
              {apiSuccess ? (
                /* 4. SUCCESS VIEWS */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6 shadow-inner animate-scaleIn">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Application Registered!
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                    Your Udyam Registration entry has been successfully submitted and stored in the database.
                  </p>

                  <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800/70 rounded-2xl text-left max-w-lg mx-auto">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200/50 dark:border-slate-800 pb-2 mb-4">
                      Application Details
                    </h3>
                    <dl className="grid grid-cols-3 gap-y-3 text-sm">
                      <dt className="text-slate-400 font-medium">Record ID:</dt>
                      <dd className="col-span-2 font-mono text-slate-800 dark:text-slate-200 font-semibold">{apiSuccess.id}</dd>
                      
                      <dt className="text-slate-400 font-medium">Aadhaar:</dt>
                      <dd className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                        •••• •••• {apiSuccess.aadhaarNumber?.slice(-4)}
                      </dd>
                      
                      <dt className="text-slate-400 font-medium">Entrepreneur:</dt>
                      <dd className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">{apiSuccess.ownerName}</dd>
                      
                      <dt className="text-slate-400 font-medium">Organisation:</dt>
                      <dd className="col-span-2 font-semibold text-slate-800 dark:text-slate-200">
                        {getOrgTypeLabel(apiSuccess.typeTypeOfOrganisation || apiSuccess.typeOfOrganisation)}
                      </dd>
                      
                      {apiSuccess.panNumber && (
                        <>
                          <dt className="text-slate-400 font-medium">PAN Number:</dt>
                          <dd className="col-span-2 font-semibold text-slate-800 dark:text-slate-200 font-mono uppercase">
                            {apiSuccess.panNumber}
                          </dd>
                        </>
                      )}

                      <dt className="text-slate-400 font-medium">Submitted At:</dt>
                      <dd className="col-span-2 text-slate-600 dark:text-slate-300">
                        {new Date(apiSuccess.createdAt).toLocaleString()}
                      </dd>
                    </dl>
                  </div>

                  <button
                    onClick={() => {
                      setApiSuccess(null);
                      setCurrentStep(1);
                      window.location.reload();
                    }}
                    className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 font-semibold"
                  >
                    Register Another Business
                  </button>
                </div>
              ) : (
                /* FORM FLOW VIEWS */
                <form onSubmit={handleSubmit(onSubmit)}>
                  
                  {/* API Submission Error Alert */}
                  {apiError && (
                    <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-600 dark:text-rose-450 text-sm flex gap-3">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      <div>
                        <span className="font-bold">Submission Failed:</span> {apiError}
                      </div>
                    </div>
                  )}

                  {currentStep <= stepsCount && currentStepData ? (
                    /* 1. INPUT STEPS (Step 1 & 2) */
                    <div>
                      <div className="mb-6">
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                          Step {currentStep} of {totalSteps}
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                          {currentStepData.title}
                        </h2>
                      </div>

                      <div className="space-y-6">
                        {currentStepData.fields.map((field, index) => {
                          // Skip rendering conditional fields if conditions are unmet
                          if (field.required === 'conditional' && field.requiredWhen) {
                            const { field: dep, notEquals } = field.requiredWhen;
                            const depVal = (watchedValues as any)[dep];
                            if (depVal === notEquals) return null;
                          }

                          return (
                            <UdyamInputField
                              key={field.id}
                              field={field}
                              register={register}
                              errors={errors}
                              fieldNumber={index + 1}
                            />
                          );
                        })}
                      </div>

                      {/* Mock OTP Drawer - step 1 */}
                      {showOtpInput && currentStep === 1 && (
                        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50/50 to-sky-50/50 dark:from-slate-900/60 dark:to-slate-850/60 border border-blue-100 dark:border-slate-800 rounded-2xl animate-fadeIn">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                                Enter verification code
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                A mock OTP verification is required. Please use code <strong className="text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">112233</strong>.
                              </p>
                              <div className="mt-4 flex gap-3 max-w-sm">
                                <input
                                  type="text"
                                  id="otp"
                                  value={otpValue}
                                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                  maxLength={6}
                                  placeholder="Enter 6-digit OTP"
                                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                                />
                                <button
                                  type="button"
                                  onClick={handleOtpSubmit}
                                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-semibold transition-colors duration-150"
                                >
                                  Verify
                                </button>
                              </div>
                              {otpError && (
                                <p className="mt-2 text-sm text-red-500" role="alert">
                                  {otpError}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 2. STEP 3: REVIEW & SUMMARY */
                    <div className="animate-fadeIn">
                      <div className="mb-6">
                        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                          Step 3 of {totalSteps}
                        </span>
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                          Review Your Details
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Please verify your entries before submitting the application.
                        </p>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-6">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-55 dark:bg-slate-850 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                              <th className="px-5 py-3 font-semibold">Field</th>
                              <th className="px-5 py-3 font-semibold">Entered Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                            <tr>
                              <td className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-450">Aadhaar Number</td>
                              <td className="px-5 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {wizardData.aadhaar_number}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-450">Entrepreneur Name</td>
                              <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                {wizardData.owner_name}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-450">Organisation Type</td>
                              <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                {getOrgTypeLabel(wizardData.type_of_organisation || '')}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-450">PAN Number</td>
                              <td className="px-5 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200 uppercase">
                                {wizardData.pan_number || <span className="text-slate-400 italic font-normal">Exempt (Proprietorship)</span>}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-5 py-4 font-semibold text-slate-500 dark:text-slate-450">Aadhaar Consent</td>
                              <td className="px-5 py-4 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Provided
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 text-sm flex gap-3 mb-4">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 00-1 1v-4a1 1 0 10-2 0v4a1 1 0 001 1h2z" clipRule="evenodd"/>
                        </svg>
                        <div>
                          <span className="font-bold">Final Submission Notice:</span> Submitting this form creates a permanent record in the database. If this Aadhaar has already been registered, the database will return a registration conflict error.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION CONTROLS */}
                  <div className="mt-8 flex justify-end items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={isSubmitting || showOtpInput}
                        className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl shadow-sm transition-colors duration-150 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                    )}

                    {currentStep === 1 ? (
                      <button
                        type="button"
                        onClick={handleValidateAndGenerateOtp}
                        disabled={showOtpInput}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white rounded-xl shadow-md font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-default"
                      >
                        {showOtpInput ? 'Verifying OTP...' : currentStepData?.submitButton?.label || 'Validate & Generate OTP'}
                      </button>
                    ) : currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white rounded-xl shadow-md font-semibold transition-all duration-200"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="px-7 py-3 bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-1 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          'Submit Registration'
                        )}
                      </button>
                    )}
                  </div>

                </form>
              )}

            </div>
          </main>

          {/* Info Sidebar Widget - Right 1 Column */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* Contextual instruction card */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-slate-800 rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                <svg className="w-5.5 h-5.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Submission Guide
              </h3>
              
              <ul className="space-y-3.5 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <span><strong>Aadhaar Verification</strong>: Must be linked to a mobile number to receive the validation OTP code (112233).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <span><strong>Organisation Type</strong>: Select how your business is registered. Proprietorships are exempt from PAN requirements.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <span><strong>PAN Verification</strong>: Required for all non-Proprietorship entities. Format must match: LUFF2862Y.</span>
                </li>
              </ul>
            </div>

            {/* General Udyam Notes card */}
            {currentStepData?.notes && currentStepData.notes.length > 0 && (
              <div className="bg-amber-500/5 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Step Advisory
                </h3>
                <ul className="space-y-2 text-sm text-slate-650 dark:text-slate-400">
                  {currentStepData.notes.map((note, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-amber-500 dark:text-amber-600 mt-1">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Footer info */}
        <footer className="mt-16 text-center border-t border-slate-200 dark:border-slate-900 pt-8 pb-12 text-xs text-slate-450 dark:text-slate-500">
          <p>© 2026 Ministry of Micro, Small & Medium Enterprises (MoMSME), Government of India.</p>
          <p className="mt-1">Developed for Udyam Registration compliance certification assessment.</p>
        </footer>
      </div>
    </div>
  );
}

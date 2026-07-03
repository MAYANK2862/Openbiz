interface FlowProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function FlowProgressBar({ currentStep, totalSteps, stepTitles }: FlowProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-8">
      {/* Visual step indicators */}
      <div className="relative flex justify-between items-center mb-4">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full z-0" />
        
        {/* Active progress indicator line */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-sky-500 -translate-y-1/2 rounded-full transition-all duration-500 ease-out z-0"
          style={{ width: `${progressPercentage}%` }}
        />

        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/30'
                    : isActive
                    ? 'bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-600 dark:text-blue-400 shadow-md scale-110'
                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  step
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-2 px-1">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={index} className="flex-1 text-center">
              <span 
                className={`text-xs md:text-sm transition-all duration-300 block ${
                  isCurrent 
                    ? 'font-bold text-blue-600 dark:text-blue-400' 
                    : isCompleted 
                    ? 'text-slate-500 dark:text-slate-400 font-medium'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

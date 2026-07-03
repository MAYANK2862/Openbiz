import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { FormField as FormFieldType } from '../lib/schema';

interface UdyamInputFieldProps {
  field: FormFieldType;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  fieldNumber?: number;
}

export default function UdyamInputField({ field, register, errors, fieldNumber }: UdyamInputFieldProps) {
  const error = errors[field.id];
  const errorMessage = error?.message as string;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <div className="relative">
            <input
              type="text"
              id={field.id}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className={`w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                error
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800/30'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30'
              }`}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.id}-error` : undefined}
              {...register(field.id)}
            />
          </div>
        );

      case 'select':
        let options: { value: string; label: string }[] = [];
        if (field.id === 'type_of_organisation') {
          options = [
            { value: '', label: 'Select organisation type' },
            { value: '1', label: 'Proprietorship (Proprietary)' },
            { value: '2', label: 'Hindu Undivided Family (HUF)' },
            { value: '3', label: 'Partnership' },
            { value: '4', label: 'Co-Operative' },
            { value: '5', label: 'Private Limited Company' },
            { value: '6', label: 'Public Limited Company' },
            { value: '7', label: 'Self Help Group (SHG)' },
            { value: '9', label: 'Limited Liability Partnership (LLP)' },
            { value: '10', label: 'Society' },
            { value: '11', label: 'Trust' },
            { value: '8', label: 'Others' }
          ];
        } else if (typeof field.options === 'string') {
          options = field.options.split(',').map((opt, index) => ({
            value: String(index),
            label: opt.trim()
          }));
        }

        return (
          <div className="relative">
            <select
              id={field.id}
              className={`w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                error
                  ? 'border-red-400 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-800/30'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-900/30'
              }`}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.id}-error` : undefined}
              {...register(field.id)}
            >
              {options.map((option, index) => (
                <option key={index} value={option.value} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-start gap-3.5 p-4 bg-slate-50/30 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/50 rounded-xl hover:bg-slate-50/55 dark:hover:bg-slate-900/30 transition-all duration-200">
            <input
              type="checkbox"
              id={field.id}
              className="w-5 h-5 mt-0.5 border-slate-300 dark:border-slate-600 rounded text-indigo-600 focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-800/30 cursor-pointer accent-indigo-600"
              aria-invalid={!!error}
              {...register(field.id)}
            />
            <label htmlFor={field.id} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium cursor-pointer select-none">
              {field.label} {field.required === true && <span className="text-rose-500 font-bold">*</span>}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-6">
      {field.type !== 'checkbox' && (
        <label htmlFor={field.id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {fieldNumber && `${fieldNumber}. `}{field.label}
          {field.required === true && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>
      )}

      {renderField()}

      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-2 animate-fadeIn" id={`${field.id}-error`} role="alert">
          <svg className="w-4.5 h-4.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{errorMessage}</span>
        </p>
      )}
    </div>
  );
}

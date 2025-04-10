// src/app/loading.tsx

export default function Loading() {
  // This UI will be displayed automatically via Suspense
  // while the sibling page.tsx is loading.
  return (
    // Full-screen container to center the spinner
    // Using the same gradient as the body for consistency during load
    <div className='fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900'>
      {/* Simple Tailwind CSS Spinner */}
      <div
        className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent'
        role='status'
        aria-label='loading' // Accessibility label
      >
        {/* Hidden text for screen readers */}
        <span className='sr-only'>Loading...</span>
      </div>
    </div>
  );
}

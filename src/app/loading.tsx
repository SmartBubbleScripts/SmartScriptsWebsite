export default function Loading() {
  return (
    <div className='fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900'>
      <div
        className='h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent'
        role='status'
        aria-label='loading'
      >
        <span className='sr-only'>Loading...</span>
      </div>
    </div>
  );
}

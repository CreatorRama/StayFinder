export default function LoadingSpinner({ fullPage = false, className = '' }) {
  const spinner = (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-700 bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
import { RefreshCw } from 'lucide-react';

// Shown when the API can't be reached, so an outage never looks like "no cars".
export default function ServerError({ onRetry }) {
  return (
    <div className="text-center py-20">
      <p className="text-lg font-semibold text-gray-700 mb-2">We couldn't load the cars</p>
      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
        The server may be waking up (this can take up to a minute on the free plan) or is temporarily
        unavailable. Please try again shortly.
      </p>
      <button onClick={onRetry} className="btn-primary inline-flex items-center gap-2">
        <RefreshCw className="w-4 h-4" /> Try again
      </button>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="xp-window max-w-lg w-full">
        {/* Title Bar */}
        <div className="xp-window-title">
          <span>Habit Tracker — Error 404</span>
          <div className="xp-window-controls">
            <span className="xp-window-minimize">_</span>
            <span className="xp-window-maximize">&#9633;</span>
            <span className="xp-window-close">X</span>
          </div>
        </div>

        <div className="xp-window-body text-center space-y-4">
          {/* Error illustration */}
          <div className="flex justify-center gap-3 my-4">
            <span className="badge-88x31 bg-xp-blue-500 text-white text-[8px]">ERROR 404</span>
            <span className="badge-88x31 bg-retro-magenta text-white">NOT FOUND</span>
          </div>

          <div className="w-16 h-16 bg-xp-silver border-2 border-black shadow-xp-sunken flex items-center justify-center mx-auto">
            <span className="text-3xl font-bold text-red-600 font-heading">!</span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-black font-heading mb-1">Page not found</h1>
            <p className="text-sm text-gray-600">
              The page you were looking for could not be found.
              It may have been moved, deleted, or the link might be incorrect.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Link href="/dashboard" className="btn-xp-primary">
              Go to Dashboard
            </Link>
            <Link href="/" className="btn-xp">
              Back to Login
            </Link>
          </div>

          <div className="text-[10px] text-gray-400 pt-1">
            Error 404 — File not found
          </div>
        </div>

        {/* Status bar */}
        <div className="border-t border-black bg-xp-silver-300 px-2 py-0.5 text-[10px] text-gray-600 flex items-center justify-between shadow-xp-sunken">
          <span>The page you requested does not exist</span>
          <span>Error 404</span>
        </div>
      </div>
    </div>
  );
}

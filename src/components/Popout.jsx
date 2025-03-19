const Popout = ({ isOpen, onClose, children }) => {
      if (!isOpen) {
        return null;
      }

      return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 relative w-full max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={onClose}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l18 12"
                />
              </svg>
            </button>
            {children}
          </div>
        </div>
      );
    };

    export default Popout;

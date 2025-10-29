// src/components/Session/VideoCallErrorBoundary.jsx
import React from 'react';

class VideoCallErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Video call error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold">Video Call Error</h2>
            <p className="text-gray-400">Please try refreshing the page</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Refresh Call
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default VideoCallErrorBoundary;
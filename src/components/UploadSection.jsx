import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

const UploadSection = ({ loading, onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    // Check if file is HTML
    const validTypes = ['text/html', 'text/htm', 'application/xhtml+xml'];
    const validExtensions = ['.html', '.htm'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setError('Please upload an HTML file only (.html or .htm)');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleFile = (file) => {
    if (!file) return;
    
    if (validateFile(file)) {
      setSelectedFile(file);
      // Create a synthetic event to pass to the parent component
      const syntheticEvent = {
        target: {
          files: [file]
        }
      };
      onFileUpload(syntheticEvent);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    
    if (files.length > 1) {
      setError('Please upload only one file at a time');
      return;
    }
    
    if (files.length === 1) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError('');
  };

  return (
    <div 
      className={`relative bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-xl p-12 border-2 overflow-hidden transition-all duration-300 ${
        isDragging 
          ? 'border-emerald-400 bg-opacity-90 scale-105' 
          : 'border-cyan-400'
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Animated corner accents */}
      <div className={`absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 transition-colors duration-300 ${
        isDragging ? 'border-emerald-400' : 'border-cyan-400'
      } animate-pulse`}></div>
      <div className={`absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 transition-colors duration-300 ${
        isDragging ? 'border-cyan-400' : 'border-emerald-400'
      } animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
      <div className={`absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 transition-colors duration-300 ${
        isDragging ? 'border-cyan-400' : 'border-emerald-400'
      } animate-pulse`} style={{ animationDelay: '1s' }}></div>
      <div className={`absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 transition-colors duration-300 ${
        isDragging ? 'border-emerald-400' : 'border-cyan-400'
      } animate-pulse`} style={{ animationDelay: '1.5s' }}></div>
      
      {/* Rotating border animation */}
      <div className={`absolute inset-0 rounded-lg animate-spin-slow opacity-30 transition-opacity ${
        isDragging ? 'opacity-50' : ''
      }`}>
        <div className={`absolute inset-0 rounded-lg border-4 border-transparent transition-colors ${
          isDragging 
            ? 'border-t-emerald-400 border-r-cyan-400' 
            : 'border-t-cyan-400 border-r-emerald-400'
        }`}></div>
      </div>
      
      {/* Glowing orbs */}
      <div className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all duration-300 ${
        isDragging ? 'bg-emerald-400 scale-125' : 'bg-cyan-400'
      } animate-float`}></div>
      <div className={`absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all duration-300 ${
        isDragging ? 'bg-cyan-400 scale-125' : 'bg-emerald-400'
      } animate-float-delayed`}></div>
      
      <div className="relative z-10 max-w-xl mx-auto text-center">
        {/* Upload Icon */}
        <div className="relative inline-block mb-4">
          {isDragging ? (
            <FileText className="w-16 h-16 mx-auto text-emerald-400 animate-bounce" />
          ) : (
            <Upload className="w-16 h-16 mx-auto text-cyan-400 animate-bounce" />
          )}
          <div className={`absolute inset-0 blur-xl opacity-50 animate-pulse ${
            isDragging ? 'bg-emerald-400' : 'bg-cyan-400'
          }`}></div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          {isDragging ? 'Drop Your File Here' : 'Upload Log File'}
        </h2>
        <p className="text-gray-400 mb-2 text-lg">
          {isDragging 
            ? 'Release to upload' 
            : 'Drag and drop your HTML file here or click to browse'
          }
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Accepts: <span className="text-cyan-400 font-semibold">.html</span> or <span className="text-cyan-400 font-semibold">.htm</span> files only
        </p>
        
        {/* Selected File Display */}
        {selectedFile && !loading && (
          <div className="mb-6 bg-gray-700 rounded-lg p-4 flex items-center justify-between border border-emerald-400">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span className="text-white text-sm">{selectedFile.name}</span>
              <span className="text-gray-400 text-xs">
                ({(selectedFile.size / 1024).toFixed(2)} KB)
              </span>
            </div>
            <button
              onClick={clearFile}
              className="text-red-400 hover:text-red-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {/* Upload Button */}
        {!loading && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".html,.htm,text/html"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold py-4 px-12 rounded-lg transition duration-200 transform group-hover:scale-105">
                Choose File
              </div>
            </div>
          </label>
        )}
        
        {/* Loading Animation */}
        {loading && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-cyan-400 font-semibold">Processing your log file...</p>
            <div className="w-64 mx-auto bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;

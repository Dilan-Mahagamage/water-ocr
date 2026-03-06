'use client';

import { useState } from 'react';
import { Upload, FileText, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { CSV_HEADERS } from '@/lib/gemini-config';

interface ProcessedResult {
  filename: string;
  csv: string;
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResults([]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setResults([]);

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process images');
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCSV = (result: ProcessedResult) => {
    const blob = new Blob([CSV_HEADERS + '\n' + result.csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename.replace(/\.[^/.]+$/, "") + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-4">
            Industrial Log Digitizer
          </h1>
          <p className="text-gray-400 text-lg">
            Convert handwritten water quality logs into structured CSV data using Gemini AI.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="bg-[#161618] border border-white/10 rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl py-12 bg-white/[0.02] transition-colors hover:bg-white/[0.04] group">
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-blue-400 w-8 h-8" />
              </div>
              <span className="text-xl font-medium mb-2">
                {files.length > 0 ? `Selected ${files.length} images` : 'Drop images here or click to upload'}
              </span>
              <span className="text-gray-500 text-sm">
                Supports JPG, PNG, WEBP
              </span>
            </label>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isProcessing}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3
                \${files.length === 0 || isProcessing 
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95'}
              `}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-6 h-6" />
                  Convert to CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-green-400 w-7 h-7" />
              Proccessed Results
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-[#1c1c1e] border border-white/5 rounded-xl p-5 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                      <FileText className="text-gray-400 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors uppercase tracking-wider text-sm">
                        {result.filename}
                      </h3>
                      <p className="text-gray-500 text-xs">Extraction complete • 43 columns</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadCSV(result)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-blue-600 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all group-hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

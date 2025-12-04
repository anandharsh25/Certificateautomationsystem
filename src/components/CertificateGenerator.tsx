import { useState, useRef } from 'react';
import { ArrowLeft, Upload, Download, Send } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { CertificatePreview } from './CertificatePreview';

interface CertificateGeneratorProps {
  eventId: string;
  user: any;
  onBack: () => void;
}

interface Participant {
  name: string;
  email: string;
}

export function CertificateGenerator({ eventId, user, onBack }: CertificateGeneratorProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header if exists
        const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
        
        const parsed: Participant[] = [];
        for (let i = startIndex; i < lines.length; i++) {
          const [name, email] = lines[i].split(',').map(s => s.trim());
          if (name && email) {
            parsed.push({ name, email });
          }
        }

        if (parsed.length === 0) {
          setError('No valid participants found in CSV');
          return;
        }

        setParticipants(parsed);
        setSuccess(`${parsed.length} participants loaded successfully`);
      } catch (err) {
        setError('Failed to parse CSV file. Please ensure format is: Name, Email');
      }
    };

    reader.readAsText(file);
  };

  const handleGenerateAndSend = async () => {
    if (participants.length === 0) {
      setError('Please upload a participant list first');
      return;
    }

    setError('');
    setSuccess('');
    setGenerating(true);
    setProgress(0);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81a513d4/generate-certificates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            eventId,
            participants,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate certificates');
      }

      setProgress(100);
      setSuccess(`Successfully generated and sent ${data.generated} certificates!`);
      
      // Wait a moment then go back
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err: any) {
      console.error('Error generating certificates:', err);
      setError(err.message || 'Failed to generate certificates');
    } finally {
      setGenerating(false);
    }
  };

  const downloadSampleCSV = () => {
    const sample = 'Name,Email\nJohn Doe,john@example.com\nJane Smith,jane@example.com\nMike Johnson,mike@example.com';
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_participants.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <header className="glass-header border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-200 hover:bg-white/10 rounded-lg px-3 py-2 mb-4 transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-gray-100 drop-shadow-lg">Generate Certificates</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-6">
            <div className="glass-card rounded-xl shadow-xl p-6">
              <h2 className="text-gray-100 mb-4 drop-shadow-lg">Upload Participant List</h2>
              
              <p className="text-gray-300 mb-4 drop-shadow">
                Upload a CSV file with participant names and emails. Format: Name, Email
              </p>

              <button
                onClick={downloadSampleCSV}
                className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 mb-4 drop-shadow"
              >
                <Download className="w-4 h-4" />
                Download Sample CSV
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/20 rounded-lg p-6 hover:border-white/40 hover:bg-white/5 transition-all backdrop-blur-sm"
              >
                <Upload className="w-6 h-6 text-gray-300" />
                <span className="text-gray-300 drop-shadow">Click to upload CSV file</span>
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg text-green-200">
                  {success}
                </div>
              )}

              {participants.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-gray-100 mb-3 drop-shadow-lg">
                    Loaded Participants ({participants.length})
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {participants.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white/10 backdrop-blur-sm rounded">
                        <span className="text-gray-100 drop-shadow">{p.name}</span>
                        <span className="text-gray-300 drop-shadow">{p.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl shadow-xl p-6">
              <h2 className="text-gray-100 mb-4 drop-shadow-lg">Generate & Send</h2>
              
              <p className="text-gray-300 mb-6 drop-shadow">
                Certificates will be automatically generated with QR codes and sent to all participants via email.
              </p>

              {generating && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 drop-shadow">Generating certificates...</span>
                    <span className="text-gray-100 drop-shadow-lg">{progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-2">
                    <div
                      className="bg-indigo-400/60 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateAndSend}
                disabled={participants.length === 0 || generating}
                className="w-full flex items-center justify-center gap-2 glass-button text-gray-100 px-6 py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
                {generating ? 'Generating...' : 'Generate & Send Certificates'}
              </button>

              <p className="text-gray-300 mt-3 text-center drop-shadow">
                This will send certificates to {participants.length} participants
              </p>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div>
            <CertificatePreview
              participantName={participants[0]?.name || "John Doe"}
              eventName="Sample Event"
              eventDate={new Date().toISOString()}
              organizer="EventEye"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
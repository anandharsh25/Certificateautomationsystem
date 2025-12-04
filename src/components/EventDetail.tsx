import { useState, useEffect } from 'react';
import { ArrowLeft, Award, Mail, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EventDetailProps {
  event: any;
  user: any;
  onBack: () => void;
}

export function EventDetail({ event, user, onBack }: EventDetailProps) {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    delivered: 0,
    pending: 0,
    bounced: 0,
    total: 0,
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81a513d4/certificates/${event.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      const data = await response.json();
      setCertificates(data.certificates || []);
      
      // Calculate stats
      const delivered = data.certificates.filter((c: any) => c.status === 'delivered').length;
      const pending = data.certificates.filter((c: any) => c.status === 'pending').length;
      const bounced = data.certificates.filter((c: any) => c.status === 'bounced').length;
      
      setStats({
        delivered,
        pending,
        bounced,
        total: data.certificates.length,
      });
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'bounced':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'bounced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
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
          <div>
            <h1 className="text-gray-100 mb-2 drop-shadow-lg">{event.name}</h1>
            <p className="text-gray-300 drop-shadow">{event.description}</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-gray-300" />
              <p className="text-gray-300 drop-shadow">Total</p>
            </div>
            <p className="text-gray-100 drop-shadow-lg">{stats.total}</p>
          </div>

          <div className="glass-card rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <p className="text-gray-300 drop-shadow">Delivered</p>
            </div>
            <p className="text-gray-100 drop-shadow-lg">{stats.delivered}</p>
          </div>

          <div className="glass-card rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-300" />
              <p className="text-gray-300 drop-shadow">Pending</p>
            </div>
            <p className="text-gray-100 drop-shadow-lg">{stats.pending}</p>
          </div>

          <div className="glass-card rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-300" />
              <p className="text-gray-300 drop-shadow">Bounced</p>
            </div>
            <p className="text-gray-100 drop-shadow-lg">{stats.bounced}</p>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="glass-card rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-gray-100 drop-shadow-lg">Certificate Delivery Status</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-300 drop-shadow">Loading certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-100 mb-2 drop-shadow-lg">No certificates generated yet</h3>
              <p className="text-gray-300 drop-shadow">Go back and generate certificates for this event</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 backdrop-blur-sm border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-300 drop-shadow">Participant</th>
                    <th className="px-6 py-3 text-left text-gray-300 drop-shadow">Email</th>
                    <th className="px-6 py-3 text-left text-gray-300 drop-shadow">Status</th>
                    <th className="px-6 py-3 text-left text-gray-300 drop-shadow">Generated At</th>
                    <th className="px-6 py-3 text-left text-gray-300 drop-shadow">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-gray-100 drop-shadow">{cert.participantName}</td>
                      <td className="px-6 py-4 text-gray-300 drop-shadow">{cert.participantEmail}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(cert.status)}
                          <span className={`px-2 py-1 rounded text-sm backdrop-blur-sm ${getStatusColor(cert.status)}`}>
                            {cert.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 drop-shadow">
                        {new Date(cert.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {cert.certificateUrl && (
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 drop-shadow"
                          >
                            <Download className="w-4 h-4" />
                            View
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
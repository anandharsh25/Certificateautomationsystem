import { useState, useEffect } from 'react';
import { Award, LogOut, Plus, Calendar, Users, Mail } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { CreateEventModal } from './CreateEventModal';

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onEventSelect: (event: any) => void;
  onGenerateCertificates: (eventId: string) => void;
}

export function Dashboard({ user, onLogout, onEventSelect, onGenerateCertificates }: DashboardProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalCertificates: 0,
    totalDelivered: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81a513d4/events`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
      setStats(data.stats || stats);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81a513d4/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      setShowCreateModal(false);
      fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="glass-header border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 glass-card rounded-lg flex items-center justify-center shadow-lg">
                <Award className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-gray-100 drop-shadow-lg">EventEye</h1>
                <p className="text-gray-300 drop-shadow">Certificate Automation</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-200 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <p className="text-gray-300 drop-shadow">Total Events</p>
                <p className="text-gray-100 drop-shadow-lg">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-300" />
              </div>
              <div>
                <p className="text-gray-300 drop-shadow">Certificates Generated</p>
                <p className="text-gray-100 drop-shadow-lg">{stats.totalCertificates}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/30 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <p className="text-gray-300 drop-shadow">Delivered</p>
                <p className="text-gray-100 drop-shadow-lg">{stats.totalDelivered}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-100 drop-shadow-lg">Your Events</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 glass-button text-gray-100 px-4 py-2 rounded-lg shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-200 drop-shadow">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card rounded-xl shadow-xl p-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-100 mb-2 drop-shadow-lg">No events yet</h3>
            <p className="text-gray-300 mb-6 drop-shadow">Create your first event to start generating certificates</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="glass-button text-gray-100 px-6 py-2 rounded-lg shadow-lg transition-all"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="glass-card rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => onEventSelect(event)}
              >
                <div className="mb-4">
                  <h3 className="text-gray-100 mb-2 drop-shadow-lg">{event.name}</h3>
                  <p className="text-gray-300 drop-shadow">{event.description}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-300 drop-shadow">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 drop-shadow">
                    <Users className="w-4 h-4" />
                    <span>{event.certificateCount || 0} certificates</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateCertificates(event.id);
                    }}
                    className="flex-1 glass-button text-gray-100 px-4 py-2 rounded-lg transition-all"
                  >
                    Generate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventSelect(event);
                    }}
                    className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-100 px-4 py-2 rounded-lg hover:bg-white/15 transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateEvent}
        />
      )}
    </div>
  );
}
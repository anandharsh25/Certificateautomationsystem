import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateEventModalProps {
  onClose: () => void;
  onCreate: (eventData: any) => Promise<void>;
}

export function CreateEventModal({ onClose, onCreate }: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [eventType, setEventType] = useState<'paid' | 'free'>('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onCreate({
        name,
        description,
        date,
        organizer,
        eventType,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-gray-100 drop-shadow-lg">Create New Event</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-gray-200 mb-2 drop-shadow">
              Event Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 glass-input rounded-lg focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 text-gray-100 placeholder-gray-400"
              placeholder="Web Development Workshop"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-200 mb-2 drop-shadow">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 glass-input rounded-lg focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 resize-none text-gray-100 placeholder-gray-400"
              placeholder="A comprehensive workshop on modern web development..."
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-gray-200 mb-2 drop-shadow">
              Event Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 glass-input rounded-lg focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="organizer" className="block text-gray-200 mb-2 drop-shadow">
              Organizer Name
            </label>
            <input
              id="organizer"
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              required
              className="w-full px-4 py-2 glass-input rounded-lg focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 text-gray-100 placeholder-gray-400"
              placeholder="Tech Academy"
            />
          </div>

          <div>
            <label className="block text-gray-200 mb-2 drop-shadow">Event Type</label>
            <div className="flex gap-4">
              <label className="flex items-center text-gray-300">
                <input
                  type="radio"
                  value="free"
                  checked={eventType === 'free'}
                  onChange={(e) => setEventType('free')}
                  className="mr-2"
                />
                Free
              </label>
              <label className="flex items-center text-gray-300">
                <input
                  type="radio"
                  value="paid"
                  checked={eventType === 'paid'}
                  onChange={(e) => setEventType('paid')}
                  className="mr-2"
                />
                Paid
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-100 px-4 py-2 rounded-lg hover:bg-white/15 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 glass-button text-gray-100 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
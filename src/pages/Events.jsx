import { useEffect, useState } from 'react';
import api from '../api';

export default function Events({ onOpen }) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    api.get('/events').then((r) => setEvents(r.data));
  }, []);

  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-green-700">
          Daftar Event Voting
        </h2>
        <div className="grid gap-4">
          {events.map((ev) => {
            const isActive =
              new Date(ev.startTime) <= now && new Date(ev.endTime) >= now;
            return (
              <div
                key={ev.id}
                className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold">{ev.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(ev.startTime).toLocaleString()} -{' '}
                    {new Date(ev.endTime).toLocaleString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isActive ? 'Sedang Berlangsung' : 'Tidak Aktif'}
                  </span>
                </div>
                <button
                  onClick={() => onOpen(ev.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Buka
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

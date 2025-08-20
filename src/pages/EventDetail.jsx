import { useEffect, useRef, useState } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function EventDetail({ eventId }) {
  const [event, setEvent] = useState(null);
  const [results, setResults] = useState([]);
  const [insight, setInsight] = useState(null);
  const [voted, setVoted] = useState(false);
  const videoRef = useRef(null);

  // ambil detail event
  useEffect(() => {
    api.get(`/events/${eventId}`).then((r) => setEvent(r.data));
  }, [eventId]);

  // realtime hasil vote
  useEffect(() => {
    const es = new EventSource(
      `http://localhost:4000/realtime/subscribe/${eventId}`
    );
    es.addEventListener('update', async () => {
      const { data } = await api.get(`/vote/${eventId}/results`);
      setResults(data);
    });
    (async () => {
      const { data } = await api.get(`/vote/${eventId}/results`);
      setResults(data);
    })();
    return () => es.close();
  }, [eventId]);

  // buka kamera
  async function openCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Kamera error:', err);
      alert('Tidak bisa akses kamera.');
    }
  }

  // vote
  async function vote(candidateId) {
    try {
      if (!videoRef.current || !videoRef.current.srcObject) {
        alert('Buka kamera dulu sebelum vote!');
        return;
      }
      const stream = videoRef.current.srcObject;

      // capture selfie
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 320;
      canvas.height = videoRef.current.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.9)
      );

      if (!blob) {
        alert('Selfie gagal, coba lagi.');
        return;
      }

      const formData = new FormData();
      formData.append('candidateId', candidateId);

      // GPS
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      formData.append('gpsLat', pos.coords.latitude);
      formData.append('gpsLng', pos.coords.longitude);
      formData.append('selfie', blob, 'selfie.jpg');

      // kirim ke backend
      await api.post(`/vote/${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // stop kamera setelah selfie
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;

      alert('Vote berhasil!');
      setVoted(true);
    } catch (err) {
      console.error('Vote error:', err.response?.data || err.message);
      alert('Vote gagal! ' + (err.response?.data?.error || err.message));
    }
  }

  // ambil insight dari backend
  async function loadInsight() {
    const { data } = await api.get(`/insight/${eventId}/insight`);
    setInsight(data.insight);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kandidat */}
        <div className="bg-white shadow rounded-xl p-4 lg:col-span-1">
          <h3 className="text-xl font-bold mb-4 text-green-700">
            {event?.title}
          </h3>
          <div className="space-y-4">
            {event?.candidates?.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
              >
                <span className="font-medium">{c.name}</span>
                <button
                  disabled={voted}
                  onClick={() => vote(c.id)}
                  className={`px-3 py-1 rounded-lg ${
                    voted
                      ? 'bg-gray-400'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } transition`}
                >
                  Pilih
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <video
              ref={videoRef}
              width="320"
              height="240"
              className="rounded-lg border"
            />
            <button
              onClick={openCam}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Buka Kamera
            </button>
          </div>
        </div>

        {/* Hasil Voting */}
        <div className="bg-white shadow rounded-xl p-4 lg:col-span-1">
          <h3 className="text-xl font-bold mb-4 text-green-700">
            Hasil Sementara
          </h3>
          <PieChart width={350} height={300}>
            <Pie
              data={results}
              dataKey="votes"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {results.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    ['#16a34a', '#2563eb', '#dc2626', '#9333ea', '#f59e0b'][
                      i % 5
                    ]
                  }
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <ul className="mt-4 space-y-1 text-gray-700">
            {results.map((r) => (
              <li key={r.candidateId}>
                {r.name}: <b>{r.votes}</b>
              </li>
            ))}
          </ul>
        </div>

        {/* Insight */}
        <div className="bg-white shadow rounded-xl p-4 lg:col-span-1 flex flex-col">
          <h3 className="text-xl font-bold mb-4 text-purple-700">
            AI Insight 🔮
          </h3>
          <button
            onClick={loadInsight}
            className="mb-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Generate Insight
          </button>
          {insight ? (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 whitespace-pre-line text-gray-800">
              {insight}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Klik tombol di atas untuk melihat insight AI.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

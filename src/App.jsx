import { useState } from 'react';
import Login from './pages/Login';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';

export default function App() {
  const [session, setSession] = useState(null);
  const [eventId, setEventId] = useState(null);

  if (!session) return <Login onLogin={setSession} />;
  if (!eventId) return <Events onOpen={setEventId} />;
  return <EventDetail eventId={eventId} />;
}

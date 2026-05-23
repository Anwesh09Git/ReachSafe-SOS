import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  
  // CRITICAL NEW STATE: Tracks which screen the user is looking at
  const [isRegistering, setIsRegistering] = useState(false);

  // Live GPS Tracking Parameters
  const [isSosActive, setIsSosActive] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [trackingId, setTrackingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('System Standby');

  // SECURE SEPARATED AUTH ENGINE
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        // ROUTE A: Explicit Registration Route
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        alert("Account created successfully!");
      } else {
        // ROUTE B: Explicit Login Route (Throws error if wrong password or user doesn't exist)
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      }
    } catch (authError) {
      // Clear out confusing technical codes for the user
      if (authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (authError.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Try logging in.');
      } else if (authError.code === 'auth/weak-password') {
        setError('Password security failure: Must be at least 6 characters.');
      } else {
        setError(authError.message.replace("Firebase: ", ""));
      }
    }
  };

  const handleSignOut = async () => {
    stopTracking();
    await signOut(auth);
    setUser(null);
    setEmail('');
    setPassword('');
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Error: GPS hardware missing.');
      return;
    }

    setIsSosActive(true);
    setStatusMessage('Locking onto satellite telemetry...');

    const sendTelemetryToBackend = async (lat, lng) => {
      try {
        await fetch('http://localhost:5000/api/sos/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            lat: lat,
            lng: lng,
            timestamp: new Date().toISOString()
          })
        });
      } catch (err) {
        console.error("Backend transmission sync error:", err);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setStatusMessage('SOS Active: Streaming live coordinates...');
        sendTelemetryToBackend(latitude, longitude);
      },
      (err) => { setStatusMessage(`GPS Error: ${err.message}`); },
      { enableHighAccuracy: true }
    );

    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          sendTelemetryToBackend(latitude, longitude);
        },
        (err) => console.log(err),
        { enableHighAccuracy: true }
      );
    }, 4000);

    setTrackingId(interval);
  };

  const stopTracking = () => {
    if (trackingId) { clearInterval(trackingId); setTrackingId(null); }
    setIsSosActive(false);
    setLocation({ lat: null, lng: null });
    setStatusMessage('System Standby');
  };

  // MAIN DASHBOARD VIEW
  if (user) {
    return (
      <div className="min-h-screen text-white p-6 font-sans flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
            <div>
              <h1 className="text-2xl font-black text-emerald-400 tracking-tight">ReachSafe</h1>
              <p className="text-xs text-slate-400">Node: {user.email}</p>
            </div>
            <button onClick={handleSignOut} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2 px-4 rounded-lg transition">
              Sign Out
            </button>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col justify-between shadow-xl min-h-[360px]">
              <div className="text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isSosActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-700 text-slate-400'
                }`}>
                  {statusMessage}
                </span>
              </div>
              <div className="flex justify-center my-4">
                {!isSosActive ? (
                  <button onClick={startTracking} className="w-44 h-44 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xl font-black tracking-wider shadow-2xl transition-all transform hover:scale-105 active:scale-95 border-8 border-rose-900/50 flex items-center justify-center">
                    TRIGGER SOS
                  </button>
                ) : (
                  <button onClick={stopTracking} className="w-44 h-44 rounded-full bg-slate-900 text-rose-400 text-lg font-bold tracking-wide shadow-inner border-4 border-rose-500 flex items-center justify-center animate-pulse">
                    CANCEL SOS
                  </button>
                )}
              </div>
              <p className="text-center text-xs text-slate-400 max-w-sm mx-auto">Triggering system locks local hardware coordinates into cloud arrays instantly.</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-700 pb-2">Live Telemetry</h3>
                <div className="space-y-4 font-mono text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs uppercase">Latitude</span>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-emerald-400 font-bold mt-1">
                      {location.lat ? location.lat.toFixed(6) : "---.------"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase">Longitude</span>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-emerald-400 font-bold mt-1">
                      {location.lng ? location.lng.toFixed(6) : "---.------"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SEPARATED AUTHENTICATION GATEWAY VIEW
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 text-white">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-400">ReachSafe</h1>
          {/* Changes subtitle text dynamically */}
          <p className="text-slate-400 mt-2 text-sm">
            {isRegistering ? 'Create Your Safety Node Profile' : 'Personal Safety Interface Gateport'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button Text alters dynamically based on the active route state */}
          <button
            type="submit"
            className={`w-full text-slate-900 font-bold py-3 px-4 rounded-lg transition ${
              isRegistering ? 'bg-amber-400 hover:bg-amber-500' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isRegistering ? 'Register New Account' : 'Sign In'}
          </button>
        </form>

        {/* FOOTER SWITCH TRIGGER ROUTE */}
        <div className="mt-6 pt-6 border-t border-slate-700/50 text-center text-sm">
          {isRegistering ? (
            <p className="text-slate-400">
              Already have an account?{' '}
              <button 
                onClick={() => { setIsRegistering(false); setError(''); }} 
                className="text-emerald-400 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                Sign In here
              </button>
            </p>
          ) : (
            <p className="text-slate-400">
              New to ReachSafe?{' '}
              <button 
                onClick={() => { setIsRegistering(true); setError(''); }} 
                className="text-amber-400 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                Create an account
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
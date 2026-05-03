import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // Basic reverse geocoding or city detection based on bounds (Karnataka/Mysuru)
        // For a real app, we'd use a service. Here we'll simulate or use a specific marker.
        let city = 'Detecting...';
        
        // Mysore approx: Lat 12.29, Long 76.63
        if (Math.abs(latitude - 12.29) < 0.2 && Math.abs(longitude - 76.63) < 0.2) {
          city = 'Mysuru, Karnataka';
        } else if (Math.abs(latitude - 12.97) < 0.2 && Math.abs(longitude - 77.59) < 0.2) {
          city = 'Bengaluru, Karnataka';
        } else if (latitude >= 11 && latitude <= 19 && longitude >= 74 && longitude <= 79) {
          city = 'Karnataka, India';
        } else {
          city = 'Outside Karnataka';
        }

        setLocation({
          latitude,
          longitude,
          address: 'Current Location',
          city
        });
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location, error };
}

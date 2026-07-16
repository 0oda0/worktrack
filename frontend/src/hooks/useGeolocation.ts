import { useState } from 'react';

interface Coords {
  latitude: number;
  longitude: number;
}

export const useGeolocated = () => {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getPosition = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Геолокация не поддерживается');
        resolve();
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          resolve();
        },
        (err) => {
          setError(err.message);
          resolve();
        }
      );
    });
  };

  return { coords, error, getPosition };
};
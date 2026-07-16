import { useState } from 'react';
import { useGeolocated } from '../hooks/useGeolocation';
import { useDispatch } from 'react-redux';
import { checkIn, checkOut } from '../api/attendanceApi';

const CheckInPage = () => {
  const { coords, getPosition } = useGeolocated();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    await getPosition();
    if (!coords) return alert('Не удалось определить местоположение');
    setLoading(true);
    try {
      await checkIn(coords.latitude, coords.longitude);
      alert('Отмечено');
    } catch (e) {
      alert('Ошибка');
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    await getPosition();
    if (!coords) return alert('Не удалось определить местоположение');
    setLoading(true);
    try {
      await checkOut(coords.latitude, coords.longitude);
      alert('Уход отмечен');
    } catch (e) {
      alert('Ошибка');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Отметка</h1>
      <button onClick={handleCheckIn} disabled={loading}>Пришёл</button>
      <button onClick={handleCheckOut} disabled={loading}>Ушёл</button>
    </div>
  );
};

export default CheckInPage;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, addRequest, approveRequestById, rejectRequestById } from '../store/slices/requestSlice';
import { RootState } from '../store';
import { useAuth } from '../hooks/useAuth';

const Requests = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state: RootState) => state.requests);
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ date: '', checkIn: '', checkOut: '', comment: '' });

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addRequest({ ...formData, location: { lat: 0, lng: 0 } }));
    setShowForm(false);
    setFormData({ date: '', checkIn: '', checkOut: '', comment: '' });
  };

  return (
    <div>
      <h1>Запросы</h1>
      <button onClick={() => setShowForm(!showForm)}>Создать запрос</button>
      {showForm && (
        <form onSubmit={handleSubmit}>
          <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          <input type="time" value={formData.checkIn} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} required />
          <input type="time" value={formData.checkOut} onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })} required />
          <input type="text" placeholder="Комментарий" value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} />
          <button type="submit">Отправить</button>
        </form>
      )}
      {loading ? <p>Загрузка...</p> : (
        <table>
          <thead><tr><th>Дата</th><th>Приход</th><th>Уход</th><th>Статус</th><th>Действия</th></tr></thead>
          <tbody>
            {list.map((req: any) => (
              <tr key={req.id}>
                <td>{req.date}</td>
                <td>{req.checkIn}</td>
                <td>{req.checkOut}</td>
                <td>{req.status}</td>
                <td>
                  {req.status === 'pending' && (user?.role === 'admin' || user?.role === 'leader') && (
                    <>
                      <button onClick={() => dispatch(approveRequestById(req.id))}>Утвердить</button>
                      <button onClick={() => dispatch(rejectRequestById(req.id))}>Отклонить</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Requests;
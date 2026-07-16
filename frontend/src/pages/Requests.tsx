import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, createRequest, approveRequest, rejectRequest, selectRequests } from '../store/slices/requestSlice';
import { useAuth } from '../hooks/useAuth';

const Requests: React.FC = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(selectRequests);
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ date: '', checkIn: '', checkOut: '', comment: '' });

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleApprove = (id: number) => {
    dispatch(approveRequest(id));
  };

  const handleReject = (id: number) => {
    dispatch(rejectRequest(id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // здесь нужно преобразовать время в ISO и отправить
    const payload = {
      ...formData,
      checkIn: new Date(`${formData.date}T${formData.checkIn}`).toISOString(),
      checkOut: new Date(`${formData.date}T${formData.checkOut}`).toISOString(),
      location: { lat: 0, lng: 0 }, // пока заглушка
    };
    dispatch(createRequest(payload));
    setModalVisible(false);
    setFormData({ date: '', checkIn: '', checkOut: '', comment: '' });
  };

  return (
    <div>
      <h1>Запросы на корректировку</h1>
      <button onClick={() => setModalVisible(true)}>Создать запрос</button>
      {modalVisible && (
        <div style={{ border: '1px solid #ccc', padding: 20 }}>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Дата: <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></label>
            </div>
            <div>
              <label>Время прихода: <input type="time" value={formData.checkIn} onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })} required /></label>
            </div>
            <div>
              <label>Время ухода: <input type="time" value={formData.checkOut} onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })} required /></label>
            </div>
            <div>
              <label>Комментарий: <textarea value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} /></label>
            </div>
            <button type="submit">Отправить</button>
            <button type="button" onClick={() => setModalVisible(false)}>Отмена</button>
          </form>
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Приход</th>
            <th>Уход</th>
            <th>Комментарий</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {list.map((req: any) => (
            <tr key={req.id}>
              <td>{req.date}</td>
              <td>{new Date(req.checkIn).toLocaleTimeString()}</td>
              <td>{new Date(req.checkOut).toLocaleTimeString()}</td>
              <td>{req.comment}</td>
              <td>{req.status}</td>
              <td>
                {req.status === 'pending' && (user?.role === 'admin' || user?.role === 'leader') && (
                  <>
                    <button onClick={() => handleApprove(req.id)}>Утвердить</button>
                    <button onClick={() => handleReject(req.id)}>Отклонить</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Requests;
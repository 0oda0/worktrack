import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRating } from '../store/slices/ratingSlice';
import { RootState } from '../store';
import { exportExcel, exportPDF } from '../api/exportApi';

const Reports = () => {
  const dispatch = useDispatch();
  const { rating, loading } = useSelector((state: RootState) => state.rating);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    dispatch(fetchRating({ start, end }));
  }, [start, end, dispatch]);

  return (
    <div>
      <h1>Отчёты и рейтинг</h1>
      <div>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button onClick={() => exportExcel({ start, end })}>Экспорт Excel</button>
        <button onClick={() => exportPDF({ start, end })}>Экспорт PDF</button>
      </div>
      {loading ? <p>Загрузка...</p> : (
        <table>
          <thead><tr><th>ФИО</th><th>Аудитория</th><th>Часы</th><th>Переработка</th><th>Опоздания</th><th>Рейтинг</th></tr></thead>
          <tbody>
            {rating.map((r: any) => (
              <tr key={r.userId}>
                <td>{r.fullName}</td>
                <td>{r.audience}</td>
                <td>{r.totalHours}</td>
                <td>{r.overtimes}</td>
                <td>{r.lateness}</td>
                <td>{r.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Reports;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRating, selectRating } from '../store/slices/ratingSlice';
import { exportExcel, exportPDF } from '../api/exportApi';

const Reports: React.FC = () => {
  const dispatch = useDispatch();
  const { rating } = useSelector(selectRating);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    dispatch(fetchRating({ start, end }));
  }, [start, end, dispatch]);

  const handleExportExcel = () => {
    exportExcel({ start, end });
  };

  const handleExportPDF = () => {
    exportPDF({ start, end });
  };

  return (
    <div>
      <h1>Отчёты и рейтинг</h1>
      <div>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button onClick={handleExportExcel}>Экспорт Excel</button>
        <button onClick={handleExportPDF}>Экспорт PDF</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Аудитория</th>
            <th>Всего часов</th>
            <th>Переработка</th>
            <th>Опоздания</th>
            <th>Утверждённые запросы</th>
            <th>Рейтинг</th>
          </tr>
        </thead>
        <tbody>
          {rating.map((item: any) => (
            <tr key={item.userId}>
              <td>{item.fullName}</td>
              <td>{item.audience}</td>
              <td>{item.totalHours}</td>
              <td>{item.overtimes}</td>
              <td>{item.lateness}</td>
              <td>{item.approvedRequests}</td>
              <td>{item.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
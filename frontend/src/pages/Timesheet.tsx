import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimesheet, selectTimesheet } from '../store/slices/attendanceSlice';
import dayjs from 'dayjs';

const Timesheet: React.FC = () => {
  const dispatch = useDispatch();
  const { stats, days, loading } = useSelector(selectTimesheet);
  const [start, setStart] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [end, setEnd] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    dispatch(fetchTimesheet({ start, end }));
  }, [start, end, dispatch]);

  return (
    <div>
      <h1>Мой табель</h1>
      <div>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button onClick={() => dispatch(fetchTimesheet({ start, end }))}>Обновить</button>
      </div>
      <div>
        <h3>Сводка за период</h3>
        <p>Всего часов: {stats.totalHours || 0}</p>
        <p>Рабочие часы (норма): {stats.workHours || 0}</p>
        <p>Оплачиваемые часы: {stats.paidHours || 0}</p>
        <p>Переработка: {stats.overtime || 0}</p>
        <p>Часы в выходные: {stats.weekendHours || 0}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Приход</th>
            <th>Уход</th>
            <th>Часы</th>
            <th>Выходной</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day: any) => (
            <tr key={day.date}>
              <td>{day.date}</td>
              <td>{day.checkIn ? new Date(day.checkIn).toLocaleTimeString() : '-'}</td>
              <td>{day.checkOut ? new Date(day.checkOut).toLocaleTimeString() : '-'}</td>
              <td>{day.duration}</td>
              <td>{day.isWeekend ? 'Да' : 'Нет'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Timesheet;
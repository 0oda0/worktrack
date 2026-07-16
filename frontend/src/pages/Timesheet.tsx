import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimesheetData } from '../store/slices/attendanceSlice';
import { RootState } from '../store';
import dayjs from 'dayjs';

const Timesheet = () => {
  const dispatch = useDispatch();
  const { stats, days, loading } = useSelector((state: RootState) => state.attendance);
  const [start, setStart] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [end, setEnd] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    dispatch(fetchTimesheetData({ start, end }));
  }, [start, end, dispatch]);

  return (
    <div>
      <h1>Мой табель</h1>
      <div>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      {loading ? <p>Загрузка...</p> : (
        <>
          <div>
            <p>Всего часов: {stats.totalHours}</p>
            <p>Рабочие часы (норма): {stats.workHours}</p>
            <p>Оплачиваемые часы: {stats.paidHours}</p>
            <p>Переработка: {stats.overtime}</p>
            <p>Часы в выходные: {stats.weekendHours}</p>
          </div>
          <table>
            <thead>
              <tr><th>Дата</th><th>Приход</th><th>Уход</th><th>Часы</th><th>Выходной</th></tr>
            </thead>
            <tbody>
              {days.map((day: any) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{day.checkIn}</td>
                  <td>{day.checkOut}</td>
                  <td>{day.duration}</td>
                  <td>{day.isWeekend ? 'Да' : 'Нет'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Timesheet;
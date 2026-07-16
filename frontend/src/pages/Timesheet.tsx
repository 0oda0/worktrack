import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimesheet, selectTimesheet } from '../store/slices/attendanceSlice';
import { Table, DatePicker, Button, Space } from '../components/common';
import dayjs from 'dayjs'; // или использовать встроенный Date

const Timesheet: React.FC = () => {
  const dispatch = useDispatch();
  const { stats, days } = useSelector(selectTimesheet);
  const [start, setStart] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [end, setEnd] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    dispatch(fetchTimesheet({ start, end }));
  }, [start, end, dispatch]);

  const columns = [
    { title: 'Дата', dataIndex: 'date', key: 'date' },
    { title: 'Приход', dataIndex: 'checkIn', key: 'checkIn' },
    { title: 'Уход', dataIndex: 'checkOut', key: 'checkOut' },
    { title: 'Часы', dataIndex: 'duration', key: 'duration' },
    { title: 'Выходной', dataIndex: 'isWeekend', key: 'isWeekend', render: (v: boolean) => v ? 'Да' : 'Нет' },
  ];

  return (
    <div>
      <h1>Мой табель</h1>
      <Space>
        <DatePicker value={start} onChange={(d) => setStart(d)} />
        <DatePicker value={end} onChange={(d) => setEnd(d)} />
        <Button onClick={() => { /* повторный запрос */ }}>Обновить</Button>
      </Space>
      <div style={{ marginTop: 20 }}>
        <h3>Сводка за период</h3>
        <p>Всего часов: {stats.totalHours}</p>
        <p>Рабочие часы (норма): {stats.workHours}</p>
        <p>Оплачиваемые часы: {stats.paidHours}</p>
        <p>Переработка: {stats.overtime}</p>
        <p>Часы в выходные: {stats.weekendHours}</p>
      </div>
      <Table columns={columns} dataSource={days} rowKey="date" />
    </div>
  );
};

export default Timesheet;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRating, selectRating } from '../store/slices/ratingSlice';
import { Table, Button, Space, DatePicker } from '../components/common';
import { exportExcel, exportPDF } from '../api/exportApi';

const Reports: React.FC = () => {
  const dispatch = useDispatch();
  const { rating } = useSelector(selectRating);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    dispatch(fetchRating({ start, end }));
  }, [start, end, dispatch]);

  const columns = [
    { title: 'ФИО', dataIndex: 'fullName' },
    { title: 'Аудитория', dataIndex: 'audience' },
    { title: 'Всего часов', dataIndex: 'totalHours' },
    { title: 'Переработка', dataIndex: 'overtimes' },
    { title: 'Опоздания', dataIndex: 'lateness' },
    { title: 'Утверждённые запросы', dataIndex: 'approvedRequests' },
    { title: 'Рейтинг', dataIndex: 'score' },
  ];

  const handleExportExcel = () => {
    exportExcel({ start, end });
  };

  const handleExportPDF = () => {
    exportPDF({ start, end });
  };

  return (
    <div>
      <h1>Отчёты и рейтинг</h1>
      <Space>
        <DatePicker onChange={(d) => setStart(d)} />
        <DatePicker onChange={(d) => setEnd(d)} />
        <Button onClick={handleExportExcel}>Экспорт Excel</Button>
        <Button onClick={handleExportPDF}>Экспорт PDF</Button>
      </Space>
      <Table columns={columns} dataSource={rating} rowKey="userId" />
    </div>
  );
};

export default Reports;
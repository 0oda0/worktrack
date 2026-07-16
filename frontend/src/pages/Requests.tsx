import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRequests, approveRequest, rejectRequest, selectRequests } from '../store/slices/requestSlice';
import { Table, Button, Modal, Form, Input, DatePicker, TimePicker } from '../components/common';
import { useAuth } from '../hooks/useAuth';

const Requests: React.FC = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(selectRequests);
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleApprove = (id: number) => {
    dispatch(approveRequest(id));
  };

  const handleReject = (id: number) => {
    dispatch(rejectRequest(id));
  };

  const handleCreate = (values: any) => {
    // отправка запроса на создание (API POST /requests)
    dispatch(createRequest(values));
    setModalVisible(false);
  };

  const columns = [
    { title: 'Дата', dataIndex: 'date' },
    { title: 'Приход', dataIndex: 'checkIn' },
    { title: 'Уход', dataIndex: 'checkOut' },
    { title: 'Комментарий', dataIndex: 'comment' },
    { title: 'Статус', dataIndex: 'status' },
    {
      title: 'Действия',
      render: (record: any) => (
        <>
          {record.status === 'pending' && (user?.role === 'admin' || user?.role === 'leader') && (
            <>
              <Button onClick={() => handleApprove(record.id)}>Утвердить</Button>
              <Button onClick={() => handleReject(record.id)}>Отклонить</Button>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Запросы на корректировку</h1>
      <Button onClick={() => setModalVisible(true)}>Создать запрос</Button>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />

      <Modal visible={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form form={form} onFinish={handleCreate}>
          <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="checkIn" label="Время прихода" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" />
          </Form.Item>
          <Form.Item name="checkOut" label="Время ухода" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" />
          </Form.Item>
          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea />
          </Form.Item>
          <Button type="primary" htmlType="submit">Отправить</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Requests;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/slices/userSlice';
import { fetchHolidays, createHoliday, updateHoliday, deleteHoliday } from '../store/slices/holidaySlice';
import { Table, Tabs, Button, Modal, Form, Input, Select, DatePicker } from '../components/common';

const AdminPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state: any) => state.users);
  const { holidays } = useSelector((state: any) => state.holidays);
  const [userModal, setUserModal] = useState(false);
  const [holidayModal, setHolidayModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [userForm] = Form.useForm();
  const [holidayForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchHolidays());
  }, [dispatch]);

  const handleUserSubmit = (values: any) => {
    if (editingUser) {
      dispatch(updateUser({ id: editingUser.id, ...values }));
    } else {
      dispatch(createUser(values));
    }
    setUserModal(false);
    setEditingUser(null);
    userForm.resetFields();
  };

  const handleHolidaySubmit = (values: any) => {
    if (editingHoliday) {
      dispatch(updateHoliday({ id: editingHoliday.id, ...values }));
    } else {
      dispatch(createHoliday(values));
    }
    setHolidayModal(false);
    setEditingHoliday(null);
    holidayForm.resetFields();
  };

  const userColumns = [
    { title: 'ФИО', dataIndex: 'fullName' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Роль', dataIndex: 'role' },
    { title: 'Аудитория', dataIndex: 'audience' },
    { title: 'Дата трудоустройства', dataIndex: 'hireDate' },
    {
      title: 'Действия',
      render: (record: any) => (
        <>
          <Button onClick={() => { setEditingUser(record); userForm.setFieldsValue(record); setUserModal(true); }}>Редактировать</Button>
          <Button onClick={() => dispatch(deleteUser(record.id))}>Удалить</Button>
        </>
      ),
    },
  ];

  const holidayColumns = [
    { title: 'Дата', dataIndex: 'date' },
    { title: 'Название', dataIndex: 'name' },
    {
      title: 'Действия',
      render: (record: any) => (
        <>
          <Button onClick={() => { setEditingHoliday(record); holidayForm.setFieldsValue(record); setHolidayModal(true); }}>Редактировать</Button>
          <Button onClick={() => dispatch(deleteHoliday(record.id))}>Удалить</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Панель администратора</h1>
      <Tabs>
        <Tabs.TabPane tab="Пользователи" key="users">
          <Button onClick={() => { setEditingUser(null); userForm.resetFields(); setUserModal(true); }}>Добавить пользователя</Button>
          <Table columns={userColumns} dataSource={users} rowKey="id" />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Праздники" key="holidays">
          <Button onClick={() => { setEditingHoliday(null); holidayForm.resetFields(); setHolidayModal(true); }}>Добавить праздник</Button>
          <Table columns={holidayColumns} dataSource={holidays} rowKey="id" />
        </Tabs.TabPane>
      </Tabs>

      <Modal visible={userModal} onCancel={() => setUserModal(false)} footer={null}>
        <Form form={userForm} onFinish={handleUserSubmit}>
          <Form.Item name="fullName" label="ФИО" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: !editingUser }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Роль" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="worker">Работник</Select.Option>
              <Select.Option value="leader">Старший состав</Select.Option>
              <Select.Option value="admin">Администратор</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="audience" label="Аудитория">
            <Select>
              <Select.Option value="203">203</Select.Option>
              <Select.Option value="903">903</Select.Option>
              <Select.Option value="906">906</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="hireDate" label="Дата трудоустройства" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Button type="primary" htmlType="submit">Сохранить</Button>
        </Form>
      </Modal>

      <Modal visible={holidayModal} onCancel={() => setHolidayModal(false)} footer={null}>
        <Form form={holidayForm} onFinish={handleHolidaySubmit}>
          <Form.Item name="date" label="Дата" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">Сохранить</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPanel;
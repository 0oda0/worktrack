import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, editUser, removeUser } from '../store/slices/userSlice';
import { fetchHolidays, addHoliday, editHoliday, removeHoliday } from '../store/slices/holidaySlice';
import { RootState } from '../store';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state: RootState) => state.users);
  const { holidays } = useSelector((state: RootState) => state.holidays);
  const [userForm, setUserForm] = useState({ fullName: '', email: '', password: '', role: 'worker', audience: '', hireDate: '' });
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '' });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingHolidayId, setEditingHolidayId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchHolidays());
  }, [dispatch]);

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      dispatch(editUser({ id: editingUserId, data: userForm }));
    } else {
      dispatch(addUser(userForm));
    }
    setUserForm({ fullName: '', email: '', password: '', role: 'worker', audience: '', hireDate: '' });
    setEditingUserId(null);
  };

  const handleHolidaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHolidayId) {
      dispatch(editHoliday({ id: editingHolidayId, data: holidayForm }));
    } else {
      dispatch(addHoliday(holidayForm));
    }
    setHolidayForm({ date: '', name: '' });
    setEditingHolidayId(null);
  };

  return (
    <div>
      <h1>Админ-панель</h1>
      <h2>Пользователи</h2>
      <form onSubmit={handleUserSubmit}>
        <input placeholder="ФИО" value={userForm.fullName} onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })} required />
        <input placeholder="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
        <input placeholder="Пароль" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required={!editingUserId} />
        <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
          <option value="worker">Работник</option>
          <option value="leader">Старший</option>
          <option value="admin">Админ</option>
        </select>
        <select value={userForm.audience} onChange={(e) => setUserForm({ ...userForm, audience: e.target.value })}>
          <option value="">Нет</option>
          <option value="203">203</option>
          <option value="903">903</option>
          <option value="906">906</option>
        </select>
        <input type="date" value={userForm.hireDate} onChange={(e) => setUserForm({ ...userForm, hireDate: e.target.value })} required />
        <button type="submit">{editingUserId ? 'Обновить' : 'Добавить'}</button>
      </form>
      <ul>
        {users.map((u: any) => (
          <li key={u.id}>
            {u.fullName} ({u.email}) - {u.role}
            <button onClick={() => { setEditingUserId(u.id); setUserForm(u); }}>Редактировать</button>
            <button onClick={() => dispatch(removeUser(u.id))}>Удалить</button>
          </li>
        ))}
      </ul>

      <h2>Праздники</h2>
      <form onSubmit={handleHolidaySubmit}>
        <input type="date" value={holidayForm.date} onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })} required />
        <input placeholder="Название" value={holidayForm.name} onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })} required />
        <button type="submit">{editingHolidayId ? 'Обновить' : 'Добавить'}</button>
      </form>
      <ul>
        {holidays.map((h: any) => (
          <li key={h.id}>{h.date} - {h.name}
            <button onClick={() => { setEditingHolidayId(h.id); setHolidayForm(h); }}>Редактировать</button>
            <button onClick={() => dispatch(removeHoliday(h.id))}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
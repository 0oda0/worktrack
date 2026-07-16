import { Request, Response } from 'express';
import { User, AttendanceRecord } from '../models';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { getStats } from '../services/attendanceService';

export const exportExcel = async (req: Request, res: Response) => {
  const { start, end, userId } = req.query;
  const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end ? new Date(end as string) : new Date();

  let users: any[] = [];
  if (userId) {
    const user = await User.findByPk(parseInt(userId as string));
    if (user) users = [user];
  } else {
    // Все пользователи, к которым есть доступ (будет фильтроваться в middleware)
    users = await User.findAll({ where: { role: 'worker' } });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Отчёт');

  worksheet.columns = [
    { header: 'ФИО', key: 'fullName', width: 25 },
    { header: 'Аудитория', key: 'audience', width: 15 },
    { header: 'Всего часов', key: 'totalHours', width: 15 },
    { header: 'Рабочие часы (норма)', key: 'workHours', width: 20 },
    { header: 'Оплачиваемые часы', key: 'paidHours', width: 18 },
    { header: 'Переработка', key: 'overtime', width: 15 },
    { header: 'Часы в выходные', key: 'weekendHours', width: 18 },
  ];

  for (const user of users) {
    const stats = await getStats(user.id, startDate, endDate); // функция из attendanceService
    worksheet.addRow({
      fullName: user.fullName,
      audience: user.audience,
      totalHours: stats.totalHours,
      workHours: stats.workHours,
      paidHours: stats.paidHours,
      overtime: stats.overtime,
      weekendHours: stats.weekendHours,
    });
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};

export const exportPDF = async (req: Request, res: Response) => {
  // Аналогично, но с PDFKit – упрощённо
  const { start, end } = req.query;
  const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = end ? new Date(end as string) : new Date();

  const users = await User.findAll({ where: { role: 'worker' } });
  const doc = new PDFDocument({ margin: 30 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
  doc.pipe(res);

  doc.fontSize(16).text('Отчёт по рабочему времени', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12);

  for (const user of users) {
    const stats = await getStats(user.id, startDate, endDate);
    doc.text(`Сотрудник: ${user.fullName} (${user.audience})`);
    doc.text(`Всего часов: ${stats.totalHours}`);
    doc.text(`Рабочие часы (норма): ${stats.workHours}`);
    doc.text(`Оплачиваемые часы: ${stats.paidHours}`);
    doc.text(`Переработка: ${stats.overtime}`);
    doc.text(`Часы в выходные: ${stats.weekendHours}`);
    doc.moveDown();
  }

  doc.end();
};

// Импортируем getStats (чтобы не дублировать)
import { getStats } from '../services/attendanceService';
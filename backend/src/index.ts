import app from './app';
import { sequelize } from './config/database';
import adminRoutes from './routes/adminRoutes';  // 👈 добавляем импорт

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('DB connected');
    
    // 👇 подключаем adminRoutes к приложению
    app.use('/api/admin', adminRoutes);
    
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};

start();
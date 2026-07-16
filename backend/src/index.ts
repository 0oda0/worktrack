import app from './app';
import { sequelize } from './config/database';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // для разработки – осторожно!
    console.log('DB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
};
router.use('/admin', adminRoutes);
start();
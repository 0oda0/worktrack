import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';
import AttendanceRecord from './AttendanceRecord';
import WorkRequest from './WorkRequest';
import Holiday from './Holiday';

User.hasMany(AttendanceRecord, { foreignKey: 'userId' });
AttendanceRecord.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(WorkRequest, { foreignKey: 'userId' });
WorkRequest.belongsTo(User, { foreignKey: 'userId' });

export { sequelize, User, AttendanceRecord, WorkRequest, Holiday };
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface AttendanceAttributes {
  id: number;
  userId: number;
  date: Date;
  checkIn: Date;
  checkOut: Date | null;
  locationIn: { lat: number; lng: number };
  locationOut: { lat: number; lng: number } | null;
  isManual: boolean;
  verified: boolean;
  comment: string;
}

type AttendanceCreation = Optional<AttendanceAttributes, 'id' | 'checkOut' | 'locationOut' | 'isManual' | 'verified' | 'comment'>;

class AttendanceRecord extends Model<AttendanceAttributes, AttendanceCreation> implements AttendanceAttributes {
  public id!: number;
  public userId!: number;
  public date!: Date;
  public checkIn!: Date;
  public checkOut!: Date | null;
  public locationIn!: { lat: number; lng: number };
  public locationOut!: { lat: number; lng: number } | null;
  public isManual!: boolean;
  public verified!: boolean;
  public comment!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AttendanceRecord.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    checkIn: { type: DataTypes.DATE, allowNull: false },
    checkOut: { type: DataTypes.DATE, allowNull: true },
    locationIn: { type: DataTypes.JSON, allowNull: false },
    locationOut: { type: DataTypes.JSON, allowNull: true },
    isManual: { type: DataTypes.BOOLEAN, defaultValue: false },
    verified: { type: DataTypes.BOOLEAN, defaultValue: true },
    comment: { type: DataTypes.TEXT, defaultValue: '' },
  },
  { sequelize, modelName: 'AttendanceRecord' }
);

export default AttendanceRecord;
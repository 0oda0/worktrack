import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface WorkRequestAttributes {
  id: number;
  userId: number;
  date: Date;
  checkIn: Date;
  checkOut: Date;
  location: { lat: number; lng: number };
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: number | null;
  reviewComment: string;
}

type WorkRequestCreation = Optional<WorkRequestAttributes, 'id' | 'status' | 'reviewedBy' | 'reviewComment'>;

class WorkRequest extends Model<WorkRequestAttributes, WorkRequestCreation> implements WorkRequestAttributes {
  public id!: number;
  public userId!: number;
  public date!: Date;
  public checkIn!: Date;
  public checkOut!: Date;
  public location!: { lat: number; lng: number };
  public comment!: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public reviewedBy!: number | null;
  public reviewComment!: string;
}

WorkRequest.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    checkIn: { type: DataTypes.DATE, allowNull: false },
    checkOut: { type: DataTypes.DATE, allowNull: false },
    location: { type: DataTypes.JSON, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
    reviewedBy: { type: DataTypes.INTEGER, allowNull: true },
    reviewComment: { type: DataTypes.TEXT, defaultValue: '' },
  },
  { sequelize, modelName: 'WorkRequest' }
);

export default WorkRequest;
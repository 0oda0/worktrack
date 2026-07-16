import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface HolidayAttributes {
  id: number;
  date: Date;
  name: string;
}

type HolidayCreation = Optional<HolidayAttributes, 'id'>;

class Holiday extends Model<HolidayAttributes, HolidayCreation> implements HolidayAttributes {
  public id!: number;
  public date!: Date;
  public name!: string;
}

Holiday.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: 'Holiday' }
);

export default Holiday;
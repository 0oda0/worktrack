import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ROLES, AUDIENCES } from '../config/constants';

interface UserAttributes {
  id: number;
  fullName: string;
  email: string;
  password: string;
  role: typeof ROLES[keyof typeof ROLES];
  audience: typeof AUDIENCES[number] | null;
  hireDate: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public fullName!: string;
  public email!: string;
  public password!: string;
  public role!: typeof ROLES[keyof typeof ROLES];
  public audience!: typeof AUDIENCES[number] | null;
  public hireDate!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM(...Object.values(ROLES)), allowNull: false, defaultValue: ROLES.WORKER },
    audience: { type: DataTypes.ENUM(...AUDIENCES), allowNull: true },
    hireDate: { type: DataTypes.DATEONLY, allowNull: false },
  },
  { sequelize, modelName: 'User' }
);

export default User;
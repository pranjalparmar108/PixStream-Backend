

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  
    role: {
      type: DataTypes.ENUM('admin', 'doctor', 'patient'),
      allowNull: false,
      defaultValue: 'patient',
    },
  
  });


  return User;
};

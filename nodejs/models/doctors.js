module.exports = (sequelize, DataTypes) => {
  const Doctor = sequelize.define("Doctor", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registration_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      references:{
        model:"Users",
        key:"email"
      }
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    free_follow_up_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    consultation_fees: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Doctor;
};

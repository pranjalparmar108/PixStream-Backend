module.exports = (sequelize, DataTypes) => {
  const DoctorSlot = sequelize.define("DoctorSlot", {
    slots_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "DoctorSchedules",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time_slot: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    availability: {
      type: DataTypes.ENUM("Available", "Booked"),
      allowNull: false,
    },
  });

  return DoctorSlot;
};

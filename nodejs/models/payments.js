module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define("Payment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Appointments",
        key: "id",
      },
    },
    payment_mode: {
      type: DataTypes.ENUM("UPI", "Credit Card","Cash"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    upi_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    credit_card_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    credit_card_expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    credit_card_cvv: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Payment;
};

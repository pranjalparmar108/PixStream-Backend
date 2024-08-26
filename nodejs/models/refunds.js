module.exports = (sequelize, DataTypes) => {
  const Refund = sequelize.define("Refund", {
    refundsTransactionId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Payments",
        key: "id",
      },
    },
    amount_refunded: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    refund_mode: {
      type: DataTypes.ENUM("Credit Card", "UPI"),
      allowNull: false,
    },
    refund_transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refund_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Processed", "Pending", "Failed"),
      allowNull: false,
    },
  });

  return Refund;
};

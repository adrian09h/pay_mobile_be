const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { UserOrderStatus } = require('../config/user_order_status');

const userOrderSchema = mongoose.Schema(
  {
    offer: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    amountInETH: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: [UserOrderStatus.IDEAL, UserOrderStatus.READY, UserOrderStatus.SENT_TO_SYSTEM, UserOrderStatus.COMPLETED],
      required: true,
    },
    triedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userOrderSchema.plugin(toJSON);

/**
 * @typedef UserOrder
 */
const UserOrder = mongoose.model('UserOrder', userOrderSchema);

module.exports = UserOrder;

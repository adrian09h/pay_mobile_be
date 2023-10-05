const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { UserOrderStatus } = require('../config/user_order_status');
const { offerTemplateSchema } = require('./offertemplate.model');

const amountSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    percent: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

const userOrderSchema = mongoose.Schema(
  {
    offer: offerTemplateSchema,
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    amountInETH: {
      type: [amountSchema],
      required: true,
    },
    status: {
      type: String,
      enum: [UserOrderStatus.IDEAL, UserOrderStatus.TAKEN, UserOrderStatus.SENT_TO_SYSTEM, UserOrderStatus.COMPLETED],
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
userOrderSchema.plugin(paginate);

/**
 * @typedef UserOrder
 */
const UserOrder = mongoose.model('UserOrder', userOrderSchema);

module.exports = UserOrder;

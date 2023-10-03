const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { OfferTypes } = require('../config/offer_types');

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

const offerTemplateSchema = mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [OfferTypes.FOR_NORMAL, OfferTypes.FOR_VIOLATED],
      required: true,
    },
    amountInUSD: {
      type: [amountSchema],
      required: true,
    },
    requiredActions: {
      type: [String],
      required: true,
    },
    freezeWalletAfter: {
      type: Boolean,
      required: true,
      private: true,
    },
    shouldTryCount: {
      type: Number,
      default: 0,
    },
    nextNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
// add plugin that converts mongoose to json
offerTemplateSchema.plugin(toJSON);
offerTemplateSchema.plugin(paginate);

offerTemplateSchema.statics.isNumberTaken = async function (number, excludeTemplateId) {
  const template = await this.findOne({ number, _id: { $ne: excludeTemplateId } });
  return !!template;
};

/**
 * @typedef OfferTemplate
 */
const OfferTemplate = mongoose.model('OfferTemplate', offerTemplateSchema);

module.exports = {
  OfferTemplate,
  offerTemplateSchema,
};

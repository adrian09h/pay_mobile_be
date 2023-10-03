const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { OfferTypes } = require('../config/offer_types');

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
      type: [Number],
      required: true,
    },
    requiredActions: {
      type: [String],
      required: true,
    },
    freezeWalletAfter: {
      type: Boolean,
      default: false,
      required: true,
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

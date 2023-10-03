const Joi = require('joi');
const { objectId, offerTemplateType } = require('./custom.validation');

const createOfferTemplate = {
  body: Joi.object().keys({
    number: Joi.number().integer().required(),
    type: Joi.string().required().custom(offerTemplateType),
    amountInUSD: Joi.array().items(
      Joi.object({
        amount: Joi.number().required(),
        percent: Joi.number().required(),
      })
    ),
    requiredActions: Joi.array().items(Joi.string()).required(),
    freezeWalletAfter: Joi.boolean().required(),
    shouldTryCount: Joi.number(),
    nextNumber: Joi.number().integer().required(),
  }),
};

const getOfferTemplates = {
  query: Joi.object().keys({
    number: Joi.number().integer(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getOfferTemplate = {
  params: Joi.object().keys({
    templateId: Joi.string().custom(objectId),
  }),
};

const updateOfferTemplate = {
  params: Joi.object().keys({
    templateId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      number: Joi.number().integer(),
      type: Joi.string().custom(offerTemplateType),
      amountInUSD: Joi.array().items(
        Joi.object({
          amount: Joi.number().required(),
          percent: Joi.number().required(),
        })
      ),
      requiredActions: Joi.array().items(Joi.string()),
      freezeWalletAfter: Joi.boolean(),
      shouldTryCount: Joi.number(),
      nextNumber: Joi.number().integer(),
    })
    .min(1),
};

const deleteOfferTemplate = {
  params: Joi.object().keys({
    templateId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createOfferTemplate,
  getOfferTemplates,
  getOfferTemplate,
  updateOfferTemplate,
  deleteOfferTemplate,
};

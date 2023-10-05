const Joi = require('joi');

const takeOrder = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
  }),
};

const startOrder = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
  }),
};

module.exports = {
  takeOrder,
  startOrder,
};

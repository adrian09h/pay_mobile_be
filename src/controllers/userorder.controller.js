const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userOrderService } = require('../services');
const { offerTemplateService } = require('../services');
const { UserOrderStatus } = require('../config/user_order_status');
const { OfferTypes } = require('../config/offer_types');
const web3Controller = require('./web3.controller');

const generateOrderWithTemplateNumber = async (offerType, userId, templateNumber) => {
  const filter = { type: offerType };
  if (templateNumber) {
    filter.number = templateNumber;
  }
  const options = {
    sortBy: 'number',
    limit: 100,
  };
  const templateQuery = await offerTemplateService.queryOfferTemplate(filter, options);
  if (templateQuery.results.length > 0) {
    const offer = templateQuery.results[0];
    const ethPriceUSD = await web3Controller.getETHPriceUSD();
    const amountInETH = offer.amountInUSD.map((usd) => `${(usd / ethPriceUSD).toFixed(5)}`);
    const userOrder = {
      offer,
      user: userId,
      amountInETH,
      status: UserOrderStatus.IDEAL,
    };
    const newOrder = await userOrderService.createUserOrder(userOrder);
    return newOrder;
  }
  throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Not offer found.');
};

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status']);
  filter.user = req.user.id;
  const options = {
    sortBy: 'createdAt',
    limit: 100,
  };
  const result = await userOrderService.queryUserOrder(filter, options);
  res.send(result);
});

const getNextOrder = catchAsync(async (req, res) => {
  const filter = { user: req.user.id };
  const options = {
    sortBy: 'createdAt',
    limit: 100,
  };
  if (!req.user.isEmailVerified) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Email is not verified');
  } else {
    const { results } = await userOrderService.queryUserOrder(filter, options);
    const offerType = req.user.isViolatedByIPHDPolicy ? OfferTypes.FOR_VIOLATED : OfferTypes.FOR_NORMAL;
    if (results.length === 0) {
      const newOrder = await generateOrderWithTemplateNumber(offerType, req.user.id);
      res.send(newOrder);
    } else {
      const lastOrder = results[results.length - 1];
      if (lastOrder.status === UserOrderStatus.COMPLETED) {
        if (offerType === OfferTypes.FOR_VIOLATED) {
          /*
            check if the last order is of violated.
          */
          if (lastOrder.offer.type === OfferTypes.FOR_VIOLATED) {
            const newOrder = await generateOrderWithTemplateNumber(offerType, req.user.id, lastOrder.offer.nextNumber);
            res.send(newOrder);
          } else {
            const newOrder = await generateOrderWithTemplateNumber(offerType, req.user.id);
            res.send(newOrder);
          }
        } else {
          const newOrder = await generateOrderWithTemplateNumber(offerType, req.user.id, lastOrder.offer.nextNumber);
          res.send(newOrder);
        }
      } else {
        throw new ApiError(httpStatus.CONFLICT, 'Current order is not completed.');
      }
    }
  }
});
// const template = await userOrderService.createUserOrder(req.body);
// res.status(httpStatus.CREATED).send(existingOrders);
// throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');

module.exports = {
  getNextOrder,
  getOrders,
};

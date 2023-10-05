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
    const amountInETH = offer.amountInUSD.map((amountItem) => (amountItem.amount / ethPriceUSD).toFixed(6));
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
          /* check if the last order is of violated. */
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
        throw new ApiError(httpStatus.CONFLICT, 'Current order is not completed');
      }
    }
  }
});

const takeOrder = catchAsync(async (req, res) => {
  const existingOrder = await userOrderService.getUserOrderById(req.body.orderId);
  if (!existingOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  const userId = req.user.id;
  if (userId !== `${existingOrder.user}`) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unautorised data owner');
  }
  if (existingOrder.status !== UserOrderStatus.IDEAL) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Order is already taken');
  }
  existingOrder.status = UserOrderStatus.TAKEN;
  const updatedOrder = await userOrderService.updateUserOderById(req.body.orderId, existingOrder);
  res.send(updatedOrder);
});

/*
start order to send crypto to system
*/
const startOrder = catchAsync(async (req, res) => {
  const existingOrder = await userOrderService.getUserOrderById(req.body.orderId);
  if (!existingOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  const userId = req.user.id;
  /* if user is not same, return 403 */
  if (userId !== `${existingOrder.user}`) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Unautorised data owner');
  }

  /* if order status is not TAKEN, return 406 */
  if (existingOrder.status !== UserOrderStatus.TAKEN) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Order is not taken yet');
  }
  const { walletAddress } = req.user;
  const walletKey = web3Controller.decryptString(req.user.walletKey);

  let balance;
  try {
    balance = await web3Controller.getBalance(walletAddress);
  } catch (error) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Failed to get balance');
  }
  const balanceInFloat = parseFloat(balance);
  const amountToBeSent = existingOrder.amountInETH.reduce((a, b) => a + b);
  let shouldSendAll = false;
  if (amountToBeSent > balanceInFloat) {
    /* if balance is not enough, return 409 */
    throw new ApiError(httpStatus.CONFLICT, 'No enough balance');
  } else if (amountToBeSent === balanceInFloat) {
    shouldSendAll = true;
  }

  /* send ETH to admin wallet */
  const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS;
  try {
    const txHash = await web3Controller.sendETH(
      walletAddress,
      adminWalletAddress,
      walletKey,
      `${amountToBeSent}`,
      shouldSendAll
    );
    console.log('success to send ETH: txHash: ', txHash);
    existingOrder.status = UserOrderStatus.SENT_TO_SYSTEM;
    const updatedOrder = await userOrderService.updateUserOderById(req.body.orderId, existingOrder);
    res.send(updatedOrder);
  } catch (error) {
    console.log('Failed to send eth: ', error);
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Failed to send eth');
  }
});

module.exports = {
  getNextOrder,
  getOrders,
  takeOrder,
  startOrder,
};

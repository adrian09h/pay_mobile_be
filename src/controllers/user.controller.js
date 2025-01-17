const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const web3Controller = require('./web3.controller');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const withdrawCrypto = catchAsync(async (req, res) => {
  const fromAddress = req.user.walletAddress;
  const key = web3Controller.decryptString(req.user.walletKey);
  const { amount, withdrawAddress, sentAll } = req.body;
  if (req.user.walletFrozen) {
    throw new ApiError(httpStatus.CONFLICT, 'Insufficient credit to withdraw');
  }
  try {
    const balance = await web3Controller.getBalance(fromAddress);
    const balanceInFloat = parseFloat(balance);
    let shouldSendAll = sentAll;
    if (amount > balanceInFloat) {
      /* if balance is not enough, return 409 */
      throw new ApiError(httpStatus.CONFLICT, 'No enough balance');
    } else if (amount === balanceInFloat) {
      shouldSendAll = true;
    }
    const txHash = await web3Controller.sendETH(fromAddress, withdrawAddress, key, `${amount.toFixed(10)}`, shouldSendAll);
    res.send({ success: true, txHash });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, error.message);
  }
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  withdrawCrypto,
};

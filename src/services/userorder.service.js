const httpStatus = require('http-status');
const { UserOrder } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an userOrder
 * @param {Object} userOrderBody
 * @returns {Promise<UserOrder>}
 */
const createUserOrder = async (userOrderBody) => {
  return UserOrder.create(userOrderBody);
};

/**
 * Query for userOrderBody
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUserOrder = async (filter, options) => {
  const offers = await UserOrder.paginate(filter, options);
  return offers;
};

/**
 * Get userOrder by id
 * @param {ObjectId} id
 * @returns {Promise<UserOrder>}
 */
const getUserOrderById = async (id) => {
  return UserOrder.findById(id);
};

/**
 * Get getUserOrdersByUserId by userId
 * @param {string} userId
 * @returns {Promise<UserOrder>}
 */
const getUserOrdersByUserId = async (userId) => {
  return UserOrder.find({ userId });
};

/**
 * Update userOder by id
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @returns {Promise<UserOder>}
 */
const updateUserOderById = async (orderId, updateBody) => {
  const userOrder = await getUserOrderById(orderId);
  if (!userOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  // if (updateBody.number && (await OfferTemplate.isNumberTaken(updateBody.number, templateId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Offer Tempalte Number already taken');
  // }
  Object.assign(userOrder, updateBody);
  await userOrder.save();
  return userOrder;
};

/**
 * Delete userOder by id
 * @param {ObjectId} orderId
 * @returns {Promise<UserOder>}
 */
const deleteUserOrderById = async (orderId) => {
  const order = await getUserOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  await order.remove();
  return order;
};

module.exports = {
  createUserOrder,
  queryUserOrder,
  getUserOrderById,
  getUserOrdersByUserId,
  updateUserOderById,
  deleteUserOrderById,
};

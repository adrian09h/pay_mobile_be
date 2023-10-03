const httpStatus = require('http-status');
const { OfferTemplate } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an offerTemplate
 * @param {Object} offerTemplateBody
 * @returns {Promise<OrderTemplate>}
 */
const createOfferTemplate = async (offerTemplateBody) => {
  return OfferTemplate.create(offerTemplateBody);
};

/**
 * Query for offerTemplate
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryOfferTemplate = async (filter, options) => {
  const offers = await OfferTemplate.paginate(filter, options);
  return offers;
};

/**
 * Get offerTemplate by id
 * @param {ObjectId} id
 * @returns {Promise<OfferTemplate>}
 */
const getOfferTemplateById = async (id) => {
  return OfferTemplate.findById(id);
};

/**
 * Get offerTemplate by number
 * @param {Numbers} number
 * @returns {Promise<OfferTemplate>}
 */
const getOfferTemplateByNumber = async (number) => {
  return OfferTemplate.findOne({ number });
};

/**
 * Update offerTemplate by id
 * @param {ObjectId} templateId
 * @param {Object} updateBody
 * @returns {Promise<OfferTemplate>}
 */
const updateOfferTemplateById = async (templateId, updateBody) => {
  const offerTemplate = await getOfferTemplateById(templateId);
  if (!offerTemplate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'OfferTemplate not found');
  }
  if (updateBody.number && (await OfferTemplate.isNumberTaken(updateBody.number, templateId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Offer Tempalte Number already taken');
  }
  Object.assign(offerTemplate, updateBody);
  await offerTemplate.save();
  return offerTemplate;
};

/**
 * Delete OfferTemplate by id
 * @param {ObjectId} templateId
 * @returns {Promise<OfferTemplate>}
 */
const deleteOfferTemplateById = async (templateId) => {
  const template = await getOfferTemplateById(templateId);
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offer template not found');
  }
  await template.remove();
  return template;
};

module.exports = {
  createOfferTemplate,
  queryOfferTemplate,
  getOfferTemplateById,
  getOfferTemplateByNumber,
  updateOfferTemplateById,
  deleteOfferTemplateById,
};

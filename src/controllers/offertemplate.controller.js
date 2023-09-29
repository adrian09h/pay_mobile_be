const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { offerTemplateService } = require('../services');

const createOfferTemplate = catchAsync(async (req, res) => {
  const template = await offerTemplateService.createOfferTemplate(req.body);
  res.status(httpStatus.CREATED).send(template);
});

const getOfferTemplates = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['number']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await offerTemplateService.queryOfferTemplate(filter, options);
  res.send(result);
});

const getOfferTemplate = catchAsync(async (req, res) => {
  const template = await offerTemplateService.getOfferTemplateById(req.params.templateId);
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offer template not found');
  }
  res.send(template);
});

const updateOfferTemplate = catchAsync(async (req, res) => {
  const template = await offerTemplateService.updateOfferTemplateById(req.params.templateId, req.body);
  res.send(template);
});

const deleteOfferTemplate = catchAsync(async (req, res) => {
  await offerTemplateService.deleteOfferTemplateById(req.params.templateId);
  res.send({ success: true }).send();
});

module.exports = {
  createOfferTemplate,
  getOfferTemplates,
  getOfferTemplate,
  updateOfferTemplate,
  deleteOfferTemplate,
};

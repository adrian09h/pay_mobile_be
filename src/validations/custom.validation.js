const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('password must be at least 8 characters');
  }
  // if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
  //   return helpers.message('password must contain at least 1 letter and 1 number');
  // }
  return value;
};

const offerTemplateType = (value, helpers) => {
  if (value !== 'FOR_NORMAL' && value !== 'FOR_VIOLATED') {
    return helpers.message('Template type should be one of FOR_NORMAL or FOR_VIOLATED');
  }
  return value;
};

module.exports = {
  objectId,
  password,
  offerTemplateType,
};

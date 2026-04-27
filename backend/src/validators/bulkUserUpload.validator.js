const Joi = require('joi');

exports.uploadOptionsSchema = Joi.object({
  skipDuplicates: Joi.boolean().default(true),
  strictMode: Joi.boolean().default(false),
});

exports.commitUploadSchema = Joi.object({
  confirm: Joi.boolean().valid(true).required(),
});

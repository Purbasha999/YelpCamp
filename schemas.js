const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html')

const extention = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttibutes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value});
                return clean;

            }
        }
    }
})

const Joi = BaseJoi.extend(extention)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //images: Joi.string().allow('').optional(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().required().max(5)
    }).required()
});
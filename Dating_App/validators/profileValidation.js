// validators/profileValidation.js
const { check } = require('express-validator');

const createProfileValidation = [
  check('firstName').optional().isString().trim(),
  check('age').optional().isInt({ min: 18 }),
  check('gender').optional().isIn(['male', 'female', 'non-binary', 'other']),
  check('bio').optional().isString(),
  check('location').optional().isString(),
  check('occupation').optional().isString(),
  check('education').optional().isString(),
  check('height').optional().isInt({ min: 0 }),
  check('drinking').optional().isIn(['yes', 'no', 'sometimes']),
  check('smoking').optional().isIn(['yes', 'no', 'sometimes']),
  check('lookingFor').optional().isIn(['relationship', 'casual', 'friendship', 'not_sure']),
  check('kids').optional().isIn(['have', 'want', 'dont_want', 'not_sure']),
  check('zodiac').optional().isIn([
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ]),
  check('minAgePreference').optional().isInt({ min: 18 }),
  check('maxAgePreference').optional().isInt({ min: 18 }),
  check('maxDistancePreference').optional().isInt({ min: 1 }),
  check('genderPreference').optional().isString()
];

const updateProfileValidation = [
  ...createProfileValidation,
  check('company').optional().isString(),
  check('religion').optional().isString(),
  check('politicalViews').optional().isIn(['liberal', 'conservative', 'moderate', 'other', 'prefer_not_to_say']),
  check('exercise').optional().isIn(['daily', 'weekly', 'rarely', 'never']),
  check('pets').optional().isString(),
  check('languages').optional().isString(),
  check('instagram').optional().isString(),
  check('spotifyArtists').optional().isString(),
  check('photoUrl').optional().isString(),
  check('prompt').optional().isString(),
  check('promptResponse').optional().isString()
];

module.exports = {
  createProfileValidation,
  updateProfileValidation
};
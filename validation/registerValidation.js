const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  // Turn in to string
  data.username = !isEmpty(data.username) ? data.username : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  // Check if username is empty, long enough and alphanumeric
  if (Validator.isEmpty(data.username)) {
    errors.username = "Username field is required.";
  } else if (!Validator.isLength(data.username, { min: 2, max: 30 })) {
    errors.username = "Username must be between 2 and 30 characters.";
  } else if (!Validator.isAlphanumeric(data.username)) {
    errors.username =
      "Username can not contain spaces, hashes, underscores or dashes.";
  }

  // Check if email is empty or invalid
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required.";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid.";
  }

  // Check if password is empty or long enough
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required.";
  } else if (!Validator.isLength(data.password, { min: 6 })) {
    errors.password = "Password must be at least 6 characters long.";
  }

  // Check if password2 is empty or does not match
  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm Password field is required.";
  } else if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords must match.";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

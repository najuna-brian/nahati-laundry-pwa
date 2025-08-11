const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[0-9]{10,15}$/; // Adjust the regex based on your phone number format
    return phoneRegex.test(phoneNumber);
};

const validateWeight = (weight) => {
    return weight > 0; // Ensure weight is a positive number
};

const validateSpecialInstructions = (instructions) => {
    return instructions.length <= 200; // Limit special instructions to 200 characters
};

const validateOrder = (order) => {
    const { phoneNumber, weight, specialInstructions } = order;
    const errors = {};

    if (!validatePhoneNumber(phoneNumber)) {
        errors.phoneNumber = "Invalid phone number.";
    }

    if (!validateWeight(weight)) {
        errors.weight = "Weight must be a positive number.";
    }

    if (!validateSpecialInstructions(specialInstructions)) {
        errors.specialInstructions = "Special instructions must be 200 characters or less.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

export { validatePhoneNumber, validateWeight, validateSpecialInstructions, validateOrder };
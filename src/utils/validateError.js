const validateError = async (error, res) => {
    console.warn(error)

    return res.status(500).json({
        error: "InternalServerError",
        message: "An unexpected error occurred. Please try again later."
    });
}

module.exports = validateError
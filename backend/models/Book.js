const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: String,
            required: true,
            trim: true
        },

        genre: {
            type: String,
            required: true,
            trim: true
        },

        averageRating: {
            type: Number,
            default: 0
        },

        // Reference to the user who created the book - Foreign key relationship with the User model
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Book", bookSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true,
            unique: true,
            match: /^\d{10}$/
        },

        password: {
            type: String,
            required: true
        },

        pin: {
          type: String,
          required: true,
          trim: true,
          limit: 6
        },

        role: {
          type: String,
          enum: ["user", "admin"],
          default: "user"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);

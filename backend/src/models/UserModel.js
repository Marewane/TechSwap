const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [3, "Name must be at least 3 characters"],
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Email is invalid",
        ],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false, // hide by default when querying
    },
    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active",
    },
    avatar: {
        type: String,
        default: "https://i.pravatar.cc/150?img=4",
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bio: {
        type: String,
        maxlength: [500, "bio cannot be longer than 500 characters"],
        default: "",
    },
    skillsToLearn: {
      type: [String], // array of strings
      default: [], // empty array if no skills yet
    },
    skillsToTeach: {
        type: [String],
        default: [],
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    totalSession: {
        type: Number,
    },
    lastLogin: {
        type: Date,
        default: null, // null until first login in
    },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

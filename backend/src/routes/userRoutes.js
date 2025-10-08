const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { getUsers, addUser } = require("../controllers/userController");

router.get("/users", getUsers);
router.post("/users", addUser);

// 🛡️ PROTECTED ROUTE - GET USER PROFILE i think it didnt work
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        // req.user is already set by authMiddleware
        res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: {
            user: req.user,
        },
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({
        success: false,
        message: "Error fetching profile",
        });
    }
});

module.exports = router;
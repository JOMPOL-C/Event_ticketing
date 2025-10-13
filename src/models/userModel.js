const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["attendee", "organizer"],
            default: "attendee"
        }
    },
    { timestamps: true } // ✅ ใส่ใน options ตรงนี้แทน
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const users = mongoose.model('User', userSchema);

module.exports = users;
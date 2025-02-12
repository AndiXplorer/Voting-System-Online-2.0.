require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// Lidhja me MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ Error connecting to MongoDB:", err));


// Modeli User
const userSchema = new mongoose.Schema({
    leternjoftimi: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVoted: {type: Boolean, default:false}
});

const User = mongoose.model("User", userSchema);


//NO COMMENT ss

// Votimi
app.post("/vote", async (req, res) => {
    try {
        const { leternjoftimi } = req.body;

        // me gjet userin permes leternjoftimit ne db
        const user = await User.findOne({ leternjoftimi });

        if (!user) {
            return res.status(404).json({ message: "❌ Përdoruesi nuk u gjet!" });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: "❌ Ky user ka votuar tashmë!" });
        }

        // Update is voted ne True
        user.isVoted = true;
        await user.save();

        res.json({ message: "✅ Votimi u regjistrua me sukses!" });
    } catch (err) {
        console.error("❌ Gabim në votim:", err);
        res.status(500).json({ message: "Ndodhi një gabim, provo përsëri!" });
    }
});




// ✅ POST - Regjistrimi i userit
app.post("/register", async (req, res) => {
    try {
        const { leternjoftimi, password } = req.body;

        // Validim i thjeshtë
        if (!leternjoftimi || !password) {
            return res.status(400).json({ message: "Letërnjoftimi dhe password-i janë të detyrueshëm!" });
        }

        // Kontrollo nëse ekziston tashmë
        const existingUser = await User.findOne({ leternjoftimi });
        if (existingUser) {
            return res.status(400).json({ message: "Ky numër letërnjoftimi është përdorur më parë!" });
        }

        // Enkriptimi i passwordit
        const hashedPassword = await bcrypt.hash(password, 10);

        // Me rujt ndb
        const user = new User({ leternjoftimi, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "✅ Përdoruesi u regjistrua me sukses!" });
    } catch (err) {
        console.error("❌ Gabim në regjistrim:", err);
        res.status(500).json({ message: "Ndodhi një gabim, provo përsëri!" });
    }
});

// ✅ POST - Login 
app.post("/login", async (req, res) => {
    try {
        const { leternjoftimi, password } = req.body;

        // Kontrollo nëse ekziston user-i
        const user = await User.findOne({ leternjoftimi });
        if (!user) {
            return res.status(400).json({ message: "Letërnjoftimi ose fjalëkalimi është gabim!" });
        }

        // Krahaso fjalëkalimin e dhënë me atë të ruajtur
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Letërnjoftimi ose fjalëkalimi është gabim!" });
        }

        // Krijo JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "✅ Login i suksesshëm!", token });
    } catch (err) {
        console.error("❌ Gabim në login:", err);
        res.status(500).json({ message: "Ndodhi një gabim, provo përsëri!" });
    }
});

// ✅ GET 
app.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Mos kthe password-in
        res.json(users);
    } catch (err) {
        console.error("❌ Gabim në marrjen e përdoruesve:", err);
        res.status(500).json({ message: "Ndodhi një gabim, provo përsëri!" });
    }
});

// Serveri
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveri po funksionon në portin ${PORT}`));

const bcrypt = require("bcryptjs"); // importing bcrypt for password hashing
const User = require("../models/User"); //importing user schema/model for mongoose
const jwt = require("jsonwebtoken"); //importing jwt


//Signup API

const signup = async (req, res) => {
    try {
        const { username, email, mobile, password, pin } = req.body;

        // Check required fields
        if (!username || !email || !mobile || !password || !pin)  {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        //Email Validation
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            //setError("Invalid email");
            return res.status(400).json({
              message: "Email is not valid"
            });
        }

        //Mobile Number Validation
        if (!/^\d{10}$/.test(mobile)) {
          //setError("Invalid Mobile Number");
          return res.status(400).json({
              message: "Invalid Mobile Number"
          });
        }

        //Pincode Validation
        if (!/^\d{6}$/.test(pin)) {
          //setError("Invalid Pincode");
          return res.status(400).json({
              message: "Invalid Pincode"
          })
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { username },
                { email },
                { mobile }
            ]
        });

        // If existing user, return 409 - conflict 
        if (existingUser) {
            return res.status(409).json({
                message: "Username, email, or mobile already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            username,
            email,
            mobile,
            password: hashedPassword,
            pin
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                mobile: user.mobile,
                //pin: user.pin
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        //finding user
        const user = await User.findOne({ email });

        //If user don't exist or email don't exists return
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        //Checking password Valid or Not of the user
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        //If Not Valid password
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { 
              userId: user._id,
              role: user.role
             },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    signup,
    login
};

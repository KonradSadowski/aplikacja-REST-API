const service = require('../service')
const Joi = require('joi')
const User = require('../service/schemas/user')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const jimp = require('jimp');
const path = require('path');
const uuid = require('uuid');
const { sendVerificationEmail } = require('../service/email')
require('dotenv').config()


const get = async (req, res, next) => {
    try {
        const results = await service.getAllContacts()
        res.json({
            status: 'success',
            code: 200,
            data: {
                contacts: results,
            },
        })
    } catch (e) {
        console.error(e)
        next(e)
    }
}

const getById = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await service.getContactById(id)
        if (result) {
            res.json({
                status: 'success',
                code: 200,
                data: { contact: result },
            })
        } else {
            res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${id}`,
                data: 'Not Found',
            })
        }
    } catch (e) {
        console.error(e)
        next(e)
    }
}

const create = async (req, res, next) => {
    const { name, email, phone } = req.body
    try {
        const result = await service.createContact({ name, email, phone })

        res.status(201).json({
            status: 'success',
            code: 201,
            data: { contact: result },
        })
    } catch (e) {
        console.error(e)
        next(e)
    }
}

const update = async (req, res, next) => {
    const { id } = req.params
    const { name, email, phone, favorite } = req.body
    try {
        const result = await service.updateContact(id, {
            name, email, phone, favorite
        })
        if (result) {
            res.json({
                status: 'success',
                code: 200,
                data: { contact: result },
            })
        } else {
            res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${id}`,
                data: 'Not Found',
            })
        }
    } catch (e) {
        console.error(e)
        next(e)
    }
}

const updateFavorite = async (req, res, next) => {
    const { id } = req.params
    const { favorite } = req.body

    if (favorite === undefined || favorite === null) {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "No Favorite"
        })
    }

    try {
        const result = await service.updateStatusContact(id, { favorite })
        if (result) {
            res.json({
                status: 'success',
                code: 200,
                data: { contact: result },
            })
        } else {
            res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${id}`,
                data: 'Not Found',
            })
        }
    } catch (e) {
        console.error(e)
        next(e)
    }
}

const remove = async (req, res, next) => {
    const { id } = req.params

    try {
        const result = await service.removeContact(id)
        if (result) {
            res.json({
                status: 'success',
                code: 200,
                data: { contact: result },
            })
        } else {
            res.status(404).json({
                status: 'error',
                code: 404,
                message: `Not found contact id: ${id}`,
                data: 'Not Found',
            })
        }
    } catch (e) {
        console.error(e)
        next(e)
    }
}


const userSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required(),
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
    verificationToken: Joi.string(),
})

const signUp = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { error } = userSchema.validate({ email, password });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            return res.status(409).json({ message: "Email in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        const newUser = new User({ email, password: hashedPassword });

        const verificationToken = uuid.v4();

        newUser.verificationToken = verificationToken;
        await newUser.save();

        await sendVerificationEmail(newUser.email, verificationToken);

        const avatarURL = gravatar.url(email, { s: '250', r: 'pg', d: 'identicon' });

        return res.status(201).json({
            user: {
                email: newUser.email,
                subscription: newUser.subscription,
                avatarURL: avatarURL,
            },
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};






const logIn = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const { error } = userSchema.validate({ email, password });

        if (error) {
            return res.status(400).json({
                error: error.details[0].message
            })
        }

        const registeredUser = await User.findOne({ email: email });

        if (!registeredUser) {
            return res.status(401).json({ message: "Email or password is wrong" });
        }

        const properPassword = await bcrypt.compare(password, registeredUser.password);

        if (!properPassword) {
            return res.status(401).json({ message: "Email or password is wrong" });
        }

        const payload = {
            id: registeredUser.id,
            email: email
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" })

        registeredUser.token = token
        await registeredUser.save()

        return res.status(200).json({
            token: token,
            user: {
                email: registeredUser.email,
                subscription: registeredUser.subscription,
            }

        })

    } catch (e) {
        console.error(e)
        next(e)
    }
}

const logOut = async (req, res, next) => {
    try {
        const user = req.user;

        user.token = null;
        await user.save();

        return res.status(204).json();
    } catch (error) {
        return next(error);
    }
};


const currentUser = (req, res) => {
    try {
        return res.status(200).json({
            email: req.user.email,
            subscription: req.user.subscription,
        });
    } catch (error) {
        return next(error);
    }

};


const updateAvatar = async (req, res, next) => {
    try {
        const user = req.user;


        const avatarPath = path.join(__dirname, '..', 'public', 'avatars', req.file.filename);
        const avatar = await jimp.read(req.file.path);
        await avatar.resize(250, 250).write(avatarPath);


        user.avatarURL = `/avatars/${req.file.filename}`;
        await user.save();

        res.status(200).json({ avatarURL: user.avatarURL });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const verifyEmail = async (req, res) => {
    const { verificationToken } = req.params;

    try {
        const user = await User.findOne({ verificationToken });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.verify = true;
        user.verificationToken = null;
        await user.save();

        return res.status(200).json({ message: 'Verification successful' });
    } catch (error) {
        console.error('Błąd weryfikacji emaila:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Missing required field email' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.verify) {
            return res
                .status(400)
                .json({ message: 'Verification has already been passed' });
        }

        const verificationToken = uuid.v4();
        user.verificationToken = verificationToken;
        await user.save();

        await sendVerificationEmail(user.email, verificationToken);

        return res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        console.error('Błąd podczas ponownego wysyłania emaila weryfikacyjnego:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    get,
    getById,
    create,
    update,
    updateFavorite,
    remove,
    signUp,
    logIn,
    logOut,
    currentUser,
    updateAvatar,
    verifyEmail,
    resendVerificationEmail
}

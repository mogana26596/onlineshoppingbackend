const express = require('express');
const db = require('./connect');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    images: String,
    name: String,
    amount: Number,
});
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const cartSchema = new mongoose.Schema({
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Cart = mongoose.model('Cart', cartSchema);

const seedDatabase = async () => {
    try {
      await Product.deleteMany();   
      const products = [
        {
           "images": "/images/1.png",
            "name": "Apple",
            "amount": 300
            },
            {
            "images": "/images/2.jpg",
            "name": "Strawberry",
            "amount": 150
            },
            {
            "images": "/images/111.jpg", 
            "name": "Ballari Onion",
            "amount": 40
            },
            {
            "images": "/images/222.jpg",
            "name": "Potato",
            "amount": 43
            },
            {
            "images": "/images/3.jpg",
            "name": "Pomegranate",
            "amount": 250
            },
            {
            "images": "/images/1111.jpg",
            "name": "Radish",
            "amount": 68
            },
            {
            "images": "/images/4.jpg",
            "name": "Banana",
            "amount": 100
            },
            {
            "images": "/images/1000.jpg",
            "name": "Ginger",
            "amount": 102
            }, 
            {
            "images": "/images/5.jpg",
            "name": "Mango",
            "amount": 220
            },
            {
            "images": "/images/6.jpg",
            "name": "Orange",
            "amount": 300
            },
            {
            "images": "/images/7.jpeg",
            "name": "Sapota",
            "amount": 150
            },
            {
            "images": "/images/333.jpg",
            "name": "Tomato",
            "amount": 85
            },
            {
            "images": "/images/8.jpg",
            "name": "Anjeer",
            "amount": 250
            },
            {
            "images": "/images/9.jpg",
            "name": "Guava",
            "amount": 180
            },
            {
            "images": "/images/777.jpeg",
            "name": "Beetroot",
            "amount": 49
            },
            {
            "images": "/images/888.jpg", 
            "name": "Brinjal",
            "amount": 54
            },
            {
            "images": "/images/10.jpg",
            "name": "Dragon fruit",
            "amount": 400
            },
            {
            "images": "/images/11.jpg",
            "name": "Kiwi",
            "amount": 350
            },
            {
            "images": "/images/555.jpg",
            "name": "Carrot",
            "amount": 78
            },
            {
            "images": "/images/12.jpg",
            "name": "Mangosteen",
            "amount": 400
            },
            {
            "images": "/images/444.png",
            "name": "Ladie's Finger",
            "amount": 86
            },
            {
            "images": "/images/666.jpg",
            "name": "Beans",
            "amount": 290
            },
            {
            "images": "/images/999.png",
            "name": "Chilli",
            "amount": 118
            },
            {
            "images": "/images/2222.jpg",
            "name": "Cucumber",
            "amount": 80
        }];
        await Product.insertMany(products);
        console.log('Database seeded successfully');
      } catch (error) {
        console.error('Error seeding database:', error);
      }
    };
seedDatabase();

dotenv.config();
db();
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({email : req.body.email});
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = new User({email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({email : req.body.email});
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Add fruit to cart
app.post('/cart', async (req, res) => {
    const { productId } = req.body;
    let cart = await Cart.findOne();
    if (!cart) {
        cart = new Cart({ products: [] });
    }
    cart.products.push(productId);
    await cart.save();
    const populatedCart = await cart.populate('products');
    res.json(populatedCart);
});

// Get cart products
app.get('/cart', async (req, res) => {
    const cart = await Cart.findOne().populate('products');
    res.json(cart);
});

// Get products
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});


app.listen(process.env.PORT);
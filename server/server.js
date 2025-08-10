import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard'

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

// User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
})

const User = mongoose.model('User', userSchema)

// Idea Schema
const ideaSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  project: {
    type: String,
    required: true,
    trim: true
  },
  module: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    trim: true
  },
  submittedBy: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
})

const Idea = mongoose.model('Idea', ideaSchema)

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, phoneNumber, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber })
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this phone number already exists' 
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = new User({
      fullName,
      phoneNumber,
      password: hashedPassword
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body

    // Find user by phone number
    const user = await User.findOne({ phoneNumber })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number or password'
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number or password'
      })
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
})

// Submit idea
app.post('/api/ideas', async (req, res) => {
  try {
    const { text, project, module, section, submittedBy, userId } = req.body

    // Validate required fields
    if (!text || !project || !module || !section || !submittedBy || !userId) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    // Create new idea
    const newIdea = new Idea({
      text,
      project,
      module,
      section,
      submittedBy,
      userId
    })

    await newIdea.save()

    res.status(201).json({
      success: true,
      message: 'Idea submitted successfully',
      idea: newIdea
    })

  } catch (error) {
    console.error('Idea submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during idea submission'
    })
  }
})

// Get all ideas
app.get('/api/ideas', async (req, res) => {
  try {
    const ideas = await Idea.find().populate('userId', 'fullName phoneNumber').sort({ createdAt: -1 })
    res.json({
      success: true,
      ideas
    })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Get ideas by user
app.get('/api/ideas/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const ideas = await Idea.find({ userId }).sort({ createdAt: -1 })
    res.json({
      success: true,
      ideas
    })
  } catch (error) {
    console.error('Error fetching user ideas:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Update idea status
app.patch('/api/ideas/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'approved', 'rejected', 'in-progress', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      })
    }

    const idea = await Idea.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      })
    }

    res.json({
      success: true,
      message: 'Idea status updated successfully',
      idea
    })

  } catch (error) {
    console.error('Error updating idea status:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

// Get all users (for testing)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }) // Exclude password field
    res.json({
      success: true,
      users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
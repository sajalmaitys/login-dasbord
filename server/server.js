import express from 'express'
import mysql from 'mysql2/promise'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// MySQL connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '8332',
  database: process.env.DB_NAME || 'dashboard'
}

let db

async function initializeDatabase() {
  try {
    // First connect without specifying database to create it if needed
    const tempConfig = { ...dbConfig }
    delete tempConfig.database
    
    const tempDb = await mysql.createConnection(tempConfig)
    
    // Create database if it doesn't exist
    await tempDb.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``)
    await tempDb.end()
    
    // Now connect to the specific database
    db = await mysql.createConnection(dbConfig)
    console.log('Connected to MySQL database')

    // Create tables if they don't exist
    await createTables()
  } catch (err) {
    console.error('MySQL connection error:', err)
    process.exit(1)
  }
}

async function createTables() {
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        phoneNumber VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    // Create ideas table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ideas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text TEXT NOT NULL,
        project VARCHAR(255) NOT NULL,
        module VARCHAR(255) NOT NULL,
        section VARCHAR(255) NOT NULL,
        submittedBy VARCHAR(255) NOT NULL,
        userId INT NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'in-progress', 'completed') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `)

    console.log('Database tables created successfully')
  } catch (error) {
    console.error('Error creating tables:', error)
  }
}





app.post('/api/register', async (req, res) => {
  try {
    const { fullName, phoneNumber, password } = req.body

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE phoneNumber = ?',
      [phoneNumber]
    )

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone number already exists'
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (fullName, phoneNumber, password) VALUES (?, ?, ?)',
      [fullName, phoneNumber, hashedPassword]
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        fullName,
        phoneNumber
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
    const [users] = await db.execute(
      'SELECT id, fullName, phoneNumber, password FROM users WHERE phoneNumber = ?',
      [phoneNumber]
    )

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number or password'
      })
    }

    const user = users[0]

    // Verify password
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
        id: user.id,
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

    // Insert new idea
    const [result] = await db.execute(
      'INSERT INTO ideas (text, project, module, section, submittedBy, userId) VALUES (?, ?, ?, ?, ?, ?)',
      [text, project, module, section, submittedBy, userId]
    )

    // Get the created idea
    const [ideas] = await db.execute(
      'SELECT * FROM ideas WHERE id = ?',
      [result.insertId]
    )

    res.status(201).json({
      success: true,
      message: 'Idea submitted successfully',
      idea: ideas[0]
    })

  } catch (error) {
    console.error('Idea submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during idea submission'
    })
  }
})


app.get('/api/ideas', async (req, res) => {
  try {
    const [ideas] = await db.execute(`
      SELECT i.*, u.fullName, u.phoneNumber 
      FROM ideas i 
      LEFT JOIN users u ON i.userId = u.id 
      ORDER BY i.createdAt DESC
    `)

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


app.get('/api/ideas/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const [ideas] = await db.execute(
      'SELECT * FROM ideas WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    )

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

    // Update idea status
    const [result] = await db.execute(
      'UPDATE ideas SET status = ? WHERE id = ?',
      [status, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      })
    }

    // Get updated idea
    const [ideas] = await db.execute(
      'SELECT * FROM ideas WHERE id = ?',
      [id]
    )

    res.json({
      success: true,
      message: 'Idea status updated successfully',
      idea: ideas[0]
    })

  } catch (error) {
    console.error('Error updating idea status:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
})


app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, fullName, phoneNumber, createdAt, updatedAt FROM users'
    )

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

// Initialize database and start server
async function startServer() {
  await initializeDatabase()
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
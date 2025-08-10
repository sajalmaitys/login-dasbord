import { useState, useEffect } from 'react'
import './App.css'
import Dashboard from './Dashboard'

function App() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const API_URL = 'http://localhost:5000/api'

  
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Login successful!')
        console.log('User logged in:', data.user)
        setUser(data.user)
        setIsLoggedIn(true)

        
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        
        setPhoneNumber('')
        setPassword('')
        setRememberMe(false)
      } else {
        setMessage(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('Passwords do not match!')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, phoneNumber, password }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Registration successful! You can now login.')
        console.log('User registered:', data.user)

        
        setTimeout(() => {
          setIsRegister(false)
          setFullName('')
          setPhoneNumber('')
          setPassword('')
          setConfirmPassword('')
          setMessage('')
        }, 2000)
      } else {
        setMessage(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
    setMessage('')
    
    setPhoneNumber('')
    setPassword('')
    setFullName('')
    setConfirmPassword('')
    setRememberMe(false)
    setIsRegister(false)
  }

  
  if (isLoggedIn && user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>{isRegister ? 'Register' : 'Login'}</h1>

        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {!isRegister ? (




          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <span className="input-icon">📱</span>
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="input-icon">🔒</span>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <a href="#" className="forgot-password">Forgot Password</a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="register-link">
              Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(true); }}>Register</a>
            </p>
          </form>
        ) : (
          
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <span className="input-icon">👤</span>
            </div>

            <div className="input-group">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <span className="input-icon">📱</span>
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="input-icon">🔒</span>
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span className="input-icon">🔒</span>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <p className="register-link">
              Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(false); }}>Login</a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default App
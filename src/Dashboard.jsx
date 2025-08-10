import { useState, useEffect } from 'react'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('task')
  const [activeSubTab, setActiveSubTab] = useState('idea')
  const [taskMenuOpen, setTaskMenuOpen] = useState(true)

  // Idea form state
  const [ideaText, setIdeaText] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedIdeas, setSubmittedIdeas] = useState([])
  const [loadingIdeas, setLoadingIdeas] = useState(false)

  const taskStats = [
    { title: 'Total Tasks', value: '24', icon: '📋', color: '#4f46e5' },
    { title: 'Completed', value: '18', icon: '✅', color: '#059669' },
    { title: 'In Progress', value: '4', icon: '🔄', color: '#f59e0b' },
    { title: 'Pending', value: '2', icon: '⏳', color: '#dc2626' }
  ]

  const recentTasks = [
    { task: 'Complete project documentation', time: '2 hours ago', icon: '📝', status: 'completed' },
    { task: 'Review code changes', time: '4 hours ago', icon: '👀', status: 'in-progress' },
    { task: 'Update database schema', time: '1 day ago', icon: '🗄️', status: 'pending' },
    { task: 'Deploy to production', time: '2 days ago', icon: '🚀', status: 'completed' }
  ]

  // Fetch user's submitted ideas
  const fetchUserIdeas = async () => {
    if (!user.id) return
    
    setLoadingIdeas(true)
    try {
      const response = await fetch(`http://localhost:5000/api/ideas/user/${user.id}`)
      const result = await response.json()
      
      if (result.success) {
        setSubmittedIdeas(result.ideas)
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoadingIdeas(false)
    }
  }

  // Load ideas when component mounts or user changes
  useEffect(() => {
    if (activeSubTab === 'idea' && user.id) {
      fetchUserIdeas()
    }
  }, [activeSubTab, user.id])

  // Submit idea function
  const handleSubmitIdea = async (e) => {
    e.preventDefault()

    if (!ideaText.trim() || !selectedProject || !selectedModule || !selectedSection) {
      setSubmitMessage('Please fill in all fields')
      setTimeout(() => setSubmitMessage(''), 3000)
      return
    }

    setIsSubmitting(true)

    try {
      const ideaData = {
        text: ideaText,
        project: selectedProject,
        module: selectedModule,
        section: selectedSection,
        submittedBy: user.fullName,
        userId: user.id
      }

      const response = await fetch('http://localhost:5000/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ideaData)
      })

      const result = await response.json()

      if (result.success) {
        // Reset form
        setIdeaText('')
        setSelectedProject('')
        setSelectedModule('')
        setSelectedSection('')

        setSubmitMessage('✅ Idea submitted successfully!')
        setTimeout(() => setSubmitMessage(''), 5000)
        
        // Refresh the ideas list
        fetchUserIdeas()
      } else {
        setSubmitMessage(`❌ ${result.message}`)
        setTimeout(() => setSubmitMessage(''), 5000)
      }

    } catch (error) {
      console.error('Error submitting idea:', error)
      setSubmitMessage('❌ Error submitting idea. Please try again.')
      setTimeout(() => setSubmitMessage(''), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p>Welcome back, {user.fullName}!</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <div className="user-details">
              <span className="user-name">{user.fullName}</span>
              <span className="user-phone">{user.phoneNumber}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        {/* Vertical Navigation */}
        <nav className="dashboard-nav">
          <div className="nav-item">
            <button
              className={`nav-btn ${activeTab === 'task' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('task')
                setTaskMenuOpen(!taskMenuOpen)
              }}
            >
              <span className="nav-icon">✅</span>
              <span className="nav-text">Task</span>
              <span className={`nav-arrow ${taskMenuOpen ? 'open' : ''}`}>▼</span>
            </button>

            {taskMenuOpen && activeTab === 'task' && (
              <div className="sub-menu">
                <button
                  className={`sub-nav-btn ${activeSubTab === 'idea' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('idea')}
                >
                  <span className="sub-nav-icon">💡</span>
                  <span className="sub-nav-text">Idea</span>
                </button>
                <button
                  className={`sub-nav-btn ${activeSubTab === 'assign' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('assign')}
                >
                  <span className="sub-nav-icon">👤</span>
                  <span className="sub-nav-text">Assign</span>
                </button>
                <button
                  className={`sub-nav-btn ${activeSubTab === 'status' ? 'active' : ''}`}
                  onClick={() => setActiveSubTab('status')}
                >
                  <span className="sub-nav-icon">📊</span>
                  <span className="sub-nav-text">Status</span>
                </button>
              </div>
            )}
          </div>


        </nav>

        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === 'task' && (
            <div className="task-content">
              {activeSubTab === 'idea' && (
                <div className="sub-content">
                  <h2>💡 Task Ideas</h2>
                  <div className="idea-form-container">
                    {submitMessage && (
                      <div className={`submit-message ${submitMessage.includes('✅') ? 'success' : 'error'}`}>
                        {submitMessage}
                      </div>
                    )}
                    <form className="idea-form" onSubmit={handleSubmitIdea}>
                      <div className="form-group">
                        <label htmlFor="ideaText">Idea Description</label>
                        <input
                          type="text"
                          id="ideaText"
                          value={ideaText}
                          onChange={(e) => setIdeaText(e.target.value)}
                          placeholder="Enter your idea..."
                          className="idea-input"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="project">Project</label>
                        <select
                          id="project"
                          value={selectedProject}
                          onChange={(e) => setSelectedProject(e.target.value)}
                          className="idea-select"
                        >
                          <option value="">Select Project</option>
                          <option value="web-app">Web Application</option>
                          <option value="mobile-app">Mobile Application</option>
                          <option value="dashboard">Dashboard System</option>
                          <option value="api">API Development</option>
                          <option value="database">Database Management</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="module">Module</label>
                        <select
                          id="module"
                          value={selectedModule}
                          onChange={(e) => setSelectedModule(e.target.value)}
                          className="idea-select"
                        >
                          <option value="">Select Module</option>
                          <option value="authentication">Authentication</option>
                          <option value="user-management">User Management</option>
                          <option value="reporting">Reporting</option>
                          <option value="analytics">Analytics</option>
                          <option value="notifications">Notifications</option>
                          <option value="settings">Settings</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="section">Section</label>
                        <select
                          id="section"
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          className="idea-select"
                        >
                          <option value="">Select Section</option>
                          <option value="frontend">Frontend</option>
                          <option value="backend">Backend</option>
                          <option value="database">Database</option>
                          <option value="ui-ux">UI/UX</option>
                          <option value="testing">Testing</option>
                          <option value="deployment">Deployment</option>
                        </select>
                      </div>

                      <button type="submit" className="idea-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Idea'}
                      </button>
                    </form>
                  </div>

                  {/* Display submitted ideas */}
                  <div className="submitted-ideas-section">
                    <h3>Your Submitted Ideas</h3>
                    {loadingIdeas ? (
                      <div className="loading-message">Loading ideas...</div>
                    ) : submittedIdeas.length > 0 ? (
                      <div className="ideas-list">
                        {submittedIdeas.map((idea) => (
                          <div key={idea._id} className="idea-item">
                            <div className="idea-header">
                              <span className="idea-text">{idea.text}</span>
                              <span className={`idea-status ${idea.status}`}>
                                {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                              </span>
                            </div>
                            <div className="idea-details">
                              <span className="idea-detail">
                                <strong>Project:</strong> {idea.project}
                              </span>
                              <span className="idea-detail">
                                <strong>Module:</strong> {idea.module}
                              </span>
                              <span className="idea-detail">
                                <strong>Section:</strong> {idea.section}
                              </span>
                            </div>
                            <div className="idea-meta">
                              <span className="idea-date">
                                Submitted: {new Date(idea.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-ideas-message">
                        No ideas submitted yet. Submit your first idea above!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSubTab === 'assign' && (
                <div className="sub-content">
                  <h2>👤 Task Assignment</h2>
                  <div className="assign-section">
                    <div className="assign-form">
                      <h3>Assign New Task</h3>
                      <select className="assign-select">
                        <option>Select Team Member</option>
                        <option>John Doe</option>
                        <option>Jane Smith</option>
                        <option>Mike Johnson</option>
                      </select>
                      <input type="text" placeholder="Task title..." className="assign-input" />
                      <textarea placeholder="Task description..." className="assign-textarea"></textarea>
                      <select className="assign-select">
                        <option>Priority Level</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                      <button className="assign-btn">Assign Task</button>
                    </div>
                    <div className="assigned-tasks">
                      <h3>Recently Assigned</h3>
                      <div className="assigned-item">
                        <div className="assigned-info">
                          <span className="assigned-task">Update user interface</span>
                          <span className="assigned-to">Assigned to: John Doe</span>
                        </div>
                        <span className="priority high">High</span>
                      </div>
                      <div className="assigned-item">
                        <div className="assigned-info">
                          <span className="assigned-task">Fix login bug</span>
                          <span className="assigned-to">Assigned to: Jane Smith</span>
                        </div>
                        <span className="priority medium">Medium</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'status' && (
                <div className="sub-content">
                  <h2>📊 Task Status</h2>
                  <div className="status-section">
                    {/* Task Stats Cards */}
                    <div className="stats-grid">
                      {taskStats.map((stat, index) => (
                        <div key={index} className="stat-card" style={{ borderColor: stat.color }}>
                          <div className="stat-icon" style={{ color: stat.color }}>
                            {stat.icon}
                          </div>
                          <div className="stat-info">
                            <h3>{stat.value}</h3>
                            <p>{stat.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Task Progress and Recent Tasks */}
                    <div className="content-grid">
                      <div className="chart-section">
                        <h3>Task Progress Overview</h3>
                        <div className="chart-placeholder">
                          <div className="progress-circle">
                            <div className="progress-text">
                              <span className="progress-percentage">75%</span>
                              <span className="progress-label">Completed</span>
                            </div>
                          </div>
                          <p>Overall Task Completion Rate</p>
                        </div>
                      </div>

                      <div className="activity-section">
                        <h3>Recent Tasks</h3>
                        <div className="activity-list">
                          {recentTasks.map((task, index) => (
                            <div key={index} className="activity-item">
                              <span className="activity-icon">{task.icon}</span>
                              <div className="activity-details">
                                <p>{task.task}</p>
                                <div className="task-meta">
                                  <span className="activity-time">{task.time}</span>
                                  <span className={`task-status ${task.status}`}>
                                    {task.status.replace('-', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


        </main>
      </div>
    </div>
  )
}

export default Dashboard
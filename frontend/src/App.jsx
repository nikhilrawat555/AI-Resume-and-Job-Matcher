import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!resume || !jobDescription) {
      setError('Please upload a resume and provide a job description.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', resume)
      formData.append('jobDescription', jobDescription)
      const res = await axios.post('https://ai-resume-and-job-matcher.onrender.com/api/analyze', formData)
      setResult(res.data.data)
    } catch (err) {
      setError('Something went wrong. Please make sure the backend server is running.')
    }
    setLoading(false)
  }

  const getScoreColor = (score) => {
    if (score >= 75) return '#22c55e'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="container">

      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">🤖 AI Powered</div>
        <h1>AI Resume & Job Matcher</h1>
        <p>Upload your resume and paste a job description to get your match score, missing keywords, and improvement suggestions.</p>
      </div>

      {/* INPUT */}
      <div className="input-section">
        <div className="upload-box">
          <div className="box-header">
            <div className="box-icon">📄</div>
            <label>Upload Resume</label>
          </div>
          <div className="upload-area">
            <label className="upload-label" htmlFor="resume-input">
              <span>📁</span>
              <strong>Choose a PDF file</strong>
              <p>Click to select your resume</p>
            </label>
            <input
              id="resume-input"
              type="file"
              accept=".pdf"
              onChange={(e) => setResume(e.target.files[0])}
            />
          </div>
          {resume && <div className="file-name">✅ {resume.name}</div>}
        </div>

        <div className="jd-box">
          <div className="box-header">
            <div className="box-icon">💼</div>
            <label>Paste Job Description</label>
          </div>
          <textarea
            placeholder="Copy and paste the job description from LinkedIn, Naukri, or any job portal..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error">⚠️ {error}</p>}

      <button onClick={handleSubmit} disabled={loading} className="analyze-btn">
        {loading ? '⏳ Analyzing...' : '🚀 Analyze Now'}
      </button>

      {result && (
        <div className="results">

          <div className="results-header">
            <h2>📊 Analysis Complete</h2>
            <p>Here is your detailed resume analysis report</p>
          </div>

          {/* Score */}
          <div className="card score-card">
            <h2>MATCH SCORE</h2>
            <div className="score-circle" style={{ borderColor: getScoreColor(result.matchScore) }}>
              <span style={{ color: getScoreColor(result.matchScore) }}>{result.matchScore}%</span>
            </div>
            <p className="score-message">
              {result.matchScore >= 75
                ? '🟢 Great match! Go ahead and apply.'
                : result.matchScore >= 50
                ? '🟡 Good, but consider improving before applying.'
                : '🔴 Resume needs significant improvements before applying.'}
            </p>
          </div>

          {/* 2 col grid */}
          <div className="two-col">
            <div className="card">
              <div className="card-title">✅ Matching Keywords</div>
              <div className="tags">
                {result.matchingKeywords.map((kw, i) => (
                  <span key={i} className="tag green">{kw}</span>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-title">❌ Missing Keywords</div>
              <div className="tags">
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} className="tag red">{kw}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Keyword Suggestions */}
          <div className="card">
            <div className="card-title">💡 Keyword Suggestions — Add These to Your Resume</div>
            <div className="tags">
              {result.keywordSuggestions.map((kw, i) => (
                <span key={i} className="tag blue">{kw}</span>
              ))}
            </div>
          </div>

          {/* Overall Feedback */}
          <div className="card">
            <div className="card-title">📋 Overall Feedback</div>
            <p className="feedback-text">{result.overallFeedback}</p>
          </div>

          {/* Bullet Improvements */}
          <div className="card">
            <div className="card-title">✍️ Bullet Point Improvements</div>
            {result.bulletImprovements.map((item, i) => (
              <div key={i} className="bullet-item">
                <p className="old">❌ Before: {item.original}</p>
                <p className="new">✅ After: {item.improved}</p>
              </div>
            ))}
          </div>

          {/* ATS Issues */}
          <div className="card">
            <div className="card-title">🤖 ATS Issues — Fix These</div>
            <ul>
              {result.atsIssues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  )
}

export default App
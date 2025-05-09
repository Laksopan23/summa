import React, { useState, useEffect } from 'react';
import Layout from '../../Layout';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const UserHome = () => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [stopTime, setStopTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeEntries, setTimeEntries] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Check for running time entry and load history on component mount
  useEffect(() => {
    checkCurrentTimeEntry();
    loadTimeEntries();
  }, []);

  const loadTimeEntries = async () => {
    try {
      const response = await axios.get('/api/time-entries/history');
      setTimeEntries(response.data);
    } catch (error) {
      setError('Failed to load time entries');
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentTimeEntry = async () => {
    try {
      const response = await axios.get('/api/time-entries/current');
      if (response.data) {
        setIsRunning(true);
        const startTimeDate = new Date(response.data.startTime);
        setStartTime(startTimeDate.getTime());
        setProjectName(response.data.projectName);
      }
    } catch (error) {
      setError('Failed to check current time entry');
    }
  };

  // Timer logic
  useEffect(() => {
    let timer;
    if (isRunning && startTime) {
      timer = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, startTime]);

  const handleStartStop = async () => {
    try {
      setError(null);
      if (isRunning) {
        // Stop the timer
        const response = await axios.post('/api/time-entries/stop');
        const end = new Date(response.data.endTime);
        setIsRunning(false);
        setStopTime(end);
        setSummary({
          _id: response.data._id,
          start: new Date(startTime),
          stop: end,
          duration: response.data.duration
        });
        setShowDescriptionInput(true);
        // Refresh time entries after stopping
        loadTimeEntries();
      } else {
        if (!projectName.trim()) {
          setError('Please enter a project name');
          return;
        }
        // Start the timer
        const response = await axios.post('/api/time-entries/start', {
          projectName: projectName.trim()
        });
        const now = new Date(response.data.startTime).getTime();
        setStartTime(now);
        setElapsedTime(0);
        setIsRunning(true);
        setStopTime(null);
        setSummary(null);
        setDescription('');
        setShowDescriptionInput(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleSaveDescription = async () => {
    try {
      if (!summary || !summary._id) {
        setError('No time entry found to update');
        return;
      }
      
      await axios.post('/api/time-entries/update-description', {
        timeEntryId: summary._id,
        description: description.trim()
      });
      
      setShowDescriptionInput(false);
      setDescription('');
      loadTimeEntries(); // Refresh the history
    } catch (error) {
      setError('Failed to save description: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditDescription = async (entryId, newDescription) => {
    try {
      await axios.post('/api/time-entries/update-description', {
        timeEntryId: entryId,
        description: newDescription.trim()
      });
      setEditingEntry(null);
      loadTimeEntries(); // Refresh the history
    } catch (error) {
      setError('Failed to update description: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    try {
      await axios.delete(`/api/time-entries/${entryId}`);
      loadTimeEntries(); // Refresh the history
    } catch (error) {
      setError('Failed to delete time entry: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatTime = (ms) => {
    if (!ms) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <input
          type="text"
          value={projectName}
          placeholder="What are you working on?"
          onChange={(e) => setProjectName(e.target.value)}
          disabled={isRunning}
          style={{
            padding: '0.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            outline: 'none',
            width: '50%',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: 'white',
            opacity: isRunning ? 0.7 : 1
          }}
        />
        <button 
          onClick={() => setShowHistory(!showHistory)}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '14px',
            marginRight: '1rem'
          }}
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
        <span style={{ marginLeft: '1rem', fontSize: '16px', color: '#6b7280' }}>🏷️</span>
        <span style={{ marginLeft: '1rem', fontSize: '16px', color: '#6b7280' }}>💰</span>
        <span style={{ marginLeft: '1rem', fontSize: '16px', color: '#111827' }}>
          {formatTime(elapsedTime)}
        </span>
        <button 
          onClick={handleStartStop}
          style={{
            marginLeft: '1rem',
            backgroundColor: isRunning ? '#ef4444' : '#0ea5e9',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: 1,
            transition: 'all 0.2s ease',
            ':hover': {
              backgroundColor: isRunning ? '#dc2626' : '#0284c7'
            }
          }}
        >
          {isRunning ? 'STOP' : 'START'}
        </button>
      </div>

      {error && (
        <div style={{
          margin: '1rem',
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {summary && (
        <div style={{
          margin: '1rem',
          padding: '1rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f3f4f6'
        }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#111827' }}>Session Summary</h3>
          <p><strong>Project:</strong> {projectName}</p>
          <p><strong>Start Time:</strong> {summary.start.toLocaleTimeString()}</p>
          <p><strong>Stop Time:</strong> {summary.stop.toLocaleTimeString()}</p>
          <p><strong>Total Time:</strong> {formatTime(summary.duration)}</p>
          
          {showDescriptionInput && (
            <div style={{ marginTop: '1rem' }}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this session..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  minHeight: '100px',
                  marginBottom: '0.5rem',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={handleSaveDescription}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save Description
              </button>
            </div>
          )}
        </div>
      )}

      {showHistory && (
        <div style={{
          margin: '1rem',
          padding: '1rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f3f4f6'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#111827' }}>Time Entry History</h3>
          {timeEntries.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No time entries found</p>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {timeEntries.map((entry) => (
                <div
                  key={entry._id}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    marginBottom: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: '#f9fafb'
                    }
                  }}
                  onClick={() => setEditingEntry(editingEntry === entry._id ? null : entry._id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#111827' }}>{entry.projectName}</strong>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingEntry(entry._id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry._id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatDate(entry.startTime)} - {entry.endTime ? formatDate(entry.endTime) : 'Running'}
                      </div>
                      {editingEntry === entry._id ? (
                        <div style={{ marginTop: '0.5rem' }}>
                          <textarea
                            value={entry.description || ''}
                            onChange={(e) => {
                              const updatedEntries = timeEntries.map(te => 
                                te._id === entry._id ? { ...te, description: e.target.value } : te
                              );
                              setTimeEntries(updatedEntries);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              minHeight: '60px',
                              marginBottom: '0.5rem',
                              fontSize: '14px'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDescription(entry._id, entry.description);
                              }}
                              style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingEntry(null);
                              }}
                              style={{
                                backgroundColor: '#6b7280',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        entry.description && (
                          <div style={{ 
                            marginTop: '0.5rem', 
                            fontSize: '0.875rem', 
                            color: '#4b5563',
                            fontStyle: 'italic'
                          }}>
                            {entry.description}
                          </div>
                        )
                      )}
                    </div>
                    <div style={{ color: '#111827', fontWeight: '500', marginLeft: '1rem' }}>
                      {formatTime(entry.duration || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default UserHome;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography,
  Grid,
  Box,
  CircularProgress,
  useTheme,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import Layout from '../../Layout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DashboardU = () => {
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState({
    totalSessions: 0,
    averageDuration: 0,
    sessionsByDay: [],
    sessionsByType: [],
  });

  const theme = useTheme();

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await axios.get('/api/time-entries/history');
        const timeEntries = response.data || [];

        // Total sessions
        const totalSessions = timeEntries.length;

        // Average duration (in minutes)
        const durations = timeEntries
          .filter(entry => entry.duration)
          .map(entry => entry.duration);
        const averageDuration = durations.length
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60000)
          : 0;

        // Sessions by Day
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const sessionsByDayMap = {};
        days.forEach(day => { sessionsByDayMap[day] = 0; });
        timeEntries.forEach(entry => {
          if (entry.startTime) {
            const date = new Date(entry.startTime);
            const day = days[date.getDay()];
            sessionsByDayMap[day] = (sessionsByDayMap[day] || 0) + 1;
          }
        });
        const sessionsByDay = days.map(day => ({ day, sessions: sessionsByDayMap[day] }));

        // Sessions by Type (projectName)
        const sessionsByTypeMap = {};
        timeEntries.forEach(entry => {
          const type = entry.projectName || 'Unknown';
          sessionsByTypeMap[type] = (sessionsByTypeMap[type] || 0) + 1;
        });
        const sessionsByType = Object.keys(sessionsByTypeMap).map(type => ({ type, count: sessionsByTypeMap[type] }));

        setSessionData({
          totalSessions,
          averageDuration,
          sessionsByDay,
          sessionsByType,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
        setLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  const handleExportPDF = async () => {
    const input = document.getElementById('dashboard-content');
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('dashboard.pdf');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
  <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.grey[100], minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <button onClick={handleExportPDF} style={{ padding: '8px 16px', fontWeight: 'bold', borderRadius: 4, border: 'none', background: '#1976d2', color: 'white', cursor: 'pointer' }}>
            Export to PDF
          </button>
        </Box>
        <div id="dashboard-content">
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Dashboard Insights
          </Typography>

          <Grid container spacing={3} sx={{ width: '100%' }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total Sessions
                </Typography>
                <Typography variant="h3" color="primary">
                  {sessionData.totalSessions}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Average Duration (minutes)
                </Typography>
                <Typography variant="h3" color="secondary">
                  {sessionData.averageDuration}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mt: 1, width: '100%' }}>
            {/* Sessions by Day */}
            <Grid item xs={12} md={12} sx={{ width: '100%' }}>
              <Paper elevation={3} sx={{ p: 5, borderRadius: 2, width: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Sessions by Day
                </Typography>
                <Box sx={{ height: 450, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionData.sessionsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke={theme.palette.primary.main}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Sessions by Type */}
            <Grid item xs={12} md={12} sx={{ width: '100%' }}>
              <Paper elevation={3} sx={{ p: 5, borderRadius: 2, width: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Sessions by Type
                </Typography>
                <Box sx={{ height: 450, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionData.sessionsByType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill={theme.palette.success.main} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </Box>
    </Layout>
  );
};

export default DashboardU; 
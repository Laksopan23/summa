import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
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

// Type definitions
const Dashboard = () => {
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
        const mockData = {
          totalSessions: 45,
          averageDuration: 35,
          sessionsByDay: [
            { day: 'Mon', sessions: 8 },
            { day: 'Tue', sessions: 12 },
            { day: 'Wed', sessions: 6 },
            { day: 'Thu', sessions: 9 },
            { day: 'Fri', sessions: 10 },
          ],
          sessionsByType: [
            { type: 'Meditation', count: 20 },
            { type: 'Breathing', count: 15 },
            { type: 'Mindfulness', count: 10 },
          ],
        };
        setSessionData(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
        setLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.grey[100], minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Insights
      </Typography>

      <Grid container spacing={3}>
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

        {/* Sessions by Day */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Sessions by Day
            </Typography>
            <Box sx={{ height: 300 }}>
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
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Sessions by Type
            </Typography>
            <Box sx={{ height: 300 }}>
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
    </Box>
  );
};

export default Dashboard;

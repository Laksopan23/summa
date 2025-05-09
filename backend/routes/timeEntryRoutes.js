const express = require('express');
const router = express.Router();
const timeEntryController = require('../controllers/timeEntryController');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// All routes are protected with authentication
router.use(auth);

// Log all requests
router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    user: req.user
  });
  next();
});

// Start a new time entry
router.post('/start', timeEntryController.startTimeEntry);

// Stop current time entry
router.post('/stop', timeEntryController.stopTimeEntry);

// Update time entry description
router.post('/update-description', timeEntryController.updateDescription);

// Delete a time entry
router.delete('/:timeEntryId', timeEntryController.deleteTimeEntry);

// Get current running time entry
router.get('/current', timeEntryController.getCurrentTimeEntry);

// Get time entries history
router.get('/history', timeEntryController.getTimeEntries);

module.exports = router; 
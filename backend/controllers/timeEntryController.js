const TimeEntry = require('../models/TimeEntry');

// Start a new time entry
exports.startTimeEntry = async (req, res) => {
  try {
    console.log('startTimeEntry called with body:', req.body);
    console.log('User from request:', req.user);
    
    const { projectName } = req.body;
    const userId = req.user._id;
    console.log('Starting time entry for:', {
      userId,
      projectName
    });

    // Check if user has any running time entries
    const runningEntry = await TimeEntry.findOne({ userId, isRunning: true });
    console.log('Existing running entry:', runningEntry);
    
    if (runningEntry) {
      console.log('Found existing running entry, returning error');
      return res.status(400).json({ message: 'You already have a running time entry' });
    }

    const startTime = new Date();
    console.log('Creating new time entry with start time:', startTime);

    const timeEntry = new TimeEntry({
      userId,
      projectName,
      startTime,
      isRunning: true
    });

    console.log('Saving new time entry:', timeEntry);
    await timeEntry.save();
    console.log('Time entry saved successfully');
    
    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Error in startTimeEntry:', error);
    res.status(500).json({ message: error.message });
  }
};

// Stop a time entry
exports.stopTimeEntry = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const timeEntry = await TimeEntry.findOne({ userId, isRunning: true });
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'No running time entry found' });
    }

    const endTime = new Date();
    const duration = endTime - timeEntry.startTime;

    timeEntry.endTime = endTime;
    timeEntry.duration = duration;
    timeEntry.isRunning = false;

    await timeEntry.save();
    res.json(timeEntry); // This now includes the _id field
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current running time entry
exports.getCurrentTimeEntry = async (req, res) => {
  try {
    console.log('getCurrentTimeEntry called');
    const userId = req.user._id;
    console.log('User ID:', userId);
    
    const timeEntry = await TimeEntry.findOne({ userId, isRunning: true });
    console.log('Current time entry:', timeEntry);
    res.json(timeEntry);
  } catch (error) {
    console.error('Error in getCurrentTimeEntry:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get time entries history
exports.getTimeEntries = async (req, res) => {
  try {
    console.log('getTimeEntries called');
    const userId = req.user._id;
    console.log('User ID:', userId);
    
    const timeEntries = await TimeEntry.find({ userId })
      .sort({ startTime: -1 })
      .limit(10);
    console.log('Found time entries:', timeEntries.length);
    res.json(timeEntries);
  } catch (error) {
    console.error('Error in getTimeEntries:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update time entry description
exports.updateDescription = async (req, res) => {
  try {
    const { timeEntryId, description } = req.body;
    const userId = req.user._id;

    const timeEntry = await TimeEntry.findOne({ _id: timeEntryId, userId });
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    timeEntry.description = description;
    await timeEntry.save();

    res.json(timeEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a time entry
exports.deleteTimeEntry = async (req, res) => {
  try {
    const { timeEntryId } = req.params;
    const userId = req.user._id;

    const timeEntry = await TimeEntry.findOne({ _id: timeEntryId, userId });
    
    if (!timeEntry) {
      return res.status(404).json({ message: 'Time entry not found' });
    }

    await TimeEntry.deleteOne({ _id: timeEntryId });
    res.json({ message: 'Time entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
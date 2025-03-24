const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Sample tasks
const tasks = [
  {
    "id": 1,
    "data": {
      "text": "This product exceeded all my expectations. Highly recommended!"
    },
    "meta": {
      "created_by": "user123",
      "created_at": "2025-03-22T12:00:00.000Z"
    }
  },
  {
    "id": 2,
    "data": {
      "text": "The customer service was terrible and the product arrived damaged."
    },
    "meta": {
      "created_by": "user456",
      "created_at": "2025-03-22T12:30:00.000Z"
    }
  },
  {
    "id": 3,
    "data": {
      "text": "Average product for the price. Nothing special but does the job."
    },
    "meta": {
      "created_by": "user789",
      "created_at": "2025-03-22T13:00:00.000Z"
    }
  },
  {
    "id": 4,
    "data": {
      "text": "I've been using this for a month now and it's holding up well."
    },
    "meta": {
      "created_by": "user101",
      "created_at": "2025-03-22T13:30:00.000Z"
    }
  },
  {
    "id": 5,
    "data": {
      "text": "The interface is intuitive and easy to navigate."
    },
    "meta": {
      "created_by": "user202",
      "created_at": "2025-03-22T14:00:00.000Z"
    }
  }
];

// Mock Label Studio API endpoint
app.get('/api/projects/:projectId/tasks/', (req, res) => {
  console.log(`Received request for project ${req.params.projectId} tasks`);
  res.json(tasks);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Mock Label Studio API is running');
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Mock server running at http://0.0.0.0:${port}`);
  console.log(`Access the tasks at http://0.0.0.0:${port}/api/projects/1/tasks/`);
});

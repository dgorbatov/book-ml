#!/bin/bash

# Function to cleanup processes
cleanup() {
    echo "Cleaning up processes..."
    echo $FLASK_PID
    kill $FLASK_PID
    exit 0
}
# Set up trap to catch Ctrl+C and other termination signals
trap cleanup SIGINT SIGTERM


# Start Flask backend in the background
echo "Starting Flask backend..."
cd backend  # Adjust this path to your backend directory
source venv/bin/activate && flask run --debug &

# Store the Flask process ID
FLASK_PID=$!

# Wait a moment for Flask to start
sleep 2

# Start React frontend
echo "Starting React frontend..."
cd ../frontend  # Adjust this path to your frontend directory
npm start

# When React is terminated, also kill Flask
cleanup
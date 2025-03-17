#!/bin/bash

echo "Starting Mongo DB Server..."
brew services start mongodb-community@8.0

echo "Starting Flask backend..."
source venv/bin/activate
flask run --debug

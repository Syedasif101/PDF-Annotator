
# PDF Annotator Full Stack Web App

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Installation

**Clone the repository**

```bash
git clone https://github.com/yourusername/pdf-annotator.git
cd pdf-annotator
Install dependencies

bash
# Install root dependencies
npm install

# Install all dependencies (Frontend & backend)
npm run install-all
Environment Setup

# Create .env file in root of backend directory

PORT=5000
MONGO_URI=mongodb://localhost:27017/pdf-annotator
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
Create .env file in root of frontend directory

# Create .env file in root of Frontend directory
REACT_APP_API_URL=http://localhost:5000/api

# Running the Application

# Make sure MongoDB is running

bash
npm run dev


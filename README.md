# 🎓 AI Counsellor

A comprehensive AI-powered platform that guides students through their study abroad journey with personalized recommendations, university discovery, and application management.

## ✨ Features

### Core Features
- **🔐 Authentication**: Secure signup and login
- **📝 Mandatory Onboarding**: Comprehensive profile building
- **📊 Dashboard**: Overview of journey progress and tasks
- **🤖 AI Counsellor**: Intelligent guidance with action capabilities
- **🎓 University Discovery**: Personalized recommendations (Dream/Target/Safe)
- **🔒 University Locking**: Commitment system for focused applications
- **✅ Application Tracking**: Task management and document tracking
- **👤 Profile Management**: Editable profile with real-time updates

### AI Capabilities
- Profile strength analysis
- University recommendations based on GPA, budget, and preferences
- Risk assessment for each university
- Personalized action plans
- Task generation based on locked universities

## 🚀 Tech Stack

**Frontend:**
- React.js
- React Router
- Context API for state management
- Axios for API calls
- CSS3 for styling

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Anthropic Claude AI API

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Anthropic API key

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Add your MongoDB URI and Anthropic API key to .env
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

## 🌐 Deployment

### Backend (Render.com)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables:
   - `MONGODB_URI`
   - `ANTHROPIC_API_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`
5. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set root directory to `client`
4. Add environment variable:
   - `REACT_APP_API_URL=your-backend-url`
5. Deploy

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
ANTHROPIC_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

## 🎯 User Flow

1. **Landing Page** → Sign up/Login
2. **Onboarding** → Complete profile (mandatory)
3. **Dashboard** → View progress and stats
4. **AI Counsellor** → Get recommendations and guidance
5. **Universities** → Browse, shortlist, and lock choices
6. **Applications** → Track tasks and deadlines
7. **Profile** → Edit information anytime

## 🔑 Key Features Explained

### Stage-Based Progression
- **Building Profile**: Complete onboarding
- **Discovering Universities**: Get AI recommendations
- **Finalizing Universities**: Shortlist and lock choices
- **Preparing Applications**: Complete tasks and documents

### University Locking System
- Prevents decision paralysis
- Creates focused application strategy
- Auto-generates tasks upon locking
- Can be unlocked with warning

### AI Counsellor Actions
- Recommend universities
- Analyze profile strengths/gaps
- Create action plans
- Answer specific questions
- Generate tasks

## 👨‍💻 Developer

**Aarzoo**
- GitHub: [AARZOO00](https://github.com/AARZOO00)
- LinkedIn: [aarzoo00](https://www.linkedin.com/in/aarzoo00)
- Email: aarzoo.coder@gmail.com
- Phone: +91 84005 75338

## 📄 License

MIT License

## 🙏 Acknowledgments

Built for the Humanity Founders AI Counsellor Hackathon 2026
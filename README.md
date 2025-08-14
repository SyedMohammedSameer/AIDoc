# 💚 VitaShifa - AI Health Companion

A comprehensive AI-powered medical information and assistance platform built with React, Google's Gemini AI, and Firebase. VitaShifa provides intelligent medical guidance across multiple domains while maintaining strict safety protocols and medical disclaimers.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange.svg)

## ✨ Key Features

### 🩺 **Medical Consultation**
- Comprehensive drug information and interactions
- Symptom analysis and medical Q&A
- Treatment options and alternatives
- AI-powered medical guidance with formatted responses

### 🔍 **AI Medical Image Analysis**
- Advanced analysis of X-rays, CT scans, MRIs
- Skin condition assessment and dermatology support
- ECG interpretation and lab report analysis
- Detailed observation reports with structured findings

### ❤️ **Personalized Wellness Planning**
- Custom health plans based on chronic conditions
- Lifestyle recommendation engine
- Goal tracking and progress monitoring
- Comprehensive wellness strategies

### 🚨 **Emergency First Aid Guidance**
- Step-by-step emergency procedures
- Critical situation management
- Safety-first protocols with immediate actions
- Professional help coordination

## 🚀 Technology Stack

- **Frontend:** React 19.1.0 with TypeScript
- **Build Tool:** Vite 6.3.5 for lightning-fast development
- **AI Engine:** Google Gemini 2.0 Flash (latest model)
- **Database:** Firebase Firestore for data logging
- **Analytics:** Firebase Analytics for usage tracking
- **Styling:** Tailwind CSS with custom design system
- **Icons:** Lucide React for modern iconography
- **Image Processing:** Base64 encoding for medical images

## 📱 Responsive Design

VitaShifa is optimized for all devices:
- **Mobile-first:** Touch-friendly interface for smartphones
- **Tablet:** Optimized layout for medium screens
- **Desktop:** Full-featured experience with advanced navigation
- **Dark Mode:** Automatic theme switching support

## 🔧 Quick Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Google Gemini API Key**
- **Firebase Project** (optional, for logging)

### Environment Configuration

Create a `.env` file in your project root:

```env
# Required: Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Firebase Configuration (for data logging)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vitashifa.git
   cd vitashifa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open VitaShifa**
   Navigate to `http://localhost:5173`

## 🔑 API Keys Setup

### Google Gemini API
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or select existing
3. Generate API key for Gemini
4. Add to `.env` as `GEMINI_API_KEY`

### Firebase Setup (Optional)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project or select existing
3. Enable Firestore Database
4. Get configuration from Project Settings
5. Add all Firebase config to `.env`

## 📁 Project Architecture

```
vitashifa/
├── src/
│   ├── components/
│   │   ├── Alert.tsx              # Alert notifications
│   │   ├── LoadingSpinner.tsx     # Loading animations
│   │   ├── ResponseFormatter.tsx  # AI response formatting
│   │   ├── Navbar.tsx             # Navigation with dark mode
│   │   ├── MedicalConsultation.tsx # Medical Q&A interface
│   │   ├── ImageAnalysis.tsx      # Image analysis interface
│   │   ├── WellnessPlanning.tsx   # Health planning interface
│   │   └── EmergencyGuidance.tsx  # Emergency assistance
│   ├── services/
│   │   ├── geminiService.ts       # AI integration & formatting
│   │   └── firebase.ts            # Database & logging
│   ├── types.ts                   # TypeScript definitions
│   ├── constants.ts               # App configuration
│   └── App.tsx                    # Main application
├── .env                           # Environment variables
├── package.json
└── README.md
```

## 🎨 Design System

VitaShifa features a modern, accessible design:

- **Color Palette:** Teal primary with health-focused gradients
- **Typography:** Inter font family for readability
- **Components:** Glass-morphism effects and smooth animations
- **Accessibility:** WCAG 2.1 compliant with proper contrast ratios
- **Responsive:** Mobile-first approach with breakpoint optimization

## 🛡️ Safety & Compliance

### Medical Disclaimers
- Comprehensive disclaimers on every page
- Clear emergency service reminders
- Professional consultation requirements

### Data Privacy
- Optional Firebase logging with user consent
- No sensitive medical data storage
- HIPAA-conscious design principles

### AI Safety
- Structured response formatting
- Source attribution when available
- Conservative medical advice approach

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel via GitHub integration
```

### Environment Variables for Production
Set these in your deployment platform:
- `GEMINI_API_KEY`
- `FIREBASE_API_KEY` (optional)
- `FIREBASE_AUTH_DOMAIN` (optional)
- `FIREBASE_PROJECT_ID` (optional)
- `FIREBASE_STORAGE_BUCKET` (optional)
- `FIREBASE_MESSAGING_SENDER_ID` (optional)
- `FIREBASE_APP_ID` (optional)

### Other Platforms
- **Netlify:** Drag and drop `dist/` folder
- **AWS S3:** Upload static files with CloudFront
- **Google Cloud:** Host with Cloud Storage + CDN

## 🔍 Advanced Features

### Response Formatting
VitaShifa formats AI responses into structured sections:
- **Executive Summary:** Key information upfront
- **Detailed Sections:** Organized by medical relevance
- **Visual Indicators:** Icons and color coding
- **Source Attribution:** When available from Gemini
- **Safety Disclaimers:** Always present and prominent

### Firebase Integration
- **Consultation Logging:** Track usage patterns
- **Error Monitoring:** Identify and fix issues quickly
- **Analytics:** Understand user needs
- **Performance:** Monitor response times

### Responsive Design
- **Mobile:** Touch-optimized interface
- **Tablet:** Adapted layouts for medium screens
- **Desktop:** Full-featured experience
- **Accessibility:** Screen reader support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Add proper error handling
- Include medical disclaimers
- Test on multiple devices

## 📊 Performance Optimization

- **Lazy Loading:** Components load on demand
- **Image Optimization:** Efficient medical image processing
- **Caching:** Firebase caching for repeated queries
- **Bundle Splitting:** Reduced initial load times
- **CDN Delivery:** Fast global content delivery

## 🔒 Security Considerations

- **API Key Protection:** Environment variable security
- **Input Validation:** Sanitized user inputs
- **HTTPS Only:** Secure data transmission
- **Firebase Rules:** Database access control
- **Content Security Policy:** XSS prevention

## 📈 Monitoring & Analytics

- **Firebase Analytics:** User engagement tracking
- **Error Reporting:** Automatic crash detection
- **Performance Monitoring:** Response time tracking
- **Usage Patterns:** Feature utilization analysis

## 🆘 Support & Documentation

- **Issues:** GitHub issue tracker
- **Discussions:** Community support forum
- **Documentation:** Comprehensive guides
- **API Reference:** Detailed technical docs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced medical AI capabilities
- **Firebase** for reliable backend infrastructure
- **React Team** for the excellent framework
- **Tailwind CSS** for beautiful, responsive design
- **Lucide** for modern iconography
- **Vite** for lightning-fast development

## 👨‍💻 Developer

**Created with ❤️ for better healthcare accessibility**

---

### 🔗 Links

- [Live Demo](https://vitashifa.vercel.app)
- [Documentation](https://docs.vitashifa.com)
- [API Reference](https://api.vitashifa.com)
- [Community](https://community.vitashifa.com)

### 📞 Emergency Numbers

**Remember:** VitaShifa is for information only
- **US/Canada:** 911
- **UK:** 999
- **EU:** 112
- **Australia:** 000

---

**⚕️ Always consult healthcare professionals for medical decisions. VitaShifa is your companion, not your doctor.**
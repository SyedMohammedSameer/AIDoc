# 🏥 MediAI Assistant

A comprehensive AI-powered medical information and assistance application built with React and Google's Gemini AI. This application provides intelligent medical guidance across multiple domains while maintaining strict safety protocols and medical disclaimers.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)

## ✨ Features

### 🔍 **Drug Information & Medical Q&A**
- Comprehensive drug information queries
- Medical condition explanations
- Treatment options and alternatives
- Medication interactions and side effects
- Symptom analysis and guidance

### 🖼️ **Medical Image Analysis**
- AI-powered analysis of medical images (X-rays, CT scans, MRIs)
- Skin condition assessment
- ECG interpretation
- Lab report analysis
- Detailed observation reports

### 🏃‍♂️ **Health Management & Wellness**
- Personalized health plans
- Chronic condition management
- Lifestyle recommendation engine
- Goal tracking and wellness advice
- Diet and exercise guidance

### 🚨 **Emergency First Aid Guidance**
- Step-by-step emergency procedures
- Immediate care instructions
- Safety-first protocols
- Critical situation management
- Professional help coordination

## 🛠️ Tech Stack

- **Frontend:** React 19.1.0 with TypeScript
- **Build Tool:** Vite 6.3.5
- **AI Engine:** Google Gemini AI (via @google/genai)
- **Styling:** Tailwind CSS (via CDN)
- **Icons:** Lucide React
- **Image Processing:** Base64 encoding for medical images

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Google Gemini API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SyedMohammedSameer/AIDoc.git
   cd mediai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to view the application.

## 🔧 Configuration

### API Key Setup

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or select an existing one
3. Generate an API key for Gemini
4. Add the key to your `.env.local` file as `GEMINI_API_KEY`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini AI API key | ✅ Yes |

## 📁 Project Structure

```
mediai-assistant/
├── public/
├── src/
│   ├── components/
│   │   ├── Alert.tsx           # Alert/notification component
│   │   ├── DrugInfoQA.tsx      # Drug information interface
│   │   ├── EmergencyFirstAid.tsx # Emergency guidance interface
│   │   ├── Footer.tsx          # Application footer
│   │   ├── HealthManagement.tsx # Health planning interface
│   │   ├── ImageUpload.tsx     # Medical image upload component
│   │   ├── LoadingSpinner.tsx  # Loading animation
│   │   ├── MedicalImageAnalysis.tsx # Image analysis interface
│   │   └── Navbar.tsx          # Navigation component
│   ├── services/
│   │   └── geminiService.ts    # Gemini AI integration
│   ├── App.tsx                 # Main application component
│   ├── constants.ts            # Application constants
│   ├── index.tsx              # Application entry point
│   └── types.ts               # TypeScript type definitions
├── .env.local                 # Environment variables (create this)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 Usage

### Drug Information
1. Navigate to the "Drug Info & Q/A" tab
2. Enter your medication or health question
3. Receive comprehensive information with sources

### Medical Image Analysis
1. Go to "Image Analysis" tab
2. Upload your medical image (JPEG, PNG, WebP, GIF)
3. Provide context or specific questions
4. Get detailed AI analysis and observations

### Health Management
1. Access "Health Management" tab
2. Fill out your health profile
3. Set your wellness goals
4. Receive personalized health recommendations

### Emergency Assistance
1. Use "Emergency Aid" tab for urgent situations
2. Describe the emergency situation
3. Get immediate first aid instructions
4. **Always call emergency services for serious situations**

## ⚠️ Important Disclaimers

### Medical Disclaimer
This AI tool provides information and suggestions for **educational purposes only**. It is **not a substitute** for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

### Emergency Disclaimer
**IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, CALL 911 OR YOUR LOCAL EMERGENCY NUMBER IMMEDIATELY.** This tool is not for emergency situations.

## 🔒 Safety Features

- **Comprehensive medical disclaimers** on every page
- **Emergency service reminders** for critical situations
- **Source attribution** with grounding information
- **Input validation** and error handling
- **Rate limiting** considerations for API usage

## 🏗️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🚀 Deployment

This application can be deployed to various platforms:

- **Vercel:** Connect your GitHub repository for automatic deployments
- **Netlify:** Drag and drop the `dist/` folder or connect via Git
- **AWS S3 + CloudFront:** Upload static files to S3 with CloudFront distribution
- **Google Cloud Storage:** Host static files with Cloud CDN

### Environment Variables for Production

Make sure to set your `GEMINI_API_KEY` in your deployment platform's environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing powerful AI capabilities
- **React Team** for the excellent framework
- **Tailwind CSS** for beautiful styling utilities
- **Vite** for fast development experience

## 👨‍💻 Developer

**Developed by Mohammed Sameer**

---

### 📞 Support

For support, please open an issue on GitHub or contact the development team.

### 🔗 Links

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

---

**⚕️ Remember: This application is for informational purposes only and should never replace professional medical consultation.**
# Smart Scribes

An AI-powered educational platform that enhances lecture experiences through intelligent summarization, Q&A generation, and interactive learning tools.

## 🚀 Project Overview

Smart Scribes is a comprehensive educational technology solution that leverages artificial intelligence to transform traditional lecture experiences. The platform provides students with enhanced learning tools including lecture summarization, intelligent Q&A generation, and interactive dashboards.

## 📁 Project Structure

```
Smart-Scribes/
├── Web-Application/           # Next.js web application
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── data/            # Mock data and configurations
│   │   ├── styles/          # CSS and styling
│   │   └── types/           # TypeScript type definitions
│   ├── pages/               # Next.js pages
│   └── package.json         # Dependencies and scripts
├── Model Training NoteBooks/ # Jupyter notebooks for ML model training
├── Python Codes/            # Python scripts and utilities
└── README.md               # This file
```

## 🛠️ Technology Stack

### Web Application
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hooks
- **Animation**: Framer Motion

### Backend & AI
- **Language**: Python
- **ML Frameworks**: (To be implemented)
- **Notebooks**: Jupyter

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Python (v3.8 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Smart-Scribes
   ```

2. **Install web application dependencies**
   ```bash
   cd Web-Application
   npm install
   ```

3. **Set up Python environment** (when implementing ML components)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Development

1. **Start the development server**
   ```bash
   cd Web-Application
   npm run dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Features

### Current Features
- **Responsive Web Interface**: Modern, accessible UI built with Next.js and Tailwind CSS
- **Component Library**: Comprehensive UI components using Radix UI
- **Student Dashboard**: Interactive learning interface
- **Lecture Navigation**: Organized content browsing
- **Q&A Generation**: AI-powered question and answer creation
- **Planning Mode**: Educational content planning tools

### Planned Features
- **AI-Powered Summarization**: Automatic lecture content summarization
- **Real-time Transcription**: Live lecture transcription capabilities
- **Interactive Chat**: AI-powered chat for student questions
- **Analytics Dashboard**: Learning progress tracking
- **Multi-language Support**: Internationalization capabilities

## 🏗️ Architecture

### Web Application
- **Frontend**: React with TypeScript for type safety
- **Routing**: Next.js App Router for modern routing
- **Styling**: Tailwind CSS with custom design system
- **Components**: Modular, reusable component architecture

### AI/ML Components (Planned)
- **Model Training**: Jupyter notebooks for ML model development
- **Python Backend**: RESTful APIs for AI services
- **Data Processing**: Efficient data pipeline for lecture content

## 📚 Documentation

- [Web Application README](Web-Application/README.md)
- [Component Guidelines](Web-Application/src/guidelines/Guidelines.md)
- [Attributions](Web-Application/src/Attributions.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Next.js](https://nextjs.org/) for the React framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `Web-Application/src/guidelines/` directory

## 🔮 Roadmap

### Phase 1: Foundation ✅
- [x] Web application setup
- [x] Component library implementation
- [x] Basic UI/UX design

### Phase 2: Core Features 🚧
- [ ] AI model integration
- [ ] Lecture summarization
- [ ] Q&A generation
- [ ] User authentication

### Phase 3: Advanced Features 📋
- [ ] Real-time transcription
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Mobile application

### Phase 4: Scale & Optimize 📋
- [ ] Performance optimization
- [ ] Advanced AI features
- [ ] Enterprise features
- [ ] API documentation

---

**Built with ❤️ for the future of education**

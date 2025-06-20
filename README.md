
# Mindful Couple Resolve

A safe, AI-powered platform for couples to share perspectives and find understanding through guided mediation. Built with React, TypeScript, and Supabase.

## 🚀 Key Features

🔒 **Private & Secure**: Anonymous sessions with automatic data cleanup  
🤝 **Dual Perspective**: Both partners share their viewpoints separately  
🤖 **AI Mediation**: Google Gemini provides thoughtful, balanced guidance  
⏱️ **Real-time Updates**: Live session synchronization  
📱 **Responsive Design**: Works on all devices  

## 🎯 How It Works

1. Partner 1 creates a session and shares the code
2. Both partners submit their perspectives privately
3. AI generates a personalized mediation response
4. Couples read the solution together

## 🏗️ How I Built It

### Architecture Overview

This application follows a modern full-stack architecture with a React frontend and Supabase backend, designed specifically for privacy and real-time collaboration.

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Backend**: Supabase (PostgreSQL database + Edge Functions)
- **AI**: Google Gemini 2.0 Flash API
- **Build Tool**: Vite
- **Deployment**: Vercel (frontend) + Supabase (backend)

### Key Technical Decisions

#### 1. **Session-Based Architecture**
Instead of user accounts, I implemented anonymous session codes:
- 6-character alphanumeric codes for easy sharing
- No permanent user data storage
- Automatic cleanup after 24 hours

```typescript
const generateSessionCode = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};
```

#### 2. **State Management Strategy**
Used React's built-in state management with a single view-based state machine:
- `ViewType`: Controls the entire application flow
- Prevents navigation issues and maintains clear state transitions
- Simplified debugging and testing

```typescript
type ViewType = 'home' | 'partner1-form' | 'partner2-form' | 'waiting' | 'solution';
```

#### 3. **Real-time Synchronization**
Implemented polling-based updates for Partner 1 waiting state:
- 3-second intervals to check for Partner 2 submission
- Automatic transition to solution generation
- Graceful error handling and cleanup

#### 4. **Privacy-First Database Design**
```sql
CREATE TABLE sessions (
  session_code TEXT PRIMARY KEY,
  partner1_name TEXT,
  partner1_perspective TEXT,
  partner2_name TEXT,
  partner2_perspective TEXT,
  solution TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Why no RLS policies?** Since sessions are anonymous and temporary, traditional user-based security wasn't needed. Instead, security comes from:
- Cryptographically random session codes
- Automatic data expiration
- No permanent storage of personal information

### AI Integration

#### Google Gemini Implementation
I chose Google Gemini 2.0 Flash for its:
- Superior relationship counseling capabilities
- Better understanding of emotional context
- More nuanced and empathetic responses

```typescript
const prompt = `You are an expert relationship counselor and mediator. 
Two partners in a relationship have shared their perspectives about a conflict. 
Please provide a thoughtful, balanced mediation response...`;
```

#### Edge Function Architecture
Used Supabase Edge Functions for AI processing:
- Keeps API keys secure on the server
- Handles CORS properly
- Provides better error handling and logging

### UI/UX Design Philosophy

#### Component Strategy
- **Single-file component approach**: All logic in one file for this simple app
- **Progressive disclosure**: Show only relevant information at each step
- **Emotional design**: Soft colors and reassuring messaging

#### Responsive Design
```css
/* Mobile-first approach with Tailwind */
<div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
```

#### Accessibility Considerations
- Semantic HTML structure
- Proper form labels and validation
- Color contrast compliance
- Keyboard navigation support

### Challenges Solved

#### 1. **Session Coordination**
**Problem**: How to coordinate two people joining the same session asynchronously?

**Solution**: 
- Partner 1 creates session and gets code immediately
- Partner 2 joins with validation
- Polling mechanism for real-time updates

#### 2. **AI Response Quality**
**Problem**: Generic AI responses weren't suitable for relationship counseling.

**Solution**: 
- Crafted detailed system prompts with specific instructions
- Included both perspectives with clear formatting
- Fine-tuned temperature and response parameters

#### 3. **Privacy vs Functionality**
**Problem**: Balancing user privacy with necessary data persistence.

**Solution**:
- Temporary sessions with automatic cleanup
- No user accounts or permanent profiles
- Anonymous session codes instead of user IDs

### Performance Optimizations

#### Frontend
- **Code splitting**: Lazy loading for better initial load times
- **Debounced API calls**: Prevent excessive polling
- **Optimistic UI updates**: Immediate feedback for user actions

#### Backend
- **Edge function caching**: Reduced cold starts
- **Database indexing**: Fast lookups by session_code
- **Connection pooling**: Efficient database connections

### Security Measures

#### Data Protection
- No permanent storage of personal information
- Automatic session expiration (24 hours)
- API keys secured in Supabase Edge Function environment

#### Input Validation
```typescript
if (!perspective.trim()) {
  setError('Please share your perspective');
  return;
}
```

#### CORS Configuration
Proper CORS headers for secure cross-origin requests in Edge Functions.

### Deployment Strategy

#### Environment Management
- **Development**: Local Supabase setup
- **Production**: Supabase cloud with environment variables
- **Secrets**: Google AI API key stored in Supabase secrets

#### Monitoring
- Supabase Edge Function logs for debugging
- Real-time error tracking
- Performance monitoring through Supabase dashboard

### Future Improvements

#### Technical Enhancements
- WebSocket implementation for true real-time updates
- Better caching strategies
- Progressive Web App (PWA) capabilities

#### Feature Additions
- Session history (with user consent)
- Multiple AI model options
- Video call integration
- Anonymous feedback system

### Lessons Learned

1. **Keep it simple**: Started with user accounts but realized anonymous sessions were better for this use case
2. **Privacy by design**: Built privacy considerations into the architecture from day one
3. **AI prompt engineering**: Spent significant time crafting the perfect counseling prompts
4. **User flow matters**: Multiple iterations on the session joining flow for optimal UX

### Code Structure

```
src/
├── components/
│   └── ui/          # shadcn/ui components
├── pages/
│   └── Index.tsx    # Main application logic
├── integrations/
│   └── supabase/    # Database client and types
└── hooks/           # Custom React hooks

supabase/
└── functions/
    └── generate-solution/  # AI mediation Edge Function
```

## 🔧 Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and add environment variables
4. Add Google AI API key to Supabase secrets
5. Run development server: `npm run dev`

## 🚀 Deployment

This app is deployed using:
- **Frontend**: Vercel
- **Backend**: Supabase (automatic)
- **Database**: Supabase PostgreSQL
- **Edge Functions**: Supabase (auto-deployed)

## 🔐 Privacy & Security

- Sessions automatically deleted after 24 hours
- No permanent user data storage
- Anonymous session codes for privacy
- All AI processing happens server-side

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome! Open an issue or reach out.

---

Built with ❤️ for healthier relationships

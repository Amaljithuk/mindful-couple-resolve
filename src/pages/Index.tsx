
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Shield, Clock, RefreshCw, Send, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Types
interface Session {
  session_code: string;
  partner1_name?: string;
  partner1_perspective?: string;
  partner2_name?: string;
  partner2_perspective?: string;
  solution?: string;
}

type ViewType = 'home' | 'partner1-form' | 'partner2-form' | 'waiting' | 'solution';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [inputSessionCode, setInputSessionCode] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [perspective, setPerspective] = useState<string>('');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate session code
  const generateSessionCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  // Start as Partner 1
  const startAsPartner1 = () => {
    const newSessionCode = generateSessionCode();
    setSessionCode(newSessionCode);
    setCurrentView('partner1-form');
    setError('');
  };

  // Join as Partner 2
  const joinAsPartner2 = () => {
    if (inputSessionCode.length !== 6) {
      setError('Please enter a valid 6-character session code');
      return;
    }
    setSessionCode(inputSessionCode.toUpperCase());
    setCurrentView('partner2-form');
    setError('');
  };

  // Copy session code to clipboard
  const copySessionCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Session code copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the code manually",
        variant: "destructive"
      });
    }
  };

  // Submit perspective (simulated - in real app would use Supabase)
  const submitPerspective = async (isPartner1: boolean) => {
    if (!perspective.trim()) {
      setError('Please share your perspective');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newSession: Session = {
        session_code: sessionCode,
        ...(isPartner1 ? {
          partner1_name: partnerName || 'Partner 1',
          partner1_perspective: perspective
        } : {
          partner2_name: partnerName || 'Partner 2',
          partner2_perspective: perspective
        })
      };

      setSession(newSession);

      if (isPartner1) {
        setCurrentView('waiting');
      } else {
        // Simulate both partners submitted - generate solution
        generateSolution();
      }

      toast({
        title: "Perspective submitted",
        description: isPartner1 ? "Waiting for your partner..." : "Generating solution..."
      });

    } catch (err) {
      setError('Failed to submit perspective. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate AI solution (simulated)
  const generateSolution = async () => {
    setLoading(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockSolution = `Thank you both for sharing your perspectives openly. 

**Summary of Both Viewpoints:**
Partner 1 feels heard and understood, seeking connection and resolution. Partner 2 also values communication and wants to find common ground.

**Common Ground:**
Both partners care deeply about your relationship and want to resolve this constructively.

**Suggested Steps for Resolution:**
1. **Take 5 minutes** each to listen without interrupting
2. **Use "I" statements** when expressing feelings
3. **Find one small action** each person can take today
4. **Schedule a follow-up** conversation in 24 hours
5. **Practice gratitude** by sharing one thing you appreciate about each other

Remember: Healthy relationships require ongoing effort from both partners. Consider this a step forward in your journey together.`;

      setSession(prev => prev ? { ...prev, solution: mockSolution } : null);
      setCurrentView('solution');

      toast({
        title: "Solution generated",
        description: "Your personalized mediation is ready"
      });

    } catch (err) {
      setError('Failed to generate solution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start over
  const startOver = () => {
    setCurrentView('home');
    setSessionCode('');
    setInputSessionCode('');
    setPartnerName('');
    setPerspective('');
    setSession(null);
    setError('');
    setCopied(false);
  };

  // Render different views
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Heart className="h-16 w-16 text-pink-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                Mindful Couple Resolve
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A safe space for couples to share perspectives and find understanding through AI-guided mediation
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="border-blue-200 hover:border-blue-300 transition-colors">
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <CardTitle className="text-blue-700">Start as Partner 1</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-sm text-gray-600">Begin a new session and get a code to share with your partner</p>
                  <Button onClick={startAsPartner1} className="w-full bg-blue-500 hover:bg-blue-600">
                    Create New Session
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-pink-200 hover:border-pink-300 transition-colors">
                <CardHeader className="text-center">
                  <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <CardTitle className="text-pink-700">Join as Partner 2</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">Enter the session code your partner shared</p>
                  <Input
                    placeholder="Enter 6-character code"
                    value={inputSessionCode}
                    onChange={(e) => setInputSessionCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center font-mono text-lg"
                  />
                  <Button onClick={joinAsPartner2} className="w-full bg-pink-500 hover:bg-pink-600">
                    Join Session
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Tips Section */}
            <Card className="max-w-2xl mx-auto border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Tips for Healthy Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use "I" statements instead of "you" statements</li>
                  <li>• Listen to understand, not to respond</li>
                  <li>• Avoid blame and focus on feelings</li>
                  <li>• Take breaks if emotions get too high</li>
                  <li>• Remember you're a team working toward solutions</li>
                </ul>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Alert className="max-w-2xl mx-auto">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your inputs are processed securely and deleted after your session or within 24 hours. 
                We prioritize your privacy and confidentiality.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 'partner1-form':
      case 'partner2-form':
        const isPartner1 = currentView === 'partner1-form';
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                Session Code: {sessionCode}
              </Badge>
              <h2 className="text-2xl font-bold text-gray-800">
                {isPartner1 ? 'Partner 1' : 'Partner 2'} - Share Your Perspective
              </h2>
              <p className="text-gray-600 mt-2">
                {isPartner1 
                  ? 'Start by sharing your side of the situation. Your partner will join with the session code above.'
                  : 'Share your perspective to complete the session. Both viewpoints will be considered equally.'
                }
              </p>
            </div>

            {isPartner1 && (
              <Card className="border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Copy className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Share this code with your partner:</span>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={sessionCode} 
                      readOnly 
                      className="font-mono text-lg text-center bg-blue-50" 
                    />
                    <Button onClick={copySessionCode} variant="outline" size="icon">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Name or Nickname (Optional)
                  </label>
                  <Input
                    placeholder="How would you like to be referred to?"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Perspective <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Share your side of the situation. What happened? How do you feel? What would help resolve this?"
                    value={perspective}
                    onChange={(e) => setPerspective(e.target.value)}
                    rows={6}
                    maxLength={1000}
                    className="resize-none"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {perspective.length}/1000 characters
                  </div>
                </div>

                <Button 
                  onClick={() => submitPerspective(isPartner1)} 
                  disabled={loading || !perspective.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Perspective
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <Button variant="ghost" onClick={startOver}>
                Start Over
              </Button>
            </div>
          </div>
        );

      case 'waiting':
        return (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="animate-pulse">
              <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Waiting for Partner 2</h2>
            <p className="text-gray-600">
              Share this session code with your partner so they can join and submit their perspective.
            </p>
            
            <Card className="border-blue-200">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 mb-2">Session Code</div>
                <div className="flex gap-2 justify-center">
                  <div className="font-mono text-2xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded">
                    {sessionCode}
                  </div>
                  <Button onClick={copySessionCode} variant="outline" size="icon">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-500">
              Once your partner submits their perspective, we'll generate a personalized solution for both of you.
            </div>

            <Button variant="ghost" onClick={startOver}>
              Start Over
            </Button>
          </div>
        );

      case 'solution':
        return (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <Heart className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Your Personalized Solution</h2>
              <Badge variant="outline" className="mt-2">Session: {sessionCode}</Badge>
            </div>

            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {session?.solution}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Heart className="h-4 w-4" />
              <AlertDescription>
                Take time to discuss this solution together. Remember, healthy relationships require ongoing effort and communication from both partners.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <Button onClick={startOver} className="bg-green-500 hover:bg-green-600">
                Start New Session
              </Button>
              <div>
                <Button variant="ghost" size="sm">
                  Share Feedback (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {renderView()}
      </div>
    </div>
  );
};

export default Index;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { Teacher } from '@/types';
import { Loader2 } from 'lucide-react';

// Mock data for teachers (in a real app, this would come from a database)
const ALLOWED_TEACHERS: Teacher[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@example.com', photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', name: 'Jane Doe', email: 'jane.doe@example.com', photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', name: 'Robert Johnson', email: 'robert.johnson@example.com', photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '4', name: 'Emily Davis', email: 'emily.davis@example.com', photoUrl: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '5', name: 'Michael Wilson', email: 'michael.wilson@example.com', photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

const TeacherLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize Google API client
  useEffect(() => {
    // Load the Google API client
    const loadGoogleScript = () => {
      const existingScript = document.getElementById('google-gsi-client');
      if (existingScript) {
        // If script already exists, initialize directly
        initializeGoogleAuth();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        setIsInitializing(false);
        toast({
          title: "Google Sign-In Unavailable",
          description: "Could not load Google authentication services. Please try again later or use demo login.",
          variant: "destructive"
        });
      };
      document.body.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      // Check if Google Identity Services API is loaded properly
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            // Updated Google Client ID
            client_id: '264480608260-b55o6itaj0pbsh35qiasdb51qlr1bubg.apps.googleusercontent.com',
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            // Use the modern behavior compatible with FedCM
            use_fedcm_for_prompt: true
          });
          
          setIsInitializing(false);
        } catch (error) {
          console.error('Error initializing Google Identity Services:', error);
          setIsInitializing(false);
          toast({
            title: "Authentication Error",
            description: "There was a problem initializing Google Sign-In.",
            variant: "destructive"
          });
        }
      } else {
        console.error('Google Identity Services failed to load properly');
        setIsInitializing(false);
        toast({
          title: "Google Sign-In Unavailable",
          description: "Could not initialize Google authentication services. Try again later.",
          variant: "destructive"
        });
      }
    };

    loadGoogleScript();

    return () => {
      // Cleanup function to cancel any Google API processes when component unmounts
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [toast]);

  const handleGoogleResponse = (response: any) => {
    console.log('Google response received:', response);
    setLoading(true);
    
    try {
      // Decode the JWT token to get user information
      const payload = decodeJwtResponse(response.credential);
      console.log('Decoded payload:', payload);
      
      // In a real application, we would validate this user against our database
      // For this demo, we'll check if the email matches any of our allowed teachers
      const matchedTeacher = ALLOWED_TEACHERS.find(
        teacher => teacher.email.toLowerCase() === payload.email.toLowerCase()
      );
      
      if (matchedTeacher) {
        // Save teacher info and token to localStorage
        localStorage.setItem('teacherInfo', JSON.stringify({
          ...matchedTeacher,
          photoUrl: payload.picture || matchedTeacher.photoUrl // Use Google profile picture if available
        }));
        
        // Store auth credentials for Google API calls
        localStorage.setItem('googleAuthCredentials', JSON.stringify({
          token: response.credential,
          expires: Date.now() + 3600000 // 1 hour expiry
        }));
        
        toast({
          title: "Login Successful",
          description: `Welcome, ${matchedTeacher.name}!`,
        });
        
        navigate('/teacher-dashboard');
      } else {
        // Not an authorized teacher
        toast({
          title: "Access Denied",
          description: "You are not authorized as a teacher in this system.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing Google login:', error);
      toast({
        title: "Login Failed",
        description: "There was a problem logging you in. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const decodeJwtResponse = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      throw new Error('Failed to decode authentication token');
    }
  };

  const handleLoginClick = () => {
    setLoading(true);
    
    if (window.google?.accounts?.id) {
      try {
        // Modern approach using the FedCM-compatible method
        // This replaces the deprecated notification.isNotDisplayed() and notification.isSkippedMoment()
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isDisplayMoment?.()) {
            console.log('Google Sign-In prompt is displayed');
            setLoading(false);
          } else {
            console.log('Google Sign-In prompt was not displayed', notification);
            // If Google Sign-In prompt fails to display, fall back to demo login
            handleDemoLogin();
          }
        });
      } catch (error) {
        console.error('Error with Google prompt:', error);
        handleDemoLogin();
      }
    } else {
      // Fallback for when Google API doesn't load properly
      console.warn('Google authentication not available, falling back to demo login');
      handleDemoLogin();
    }
  };
  
  // Fallback demo login
  const handleDemoLogin = () => {
    setLoading(true);
    
    // Randomly select a teacher from the allowed list
    const randomTeacher = ALLOWED_TEACHERS[Math.floor(Math.random() * ALLOWED_TEACHERS.length)];
    
    // Save teacher info to localStorage
    localStorage.setItem('teacherInfo', JSON.stringify(randomTeacher));
    
    toast({
      title: "Demo Login",
      description: `Welcome, ${randomTeacher.name}! (Demo Mode)`,
    });
    
    setTimeout(() => {
      setLoading(false);
      navigate('/teacher-dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Teacher Login</CardTitle>
            <CardDescription>
              Sign in with your Google account to manage your teaching schedule
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Button
                className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-google-dark-gray"
                onClick={handleLoginClick}
                disabled={loading || isInitializing}
              >
                {loading || isInitializing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                )}
                {isInitializing ? "Loading Google Sign-In..." : "Continue with Google"}
              </Button>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                Note: Only authorized teachers can log in (maximum 5 teachers).
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Calendar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Add the Google Account type to Window interface
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (params: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
          storeCredential: (credential: any, callback: () => void) => void;
          cancel: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

export default TeacherLogin;

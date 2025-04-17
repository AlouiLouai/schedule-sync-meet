
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Teacher } from '@/types';

// Mock data for teachers (in a real app, this would come from a database)
const ALLOWED_TEACHERS: Teacher[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@example.com', photoUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: '2', name: 'Jane Doe', email: 'jane.doe@example.com', photoUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: '3', name: 'Robert Johnson', email: 'robert.johnson@example.com', photoUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '4', name: 'Emily Davis', email: 'emily.davis@example.com', photoUrl: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { id: '5', name: 'Michael Wilson', email: 'michael.wilson@example.com', photoUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

interface UseGoogleAuthResult {
  loading: boolean;
  isInitializing: boolean;
  handleLoginClick: () => void;
  handleDemoLogin: () => void;
}

export const useGoogleAuth = (onLoginSuccess: (teacher: Teacher) => void): UseGoogleAuthResult => {
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
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
            // Use the confirmed Google Client ID
            client_id: '264480608260-b55o6itaj0pbsh35qiasdb51qlr1bubg.apps.googleusercontent.com',
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            // Explicitly opt-in to FedCM
            use_fedcm: true
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
        const teacherWithPhoto = {
          ...matchedTeacher,
          photoUrl: payload.picture || matchedTeacher.photoUrl // Use Google profile picture if available
        };
        
        localStorage.setItem('teacherInfo', JSON.stringify(teacherWithPhoto));
        
        // Store auth credentials for Google API calls
        localStorage.setItem('googleAuthCredentials', JSON.stringify({
          token: response.credential,
          expires: Date.now() + 3600000 // 1 hour expiry
        }));
        
        toast({
          title: "Login Successful",
          description: `Welcome, ${matchedTeacher.name}!`,
        });
        
        onLoginSuccess(teacherWithPhoto);
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
        // Using the new FedCM-compatible method
        window.google.accounts.id.prompt((notification: any) => {
          // Don't rely on isDisplayMoment or isSkippedMoment for UI updates
          // as these may not work in the future with FedCM
          console.log('Google Sign-In prompt notification:', notification);
          
          // Check for other notification types that will still be available
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google Sign-In prompt was not displayed or was skipped');
            setLoading(false);
            
            // If Google Sign-In prompt fails to display, fall back to demo login
            if (notification.getNotDisplayedReason() || notification.getSkippedReason()) {
              console.log('Reason:', 
                notification.getNotDisplayedReason() || 
                notification.getSkippedReason()
              );
              
              toast({
                title: "Google Sign-In Unavailable",
                description: "Please try using demo login instead.",
                variant: "destructive"
              });
            }
          } else if (notification.isDismissedMoment()) {
            console.log('Google Sign-In prompt was dismissed');
            setLoading(false);
          } else {
            // For other notification types, just log and continue
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error with Google prompt:', error);
        setLoading(false);
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
      onLoginSuccess(randomTeacher);
    }, 1500);
  };

  return {
    loading,
    isInitializing,
    handleLoginClick,
    handleDemoLogin
  };
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


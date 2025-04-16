
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import { Teacher } from '@/types';

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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    // In a real application, this would authenticate with Google OAuth
    // For this demo, we'll simulate successful login after a short delay
    
    setTimeout(() => {
      // Randomly select a teacher from the allowed list
      const randomTeacher = ALLOWED_TEACHERS[Math.floor(Math.random() * ALLOWED_TEACHERS.length)];
      
      // Save teacher info to localStorage (in a real app, use a more secure method)
      localStorage.setItem('teacherInfo', JSON.stringify(randomTeacher));
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${randomTeacher.name}!`,
      });
      
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
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Continue with Google</span>
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

export default TeacherLogin;

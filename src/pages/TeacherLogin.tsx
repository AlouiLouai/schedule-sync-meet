
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Teacher } from '@/types';

const TeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoginSuccess = (teacher: Teacher) => {
    navigate('/teacher-dashboard');
  };

  const { loading, isInitializing, handleLoginClick, handleDemoLogin } = useGoogleAuth(handleLoginSuccess);

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
              <GoogleSignInButton 
                onClick={handleLoginClick}
                loading={loading}
                disabled={isInitializing}
                text={isInitializing ? "Loading Google Sign-In..." : "Continue with Google"}
              />
              
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

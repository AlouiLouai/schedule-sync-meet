
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  isTeacher?: boolean;
  teacherName?: string;
  teacherPhoto?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isTeacher = false, 
  teacherName, 
  teacherPhoto,
  onLogout 
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-google-blue" />
            <span className="text-xl font-medium text-google-dark-gray">ScheduleSync</span>
          </Link>
        </div>
        
        {isMobile ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            {isMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-md animate-fade-in">
                <nav className="container py-4 px-6">
                  <ul className="space-y-3">
                    <li>
                      <Link 
                        to="/" 
                        className={cn(
                          "flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-google-light-gray transition-colors",
                          location.pathname === "/" && "bg-google-light-gray text-google-blue"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Calendar className="w-5 h-5" />
                        <span>Calendar</span>
                      </Link>
                    </li>
                    {isTeacher ? (
                      <>
                        <li>
                          <Link 
                            to="/teacher-dashboard" 
                            className={cn(
                              "flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-google-light-gray transition-colors",
                              location.pathname === "/teacher-dashboard" && "bg-google-light-gray text-google-blue"
                            )}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <User className="w-5 h-5" />
                            <span>Dashboard</span>
                          </Link>
                        </li>
                        <li>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (onLogout) onLogout();
                              setIsMenuOpen(false);
                            }}
                          >
                            Sign Out
                          </Button>
                        </li>
                      </>
                    ) : (
                      <li>
                        <Link 
                          to="/teacher-login" 
                          className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-google-light-gray transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="w-5 h-5" />
                          <span>Teacher Login</span>
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-4">
            {isTeacher ? (
              <>
                <div className="flex items-center space-x-2">
                  {teacherPhoto ? (
                    <img 
                      src={teacherPhoto} 
                      alt={teacherName || "Teacher"} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 bg-google-blue text-white rounded-full">
                      {teacherName ? teacherName.charAt(0).toUpperCase() : "T"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-google-dark-gray">{teacherName}</span>
                </div>
                <Button 
                  variant="ghost" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={onLogout}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/teacher-login">
                <Button>Teacher Login</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@clerk/clerk-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Use Clerk user metadata for theme preference
        const userTheme = user?.publicMetadata?.theme || user?.unsafeMetadata?.theme;
        const newTheme = userTheme || localStorage.getItem('theme-preference') || 'light';
        setTheme(newTheme);
        applyThemeToDOM(newTheme);
      } catch (error) {
        const storedTheme = localStorage.getItem('theme-preference') || 'light';
        setTheme(storedTheme);
        applyThemeToDOM(storedTheme);
      }
    };
    loadTheme();
  }, [user]);

  const applyThemeToDOM = (themeToApply) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeToApply);
  };

  const handleThemeChange = async (newTheme) => {
    setIsLoading(true);
    setTheme(newTheme);
    applyThemeToDOM(newTheme);

    try {
      await User.updateMyUserData({ theme: newTheme });
    } catch (error) {
      localStorage.setItem('theme-preference', newTheme);
    }
    
    setIsLoading(false);
  };

  const getThemeIcon = () => {
    if (isLoading) {
      return <Sparkles className="w-4 h-4 animate-pulse" />;
    }
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const getThemeColor = (themeType) => {
    switch (themeType) {
      case 'light':
        return 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-950/20 dark:hover:to-orange-950/20';
      case 'dark':
        return 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-950/20 dark:hover:to-blue-950/20';
      default:
        return 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20';
    }
  };

  const getActiveColor = (themeType) => {
    if (theme === themeType) {
      switch (themeType) {
        case 'light':
          return 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-950/40 dark:to-orange-950/40 text-yellow-700 dark:text-yellow-300';
        case 'dark':
          return 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-950/40 dark:to-blue-950/40 text-purple-700 dark:text-purple-300';
      }
    }
    return '';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative text-purple-600 dark:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20 rounded-2xl transition-all duration-200`}
          disabled={isLoading}
        >
          <div className={`transition-all duration-200 ${isLoading ? 'scale-110' : 'hover:scale-110'}`}>
            {getThemeIcon()}
          </div>
          {isLoading && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#e574bc]/20 to-[#ea84c9]/20 animate-pulse"></div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-purple-200/50 dark:border-purple-700/50 rounded-2xl shadow-2xl shadow-purple-500/10 p-2 min-w-[160px]">
        <DropdownMenuItem 
          onClick={() => handleThemeChange('light')}
          className={`rounded-xl transition-all duration-200 cursor-pointer ${getThemeColor('light')} ${getActiveColor('light')}`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-all duration-200 ${
            theme === 'light' 
              ? 'bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-800/40 dark:to-orange-800/40 shadow-lg' 
              : 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30'
          }`}>
            <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-yellow-600' : 'text-yellow-500'}`} />
          </div>
          <span className="font-medium">Light</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleThemeChange('dark')}
          className={`rounded-xl transition-all duration-200 cursor-pointer ${getThemeColor('dark')} ${getActiveColor('dark')}`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-all duration-200 ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800/40 dark:to-blue-800/40 shadow-lg' 
              : 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30'
          }`}>
            <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-600' : 'text-purple-500'}`} />
          </div>
          <span className="font-medium">Dark</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
import React from 'react';
import { User } from '@/types/messages';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface MessagesHeaderProps {
  otherUser: User;
  isBlockedByMe: boolean;
  isBlockingMe: boolean;
  onBack: () => void;
}

export const MessagesHeader: React.FC<MessagesHeaderProps> = ({ 
  otherUser, 
  isBlockedByMe, 
  isBlockingMe,
  onBack 
}) => {
  return (
    <div className="p-6 border-b border-[hsl(var(--border))] glass-strong flex justify-between items-center">
      <div className="flex items-center gap-4">
            <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden rounded-full" 
            onClick={onBack}
            >
            <ArrowLeft className="w-5 h-5" />
            </Button>
        <div className="relative">
          <img 
            src={otherUser.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.full_name)}&background=6169A7&color=fff&size=40`}
            alt={otherUser.full_name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-[hsl(var(--border))] shadow-md"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[hsl(var(--success))] rounded-full border-2 border-[hsl(var(--card))] shadow-sm"></div>
        </div>
        <div>
          <h2 className="font-bold text-lg text-[hsl(var(--foreground))]">{otherUser.full_name}</h2>
          <div className="text-sm text-[hsl(var(--success))] font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-[hsl(var(--success))] rounded-full animate-pulse"></div>
            Online
          </div>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-[hsl(var(--muted))]">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass-strong border-[hsl(var(--border))] rounded-2xl">
          <DropdownMenuItem className="rounded-xl">View Profile</DropdownMenuItem>
          <DropdownMenuItem className="text-[hsl(var(--destructive))] rounded-xl">
            {isBlockedByMe ? 'Unblock User' : 'Block User'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
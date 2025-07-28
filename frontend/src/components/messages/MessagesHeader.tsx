import React from 'react';
import { Conversation, User } from '@/types/messages';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { User as UserIcon, Phone, Video } from 'lucide-react';

export interface MessagesHeaderProps {
  currentUser: User | null;
  otherUser: User | null;
  onBack: () => void;
  conversation: Conversation & { participants: User[] };
}

export const MessagesHeader = ({
  currentUser,
  otherUser,
  onBack,
  conversation
}: MessagesHeaderProps) => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="md:hidden text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          {otherUser?.profile_image ? (
            <img 
              src={otherUser.profile_image}
              className="w-8 h-8 rounded-full"
              alt={otherUser.full_name}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          
          <div>
            <h2 className="font-semibold">{otherUser?.full_name || 'Unknown'}</h2>
            <p className="text-sm text-muted-foreground">
              {conversation.last_message?.content || 'No messages yet'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
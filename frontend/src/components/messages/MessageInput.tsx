import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, ShieldOff } from 'lucide-react';

interface MessageInputProps {
  value: string;
  disabled: boolean;
  isSending: boolean;
  isBlocked: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  disabled,
  isSending,
  isBlocked,
  onChange,
  onSend,
  onKeyPress
}) => {
  if (isBlocked) {
    return (
      <div className="text-center text-sm text-[hsl(var(--muted-foreground))] p-4 bg-[hsl(var(--destructive)/0.1)] rounded-2xl border border-[hsl(var(--destructive))]">
        <ShieldOff className="w-6 h-6 mx-auto mb-3 text-[hsl(var(--destructive))]" />
        <div className="font-medium">You cannot reply to this conversation.</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Input 
        placeholder="Type your message..."
        className="flex-1 bg-[hsl(var(--card)/0.7)] border-[hsl(var(--border))] rounded-2xl px-4 py-3 backdrop-blur-sm focus-brand transition-brand"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        disabled={disabled}
      />
      <Button 
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="btn-gradient rounded-2xl px-6 py-3 shadow-[var(--shadow-brand)] hover:shadow-[var(--shadow-brand-lg)] transition-brand disabled:opacity-50"
      >
        {isSending ? (
          <Loader2 className="w-5 h-5 animate-spin"/>
        ) : (
          <Send className="w-5 h-5"/>
        )}
      </Button>
    </div>
  );
};
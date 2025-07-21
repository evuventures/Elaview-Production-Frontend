import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const MobileSearchBar = ({ searchTerm, setSearchTerm, onAISearch }) => {
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search properties, areas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-xl px-4 py-2 text-sm"
        />
        <Button
          variant="default"
          onClick={onAISearch}
          className="rounded-xl px-3 py-2"
          title="Search with AI"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MobileSearchBar;

import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface FilterBarProps {
  items: string[];
  selected: string;
  onSelect: (item: string) => void;
}

export function FilterBar({ items, selected, onSelect }: FilterBarProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className={cn(
              'inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              selected === item
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}

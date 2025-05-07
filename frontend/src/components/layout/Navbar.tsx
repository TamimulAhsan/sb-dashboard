
import React from 'react';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NavbarProps {
  onMenuButtonClick: () => void;
}

export function Navbar({ onMenuButtonClick }: NavbarProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuButtonClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      
      <div className="relative max-w-md w-full hidden md:block">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full pl-8 bg-background"
        />
      </div>
      
      <div className="flex items-center gap-4">
        {/* Notification bell removed */}
      </div>
    </header>
  );
}

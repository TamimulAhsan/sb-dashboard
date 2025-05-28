import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ChartBar,
  Package,
  ShoppingCart,
  User,
  Store,
  LogOut
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

function SidebarLink({ to, icon, children, onClick }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
          'hover:bg-sidebar-accent',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground'
        )
      }
      onClick={onClick}
    >
      <div className="w-5 h-5">{icon}</div>
      <span>{children}</span>
    </NavLink>
  );
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const isMobile = useIsMobile();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('users/profile/');
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const closeSidebarOnMobile = () => {
    if (isMobile) setOpen(false);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'bg-sidebar text-sidebar-foreground flex flex-col w-64 lg:w-72 h-full transition-all duration-300 ease-in-out z-30',
          isMobile ? 'fixed left-0 top-0 bottom-0' : 'relative',
          isMobile && !open && '-translate-x-full'
        )}
      >
        <div className="p-4 border-b border-sidebar-border flex items-center justify-center h-16">
          <h1 className="text-xl font-bold text-sidebar-foreground">Business Dashboard</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hidden">
          <SidebarLink to="/" icon={<LayoutDashboard size={20} />} onClick={closeSidebarOnMobile}>
            Overview
          </SidebarLink>
          <SidebarLink to="/analytics" icon={<ChartBar size={20} />} onClick={closeSidebarOnMobile}>
            Analytics
          </SidebarLink>
          <SidebarLink to="/orders" icon={<ShoppingCart size={20} />} onClick={closeSidebarOnMobile}>
            Orders
          </SidebarLink>
          <SidebarLink to="/products" icon={<Package size={20} />} onClick={closeSidebarOnMobile}>
            Products
          </SidebarLink>
          <SidebarLink to="/store-info" icon={<Store size={20} />} onClick={closeSidebarOnMobile}>
            Store Info
          </SidebarLink>
          <SidebarLink to="/profile" icon={<User size={20} />} onClick={closeSidebarOnMobile}>
            Profile
          </SidebarLink>
        </nav>

        <div className="p-4 border-t border-sidebar-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
              <User size={16} className="text-sidebar-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-xs opacity-70">{profile?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="bg-blue-700 hover:bg-blue-100 text-white"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    </>
  );
}

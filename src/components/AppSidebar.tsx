import React, { useState } from 'react';
import { MessageSquare, Settings, History, Plus, Home, Search, ChevronDown, ChevronRight, Star, Calendar, Building, Sparkles } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  { title: 'Chat', url: '/dashboard', icon: MessageSquare },
  { title: 'History', url: '/dashboard/history', icon: History },
  { title: 'Search', url: '/dashboard/search', icon: Search },
];

const bottomItems = [
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

interface AppSidebarProps {
  onNewChat?: () => void;
  userData?: any;
}

export function AppSidebar({ onNewChat, userData }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-accent text-accent-foreground font-medium' 
      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground';

  const getServiceIcon = (serviceType: string) => {
    const type = serviceType.toLowerCase();
    if (type.includes('clean')) return '🧹';
    if (type.includes('repair')) return '🔧';
    if (type.includes('plumb')) return '🚿';
    if (type.includes('electric')) return '⚡';
    if (type.includes('garden')) return '🌿';
    return '🏠';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-80'} collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 relative">
          <SidebarTrigger className="absolute top-4 right-4 w-6 h-6" />
          
          {!collapsed && (
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">Ikiru</h1>
              </div>
            </div>
          )}
          
          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className={`w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl border border-input hover:bg-accent hover:text-accent-foreground transition-colors ${
              collapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span className="font-medium">New Chat</span>}
          </button>
        </div>

        {/* Main Navigation */}
        <div className="px-6">
          <SidebarGroup className="flex-1">
            {!collapsed && <SidebarGroupLabel className="px-0">Navigation</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === '/dashboard'}
                        className={getNavCls({ isActive: isActive(item.url) })}
                      >
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Recent Services Section */}
        {!collapsed && (
          <div className="px-6 mb-6">
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span>Recent Services</span>
              {isHistoryExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {isHistoryExpanded && (
              <div className="mt-3 space-y-3">
                {userData?.service_history && userData.service_history.length > 0 ? (
                  userData.service_history.slice(0, 3).map((booking: any, index: number) => (
                    <div 
                      key={index} 
                      className="p-4 bg-card rounded-xl border hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg mt-1">
                          {getServiceIcon(booking.service_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-primary capitalize truncate group-hover:text-primary/80 transition-colors">
                            {booking.service_type}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(booking.date)}
                          </p>
                          {booking.notes && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {booking.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground mb-1">No services yet</p>
                    <p className="text-xs text-muted-foreground">Book your first service to get started</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="px-6 mb-6">
          {!collapsed && (
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
          )}
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              {!collapsed && <span>Book New Service</span>}
            </button>
            
            {!collapsed && (
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                <Star className="w-4 h-4" />
                <span>Rate Last Service</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Items */}
        <div className="mt-auto px-6">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className={getNavCls({ isActive: isActive(item.url) })}
                      >
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
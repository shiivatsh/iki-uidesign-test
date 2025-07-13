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
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 relative">
          <SidebarTrigger className="absolute top-2 right-2 w-6 h-6" />
          {!collapsed && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <h2 className="font-semibold text-lg">Ikiru</h2>
            </div>
          )}
          
          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors ${
              collapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="flex-1">
          {!collapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
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

        {/* Recent Services Section */}
        {!collapsed && (
          <SidebarGroup>
            <button
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span>Recent Services</span>
              {isHistoryExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
            
            {isHistoryExpanded && (
              <SidebarGroupContent>
                <div className="space-y-2 px-3">
                  {userData?.service_history && userData.service_history.length > 0 ? (
                    userData.service_history.slice(0, 3).map((booking: any, index: number) => (
                      <div 
                        key={index} 
                        className="p-2 bg-card rounded-lg border hover:bg-accent transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start space-x-2">
                          <div className="text-sm mt-0.5">
                            {getServiceIcon(booking.service_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-foreground capitalize truncate">
                              {booking.service_type}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(booking.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center">
                      <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No services yet</p>
                    </div>
                  )}
                </div>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}

        {/* Quick Actions */}
        <SidebarGroup className="mt-auto">
          {!collapsed && <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>}
          <SidebarGroupContent>
            <div className="space-y-2 px-3">
              <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                {!collapsed && <span>Book Service</span>}
              </button>
              
              {!collapsed && (
                <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <Star className="w-4 h-4" />
                  <span>Rate Service</span>
                </button>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Items */}
        <SidebarGroup className="mt-auto">
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
      </SidebarContent>
    </Sidebar>
  );
}
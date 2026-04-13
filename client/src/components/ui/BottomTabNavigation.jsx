import React, { useState, useEffect, createContext, useContext, useId } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../AppIcon';
import { useAuthStore, usePinStore } from '../../store/index.js';
import ExpenslyLogo from '../ExpenslyLogo.jsx';

export const SidebarContext = createContext({ collapsed: false });
export const useSidebar = () => useContext(SidebarContext);

const STORAGE_KEY = 'expensly-sb-collapsed';


const NAV_GROUPS = [
  { label: 'Main', items: [
    { path: '/dashboard',         icon: 'LayoutDashboard', label: 'Dashboard'    },
    { path: '/transactions-list', icon: 'Receipt',         label: 'Transactions' },
    { path: '/reports-analytics', icon: 'BarChart3',       label: 'Reports'      },
  ]},
  { label: 'Finance', items: [
    { path: '/wallets', icon: 'Wallet',    label: 'Wallets' },
    { path: '/budgets', icon: 'PieChart',  label: 'Budgets' },
    { path: '/goals',   icon: 'Target',    label: 'Goals'   },
    { path: '/debts',   icon: 'Handshake', label: 'Debts'   },
    { path: '/recurring', icon: 'RefreshCw',  label: 'Recurring' },
  ]},
  { label: 'Tools', items: [
    { path: '/statistics', icon: 'PieChart',  label: 'Statistics' },
    { path: '/calendar',   icon: 'Calendar',  label: 'Calendar'   },
  ]},
  { label: 'Account', items: [
    { path: '/settings', icon: 'Settings', label: 'Settings' },
  ]},
];

const MOBILE_MAIN = [
  { path: '/dashboard',         icon: 'LayoutDashboard', label: 'Home'         },
  { path: '/transactions-list', icon: 'Receipt',         label: 'Transactions' },
  { path: '/reports-analytics', icon: 'BarChart3',       label: 'Reports'      },
  { path: '/wallets',           icon: 'Wallet',          label: 'Wallets'      },
  { path: '/settings',          icon: 'Settings',        label: 'Settings'     },
];

const getSaved = () => { try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; } };

export default function BottomTabNavigation({ className = '' }) {
  const location   = useLocation();
  const navigate   = useNavigate();
  const user       = useAuthStore(s => s.user);
  const logout     = useAuthStore(s => s.logout);
  const lockNow    = usePinStore(s => s.lockNow);
  const pinEnabled = usePinStore(s => s.pinEnabled);
  const [collapsed, setCollapsed] = useState(getSaved);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, String(collapsed)); } catch {} }, [collapsed]);

  const isActive     = (path) => location.pathname === path;
  const handleLogout = async () => { await logout(); navigate('/'); };
  const toggle       = () => setCollapsed(v => !v);
  const SIDEBAR_W    = collapsed ? 64 : 256;

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 bg-card/97 backdrop-blur-xl border-t border-border z-50 ${className}`}>
        <div className="flex items-center justify-around px-1 py-1">
          {MOBILE_MAIN.map(item => {
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path}
                className={`relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all rounded-xl mx-0.5 ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {active && <motion.div layoutId="mob-active" className="absolute inset-0 bg-primary/8 rounded-xl" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                <Icon name={item.icon} size={19} className="relative z-10" />
                <span className="text-[9px] mt-0.5 font-semibold truncate relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: SIDEBAR_W }} initial={false}
        transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 bg-card border-r border-border z-50 flex-col overflow-hidden ${className}`}
      >
        {/* Logo — identical to login page */}
        <div className="h-16 flex items-center border-b border-border flex-shrink-0 px-3 overflow-hidden">
          <Link to="/dashboard" className={`flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex-shrink-0"><ExpenslyLogo size={34} /></div>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16 }}
                  className="text-[15px] font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent whitespace-nowrap overflow-hidden truncate">
                  Expensly
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                    className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.14em] px-2.5 mb-1.5">
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = isActive(item.path);
                  return (
                    <Link key={`${group.label}-${item.path}`} to={item.path} title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all text-sm font-medium overflow-hidden ${collapsed ? 'justify-center' : ''} ${active ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                      <Icon name={item.icon} size={17} className="flex-shrink-0" />
                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="truncate whitespace-nowrap">
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: user info + actions + collapse */}
        <div className="border-t border-border flex-shrink-0">
          <AnimatePresence initial={false}>
            {!collapsed && user && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                className="flex items-center gap-2.5 px-3 py-3 border-b border-border overflow-hidden">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-border" />
                  : <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-border">
                      <span className="text-xs font-bold text-primary">{user.name?.[0]?.toUpperCase()}</span>
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`flex p-2 gap-1 ${collapsed ? 'flex-col items-center' : ''}`}>
            {pinEnabled && (
              <button onClick={lockNow} title={collapsed ? 'Lock app' : undefined}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all ${collapsed ? 'w-full' : 'flex-1 px-2'}`}>
                <Icon name="Lock" size={13} />
                {!collapsed && <span>Lock</span>}
              </button>
            )}
            <button onClick={handleLogout} title={collapsed ? 'Sign out' : undefined}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-error/10 hover:text-error transition-all ${collapsed ? 'w-full' : 'flex-1 px-2'}`}>
              <Icon name="LogOut" size={13} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>

          <button onClick={toggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
            <Icon name={collapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} size={14} />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Flex spacer — mirrors sidebar width so content fills remaining screen */}
      <motion.div
        animate={{ width: SIDEBAR_W }} initial={false}
        transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden lg:block flex-shrink-0" aria-hidden="true"
      />
    </>
  );
}

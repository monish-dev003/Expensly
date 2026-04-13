import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../components/AppIcon';
import PageLayout from '../../components/ui/PageLayout';
import { useAuthStore, usePinStore } from '../../store/index.js';
import { userAPI, authAPI, transactionAPI } from '../../api/index.js';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

const CURRENCIES = [
  { code: 'INR', symbol: '₹',   label: '₹ Indian Rupee'      },
  { code: 'USD', symbol: '$',   label: '$ US Dollar'         },
  { code: 'EUR', symbol: '€',   label: '€ Euro'              },
  { code: 'GBP', symbol: '£',   label: '£ British Pound'     },
  { code: 'AED', symbol: 'د.إ', label: 'د.إ UAE Dirham'      },
  { code: 'JPY', symbol: '¥',   label: '¥ Japanese Yen'      },
  { code: 'SGD', symbol: 'S$',  label: 'S$ Singapore Dollar' },
  { code: 'CAD', symbol: 'C$',  label: 'C$ Canadian Dollar'  },
];

const AUTO_LOCK_OPTIONS = [
  { value: 0,  label: 'Never'      },
  { value: 1,  label: '1 minute'   },
  { value: 5,  label: '5 minutes'  },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour'     },
];

const SECTIONS = [
  { id: 'profile',     icon: 'User',             label: 'Profile'       },
  { id: 'appearance',  icon: 'Palette',          label: 'Appearance'    },
  { id: 'preferences', icon: 'SlidersHorizontal', label: 'Preferences'  },
  { id: 'security',    icon: 'Shield',           label: 'Security'      },
  { id: 'data',        icon: 'Download',         label: 'Data & Export' },
  { id: 'about',       icon: 'Info',             label: 'About'         },
];

const applyTheme = (t) => {
  localStorage.setItem('expensly-theme', t);
  const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
};

const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${
      checked ? 'bg-gradient-to-r from-blue-600 to-emerald-500' : 'bg-border'
    }`}
  >
    <motion.span
      animate={{ x: checked ? 24 : 4 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className="inline-block h-4 w-4 rounded-full bg-white shadow"
    />
  </button>
);

const SettingRow = ({ icon, label, desc, children, danger = false }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-3 mr-4 flex-1 min-w-0">
      {icon && (
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          danger ? 'bg-error/10' : 'bg-muted'
        }`}>
          <Icon name={icon} size={15} className={danger ? 'text-error' : 'text-muted-foreground'} />
        </div>
      )}
      <div className="min-w-0">
        <p className={`text-sm font-medium leading-tight ${danger ? 'text-error' : 'text-foreground'}`}>{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>}
      </div>
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Divider = () => <div className="h-px bg-border/60" />;

const PinInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
    <input
      type="password"
      inputMode="numeric"
      maxLength={4}
      value={value}
      onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
      placeholder="• • • •"
      className="w-full h-10 px-3 rounded-xl border border-border bg-input text-foreground text-sm text-center tracking-[0.6em] focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-card border border-border rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardBody = ({ children }) => <div className="px-5">{children}</div>;

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.14em] mb-2">{children}</p>
);

// ── UPDATED ProfilePanel — photo/camera/change photo removed ─────────────────
function ProfilePanel({ user, form, setForm, saving, handleSave }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your name and account info</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate text-base">{user?.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="py-4">
            <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your full name"
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </CardBody>
      </Card>

      <button onClick={handleSave} disabled={saving}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-sm">
        {saving ? <><Icon name="Loader" size={14} className="animate-spin" /> Saving…</> : 'Save Changes'}
      </button>
    </div>
  );
}

function AppearancePanel({ theme, handleTheme }) {
  const THEMES = [
    { v: 'light',  label: 'Light',  icon: 'Sun',     desc: 'Always light'   },
    { v: 'dark',   label: 'Dark',   icon: 'Moon',    desc: 'Always dark'    },
    { v: 'system', label: 'System', icon: 'Monitor', desc: 'Follow device'  },
  ];
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Choose how Expensly looks on your device</p>
      </div>
      <Card>
        <CardBody>
          <div className="py-4">
            <p className="text-sm font-medium text-foreground mb-3">App Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map(t => (
                <button key={t.v} onClick={() => handleTheme(t.v)}
                  className={`relative flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border-2 transition-all ${
                    theme === t.v ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : 'border-border hover:border-primary/30 hover:bg-muted/40'
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    theme === t.v ? 'bg-gradient-to-br from-blue-600 to-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon name={t.icon} size={18} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-semibold ${theme === t.v ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>{t.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
                  </div>
                  {theme === t.v && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-full flex items-center justify-center">
                      <Icon name="Check" size={9} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function PreferencesPanel({ form, setForm, notifications, setNotifications, saving, handleSave }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Preferences</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Currency, budget cycle, and notification settings</p>
      </div>

      <div>
        <SectionLabel>Financial</SectionLabel>
        <Card>
          <CardBody>
            <SettingRow icon="CircleDollarSign" label="Currency" desc="Display symbol for all amounts">
              <select
                value={form.currency}
                onChange={e => {
                  const sel = CURRENCIES.find(c => c.code === e.target.value);
                  setForm(p => ({ ...p, currency: e.target.value, currencySymbol: sel?.symbol || '₹' }));
                }}
                className="h-9 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </SettingRow>
            <Divider />
            <SettingRow icon="CalendarDays" label="Month Start Day" desc="When your monthly budget cycle resets">
              <select
                value={form.monthStart}
                onChange={e => setForm(p => ({ ...p, monthStart: parseInt(e.target.value) }))}
                className="h-9 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {[1,5,10,15,20,25].map(d => (
                  <option key={d} value={d}>{d}{d===1?'st':d===2?'nd':d===3?'rd':'th'} of month</option>
                ))}
              </select>
            </SettingRow>
          </CardBody>
        </Card>
      </div>

      <div>
        <SectionLabel>Notifications</SectionLabel>
        <Card>
          <CardBody>
            <SettingRow icon="Bell" label="Budget Alerts" desc="Notify when spending nears budget limit">
              <Toggle checked={notifications.budgetAlerts} onChange={v => setNotifications(p => ({ ...p, budgetAlerts: v }))} />
            </SettingRow>
            <Divider />
            <SettingRow icon="Smartphone" label="Push Notifications" desc="Transaction alerts and reminders">
              <Toggle checked={notifications.pushEnabled} onChange={v => setNotifications(p => ({ ...p, pushEnabled: v }))} />
            </SettingRow>
          </CardBody>
        </Card>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-sm">
        {saving ? <><Icon name="Loader" size={14} className="animate-spin" /> Saving…</> : 'Save Preferences'}
      </button>
    </div>
  );
}

function SecurityPanel({
  pinEnabled, autoLockMinutes, lockNow, setAutoLock, setPinEnabled, updateUser, user,
  pinSection, openPinSection, pinForm, setPinForm, pinError, setPinError, pinLoading,
  handleSetPin, handleDisablePin, forgotPinPassword, setForgotPinPassword,
  showForgotPinPwd, setShowForgotPinPwd, handleForgotPin,
  showChangePass, setShowChangePass, passForm, setPassForm, passError, setPassError,
  passLoading, handleChangePassword,
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Protect your account and financial data</p>
      </div>

      <div>
        <SectionLabel>App Lock</SectionLabel>
        <Card>
          <CardBody>
            <SettingRow icon="Lock" label="PIN Lock"
              desc={pinEnabled ? 'App is protected with a 4-digit PIN' : 'Require a PIN to open the app'}>
              <Toggle checked={pinEnabled}
                onChange={v => v ? openPinSection('set') : openPinSection('disable')} />
            </SettingRow>
            {pinEnabled && (
              <>
                <Divider />
                <SettingRow icon="Timer" label="Auto-Lock" desc="Lock after this period of inactivity">
                  <select value={autoLockMinutes} onChange={e => setAutoLock(parseInt(e.target.value))}
                    className="h-9 px-3 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {AUTO_LOCK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </SettingRow>
                <Divider />
                <SettingRow icon="LogOut" label="Lock Now" desc="Require PIN immediately">
                  <button onClick={lockNow}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-all flex items-center gap-1.5">
                    <Icon name="Lock" size={11} /> Lock
                  </button>
                </SettingRow>
                <Divider />
                <SettingRow icon="KeyRound" label="Manage PIN" desc="Change or reset your 4-digit PIN">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openPinSection('change')}
                      className="px-3.5 py-1.5 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-all">
                      Change
                    </button>
                    <button onClick={() => openPinSection('forgot')}
                      className="px-3.5 py-1.5 border border-warning/30 rounded-xl text-xs font-semibold text-warning hover:bg-warning/10 transition-all">
                      Forgot?
                    </button>
                  </div>
                </SettingRow>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <AnimatePresence>
        {pinSection === 'forgot' && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
            className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-5 space-y-3.5">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="TriangleAlert" size={15} className="text-amber-600" /> Reset PIN via Password
            </p>
            <p className="text-xs text-muted-foreground">Enter your account password to disable and reset the PIN.</p>
            <div className="relative">
              <input type={showForgotPinPwd ? 'text' : 'password'} value={forgotPinPassword}
                onChange={e => { setForgotPinPassword(e.target.value); setPinError(''); }}
                placeholder="Account password"
                className="w-full h-10 px-3.5 pr-10 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button type="button" onClick={() => setShowForgotPinPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Icon name={showForgotPinPwd ? 'EyeOff' : 'Eye'} size={14} />
              </button>
            </div>
            {pinError && <p className="text-xs text-error font-medium">{pinError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { openPinSection(''); setForgotPinPassword(''); setPinError(''); }}
                className="flex-1 h-9 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">Cancel</button>
              <button onClick={handleForgotPin} disabled={pinLoading}
                className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 transition-all flex items-center justify-center gap-1.5">
                {pinLoading ? <><Icon name="Loader" size={13} className="animate-spin" /> Resetting…</> : 'Reset PIN'}
              </button>
            </div>
          </motion.div>
        )}
        {pinSection === 'set' && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
            className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3.5">
            <p className="text-sm font-semibold text-foreground">🔐 Set a new PIN</p>
            <div className="grid grid-cols-2 gap-3">
              <PinInput label="New PIN (4 digits)" value={pinForm.new}
                onChange={v => { setPinForm(p => ({ ...p, new: v })); setPinError(''); }} />
              <PinInput label="Confirm PIN" value={pinForm.confirm}
                onChange={v => { setPinForm(p => ({ ...p, confirm: v })); setPinError(''); }} />
            </div>
            {pinError && <p className="text-xs text-error font-medium">{pinError}</p>}
            <div className="flex gap-2">
              <button onClick={() => openPinSection('')}
                className="flex-1 h-9 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">Cancel</button>
              <button onClick={handleSetPin} disabled={pinLoading}
                className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 transition-all flex items-center justify-center gap-1.5">
                {pinLoading ? <><Icon name="Loader" size={13} className="animate-spin" /> Setting…</> : 'Confirm PIN'}
              </button>
            </div>
          </motion.div>
        )}
        {pinSection === 'change' && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
            className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3.5">
            <p className="text-sm font-semibold text-foreground">🔄 Change your PIN</p>
            <PinInput label="Current PIN" value={pinForm.current}
              onChange={v => { setPinForm(p => ({ ...p, current: v })); setPinError(''); }} />
            <div className="grid grid-cols-2 gap-3">
              <PinInput label="New PIN" value={pinForm.new}
                onChange={v => { setPinForm(p => ({ ...p, new: v })); setPinError(''); }} />
              <PinInput label="Confirm New" value={pinForm.confirm}
                onChange={v => { setPinForm(p => ({ ...p, confirm: v })); setPinError(''); }} />
            </div>
            {pinError && <p className="text-xs text-error font-medium">{pinError}</p>}
            <div className="flex gap-2">
              <button onClick={() => openPinSection('')}
                className="flex-1 h-9 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">Cancel</button>
              <button onClick={handleSetPin} disabled={pinLoading}
                className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 transition-all flex items-center justify-center gap-1.5">
                {pinLoading ? <><Icon name="Loader" size={13} className="animate-spin" /> Updating…</> : 'Update PIN'}
              </button>
            </div>
          </motion.div>
        )}
        {pinSection === 'disable' && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
            className="rounded-2xl border border-error/20 bg-error/5 p-5 space-y-3.5">
            <p className="text-sm font-semibold text-foreground">⚠️ Disable PIN Lock</p>
            <p className="text-xs text-muted-foreground">Enter your current PIN to confirm you want to disable protection.</p>
            <PinInput label="Current PIN" value={pinForm.current}
              onChange={v => { setPinForm(p => ({ ...p, current: v })); setPinError(''); }} />
            {pinError && <p className="text-xs text-error font-medium">{pinError}</p>}
            <div className="flex gap-2">
              <button onClick={() => openPinSection('')}
                className="flex-1 h-9 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">Cancel</button>
              <button onClick={handleDisablePin} disabled={pinLoading}
                className="flex-1 h-9 rounded-xl bg-error text-white text-sm font-semibold disabled:opacity-60 transition-all">
                {pinLoading ? 'Verifying…' : 'Disable PIN'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <SectionLabel>Password</SectionLabel>
        <Card>
          <CardBody>
            <SettingRow icon="KeySquare" label="Change Password" desc="Update your account login password">
              <button
                onClick={() => { setShowChangePass(v => !v); setPassForm({ current:'',new:'',confirm:'' }); setPassError(''); }}
                className="px-3.5 py-1.5 border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted transition-all">
                {showChangePass ? 'Cancel' : 'Change'}
              </button>
            </SettingRow>
          </CardBody>
        </Card>
      </div>

      <AnimatePresence>
        {showChangePass && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
            className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3.5">
            <p className="text-sm font-semibold text-foreground">Change Password</p>
            {[
              { key:'current', label:'Current Password', ph:'Enter current password' },
              { key:'new',     label:'New Password',     ph:'Minimum 8 characters'  },
              { key:'confirm', label:'Confirm New',      ph:'Repeat new password'   },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-foreground mb-1.5">{f.label}</label>
                <input type="password" placeholder={f.ph} value={passForm[f.key]}
                  onChange={e => { setPassForm(p => ({ ...p, [f.key]: e.target.value })); setPassError(''); }}
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            ))}
            {passError && <p className="text-xs text-error font-medium">{passError}</p>}
            <button onClick={handleChangePassword} disabled={passLoading}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60 transition-all flex items-center justify-center gap-1.5">
              {passLoading ? <><Icon name="Loader" size={13} className="animate-spin" /> Updating…</> : 'Update Password'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DataPanel({ exporting, handleExport }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">Data & Export</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Download your complete transaction history</p>
      </div>

      <Card>
        <CardBody>
          <div className="py-4">
            <p className="text-sm font-medium text-foreground mb-1">Export All Transactions</p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Download your wallets, transactions, categories and notes. Works with Excel and Google Sheets.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { f:'csv',  label:'Export CSV',   icon:'FileText',        cls:'bg-success/10 text-success border-success/20 hover:bg-success/20'    },
                { f:'xlsx', label:'Export Excel', icon:'FileSpreadsheet', cls:'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' },
              ].map(({ f, label, icon, cls }) => (
                <button key={f} onClick={() => handleExport(f)} disabled={!!exporting}
                  className={`flex items-center justify-center gap-2.5 py-3.5 border rounded-xl font-semibold text-sm disabled:opacity-50 transition-all ${cls}`}>
                  {exporting === f
                    ? <><Icon name="Loader" size={15} className="animate-spin" /> Exporting…</>
                    : <><Icon name={icon} size={15} /> {label}</>
                  }
                </button>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-start gap-3">
        <Icon name="Info" size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Exports never include your password or PIN. All financial data is exported in plain readable format.
        </p>
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">About</h2>
        <p className="text-sm text-muted-foreground mt-0.5">App information and build details</p>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center gap-4 py-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-extrabold text-xl leading-none">₹</span>
            </div>
            <div>
              <p className="font-extrabold text-foreground text-lg leading-tight bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Expensly</p>
              <p className="text-sm text-muted-foreground">Smart Money Manager</p>
              <p className="text-xs text-muted-foreground/60 mt-1">v5.0 · For India 🇮🇳</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {[
            ['Version',  '5.0.0'],
            ['Platform', 'MERN Stack Web App'],
            ['Auth',     'Firebase + JWT'],
            ['Database', 'MongoDB Atlas'],
            ['Frontend', 'React + Tailwind + Framer Motion'],
          ].map(([k, v], i, arr) => (
            <React.Fragment key={k}>
              <div className="flex items-center justify-between py-3.5">
                <span className="text-sm text-muted-foreground">{k}</span>
                <span className="text-sm font-medium text-foreground">{v}</span>
              </div>
              {i < arr.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

// ── Main SettingsPage ─────────────────────────────────────────────────────────
const SettingsPage = () => {
  const navigate   = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const { pinEnabled, autoLockMinutes, setPinEnabled, setAutoLock, lockNow } = usePinStore();

  const fileInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState('profile');

  const [form, setForm] = useState({
    name:           user?.name           || '',
    currency:       user?.currency       || 'INR',
    currencySymbol: user?.currencySymbol || '₹',
    monthStart:     user?.monthStart     || 1,
  });
  const [notifications, setNotifications] = useState({
    budgetAlerts: user?.notifications?.budgetAlerts ?? true,
    pushEnabled:  user?.notifications?.pushEnabled  ?? false,
  });
  const [theme, setThemeState] = useState(localStorage.getItem('expensly-theme') || 'system');
  const [saving, setSaving]    = useState(false);
  const [exporting, setExporting] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const [pinSection, setPinSection]   = useState('');
  const [pinForm, setPinForm]         = useState({ current: '', new: '', confirm: '' });
  const [pinError, setPinError]       = useState('');
  const [pinLoading, setPinLoading]   = useState(false);
  const [forgotPinPassword, setForgotPinPassword] = useState('');
  const [showForgotPinPwd, setShowForgotPinPwd]   = useState(false);

  const [showChangePass, setShowChangePass] = useState(false);
  const [passForm, setPassForm]             = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError]           = useState('');
  const [passLoading, setPassLoading]       = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const { data: res } = await userAPI.updateMe({ ...form, notifications });
      updateUser(res.data);
      toast.success('Settings saved ✓');
    } catch { toast.error('Failed to save.'); }
    setSaving(false);
  };

  const handleTheme = (t) => { setThemeState(t); applyTheme(t); };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const res  = await transactionAPI.export({ format });
      const blob = new Blob([res.data], {
        type: format === 'xlsx'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href = url; a.download = `expensly_export.${format}`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()} ✓`);
    } catch { toast.error('Export failed.'); }
    setExporting('');
  };

  const openPinSection = (section) => {
    setPinSection(section);
    setPinForm({ current: '', new: '', confirm: '' });
    setPinError('');
  };

  const handleSetPin = async () => {
    if (!/^\d{4}$/.test(pinForm.new))              { setPinError('PIN must be exactly 4 digits'); return; }
    if (pinForm.new !== pinForm.confirm)            { setPinError('PINs do not match'); return; }
    if (pinSection === 'change' && !pinForm.current){ setPinError('Enter your current PIN'); return; }
    setPinLoading(true); setPinError('');
    try {
      await authAPI.setPin({ pin: pinForm.new });
      setPinEnabled(true);
      updateUser({ ...user, pinEnabled: true });
      toast.success(pinSection === 'change' ? 'PIN changed 🔐' : 'PIN set 🔐');
      setPinSection('');
    } catch (e) { setPinError(e.response?.data?.message || 'Failed.'); }
    setPinLoading(false);
  };

  const handleDisablePin = async () => {
    if (!pinForm.current) { setPinError('Enter your current PIN'); return; }
    setPinLoading(true); setPinError('');
    try {
      await authAPI.verifyPin({ pin: pinForm.current });
      await authAPI.disablePin({});
      setPinEnabled(false);
      updateUser({ ...user, pinEnabled: false });
      toast.success('PIN disabled.');
      setPinSection('');
    } catch (e) { setPinError(e.response?.data?.message || 'Incorrect PIN.'); }
    setPinLoading(false);
  };

  const handleForgotPin = async () => {
    if (!forgotPinPassword) { setPinError('Enter your password'); return; }
    setPinLoading(true); setPinError('');
    try {
      await authAPI.resetPin({ password: forgotPinPassword });
      setPinEnabled(false);
      updateUser({ ...user, pinEnabled: false });
      toast.success('PIN reset. Set a new one anytime.');
      openPinSection('');
      setForgotPinPassword('');
    } catch (e) { setPinError(e.response?.data?.message || 'Incorrect password.'); }
    setPinLoading(false);
  };

  const handleChangePassword = async () => {
    if (!passForm.current)                         { setPassError('Enter current password'); return; }
    if (!passForm.new || passForm.new.length < 8)  { setPassError('Min 8 characters required'); return; }
    if (passForm.new !== passForm.confirm)          { setPassError('Passwords do not match'); return; }
    setPassLoading(true); setPassError('');
    try {
      await authAPI.changePassword({ currentPassword: passForm.current, newPassword: passForm.new });
      toast.success('Password changed 🔒');
      setShowChangePass(false);
      setPassForm({ current: '', new: '', confirm: '' });
    } catch (e) { setPassError(e.response?.data?.message || 'Failed.'); }
    setPassLoading(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await userAPI.updateMe({ deleted: true });
      await logout();
      navigate('/');
      toast.success('Account deleted.');
    } catch { toast.error('Failed. Contact support.'); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const PANEL_PROPS = {
    profile:     { user, form, setForm, saving, handleSave },
    appearance:  { theme, handleTheme },
    preferences: { form, setForm, notifications, setNotifications, saving, handleSave },
    security: {
      pinEnabled, autoLockMinutes, lockNow, setAutoLock, setPinEnabled, updateUser, user,
      pinSection, openPinSection, pinForm, setPinForm, pinError, setPinError, pinLoading,
      handleSetPin, handleDisablePin, forgotPinPassword, setForgotPinPassword,
      showForgotPinPwd, setShowForgotPinPwd, handleForgotPin,
      showChangePass, setShowChangePass, passForm, setPassForm,
      passError, setPassError, passLoading, handleChangePassword,
    },
    data:  { exporting, handleExport },
    about: {},
  };

  const PANELS = {
    profile: ProfilePanel, appearance: AppearancePanel,
    preferences: PreferencesPanel, security: SecurityPanel,
    data: DataPanel, about: AboutPanel,
  };

  const PanelComponent = PANELS[activeSection];

  return (
    <PageLayout>
      <Helmet>
        <title>Settings — Expensly</title>
        <meta name="description" content="Manage your profile, appearance, security, and preferences." />
      </Helmet>
      <header className="sticky top-0 z-40 bg-card/97 backdrop-blur-xl border-b border-border flex-shrink-0">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">Settings</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Manage your account, appearance &amp; security</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-error/10 hover:text-error border border-border hover:border-error/20 transition-all flex-shrink-0">
            <Icon name="LogOut" size={13} /> Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className="hidden lg:flex flex-col w-52 xl:w-60 flex-shrink-0 border-r border-border bg-muted/20 overflow-y-auto">
          <nav className="px-3 py-5 space-y-0.5 sticky top-0">
            <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.14em] px-3 mb-2">Settings</p>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left w-full ${
                  activeSection === s.id
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                <Icon name={s.icon} size={15} className="flex-shrink-0" />
                {s.label}
              </button>
            ))}
            <div className="pt-3 mt-3 border-t border-border">
              <button onClick={() => setShowDelete(true)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all w-full text-left">
                <Icon name="Trash2" size={15} className="flex-shrink-0" />
                Delete Account
              </button>
            </div>
          </nav>
        </aside>

        <div className="flex-1 min-w-0 overflow-y-auto">
          <div className="lg:hidden px-4 pt-4">
            <div className="flex gap-1.5 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeSection === s.id
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}>
                  <Icon name={s.icon} size={12} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <main className="px-4 sm:px-6 lg:px-8 xl:px-10 py-5 pb-28 lg:pb-10 w-full max-w-3xl xl:max-w-4xl">
            <AnimatePresence mode="wait">
              <motion.div key={activeSection}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}>
                <PanelComponent {...PANEL_PROPS[activeSection]} />
              </motion.div>
            </AnimatePresence>

            <div className="lg:hidden mt-8">
              <button onClick={() => setShowDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 border border-error/30 text-error rounded-2xl text-sm font-medium hover:bg-error/5 transition-all">
                <Icon name="Trash2" size={14} /> Delete Account
              </button>
            </div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="Trash2" size={24} className="text-error" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Delete Account?</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  All wallets, transactions, budgets and goals will be permanently deleted. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDelete(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">
                  Cancel
                </button>
                <button onClick={handleDeleteAccount}
                  className="flex-1 h-11 rounded-xl bg-error text-white text-sm font-semibold hover:bg-error/90 transition-all">
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default SettingsPage;
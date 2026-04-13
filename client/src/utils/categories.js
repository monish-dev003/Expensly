// ── Single source of truth for all built-in categories ───────────────────────
// Import this everywhere instead of redefining BUILTIN_CATS in each file.

export const BUILTIN_CATS = {
  // ── Expense ────────────────────────────────────────────────────────────────
  food:    { id:'food',    name:'Food & Drink',   icon:'🍜', color:'#f6ad55', type:'expense' },
  trans:   { id:'trans',  name:'Transport',       icon:'🚗', color:'#63b3ed', type:'expense' },
  shop:    { id:'shop',   name:'Shopping',        icon:'🛍️', color:'#b794f4', type:'expense' },
  health:  { id:'health', name:'Health',          icon:'💊', color:'#fc8181', type:'expense' },
  ent:     { id:'ent',    name:'Entertainment',   icon:'🎬', color:'#76e4f7', type:'expense' },
  util:    { id:'util',   name:'Utilities',       icon:'💡', color:'#f6c90e', type:'expense' },
  grocery: { id:'grocery',name:'Groceries',       icon:'🛒', color:'#48bb78', type:'expense' },
  rent:    { id:'rent',   name:'Rent/Housing',    icon:'🏠', color:'#fc8181', type:'expense' },
  edu:     { id:'edu',    name:'Education',       icon:'📚', color:'#63b3ed', type:'expense' },
  care:    { id:'care',   name:'Personal Care',   icon:'💇', color:'#b794f4', type:'expense' },
  travel:  { id:'travel', name:'Travel',          icon:'✈️', color:'#f6ad55', type:'expense' },
  sub:     { id:'sub',    name:'Subscriptions',   icon:'📱', color:'#76e4f7', type:'expense' },
  other:   { id:'other',  name:'Other',           icon:'📦', color:'#a0aec0', type:'expense' },
  // ── Income ─────────────────────────────────────────────────────────────────
  salary:  { id:'salary', name:'Salary',          icon:'💼', color:'#48bb78', type:'income' },
  free:    { id:'free',   name:'Freelance',       icon:'💻', color:'#63b3ed', type:'income' },
  invest:  { id:'invest', name:'Investment',      icon:'📈', color:'#b794f4', type:'income' },
  biz:     { id:'biz',    name:'Business',        icon:'🏢', color:'#f6ad55', type:'income' },
  rental:  { id:'rental', name:'Rental Income',   icon:'🏘️', color:'#76e4f7', type:'income' },
  gift:    { id:'gift',   name:'Gift Received',   icon:'🎀', color:'#fc8181', type:'income' },
  refund:  { id:'refund', name:'Refund',          icon:'↩️', color:'#f6c90e', type:'income' },
  other2:  { id:'other2', name:'Other Income',    icon:'💰', color:'#a0aec0', type:'income' },
};

export const EXPENSE_CAT_IDS = Object.values(BUILTIN_CATS).filter(c=>c.type==='expense').map(c=>c.id);
export const INCOME_CAT_IDS  = Object.values(BUILTIN_CATS).filter(c=>c.type==='income').map(c=>c.id);

/** Resolve a transaction's display category from BUILTIN_CATS or DB categories array */
export function resolveCategory(tx, dbCats = []) {
  // Already fully populated from server
  if (tx.category?.name) return tx.category;
  const id = tx.catId;
  if (!id) return { name:'Other', icon:'📦', color:'#a0aec0' };
  // Built-in slug
  if (BUILTIN_CATS[id]) return BUILTIN_CATS[id];
  // DB ObjectId — find in passed-in array
  const found = dbCats.find(c => c._id === id || c._id === String(id));
  if (found) return found;
  // Unknown — return safe fallback
  return { name: String(id), icon:'📦', color:'#a0aec0' };
}

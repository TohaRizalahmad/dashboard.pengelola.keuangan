import { useState, useMemo, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, TrendingDown, Plus, Edit2, Trash2, Search,
  LogOut, LayoutDashboard, ArrowUpCircle, ArrowDownCircle,
  Wallet, Target, BarChart2, Bell, Moon, Sun, X, Menu, Tag
} from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
const fmtShort = (n) =>
  n >= 1e9 ? `Rp${(n / 1e9).toFixed(1)}M` : n >= 1e6 ? `Rp${(n / 1e6).toFixed(1)}jt` : n >= 1e3 ? `Rp${(n / 1e3).toFixed(0)}rb` : `Rp${n}`;

const CATS_INIT = [
  { id: 1, name: "Gaji", type: "income", color: "#10b981", icon: "💼" },
  { id: 2, name: "Freelance", type: "income", color: "#3b82f6", icon: "💻" },
  { id: 3, name: "Investasi", type: "income", color: "#8b5cf6", icon: "📈" },
  { id: 4, name: "Bonus", type: "income", color: "#06b6d4", icon: "🎁" },
  { id: 5, name: "Makanan", type: "expense", color: "#f59e0b", icon: "🍜" },
  { id: 6, name: "Transport", type: "expense", color: "#06b6d4", icon: "🚗" },
  { id: 7, name: "Kesehatan", type: "expense", color: "#ef4444", icon: "🏥" },
  { id: 8, name: "Hiburan", type: "expense", color: "#ec4899", icon: "🎮" },
  { id: 9, name: "Belanja", type: "expense", color: "#f97316", icon: "🛍️" },
  { id: 10, name: "Tagihan", type: "expense", color: "#64748b", icon: "⚡" },
  { id: 11, name: "Pendidikan", type: "expense", color: "#a855f7", icon: "📚" },
];

const mkDate = (monthsBack, day) => {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsBack);
  d.setDate(day);
  return d.toISOString().split("T")[0];
};

const TXNS_INIT = (() => {
  let id = 1;
  const list = [];
  for (let m = 0; m < 6; m++) {
    list.push({ id: id++, type: "income", categoryId: 1, amount: 8500000, date: mkDate(m, 1), note: "Gaji bulanan", tags: ["rutin"] });
    if (m < 4) list.push({ id: id++, type: "income", categoryId: 2, amount: Math.floor(Math.random() * 2000000 + 500000), date: mkDate(m, 10 + m), note: "Proyek freelance", tags: ["freelance"] });
    if (m === 0) list.push({ id: id++, type: "income", categoryId: 3, amount: 350000, date: mkDate(0, 15), note: "Dividen saham", tags: ["investasi"] });
    if (m === 1) list.push({ id: id++, type: "income", categoryId: 4, amount: 1500000, date: mkDate(1, 20), note: "Bonus kinerja", tags: [] });
    list.push({ id: id++, type: "expense", categoryId: 5, amount: Math.floor(Math.random() * 600000 + 800000), date: mkDate(m, 5), note: "Makan & minum harian", tags: [] });
    list.push({ id: id++, type: "expense", categoryId: 5, amount: Math.floor(Math.random() * 200000 + 100000), date: mkDate(m, 18), note: "Makan keluarga", tags: ["keluarga"] });
    list.push({ id: id++, type: "expense", categoryId: 6, amount: Math.floor(Math.random() * 200000 + 150000), date: mkDate(m, 7), note: "Bensin & ojek online", tags: [] });
    list.push({ id: id++, type: "expense", categoryId: 10, amount: Math.floor(Math.random() * 150000 + 350000), date: mkDate(m, 3), note: "Listrik, air & internet", tags: ["rutin"] });
    list.push({ id: id++, type: "expense", categoryId: 9, amount: Math.floor(Math.random() * 400000 + 100000), date: mkDate(m, 12), note: "Belanja bulanan", tags: [] });
    if (m % 2 === 0) list.push({ id: id++, type: "expense", categoryId: 8, amount: Math.floor(Math.random() * 200000 + 50000), date: mkDate(m, 22), note: "Nonton & streaming", tags: [] });
    if (m % 3 === 0) list.push({ id: id++, type: "expense", categoryId: 7, amount: Math.floor(Math.random() * 300000 + 100000), date: mkDate(m, 14), note: "Obat & dokter", tags: [] });
    if (m === 2) list.push({ id: id++, type: "expense", categoryId: 11, amount: 750000, date: mkDate(2, 8), note: "Kursus online", tags: ["edukasi"] });
  }
  return list.sort((a, b) => new Date(b.date) - new Date(a.date));
})();

const BUDGETS_INIT = [
  { id: 1, categoryId: 5, amount: 1500000 },
  { id: 2, categoryId: 6, amount: 500000 },
  { id: 3, categoryId: 8, amount: 300000 },
  { id: 4, categoryId: 9, amount: 600000 },
  { id: 5, categoryId: 10, amount: 500000 },
  { id: 6, categoryId: 7, amount: 400000 },
];

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

// ─── useWindowWidth ──────────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

// ─── Modal ─────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, t }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: t.surface, borderRadius: 16, width: "100%", maxWidth: 460, border: `1px solid ${t.border}`, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 0" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: t.muted, cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── StatCard ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color, t }) {
  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: t.muted, lineHeight: 1.3 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: t.text, marginBottom: 3, letterSpacing: -0.5, wordBreak: "break-all" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: t.muted }}>{sub}</div>}
    </div>
  );
}

// ─── DashboardView ──────────────────────────────────────────────────────────
function DashboardView({ txns, totalIncome, totalExpense, balance, monthlyData, catPieData, budgetProgress, t, s, cats, openNewTx, isMobile }) {
  const recent = txns.slice(0, 6);
  return (
    <div>
      {/* Stat cards: 2 columns on mobile, 4 on desktop */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit,minmax(190px,1fr))", gap: isMobile ? 10 : 14, marginBottom: isMobile ? 14 : 22 }}>
        <StatCard label="Total Saldo" value={fmt(balance)} sub="Semua waktu" icon={<Wallet size={16} />} color="#6366f1" t={t} />
        <StatCard label="Pemasukan" value={fmtShort(totalIncome)} sub="Bulan ini" icon={<TrendingUp size={16} />} color="#10b981" t={t} />
        <StatCard label="Pengeluaran" value={fmtShort(totalExpense)} sub="Bulan ini" icon={<TrendingDown size={16} />} color="#f43f5e" t={t} />
        <StatCard label="Selisih Bersih" value={fmtShort(totalIncome - totalExpense)} sub={totalIncome >= totalExpense ? "✅ Surplus" : "⚠️ Defisit"} icon={totalIncome >= totalExpense ? <TrendingUp size={16} /> : <TrendingDown size={16} />} color={totalIncome >= totalExpense ? "#10b981" : "#f43f5e"} t={t} />
      </div>

      {/* Charts: stack on mobile */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: isMobile ? 10 : 14, marginBottom: isMobile ? 14 : 22 }}>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: t.text }}>Arus Kas 6 Bulan Terakhir</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 170 : 210}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: t.muted }} />
              <YAxis tickFormatter={fmtShort} tick={{ fontSize: 9, fill: t.muted }} width={isMobile ? 50 : 64} />
              <Tooltip formatter={(v, n) => [fmt(v), n === "pemasukan" ? "Pemasukan" : "Pengeluaran"]} contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 12 }} />
              <Area type="monotone" dataKey="pemasukan" stroke="#10b981" fill="url(#gi)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="pengeluaran" stroke="#f43f5e" fill="url(#ge)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
            {[["#10b981", "Pemasukan"], ["#f43f5e", "Pengeluaran"]].map(([c, l]) => (
              <span key={l} style={{ fontSize: 12, color: t.muted, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }}></span>{l}
              </span>
            ))}
          </div>
        </div>

        <div style={s.card}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: t.text }}>Pengeluaran per Kategori</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 120 : 140}>
            <PieChart>
              <Pie data={catPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={isMobile ? 50 : 62} dataKey="value" paddingAngle={3}>
                {catPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [fmt(v)]} contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 6 }}>
            {catPieData.slice(0, 4).map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }}></div>
                  <span style={{ fontSize: 11, color: t.muted }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: t.text }}>{fmtShort(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget + Recent: stack on mobile */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 10 : 14 }}>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: t.text }}>Status Anggaran Bulan Ini</h3>
          {budgetProgress.slice(0, 5).map((b, i) => (
            <div key={i} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: t.text }}>{b.cat?.icon} {b.cat?.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: b.pct >= 100 ? "#f43f5e" : b.pct >= 80 ? "#f59e0b" : "#10b981" }}>{b.pct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: t.border, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${b.pct}%`, background: b.pct >= 100 ? "#f43f5e" : b.pct >= 80 ? "#f59e0b" : "#10b981", borderRadius: 3 }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: 11, color: t.muted }}>{fmtShort(b.spent)}</span>
                <span style={{ fontSize: 11, color: t.muted }}>/ {fmtShort(b.amount)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: t.text }}>Transaksi Terbaru</h3>
          {recent.map((tx) => {
            const cat = cats.find((c) => c.id === tx.categoryId);
            return (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${cat?.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{cat?.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: isMobile ? 120 : 160 }}>{tx.note || cat?.name}</div>
                    <div style={{ fontSize: 10, color: t.muted }}>{tx.date}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: tx.type === "income" ? "#10b981" : "#f43f5e", flexShrink: 0 }}>
                  {tx.type === "income" ? "+" : "-"}{fmtShort(tx.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── TransactionsView ───────────────────────────────────────────────────────
function TransactionsView({ txns, cats, search, setSearch, fType, setFType, fCat, setFCat, openNewTx, openEditTx, deleteTx, t, s, isMobile }) {
  return (
    <div>
      {/* Filter bar: stacked on mobile */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: isMobile ? "auto" : 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.muted }} />
          <input style={{ ...s.input, paddingLeft: 34 }} placeholder="Cari transaksi..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select style={{ ...s.input, flex: 1 }} value={fType} onChange={(e) => setFType(e.target.value)}>
            <option value="all">Semua Jenis</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <select style={{ ...s.input, flex: 1 }} value={fCat} onChange={(e) => setFCat(e.target.value)}>
            <option value="all">Semua</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <button onClick={openNewTx} style={{ ...s.btn(), display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", padding: "10px 14px" }}><Plus size={14} /> {!isMobile && "Tambah"}</button>
        </div>
      </div>

      <div style={s.card}>
        <div style={{ fontSize: 12, color: t.muted, marginBottom: 12 }}>{txns.length} transaksi ditemukan</div>
        {txns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: t.muted }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 13 }}>Tidak ada transaksi yang sesuai</div>
          </div>
        ) : txns.map((tx) => {
          const cat = cats.find((c) => c.id === tx.categoryId);
          return (
            <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${cat?.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat?.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.note || cat?.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: t.muted }}>{tx.date}</span>
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: `${cat?.color}22`, color: cat?.color, fontWeight: 600 }}>{cat?.name}</span>
                  {!isMobile && tx.tags.map((tag) => <span key={tag} style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: t.hover, color: t.muted }}>#{tag}</span>)}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 800, color: tx.type === "income" ? "#10b981" : "#f43f5e", letterSpacing: -0.3 }}>
                  {tx.type === "income" ? "+" : "-"}{isMobile ? fmtShort(tx.amount) : fmt(tx.amount)}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "flex-end" }}>
                  <button onClick={() => openEditTx(tx)} style={{ background: t.hover, border: "none", borderRadius: 6, padding: "4px 7px", color: t.muted, cursor: "pointer" }}><Edit2 size={11} /></button>
                  <button onClick={() => deleteTx(tx.id)} style={{ background: "#f43f5e18", border: "none", borderRadius: 6, padding: "4px 7px", color: "#f43f5e", cursor: "pointer" }}><Trash2 size={11} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CategoriesView ─────────────────────────────────────────────────────────
function CategoriesView({ cats, txns, openNewCat, openEditCat, deleteCat, t, s, isMobile }) {
  const total = (id) => txns.filter((tx) => tx.categoryId === id).reduce((a, b) => a + b.amount, 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button onClick={openNewCat} style={{ ...s.btn(), display: "flex", alignItems: "center", gap: 6 }}><Plus size={15} /> Tambah Kategori</button>
      </div>
      {["income", "expense"].map((type) => (
        <div key={type} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: type === "income" ? "#10b981" : "#f43f5e", display: "inline-block" }}></span>
            {type === "income" ? "Pemasukan" : "Pengeluaran"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(230px,1fr))", gap: 10 }}>
            {cats.filter((c) => c.type === type).map((cat) => (
              <div key={cat.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 10, padding: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>Total: {fmtShort(total(cat.id))}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat.color, flexShrink: 0 }}></div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openEditCat(cat)} style={{ background: t.hover, border: "none", borderRadius: 6, padding: "6px", color: t.muted, cursor: "pointer" }}><Edit2 size={12} /></button>
                  <button onClick={() => deleteCat(cat.id)} style={{ background: "#f43f5e18", border: "none", borderRadius: 6, padding: "6px", color: "#f43f5e", cursor: "pointer" }}><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── BudgetsView ────────────────────────────────────────────────────────────
function BudgetsView({ budgetProgress, openNewBud, openEditBud, deleteBud, t, s, isMobile }) {
  const totalBudget = budgetProgress.reduce((a, b) => a + b.amount, 0);
  const totalSpent = budgetProgress.reduce((a, b) => a + b.spent, 0);
  return (
    <div>
      {/* Summary row: wraps on mobile */}
      <div style={{ ...s.card, display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 12 : 20 }}>
          {[["Anggaran", totalBudget, t.text], ["Terpakai", totalSpent, "#f43f5e"], ["Sisa", Math.max(0, totalBudget - totalSpent), "#10b981"]].map(([l, v, c]) => (
            <div key={l}>
              <div style={{ fontSize: 10, color: t.muted }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{fmtShort(v)}</div>
            </div>
          ))}
        </div>
        <button onClick={openNewBud} style={{ ...s.btn(), display: "flex", alignItems: "center", gap: 6 }}><Plus size={14} /> Set Anggaran</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(290px,1fr))", gap: 12 }}>
        {budgetProgress.map((b, i) => (
          <div key={i} style={{ ...s.card, borderLeft: `4px solid ${b.pct >= 100 ? "#f43f5e" : b.pct >= 80 ? "#f59e0b" : "#10b981"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${b.cat?.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{b.cat?.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{b.cat?.name}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>Batas: {fmtShort(b.amount)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => openEditBud(b)} style={{ background: t.hover, border: "none", borderRadius: 6, padding: "6px", color: t.muted, cursor: "pointer" }}><Edit2 size={12} /></button>
                <button onClick={() => deleteBud(b.id)} style={{ background: "#f43f5e18", border: "none", borderRadius: 6, padding: "6px", color: "#f43f5e", cursor: "pointer" }}><Trash2 size={12} /></button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: b.pct >= 100 ? "#f43f5e" : b.pct >= 80 ? "#f59e0b" : "#10b981" }}>{b.pct}% terpakai</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{fmtShort(b.spent)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: t.border, overflow: "hidden", marginBottom: 5 }}>
              <div style={{ height: "100%", width: `${b.pct}%`, background: b.pct >= 100 ? "#f43f5e" : b.pct >= 80 ? "#f59e0b" : "#10b981", borderRadius: 4 }}></div>
            </div>
            <div style={{ fontSize: 12, color: t.muted }}>
              {b.pct >= 100
                ? <span style={{ color: "#f43f5e", fontWeight: 700 }}>⚠️ Melebihi {fmtShort(b.spent - b.amount)}</span>
                : <>Sisa: <span style={{ color: "#10b981", fontWeight: 700 }}>{fmtShort(b.amount - b.spent)}</span></>
              }
            </div>
          </div>
        ))}
        {budgetProgress.length === 0 && (
          <div style={{ ...s.card, textAlign: "center", padding: 40, gridColumn: "1/-1" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎯</div>
            <div style={{ color: t.muted, fontSize: 13 }}>Belum ada anggaran. Tambah anggaran untuk mulai tracking!</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ReportsView ────────────────────────────────────────────────────────────
function ReportsView({ txns, cats, monthlyData, t, s, isMobile }) {
  const [from, setFrom] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() - 2); return d.toISOString().split("T")[0]; });
  const [to, setTo] = useState(new Date().toISOString().split("T")[0]);

  const filtered = useMemo(() => txns.filter((tx) => tx.date >= from && tx.date <= to), [txns, from, to]);
  const income = filtered.filter((tx) => tx.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = filtered.filter((tx) => tx.type === "expense").reduce((a, b) => a + b.amount, 0);

  const catData = useMemo(() => {
    const map = {};
    filtered.filter((tx) => tx.type === "expense").forEach((tx) => { map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount; });
    return Object.entries(map).map(([id, v]) => {
      const cat = cats.find((c) => c.id === Number(id));
      return { name: cat?.name || "?", value: v, color: cat?.color || "#888" };
    }).sort((a, b) => b.value - a.value);
  }, [filtered, cats]);

  return (
    <div>
      {/* Date range filter */}
      <div style={{ ...s.card, marginBottom: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: t.muted, whiteSpace: "nowrap" }}>Dari:</span>
          <input type="date" style={{ ...s.input }} value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: t.muted, whiteSpace: "nowrap" }}>S/d:</span>
          <input type="date" style={{ ...s.input }} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <span style={{ fontSize: 11, color: t.muted, whiteSpace: "nowrap" }}>{filtered.length} transaksi</span>
      </div>

      {/* Summary: 3 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
        {[["Pemasukan", income, "#10b981"], ["Pengeluaran", expense, "#f43f5e"], ["Net", income - expense, income - expense >= 0 ? "#10b981" : "#f43f5e"]].map(([l, v, c]) => (
          <div key={l} style={{ ...s.card, textAlign: "center", padding: isMobile ? 10 : 20 }}>
            <div style={{ fontSize: isMobile ? 10 : 12, color: t.muted, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: isMobile ? 13 : 20, fontWeight: 800, color: c, letterSpacing: -0.5 }}>{fmtShort(v)}</div>
          </div>
        ))}
      </div>

      {/* Charts: stack on mobile */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <div style={s.card}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: t.text }}>Tren Bulanan</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 170 : 230}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: t.muted }} />
              <YAxis tickFormatter={fmtShort} tick={{ fontSize: 9, fill: t.muted }} width={isMobile ? 48 : 64} />
              <Tooltip formatter={(v, n) => [fmt(v), n === "pemasukan" ? "Pemasukan" : "Pengeluaran"]} contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 12 }} />
              <Bar dataKey="pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
            {[["#10b981", "Pemasukan"], ["#f43f5e", "Pengeluaran"]].map(([c, l]) => (
              <span key={l} style={{ fontSize: 12, color: t.muted, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }}></span>{l}
              </span>
            ))}
          </div>
        </div>

        <div style={s.card}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: t.text }}>Rincian Pengeluaran</h3>
          {catData.length === 0 ? <div style={{ color: t.muted, textAlign: "center", paddingTop: 40, fontSize: 13 }}>Tidak ada data pengeluaran</div> :
            catData.map((item, i) => {
              const pct = Math.round(item.value / catData[0].value * 100);
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: t.text }}>{item.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{fmtShort(item.value)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: t.border, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: item.color, borderRadius: 3 }}></div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

// ─── AuthPage ───────────────────────────────────────────────────────────────
function AuthPage({ authTab, setAuthTab, loginF, setLoginF, regF, setRegF, err, setErr, handleLogin, handleReg, t, s, dark, setDark }) {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 12 }}>💰</div>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 900, color: t.text, letterSpacing: -0.5 }}>FinansSmart</h1>
          <p style={{ margin: 0, color: t.muted, fontSize: 13 }}>Kelola keuanganmu dengan lebih cerdas</p>
        </div>

        <div style={{ ...s.card, boxShadow: dark ? "0 24px 64px rgba(0,0,0,.5)" : "0 24px 64px rgba(0,0,0,.08)" }}>
          <div style={{ display: "flex", background: t.input, borderRadius: 9, padding: 4, marginBottom: 20 }}>
            {["login", "register"].map((tab) => (
              <button key={tab} onClick={() => { setAuthTab(tab); setErr(""); }}
                style={{ flex: 1, padding: "9px", borderRadius: 6, border: "none", background: authTab === tab ? t.surface : "transparent", color: authTab === tab ? t.text : t.muted, fontWeight: authTab === tab ? 700 : 400, fontSize: 13, cursor: "pointer" }}>
                {tab === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {err && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f43f5e18", border: "1px solid #f43f5e44", color: "#f43f5e", fontSize: 13, marginBottom: 14 }}>{err}</div>}

          {authTab === "login" ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Email</label>
                <input style={s.input} type="email" placeholder="email@kamu.com" value={loginF.email} onChange={(e) => setLoginF({ ...loginF, email: e.target.value })} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Password</label>
                <input style={s.input} type="password" placeholder="••••••••" value={loginF.pass} onChange={(e) => setLoginF({ ...loginF, pass: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>
              <button onClick={handleLogin} style={{ ...s.btn(), width: "100%", padding: "13px", fontSize: 15 }}>Masuk →</button>
              <div style={{ textAlign: "center", marginTop: 14, padding: "10px 12px", borderRadius: 8, background: t.input, fontSize: 12, color: t.muted }}>
                🔐 Demo: <code style={{ color: t.text }}>demo@keuangan.id</code> / <code style={{ color: t.text }}>demo123</code>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Nama Lengkap</label>
                <input style={s.input} placeholder="Nama kamu" value={regF.name} onChange={(e) => setRegF({ ...regF, name: e.target.value })} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Email</label>
                <input style={s.input} type="email" placeholder="email@kamu.com" value={regF.email} onChange={(e) => setRegF({ ...regF, email: e.target.value })} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Password</label>
                <input style={s.input} type="password" placeholder="Minimal 6 karakter" value={regF.pass} onChange={(e) => setRegF({ ...regF, pass: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleReg()} />
              </div>
              <button onClick={handleReg} style={{ ...s.btn(), width: "100%", padding: "13px", fontSize: 15 }}>Buat Akun Gratis →</button>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <button onClick={() => setDark(!dark)} style={{ background: "transparent", border: `1px solid ${t.border}`, borderRadius: 6, padding: "6px 12px", color: t.muted, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              {dark ? <Sun size={13} /> : <Moon size={13} />} {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const showFixedSidebar = windowWidth >= 1024;

  const [txns, setTxns] = useState(TXNS_INIT);
  const [cats, setCats] = useState(CATS_INIT);
  const [budgets, setBudgets] = useState(BUDGETS_INIT);

  const [loginF, setLoginF] = useState({ email: "demo@keuangan.id", pass: "demo123" });
  const [regF, setRegF] = useState({ name: "", email: "", pass: "" });
  const [err, setErr] = useState("");

  const [txModal, setTxModal] = useState(null);
  const [txF, setTxF] = useState({ type: "expense", categoryId: 5, amount: "", date: new Date().toISOString().split("T")[0], note: "", tags: "" });

  const [catModal, setCatModal] = useState(null);
  const [catF, setCatF] = useState({ name: "", type: "expense", color: "#6366f1", icon: "💰" });

  const [budModal, setBudModal] = useState(null);
  const [budF, setBudF] = useState({ categoryId: 5, amount: "" });

  const [search, setSearch] = useState("");
  const [fType, setFType] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [notifOpen, setNotifOpen] = useState(false);

  // Close sidebar on mobile when view changes
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [view, isMobile]);

  // Theme
  const t = useMemo(() => ({
    bg: dark ? "#0f172a" : "#f1f5f9",
    surface: dark ? "#1e293b" : "#ffffff",
    card: dark ? "#1e293b" : "#ffffff",
    border: dark ? "#334155" : "#e2e8f0",
    text: dark ? "#f1f5f9" : "#1e293b",
    muted: dark ? "#94a3b8" : "#64748b",
    hover: dark ? "#334155" : "#f8fafc",
    input: dark ? "#0f172a" : "#f8fafc",
    accent: "#6366f1",
    green: "#10b981",
    red: "#f43f5e",
    amber: "#f59e0b",
  }), [dark]);

  // Computed
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthTxns = useMemo(() => txns.filter((tx) => tx.date.startsWith(thisMonth)), [txns, thisMonth]);
  const totalIncome = useMemo(() => thisMonthTxns.filter((tx) => tx.type === "income").reduce((a, b) => a + b.amount, 0), [thisMonthTxns]);
  const totalExpense = useMemo(() => thisMonthTxns.filter((tx) => tx.type === "expense").reduce((a, b) => a + b.amount, 0), [thisMonthTxns]);
  const balance = useMemo(() => txns.filter((tx) => tx.type === "income").reduce((a, b) => a + b.amount, 0) - txns.filter((tx) => tx.type === "expense").reduce((a, b) => a + b.amount, 0), [txns]);

  const monthlyData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const mt = txns.filter((tx) => tx.date.startsWith(key));
    return { month: MONTHS_ID[d.getMonth()], pemasukan: mt.filter((tx) => tx.type === "income").reduce((a, b) => a + b.amount, 0), pengeluaran: mt.filter((tx) => tx.type === "expense").reduce((a, b) => a + b.amount, 0) };
  }), [txns]);

  const catPieData = useMemo(() => {
    const map = {};
    thisMonthTxns.filter((tx) => tx.type === "expense").forEach((tx) => { map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount; });
    return Object.entries(map).map(([id, v]) => {
      const cat = cats.find((c) => c.id === Number(id));
      return { name: cat?.name || "?", value: v, color: cat?.color || "#888" };
    }).sort((a, b) => b.value - a.value);
  }, [thisMonthTxns, cats]);

  const budgetProgress = useMemo(() => budgets.map((b) => {
    const cat = cats.find((c) => c.id === b.categoryId);
    const spent = thisMonthTxns.filter((tx) => tx.type === "expense" && tx.categoryId === b.categoryId).reduce((a, x) => a + x.amount, 0);
    return { ...b, cat, spent, pct: Math.min(Math.round(spent / b.amount * 100), 999) };
  }), [budgets, thisMonthTxns, cats]);

  const notifs = useMemo(() => {
    const list = [];
    budgetProgress.forEach((b) => {
      if (b.pct >= 100) list.push({ type: "danger", msg: `Budget ${b.cat?.name} sudah habis! (${Math.min(b.pct, 999)}%)` });
      else if (b.pct >= 80) list.push({ type: "warning", msg: `Budget ${b.cat?.name} hampir habis (${b.pct}%)` });
    });
    if (balance < 1000000) list.push({ type: "danger", msg: "⚠️ Saldo total kurang dari Rp 1 juta!" });
    return list;
  }, [budgetProgress, balance]);

  const filteredTxns = useMemo(() => txns.filter((tx) => {
    const cat = cats.find((c) => c.id === tx.categoryId);
    const ms = !search || tx.note.toLowerCase().includes(search.toLowerCase()) || cat?.name.toLowerCase().includes(search.toLowerCase()) || tx.tags.some((tg) => tg.includes(search.toLowerCase()));
    return ms && (fType === "all" || tx.type === fType) && (fCat === "all" || tx.categoryId === Number(fCat));
  }), [txns, search, fType, fCat, cats]);

  // Auth
  const handleLogin = () => {
    if (!loginF.email || !loginF.pass) { setErr("Isi semua field"); return; }
    setUser({ name: "Demo User", email: loginF.email }); setLoggedIn(true); setErr("");
  };
  const handleReg = () => {
    if (!regF.name || !regF.email || !regF.pass) { setErr("Isi semua field"); return; }
    if (regF.pass.length < 6) { setErr("Password minimal 6 karakter"); return; }
    setUser({ name: regF.name, email: regF.email }); setLoggedIn(true); setErr("");
  };

  // CRUD Transaction
  const openNewTx = () => { setTxF({ type: "expense", categoryId: 5, amount: "", date: new Date().toISOString().split("T")[0], note: "", tags: "" }); setTxModal("new"); };
  const openEditTx = (tx) => { setTxF({ type: tx.type, categoryId: tx.categoryId, amount: tx.amount, date: tx.date, note: tx.note, tags: tx.tags.join(", ") }); setTxModal(tx); };
  const saveTx = () => {
    if (!txF.amount || !txF.date) return;
    const n = { ...txF, amount: Number(txF.amount), tags: txF.tags.split(",").map((s) => s.trim()).filter(Boolean) };
    if (txModal === "new") setTxns((p) => [{ ...n, id: Date.now() }, ...p]);
    else setTxns((p) => p.map((tx) => tx.id === txModal.id ? { ...txModal, ...n } : tx));
    setTxModal(null);
  };
  const deleteTx = (id) => setTxns((p) => p.filter((tx) => tx.id !== id));

  // CRUD Category
  const openNewCat = () => { setCatF({ name: "", type: "expense", color: "#6366f1", icon: "💰" }); setCatModal("new"); };
  const openEditCat = (cat) => { setCatF({ name: cat.name, type: cat.type, color: cat.color, icon: cat.icon }); setCatModal(cat); };
  const saveCat = () => {
    if (!catF.name) return;
    if (catModal === "new") setCats((p) => [...p, { ...catF, id: Date.now() }]);
    else setCats((p) => p.map((c) => c.id === catModal.id ? { ...catModal, ...catF } : c));
    setCatModal(null);
  };
  const deleteCat = (id) => setCats((p) => p.filter((c) => c.id !== id));

  // CRUD Budget
  const openNewBud = () => { setBudF({ categoryId: 5, amount: "" }); setBudModal("new"); };
  const openEditBud = (b) => { setBudF({ categoryId: b.categoryId, amount: b.amount }); setBudModal(b); };
  const saveBud = () => {
    if (!budF.amount) return;
    const n = { ...budF, amount: Number(budF.amount) };
    if (budModal === "new") setBudgets((p) => [...p, { ...n, id: Date.now() }]);
    else setBudgets((p) => p.map((b) => b.id === budModal.id ? { ...budModal, ...n } : b));
    setBudModal(null);
  };
  const deleteBud = (id) => setBudgets((p) => p.filter((b) => b.id !== id));

  // Style helpers
  const s = {
    card: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: isMobile ? 14 : 20 },
    input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.input, color: t.text, fontSize: 14, outline: "none", boxSizing: "border-box" },
    btn: (color = "#6366f1", outline = false) => ({
      padding: "10px 18px", borderRadius: 8, border: `1px solid ${outline ? color : "transparent"}`,
      background: outline ? "transparent" : color, color: outline ? color : "#fff",
      cursor: "pointer", fontSize: 14, fontWeight: 700,
    }),
    navItem: (active) => ({
      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8,
      background: active ? "#6366f118" : "transparent", color: active ? "#6366f1" : t.muted,
      cursor: "pointer", fontSize: 14, fontWeight: active ? 700 : 400, marginBottom: 2,
    }),
  };

  if (!loggedIn) {
    return <AuthPage authTab={authTab} setAuthTab={setAuthTab} loginF={loginF} setLoginF={setLoginF} regF={regF} setRegF={setRegF} err={err} setErr={setErr} handleLogin={handleLogin} handleReg={handleReg} t={t} s={s} dark={dark} setDark={setDark} />;
  }

  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { id: "transactions", icon: <ArrowUpCircle size={18} />, label: "Transaksi" },
    { id: "categories", icon: <Tag size={18} />, label: "Kategori" },
    { id: "budgets", icon: <Target size={18} />, label: "Anggaran" },
    { id: "reports", icon: <BarChart2 size={18} />, label: "Laporan" },
  ];

  // Sidebar content — compact on mobile so no internal scroll needed
  const SidebarContent = () => {
    const mob = !showFixedSidebar; // shorthand: mobile/tablet drawer mode
    const vPad = mob ? 14 : 24;
    const hPad = mob ? 14 : 20;
    return (
      <aside style={{
        width: mob ? 240 : 260,
        background: t.surface,
        borderRight: `1px solid ${t.border}`,
        display: "flex",
        flexDirection: "column",
        padding: `${vPad}px ${hPad}px`,
        flexShrink: 0,
        height: "100%",
        overflowY: "hidden", // no scroll — content must fit
        boxShadow: "10px 0 30px rgba(0,0,0,0.05)",
        boxSizing: "border-box",
      }}>
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: mob ? 14 : 28, paddingBottom: mob ? 12 : 18, borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
          <div style={{ width: mob ? 34 : 42, height: mob ? 34 : 42, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: mob ? 16 : 20, flexShrink: 0 }}>💰</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: mob ? 14 : 16, color: t.text, letterSpacing: -0.5 }}>FinansSmart</div>
            {!mob && <div style={{ fontSize: 10, color: t.muted }}>Money Management</div>}
          </div>
          {mob && (
            <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: "auto", background: t.hover, border: "none", color: t.muted, cursor: "pointer", width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, minHeight: 0 }}>
          {!mob && <div style={{ fontSize: 10, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, paddingLeft: 12 }}>Menu Utama</div>}
          {navItems.map((item) => (
            <div key={item.id}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: mob ? "9px 12px" : "10px 14px", borderRadius: 8, background: view === item.id ? "#6366f118" : "transparent", color: view === item.id ? "#6366f1" : t.muted, cursor: "pointer", fontSize: mob ? 13 : 14, fontWeight: view === item.id ? 700 : 400, marginBottom: mob ? 1 : 2 }}
              onClick={() => { setView(item.id); if (mob) setSidebarOpen(false); }}>
              <div style={{ width: 20, display: "flex", justifyContent: "center", flexShrink: 0 }}>{item.icon}</div>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Notif alert — compact on mobile */}
        {notifs.length > 0 && (
          <div style={{ padding: mob ? "8px 10px" : "12px 14px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: `1px solid ${t.amber}33`, marginBottom: mob ? 10 : 16, flexShrink: 0 }}>
            <div style={{ fontSize: mob ? 11 : 12, color: t.amber, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              <Bell size={12} /> {notifs.length} Peringatan
            </div>
            {!mob && <p style={{ fontSize: 11, color: t.muted, margin: "4px 0 0" }}>Batas anggaran atau saldo perlu perhatian.</p>}
          </div>
        )}

        {/* User row */}
        <div style={{ paddingTop: mob ? 10 : 16, borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: mob ? 8 : 14 }}>
            <div style={{ width: mob ? 28 : 34, height: mob ? 28 : 34, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: mob ? 11 : 13, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: mob ? 12 : 13, fontWeight: 700, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
              {!mob && <div style={{ fontSize: 10, color: t.muted }}>Akun Personal</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setDark(!dark)} style={{ flex: 1, height: mob ? 32 : 36, borderRadius: 8, border: `1px solid ${t.border}`, background: t.hover, color: t.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={() => setLoggedIn(false)} style={{ flex: 1, height: mob ? 32 : 36, borderRadius: 8, border: "none", background: "#f43f5e15", color: "#f43f5e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* ── Desktop Fixed Sidebar ── */}
      {showFixedSidebar && (
        <div style={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0, zIndex: 20 }}>
          <SidebarContent />
        </div>
      )}

      {/* ── Mobile / Tablet Overlay Sidebar ── */}
      {!showFixedSidebar && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ 
              position: "fixed", inset: 0, 
              background: "rgba(0,0,0,0.4)", 
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              zIndex: 90,
              opacity: sidebarOpen ? 1 : 0,
              visibility: sidebarOpen ? "visible" : "hidden",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          {/* Drawer */}
          <div style={{ 
            position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
            height: "100dvh",
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: sidebarOpen ? "20px 0 50px rgba(0,0,0,0.3)" : "none",
          }}>
            <SidebarContent />
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <main style={{ flex: 1, overflow: "auto", minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: isMobile ? "12px 14px" : "14px 22px",
          borderBottom: `1px solid ${t.border}`, background: t.surface,
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
            {/* Show menu btn on mobile (to open drawer), hide on desktop with fixed sidebar */}
            {!showFixedSidebar && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "transparent", border: "none", color: t.muted, cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}><Menu size={20} /></button>
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: isMobile ? 15 : 17, fontWeight: 800, color: t.text }}>{navItems.find((n) => n.id === view)?.label}</h1>
              {!isMobile && <div style={{ fontSize: 11, color: t.muted }}>{now.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10 }}>
            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setNotifOpen(!notifOpen)}
                style={{ background: notifs.length ? "#f59e0b18" : "transparent", border: `1px solid ${notifs.length ? "#f59e0b55" : t.border}`, borderRadius: 8, padding: "8px 10px", color: notifs.length ? "#f59e0b" : t.muted, cursor: "pointer", position: "relative", display: "flex", alignItems: "center" }}>
                <Bell size={16} />
                {notifs.length > 0 && <span style={{ position: "absolute", top: -5, right: -5, width: 16, height: 16, borderRadius: "50%", background: "#f43f5e", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{notifs.length}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, width: isMobile ? 260 : 300, ...s.card, boxShadow: "0 12px 40px rgba(0,0,0,.3)", zIndex: 50 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: t.text }}>🔔 Notifikasi</div>
                  {notifs.length === 0 ? <div style={{ fontSize: 13, color: t.muted }}>Semua berjalan dengan baik!</div> :
                    notifs.map((n, i) => (
                      <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${t.border}`, display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{n.type === "danger" ? "🔴" : "🟡"}</span>
                        <span style={{ fontSize: 12, color: t.text }}>{n.msg}</span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            {/* Dark mode toggle on mobile */}
            {isMobile && (
              <button onClick={() => setDark(!dark)} style={{ background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 10px", color: t.muted, cursor: "pointer", display: "flex", alignItems: "center" }}>
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}
            <button onClick={openNewTx} style={{ ...s.btn(), display: "flex", alignItems: "center", gap: 5, padding: isMobile ? "9px 12px" : "9px 16px" }}>
              <Plus size={15} />{!isMobile && " Transaksi"}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: isMobile ? 12 : 22, paddingBottom: isMobile ? 80 : 22, flex: 1 }}>
          {view === "dashboard" && <DashboardView txns={txns} totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} monthlyData={monthlyData} catPieData={catPieData} budgetProgress={budgetProgress} t={t} s={s} cats={cats} openNewTx={openNewTx} isMobile={isMobile} />}
          {view === "transactions" && <TransactionsView txns={filteredTxns} cats={cats} search={search} setSearch={setSearch} fType={fType} setFType={setFType} fCat={fCat} setFCat={setFCat} openNewTx={openNewTx} openEditTx={openEditTx} deleteTx={deleteTx} t={t} s={s} isMobile={isMobile} />}
          {view === "categories" && <CategoriesView cats={cats} txns={txns} openNewCat={openNewCat} openEditCat={openEditCat} deleteCat={deleteCat} t={t} s={s} isMobile={isMobile} />}
          {view === "budgets" && <BudgetsView budgetProgress={budgetProgress} openNewBud={openNewBud} openEditBud={openEditBud} deleteBud={deleteBud} t={t} s={s} isMobile={isMobile} />}
          {view === "reports" && <ReportsView txns={txns} cats={cats} monthlyData={monthlyData} t={t} s={s} isMobile={isMobile} />}
        </div>

        {/* ── Mobile Bottom Navigation Bar ── */}
        {isMobile && (
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            background: t.surface, borderTop: `1px solid ${t.border}`,
            display: "flex", zIndex: 50,
            paddingBottom: "env(safe-area-inset-bottom, 8px)",
          }}>
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setView(item.id)} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "10px 4px 6px", background: "transparent", border: "none", cursor: "pointer",
                color: view === item.id ? "#6366f1" : t.muted,
                borderTop: view === item.id ? "2px solid #6366f1" : "2px solid transparent",
              }}>
                {item.icon}
                <span style={{ fontSize: 9, marginTop: 3, fontWeight: view === item.id ? 700 : 400 }}>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* ── Transaction Modal ── */}
      {txModal && (
        <Modal title={txModal === "new" ? "Tambah Transaksi" : "Edit Transaksi"} onClose={() => setTxModal(null)} t={t}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["expense", "income"].map((tp) => (
              <button key={tp} onClick={() => setTxF({ ...txF, type: tp, categoryId: tp === "income" ? 1 : 5 })}
                style={{ flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, border: `2px solid ${txF.type === tp ? (tp === "income" ? "#10b981" : "#f43f5e") : t.border}`, background: txF.type === tp ? (tp === "income" ? "#10b98118" : "#f43f5e18") : "transparent", color: txF.type === tp ? (tp === "income" ? "#10b981" : "#f43f5e") : t.muted }}>
                {tp === "income" ? "⬆ Pemasukan" : "⬇ Pengeluaran"}
              </button>
            ))}
          </div>
          {[
            { label: "Jumlah (Rp)", key: "amount", type: "number", placeholder: "0" },
            { label: "Tanggal", key: "date", type: "date" },
            { label: "Catatan", key: "note", placeholder: "Deskripsi transaksi..." },
            { label: "Tag (pisah koma)", key: "tags", placeholder: "rutin, penting..." },
          ].map(({ label, key, type = "text", placeholder }) => (
            <div key={key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>{label}</label>
              <input style={s.input} type={type} placeholder={placeholder} value={txF[key]} onChange={(e) => setTxF({ ...txF, [key]: e.target.value })} />
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Kategori</label>
            <select style={s.input} value={txF.categoryId} onChange={(e) => setTxF({ ...txF, categoryId: Number(e.target.value) })}>
              {cats.filter((c) => c.type === txF.type).map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setTxModal(null)} style={{ ...s.btn(t.border, true), flex: 1 }}>Batal</button>
            <button onClick={saveTx} style={{ ...s.btn(), flex: 2 }}>Simpan Transaksi</button>
          </div>
        </Modal>
      )}

      {/* ── Category Modal ── */}
      {catModal && (
        <Modal title={catModal === "new" ? "Tambah Kategori" : "Edit Kategori"} onClose={() => setCatModal(null)} t={t}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Nama Kategori</label>
            <input style={s.input} placeholder="Nama kategori" value={catF.name} onChange={(e) => setCatF({ ...catF, name: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Jenis</label>
            <select style={s.input} value={catF.type} onChange={(e) => setCatF({ ...catF, type: e.target.value })}>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Icon (emoji)</label>
            <input style={s.input} placeholder="💰" value={catF.icon} onChange={(e) => setCatF({ ...catF, icon: e.target.value })} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Warna</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="color" value={catF.color} onChange={(e) => setCatF({ ...catF, color: e.target.value })} style={{ width: 46, height: 40, borderRadius: 8, border: `1px solid ${t.border}`, cursor: "pointer", background: "none", padding: 2 }} />
              <input style={{ ...s.input, flex: 1 }} value={catF.color} onChange={(e) => setCatF({ ...catF, color: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setCatModal(null)} style={{ ...s.btn(t.border, true), flex: 1 }}>Batal</button>
            <button onClick={saveCat} style={{ ...s.btn(), flex: 2 }}>Simpan Kategori</button>
          </div>
        </Modal>
      )}

      {/* ── Budget Modal ── */}
      {budModal && (
        <Modal title={budModal === "new" ? "Set Anggaran Baru" : "Edit Anggaran"} onClose={() => setBudModal(null)} t={t}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Kategori</label>
            <select style={s.input} value={budF.categoryId} onChange={(e) => setBudF({ ...budF, categoryId: Number(e.target.value) })}>
              {cats.filter((c) => c.type === "expense").map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: t.muted, display: "block", marginBottom: 5 }}>Batas Anggaran Bulanan (Rp)</label>
            <input style={s.input} type="number" placeholder="500000" value={budF.amount} onChange={(e) => setBudF({ ...budF, amount: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setBudModal(null)} style={{ ...s.btn(t.border, true), flex: 1 }}>Batal</button>
            <button onClick={saveBud} style={{ ...s.btn(), flex: 2 }}>Simpan Anggaran</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
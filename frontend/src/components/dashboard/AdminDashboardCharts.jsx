"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { useLanguage } from "@/context/LanguageContext";
import { gramPanchayats } from "@/data/gramPanchayats";

const COLORS = {
  gold: "#CCBCA5",
  green: "#6ee7a8",
  blue: "#7dd3fc",
  amber: "#fbbf24",
  rose: "#fb7185",
};

function formatInrShort(amount) {
  const n = Number(amount) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function isCompleted(r) {
  return r.status === "Completed" || r.statusKn === "ಪೂರ್ಣಗೊಂಡಿದೆ";
}

function yearFromDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const m = String(value).match(/^(\d{4})/);
    return m ? Number(m[1]) : null;
  }
  return d.getFullYear();
}

function monthKey(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function filterByYear(works, year) {
  if (!works?.length) return [];
  if (year === "all") return works;
  const y = Number(year);
  return works.filter((r) => yearFromDate(r.startDate || r.updatedAt) === y);
}

function tooltipStyle() {
  return {
    backgroundColor: "var(--dash-panel)",
    border: "1px solid var(--dash-border)",
    borderRadius: 12,
    color: "var(--dash-text)",
    fontSize: 12,
  };
}

function EmptyChart({ label }) {
  return (
    <div className="h-[260px] flex items-center justify-center text-sm text-[var(--dash-text-40)]">
      {label}
    </div>
  );
}

function YearSelect({ value, onChange, years, t }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-[#CCBCA5]/40 bg-[var(--dash-bg)] text-[var(--dash-text)] text-[11px] font-black px-2.5 py-1 outline-none focus:border-[#CCBCA5]"
      aria-label={t.adminChartYear}
    >
      <option value="all">{t.adminChartAllYears}</option>
      {years.map((y) => (
        <option key={y} value={String(y)}>
          {y}
        </option>
      ))}
    </select>
  );
}

function ChartPanel({ title, hint, year, onYearChange, years, t, children }) {
  return (
    <div className="rounded-2xl border border-[#CCBCA5]/25 bg-[var(--dash-panel)] p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0 pr-2">
          <p className="text-[11px] font-black uppercase tracking-widest text-[#CCBCA5] leading-snug">
            {title}
          </p>
          {hint ? (
            <p className="text-[11px] text-[var(--dash-text-40)] mt-1 leading-snug">{hint}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--dash-text-30)] hidden sm:inline">
            {t.adminChartYear}
          </span>
          <YearSelect value={year} onChange={onYearChange} years={years} t={t} />
        </div>
      </div>
      <div className="mt-3 w-full" style={{ width: "100%", height: 260 }}>
        {children}
      </div>
    </div>
  );
}

function ChartBox({ children }) {
  return (
    <ResponsiveContainer
      width="100%"
      height={260}
      minWidth={0}
      initialDimension={{ width: 480, height: 260 }}
    >
      {children}
    </ResponsiveContainer>
  );
}

function buildMonthly(list, monthLabels) {
  const map = new Map();
  list.forEach((r) => {
    const mk = monthKey(r.startDate || r.updatedAt);
    if (!mk) return;
    const prev = map.get(mk) || {
      amount: 0,
      count: 0,
      ongoing: 0,
      completed: 0,
    };
    prev.amount += Number(r.amountSanctioned) || 0;
    prev.count += 1;
    if (isCompleted(r)) prev.completed += 1;
    else prev.ongoing += 1;
    map.set(mk, prev);
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({
      label: monthLabels(k),
      amount: v.amount,
      count: v.count,
      ongoing: v.ongoing,
      completed: v.completed,
    }));
}

export default function AdminDashboardCharts({ works = [] }) {
  const { lang, t } = useLanguage();
  const [ready, setReady] = useState(false);
  const [years, setYears] = useState({
    column: "all",
    pie: "all",
    line: "all",
    bar: "all",
    area: "all",
    combo: "all",
  });

  useEffect(() => {
    setReady(true);
  }, []);

  const yearOptions = useMemo(() => {
    const set = new Set();
    (works || []).forEach((r) => {
      const y = yearFromDate(r.startDate || r.updatedAt);
      if (y) set.add(y);
    });
    return [...set].sort((a, b) => b - a);
  }, [works]);

  const setYear = (key, value) => {
    setYears((prev) => ({ ...prev, [key]: value }));
  };

  const monthLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang === "kn" ? "kn-IN" : "en-IN", {
      month: "short",
    });
    return (key) => {
      const [yy, mm] = key.split("-");
      return fmt.format(new Date(Number(yy), Number(mm) - 1, 1));
    };
  }, [lang]);

  const columnList = useMemo(
    () => filterByYear(works, years.column),
    [works, years.column]
  );
  const pieList = useMemo(() => filterByYear(works, years.pie), [works, years.pie]);
  const lineList = useMemo(
    () => filterByYear(works, years.line),
    [works, years.line]
  );
  const barList = useMemo(() => filterByYear(works, years.bar), [works, years.bar]);
  const areaList = useMemo(
    () => filterByYear(works, years.area),
    [works, years.area]
  );
  const comboList = useMemo(
    () => filterByYear(works, years.combo),
    [works, years.combo]
  );

  const columnData = useMemo(() => {
    const map = new Map();
    columnList.forEach((r) => {
      const key = r.gramPanchayat || "—";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()]
      .map(([gp, count]) => {
        const found = gramPanchayats.find((g) => g.name === gp);
        const name = lang === "kn" && found ? found.nameKn : gp;
        return {
          name,
          short: name.length > 10 ? `${name.slice(0, 10)}…` : name,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [columnList, lang]);

  const pieData = useMemo(() => {
    let ongoing = 0;
    let completed = 0;
    pieList.forEach((r) => {
      if (isCompleted(r)) completed += 1;
      else ongoing += 1;
    });
    return [
      { name: t.chartOngoing, value: ongoing, color: COLORS.amber },
      { name: t.chartCompleted, value: completed, color: COLORS.green },
    ].filter((d) => d.value > 0);
  }, [pieList, t]);

  const lineData = useMemo(
    () => buildMonthly(lineList, monthLabels),
    [lineList, monthLabels]
  );
  const areaData = useMemo(
    () => buildMonthly(areaList, monthLabels),
    [areaList, monthLabels]
  );
  const comboData = useMemo(
    () => buildMonthly(comboList, monthLabels),
    [comboList, monthLabels]
  );

  const barData = useMemo(() => {
    const map = new Map();
    barList.forEach((r) => {
      const key =
        (lang === "kn" && r.yojaneKn ? r.yojaneKn : r.yojane) ||
        (lang === "kn" ? "ಇತರೆ" : "Other");
      map.set(key, (map.get(key) || 0) + (Number(r.amountSanctioned) || 0));
    });
    return [...map.entries()]
      .map(([name, amount]) => ({
        name,
        short: name.length > 14 ? `${name.slice(0, 14)}…` : name,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [barList, lang]);

  const noData = t.adminChartNoData;

  if (!ready) {
    return (
      <div className="rounded-2xl border border-[#CCBCA5]/20 bg-[var(--dash-panel-soft)] px-6 py-16 text-center text-[var(--dash-text-40)] text-sm">
        Loading charts…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#CCBCA5]">
          {t.adminChartsSection}
        </p>
        <p className="text-xs text-[var(--dash-text-40)] mt-1">{t.adminChartInteractiveHint}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartPanel
          title={t.adminChartTitleWorksByGp}
          hint={t.adminChartHintWorksByGp}
          year={years.column}
          onYearChange={(v) => setYear("column", v)}
          years={yearOptions}
          t={t}
        >
          {columnData.length ? (
            <ChartBox>
              <BarChart data={columnData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(204,188,165,0.12)" />
                <XAxis
                  dataKey="short"
                  tick={{ fill: "var(--dash-accent)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--dash-border)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--dash-text-50)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={tooltipStyle()}
                  formatter={(v) => [v, t.chartTotalWorks]}
                  labelFormatter={(_, p) => p?.[0]?.payload?.name || ""}
                />
                <Bar dataKey="count" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartBox>
          ) : (
            <EmptyChart label={noData} />
          )}
        </ChartPanel>

        <ChartPanel
          title={t.adminChartTitleStatus}
          hint={t.adminChartHintStatus}
          year={years.pie}
          onYearChange={(v) => setYear("pie", v)}
          years={yearOptions}
          t={t}
        >
          {pieData.length ? (
            <ChartBox>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={48}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#e5e7eb" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ChartBox>
          ) : (
            <EmptyChart label={noData} />
          )}
        </ChartPanel>

        <ChartPanel
          title={t.adminChartTitleAmountTrend}
          hint={t.adminChartHintAmountTrend}
          year={years.line}
          onYearChange={(v) => setYear("line", v)}
          years={yearOptions}
          t={t}
        >
          {lineData.length ? (
            <ChartBox>
              <LineChart data={lineData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(204,188,165,0.12)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--dash-accent)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--dash-border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--dash-text-50)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatInrShort(v)}
                  width={48}
                />
                <Tooltip
                  contentStyle={tooltipStyle()}
                  formatter={(v) => [formatInrShort(v), t.chartTotalAmount]}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={COLORS.amber}
                  strokeWidth={3}
                  dot={{ r: 3, fill: COLORS.amber }}
                />
              </LineChart>
            </ChartBox>
          ) : (
            <EmptyChart label={noData} />
          )}
        </ChartPanel>

        <ChartPanel
          title={t.adminChartTitleByYojane}
          hint={t.adminChartHintByYojane}
          year={years.bar}
          onYearChange={(v) => setYear("bar", v)}
          years={yearOptions}
          t={t}
        >
          {barData.length ? (
            <ChartBox>
              <BarChart
                layout="vertical"
                data={barData}
                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(204,188,165,0.12)" />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--dash-text-50)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatInrShort(v)}
                />
                <YAxis
                  type="category"
                  dataKey="short"
                  width={96}
                  tick={{ fill: "var(--dash-accent)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle()}
                  formatter={(v) => [formatInrShort(v), t.chartTotalAmount]}
                  labelFormatter={(_, p) => p?.[0]?.payload?.name || ""}
                />
                <Bar dataKey="amount" fill={COLORS.rose} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ChartBox>
          ) : (
            <EmptyChart label={noData} />
          )}
        </ChartPanel>

        <ChartPanel
          title={t.adminChartTitleProgress}
          hint={t.adminChartHintProgress}
          year={years.area}
          onYearChange={(v) => setYear("area", v)}
          years={yearOptions}
          t={t}
        >
          {areaData.length ? (
            <ChartBox>
              <AreaChart data={areaData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(204,188,165,0.12)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--dash-accent)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--dash-border)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--dash-text-50)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#e5e7eb" }}>{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="ongoing"
                  name={t.chartOngoing}
                  stackId="1"
                  stroke={COLORS.amber}
                  fill={COLORS.amber}
                  fillOpacity={0.45}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name={t.chartCompleted}
                  stackId="1"
                  stroke={COLORS.green}
                  fill={COLORS.green}
                  fillOpacity={0.45}
                />
              </AreaChart>
            </ChartBox>
          ) : (
            <EmptyChart label={noData} />
          )}
        </ChartPanel>

        <ChartPanel
          title={t.adminChartTitleCombo}
          hint={t.adminChartHintCombo}
          year={years.combo}
          onYearChange={(v) => setYear("combo", v)}
          years={yearOptions}
          t={t}
        >
          {comboData.length ? (
            <ChartBox>
              <ComposedChart
                data={comboData}
                margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(204,188,165,0.12)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--dash-accent)", fontSize: 10 }}
                  axisLine={{ stroke: "var(--dash-border)" }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  allowDecimals={false}
                  tick={{ fill: "var(--dash-text-50)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "var(--dash-text-50)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatInrShort(v)}
                  width={48}
                />
                <Tooltip
                  contentStyle={tooltipStyle()}
                  formatter={(value, name) =>
                    name === t.chartTotalAmount
                      ? [formatInrShort(value), t.chartTotalAmount]
                      : [value, t.chartTotalWorks]
                  }
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#e5e7eb" }}>{value}</span>
                  )}
                />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  name={t.chartTotalWorks}
                  fill={COLORS.blue}
                  radius={[5, 5, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="amount"
                  name={t.chartTotalAmount}
                  stroke={COLORS.rose}
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: COLORS.rose }}
                />
              </ComposedChart>
            </ChartBox>
          ) : (
            <EmptyChart label={noData} />
          )}
        </ChartPanel>
      </div>
    </div>
  );
}

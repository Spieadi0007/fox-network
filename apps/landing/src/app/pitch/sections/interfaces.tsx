"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp, viewportConfig } from "@/lib/animations";
import { usePitchColors } from "@/app/pitch/pitch-theme";

/* ── Desktop Monitor — Client Dashboard ── */
function DesktopMonitor({ inView }: { inView: boolean }) {
  const c = usePitchColors();
  return (
    <svg viewBox="0 0 360 260" className="w-full">
      {/* Stand */}
      <rect x="145" y="230" width="70" height="8" rx="3" fill={c.subtle} />
      <rect x="163" y="218" width="34" height="16" rx="2" fill={c.subtle} />

      {/* Monitor body */}
      <motion.rect
        x="10" y="5" width="340" height="213" rx="10"
        fill={c.panel}
        stroke="rgba(59,130,246,0.3)"
        strokeWidth="1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
      <rect x="18" y="13" width="324" height="195" rx="4" fill={c.screen} />

      <motion.g
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        {/* ── Sidebar ── */}
        <rect x="18" y="13" width="52" height="195" fill={c.uiElement} rx="4" />
        {/* Logo placeholder */}
        <rect x="26" y="22" width="36" height="6" rx="2" fill="rgba(59,130,246,0.4)" />
        {/* Nav items */}
        {["Overview", "Assets", "SLA", "Reports", "Settings"].map((_, i) => (
          <g key={i}>
            <rect x="26" y={40 + i * 20} width="6" height="6" rx="1.5" fill={i === 0 ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"} />
            <rect x="36" y={41 + i * 20} width={i === 0 ? 28 : 20 + i * 2} height="4" rx="1" fill={i === 0 ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.06)"} />
          </g>
        ))}

        {/* ── Top bar ── */}
        <rect x="70" y="13" width="272" height="24" fill={c.uiBg} />
        <text x="80" y="28" fill={c.textDim} fontSize="6.5" fontWeight="600" fontFamily="var(--font-body)">Fleet Overview</text>
        {/* Search bar */}
        <rect x="180" y="19" width="80" height="12" rx="6" fill={c.uiElement} />
        <text x="190" y="27.5" fill={c.textDimmer} fontSize="5" fontFamily="var(--font-body)">Search assets...</text>
        {/* Profile */}
        <circle cx="326" cy="25" r="6" fill="rgba(59,130,246,0.2)" />
        <text x="326" y="27.5" textAnchor="middle" fill="rgba(59,130,246,0.6)" fontSize="5" fontWeight="700">A</text>

        {/* ── Metric cards row ── */}
        {[
          { label: "Active Assets", value: "14,328", change: "+2.4%", color: "rgba(59,130,246,0.7)" },
          { label: "Uptime SLA", value: "96.4%", change: "+0.8%", color: "rgba(34,197,94,0.7)" },
          { label: "Open Tasks", value: "847", change: "-12%", color: "rgba(249,115,22,0.7)" },
          { label: "Avg Response", value: "2.1h", change: "-18%", color: "rgba(139,92,246,0.7)" },
        ].map((m, i) => (
          <g key={i}>
            <rect x={76 + i * 65} y="43" width="60" height="36" rx="4" fill={c.uiBg2} stroke={c.strokeFaint} strokeWidth="0.5" />
            <text x={82 + i * 65} y="53" fill={c.textDimmer} fontSize="4.5" fontFamily="var(--font-body)">{m.label}</text>
            <text x={82 + i * 65} y="63" fill={c.text} fontSize="8" fontWeight="700" fontFamily="var(--font-mono), monospace">{m.value}</text>
            <text x={82 + i * 65} y="73" fill={m.color} fontSize="4.5" fontWeight="600" fontFamily="var(--font-mono), monospace">{m.change}</text>
          </g>
        ))}

        {/* ── Chart area ── */}
        <rect x="76" y="84" width="158" height="80" rx="4" fill={c.uiBg2} stroke={c.strokeFaint} strokeWidth="0.5" />
        <text x="84" y="95" fill={c.textDim} fontSize="5" fontWeight="600" fontFamily="var(--font-body)">Asset Uptime Trend</text>
        <text x="220" y="95" textAnchor="end" fill={c.textDimmer} fontSize="4" fontFamily="var(--font-body)">Last 30 days</text>
        {/* Chart line */}
        <motion.path
          d="M86 148 Q100 145 110 140 Q120 132 130 135 Q140 130 150 125 Q160 118 170 120 Q180 115 190 110 Q200 105 210 108 Q220 102 225 100"
          fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
          transition={{ delay: 1.2, duration: 1 }}
        />
        {/* Chart area fill */}
        <path
          d="M86 148 Q100 145 110 140 Q120 132 130 135 Q140 130 150 125 Q160 118 170 120 Q180 115 190 110 Q200 105 210 108 Q220 102 225 100 L225 156 L86 156 Z"
          fill="rgba(59,130,246,0.06)"
        />
        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="86" y1={108 + i * 14} x2="225" y2={108 + i * 14} stroke={c.strokeFaint} strokeWidth="0.5" />
        ))}

        {/* ── SLA donut + stats ── */}
        <rect x="240" y="84" width="96" height="80" rx="4" fill={c.uiBg2} stroke={c.strokeFaint} strokeWidth="0.5" />
        <text x="248" y="95" fill={c.textDim} fontSize="5" fontWeight="600" fontFamily="var(--font-body)">SLA Compliance</text>
        <circle cx="288" cy="124" r="18" fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="5" />
        <circle cx="288" cy="124" r="18" fill="none" stroke="#3B82F6" strokeWidth="5"
          strokeDasharray="108.5 4.5" strokeLinecap="round" transform="rotate(-90,288,124)" />
        <text x="288" y="127" textAnchor="middle" fill={c.text} fontSize="9" fontWeight="700" fontFamily="var(--font-mono), monospace">96%</text>
        <text x="288" y="136" textAnchor="middle" fill={c.textDimmer} fontSize="4.5" fontFamily="var(--font-body)">Target: 95%</text>
        {/* Legend dots */}
        <circle cx="250" cy="152" r="2" fill="#3B82F6" />
        <text x="256" y="154" fill={c.textDimmer} fontSize="4" fontFamily="var(--font-body)">On Target</text>
        <circle cx="290" cy="152" r="2" fill="rgba(239,68,68,0.5)" />
        <text x="296" y="154" fill={c.textDimmer} fontSize="4" fontFamily="var(--font-body)">Breached</text>

        {/* ── Job table ── */}
        <rect x="76" y="168" width="260" height="36" rx="4" fill={c.uiBg2} stroke={c.strokeFaint} strokeWidth="0.5" />
        <text x="84" y="178" fill={c.textDim} fontSize="5" fontWeight="600" fontFamily="var(--font-body)">Recent Interventions</text>
        {/* Table header */}
        {["Asset ID", "Type", "Status", "Tech", "SLA"].map((h, i) => (
          <text key={i} x={84 + i * 50} y="186" fill={c.textDimmer} fontSize="3.8" fontWeight="600" fontFamily="var(--font-mono), monospace">{h}</text>
        ))}
        {/* Table rows */}
        {[0, 1].map((row) => (
          <g key={row}>
            <text x="84" y={193 + row * 7} fill={c.textDim} fontSize="3.8" fontFamily="var(--font-mono), monospace">#EV-{4021 + row}</text>
            <text x="134" y={193 + row * 7} fill={c.textDimmer} fontSize="3.8" fontFamily="var(--font-body)">{row === 0 ? "Repair" : "Install"}</text>
            <rect x="184" y={189.5 + row * 7} width="20" height="5" rx="2.5" fill={row === 0 ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.15)"} />
            <text x="194" y={193 + row * 7} textAnchor="middle" fill={row === 0 ? "rgba(34,197,94,0.7)" : "rgba(249,115,22,0.7)"} fontSize="3.5" fontWeight="600" fontFamily="var(--font-body)">{row === 0 ? "Done" : "Active"}</text>
            <text x="234" y={193 + row * 7} fill={c.textDimmer} fontSize="3.8" fontFamily="var(--font-body)">{row === 0 ? "M. Silva" : "K. Patel"}</text>
            <rect x="284" y={189.5 + row * 7} width="12" height="5" rx="2.5" fill="rgba(34,197,94,0.12)" />
            <text x="290" y={193 + row * 7} textAnchor="middle" fill="rgba(34,197,94,0.6)" fontSize="3.5" fontWeight="600">OK</text>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

/* ── Laptop — Partner Portal ── */
function LaptopScreen({ inView }: { inView: boolean }) {
  const c = usePitchColors();
  return (
    <svg viewBox="0 0 360 250" className="w-full">
      {/* Laptop base */}
      <path d="M5 228 L40 215 L320 215 L355 228 Z" fill={c.subtleFaint} stroke={c.strokeLight} strokeWidth="0.8" />

      {/* Screen body */}
      <motion.rect
        x="30" y="8" width="300" height="207" rx="8"
        fill={c.panel}
        stroke="rgba(59,130,246,0.25)"
        strokeWidth="1.5"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.4, duration: 0.5 }}
      />
      <rect x="38" y="16" width="284" height="190" rx="3" fill={c.screen} />

      <motion.g
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {/* ── Top nav ── */}
        <rect x="38" y="16" width="284" height="22" rx="3" fill={c.uiBg} />
        <rect x="46" y="22" width="28" height="6" rx="2" fill="rgba(59,130,246,0.4)" />
        <text x="80" y="28" fill={c.textDim} fontSize="5.5" fontWeight="600" fontFamily="var(--font-body)">Partner Portal</text>
        {/* Nav tabs */}
        {["Dashboard", "Tasks", "Team", "Reports"].map((tab, i) => (
          <text key={i} x={150 + i * 38} y="28" fill={i === 1 ? "rgba(59,130,246,0.7)" : c.textDimmer} fontSize="5" fontWeight={i === 1 ? "600" : "400"} fontFamily="var(--font-body)">{tab}</text>
        ))}

        {/* ── Left panel: Today's tasks ── */}
        <rect x="42" y="42" width="136" height="160" rx="4" fill={c.uiBg2} stroke={c.strokeFaint} strokeWidth="0.5" />
        <text x="50" y="54" fill={c.textDim} fontSize="5.5" fontWeight="700" fontFamily="var(--font-body)">Today&apos;s Tasks</text>
        <rect x="145" y="47" width="26" height="10" rx="5" fill="rgba(59,130,246,0.12)" />
        <text x="158" y="54" textAnchor="middle" fill="rgba(59,130,246,0.7)" fontSize="5" fontWeight="600" fontFamily="var(--font-mono), monospace">24</text>

        {/* Task cards */}
        {[
          { id: "INS-4021", type: "Installation", tech: "M. Silva", status: "In Progress", statusColor: "rgba(59,130,246,0.7)", statusBg: "rgba(59,130,246,0.12)", time: "09:30" },
          { id: "MNT-3887", type: "Preventive", tech: "K. Patel", status: "Scheduled", statusColor: "rgba(249,115,22,0.7)", statusBg: "rgba(249,115,22,0.12)", time: "11:00" },
          { id: "REP-2194", type: "Reactive", tech: "L. Garcia", status: "Completed", statusColor: "rgba(34,197,94,0.7)", statusBg: "rgba(34,197,94,0.12)", time: "08:15" },
          { id: "INS-4023", type: "Installation", tech: "R. Ahmed", status: "Pending", statusColor: c.textDimmer, statusBg: c.subtle, time: "14:00" },
        ].map((task, i) => (
          <g key={i}>
            <rect x="48" y={62 + i * 34} width="124" height="30" rx="4" fill={c.uiElement} stroke={i === 0 ? "rgba(59,130,246,0.2)" : c.strokeFaint} strokeWidth={i === 0 ? "1" : "0.5"} />
            <text x="54" y={73 + i * 34} fill={c.text} fontSize="5" fontWeight="600" fontFamily="var(--font-mono), monospace">{task.id}</text>
            <text x="100" y={73 + i * 34} fill={c.textDimmer} fontSize="4.5" fontFamily="var(--font-body)">{task.type}</text>
            <text x="152" y={73 + i * 34} textAnchor="end" fill={c.textDimmer} fontSize="4" fontFamily="var(--font-mono), monospace">{task.time}</text>
            <text x="54" y={83 + i * 34} fill={c.textDimmer} fontSize="4.5" fontFamily="var(--font-body)">{task.tech}</text>
            <rect x="108" y={77 + i * 34} width="32" height="8" rx="4" fill={task.statusBg} />
            <text x="124" y={83 + i * 34} textAnchor="middle" fill={task.statusColor} fontSize="3.8" fontWeight="600" fontFamily="var(--font-body)">{task.status}</text>
          </g>
        ))}

        {/* ── Right panel: Map + stats ── */}
        <rect x="182" y="42" width="136" height="100" rx="4" fill={c.uiBg2} stroke={c.strokeFaint} strokeWidth="0.5" />
        <text x="190" y="54" fill={c.textDim} fontSize="5.5" fontWeight="700" fontFamily="var(--font-body)">Coverage Map</text>
        {/* Map area */}
        <rect x="188" y="58" width="124" height="60" rx="3" fill={c.uiElement} />
        {/* Map dots - clustered locations */}
        {[
          [210, 72, 3], [230, 68, 2], [250, 78, 4], [270, 70, 2],
          [220, 88, 3], [240, 92, 2], [260, 85, 1], [290, 82, 2],
          [200, 98, 1], [235, 78, 2], [275, 95, 3], [255, 100, 1],
        ].map(([cx, cy, r], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r as number} fill="rgba(59,130,246,0.15)" />
            <circle cx={cx} cy={cy} r="1.5" fill="rgba(59,130,246,0.6)" />
          </g>
        ))}
        {/* Pulsing active dot */}
        <motion.circle cx="250" cy="78" r="4" fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth="0.8"
          animate={inView ? { r: [4, 8, 4], opacity: [0.6, 0, 0.6] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Map legend */}
        <text x="190" y="130" fill={c.textDimmer} fontSize="4" fontFamily="var(--font-body)">12 techs active</text>
        <text x="278" y="130" fill={c.textDimmer} fontSize="4" fontFamily="var(--font-body)">3 regions</text>

        {/* ── Team performance ── */}
        <rect x="182" y="146" width="136" height="56" rx="4" fill={c.uiBg2} stroke={c.strokeFaint} strokeWidth="0.5" />
        <text x="190" y="158" fill={c.textDim} fontSize="5.5" fontWeight="700" fontFamily="var(--font-body)">Team Performance</text>
        {/* Mini bars */}
        {[
          { name: "M. Silva", pct: 94, w: 95 },
          { name: "K. Patel", pct: 88, w: 89 },
          { name: "L. Garcia", pct: 91, w: 92 },
        ].map((t, i) => (
          <g key={i}>
            <text x="190" y={170 + i * 10} fill={c.textDimmer} fontSize="4" fontFamily="var(--font-body)">{t.name}</text>
            <rect x="228" y={166 + i * 10} width="70" height="5" rx="2.5" fill={c.subtle} />
            <rect x="228" y={166 + i * 10} width={t.w * 0.7} height="5" rx="2.5" fill="rgba(59,130,246,0.4)" />
            <text x="304" y={170 + i * 10} fill={c.textDimmer} fontSize="3.8" fontFamily="var(--font-mono), monospace">{t.pct}%</text>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

/* ── Phone — Technician App ── */
function PhoneScreen({ inView }: { inView: boolean }) {
  const c = usePitchColors();
  return (
    <svg viewBox="0 0 180 360" className="w-full max-w-[200px]">
      {/* Phone body */}
      <motion.rect
        x="15" y="5" width="150" height="350" rx="22"
        fill={c.panel}
        stroke="rgba(139,92,246,0.3)"
        strokeWidth="1.5"
        initial={{ opacity: 0, y: 15 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5, duration: 0.5 }}
      />
      {/* Dynamic Island */}
      <rect x="60" y="10" width="60" height="12" rx="6" fill={c.subtle} />
      {/* Screen */}
      <rect x="22" y="28" width="136" height="320" rx="4" fill={c.screen} />

      <motion.g
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        {/* Status bar */}
        <text x="32" y="42" fill={c.textDimmer} fontSize="6.5" fontWeight="600" fontFamily="var(--font-mono), monospace">9:41</text>
        <text x="148" y="42" textAnchor="end" fill={c.textDimmer} fontSize="6.5" fontFamily="var(--font-mono), monospace">100%</text>
        {/* Signal + wifi icons */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={120 + i * 4} y={37 - i} width="2.5" height={3 + i} rx="0.5" fill={c.textDimmer} />
        ))}

        {/* ── Header ── */}
        <text x="90" y="60" textAnchor="middle" fill={c.text} fontSize="9" fontWeight="700" fontFamily="var(--font-body)">Current Job</text>

        {/* ── Job info card ── */}
        <rect x="28" y="68" width="124" height="44" rx="6" fill={c.uiBg2} stroke={c.strokeFaint} strokeWidth="0.5" />
        <rect x="34" y="74" width="28" height="8" rx="4" fill="rgba(59,130,246,0.15)" />
        <text x="48" y="80" textAnchor="middle" fill="rgba(59,130,246,0.7)" fontSize="5" fontWeight="600" fontFamily="var(--font-mono), monospace">INS-4021</text>
        <text x="70" y="80" fill={c.textDimmer} fontSize="5" fontFamily="var(--font-body)">Installation</text>
        <text x="34" y="92" fill={c.text} fontSize="5.5" fontWeight="600" fontFamily="var(--font-body)">EV Charger — Site Alpha-12</text>
        <text x="34" y="100" fill={c.textDimmer} fontSize="4.5" fontFamily="var(--font-body)">Madrid, Calle Gran Via 42</text>
        {/* Priority badge */}
        <rect x="118" y="74" width="28" height="8" rx="4" fill="rgba(249,115,22,0.15)" />
        <text x="132" y="80" textAnchor="middle" fill="rgba(249,115,22,0.7)" fontSize="4.5" fontWeight="600" fontFamily="var(--font-body)">Priority</text>

        {/* ── Checklist ── */}
        <text x="32" y="126" fill={c.textDim} fontSize="6" fontWeight="700" fontFamily="var(--font-body)">Task Steps</text>
        <text x="148" y="126" textAnchor="end" fill={c.textDimmer} fontSize="5" fontFamily="var(--font-body)">3 / 5</text>

        {[
          { label: "Site inspection", checked: true },
          { label: "Unpack equipment", checked: true },
          { label: "Mount charger unit", checked: true },
          { label: "Wire connection", checked: false, active: true },
          { label: "Final test & photo", checked: false },
        ].map((item, i) => (
          <g key={i}>
            <rect x="28" y={132 + i * 22} width="124" height="18" rx="5"
              fill={item.active ? "rgba(59,130,246,0.06)" : c.uiElement}
              stroke={item.active ? "rgba(59,130,246,0.2)" : c.strokeFaint}
              strokeWidth={item.active ? "1" : "0.5"}
            />
            {/* Checkbox */}
            <rect x="34" y={136 + i * 22} width="10" height="10" rx="3"
              fill={item.checked ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.04)"}
              stroke={item.checked ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}
              strokeWidth="0.8"
            />
            {item.checked && (
              <path d={`M36.5 ${141 + i * 22} L38.5 ${143 + i * 22} L42 ${139 + i * 22}`}
                stroke="rgba(34,197,94,0.9)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            )}
            {item.active && (
              <circle cx="37.5" cy={141 + i * 22} r="2.5" fill="rgba(59,130,246,0.4)" />
            )}
            <text x="50" y={144 + i * 22}
              fill={item.checked ? c.textDimmer : item.active ? "rgba(59,130,246,0.8)" : c.textMuted}
              fontSize="5.5" fontWeight={item.active ? "600" : "400"} fontFamily="var(--font-body)"
              textDecoration={item.checked ? "line-through" : "none"}
            >{item.label}</text>
            {item.checked && (
              <text x="142" y={144 + i * 22} textAnchor="end" fill="rgba(34,197,94,0.5)" fontSize="4" fontFamily="var(--font-mono), monospace">Done</text>
            )}
          </g>
        ))}

        {/* ── Photo capture button ── */}
        <rect x="28" y="246" width="58" height="26" rx="8" fill={c.uiBg2} stroke="rgba(139,92,246,0.2)" strokeWidth="0.8" />
        <rect x="44" y="252" width="14" height="10" rx="3" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8" />
        <circle cx="51" cy="257" r="3" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="0.8" />
        <text x="57" y="268" fill={c.textDimmer} fontSize="4" fontFamily="var(--font-body)">Photo</text>

        {/* ── Complete Step button ── */}
        <rect x="92" y="246" width="60" height="26" rx="8" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
        <text x="122" y="262" textAnchor="middle" fill="rgba(59,130,246,0.9)" fontSize="6.5" fontWeight="700" fontFamily="var(--font-body)">Complete Step</text>

        {/* ── Timer ── */}
        <rect x="28" y="280" width="124" height="20" rx="6" fill={c.uiBg2} />
        <text x="44" y="293" fill={c.textDimmer} fontSize="5" fontFamily="var(--font-body)">Time on site</text>
        <text x="142" y="293" textAnchor="end" fill="rgba(59,130,246,0.7)" fontSize="6.5" fontWeight="700" fontFamily="var(--font-mono), monospace">01:24:38</text>

        {/* ── Bottom nav ── */}
        <rect x="22" y="306" width="136" height="42" rx="4" fill={c.uiElement} />
        {[
          { label: "Jobs", active: true },
          { label: "Map", active: false },
          { label: "Parts", active: false },
          { label: "Chat", active: false },
        ].map((nav, i) => (
          <g key={i}>
            <rect x={32 + i * 32} y="314" width="14" height="3" rx="1" fill={nav.active ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.06)"} />
            <text x={39 + i * 32} y="326" textAnchor="middle" fill={nav.active ? "rgba(59,130,246,0.7)" : c.textDimmer} fontSize="4" fontWeight={nav.active ? "600" : "400"} fontFamily="var(--font-body)">{nav.label}</text>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

export function Interfaces() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="relative flex min-h-full items-center py-4 lg:py-6">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={viewportConfig} className="text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.03em]">
            Tailored Interfaces for Every Role
          </h2>
          <p className="mt-2 text-sm text-[var(--p-text-muted)]">
            A single source of truth for the Client, the Partner, and the Field Tech.
          </p>
        </motion.div>

        {/* ── Three devices ── */}
        <div ref={ref} className="mt-8 grid items-end gap-6 md:grid-cols-3">
          {/* Client Dashboard — Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <DesktopMonitor inView={inView} />
            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-fox-orange">Client Dashboard</p>
              <p className="mt-0.5 text-xs text-[var(--p-text-subtle)]">Fleet health, SLA tracking & real-time analytics</p>
            </div>
          </motion.div>

          {/* Technician App — Phone (center, raised) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col items-center md:order-3 lg:order-2"
          >
            <div className="mx-auto w-[55%]">
              <PhoneScreen inView={inView} />
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-violet-400">Technician App</p>
              <p className="mt-0.5 text-xs text-[var(--p-text-subtle)]">Step-by-step workflows & photo validation</p>
            </div>
          </motion.div>

          {/* Partner Portal — Laptop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col items-center md:order-2 lg:order-3"
          >
            <LaptopScreen inView={inView} />
            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-blue-400">Partner Portal</p>
              <p className="mt-0.5 text-xs text-[var(--p-text-subtle)]">Task dispatch, team management & coverage maps</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { publicStoreHost, storeUrlForSlug } from "@/lib/tenant";

type Tenant = {
  name: string;
  slug: string;
  color: string;
  tagline: string;
};

type Branch = {
  x1: number;
  y1: number;
  cx1: number;
  cy1: number;
  cx2: number;
  cy2: number;
  x2: number;
  y2: number;
};

const TENANTS: Tenant[] = [
  {
    name: "Lumina",
    slug: "lumina",
    color: "#7A3E49",
    tagline: "Elevated essentials for modern women",
  },
  {
    name: "abc",
    slug: "abc",
    color: "#1e3a8a",
    tagline: "Everyday goods, ready to ship",
  },
  {
    name: "Yunima",
    slug: "yunima",
    color: "#1f6b4a",
    tagline: "Quiet pieces for daily use",
  },
];

const STATUSES = [
  "Generating tenants",
  "Lumina is live",
  "abc is live",
  "Yunima is live",
  "Three tenants generated",
];

function cubic(a: number, b: number, c: number, d: number, t: number) {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

function pathD(b: Branch) {
  return `M ${b.x1} ${b.y1} C ${b.cx1} ${b.cy1}, ${b.cx2} ${b.cy2}, ${b.x2} ${b.y2}`;
}

function Spark({
  branch,
  color,
  delay = 0,
  duration = 1,
  playKey,
}: {
  branch: Branch;
  color: string;
  delay?: number;
  duration?: number;
  playKey: number;
}) {
  const t = useMotionValue(0);
  const cx = useTransform(t, (v) => cubic(branch.x1, branch.cx1, branch.cx2, branch.x2, v));
  const cy = useTransform(t, (v) => cubic(branch.y1, branch.cy1, branch.cy2, branch.y2, v));
  const opacity = useTransform(t, [0, 0.1, 0.84, 1], [0, 1, 1, 0]);
  const r = useTransform(t, [0, 0.45, 1], [2, 5, 2.2]);
  const glow = useTransform(opacity, (v) => v * 0.22);

  useEffect(() => {
    if (!playKey) return;
    t.set(0);
    const controls = animate(t, 1, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [playKey, delay, duration, t]);

  if (!playKey) return null;

  return (
    <g>
      <motion.circle cx={cx} cy={cy} r={10} fill={color} style={{ opacity: glow }} />
      <motion.circle cx={cx} cy={cy} r={r} fill={color} style={{ opacity }} />
    </g>
  );
}

export function TenantTree() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const leafRefs = useRef<Array<HTMLLIElement | null>>([]);
  const inView = useInView(wrapRef, { once: true, amount: 0.2, margin: "-8% 0px" });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [hub, setHub] = useState({ x: 0, y: 0 });
  const [trunk, setTrunk] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const [drawTrunk, setDrawTrunk] = useState(false);
  const [drawBranches, setDrawBranches] = useState(false);
  const [sparkKey, setSparkKey] = useState(0);
  const [revealed, setRevealed] = useState([false, false, false]);
  const [status, setStatus] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [idleKey, setIdleKey] = useState(0);
  const [idleIndex, setIdleIndex] = useState(0);

  const measure = () => {
    const wrap = wrapRef.current;
    const root = rootRef.current;
    if (!wrap || !root) return;
    const wrapBox = wrap.getBoundingClientRect();
    const rootBox = root.getBoundingClientRect();
    const x1 = rootBox.left + rootBox.width / 2 - wrapBox.left;
    const y1 = rootBox.bottom - wrapBox.top;
    const hubY = y1 + 44;
    const next: Branch[] = [];
    TENANTS.forEach((_, i) => {
      const el = leafRefs.current[i];
      if (!el) return;
      const box = el.getBoundingClientRect();
      const x2 = box.left + box.width / 2 - wrapBox.left;
      const y2 = box.top - wrapBox.top;
      const midY = hubY + (y2 - hubY) * 0.52;
      next.push({
        x1,
        y1: hubY,
        cx1: x1,
        cy1: midY,
        cx2: x2,
        cy2: midY,
        x2,
        y2,
      });
    });
    setHub({ x: x1, y: hubY });
    setTrunk({ x1, y1, x2: x1, y2: hubY });
    if (next.length === TENANTS.length) setBranches(next);
  };

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(wrap);
    measure();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    measure();
  }, [revealed, inView]);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDrawTrunk(true);
      setDrawBranches(true);
      setRevealed([true, true, true]);
      setStatus(4);
      return;
    }

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setDrawTrunk(true), 80));
    timers.push(window.setTimeout(() => setDrawBranches(true), 420));
    timers.push(window.setTimeout(() => setSparkKey(1), 720));
    TENANTS.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          setRevealed((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          setStatus(i + 1);
        }, 1480 + i * 240)
      );
    });
    timers.push(window.setTimeout(() => setStatus(4), 2300));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, reduce]);

  const idle = status === 4 && !reduce;

  useEffect(() => {
    if (!idle) return;
    const id = window.setInterval(() => {
      setIdleIndex(Math.floor(Math.random() * TENANTS.length));
      setIdleKey((n) => n + 1);
    }, 2600);
    return () => window.clearInterval(id);
  }, [idle]);

  return (
    <div
      ref={wrapRef}
      className="relative mt-14 overflow-hidden rounded-2xl border bg-card px-4 py-10 sm:px-8 sm:py-12"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 42% at 50% 22%, hsl(var(--primary) / 0.12), transparent 68%)",
        }}
      />

      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <filter id="tree-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={`M ${trunk.x1} ${trunk.y1} L ${trunk.x2} ${trunk.y2}`}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.75}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: drawTrunk ? 1 : 0, opacity: drawTrunk ? 1 : 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        />

        {branches.map((branch, i) => {
          const active = hovered === i;
          const dim = hovered !== null && hovered !== i;
          return (
            <motion.path
              key={TENANTS[i].slug}
              d={pathD(branch)}
              fill="none"
              stroke={active ? TENANTS[i].color : "hsl(var(--primary))"}
              strokeWidth={active ? 2.4 : 1.75}
              strokeLinecap="round"
              opacity={dim ? 0.22 : 1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: drawBranches ? 1 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}

        <g transform={`translate(${hub.x} ${hub.y})`}>
          <motion.g
            animate={inView && !reduce ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <circle
              r={18}
              fill="none"
              stroke="hsl(var(--primary) / 0.35)"
              strokeWidth={1}
              strokeDasharray="3 7"
            />
          </motion.g>
          <motion.circle
            r={7}
            fill="hsl(var(--primary))"
            filter="url(#tree-glow)"
            initial={{ scale: 0 }}
            animate={{ scale: drawTrunk ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 16, delay: 0.28 }}
          />
          {!reduce && inView && (
            <motion.circle
              r={7}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={1.2}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </g>

        {branches.map((branch, i) => (
          <Spark
            key={`gen-${TENANTS[i].slug}`}
            branch={branch}
            color={TENANTS[i].color}
            delay={i * 0.16}
            playKey={sparkKey}
          />
        ))}

        {idle && branches[idleIndex] ? (
          <Spark
            key={`idle-${idleKey}`}
            branch={branches[idleIndex]}
            color={TENANTS[idleIndex].color}
            playKey={idleKey}
            duration={1.15}
          />
        ) : null}
      </svg>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          ref={rootRef}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border bg-background/90 px-7 py-5 text-center shadow-[0_18px_40px_-28px_hsl(var(--primary)/0.7)]"
        >
          <p className="flex items-center justify-center gap-2.5 font-serif text-xl leading-none sm:text-2xl">
            <span className="brand-dot inline-block h-2.5 w-2.5 rounded-full" aria-hidden="true" />
            VocaCommerce
          </p>
          <div className="mt-2 h-5 overflow-hidden text-sm text-muted-foreground">
            <AnimatePresence mode="wait">
              <motion.p
                key={STATUSES[status]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                aria-live="polite"
              >
                {STATUSES[status]}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {TENANTS.map((tenant, i) => (
              <motion.span
                key={tenant.slug}
                className="h-1 w-7 rounded-full"
                initial={{ backgroundColor: "hsl(var(--border))" }}
                animate={{ backgroundColor: revealed[i] ? tenant.color : "hsl(var(--border))" }}
                transition={{ duration: 0.35 }}
              />
            ))}
          </div>
        </motion.div>

        <div className="h-28 sm:h-36" aria-hidden="true" />

        <ul className="grid w-full max-w-4xl gap-4 sm:grid-cols-3 sm:gap-6">
          {TENANTS.map((tenant, i) => (
            <motion.li
              key={tenant.slug}
              ref={(node) => {
                leafRefs.current[i] = node;
              }}
              initial={false}
              animate={
                revealed[i] || reduce
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 28, scale: 0.94 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
            >
              <motion.a
                href={storeUrlForSlug(tenant.slug)}
                whileHover={reduce ? undefined : { y: -6 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                className="block overflow-hidden rounded-xl border bg-background shadow-[0_1px_0_hsl(var(--border))]"
                style={{
                  borderColor: hovered === i ? tenant.color : undefined,
                  boxShadow: hovered === i ? `0 22px 44px -28px ${tenant.color}` : undefined,
                }}
              >
                <span className="block h-1" style={{ backgroundColor: tenant.color }} />
                <span className="block p-5">
                  <span className="flex items-center gap-3">
                    <span
                      className="grid h-10 w-10 place-items-center rounded-full text-sm text-white"
                      style={{ backgroundColor: tenant.color }}
                    >
                      {tenant.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      <span className="block font-serif text-xl leading-none">{tenant.name}</span>
                      <span className="mt-1.5 block text-xs tabular-nums text-muted-foreground">
                        {publicStoreHost(tenant.slug)}
                      </span>
                    </span>
                  </span>
                  <span className="mt-4 block text-sm leading-relaxed text-muted-foreground">
                    {tenant.tagline}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium">
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: tenant.color }}
                      animate={
                        revealed[i] && !reduce
                          ? { opacity: [1, 0.35, 1], scale: [1, 1.25, 1] }
                          : { opacity: 1 }
                      }
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    Live tenant
                  </span>
                </span>
              </motion.a>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Hand-drawn line-icon set, replacing emoji throughout the app. Same visual
// language as the Dachform illustrations: thin rounded strokes, currentColor.
const base = { fill: "none", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

function Svg({ size = 20, children, label }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" stroke="currentColor" {...base} role="img" aria-label={label} aria-hidden={label ? undefined : true}>
      {children}
    </svg>
  );
}

export function IconMapPin(props) {
  return <Svg {...props}><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.4" /></Svg>;
}

export function IconSatellite(props) {
  return <Svg {...props}><rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)" /><path d="M7 7 4 4M17 7l3-3M3 12h2M19 12h2" /><path d="M13.5 10.5 20 4" /></Svg>;
}

export function IconLock(props) {
  return <Svg {...props}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>;
}

export function IconHouse(props) {
  return <Svg {...props}><path d="M4 11 12 4l8 7" /><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" /><path d="M10 20v-5h4v5" /></Svg>;
}

export function IconMail(props) {
  return <Svg {...props}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4 7l8 6 8-6" /></Svg>;
}

export function IconCalendar(props) {
  return <Svg {...props}><rect x="4" y="5.5" width="16" height="15" rx="2" /><path d="M4 10h16M8 3.5v3M16 3.5v3" /></Svg>;
}

export function IconLoader(props) {
  return (
    <svg width={props.size ?? 20} height={props.size ?? 20} viewBox="0 0 24 24" role="img" aria-label="Lädt">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" opacity="0.25" fill="none" />
      <path d="M20.5 12a8.5 8.5 0 0 0-8.5-8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export function IconChart(props) {
  return <Svg {...props}><path d="M4 20V9M10 20V4M16 20v-7M22 20H2" /></Svg>;
}

export function IconMap(props) {
  return <Svg {...props}><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" /><path d="M9 4v14M15 6v14" /></Svg>;
}

export function IconBattery(props) {
  return <Svg {...props}><rect x="3" y="8" width="16" height="9" rx="2" /><path d="M21 11v3" /><path d="M9 12.5h2l-1.2 2.5 3.2-3-2-.1 1.2-2.4Z" fill="currentColor" stroke="none" /></Svg>;
}

export function IconBolt(props) {
  return <Svg {...props}><path d="M13 3 6 13h5l-1 8 8-11h-5l1-7Z" /></Svg>;
}

export function IconCheck(props) {
  return <Svg {...props}><path d="M4.5 12.5 9 17l10.5-11" /></Svg>;
}

export function IconStar({ filled, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8Z"
        fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTrendingUp(props) {
  return <Svg {...props}><path d="M3 17 10 10l4 4 7-8" /><path d="M15 6h6v6" /></Svg>;
}

export function IconLeaf(props) {
  return <Svg {...props}><path d="M5 19c8-1 13-6 14-14-8 1-13 6-14 14Z" /><path d="M5 19c1.5-3.5 4-6 9-8.5" /></Svg>;
}

export function IconPlug(props) {
  return <Svg {...props}><path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0V8Z" /><path d="M12 17v4" /></Svg>;
}

export function IconRuler(props) {
  return <Svg {...props}><path d="m4 15 5-11 11 5-5 11z" /><path d="m8.5 8.5 1.5 1.5M10.5 6l1.5 1.5M13.5 12.5l1.5 1.5M11.5 15l1.5 1.5" /></Svg>;
}

export function IconDocumentCheck(props) {
  return <Svg {...props}><path d="M6 2.5h8l4 4V21H6Z" /><path d="M14 2.5v4h4" /><path d="m9.5 13 2.2 2.2 4-4.4" /></Svg>;
}

export function IconWrench(props) {
  return <Svg {...props}><path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-3-3-1.9 1.9Z" /></Svg>;
}

export function IconContact(props) {
  return <Svg {...props}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c1-3.5 3.8-5.5 6.5-5.5s5.5 2 6.5 5.5" /></Svg>;
}

export function IconSearch(props) {
  return <Svg {...props}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.8-4.8" /></Svg>;
}

export function IconSun(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="4.5" />{[0,45,90,135,180,225,270,315].map(a => (
    <line key={a} x1={12 + 6.5*Math.cos(a*Math.PI/180)} y1={12 + 6.5*Math.sin(a*Math.PI/180)} x2={12 + 9.5*Math.cos(a*Math.PI/180)} y2={12 + 9.5*Math.sin(a*Math.PI/180)} />
  ))}</Svg>;
}

export function IconTarget(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></Svg>;
}

export function IconPerson(props) {
  return <Svg {...props}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.1-3.7 3.8-5.6 7-5.6s5.9 1.9 7 5.6" /></Svg>;
}

export function IconCar(props) {
  return <Svg {...props}><path d="M5 16v-1a2.2 2.2 0 0 1 .4-1.2L7.3 11.4A2.5 2.5 0 0 1 9.4 10.5h5.2a2.5 2.5 0 0 1 2.1.9l1.9 2.4a2.2 2.2 0 0 1 .4 1.2v1" /><path d="M6 16.8h.5M17.5 16.8h.5" /><circle cx="8.4" cy="17" r="1.4" /><circle cx="15.6" cy="17" r="1.4" /></Svg>;
}

export function IconHeatpump(props) {
  return <Svg {...props}><rect x="5" y="7" width="14" height="10" rx="2" /><circle cx="12" cy="12" r="2.4" /><path d="M10.2 10.2 8.6 8.6M13.8 10.2l1.6-1.6M10.2 13.8l-1.6 1.6M13.8 13.8l1.6 1.6" /></Svg>;
}

export function IconClock(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.2 2" /></Svg>;
}

export function IconChevronDown(props) {
  return <Svg {...props}><path d="m6 9 6 6 6-6" /></Svg>;
}

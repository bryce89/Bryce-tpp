import React from 'react';
import { useNavigate } from 'react-router-dom';
import { T } from '../theme.js';

function Section({ title, children }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 28, marginBottom: 16 }}>
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
}

function Feature({ icon, title, description, path, navigate }) {
  return (
    <div
      onClick={() => path && navigate(path)}
      style={{
        display: 'flex',
        gap: 14,
        padding: '14px 0',
        borderBottom: `1px solid ${T.border}`,
        cursor: path ? 'pointer' : 'default',
      }}
      onMouseEnter={e => { if (path) e.currentTarget.style.opacity = '0.75'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.3 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: path ? T.accent : T.text, marginBottom: 4 }}>{title}</div>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{description}</div>
      </div>
    </div>
  );
}

export default function AboutView() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 740 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, color: T.text, fontWeight: 600 }}>About this tool</h1>
        <p style={{ fontFamily: T.mono, fontSize: 13, color: T.muted, marginTop: 6, lineHeight: 1.7 }}>
          Project Mapper is an internal resource planning tool for engineering teams. It gives you a single place to track which engineers are working on which projects, for how long, at what capacity, and whether the right skills are in place.
        </p>
      </div>

      <Section title="Pages">
        <Feature
          icon="📊"
          title="Allocation"
          path="/timeline"
          navigate={navigate}
          description="The central view. Three tabs show your resource picture from different angles — skill coverage per project, engineer assignments by project, and individual engineer workloads across the year. Use the year navigator to look ahead or review past periods."
        />
        <Feature
          icon="👥"
          title="Engineers"
          path="/engineers"
          navigate={navigate}
          description="A searchable, filterable table of every engineer. Filter by portfolio, role, or skill. Click any row to open the engineer's profile where you can update their details, skills, and view their current project assignments."
        />
        <Feature
          icon="📋"
          title="Projects"
          path="/projects"
          navigate={navigate}
          description="Browse all projects with their status, date ranges, and team size. Each project page shows the required skills (with effort-day targets), the assigned squad with their roles and skills, and allows you to manage assignments directly."
        />
        <Feature
          icon="🔧"
          title="Skills"
          path="/skills"
          navigate={navigate}
          description="Manage the shared skills catalogue used across engineers and projects. Skills are ordered by how widely they are held across the team. Add, rename, or remove skills — changes flow through to all engineer and project records."
        />
      </Section>

      <Section title="Key concepts">
        <Feature
          icon="⚡"
          title="Allocation %"
          description="Each assignment records what percentage of an engineer's time is committed to a project. 100% means fully dedicated; 50% means half their time. The Allocation page flags engineers over 100% in red."
        />
        <Feature
          icon="📅"
          title="Date ranges"
          description="Assignments, projects, and the allocation view are all date-scoped. A project's start and end dates define when it appears in the allocation view. Engineer assignments can start and end independently of the project itself."
        />
        <Feature
          icon="🎯"
          title="Skill coverage"
          description="The Project Skills tab compares each project's required skills against the skills held by engineers actually assigned to it. A green cell means at least one assigned engineer has that skill that month; red means a gap."
        />
        <Feature
          icon="📐"
          title="Effort days"
          description="Projects and individual skill requirements can carry an effort-days budget — the estimated total working days needed. The Project Skills tab converts allocation percentages into approximate working days per month for comparison."
        />
      </Section>

      <Section title="Tips">
        <div style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 2 }}>
          <div>• Use <span style={{ color: T.text }}>Expand all / Collapse all</span> on the Allocation page to quickly scan or drill into detail.</div>
          <div>• Hover over cells in the Engineers table to see tooltips with full content.</div>
          <div>• Click any engineer name or project sub-row in the Allocation view to jump straight to that record.</div>
          <div>• Skills can be added directly from the engineer or project edit forms — no need to pre-create them in the Skills page.</div>
          <div>• The Skills page orders skills by how many engineers hold them, making gaps easy to spot.</div>
        </div>
      </Section>
    </div>
  );
}

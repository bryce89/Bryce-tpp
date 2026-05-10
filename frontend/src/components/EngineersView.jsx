import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { T } from '../theme.js';

function SkillTag({ name }) {
  return (
    <span style={{
      background: `${T.accent}18`,
      border: `1px solid ${T.accent}44`,
      color: T.accent,
      borderRadius: 4,
      padding: '2px 7px',
      fontSize: 11,
      fontFamily: T.mono,
    }}>{name}</span>
  );
}

export default function EngineersView() {
  const navigate = useNavigate();
  const [engineers, setEngineers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', portfolio: '', capability: '', skill: '' });

  const portfolios = [...new Set(engineers.map(e => e.portfolio).filter(Boolean))].sort();
  const capabilities = [...new Set(engineers.map(e => e.capability).filter(Boolean))].sort();

  useEffect(() => {
    api.getSkills().then(setSkills).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.portfolio) params.portfolio = filters.portfolio;
    if (filters.capability) params.capability = filters.capability;
    if (filters.skill) params.skill = filters.skill;
    api.getEngineers(params)
      .then(setEngineers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const hasFilters = filters.search || filters.portfolio || filters.capability || filters.skill;

  const inputStyle = {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    color: T.text,
    fontFamily: T.mono,
    fontSize: 12,
    padding: '7px 10px',
    outline: 'none',
  };

  const thStyle = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: 11,
    color: T.muted,
    fontFamily: T.mono,
    fontWeight: 500,
    borderBottom: `1px solid ${T.border}`,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '12px 14px',
    borderBottom: `1px solid ${T.border}`,
    fontFamily: T.mono,
    fontSize: 13,
    color: T.text,
    verticalAlign: 'middle',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: T.serif, fontSize: 28, color: T.text, fontWeight: 600 }}>Engineers</h1>
          <p style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>{engineers.length} engineer{engineers.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={() => navigate('/engineers/new')}
          style={{
            background: T.accent,
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '9px 18px',
            fontFamily: T.mono,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >+ New Engineer</button>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search name, email..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          style={{ ...inputStyle, width: 200 }}
        />
        <select value={filters.portfolio} onChange={e => setFilters(f => ({ ...f, portfolio: e.target.value }))} style={inputStyle}>
          <option value="">All portfolios</option>
          {portfolios.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.capability} onChange={e => setFilters(f => ({ ...f, capability: e.target.value }))} style={inputStyle}>
          <option value="">All capabilities</option>
          {capabilities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.skill} onChange={e => setFilters(f => ({ ...f, skill: e.target.value }))} style={inputStyle}>
          <option value="">All skills</option>
          {skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => setFilters({ search: '', portfolio: '', capability: '', skill: '' })}
            style={{ background: 'transparent', border: `1px solid ${T.border}`, color: T.muted, borderRadius: 6, padding: '7px 12px', fontFamily: T.mono, fontSize: 12, cursor: 'pointer' }}
          >Clear filters</button>
        )}
      </div>

      {loading ? (
        <div style={{ color: T.muted, fontFamily: T.mono, fontSize: 13 }}>Loading...</div>
      ) : engineers.length === 0 ? (
        <div style={{ color: T.muted, fontFamily: T.mono, fontSize: 13 }}>No engineers found.</div>
      ) : (
        <div style={{ overflowX: 'auto', background: T.card, border: `1px solid ${T.border}`, borderRadius: 10 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Portfolio</th>
                <th style={thStyle}>Capability</th>
                <th style={thStyle}>Role Description</th>
                <th style={thStyle}>Skills</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Allocation</th>
              </tr>
            </thead>
            <tbody>
              {engineers.map((eng, i) => (
                <tr
                  key={eng.id}
                  onClick={() => navigate(`/engineers/${eng.id}`)}
                  style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, fontWeight: 600, color: T.accent, whiteSpace: 'nowrap' }}>
                    {eng.name}
                  </td>
                  <td style={{ ...tdStyle, color: T.muted, whiteSpace: 'nowrap' }}>
                    {eng.portfolio || '—'}
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    {eng.capability || '—'}
                  </td>
                  <td style={{ ...tdStyle, color: T.muted, fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {eng.role_description || '—'}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(eng.skills || []).slice(0, 4).map(s => <SkillTag key={s.id} name={s.name} />)}
                      {eng.skills?.length > 4 && (
                        <span style={{ fontSize: 11, color: T.muted, alignSelf: 'center' }}>+{eng.skills.length - 4}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {eng.total_allocation_pct > 0 ? (
                      <span style={{
                        background: eng.total_allocation_pct > 100 ? `${T.red}18` : `${T.accent}18`,
                        border: `1px solid ${eng.total_allocation_pct > 100 ? T.red : T.accent}44`,
                        color: eng.total_allocation_pct > 100 ? T.red : T.accent,
                        borderRadius: 4,
                        padding: '2px 8px',
                        fontSize: 12,
                      }}>
                        {eng.total_allocation_pct}%
                      </span>
                    ) : (
                      <span style={{ color: T.muted, fontSize: 12 }}>Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

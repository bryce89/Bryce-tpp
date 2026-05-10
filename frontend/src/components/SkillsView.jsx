import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { T } from '../theme.js';

export default function SkillsView() {
  const [skills, setSkills] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.getSkills(), api.getEngineers()])
      .then(([s, e]) => { setSkills(s); setEngineers(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const engineerCountForSkill = (skillId) =>
    engineers.filter(e => e.skills?.some(s => s.id === skillId)).length;

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newSkill.trim();
    if (!name) return;
    setAdding(true);
    setError('');
    try {
      await api.createSkill(name);
      setNewSkill('');
      load();
    } catch {
      setError('Skill already exists or could not be created.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteSkill(id);
      setDeleteConfirm(null);
      load();
    } catch {
      setError('Could not delete skill.');
    }
  };

  const inputStyle = {
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    color: T.text,
    fontFamily: T.mono,
    fontSize: 13,
    padding: '9px 12px',
    outline: 'none',
    flex: 1,
  };

  const thStyle = {
    padding: '10px 16px',
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
    padding: '12px 16px',
    borderBottom: `1px solid ${T.border}`,
    fontFamily: T.mono,
    fontSize: 13,
    color: T.text,
    verticalAlign: 'middle',
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, color: T.text, fontWeight: 600 }}>Skills</h1>
        <p style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Manage the shared skill list used across engineers and projects.</p>
      </div>

      {/* Add skill form */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 24px', marginBottom: 24 }}>
        <p style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Add New Skill</p>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={newSkill}
            onChange={e => { setNewSkill(e.target.value); setError(''); }}
            placeholder="e.g. Kotlin, Azure, GraphQL..."
            style={inputStyle}
            autoFocus
          />
          <button
            type="submit"
            disabled={adding || !newSkill.trim()}
            style={{
              background: newSkill.trim() ? T.accent : T.border,
              color: newSkill.trim() ? '#ffffff' : T.muted,
              border: 'none',
              borderRadius: 6,
              padding: '9px 20px',
              fontFamily: T.mono,
              fontSize: 13,
              fontWeight: 500,
              cursor: newSkill.trim() ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
          >
            {adding ? 'Adding…' : '+ Add Skill'}
          </button>
        </form>
        {error && <p style={{ fontFamily: T.mono, fontSize: 12, color: T.red, marginTop: 8 }}>{error}</p>}
      </div>

      {/* Skills table */}
      {loading ? (
        <div style={{ color: T.muted, fontFamily: T.mono, fontSize: 13 }}>Loading...</div>
      ) : skills.length === 0 ? (
        <div style={{ color: T.muted, fontFamily: T.mono, fontSize: 13 }}>No skills yet. Add one above.</div>
      ) : (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={thStyle}>Skill</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Engineers</th>
                <th style={{ ...thStyle, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {skills.map(skill => {
                const count = engineerCountForSkill(skill.id);
                const isConfirming = deleteConfirm === skill.id;
                return (
                  <tr
                    key={skill.id}
                    style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          background: `${T.accent}18`,
                          border: `1px solid ${T.accent}44`,
                          color: T.accent,
                          borderRadius: 4,
                          padding: '3px 10px',
                          fontSize: 12,
                          fontFamily: T.mono,
                        }}>
                          {skill.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {count > 0 ? (
                        <span style={{
                          background: `${T.blue}18`,
                          border: `1px solid ${T.blue}44`,
                          color: T.blue,
                          borderRadius: 4,
                          padding: '2px 10px',
                          fontSize: 12,
                        }}>
                          {count} engineer{count !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span style={{ color: T.muted, fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {isConfirming ? (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>Delete?</span>
                          <button
                            onClick={() => handleDelete(skill.id)}
                            style={{ background: T.red, color: '#fff', border: 'none', borderRadius: 5, padding: '5px 12px', fontFamily: T.mono, fontSize: 12, cursor: 'pointer' }}
                          >Yes</button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{ background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 5, padding: '5px 12px', fontFamily: T.mono, fontSize: 12, cursor: 'pointer' }}
                          >Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(skill.id)}
                          style={{ background: 'transparent', color: T.muted, border: `1px solid ${T.border}`, borderRadius: 5, padding: '5px 12px', fontFamily: T.mono, fontSize: 12, cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red; }}
                          onMouseLeave={e => { e.currentTarget.style.color = T.muted; e.currentTarget.style.borderColor = T.border; }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 11, color: T.muted }}>
            {skills.length} skill{skills.length !== 1 ? 's' : ''} total
          </div>
        </div>
      )}
    </div>
  );
}

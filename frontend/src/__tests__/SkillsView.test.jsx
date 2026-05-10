import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock the api module before importing SkillsView
vi.mock('../api.js', () => ({
  api: {
    getSkills: vi.fn().mockResolvedValue([
      { id: 1, name: 'JavaScript' },
      { id: 2, name: 'Python' },
    ]),
    getEngineers: vi.fn().mockResolvedValue([
      { id: 10, name: 'Alice', skills: [{ id: 1, name: 'JavaScript' }] },
      { id: 11, name: 'Bob', skills: [{ id: 1, name: 'JavaScript' }, { id: 2, name: 'Python' }] },
    ]),
    createSkill: vi.fn(),
    updateSkill: vi.fn(),
    deleteSkill: vi.fn(),
  },
}));

import SkillsView from '../components/SkillsView.jsx';

describe('SkillsView component', () => {
  function renderSkillsView() {
    return render(
      <MemoryRouter>
        <SkillsView />
      </MemoryRouter>
    );
  }

  it('renders the "Add skill" input', () => {
    renderSkillsView();
    expect(screen.getByPlaceholderText(/kotlin/i)).toBeInTheDocument();
  });

  it('displays skills returned by mocked api.getSkills', async () => {
    renderSkillsView();
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });
  });

  it('uses engineers data for skill engineer counts', async () => {
    renderSkillsView();
    // JavaScript has 2 engineers, Python has 1
    await waitFor(() => {
      expect(screen.getByText('2 engineers')).toBeInTheDocument();
      expect(screen.getByText('1 engineer')).toBeInTheDocument();
    });
  });
});

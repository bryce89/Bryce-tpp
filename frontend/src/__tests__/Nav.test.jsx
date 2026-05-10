import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Nav from '../components/Nav.jsx';

describe('Nav component', () => {
  function renderNav() {
    return render(
      <MemoryRouter>
        <Nav isMobile={false} menuOpen={false} onToggle={() => {}} onClose={() => {}} />
      </MemoryRouter>
    );
  }

  it('renders all 5 nav links', () => {
    renderNav();
    expect(screen.getByText('Allocation')).toBeInTheDocument();
    expect(screen.getByText('Engineers')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('About this tool')).toBeInTheDocument();
  });
});

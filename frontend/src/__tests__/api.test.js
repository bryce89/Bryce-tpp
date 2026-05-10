import { api } from '../api.js';

describe('api module shape', () => {
  const expectedMethods = [
    'getSkills',
    'getEngineers',
    'getProjects',
    'getProject',
    'getAssignments',
    'createSkill',
    'updateSkill',
    'deleteSkill',
    'createEngineer',
    'updateEngineer',
    'deleteEngineer',
  ];

  it('api object has all expected methods', () => {
    for (const method of expectedMethods) {
      expect(api).toHaveProperty(method);
    }
  });

  it('each expected method is a function', () => {
    for (const method of expectedMethods) {
      expect(typeof api[method]).toBe('function');
    }
  });
});

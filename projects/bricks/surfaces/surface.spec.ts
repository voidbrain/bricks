import {
  REGISTERED_COMPONENTS,
  SURFACE_SCHEMAS,
  validateSurface,
  validateSurfaceResult,
} from './surface';

const status = {
  version: 1,
  component: 'nerv-status-card',
  props: { title: 'Nodo', detail: 'Up', status: 'ok' },
};
const notice = {
  version: 1,
  component: 'nerv-notice-card',
  props: { topic: 'T', message: 'M', tone: 'warn' },
};
const checklist = {
  version: 1,
  component: 'nerv-checklist-card',
  props: { listId: 'l1', name: 'Pack', items: [{ id: 'i1', text: 'Charger', done: true }] },
};
const recipe = {
  version: 1,
  component: 'nerv-recipe-card',
  props: {
    title: 'Soup',
    category: 'Dinner',
    body: '1. Boil',
    working: 'Notes',
    photos: [{ id: 'p1', url: '/api/photos/p1', caption: 'Pot', stepIndex: 0 }],
  },
};

describe('surface contract', () => {
  it('accepts every registered component and returns a clean copy', () => {
    for (const s of [status, notice, checklist, recipe]) expect(validateSurface(s)).toEqual(s);
  });

  it('has one schema per registered component, naming that component', () => {
    expect(Object.keys(SURFACE_SCHEMAS).sort()).toEqual([...REGISTERED_COMPONENTS].sort());
    for (const [id, schema] of Object.entries(SURFACE_SCHEMAS))
      expect(schema.properties.component.const).toBe(id);
  });

  it.each([
    ['not an object', 'not a surface'],
    ['an array', [status]],
    ['an unregistered component', { ...status, component: 'nerv-iframe' }],
    ['another version', { ...status, version: 2 }],
    ['an extra root key', { ...status, extra: 1 }],
    ['a forbidden root key', { ...status, script: 'x' }],
    ['an event handler prop', { ...status, props: { ...status.props, onclick: 'x' } }],
    ['a data- prop', { ...status, props: { ...status.props, 'data-x': 'x' } }],
    ['an unknown status', { ...status, props: { ...status.props, status: 'maybe' } }],
    [
      'a title over 120 characters',
      { ...status, props: { ...status.props, title: 'x'.repeat(121) } },
    ],
    ['an unknown tone', { ...notice, props: { ...notice.props, tone: 'loud' } }],
    ['an empty checklist name', { ...checklist, props: { ...checklist.props, name: '' } }],
    [
      'more than 200 items',
      {
        ...checklist,
        props: { ...checklist.props, items: Array(201).fill(checklist.props.items[0]) },
      },
    ],
    [
      'a non-boolean done',
      { ...checklist, props: { ...checklist.props, items: [{ id: 'i', text: 't', done: 'yes' }] } },
    ],
    [
      'a handler on an item',
      {
        ...checklist,
        props: { ...checklist.props, items: [{ id: 'i', text: 't', done: true, onload: 1 }] },
      },
    ],
    ['a recipe without a body', { ...recipe, props: { title: 'S', category: 'C' } }],
    [
      'a photo from another origin',
      {
        ...recipe,
        props: { ...recipe.props, photos: [{ id: 'p', url: 'https://evil.test/p.png' }] },
      },
    ],
    [
      'a negative step index',
      {
        ...recipe,
        props: { ...recipe.props, photos: [{ id: 'p', url: '/api/photos/p', stepIndex: -1 }] },
      },
    ],
  ])('rejects %s', (_name, value) => {
    const result = validateSurfaceResult(value);
    expect(result.ok).toBe(false);
    expect(() => validateSurface(value)).toThrow();
  });

  it('drops empty optional recipe fields', () => {
    const s = validateSurface({
      ...recipe,
      props: { title: 'S', category: 'C', body: 'B', working: '', photos: [] },
    });
    expect(s.props).toEqual({ title: 'S', category: 'C', body: 'B' });
  });
});

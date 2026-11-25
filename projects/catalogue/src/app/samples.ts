import type { ThemeName } from '@voidbrain/bricks/themes';

/** Invented sample payloads for the catalogue, one set per theme so every landmark name stays unique on the page. */
export function samples(theme: ThemeName): { name: string; surface: unknown }[] {
  return [
    { name: 'Status: ok', surface: status('Nodo online', 'Last heartbeat 12 s ago.', 'ok') },
    {
      name: 'Status: waiting',
      surface: status('Backup', 'Queued behind the nightly sync.', 'waiting'),
    },
    {
      name: 'Status: error',
      surface: status('Printer', 'No answer on the local network.', 'error'),
    },
    {
      name: 'Notice: info',
      surface: notice('Update', 'Version 0.1.0 is ready to install.', 'info'),
    },
    { name: 'Notice: warn', surface: notice('Storage', 'The disk is 92 % full.', 'warn') },
    { name: 'Notice: success', surface: notice('Sync', 'All lists are up to date.', 'success') },
    {
      name: 'Checklist',
      surface: {
        version: 1,
        component: 'nerv-checklist-card',
        props: {
          listId: `pack-${theme}`,
          name: `Packing list (${theme})`,
          items: [
            { id: 'charger', text: 'Charger', done: true },
            { id: 'goggles', text: 'Goggles', done: false },
            { id: 'spare-props', text: 'Spare propellers', done: false },
          ],
        },
      },
    },
    {
      name: 'Recipe',
      surface: {
        version: 1,
        component: 'nerv-recipe-card',
        props: {
          title: `Tomato soup (${theme})`,
          category: 'Dinner',
          body: '1. Soften an onion in olive oil.\n2. Add tomatoes and simmer for 20 minutes.\n3. Blend and season.',
          working: 'Doubles well; freezes for a month.',
        },
      },
    },
    {
      name: 'Rejected payload',
      surface: { version: 1, component: 'nerv-iframe', props: { src: 'https://example.test' } },
    },
  ];
}

function status(title: string, detail: string, status: 'ok' | 'waiting' | 'error'): unknown {
  return { version: 1, component: 'nerv-status-card', props: { title, detail, status } };
}

function notice(topic: string, message: string, tone: 'info' | 'warn' | 'success'): unknown {
  return { version: 1, component: 'nerv-notice-card', props: { topic, message, tone } };
}

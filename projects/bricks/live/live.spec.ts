import { createLiveView, patchKeyedRows, setAttr, setText, type KeyedRowSpec } from './public-api';

interface StationRow {
  readonly id: string;
  readonly label: string;
  readonly packets: number;
  readonly status: 'ok' | 'warn';
}

function makeSpec(creates: string[]): KeyedRowSpec<StationRow, HTMLLIElement> {
  return {
    key: (item) => item.id,
    create(item, doc) {
      creates.push(item.id);
      const li = doc.createElement('li');
      const name = doc.createElement('span');
      name.className = 'name';
      const count = doc.createElement('span');
      count.className = 'count';
      li.append(name, count);
      setText(name, item.label);
      setText(count, item.packets);
      setAttr(li, 'data-status', item.status);
      return li;
    },
    patch(li, item) {
      setText(li.querySelector('.name'), item.label);
      setText(li.querySelector('.count'), item.packets);
      setAttr(li, 'data-status', item.status);
    },
  };
}

describe('live-view helper (F-003-T03)', () => {
  it('handles empty inputs and null targets without touching the DOM', () => {
    expect(setText(null, 'ignored')).toBe(false);
    expect(setAttr(null, 'data-state', 'ok')).toBe(false);

    const span = document.createElement('span');
    expect(setText(span, '')).toBe(false);
    expect(span.childNodes.length).toBe(0);

    expect(setAttr(span, 'disabled', false)).toBe(false);
    expect(setAttr(span, 'data-note', null)).toBe(false);

    const ul = document.createElement('ul');
    const creates: string[] = [];
    const spec = makeSpec(creates);
    expect(patchKeyedRows(ul, [], spec)).toEqual([]);
    expect(creates).toEqual([]);
    expect(ul.childNodes.length).toBe(0);
  });

  it('keeps the exact same DOM nodes on an unchanged update and touches only the changed value node', async () => {
    const ul = document.createElement('ul');
    document.body.appendChild(ul);
    const creates: string[] = [];
    const spec = makeSpec(creates);

    const initial: StationRow[] = [
      { id: 'r-1', label: 'North relay', packets: 10, status: 'ok' },
      { id: 'r-2', label: 'East relay', packets: 20, status: 'ok' },
      { id: 'r-3', label: 'South relay', packets: 30, status: 'warn' },
    ];
    patchKeyedRows(ul, initial, spec);
    expect(creates).toEqual(['r-1', 'r-2', 'r-3']);

    const rowsBefore = Array.from(ul.querySelectorAll('li'));
    const r1NameNode = rowsBefore[0]!.querySelector('.name')!.firstChild!;
    const r2NameNode = rowsBefore[1]!.querySelector('.name')!.firstChild!;
    const r2CountEl = rowsBefore[1]!.querySelector('.count')!;
    const r2CountTextNode = r2CountEl.firstChild!;
    const r3CountTextNode = rowsBefore[2]!.querySelector('.count')!.firstChild!;

    const records: MutationRecord[] = [];
    const observer = new MutationObserver((list) => records.push(...list));
    observer.observe(ul, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
    });

    // Unchanged update: zero mutations and identical Element + Text references
    patchKeyedRows(
      ul,
      [
        { id: 'r-1', label: 'North relay', packets: 10, status: 'ok' },
        { id: 'r-2', label: 'East relay', packets: 20, status: 'ok' },
        { id: 'r-3', label: 'South relay', packets: 30, status: 'warn' },
      ],
      spec,
    );
    records.push(...observer.takeRecords());
    expect(records.length).toBe(0);
    expect(Array.from(ul.querySelectorAll('li'))).toEqual(rowsBefore);
    expect(rowsBefore[0]!.querySelector('.name')!.firstChild).toBe(r1NameNode);
    expect(rowsBefore[1]!.querySelector('.count')!.firstChild).toBe(r2CountTextNode);

    // Change only r-2 packets (20 -> 21): touches ONLY r2CountTextNode
    patchKeyedRows(
      ul,
      [
        { id: 'r-1', label: 'North relay', packets: 10, status: 'ok' },
        { id: 'r-2', label: 'East relay', packets: 21, status: 'ok' },
        { id: 'r-3', label: 'South relay', packets: 30, status: 'warn' },
      ],
      spec,
    );
    records.push(...observer.takeRecords());
    expect(creates).toEqual(['r-1', 'r-2', 'r-3']);
    expect(records.length).toBe(1);
    expect(records[0]!.type).toBe('characterData');
    expect(records[0]!.target).toBe(r2CountTextNode);
    expect(r2CountEl.firstChild).toBe(r2CountTextNode);
    expect(r2CountEl.textContent).toBe('21');
    expect(rowsBefore[0]!.querySelector('.name')!.firstChild).toBe(r1NameNode);
    expect(rowsBefore[1]!.querySelector('.name')!.firstChild).toBe(r2NameNode);
    expect(rowsBefore[2]!.querySelector('.count')!.firstChild).toBe(r3CountTextNode);

    observer.disconnect();
    ul.remove();
  });

  it('adds, moves and removes keyed rows (including emptying to [] and refilling) while keeping moved row nodes', () => {
    const ul = document.createElement('ul');
    const creates: string[] = [];
    const spec = makeSpec(creates);

    patchKeyedRows(
      ul,
      [
        { id: 'a', label: 'Alpha', packets: 1, status: 'ok' },
        { id: 'b', label: 'Bravo', packets: 2, status: 'ok' },
      ],
      spec,
    );
    const [liA, liB] = Array.from(ul.querySelectorAll('li'));

    // Move 'b' before 'a', add 'c'
    patchKeyedRows(
      ul,
      [
        { id: 'b', label: 'Bravo', packets: 2, status: 'warn' },
        { id: 'c', label: 'Charlie', packets: 3, status: 'ok' },
        { id: 'a', label: 'Alpha', packets: 1, status: 'ok' },
      ],
      spec,
    );
    const afterMove = Array.from(ul.querySelectorAll('li'));
    expect(afterMove[0]).toBe(liB);
    expect(afterMove[2]).toBe(liA);
    expect(afterMove[0]!.getAttribute('data-status')).toBe('warn');
    expect(creates).toEqual(['a', 'b', 'c']);

    // Empty completely to []
    expect(patchKeyedRows(ul, [], spec)).toEqual([]);
    expect(ul.children.length).toBe(0);

    // Refill after empty
    patchKeyedRows(ul, [{ id: 'd', label: 'Delta', packets: 4, status: 'ok' }], spec);
    expect(ul.children.length).toBe(1);
    expect(creates).toEqual(['a', 'b', 'c', 'd']);
  });

  it('never parses strings as HTML and never overwrites a focused input value', () => {
    const host = document.createElement('div');
    const view = createLiveView<{ title: string }>(host, {
      render(root, initial) {
        const h = root.ownerDocument.createElement('h4');
        root.appendChild(h);
        const apply = (s: { title: string }) => {
          setText(h, s.title);
        };
        apply(initial);
        return apply;
      },
    });

    const hostile = '<img src=x onerror="alert(1)"><b>bold</b>';
    view.update({ title: hostile });
    expect(host.querySelector('img')).toBeNull();
    expect(host.querySelector('b')).toBeNull();
    expect(host.querySelector('h4')?.textContent).toBe(hostile);

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.value = 'typing-now';
    input.focus();
    setAttr(input, 'value', 'from-poll');
    expect(input.value).toBe('typing-now');
    input.blur();
    setAttr(input, 'value', 'after-blur');
    expect(input.value).toBe('after-blur');
    input.remove();
  });
});

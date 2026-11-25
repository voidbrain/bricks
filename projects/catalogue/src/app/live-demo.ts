import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import { BxButton, BxCard } from '@voidbrain/bricks/components';
import {
  createLiveView,
  patchKeyedRows,
  setAttr,
  setText,
  type KeyedRowSpec,
  type LiveView,
} from '@voidbrain/bricks/live';

interface DemoRow {
  readonly id: string;
  readonly label: string;
  readonly packets: number;
  readonly note: string;
}

const rowSpec: KeyedRowSpec<DemoRow, HTMLLIElement> = {
  key: (item) => item.id,
  create(item, doc) {
    const li = doc.createElement('li');
    setAttr(
      li,
      'style',
      'display:flex;flex-direction:column;gap:var(--bx-space-1);padding:var(--bx-space-2);border:var(--bx-line-width) solid var(--bx-border);border-radius:var(--bx-radius);background:var(--bx-surface-sunken);',
    );

    const top = doc.createElement('div');
    setAttr(top, 'style', 'display:flex;justify-content:space-between;gap:var(--bx-space-2);');

    const name = doc.createElement('strong');
    name.className = 'live-name';
    const count = doc.createElement('code');
    count.className = 'live-count';
    top.append(name, count);

    const details = doc.createElement('details');
    const summary = doc.createElement('summary');
    setText(summary, 'Inspect row node');
    const note = doc.createElement('span');
    note.className = 'live-note';
    setAttr(
      note,
      'style',
      'display:block;color:var(--bx-text-muted);font-size:var(--bx-font-size-sm);',
    );
    details.append(summary, note);

    li.append(top, details);
    setText(name, item.label);
    setText(count, `${item.packets} pkt`);
    setText(note, item.note);
    return li;
  },
  patch(li, item) {
    setText(li.querySelector('.live-name'), item.label);
    setText(li.querySelector('.live-count'), `${item.packets} pkt`);
    setText(li.querySelector('.live-note'), item.note);
  },
};

/** Catalogue demonstration of `@voidbrain/bricks/live` DOM patching without framework bindings inside the list. */
@Component({
  selector: 'cat-live-demo',
  imports: [BxCard, BxButton],
  template: `
    <bx-card data-testid="live-demo">
      <div class="toolbar">
        <bx-button variant="secondary" (pressed)="replayUnchanged()">Replay unchanged</bx-button>
        <bx-button variant="primary" (pressed)="tickFirst()">Tick one value</bx-button>
        <bx-button variant="secondary" (pressed)="rotateRows()">Reorder rows</bx-button>
        <span class="meta">
          Last patch DOM mutations:
          <code data-testid="live-mutations">{{ lastMutations() }}</code>
        </span>
      </div>
      <div #mount class="mount"></div>
    </bx-card>
  `,
  styles: `
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--bx-space-2);
    }
    .meta {
      font-size: var(--bx-font-size-sm);
      color: var(--bx-text-muted);
    }
    .mount {
      min-inline-size: 0;
    }
  `,
})
export class LiveDemo implements AfterViewInit, OnDestroy {
  private readonly mountRef = viewChild.required<ElementRef<HTMLDivElement>>('mount');
  private view: LiveView<readonly DemoRow[]> | null = null;
  private observer: MutationObserver | null = null;
  private rows: DemoRow[] = [
    {
      id: 'relay-north',
      label: 'North relay',
      packets: 42,
      note: 'Keyed DOM node survives polls and reorders.',
    },
    {
      id: 'relay-east',
      label: 'East relay',
      packets: 18,
      note: 'Unchanged text nodes are never rewritten.',
    },
    {
      id: 'relay-south',
      label: 'South relay',
      packets: 9,
      note: 'Built with createElement and textContent only.',
    },
  ];

  protected readonly lastMutations = signal(0);

  ngAfterViewInit(): void {
    const host = this.mountRef().nativeElement;
    this.view = createLiveView<readonly DemoRow[]>(host, {
      render(root, initial) {
        const ul = root.ownerDocument.createElement('ul');
        setAttr(
          ul,
          'style',
          'list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--bx-space-2);',
        );
        root.appendChild(ul);
        const apply = (next: readonly DemoRow[]) => {
          patchKeyedRows(ul, next, rowSpec);
        };
        apply(initial);
        return apply;
      },
    });
    this.view.update(this.rows);
    this.observer = new MutationObserver(() => {});
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  protected replayUnchanged(): void {
    this.applyMeasured(this.rows.map((r) => ({ ...r })));
  }

  protected tickFirst(): void {
    const [first, ...rest] = this.rows;
    if (!first) return;
    this.rows = [{ ...first, packets: first.packets + 1 }, ...rest];
    this.applyMeasured(this.rows);
  }

  protected rotateRows(): void {
    if (this.rows.length < 2) return;
    const [first, ...rest] = this.rows;
    this.rows = [...rest, first!];
    this.applyMeasured(this.rows);
  }

  private applyMeasured(next: readonly DemoRow[]): void {
    if (!this.view || !this.observer) return;
    const host = this.mountRef().nativeElement;
    this.observer.disconnect();
    this.observer.takeRecords();
    this.observer.observe(host, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
    });
    this.view.update(next);
    const records = this.observer.takeRecords();
    this.observer.disconnect();
    this.lastMutations.set(records.length);
  }
}

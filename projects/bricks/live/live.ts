export type LivePrimitive = string | number | boolean | null | undefined;

export interface KeyedRowSpec<T, E extends Element = HTMLElement> {
  /** Stable, unique key per row item. */
  key: (item: T) => string;
  /** Builds a row element once when its key first appears, using DOM nodes only. */
  create: (item: T, doc: Document) => E;
  /** Updates only changed values on an existing row element. */
  patch: (row: E, item: T) => void;
}

export interface LiveViewSpec<S> {
  /** Renders initial DOM structure once into `root` and returns an updater for subsequent states. */
  render: (root: Element, initial: S) => (next: S) => void;
}

export interface LiveView<S> {
  update: (state: S) => void;
}

const KEY_ATTR = 'data-bx-key';
const rowMaps = new WeakMap<Element, Map<string, Element>>();

/**
 * Sets text content of `el` only when it changed. When `el` already holds a single Text node,
 * updates `textNode.data` in place so the Text node identity is preserved.
 */
export function setText(el: Element | null | undefined, value: LivePrimitive): boolean {
  if (!el) return false;
  const next = value === null || value === undefined ? '' : String(value);
  const first = el.firstChild;
  if (el.childNodes.length === 1 && first && first.nodeType === 3) {
    const textNode = first as Text;
    if (textNode.data === next) return false;
    textNode.data = next;
    return true;
  }
  if (!first && next === '') return false;
  el.textContent = next;
  return true;
}

function syncFormProperty(el: Element, name: string, value: string | null): void {
  if (name === 'value' && 'value' in el) {
    (el as HTMLInputElement).value = value ?? '';
  } else if (name === 'checked' && 'checked' in el) {
    (el as HTMLInputElement).checked = value !== null;
  } else if (name === 'disabled' && 'disabled' in el) {
    (el as HTMLButtonElement).disabled = value !== null;
  } else if (name === 'selected' && 'selected' in el) {
    (el as HTMLOptionElement).selected = value !== null;
  }
}

/**
 * Sets or removes attribute `name` on `el` only when its value changed.
 * Leaves `value` untouched while `el` is the active focused element.
 */
export function setAttr(
  el: Element | null | undefined,
  name: string,
  value: LivePrimitive,
): boolean {
  if (!el) return false;
  if (name === 'value' && 'value' in el && el === el.ownerDocument?.activeElement) {
    return false;
  }
  if (value === null || value === undefined || value === false) {
    if (!el.hasAttribute(name)) return false;
    el.removeAttribute(name);
    syncFormProperty(el, name, null);
    return true;
  }
  const next = value === true ? '' : String(value);
  if (el.getAttribute(name) === next) {
    if (name === 'value' && 'value' in el && (el as HTMLInputElement).value !== next) {
      (el as HTMLInputElement).value = next;
      return true;
    }
    return false;
  }
  el.setAttribute(name, next);
  syncFormProperty(el, name, next);
  return true;
}

function getRowMap(container: Element): Map<string, Element> {
  let map = rowMaps.get(container);
  if (!map) {
    map = new Map<string, Element>();
    for (let child = container.firstElementChild; child; child = child.nextElementSibling) {
      const key = child.getAttribute(KEY_ATTR);
      if (key && !map.has(key)) {
        map.set(key, child);
      }
    }
    rowMaps.set(container, map);
  }
  return map;
}

/**
 * Reconciles keyed child elements inside `container`: adds new keys, removes missing keys,
 * moves reordered keys without recreating them, and calls `spec.patch` on existing rows.
 */
export function patchKeyedRows<T, E extends Element = HTMLElement>(
  container: Element,
  items: readonly T[],
  spec: KeyedRowSpec<T, E>,
): E[] {
  const doc = container.ownerDocument;
  const known = getRowMap(container);
  const seen = new Set<string>();
  const ordered: E[] = [];

  for (const item of items) {
    const key = spec.key(item);
    if (seen.has(key)) {
      throw new Error(`Duplicate live-view row key "${key}"`);
    }
    seen.add(key);
  }

  for (const [key, row] of known) {
    if (!seen.has(key)) {
      if (row.parentNode === container) {
        container.removeChild(row);
      }
      known.delete(key);
    }
  }

  let cursor: Element | null = container.firstElementChild;
  for (const item of items) {
    const key = spec.key(item);
    const existing = known.get(key) as E | undefined;
    let row: E;
    if (existing && existing.ownerDocument === doc) {
      row = existing;
      if (row === cursor) {
        cursor = cursor.nextElementSibling;
      } else {
        container.insertBefore(row, cursor);
      }
      spec.patch(row, item);
    } else {
      row = spec.create(item, doc);
      setAttr(row, KEY_ATTR, key);
      known.set(key, row);
      container.insertBefore(row, cursor);
    }
    ordered.push(row);
  }

  while (cursor) {
    const next = cursor.nextElementSibling;
    if (!cursor.hasAttribute(KEY_ATTR) || !seen.has(cursor.getAttribute(KEY_ATTR)!)) {
      container.removeChild(cursor);
    }
    cursor = next;
  }

  return ordered;
}

/** Mounts a live view that builds its DOM structure on first `update` and patches thereafter. */
export function createLiveView<S>(container: Element, spec: LiveViewSpec<S>): LiveView<S> {
  let apply: ((next: S) => void) | null = null;
  return {
    update(state: S): void {
      if (!apply) {
        apply = spec.render(container, state);
      } else {
        apply(state);
      }
    },
  };
}

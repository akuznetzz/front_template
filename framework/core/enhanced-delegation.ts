/* eslint no-use-before-define: "off" */

import {assert, assertIsDefined} from '~/common/assertions';

export interface EDEvent {
  eventId: symbol;
  parameters: Object;
  passEvent: () => void | Promise<void>;
  observable: Object;
  done: boolean;
}

export function installEventHandler(observable: Object, eventId: symbol, handler: EDHandler) {
  getEventList(observable).addEventHandler(eventId, handler);
}

export function removeEventHandler(observable: Object, eventId: symbol, handler: EDHandler) {
  if (!observable) return;
  getEventList(observable).deleteEventHandler(eventId, handler);
}

export async function sendEvent(observable: Object, eventId: symbol, parameters: Object, defaultHandler?: EDHandler) {
  const eventInfo = getEventInfo(observable, eventId);
  if (eventInfo === undefined && defaultHandler === undefined) {
    return;
  }
  const event = new EDEventImpl(eventId, parameters);
  if (eventInfo === undefined) {
    assertIsDefined(defaultHandler);
    await defaultHandler(event);
  } else {
    event.first = true;
    event.eventInfo = eventInfo;
    event.defaultHandler = defaultHandler;
    eventInfo.lock();
    try {
      await eventInfo.sendEvent(event);
    } finally {
      eventInfo.unlock();
    }
  }
}

class EventInfo {
  private handlers = new Array<EDHandler | null>();
  public readonly ownerEventList: EventList;
  private lockCount: number = 0;
  private needToClear: Boolean = false;

  constructor(ownerEventList: EventList) {
    this.ownerEventList = ownerEventList;
  }

  lock() {
    this.lockCount++;
  }

  unlock() {
    this.lockCount--;
    assert(this.lockCount >= 0, 'lock and unlock should be called in pair');
    if (this.lockCount === 0 && this.needToClear) {
      this.clear();
    }
  }

  private clear() {
    this.needToClear = false;
    this.handlers = this.handlers.filter((handler) => handler !== null);
  }

  async passEvent(event: EDEventImpl) {
    event.first = false;
    await this.sendEvent(event);
  }

  async sendEvent(event: EDEventImpl) {
    if (event.first) {
      event.first = false;
      event.currentIndex = this.handlers.length - 1;
    } else {
      assert(event.eventInfo === this);
      assertIsDefined(event.currentIndex);
      event.currentIndex--;
    }
    while (!event.done && event.currentIndex >= 0) {
      const currentHandler = this.handlers[event.currentIndex];
      if (currentHandler !== null) {
        assert(currentHandler !== event.defaultHandler);
        await currentHandler(event);
      }
      event.currentIndex--;
    }

    if (!event.done && event.defaultHandler !== undefined) {
      const defaultHandler = event.defaultHandler;
      event.defaultHandler = undefined;
      await defaultHandler(event);
    }
  }

  addHandler(handler: EDHandler) {
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler);
    }
  }

  removeHandler(handler: EDHandler) {
    const index = this.handlers.indexOf(handler);
    if (index >= 0) {
      this.handlers[index] = null;
      this.needToClear = true;
    }
  }
}

class EDEventImpl implements EDEvent {
  eventId: symbol;
  parameters: Object;
  done: boolean = false;

  first: Boolean = true;
  eventInfo?: EventInfo;
  defaultHandler?: EDHandler;
  currentIndex?: number;

  get observable() {
    assertIsDefined(this.eventInfo);
    return this.eventInfo.ownerEventList.ownerObservable;
  }

  async passEvent() {
    assertIsDefined(this.eventInfo);
    await this.eventInfo.passEvent(this);
  }

  constructor(eventId: symbol, parameters: Object) {
    this.eventId = eventId;
    this.parameters = parameters;
  }
}

class EventList {
  private eventMap = new Map<symbol, EventInfo>();
  public readonly ownerObservable: Object;

  constructor(ownerObservable: Object) {
    this.ownerObservable = ownerObservable;
  }

  deleteEventHandler(eventId: symbol, handler: EDHandler) {
    const eventInfo = this.eventMap.get(eventId);
    if (eventInfo === undefined) {
      return;
    }
    eventInfo.lock();
    try {
      eventInfo.removeHandler(handler);
    } finally {
      eventInfo.unlock();
    }
  }

  addEventHandler(eventId: symbol, handler: EDHandler) {
    let eventInfo = this.eventMap.get(eventId);
    if (eventInfo === undefined) {
      eventInfo = new EventInfo(this);
      this.eventMap.set(eventId, eventInfo);
    }
    eventInfo.lock();
    try {
      eventInfo.addHandler(handler);
    } finally {
      eventInfo.unlock();
    }
  }

  getEventInfo(eventId: symbol): EventInfo | undefined {
    return this.eventMap.get(eventId);
  }
}

export type EDHandler = (event: EDEvent) => void | Promise<void>;

function getEventList(observable: Object): EventList {
  let eventList = tryGetEventList(observable);
  if (eventList === undefined) {
    eventList = new EventList(observable);
    setEventList(observable, eventList);
  }
  return eventList;
}

const EVENT_LIST_KEY = Symbol('$eventList$');

function assertIsEventList(eventList: unknown): asserts eventList is EventList {
  assert(eventList instanceof EventList);
}

function tryGetEventList(observable: Object): EventList | undefined {
  const eventList = (observable as any)[EVENT_LIST_KEY];
  if (eventList) {
    assertIsEventList(eventList);
  }
  return eventList;
}

function setEventList(observable: Object, eventList: EventList) {
  (observable as any)[EVENT_LIST_KEY] = eventList;
}

function getEventInfo(observable: Object, eventId: symbol): EventInfo | undefined {
  const eventList = tryGetEventList(observable);
  if (eventList) {
    return eventList.getEventInfo(eventId);
  }
}

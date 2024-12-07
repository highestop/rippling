import { createStore } from 'rippling';
import { resizable } from '../resizable';
import { expect, it, describe, beforeEach, afterEach } from 'vitest';

describe('Resizable', () => {
  let handlerElem: HTMLElement;
  let targetElem: HTMLElement;
  let containerElem: HTMLElement;
  let signal: AbortSignal;
  let controller: AbortController;

  beforeEach(() => {
    handlerElem = document.createElement('div');
    targetElem = document.createElement('div');
    containerElem = document.createElement('div');

    containerElem.style.width = '500px';
    containerElem.style.height = '500px';

    targetElem.style.width = '30%';
    targetElem.style.height = '100%';

    handlerElem.style.width = '4px';
    handlerElem.style.height = '100%';

    document.body.appendChild(containerElem);
    containerElem.appendChild(handlerElem);
    containerElem.appendChild(targetElem);

    // 创建 AbortController
    controller = new AbortController();
    signal = controller.signal;
    signal.addEventListener('abort', () => {
      document.body.innerHTML = '';
    });
  });

  afterEach(() => {
    controller.abort();
  });

  it('should resize the target element horizontally', () => {
    createStore().set(resizable, handlerElem, targetElem, 'horizontal', signal);

    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 100,
      clientY: 250,
      bubbles: true,
      cancelable: true,
    });
    handlerElem.dispatchEvent(mouseDownEvent);

    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 300,
      clientY: 250,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(mouseMoveEvent);

    expect(targetElem.style.width).toBe('200px');
  });

  it('should resize the target element vertically', () => {
    createStore().set(resizable, handlerElem, targetElem, 'vertical', signal);

    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 100,
      clientY: 250,
    });
    handlerElem.dispatchEvent(mouseDownEvent);

    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 350,
    });
    document.dispatchEvent(mouseMoveEvent);

    expect(targetElem.style.height).toBe('100px');
  });
});

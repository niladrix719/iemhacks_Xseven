'use client'

import React, { useEffect, useRef, useState } from 'react';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBoxRef = useRef<number | null>(null);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [shapes, setShapes] = useState<{
    id: number;
    type: 'square' | 'circle' | 'triangle';
    left: number;
    top: number;
  }[]>([]);
  const shapeIdCounter = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const onMouseDown = (e: MouseEvent, shapeId: number) => {
      activeBoxRef.current = shapeId;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      activeBoxRef.current = null;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (activeBoxRef.current === null) return;

      const newShapes = shapes.map((shape) => {
        if (shape.id === activeBoxRef.current) {
          const deltaX = e.clientX - prevMousePos.current.x;
          const deltaY = e.clientY - prevMousePos.current.y;

          const nextLeft = shape.left + deltaX;
          const nextTop = shape.top + deltaY;

          prevMousePos.current = { x: e.clientX, y: e.clientY };

          return { ...shape, left: nextLeft, top: nextTop };
        }
        return shape;
      });

      setShapes(newShapes);
    };

    container.addEventListener('mousedown', (e) => {
      const clickedShape = e.target as HTMLElement;
      const shapeId = parseInt(clickedShape.dataset.shapeId || '', 10);
      if (!isNaN(shapeId)) {
        onMouseDown(e, shapeId);
      }
    });

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    const cleanup = () => {
      // container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };

    return cleanup;
  }, [shapes]);

  const addShape = (shapeType: 'square' | 'circle' | 'triangle') => {
    const newShape = {
      id: shapeIdCounter.current++,
      type: shapeType,
      left: 0,
      top: 0,
    };
    setShapes([...shapes, newShape]);
  };

  return (
    <main>
      <div ref={containerRef} className="h-screen w-screen bg-white overflow-hidden relative">
        {shapes.map((shape) => (
          <div
            key={shape.id}
            data-shape-id={shape.id}
            className={`h-40 w-40 absolute cursor-pointer ${shape.type === 'circle' ? 'rounded-full' : ''}`}
            style={{ top: `${shape.top}px`, left: `${shape.left}px`, backgroundColor: 'red' }}
          ></div>
        ))}
      </div>
      <div>
        <button onClick={() => addShape('square')}>Add Square</button>
        <button onClick={() => addShape('circle')}>Add Circle</button>
        <button onClick={() => addShape('triangle')}>Add Triangle</button>
      </div>
    </main>
  );
}

export default App;

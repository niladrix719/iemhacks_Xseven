'use client'

import React, { useEffect, useRef, useState } from "react";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeBoxRef = useRef<number | null>(null);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [shapes, setShapes] = useState<
    {
      height: number;
      width: number;
      id: number;
      type: "square" | "circle" | "triangle";
      left: number;
      top: number;
    }[]
  >([]);
  const shapeIdCounter = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const context = canvas.getContext("2d");

    if (!context) return;
    const drawCanvas = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = "gray";

      const numXLines = canvas.width / gridSize;
      const numYLines = canvas.height / gridSize;

      for (let i = 0; i <= numXLines; i++) {
        const x = i * gridSize;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }

      for (let i = 0; i <= numYLines; i++) {
        const y = i * gridSize;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }
    };

    drawCanvas();

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

          const nextLeft = Math.round((shape.left + deltaX) / gridSize) * gridSize;
          const nextTop = Math.round((shape.top + deltaY) / gridSize) * gridSize;

          const widthDiff = Math.round(shape.width / gridSize);
          const heightDiff = Math.round(shape.height / gridSize);

          return {
            ...shape,
            left: nextLeft,
            top: nextTop,
            width: widthDiff * gridSize,
            height: heightDiff * gridSize,
          };
        }
        return shape;
      });

      setShapes(newShapes);
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    container.addEventListener("mousedown", (e) => {
      const clickedShape = e.target as HTMLElement;
      const shapeId = parseInt(clickedShape.dataset.shapeId || "", 10);
      if (!isNaN(shapeId)) {
        onMouseDown(e, shapeId);
      }
    });

    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    const cleanup = () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };

    return cleanup;
  }, [shapes]);

  const gridSize = 40;

  const addShape = (shapeType: "square" | "circle" | "triangle") => {
    const newShape = {
      id: shapeIdCounter.current++,
      type: shapeType,
      left: 0,
      top: 0,
      width: gridSize,
      height: gridSize,
    };

    const snapX = Math.round(newShape.left / gridSize) * gridSize;
    const snapY = Math.round(newShape.top / gridSize) * gridSize;

    newShape.left = snapX;
    newShape.top = snapY;

    setShapes([...shapes, newShape]);
  };

  return (
    <main>
      <div
        ref={containerRef}
        className="h-screen w-screen bg-white overflow-hidden relative"
        style={{ cursor: activeBoxRef.current ? "grabbing" : "grab" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0"></canvas>
        {shapes.map((shape) => (
          <div
            key={shape.id}
            data-shape-id={shape.id}
            className={`h-20 w-20 absolute cursor-pointer ${
              shape.type === "circle" ? "rounded-full" : ""
            }`}
            style={{
              top: `${shape.top}px`,
              left: `${shape.left}px`,
              backgroundColor: "red",
            }}
          ></div>
        ))}
      </div>
      <div>
        <button onClick={() => addShape("square")}>Add Square</button>
        <button onClick={() => addShape("circle")}>Add Circle</button>
        <button onClick={() => addShape("triangle")}>Add Triangle</button>
      </div>
    </main>
  );
}

export default App;
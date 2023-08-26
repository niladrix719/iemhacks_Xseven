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

    // Set canvas size to match the container size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const context = canvas.getContext("2d");

    if (!context) return;

    // Function to draw the canvas
    const drawCanvas = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw X and Y axis lines
      context.strokeStyle = "gray";

      // Number of X and Y axis lines
      const numXLines = 10; // Adjust as needed
      const numYLines = 10; // Adjust as needed

      // Spacing between X and Y axis lines
      const xSpacing = canvas.width / (numXLines + 1);
      const ySpacing = canvas.height / (numYLines + 1);

      // Draw X axis lines
      for (let i = 1; i <= numXLines; i++) {
        const x = i * xSpacing;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }

      // Draw Y axis lines
      for (let i = 1; i <= numYLines; i++) {
        const y = i * ySpacing;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }
    };

    // Initial canvas draw
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

      // Calculate the new position based on grid points
      const nextLeft = Math.round((shape.left + deltaX) / gridSize) * gridSize;
      const nextTop = Math.round((shape.top + deltaY) / gridSize) * gridSize;

      // Calculate the new width and height based on grid spacing
      const widthDiff = Math.round(shape.width / gridSize);
      const heightDiff = Math.round(shape.height / gridSize);

      return {
        ...shape,
        left: nextLeft,
        top: nextTop,
        width: widthDiff * gridSize, // Adjust width to align with the grid
        height: heightDiff * gridSize, // Adjust height to align with the grid
      };
    }
    return shape;
  });

  setShapes(newShapes);
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

  const gridSize = 40; // Adjust as needed based on your grid spacing

  const addShape = (shapeType: "square" | "circle" | "triangle") => {
    const newShape = {
      id: shapeIdCounter.current++,
      type: shapeType,
      left: 0,
      top: 0,
      width: gridSize,
      height: gridSize,
    };

    // Snap the new shape to the nearest (x, y) point on the grid
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
            className={`h-40 w-40 absolute cursor-pointer ${
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

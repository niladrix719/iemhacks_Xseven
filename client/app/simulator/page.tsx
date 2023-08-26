"use client";

import React, { useEffect, useRef, useState } from "react";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeBoxRef = useRef<number | null>(null);
  const activeDotRef = useRef<number | null>(null);

  const [shapes, setShapes] = useState<
    {
      id: number;
      type: "square" | "circle" | "triangle";
      left: number;
      top: number;
      offsetX?: number;
      offsetY?: number;
    }[]
  >([]);
  const shapeIdCounter = useRef<number>(0);

  const [connections, setConnections] = useState<
    {
      from: number;
      to: number;
    }[]
  >([]);

  const [draggingLine, setDraggingLine] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

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

      const gridSize = 20;

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

      context.strokeStyle = "yellow";
      context.lineWidth = 2;

      connections.forEach((connection) => {
        const fromShape = shapes.find((shape) => shape.id === connection.from);
        const toShape = shapes.find((shape) => shape.id === connection.to);

        if (fromShape && toShape) {
          context.beginPath();
          context.moveTo(fromShape.left + 10, fromShape.top + 10);
          context.lineTo(toShape.left + 10, toShape.top + 10);
          context.stroke();
        }
      });

      if (draggingLine) {
        context.strokeStyle = "yellow";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(draggingLine.startX, draggingLine.startY);
        context.lineTo(draggingLine.endX, draggingLine.endY);
        context.stroke();
      }
    };

    drawCanvas();

    const onMouseDown = (e: MouseEvent, shapeId: number) => {
      if (e.target instanceof HTMLElement) {
        const dotId = parseInt(e.target.dataset.dotId || "", 10);
        console.log(dotId, "");
        if (!isNaN(dotId) && dotId === shapeId) {
          setDraggingLine({
            startX: e.clientX,
            startY: e.clientY,
            endX: e.clientX,
            endY: e.clientY,
          });
          activeDotRef.current = shapeId;
          return;
        }
      }

      activeBoxRef.current = shapeId;
      const clickedShape = shapes.find((shape) => shape.id === shapeId);
      if (clickedShape) {
        const offsetX = e.clientX - clickedShape.left;
        const offsetY = e.clientY - clickedShape.top;
        clickedShape.offsetX = offsetX;
        clickedShape.offsetY = offsetY;
      }
    };

    const onMouseUp = () => {
      if (activeBoxRef.current === null && activeDotRef.current === null)
        return;

      if (draggingLine && activeDotRef.current !== null) {
        const fromId = shapes.find(
          (shape) =>
            shape.left + 10 === draggingLine.startX &&
            shape.top + 10 === draggingLine.startY
        )?.id;
        const toId = activeDotRef.current;

        if (fromId && fromId !== toId) {
          setConnections([...connections, { from: fromId, to: toId }]);
        }

        setDraggingLine(null);
        activeDotRef.current = null;
        return;
      }

      const newShapes = shapes.map((shape) => {
        if (shape.id === activeBoxRef.current) {
          const gridSize = 20;
          const left = Math.round(shape.left / gridSize) * gridSize;
          const top = Math.round(shape.top / gridSize) * gridSize;

          return {
            ...shape,
            left,
            top,
          };
        }
        return shape;
      });

      setShapes(newShapes);
      activeBoxRef.current = null;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (activeBoxRef.current === null) return;

      const newShapes = shapes.map((shape) => {
        if (shape.id === activeBoxRef.current) {
          const left = e.clientX - shape.offsetX!;
          const top = e.clientY - shape.offsetY!;

          return {
            ...shape,
            left,
            top,
          };
        }
        return shape;
      });

      setShapes(newShapes);

      if (draggingLine) {
        setDraggingLine({
          startX: draggingLine.startX,
          startY: draggingLine.startY,
          endX: e.clientX,
          endY: e.clientY,
        });
      }
    };

    container.addEventListener("mousedown", (e) => {
      const clickedShape = e.target as HTMLElement;
      const shapeId = parseInt(clickedShape.dataset.shapeId || "", 10);
      const dotId = parseInt(clickedShape.dataset.dotId || "", 10);
      if (!isNaN(shapeId) || !isNaN(dotId)) {
        const clickedShapeId = !isNaN(dotId) ? dotId : shapeId;
        onMouseDown(e, clickedShapeId);
      }
    });

    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    const cleanup = () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };

    return cleanup;
  }, [shapes, connections, draggingLine]);

  const addShape = (shapeType: "square" | "circle" | "triangle") => {
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
            className={`h-10 w-10 absolute cursor-pointer ${
              shape.type === "circle" ? "rounded-full" : ""
            }`}
            style={{
              top: `${shape.top}px`,
              left: `${shape.left}px`,
              backgroundColor: "red",
            }}
          >
            <div
              className="dot-element absolute w-2 h-2 bg-yellow-500 rounded-full cursor-pointer"
              data-dot-id={shape.id}
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            ></div>
          </div>
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

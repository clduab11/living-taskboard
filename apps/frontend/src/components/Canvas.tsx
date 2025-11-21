import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useCanvasStore } from '../store/canvasStore';
import { useCollaborationStore } from '../store/collaborationStore';
import { wsService } from '../services/websocket';
import { CanvasObject, ObjectType } from '@living-taskboard/shared';
import { v4 as uuidv4 } from 'uuid';

interface CanvasProps {
  boardId: string;
}

export const Canvas: React.FC<CanvasProps> = ({ boardId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const {
    objects,
    activeTool,
    zoom,
    pan,
    gridEnabled,
    addObject,
    updateObject,
    setZoom,
    setPan
  } = useCanvasStore();

  const { users } = useCollaborationStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 60, // Account for toolbar
      backgroundColor: '#ffffff',
      selection: activeTool.type === 'select',
    });

    fabricCanvasRef.current = canvas;

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 60,
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    // Setup event handlers
    setupCanvasEvents(canvas);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [boardId]);

  // Update canvas when tool changes
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    canvas.isDrawingMode = activeTool.type === 'pen';
    canvas.selection = activeTool.type === 'select';

    if (activeTool.type === 'pen' && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = activeTool.color || '#000000';
      canvas.freeDrawingBrush.width = activeTool.strokeWidth || 2;
    }
  }, [activeTool]);

  // Update zoom
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.setZoom(zoom);
    fabricCanvasRef.current.renderAll();
  }, [zoom]);

  // Update pan
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.viewportTransform[4] = pan.x;
    fabricCanvasRef.current.viewportTransform[5] = pan.y;
    fabricCanvasRef.current.renderAll();
  }, [pan]);

  const setupCanvasEvents = (canvas: fabric.Canvas) => {
    // Object creation
    canvas.on('mouse:down', (e) => {
      if (!e.pointer) return;

      // Read current tool state instead of closed-over value
      const currentTool = useCanvasStore.getState().activeTool;
      switch (currentTool.type) {
        case 'rectangle':
          createRectangle(canvas, e.pointer);
          break;
        case 'circle':
          createCircle(canvas, e.pointer);
          break;
        case 'text':
          createText(canvas, e.pointer);
          break;
        case 'sticky':
          createStickyNote(canvas, e.pointer);
          break;
      }
    });

    // Object modification
    canvas.on('object:modified', (e) => {
      if (!e.target) return;
      const obj = e.target;

      const canvasObject: Partial<CanvasObject> = {
        position: { x: obj.left || 0, y: obj.top || 0 },
        size: { width: obj.width || 0, height: obj.height || 0 },
        rotation: obj.angle || 0,
      };

      updateObject((obj as any).id, canvasObject);
      wsService.sendObjectUpdated({ id: (obj as any).id, ...canvasObject });
    });

    // Mouse move for cursor sharing
    let lastCursorUpdate = 0;
    canvas.on('mouse:move', (e) => {
      const now = Date.now();
      if (now - lastCursorUpdate < 50) return; // Throttle to 20fps

      if (e.pointer) {
        wsService.sendCursorMove(e.pointer);
        lastCursorUpdate = now;
      }
    });

    // Panning
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    canvas.on('mouse:down', (e) => {
      if (e.e.altKey || e.e.button === 1) {
        isPanning = true;
        lastPosX = e.e.clientX;
        lastPosY = e.e.clientY;
      }
    });

    canvas.on('mouse:move', (e) => {
      if (isPanning) {
        const deltaX = e.e.clientX - lastPosX;
        const deltaY = e.e.clientY - lastPosY;

        setPan({
          x: pan.x + deltaX,
          y: pan.y + deltaY,
        });

        lastPosX = e.e.clientX;
        lastPosY = e.e.clientY;
      }
    });

    canvas.on('mouse:up', () => {
      isPanning = false;
    });

    // Zooming
    canvas.on('mouse:wheel', (e) => {
      e.e.preventDefault();
      e.e.stopPropagation();

      const delta = e.e.deltaY;
      let newZoom = zoom;

      if (delta < 0) {
        newZoom *= 1.1;
      } else {
        newZoom /= 1.1;
      }

      setZoom(newZoom);
    });
  };

  const createRectangle = (canvas: fabric.Canvas, pointer: { x: number; y: number }) => {
    const rect = new fabric.Rect({
      left: pointer.x,
      top: pointer.y,
      width: 100,
      height: 100,
      fill: activeTool.color || '#4ECDC4',
      stroke: '#333',
      strokeWidth: 2,
    });

    const id = uuidv4();
    (rect as any).id = id;
    canvas.add(rect);

    const canvasObject: CanvasObject = {
      id,
      boardId,
      type: ObjectType.RECTANGLE,
      position: { x: pointer.x, y: pointer.y },
      size: { width: 100, height: 100 },
      rotation: 0,
      zIndex: 0,
      locked: false,
      visible: true,
      data: {
        fill: activeTool.color || '#4ECDC4',
        stroke: '#333',
        strokeWidth: 2,
        cornerRadius: 0,
      },
      createdBy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addObject(canvasObject);
    wsService.sendObjectCreated(canvasObject);
  };

  const createCircle = (canvas: fabric.Canvas, pointer: { x: number; y: number }) => {
    const circle = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 50,
      fill: activeTool.color || '#FF6B6B',
      stroke: '#333',
      strokeWidth: 2,
    });

    const id = uuidv4();
    (circle as any).id = id;
    canvas.add(circle);

    const canvasObject: CanvasObject = {
      id,
      boardId,
      type: ObjectType.CIRCLE,
      position: { x: pointer.x, y: pointer.y },
      size: { width: 100, height: 100 },
      rotation: 0,
      zIndex: 0,
      locked: false,
      visible: true,
      data: {
        fill: activeTool.color || '#FF6B6B',
        stroke: '#333',
        strokeWidth: 2,
        radius: 50,
      },
      createdBy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addObject(canvasObject);
    wsService.sendObjectCreated(canvasObject);
  };

  const createText = (canvas: fabric.Canvas, pointer: { x: number; y: number }) => {
    const text = new fabric.IText('Click to edit', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 20,
      fill: '#333',
    });

    const id = uuidv4();
    (text as any).id = id;
    canvas.add(text);

    const canvasObject: CanvasObject = {
      id,
      boardId,
      type: ObjectType.TEXT,
      position: { x: pointer.x, y: pointer.y },
      size: { width: 100, height: 30 },
      rotation: 0,
      zIndex: 0,
      locked: false,
      visible: true,
      data: {
        text: 'Click to edit',
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#333',
        align: 'left',
      },
      createdBy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addObject(canvasObject);
    wsService.sendObjectCreated(canvasObject);
  };

  const createStickyNote = (canvas: fabric.Canvas, pointer: { x: number; y: number }) => {
    const group = new fabric.Group([], {
      left: pointer.x,
      top: pointer.y,
    });

    const rect = new fabric.Rect({
      width: 200,
      height: 200,
      fill: '#FFEB3B',
      stroke: '#FBC02D',
      strokeWidth: 2,
    });

    const text = new fabric.IText('Add note...', {
      fontSize: 14,
      fill: '#333',
      left: 10,
      top: 10,
    });

    group.addWithUpdate(rect);
    group.addWithUpdate(text);

    const id = uuidv4();
    (group as any).id = id;
    canvas.add(group);

    const canvasObject: CanvasObject = {
      id,
      boardId,
      type: ObjectType.STICKY_NOTE,
      position: { x: pointer.x, y: pointer.y },
      size: { width: 200, height: 200 },
      rotation: 0,
      zIndex: 0,
      locked: false,
      visible: true,
      data: {
        text: 'Add note...',
        color: '#FFEB3B',
        fontSize: 14,
      },
      createdBy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addObject(canvasObject);
    wsService.sendObjectCreated(canvasObject);
  };

  return (
    <div className={`canvas-container ${gridEnabled ? 'canvas-grid' : ''}`}>
      <canvas ref={canvasRef} />

      {/* Render remote cursors */}
      {Array.from(users.values()).map(user => (
        user.cursor && (
          <div
            key={user.userId}
            className="remote-cursor"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={user.color}>
              <path d="M5 3L19 12L12 13L9 19L5 3Z" />
            </svg>
            <div className="cursor-label" style={{ backgroundColor: user.color }}>
              {user.userName}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

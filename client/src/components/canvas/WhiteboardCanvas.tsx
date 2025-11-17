import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Circle, IText, Group, PencilBrush } from 'fabric';
import { useWhiteboardStore } from '../../store/useWhiteboardStore';
import { yjsService } from '../../services/yjsService';
import { collaborationService } from '../../services/collaborationService';
import * as Y from 'yjs';
import './WhiteboardCanvas.css';

interface WhiteboardCanvasProps {
  roomId: string;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({ roomId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const {
    selectedTool,
    strokeColor,
    fillColor,
    strokeWidth,
    fontSize,
    isDarkMode,
    users,
  } = useWhiteboardStore();

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    });

    // Configure drawing brush
    if (selectedTool === 'pen') {
      canvas.isDrawingMode = true;
      const brush = new PencilBrush(canvas);
      brush.color = strokeColor;
      brush.width = strokeWidth;
      canvas.freeDrawingBrush = brush;
    }

    fabricCanvasRef.current = canvas;
    setIsReady(true);

    // Handle window resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Update canvas properties when tool/color changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (selectedTool === 'pen') {
      canvas.isDrawingMode = true;
      const brush = new PencilBrush(canvas);
      brush.color = strokeColor;
      brush.width = strokeWidth;
      canvas.freeDrawingBrush = brush;
    } else {
      canvas.isDrawingMode = false;
    }
  }, [selectedTool, strokeColor, strokeWidth]);

  // Update background color when dark mode changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
    canvas.renderAll();
  }, [isDarkMode]);

  // Setup Y.js for real-time collaboration
  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const { doc } = yjsService.connect(roomId);
    if (!doc) return;

    const yObjects = doc.getArray('canvas-objects');

    // Sync Y.js changes to Fabric.js
    const observer = (event: Y.YArrayEvent<any>) => {
      console.log('Y.js objects changed', event);
      // Handle object changes
    };

    yObjects.observe(observer);

    return () => {
      yObjects.unobserve(observer);
      yjsService.disconnect();
    };
  }, [roomId, isReady]);

  // Handle drawing and object creation
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleObjectAdded = (e: any) => {
      console.log('Object added', e.target);
      // Sync to Y.js
    };

    const handleObjectModified = (e: any) => {
      console.log('Object modified', e.target);
      // Sync to Y.js
    };

    canvas.on('object:added', handleObjectAdded);
    canvas.on('object:modified', handleObjectModified);

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.off('object:modified', handleObjectModified);
    };
  }, [isReady]);

  // Handle mouse tracking for live cursors
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let lastUpdate = 0;
    const throttleMs = 50;

    const handleMouseMove = (e: any) => {
      const now = Date.now();
      if (now - lastUpdate < throttleMs) return;
      
      lastUpdate = now;
      
      if (e.e) {
        const pointer = canvas.getViewportPoint(e.e);
        collaborationService.sendCursorMove({
          x: pointer.x,
          y: pointer.y,
        });
      }
    };

    canvas.on('mouse:move', handleMouseMove);

    return () => {
      canvas.off('mouse:move', handleMouseMove);
    };
  }, [isReady]);

  // Draw other users' cursors
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // This would be better implemented as an overlay layer
    // For now, we'll just log cursor positions
    users.forEach(user => {
      if (user.cursor) {
        console.log(`User ${user.name} cursor at`, user.cursor);
      }
    });
  }, [users]);

  // Handle tool-specific interactions
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || selectedTool === 'pen' || selectedTool === 'select') return;

    const pointer = canvas.getViewportPoint(e.nativeEvent);

    switch (selectedTool) {
      case 'rectangle': {
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 100,
          height: 100,
          fill: fillColor === 'transparent' ? undefined : fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        canvas.add(rect);
        break;
      }
      case 'circle': {
        const circle = new Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 50,
          fill: fillColor === 'transparent' ? undefined : fillColor,
          stroke: strokeColor,
          strokeWidth,
        });
        canvas.add(circle);
        break;
      }
      case 'text': {
        const text = new IText('Type here', {
          left: pointer.x,
          top: pointer.y,
          fontSize,
          fill: strokeColor,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        break;
      }
      case 'sticky': {
        const rect = new Rect({
          width: 200,
          height: 200,
          fill: '#ffd700',
          stroke: '#ccaa00',
          strokeWidth: 2,
        });
        const text = new IText('Note', {
          fontSize: 16,
          fill: '#000000',
          left: 100,
          top: 100,
          originX: 'center',
          originY: 'center',
        });
        const group = new Group([rect, text], {
          left: pointer.x,
          top: pointer.y,
        });
        canvas.add(group);
        break;
      }
    }
  };

  return (
    <div className="whiteboard-canvas-container">
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        className={isDarkMode ? 'dark' : ''}
      />
      
      {/* Render other users' cursors */}
      {users.map(user => (
        user.cursor && (
          <div
            key={user.id}
            className="user-cursor"
            style={{
              left: user.cursor.x,
              top: user.cursor.y,
              borderColor: user.color,
            }}
          >
            <div className="cursor-name" style={{ color: user.color }}>
              {user.name}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

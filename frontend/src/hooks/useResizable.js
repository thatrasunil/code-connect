import { useState, useEffect, useCallback } from 'react';

const useResizable = (initialWidth, minWidth = 200, maxWidth = 800) => {
    const [width, setWidth] = useState(initialWidth);
    const [isDragging, setIsDragging] = useState(false);

    const onMouseDown = useCallback(() => {
        setIsDragging(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none'; // Prevent text selection
    }, []);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    const onMouseMove = useCallback((e) => {
        if (isDragging) {
            // This needs to be handled by the component usage to determine direction (left vs right sidebar)
            // But for generic resizing, we often need the difference or absolute position. 
            // We'll return the event handler to be used by window/document
        }
    }, [isDragging]);

    // We actually need to attach the listener to window/document when dragging starts
    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e) => {
            // This specific logic depends on which side the panel is. 
            // If it's a left panel, x increases width.
            // If it's a right panel, x increases decreases width (usually, relative to window width).
            // So we'll let the component pass a setter or callback.
        };

        // Instead of complex logic here, let's keep the hook simple:
        // Just manage the dragging state and provide a way to update width.

        window.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging, onMouseUp]);

    return { width, setWidth, isDragging, onMouseDown };
};

export default useResizable;

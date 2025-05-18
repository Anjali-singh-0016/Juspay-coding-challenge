import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";

export default function App() {
    const [sprites, setSprites] = useState([{ id: 'sprite-1', x: 0, y: 0, rotation: 0, isHeroCharacter: false, width: 48, height: 48 }]);
    const [activeSpriteId, setActiveSpriteId] = useState('sprite-1');
    const [activeSprite, setActiveSprite] = useState(sprites[0]); // Potentially unnecessary re-creation
    const [activeBlock, setActiveBlock] = useState(null);
    const [spriteBlocks, setSpriteBlocks] = useState({ 'sprite-1': [] });
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [isHandlingCollision, setIsHandlingCollision] = useState(false);
    const [collisionOccurred, setCollisionOccurred] = useState(false);
    const midAreaRef = useRef(null);

    console.log("App component rendered");
    console.log("  sprites:", sprites);
    console.log("  activeSpriteId:", activeSpriteId);
    console.log("  spriteBlocks:", spriteBlocks);
    console.log("  shouldAnimate:", shouldAnimate);
    console.log("  collisionOccurred:", collisionOccurred);

    // Memoize the dropped blocks for the active sprite
    const droppedBlocksForActiveSprite = useMemo(() => {
        return spriteBlocks[activeSpriteId] || [];
    }, [spriteBlocks, activeSpriteId]);

    const addSprite = useCallback(() => {
        const newId = `sprite-${Date.now()}`;
        setSprites(prevSprites => [...prevSprites, { id: newId, x: 0, y: 0, rotation: 0, isHeroCharacter: false, width: 48, height: 48 }]);
        setSpriteBlocks(prevSpriteBlocks => ({ ...prevSpriteBlocks, [newId]: [] }));
        setActiveSpriteId(newId);
    }, []);

    const handleGreenFlagClicked = useCallback(() => {
        setShouldAnimate(true);
        setCollisionOccurred(false);
    }, []);

    const handleMidAreaDrop = useCallback((e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("blockType");
        // ... (rest of the drag and drop logic)
        if (type && activeSpriteId) {
            const newBlock = { type, targetSpriteId: activeSpriteId, /* ... other data */ };
            setSpriteBlocks(prevSpriteBlocks => ({
                ...prevSpriteBlocks,
                [activeSpriteId]: [...(prevSpriteBlocks[activeSpriteId] || []), newBlock]
            }));
        }
    }, [activeSpriteId]);

    const handleMidAreaDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const handleSetDroppedBlocks = useCallback((newBlock) => {
        setSpriteBlocks(prev => ({
            ...prev,
            [activeSpriteId]: [...(prev[activeSpriteId] || []), newBlock]
        }));
    }, [activeSpriteId]);

    useEffect(() => {
        const midAreaElement = midAreaRef.current;
        if (midAreaElement) {
            midAreaElement.addEventListener("dragover", handleMidAreaDragOver);
            midAreaElement.addEventListener("drop", handleMidAreaDrop);
        }
        return () => {
            if (midAreaElement) {
                midAreaElement.removeEventListener("dragover", handleMidAreaDragOver);
                midAreaElement.removeEventListener("drop", handleMidAreaDrop);
            }
        };
    }, [handleMidAreaDrop, handleMidAreaDragOver]);

    const handleCollision = useCallback((spriteId1, spriteId2) => {
        // ... (collision handling logic)
    }, [isHandlingCollision, collisionOccurred, setSprites]);

    const handleSpriteClickInPreview = useCallback((spriteId) => {
        setActiveSpriteId(spriteId);
        setShouldAnimate(false);
        setCollisionOccurred(false);
    }, [setActiveSpriteId, setShouldAnimate, setCollisionOccurred]);

    const greenFlagBlocks = useMemo(() => {
        return (spriteBlocks[activeSpriteId] || []).filter(block => block.eventType === 'green_flag_click');
    }, [spriteBlocks, activeSpriteId]);

    const animationBlocks = useMemo(() => {
        return (spriteBlocks[activeSpriteId] || []).filter(block => !block.eventType);
    }, [spriteBlocks, activeSpriteId]);

    return (
        <div className="bg-blue-100 pt-6 font-sans h-screen overflow-hidden flex flex-row">
            <div className="w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 border-r border-gray-200 bg-white">
                <Sidebar onGreenFlagClick={handleGreenFlagClicked} onSpriteCreationClick={addSprite} />
            </div>
            <div
                ref={midAreaRef}
                className="flex-1 h-full overflow-hidden flex flex-col bg-white border-t border-r border-gray-200 rounded-tr-xl mr-2"
            >
                <MidArea
                    droppedBlocks={droppedBlocksForActiveSprite}
                    setDroppedBlocks={handleSetDroppedBlocks}
                    activeSpriteId={activeSpriteId}
                />
            </div>
            <div className="w-1/3 h-full overflow-y-auto bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2">
                <PreviewArea
                    sprites={sprites}
                    activeSpriteId={activeSpriteId}
                    shouldAnimate={shouldAnimate}
                    setSprites={setSprites}
                    droppedBlocks={animationBlocks}
                    greenFlagBlocks={greenFlagBlocks}
                    onSetActiveSprite={setActiveSpriteId}
                    setShouldAnimate={setShouldAnimate}
                    onCollision={handleCollision}
                    collisionOccurred={collisionOccurred}
                    onSpriteClick={handleSpriteClickInPreview}
                />
            </div>
        </div>
    );
}
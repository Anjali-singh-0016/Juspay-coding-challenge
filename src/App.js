import React, { useState, useCallback, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";

export default function App() {
  const [sprites, setSprites] = useState([{ id: 'sprite-1', x: 0, y: 0, rotation: 0, isHeroCharacter: false, width: 48, height: 48 }]);
  const [activeSpriteId, setActiveSpriteId] = useState('sprite-1');
  const [spriteBlocks, setSpriteBlocks] = useState({ 'sprite-1': [] });
  const [triggerAnimation, setTriggerAnimation] = useState(false);
  const midAreaRef = useRef(null);
  const [heroId, setHeroId] = useState(null); // State for hero sprite ID

  const addSprite = useCallback(() => {
    const newId = `sprite-${Date.now()}`;
    setSprites(prevSprites => [...prevSprites, { id: newId, x: 0, y: 0, rotation: 0, isHeroCharacter: false, width: 48, height: 48 }]);
    setSpriteBlocks(prevSpriteBlocks => ({ ...prevSpriteBlocks, [newId]: [] }));
    setActiveSpriteId(newId);
  }, []);

  const handleGreenFlagClicked = useCallback(() => {
    console.log("Green flag clicked! Toggling animation in PreviewArea.");
    setTriggerAnimation((prev) => !prev); // Toggle animation state
  }, []);

  const handleMidAreaDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("blockType");
    const steps = e.dataTransfer.getData("steps");
    const degrees = e.dataTransfer.getData("degrees");
    const x = e.dataTransfer.getData("x");
    const y = e.dataTransfer.getData("y");
    const message = e.dataTransfer.getData("message");
    const duration = e.dataTransfer.getData("duration");

    if (type && activeSpriteId) {
      const newBlock = {
        type,
        targetSpriteId: activeSpriteId
      };
      if (steps) newBlock.steps = steps;
      if (degrees) newBlock.degrees = degrees;
      if (x) newBlock.x = x;
      if (y) newBlock.y = y;
      if (message) newBlock.message = message;
      if (duration) newBlock.duration = duration;

      setSpriteBlocks((prevSpriteBlocks) => {
        const updatedBlocks = { ...prevSpriteBlocks };
        updatedBlocks[activeSpriteId] = [
          ...(updatedBlocks[activeSpriteId] || []),
          newBlock,
        ];
        return updatedBlocks;
      });
    }
  }, [activeSpriteId]);

  const handleMidAreaDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

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
    console.log("Handling collision in App.js between:", spriteId1, "and", spriteId2);

    setSpriteBlocks(prevSpriteBlocks => {
      const blocks1 = prevSpriteBlocks[spriteId1] || [];
      const blocks2 = prevSpriteBlocks[spriteId2] || [];

      const newSpriteBlocks = { ...prevSpriteBlocks };

      // Correctly swap the blocks using a temporary variable
      const tempBlocks = blocks1;
      newSpriteBlocks[spriteId1] = blocks2;
      newSpriteBlocks[spriteId2] = tempBlocks;

      return newSpriteBlocks;
    });
  }, []);
  const handleSetHero = useCallback((spriteId) => {
    setHeroId(spriteId);
  }, []);

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
          droppedBlocks={spriteBlocks[activeSpriteId] || []}
          setDroppedBlocks={() => {}} // We are managing blocks in App.js now
        />
      </div>
      <div className="w-1/3 h-full overflow-y-auto bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2">
        <PreviewArea
          sprites={sprites}
          activeSpriteId={activeSpriteId}
          shouldAnimate={triggerAnimation}
          setSprites={setSprites}
          droppedBlocks={spriteBlocks[activeSpriteId] || []}
          onSetActiveSprite={setActiveSpriteId}
          setShouldAnimate={setTriggerAnimation}
          heroSpriteId={heroId} // Pass the hero ID
          onCollision={handleCollision} // Pass the collision handler
          onSetHero={handleSetHero} // Pass the function to set the hero
        />
      </div>
    </div>
  );
}

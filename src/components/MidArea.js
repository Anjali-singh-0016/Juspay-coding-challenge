import React from "react";

const MidArea = React.memo(({ droppedBlocks, setDroppedBlocks, activeSpriteId }) => {
    console.log("MidArea rendered", droppedBlocks);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = e.dataTransfer.getData("blockType");
        const steps = e.dataTransfer.getData("steps");
        const degrees = e.dataTransfer.getData("degrees");
        const x = e.dataTransfer.getData("x");
        const y = e.dataTransfer.getData("y");
        const message = e.dataTransfer.getData("message");
        const duration = e.dataTransfer.getData("duration");
        const eventType = e.dataTransfer.getData("eventType"); // Get event type if available

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
            if (eventType) newBlock.eventType = eventType; // Include event type if available

            setDroppedBlocks(prevBlocks => {
                const existingBlocks = Array.isArray(prevBlocks) ? prevBlocks : [];
                return [...existingBlocks, newBlock];
            });
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleChange = (index, field, value) => {
        if (Array.isArray(droppedBlocks)) {
            const updatedBlocks = droppedBlocks.map((block, i) =>
                i === index ? { ...block, [field]: value } : block
            );
            setDroppedBlocks(updatedBlocks);
        }
    };

    return (
        <div
            className="flex-1 h-full overflow-auto p-4 bg-gray-100"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            {Array.isArray(droppedBlocks) && droppedBlocks.length === 0 ? (
                <div className="text-gray-400">Drop blocks here...</div>
            ) : (
                Array.isArray(droppedBlocks) && droppedBlocks.map((block, index) => (
                    <div
                        key={index}
                        className="bg-blue-500 text-white px-2 py-1 my-2 text-sm rounded flex flex-wrap items-center"
                    >
                        {block.type === "move" && (
                            <>
                                Move
                                <input
                                    type="number"
                                    className="w-16 text-black mx-1 rounded text-xs"
                                    value={block.steps || 10}
                                    onChange={(e) => handleChange(index, "steps", e.target.value)}
                                />
                                steps
                            </>
                        )}
                        {block.type === "turn" && (
                            <>
                                Turn
                                <input
                                    type="number"
                                    className="w-16 text-black mx-1 rounded text-xs"
                                    value={block.degrees || 15}
                                    onChange={(e) => handleChange(index, "degrees", e.target.value)}
                                />
                                degrees
                            </>
                        )}
                        {block.type === "turn_right" && (
                            <>
                                Turn
                                <input
                                    type="number"
                                    className="w-16 text-black mx-1 rounded text-xs"
                                    value={block.degrees || 15}
                                    onChange={(e) => handleChange(index, "degrees", e.target.value)}
                                />
                                degrees
                            </>
                        )}
                        {block.type === "goto" && (
                            <>
                                Go to x:
                                <input
                                    type="number"
                                    className="w-16 text-black mx-1 rounded text-xs"
                                    value={block.x || 0}
                                    onChange={(e) => handleChange(index, "x", e.target.value)}
                                />
                                y:
                                <input
                                    type="number"
                                    className="w-16 text-black mx-1 rounded text-xs"
                                    value={block.y || 0}
                                    onChange={(e) => handleChange(index, "y", e.target.value)}
                                />
                            </>
                        )}
                        {block.type === "say_duration" && (
                            <>
                                Say
                                <input
                                    type="text"
                                    className="w-24 text-black mx-1 rounded text-xs"
                                    value={block.message || "Hello!"}
                                    onChange={(e) => handleChange(index, "message", e.target.value)}
                                />
                                for
                                <input
                                    type="number"
                                    className="w-12 text-black mx-1 rounded text-xs"
                                    value={block.duration || 2}
                                    onChange={(e) => handleChange(index, "duration", e.target.value)}
                                />
                                seconds
                            </>
                        )}
                        {block.type === "say" && (
                            <>
                                Say
                                <input
                                    type="text"
                                    className="w-24 text-black mx-1 rounded text-xs"
                                    value={block.message || "Hello!"}
                                    onChange={(e) => handleChange(index, "message", e.target.value)}
                                />
                            </>
                        )}
                        {block.type === "think_duration" && (
                            <>
                                Think
                                <input
                                    type="text"
                                    className="w-24 text-black mx-1 rounded text-xs"
                                    value={block.message || "Hmm..."}
                                    onChange={(e) => handleChange(index, "message", e.target.value)}
                                />
                                for
                                <input
                                    type="number"
                                    className="w-12 text-black mx-1 rounded text-xs"
                                    value={block.duration || 2}
                                    onChange={(e) => handleChange(index, "duration", e.target.value)}
                                />
                                seconds
                            </>
                        )}
                        {block.type === "think" && (
                            <>
                                Think
                                <input
                                    type="text"
                                    className="w-24 text-black mx-1 rounded text-xs"
                                    value={block.message || "Hmm..."}
                                    onChange={(e) => handleChange(index, "message", e.target.value)}
                                />
                            </>
                        )}
                        {block.eventType && (
                            <div className="bg-yellow-700 text-white px-1 py-0.5 rounded ml-1 text-xs">
                                Event: {block.eventType.replace(/_/g, ' ')}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    const shouldUpdate = prevProps.droppedBlocks !== nextProps.droppedBlocks || prevProps.activeSpriteId !== nextProps.activeSpriteId;
    console.log("MidArea memo compare:", {
        prevDroppedBlocks: prevProps.droppedBlocks,
        nextPropsDroppedBlocks: nextProps.droppedBlocks,
        droppedBlocksChanged: prevProps.droppedBlocks !== nextProps.droppedBlocks,
        prevActiveSpriteId: prevProps.activeSpriteId,
        nextActiveSpriteId: nextProps.activeSpriteId,
        activeSpriteIdChanged: prevProps.activeSpriteId !== nextProps.activeSpriteId,
        shouldUpdate
    });
    return !shouldUpdate; // Return true if props are equal (no re-render)
});

export default MidArea;
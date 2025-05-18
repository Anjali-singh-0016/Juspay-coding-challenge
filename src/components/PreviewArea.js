import React, { useState, useEffect, useRef, useCallback } from "react";
import CatSprite from "./CatSprite";

const PreviewArea = ({
    sprites,
    activeSpriteId,
    shouldAnimate,
    setSprites,
    droppedBlocks, // Only regular animation blocks here
    greenFlagBlocks, // Separate prop for green flag event blocks
    onSetActiveSprite,
    onCollision,
    onSpriteClick
}) => {
    const [speechText, setSpeechText] = useState("");
    const [speechType, setSpeechType] = useState(false);
    const [isSpeechVisible, setIsSpeechVisible] = useState(false);
    const speechTimeout = useRef(null);
    const animationFrame = useRef(null);
    const spriteBlockIndices = useRef({}); // Initialize here
    const animationTimers = useRef({});
    const collisionCooldown = useRef(false);
    const activeCollisions = useRef(new Set());
    const spritesRef = useRef(sprites);
    const executedBlocks = useRef(new Set()); // Track executed blocks within an animation cycle

    useEffect(() => {
        spritesRef.current = sprites;
    }, [sprites]);

    const executeBlock = useCallback(async (block) => {
        const targetSprite = spritesRef.current.find(sprite => sprite.id === block.targetSpriteId);
        if (targetSprite) {
            try {
                if (block.type === "move" && block.steps) {
                    setSprites(prevSprites =>
                        prevSprites.map(s =>
                            s.id === block.targetSpriteId
                                ? { ...s, x: s.x + parseInt(block.steps, 10) }
                                : s
                        )
                    );
                } else if (block.type === "turn" && block.degrees) {
                    setSprites(prevSprites =>
                        prevSprites.map(s =>
                            s.id === block.targetSpriteId
                                ? { ...s, rotation: s.rotation + parseInt(block.degrees, 10) }
                                : s
                        )
                    );
                } else if (block.type === "turn_right" && block.degrees) {
                    setSprites(prevSprites =>
                        prevSprites.map(s =>
                            s.id === block.targetSpriteId
                                ? { ...s, rotation: s.rotation - parseInt(block.degrees, 10) }
                                : s
                        )
                    );
                } else if (block.type === "goto" && block.x && block.y) {
                    setSprites(prevSprites =>
                        prevSprites.map(s =>
                            s.id === block.targetSpriteId
                                ? { ...s, x: parseInt(block.x, 10), y: parseInt(block.y, 10) }
                                : s
                        )
                    );
                } else if ((block.type === "say" || block.type === "say_duration") && block.message) {
                    if (block.targetSpriteId === activeSpriteId) {
                        setSpeechText(block.message);
                        setSpeechType("say");
                        setIsSpeechVisible(true);
                        const duration = block.duration ? parseInt(block.duration, 10) * 1000 : 2000;
                        clearTimeout(speechTimeout.current);
                        speechTimeout.current = setTimeout(() => {
                            setIsSpeechVisible(false);
                            setSpeechText("");
                        }, duration);
                    }
                } else if ((block.type === "think" || block.type === "think_duration") && block.message) {
                    if (block.targetSpriteId === activeSpriteId) {
                        setSpeechText(block.message);
                        setSpeechType("think");
                        setIsSpeechVisible(true);
                        const duration = block.duration ? parseInt(block.duration, 10) * 1000 : 2000;
                        clearTimeout(speechTimeout.current);
                        speechTimeout.current = setTimeout(() => {
                            setIsSpeechVisible(false);
                            setSpeechText("");
                        }, duration);
                    }
                }
            } catch (error) {
                console.error("Error executing block:", block, error);
            }
        }
    }, [activeSpriteId, setSprites]);

    useEffect(() => {
        spriteBlockIndices.current = {}; // Access .current
        spritesRef.current.forEach(sprite => {
            spriteBlockIndices.current[sprite.id] = 0;
        });
        executedBlocks.current.clear(); // Reset executed blocks on sprite or droppedBlocks change
    }, [sprites, droppedBlocks]);

    useEffect(() => {
        console.log("PreviewArea animation useEffect triggered. shouldAnimate:", shouldAnimate);
        if (shouldAnimate) {
            executedBlocks.current.clear(); // Reset executed blocks on animation start
            console.log("Green flag blocks:", greenFlagBlocks);

            // Execute green flag blocks once at the start
            greenFlagBlocks.forEach(block => {
                const blockKey = `green-flag-${block.id}`;
                if (!executedBlocks.current.has(blockKey)) {
                    console.log("Executing Green Flag block:", block);
                    animationTimers.current[blockKey] = setTimeout(() => {
                        console.log("Green Flag block executed:", block);
                        executeBlock(block);
                        executedBlocks.current.add(blockKey);
                        delete animationTimers.current[blockKey];
                    }, block.delay || 0);
                }
            });

            const animate = () => {
                const currentSprites = spritesRef.current;

                currentSprites.forEach(heroSprite => {
                    const spriteBlocksToAnimate = droppedBlocks.filter(block => block.targetSpriteId === heroSprite.id);
                    console.log("Blocks to animate for", heroSprite.id, ":", spriteBlocksToAnimate);
                    let currentBlockIndex = spriteBlockIndices.current[heroSprite.id] || 0;
                    console.log("Current block index for", heroSprite.id, ":", currentBlockIndex);

                    if (spriteBlocksToAnimate.length > 0 && currentBlockIndex < spriteBlocksToAnimate.length) {
                        const currentBlock = spriteBlocksToAnimate[currentBlockIndex];
                        const blockKey = `${heroSprite.id}-${currentBlockIndex}`;
                        const delay = currentBlock.delay ? parseInt(currentBlock.delay, 10) : 100;

                        if (!executedBlocks.current.has(blockKey)) {
                            console.log("Executing animation block:", currentBlock);
                            animationTimers.current[blockKey] = setTimeout(() => {
                                console.log("Animation block executed:", currentBlock);
                                executeBlock(currentBlock);
                                executedBlocks.current.add(blockKey);
                                currentBlockIndex++;
                                spriteBlockIndices.current[heroSprite.id] = currentBlockIndex;

                                if (currentBlockIndex >= spriteBlocksToAnimate.length) {
                                    spriteBlockIndices.current[heroSprite.id] = 0;
                                }
                                delete animationTimers.current[blockKey];
                            }, delay);
                        }
                    }
                });

                if (!collisionCooldown.current) {
                    for (let i = 0; i < currentSprites.length; i++) {
                        for (let j = i + 1; j < currentSprites.length; j++) {
                            const sprite1 = currentSprites[i];
                            const sprite2 = currentSprites[j];
                            const pairKey = [sprite1.id, sprite2.id].sort().join("-");

                            const checkCollision = (s1, s2) => {
                                if (!s1.width || !s1.height || !s2.width || !s2.height) return false;
                                const rect1 = { left: s1.x - s1.width / 2, right: s1.x + s1.width / 2, top: s1.y - s1.height / 2, bottom: s1.y + s1.height / 2 };
                                const rect2 = { left: s2.x - s2.width / 2, right: s2.x + s2.width / 2, top: s2.y - s2.height / 2, bottom: s2.y + s2.height / 2 };
                                return (rect1.left < rect2.right && rect1.right > rect2.left && rect1.top < rect2.bottom && rect1.bottom > rect2.top);
                            };

                            if (checkCollision(sprite1, sprite2)) {
                                if (!activeCollisions.current.has(pairKey)) {
                                    console.log("Collision detected and triggered between:", sprite1.id, "and", sprite2.id);
                                    activeCollisions.current.add(pairKey);
                                    onCollision(sprite1.id, sprite2.id);
                                    collisionCooldown.current = true;
                                    setTimeout(() => {
                                        collisionCooldown.current = false;
                                    }, 200);
                                }
                            } else {
                                activeCollisions.current.delete(pairKey);
                            }
                        }
                    }
                }

                animationFrame.current = requestAnimationFrame(animate);
            };

            animationFrame.current = requestAnimationFrame(animate);
        } else if (!shouldAnimate) {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
            Object.values(animationTimers.current).forEach(clearTimeout);
            animationTimers.current = {};
            spritesRef.current.forEach(sprite => {
                spriteBlockIndices.current[sprite.id] = 0; // Access .current
            });
            activeCollisions.current.clear();
            executedBlocks.current.clear();
        }

        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
            Object.values(animationTimers.current).forEach(clearTimeout);
            animationTimers.current = {};
        };
    }, [shouldAnimate, droppedBlocks, greenFlagBlocks, onCollision, executeBlock, setSprites]);

    const handleSpriteClick = useCallback((spriteId) => {
        onSetActiveSprite(spriteId);
        onSpriteClick(spriteId);
    }, [onSetActiveSprite, onSpriteClick]);

    return (
        <div className="flex-none h-full overflow-y-auto p-2 relative bg-white">
            {spritesRef.current.map((sprite) => (
                <React.Fragment key={sprite.id}>
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            transform: `translate(-50%, -50%) translate(${sprite.x}px, ${sprite.y}px) rotate(${sprite.rotation}deg)`,
                            transition: "transform 0.2s ease-in-out",
                            width: sprite.width ? `${sprite.width}px` : 'auto',
                            height: sprite.height ? `${sprite.height}px` : 'auto',
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.8em",
                            userSelect: "none", // Prevent text selection on drag/click
                        }}
                        onMouseDown={() => handleSpriteClick(sprite.id)}
                        onTouchStart={() => handleSpriteClick(sprite.id)} // For touch devices
                    >
                        <div style={{ position: "relative", width: "auto", height: "auto" }}>
                            <CatSprite />
                            {activeSpriteId === sprite.id && isSpeechVisible && speechText && (
                                <div
                                    className={`absolute top-[-2em] left-1/2 transform translate-x-[-50%] bg-white border border-gray-300 rounded-lg shadow-md p-2 text-sm max-w-xs text-center ${speechType === "think" ? "rounded-xl" : ""
                                        }`}
                                    style={{
                                        position: "absolute",
                                        top: "-2em",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    {speechType === "think" && (
                                        <div className="absolute top-full left-1/2 transform translate-x-[-50%] transform translate-y-[-5px] w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-white border-t-gray-300" />
                                    )}
                                    {speechText}
                                    {speechType === "say" && (
                                        <div className="absolute top-full left-1/2 transform translate-x-[-50%] transform translate-y-[-5px] w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-white border-t-gray-300" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </React.Fragment>
            ))}
            <div className="absolute bottom-0 left-0 w-full bg-gray-100 border-t border-gray-200 p-2 flex items-center">
                {spritesRef.current.map((sprite) => (
                    <div
                        key={sprite.id}
                        className={`mr-4 cursor-pointer flex flex-col items-center ${activeSpriteId === sprite.id ? 'border-2 border-blue-500' : ''}`}
                        onClick={() => onSpriteClick(sprite.id)}
                        onTouchStart={() => onSpriteClick(sprite.id)} // For touch devices
                    >
                        <div className="w-16 h-16 bg-white border border-gray-300 rounded flex items-center justify-center">
                            <div>Cat</div>
                        </div>
                        <div className="text-xs text-center mt-1">{sprite.id}</div>
                        <label className="text-xs mt-1">
                            Hero:
                            <input
                                type="checkbox"
                                className="ml-1"
                                checked={sprite.isHeroCharacter}
                                onChange={(e) => {
                                    setSprites(prevSprites =>
                                        prevSprites.map(s =>
                                            s.id === sprite.id ? { ...s, isHeroCharacter: e.target.checked } : s
                                        )
                                    );
                                }}
                            />
                        </label>
                    </div>
                ))}
                <div>
                    <div className="text-xs font-bold">Stage</div>
                </div>
            </div>
        </div>
    );
};

export default PreviewArea;
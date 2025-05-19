import React, { useState, useEffect, useRef } from "react";
import CatSprite from "./CatSprite";

export default function PreviewArea({
    sprites,
    activeSpriteId,
    shouldAnimate,
    setSprites,
    droppedBlocks,
    onSetActiveSprite,
    setShouldAnimate,
    heroSpriteId,
    onCollision,
    onSetHero,
}) {
    const [speechText, setSpeechText] = useState("");
    const [speechType, setSpeechType] = useState("");
    const [isSpeechVisible, setIsSpeechVisible] = useState(false);
    const speechTimeout = useRef(null);
    const animationFrame = useRef(null);
    const blockIndex = useRef(0);

    useEffect(() => {
        return () => {
            clearTimeout(speechTimeout.current);
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, []);

    useEffect(() => {
        if (shouldAnimate) {
            const activeSpriteBlocks = droppedBlocks.filter(
                (block) => block.targetSpriteId === activeSpriteId
            );

            const animate = () => {
                if (blockIndex.current < activeSpriteBlocks.length) {
                    executeBlock(activeSpriteBlocks[blockIndex.current]);
                    blockIndex.current++;
                    animationFrame.current = requestAnimationFrame(animate);
                } else {
                    blockIndex.current = 0;
                    setShouldAnimate(false);
                }
            };

            if (activeSpriteBlocks.length > 0) {
                animationFrame.current = requestAnimationFrame(animate);
            } else {
                setShouldAnimate(false);
                blockIndex.current = 0;
            }
        } else if (!shouldAnimate) {
            blockIndex.current = 0;
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        }
    }, [shouldAnimate, droppedBlocks, setSprites, sprites, activeSpriteId, setShouldAnimate]);

    // Collision Detection Logic
    useEffect(() => {
        if (heroSpriteId) {
            const hero = sprites.find(s => s.id === heroSpriteId);
            const others = sprites.filter(s => s.id !== heroSpriteId);

            if (hero) {
                others.forEach(other => {
                    if (checkCollision(hero, other)) {
                        onCollision(hero.id, other.id);
                    }
                });
            }
        }
    }, [sprites, heroSpriteId, onCollision]); // Run collision check on sprite updates

    const checkCollision = (sprite1, sprite2) => {
        // Basic AABB collision detection (assuming sprite width and height)
        const r1 = {
            left: sprite1.x - (sprite1.width / 2 || 24),
            right: sprite1.x + (sprite1.width / 2 || 24),
            top: sprite1.y - (sprite1.height / 2 || 24),
            bottom: sprite1.y + (sprite1.height / 2 || 24),
        };

        const r2 = {
            left: sprite2.x - (sprite2.width / 2 || 24),
            right: sprite2.x + (sprite2.width / 2 || 24),
            top: sprite2.y - (sprite2.height / 2 || 24),
            bottom: sprite2.y + (sprite2.height / 2 || 24),
        };

        return !(
            r1.right < r2.left ||
            r1.left > r2.right ||
            r1.bottom < r2.top ||
            r1.top > r2.bottom
        );
    };

    const executeBlock = async (block) => {
        const targetSprite = sprites.find(sprite => sprite.id === block.targetSpriteId);
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
                        await new Promise(resolve => {
                            speechTimeout.current = setTimeout(() => {
                                setIsSpeechVisible(false);
                                setSpeechText("");
                                resolve();
                            }, duration);
                        });
                    }
                } else if ((block.type === "think" || block.type === "think_duration") && block.message) {
                    if (block.targetSpriteId === activeSpriteId) {
                        setSpeechText(block.message);
                        setSpeechType("think");
                        setIsSpeechVisible(true);
                        const duration = block.duration ? parseInt(block.duration, 10) * 1000 : 2000;
                        clearTimeout(speechTimeout.current);
                        await new Promise(resolve => {
                            speechTimeout.current = setTimeout(() => {
                                setIsSpeechVisible(false);
                                setSpeechText("");
                                resolve();
                            }, duration);
                        });
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 100)); // Adjust delay as needed
            } catch (error) {
                console.error("Error executing block:", block, error);
            }
        }
    };

    return (
        <div className="flex-none h-full overflow-y-auto p-2 relative bg-white">
            {sprites.map((sprite) => (
                <div
                    key={sprite.id}
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%) translate(${sprite.x}px, ${sprite.y}px) rotate(${sprite.rotation}deg)`,
                        transition: "transform 0.3s ease-in-out",
                        width: "auto",
                        height: "auto",
                    }}
                >
                    <div style={{ position: "relative", width: "auto", height: "auto" }}>
                        <CatSprite isHero={sprite.id === heroSpriteId} />
                        {activeSpriteId === sprite.id && isSpeechVisible && speechText && (
                            <div
                                className={`absolute top-[-2em] left-1/2 transform translate-x-[-50%] bg-white border border-gray-300 rounded-lg shadow-md p-2 text-sm max-w-xs text-center ${
                                    speechType === "think" ? "rounded-xl" : ""
                                }`}
                                style={{
                                    position: "absolute",
                                    top: "-2em",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                }}
                            >
                                {speechType === "think" && <div className="absolute top-full left-1/2 transform translate-x-[-50%] transform translate-y-[-5px] w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-white border-t-gray-300" />}
                                {speechText}
                                {speechType === "say" && <div className="absolute top-full left-1/2 transform translate-x-[-50%] transform translate-y-[-5px] w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-white border-t-gray-300" />}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            <div className="absolute bottom-0 left-0 w-full bg-gray-100 border-t border-gray-200 p-2 flex items-center">
                {sprites.map((sprite) => (
                    <div
                        key={sprite.id}
                        className={`mr-4 cursor-pointer ${activeSpriteId === sprite.id ? 'border-2 border-blue-500' : ''} ${heroSpriteId === sprite.id ? 'border-4 border-green-500' : ''}`}
                        onClick={() => {
                            onSetActiveSprite(sprite.id);
                            onSetHero(sprite.id);
                        }}
                    >
                        <div className="w-16 h-16 bg-white border border-gray-300 rounded flex items-center justify-center">
                            <div>Cat</div>
                        </div>
                        <div className="text-xs text-center mt-1">{sprite.id}</div>
                    </div>
                ))}
                <div>
                    <div className="text-xs font-bold">Stage</div>
                </div>
            </div>
        </div>
    );
}

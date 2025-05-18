import React from "react";
import Icon from "./Icon";

export default function Sidebar({ onGreenFlagClick, onSpriteCreationClick }) {
  return (
    <div className="w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 border-r border-gray-200">
      <div className="font-bold">{"Events"}</div>
      <div
        onClick={onGreenFlagClick}
        className="flex flex-row flex-wrap bg-yellow-500 text-white px-3 py-2 my-1 text-sm cursor-pointer rounded"
      >
        {"When "}
        <Icon name="flag" size={15} className="text-green-600 mx-2" />
        {"clicked"}
      </div>
      <div
        onClick={onSpriteCreationClick}
        className="flex flex-row flex-wrap bg-yellow-500 text-white px-3 py-2 my-1 text-sm cursor-pointer rounded"
      >
        {"When this sprite clicked"}
      </div>

      <div className="font-bold mt-4">{"Motion"}</div>
      <div
        draggable
        onDragStart={(e) => {
          const stepsInput = e.target.querySelector('input[name="steps"]');
          e.dataTransfer.setData("blockType", "move"); // Corrected type
          e.dataTransfer.setData("steps", stepsInput ? stepsInput.value : "10");
        }}
        className="flex flex-row flex-wrap bg-blue-500 text-white px-3 py-2 my-1 text-sm cursor-move rounded"
      >
        {"Move "}
        <input
          type="number"
          name="steps"
          defaultValue="10"
          className="w-16 text-black text-xs mx-1 rounded"
        />
        {" steps"}
      </div>
      <div
        draggable
        onDragStart={(e) => {
          const degreesInput = e.target.querySelector('input[name="degrees"]');
          e.dataTransfer.setData("blockType", "turn");
          e.dataTransfer.setData("degrees", degreesInput ? degreesInput.value : "15");
        }}
        className="flex flex-row flex-wrap bg-blue-500 text-white px-3 py-2 my-1 text-sm cursor-move rounded"
      >
        {"Turn "}
        <Icon name="undo" size={15} className="text-white mx-2" />
        <input
          type="number"
          name="degrees"
          defaultValue="15"
          className="w-16 text-black text-xs mx-1 rounded"
        />
        {" degrees"}
      </div>
      <div
        draggable
        onDragStart={(e) => {
          const degreesInput = e.target.querySelector('input[name="degrees"]');
          e.dataTransfer.setData("blockType", "turn_right");
          e.dataTransfer.setData("degrees", degreesInput ? degreesInput.value : "15");
        }}
        className="flex flex-row flex-wrap bg-blue-500 text-white px-3 py-2 my-1 text-sm cursor-move rounded"
      >
        {"Turn "}
        <Icon name="redo" size={15} className="text-white mx-2" />
        <input
          type="number"
          name="degrees"
          defaultValue="15"
          className="w-16 text-black text-xs mx-1 rounded"
        />
        {" degrees"}
      </div>
      <div
        draggable
        onDragStart={(e) => {
          const xInput = e.target.querySelector('input[name="x"]');
          const yInput = e.target.querySelector('input[name="y"]');
          e.dataTransfer.setData("blockType", "goto");
          e.dataTransfer.setData("x", xInput ? xInput.value : "0");
          e.dataTransfer.setData("y", yInput ? yInput.value : "0");
        }}
        className="flex flex-col bg-blue-500 text-white px-3 py-2 my-1 text-sm cursor-move rounded"
      >
        <div className="flex flex-row flex-wrap items-center">
          {"Go to x: "}
          <input
            type="number"
            name="x"
            defaultValue="0"
            className="w-16 text-black text-xs mx-1 rounded"
          />
        </div>
        <div className="flex flex-row flex-wrap items-center">
          {"y: "}
          <input
            type="number"
            name="y"
            defaultValue="0"
            className="w-16 text-black text-xs mx-1 rounded"
          />
        </div>
      </div>

      <div className="font-bold mt-4">{"Looks"}</div>
      <div
        draggable
        onDragStart={(e) => {
          const messageInput = e.target.querySelector('input[name="message"]');
          const durationInput = e.target.querySelector('input[name="duration"]');
          e.dataTransfer.setData("blockType", "say_duration");
          e.dataTransfer.setData("message", messageInput ? messageInput.value : "Hello!");
          e.dataTransfer.setData("duration", durationInput ? durationInput.value : "2");
        }}
        className="flex flex-row flex-wrap bg-purple-500 text-white px-3 py-2 my-1 text-sm cursor-move rounded"
      >
        {"Say "}
        <input
          type="text"
          name="message"
          defaultValue="Hello!"
          className="w-24 text-black text-xs mx-1 rounded"
        />
        {" for "}
        <input
          type="number"
          name="duration"
          defaultValue="2"
          className="w-10 text-black text-xs mx-1 rounded"
        />
        {" seconds"}
      </div>
      <div
        draggable
        onDragStart={(e) => {
          const messageInput = e.target.querySelector('input[name="message"]');
          e.dataTransfer.setData("blockType", "say");
          e.dataTransfer.setData("message", messageInput ? messageInput.value : "Hello!");
        }}
        className="flex flex-row flex-wrap bg-purple-500 text-white px-3 py-2 my-1 text-sm cursor-move rounded"
      >
        {"Say "}
        <input
          type="text"
          name="message"
          defaultValue="Hello!"
          className="w-24 text-black text-xs mx-1 rounded"
        />
      </div>
      <div
        draggable
        onDragStart={(e) => {
          const messageInput = e.target.querySelector('input[name="message"]');
          const durationInput = e.target.querySelector('input[name="duration"]');
          e.dataTransfer.setData("blockType", "think_duration");
          e.dataTransfer.setData("message", messageInput ? messageInput.value : "Hmm...");
          e.dataTransfer.setData("duration", durationInput ? durationInput.value : "2");
        }}
        className="flex flex-row flex-wrap bg-purple-500 text-white px-3 py-2 my-1 text-sm cursor-move rounded"
      >
        {"Think "}
        <input
          type="text"
          name="message"
          defaultValue="Hmm..."
          className="w-24 text-black text-xs mx-1 rounded"
        />
        {" for "}
        <input
          type="number"
          name="duration"
          defaultValue="2"
          className="w-10 text-black text-xs mx-1 rounded"
        />
        {" seconds"}
      </div>
      <div
        draggable
        onDragStart={(e) => {
          const messageInput = e.target.querySelector('input[name="message"]');
          e.dataTransfer.setData("blockType", "think");
          e.dataTransfer.setData("message", messageInput ? messageInput.value : "Hmm...");
        }}
        className="flex flex-row flex-wrap bg-purple-500 text-white px-3 py-2 my-1 text-sm cursor-move rounded"
      >
        {"Think "}
        <input
          type="text"
          name="message"
          defaultValue="Hmm..."
          className="w-24 text-black text-xs mx-1 rounded"
        />
      </div>
    </div>
  );
}
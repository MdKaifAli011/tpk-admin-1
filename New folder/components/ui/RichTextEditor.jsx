"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaHeading,
  FaImage,
  FaCode,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaUndo,
  FaRedo,
  FaTable,
} from "react-icons/fa";

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing your content...",
  disabled = false,
  className = "",
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const isCommandActive = (command) => {
    return document.queryCommandState(command);
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertHeading = (level) => {
    execCommand("formatBlock", `h${level}`);
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      const alt = prompt("Enter alt text (optional):") || "";
      const img = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto;" />`;
      execCommand("insertHTML", img);
    }
  };

  const insertButton = () => {
    const text = prompt("Enter button text:");
    const url = prompt("Enter button URL (optional):");
    if (text) {
      const button = url
        ? `<a href="${url}" class="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">${text}</a>`
        : `<button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">${text}</button>`;
      execCommand("insertHTML", button);
    }
  };

  const insertCode = () => {
    execCommand("formatBlock", "pre");
  };

  const setAlignment = (align) => {
    execCommand("justify" + align.charAt(0).toUpperCase() + align.slice(1));
  };

  const insertTable = () => {
    const rows = prompt("Enter number of rows (2-10):", "3");
    const cols = prompt("Enter number of columns (2-10):", "3");

    if (rows && cols && !isNaN(rows) && !isNaN(cols)) {
      const numRows = Math.min(Math.max(parseInt(rows), 2), 10);
      const numCols = Math.min(Math.max(parseInt(cols), 2), 10);

      let tableHTML =
        '<table class="border-collapse border border-gray-300 w-full">';

      // Create header row
      tableHTML += "<thead><tr>";
      for (let j = 0; j < numCols; j++) {
        tableHTML += `<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">Header ${
          j + 1
        }</th>`;
      }
      tableHTML += "</tr></thead>";

      // Create body rows
      tableHTML += "<tbody>";
      for (let i = 0; i < numRows - 1; i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < numCols; j++) {
          tableHTML += `<td class="border border-gray-300 px-4 py-2">Cell ${
            i + 1
          },${j + 1}</td>`;
        }
        tableHTML += "</tr>";
      }
      tableHTML += "</tbody></table>";

      execCommand("insertHTML", tableHTML);
    }
  };

  return (
    <div
      className={`border border-gray-300 rounded-xl overflow-hidden relative ${className}`}
    >
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className={`p-2 rounded-md transition-all duration-200 ${
            isCommandActive("bold")
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
          disabled={disabled}
          title="Bold"
        >
          <FaBold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCommand("italic")}
          className={`p-2 rounded-md transition-all duration-200 ${
            isCommandActive("italic")
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
          disabled={disabled}
          title="Italic"
        >
          <FaItalic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCommand("underline")}
          className={`p-2 rounded-md transition-all duration-200 ${
            isCommandActive("underline")
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
          disabled={disabled}
          title="Underline"
        >
          <FaUnderline className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertHeading(1)}
            className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            disabled={disabled}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertHeading(2)}
            className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            disabled={disabled}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertHeading(3)}
            className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            disabled={disabled}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => execCommand("insertUnorderedList")}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Bullet List"
        >
          <FaListUl className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCommand("insertOrderedList")}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Numbered List"
        >
          <FaListOl className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => setAlignment("left")}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Align Left"
        >
          <FaAlignLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setAlignment("center")}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Align Center"
        >
          <FaAlignCenter className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setAlignment("right")}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Align Right"
        >
          <FaAlignRight className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Media & Elements */}
        <button
          type="button"
          onClick={insertImage}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Insert Image"
        >
          <FaImage className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={insertLink}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Insert Link"
        >
          <FaLink className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={insertButton}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Insert Button"
        >
          🔘
        </button>

        <button
          type="button"
          onClick={() => execCommand("formatBlock", "blockquote")}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Quote"
        >
          <FaQuoteLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={insertCode}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Code Block"
        >
          <FaCode className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={insertTable}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Insert Table"
        >
          <FaTable className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* History */}
        <button
          type="button"
          onClick={() => execCommand("undo")}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Undo"
        >
          <FaUndo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => execCommand("redo")}
          className="p-2 rounded-md transition-all duration-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          disabled={disabled}
          title="Redo"
        >
          <FaRedo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`min-h-[300px] p-4 text-sm text-gray-700 focus:outline-none prose prose-sm max-w-none ${
          isFocused ? "ring-2 ring-blue-500 ring-opacity-50" : ""
        } ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
        style={{
          minHeight: "300px",
          lineHeight: "1.6",
          direction: "ltr",
          textAlign: "left",
        }}
        suppressContentEditableWarning={true}
      />

      {/* Add table styles */}
      <style jsx>{`
        .prose table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        .prose th,
        .prose td {
          border: 1px solid #d1d5db;
          padding: 0.5rem 1rem;
          text-align: left;
        }
        .prose th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        .prose tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .prose tr:hover {
          background-color: #f3f4f6;
        }
      `}</style>

      {!value && !isFocused && (
        <div className="absolute top-20 left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;

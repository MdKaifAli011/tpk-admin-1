"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
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
  FaStrikethrough,
  FaParagraph,
  FaFont,
  FaEraser,
} from "react-icons/fa";

/**
 * Improved RichTextEditor
 * - Better active-format detection (headings, lists, table, image, button, code, blockquote, link, alignment)
 * - MutationObserver to keep toolbar in sync when DOM changes (insert image/table/button)
 * - Small debounce on updates to avoid spamming updates on rapid input events
 *
 * Note: document.execCommand is deprecated but still supported broadly — works for this editor.
 */

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start writing your content...",
  disabled = false,
  className = "",
}) => {
  const editorRef = useRef(null);
  const observerRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // utility: find parent element of a node matching selector
  const closest = (node, selector) => {
    if (!node) return null;
    if (node.nodeType === 3) node = node.parentElement;
    while (node) {
      try {
        if (node.matches && node.matches(selector)) return node;
      } catch (e) {
        // invalid selector
      }
      node = node.parentElement;
    }
    return null;
  };

  // Debounced update to avoid too frequent state updates
  const queueUpdateActiveFormats = useCallback(() => {
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    updateTimeoutRef.current = setTimeout(() => {
      updateActiveFormats();
    }, 80);
  }, []);

  // Update active formats when selection changes or content changes
  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    const formats = {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      heading: null,
      list: null,
      table: false,
      image: false,
      button: false,
      link: false,
      codeblock: false,
      blockquote: false,
      align: null,
    };

    try {
      formats.bold = document.queryCommandState("bold");
      formats.italic = document.queryCommandState("italic");
      formats.underline = document.queryCommandState("underline");
      formats.strikethrough = document.queryCommandState("strikeThrough");
    } catch (e) {
      // ignore errors from queryCommandState in some browsers
    }

    // Determine the node we should inspect: either selection anchor or caret container
    let nodeToInspect = null;
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      nodeToInspect =
        range.commonAncestorContainer.nodeType === 3
          ? range.commonAncestorContainer.parentElement
          : range.commonAncestorContainer;
    } else {
      // fallback: use caret position or editor first child
      nodeToInspect = editorRef.current;
    }

    if (!nodeToInspect) nodeToInspect = editorRef.current;

    // If caret is inside an empty text node or inside editor, try to find nearest block ancestor
    let blockElement = nodeToInspect;
    while (blockElement && blockElement !== editorRef.current && !/^(P|DIV|H[1-6]|BLOCKQUOTE|PRE|LI|TD|TH)$/.test(blockElement.tagName)) {
      blockElement = blockElement.parentElement;
    }
    if (!blockElement || blockElement === editorRef.current) {
      // fallback to direct child or last element
      blockElement = nodeToInspect;
    }

    // heading detection
    const tagName = blockElement?.tagName?.toLowerCase();
    if (tagName?.match(/^h[1-6]$/)) {
      formats.heading = tagName; // 'h1', 'h2', etc.
    } else if (tagName === "p" || tagName === "div") {
      formats.heading = "p";
    } else if (tagName === "blockquote") {
      formats.heading = "blockquote";
      formats.blockquote = true;
    } else if (tagName === "pre") {
      formats.heading = "pre";
      formats.codeblock = true;
    }

    // alignment detection via computed style of block element
    try {
      const computedStyle = window.getComputedStyle(blockElement || editorRef.current);
      formats.align = computedStyle.textAlign || "left";
    } catch (e) {
      formats.align = null;
    }

    // list detection: closest ul or ol
    const ul = closest(nodeToInspect, "ul");
    const ol = closest(nodeToInspect, "ol");
    if (ul) formats.list = "ul";
    else if (ol) formats.list = "ol";

    // table detection
    const table = closest(nodeToInspect, "table");
    if (table) formats.table = true;

    // image detection: either cursor on an <img> or an ancestor contains an <img>
    const imgNode = nodeToInspect.nodeType === 1 && nodeToInspect.tagName === "IMG" ? nodeToInspect : closest(nodeToInspect, "img");
    if (imgNode) formats.image = true;

    // button detection: <button> or <a> that looks like a button (common class name patterns)
    const buttonNode = closest(nodeToInspect, "button") || closest(nodeToInspect, 'a[href].button, a[href][class*="btn"], a[href][class*="button"], a[href][class*="bg-"]');
    if (buttonNode) formats.button = true;

    // link detection
    const linkNode = closest(nodeToInspect, "a[href]");
    if (linkNode) formats.link = true;

    // blockquote detection (also set above)
    if (closest(nodeToInspect, "blockquote")) {
      formats.blockquote = true;
      formats.heading = "blockquote";
    }

    // code block detection (pre/code)
    if (closest(nodeToInspect, "pre") || closest(nodeToInspect, "code")) {
      formats.codeblock = true;
      formats.heading = "pre";
    }

    setActiveFormats(formats);
  }, []);

  // selection change handler
  const handleSelectionChange = useCallback(() => {
    if (isFocused) queueUpdateActiveFormats();
  }, [isFocused, queueUpdateActiveFormats]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Observe DOM mutations inside editor (images, tables, buttons inserted/pasted)
  useEffect(() => {
    if (!editorRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new MutationObserver(() => {
      queueUpdateActiveFormats();
    });
    observerRef.current.observe(editorRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [queueUpdateActiveFormats]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
    queueUpdateActiveFormats();
  };

  const handleFocus = () => {
    setIsFocused(true);
    queueUpdateActiveFormats();
  };

  const handleBlur = () => {
    setIsFocused(false);
    // small delay to ensure selection/format update after blur (so toolbar isn't stale)
    setTimeout(() => {
      queueUpdateActiveFormats();
    }, 50);
  };

  // wrapper for execCommand with safe parameters
  const execCommand = (command, value = null) => {
    if (!editorRef.current || disabled) return;
    editorRef.current.focus();
    try {
      // Some browsers expect the value as third argument
      document.execCommand(command, false, value);
    } catch (e) {
      // ignore
    }
    handleInput();
    setTimeout(queueUpdateActiveFormats, 10);
  };

  const isCommandActive = (command) => {
    try {
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };

  // Insert link
  const insertLink = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";
    const url = prompt("Enter URL:", selectedText || "https://");
    if (url) {
      if (selectedText) {
        execCommand("createLink", url);
      } else {
        const linkHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        execCommand("insertHTML", linkHTML);
      }
    }
  };

  // Insert heading reliably using explicit <h#> tag in formatBlock
  const insertHeading = (level) => {
    if (!editorRef.current || disabled) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString()) {
      // wrap selection in heading element
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      const heading = document.createElement(`h${level}`);
      heading.textContent = selectedText;
      range.deleteContents();
      range.insertNode(heading);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(heading);
      selection.addRange(newRange);
    } else {
      // use formatBlock with explicit tag
      execCommand("formatBlock", `<h${level}>`);
    }
    handleInput();
    setTimeout(queueUpdateActiveFormats, 10);
  };

  const removeFormat = () => {
    if (!editorRef.current || disabled) return;
    editorRef.current.focus();
    execCommand("removeFormat");
    execCommand("formatBlock", "<p>");
  };

  const setNormalText = () => {
    if (!editorRef.current || disabled) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && selection.toString()) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      const textNode = document.createTextNode(selectedText);
      range.deleteContents();
      range.insertNode(textNode);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(textNode);
      selection.addRange(newRange);
    } else {
      execCommand("removeFormat");
      execCommand("formatBlock", "<p>");
    }
    handleInput();
    setTimeout(queueUpdateActiveFormats, 10);
  };

  const setParagraph = () => {
    if (!editorRef.current || disabled) return;
    editorRef.current.focus();
    execCommand("formatBlock", "<p>");
    handleInput();
    setTimeout(queueUpdateActiveFormats, 10);
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      const alt = prompt("Enter alt text (optional):") || "";
      const img = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; display:block;" />`;
      execCommand("insertHTML", img);
    }
  };

  const insertButton = () => {
    const text = prompt("Enter button text:");
    const url = prompt("Enter button URL (optional):");
    if (text) {
      const button = url
        ? `<a href="${url}" class="inline-block px-4 py-2 rounded-lg font-medium no-underline button-like" target="_blank" rel="noopener noreferrer">${text}</a>`
        : `<button class="px-4 py-2 rounded-lg font-medium button-like">${text}</button>`;
      execCommand("insertHTML", button);
    }
  };

  const insertCode = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";
    if (selectedText) {
      const codeBlock = document.createElement("pre");
      codeBlock.style.cssText =
        "background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 8px; overflow-x: auto; font-family: monospace;";
      const codeEl = document.createElement("code");
      codeEl.textContent = selectedText;
      codeBlock.appendChild(codeEl);
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(codeBlock);
      handleInput();
    } else {
      execCommand("formatBlock", "<pre>");
    }
  };

  const setAlignment = (align) => {
    // map align values to execCommand justify* commands
    if (align === "left") execCommand("justifyLeft");
    else if (align === "center") execCommand("justifyCenter");
    else if (align === "right") execCommand("justifyRight");
    else if (align === "justify") execCommand("justifyFull");
    setTimeout(queueUpdateActiveFormats, 10);
  };

  const insertTable = () => {
    const rows = prompt("Enter number of rows (2-10):", "3");
    const cols = prompt("Enter number of columns (2-10):", "3");

    if (rows && cols && !isNaN(rows) && !isNaN(cols)) {
      const numRows = Math.min(Math.max(parseInt(rows), 2), 10);
      const numCols = Math.min(Math.max(parseInt(cols), 2), 10);

      let tableHTML =
        '<table class="border-collapse border border-gray-300 w-full" role="table">';

      // header
      tableHTML += "<thead><tr>";
      for (let j = 0; j < numCols; j++) {
        tableHTML += `<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">Header ${j + 1}</th>`;
      }
      tableHTML += "</tr></thead>";

      // body
      tableHTML += "<tbody>";
      for (let i = 0; i < numRows - 1; i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < numCols; j++) {
          tableHTML += `<td class="border border-gray-300 px-4 py-2">Cell ${i + 1},${j + 1}</td>`;
        }
        tableHTML += "</tr>";
      }
      tableHTML += "</tbody></table>";

      execCommand("insertHTML", tableHTML);
    }
  };

  // Render -------------------------------------------------------------------
  return (
    <div
      className={`border-2 border-gray-200 rounded-2xl overflow-hidden relative bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-b-2 border-gray-200 p-3 flex flex-wrap items-center gap-2 shadow-sm">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <button
            type="button"
            onClick={() => execCommand("bold")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.bold || isCommandActive("bold")
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
            }`}
            disabled={disabled}
            title="Bold (Ctrl+B)"
          >
            <FaBold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand("italic")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.italic || isCommandActive("italic")
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
            }`}
            disabled={disabled}
            title="Italic (Ctrl+I)"
          >
            <FaItalic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand("underline")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.underline || isCommandActive("underline")
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
            }`}
            disabled={disabled}
            title="Underline (Ctrl+U)"
          >
            <FaUnderline className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand("strikeThrough")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.strikethrough || isCommandActive("strikeThrough")
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
            }`}
            disabled={disabled}
            title="Strikethrough"
          >
            <FaStrikethrough className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-7 bg-gradient-to-b from-gray-300 to-gray-400"></div>

        {/* Headings & Text Format */}
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => insertHeading(1)}
            className={`px-3 py-2 rounded-md transition-all duration-200 font-bold text-xs hover:scale-105 ${
              activeFormats.heading === "h1"
                ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-indigo-50"
            }`}
            disabled={disabled}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertHeading(2)}
            className={`px-3 py-2 rounded-md transition-all duration-200 font-bold text-xs hover:scale-105 ${
              activeFormats.heading === "h2"
                ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-indigo-50"
            }`}
            disabled={disabled}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertHeading(3)}
            className={`px-3 py-2 rounded-md transition-all duration-200 font-bold text-xs hover:scale-105 ${
              activeFormats.heading === "h3"
                ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-indigo-50"
            }`}
            disabled={disabled}
            title="Heading 3"
          >
            H3
          </button>
          <div className="w-px h-5 bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={setParagraph}
            className={`px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 ${
              activeFormats.heading === "p" || !activeFormats.heading
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
            }`}
            disabled={disabled}
            title="Paragraph"
          >
            <FaParagraph className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={setNormalText}
            className="px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            disabled={disabled}
            title="Normal Text (Remove Formatting)"
          >
            <FaFont className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={removeFormat}
            className="px-3 py-2 rounded-md transition-all duration-200 hover:scale-105 text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={disabled}
            title="Clear Formatting"
          >
            <FaEraser className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-7 bg-gradient-to-b from-gray-300 to-gray-400"></div>

        {/* Lists */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <button
            type="button"
            onClick={() => execCommand("insertUnorderedList")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.list === "ul"
                ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-purple-50"
            }`}
            disabled={disabled}
            title="Bullet List"
          >
            <FaListUl className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand("insertOrderedList")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.list === "ol"
                ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-purple-50"
            }`}
            disabled={disabled}
            title="Numbered List"
          >
            <FaListOl className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-7 bg-gradient-to-b from-gray-300 to-gray-400"></div>

        {/* Alignment */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <button
            type="button"
            onClick={() => setAlignment("left")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.align === "left"
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-green-50"
            }`}
            disabled={disabled}
            title="Align Left"
          >
            <FaAlignLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setAlignment("center")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.align === "center"
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-green-50"
            }`}
            disabled={disabled}
            title="Align Center"
          >
            <FaAlignCenter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setAlignment("right")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.align === "right"
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-green-50"
            }`}
            disabled={disabled}
            title="Align Right"
          >
            <FaAlignRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setAlignment("justify")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.align === "justify"
                ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-green-50"
            }`}
            disabled={disabled}
            title="Justify"
          >
            <FaAlignJustify className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-7 bg-gradient-to-b from-gray-300 to-gray-400"></div>

        {/* Media & Elements */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <button
            type="button"
            onClick={insertImage}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.image ? "bg-pink-100 text-pink-700" : "text-gray-600 hover:text-gray-800 hover:bg-pink-50"
            }`}
            disabled={disabled}
            title="Insert Image"
          >
            <FaImage className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={insertLink}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.link ? "bg-pink-100 text-pink-700" : "text-gray-600 hover:text-gray-800 hover:bg-pink-50"
            }`}
            disabled={disabled}
            title="Insert Link"
          >
            <FaLink className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={insertButton}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.button ? "bg-pink-100 text-pink-700" : "text-gray-600 hover:text-gray-800 hover:bg-pink-50"
            }`}
            disabled={disabled}
            title="Insert Button"
          >
            🔘
          </button>

          <button
            type="button"
            onClick={() => execCommand("formatBlock", "<blockquote>")}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.blockquote ? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-md" : "text-gray-600 hover:text-gray-800 hover:bg-yellow-50"
            }`}
            disabled={disabled}
            title="Quote"
          >
            <FaQuoteLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={insertCode}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.codeblock ? "bg-gradient-to-br from-gray-700 to-gray-800 text-white shadow-md" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            }`}
            disabled={disabled}
            title="Code Block"
          >
            <FaCode className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={insertTable}
            className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
              activeFormats.table ? "bg-pink-100 text-pink-700" : "text-gray-600 hover:text-gray-800 hover:bg-pink-50"
            }`}
            disabled={disabled}
            title="Insert Table"
          >
            <FaTable className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-7 bg-gradient-to-b from-gray-300 to-gray-400"></div>

        {/* History */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <button
            type="button"
            onClick={() => execCommand("undo")}
            className="p-2.5 rounded-lg transition-all duration-200 hover:scale-110 text-gray-600 hover:text-gray-800 hover:bg-orange-50"
            disabled={disabled}
            title="Undo (Ctrl+Z)"
          >
            <FaUndo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => execCommand("redo")}
            className="p-2.5 rounded-lg transition-all duration-200 hover:scale-110 text-gray-600 hover:text-gray-800 hover:bg-orange-50"
            disabled={disabled}
            title="Redo (Ctrl+Y)"
          >
            <FaRedo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`min-h-[350px] p-8 text-base text-gray-700 focus:outline-none prose prose-lg max-w-none transition-all duration-300 ${
          isFocused ? "ring-2 ring-blue-400 ring-opacity-40 bg-blue-50/30" : "bg-gradient-to-br from-white to-gray-50"
        } ${disabled ? "bg-gray-50 cursor-not-allowed" : ""}`}
        style={{
          minHeight: "350px",
          lineHeight: "1.8",
          direction: "ltr",
          textAlign: "left",
          whiteSpace: "pre-wrap",
        }}
        suppressContentEditableWarning={true}
      />

      {/* Enhanced Styles */}
      <style jsx global>{`
        [contenteditable="true"] {
          outline: none;
        }
        [contenteditable="true"] h1 {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1.5rem 0 1rem 0;
          color: #111827;
        }
        [contenteditable="true"] h2 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 1.25rem 0 0.75rem 0;
          color: #111827;
        }
        [contenteditable="true"] h3 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.5rem 0;
          color: #111827;
        }
        [contenteditable="true"] p {
          margin: 0.75rem 0;
          line-height: 1.7;
        }
        [contenteditable="true"] ul,
        [contenteditable="true"] ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        [contenteditable="true"] li {
          margin: 0.5rem 0;
        }
        [contenteditable="true"] blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #4b5563;
          background: #f9fafb;
          padding: 1rem 1.5rem;
          border-radius: 8px;
        }
        [contenteditable="true"] pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1.25rem;
          border-radius: 8px;
          overflow-x: auto;
          font-family: "Courier New", monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 1.5rem 0;
        }
        [contenteditable="true"] code {
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: "Courier New", monospace;
          font-size: 0.875em;
        }
        [contenteditable="true"] pre code {
          background: transparent;
          padding: 0;
        }
        [contenteditable="true"] table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5rem 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        [contenteditable="true"] th,
        [contenteditable="true"] td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1rem;
          text-align: left;
        }
        [contenteditable="true"] th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #111827;
        }
        [contenteditable="true"] tr:nth-child(even) {
          background-color: #f9fafb;
        }
        [contenteditable="true"] tr:hover {
          background-color: #f3f4f6;
        }
        [contenteditable="true"] img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
          display: block;
        }
        [contenteditable="true"] a {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.2s;
        }
        [contenteditable="true"] a:hover {
          color: #1d4ed8;
        }

        /* make "button-like" anchors visually consistent */
        [contenteditable="true"] .button-like {
          background: #2563eb;
          color: #ffffff;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          text-decoration: none;
          display: inline-block;
          margin: 0.25rem 0;
        }
        [contenteditable="true"] .button-like:hover {
          opacity: 0.9;
        }
      `}</style>

      {!value && !isFocused && (
        <div className="absolute top-24 left-8 text-gray-400 pointer-events-none text-base italic">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;

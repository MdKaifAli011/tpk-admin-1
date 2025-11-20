"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaSearch,
  FaChevronRight,
  FaBars,
  FaChevronDown,
} from "react-icons/fa";
import { fetchExams, fetchTree, createSlug, findByIdOrSlug } from "../lib/api";
import { logger } from "@/utils/logger";

/* ------------------------------------------------------------------------- */
/* Design-system friendly, fixed, merged Sidebar (UI + advanced logic)        */
/* - Fixed sidebar (always visible on desktop)                                */
/* - Mobile-friendly overlay and toggle                                        */
/* - Y-axis scrolling only (no x-scroll)                                      */
/* - Ellipsis + native tooltip for long names                                  */
/* - Debounced search, cache + request dedupe, auto-open by path               */
/* - Smooth collapsible animations                                             */
/* ------------------------------------------------------------------------- */

// small helper: build node (same as your original)
const buildNode = (item) => ({
  id: item?._id ?? "",
  name: item?.name ?? "",
  order: item?.orderNumber ?? 0,
  slug: item?.slug || (item?.name ? createSlug(item.name) : ""),
});

// Text with ellipsis + native tooltip (Design System compliant)
const TextEllipsis = ({ children, maxW = "max-w-[200px]", className = "" }) => (
  <span
    className={`truncate whitespace-nowrap overflow-hidden block ${maxW} text-sm text-gray-900 ${className}`}
    title={typeof children === "string" ? children : undefined}
  >
    {children}
  </span>
);

// Collapsible component
const Collapsible = ({ isOpen, children, className = "" }) => {
  const ref = useRef(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isOpen) {
      // expand
      setMaxHeight(`${el.scrollHeight}px`);
      const t = setTimeout(() => setMaxHeight("none"), 260);
      return () => clearTimeout(t);
    } else {
      // collapse
      if (el.scrollHeight) {
        setMaxHeight(`${el.scrollHeight}px`);
        requestAnimationFrame(() => setMaxHeight("0px"));
      } else {
        setMaxHeight("0px");
      }
    }
  }, [isOpen, children]);

  const style =
    maxHeight === "none"
      ? {
          overflowY: "visible",
          transition: "max-height 240ms cubic-bezier(.2,.9,.2,1)",
        }
      : {
          maxHeight,
          overflow: "hidden",
          transition: "max-height 240ms cubic-bezier(.2,.9,.2,1)",
        };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
};

// Accessible searchable ExamDropdown
const ExamDropdown = ({ exams = [], activeExamId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return exams;
    return exams.filter((e) => e.name.toLowerCase().includes(q));
  }, [exams, filter]);

  // Reset filter and highlight when dropdown closes
  useEffect(() => {
    if (!open) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setFilter("");
        setHighlightIndex(-1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const onDoc = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
      scrollToHighlight();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      scrollToHighlight();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[highlightIndex] || filtered[0];
      if (item) onSelect(item);
      setOpen(false);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const scrollToHighlight = () => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[highlightIndex];
    if (item) item.scrollIntoView({ block: "nearest" });
  };

  const activeExam = exams.find((e) => e._id === activeExamId) || null;

  return (
    <div className="relative" ref={triggerRef}>
      <button
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-gray-900 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          <span className="text-xs font-medium text-gray-500 shrink-0">
            Exam
          </span>
          <TextEllipsis
            maxW="max-w-[180px]"
            className="font-semibold text-gray-900"
          >
            {activeExam ? activeExam.name : "Select exam"}
          </TextEllipsis>
        </div>
        <FaChevronDown
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? "-rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`absolute left-0 right-0 mt-2 z-40 ${
          open ? "block" : "hidden"
        }`}
      >
        <div className="rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Filter exams..."
                className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>
          </div>

          <ul
            ref={listRef}
            role="listbox"
            aria-activedescendant={filtered[highlightIndex]?._id}
            tabIndex={-1}
            className="max-h-44 overflow-y-auto overflow-x-hidden divide-y divide-gray-100"
          >
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">
                No exams found
              </li>
            )}

            {filtered.map((exam, idx) => {
              const isActive = exam._id === activeExamId;
              const highlighted = idx === highlightIndex;
              return (
                <li key={exam._id}>
                  <button
                    id={exam._id}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onClick={() => {
                      onSelect(exam);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                      highlighted ? "bg-blue-50" : "hover:bg-gray-50"
                    } ${
                      isActive
                        ? "font-semibold text-blue-600 bg-blue-50"
                        : "text-gray-700 font-normal"
                    }`}
                  >
                    <TextEllipsis
                      maxW="max-w-[200px]"
                      className={isActive ? "text-blue-600" : "text-gray-900"}
                    >
                      {exam.name}
                    </TextEllipsis>
                    {isActive && (
                      <span className="text-xs font-medium text-blue-600 shrink-0 ml-2">
                        Active
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------------- */
/* MAIN SIDEBAR                                                                */
/* ------------------------------------------------------------------------- */
export default function Sidebar({ isOpen = true, onClose }) {
  const router = useRouter();
  const pathname = usePathname();

  // --- Data states ---
  const [exams, setExams] = useState([]);
  const [activeExamId, setActiveExamId] = useState(null);
  const [tree, setTree] = useState([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // internal caches & dedupe
  const hasLoadedExamsRef = useRef(false);
  const treeCacheRef = useRef(new Map());
  const treeLoadingRef = useRef(new Set());
  const pendingApiRequestsRef = useRef(new Map());

  // ui state
  const [sidebarOpen, setSidebarOpen] = useState(isOpen);
  const [openSubjectId, setOpenSubjectId] = useState(null);
  const [openUnitId, setOpenUnitId] = useState(null);
  const [openChapterId, setOpenChapterId] = useState(null);

  // refs for auto-scrolling active items
  const sidebarBodyRef = useRef(null);
  const activeItemRef = useRef(null);

  const MAX_TREE_CACHE_SIZE = 12;

  // sync prop
  useEffect(() => setSidebarOpen(isOpen), [isOpen]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // lru eviction
  useEffect(() => {
    if (treeCacheRef.current.size > MAX_TREE_CACHE_SIZE) {
      const firstKey = treeCacheRef.current.keys().next().value;
      treeCacheRef.current.delete(firstKey);
    }
  }, [tree]);

  // path segments for auto open
  const pathSegments = useMemo(
    () => (pathname ? pathname.split("/").filter(Boolean) : []),
    [pathname]
  );
  const examSlugFromPath = pathSegments[0] || "";
  const subjectSlugFromPath = pathSegments[1] || "";
  const unitSlugFromPath = pathSegments[2] || "";
  const chapterSlugFromPath = pathSegments[3] || "";
  const topicSlugFromPath = pathSegments[4] || "";

  const activeExam = useMemo(
    () => exams.find((e) => e._id === activeExamId) || null,
    [exams, activeExamId]
  );
  const activeExamSlug = activeExam
    ? activeExam.slug || createSlug(activeExam.name)
    : "";

  // close on mobile helper
  const closeOnMobile = useCallback(() => {
    if (onClose && typeof window !== "undefined" && window.innerWidth < 1024)
      onClose();
  }, [onClose]);

  const navigateTo = useCallback(
    (segments = []) => {
      if (!activeExamSlug) return;
      const path = `/${[activeExamSlug, ...segments]
        .filter(Boolean)
        .join("/")}`;
      router.push(path);
      closeOnMobile();
    },
    [activeExamSlug, router, closeOnMobile]
  );

  /* -------------------- API: exams -------------------- */
  const loadExams = useCallback(async (force = false) => {
    if (!force && hasLoadedExamsRef.current) return;
    hasLoadedExamsRef.current = true;
    try {
      setError("");
      const res = await fetchExams({ limit: 200 });
      setExams(res || []);
    } catch (err) {
      logger.error("loadExams error", err);
      setError("Unable to load exams.");
      hasLoadedExamsRef.current = false;
    }
  }, []);

  /* -------------------- transform tree -------------------- */
  const transformTreeData = useCallback((treeData) => {
    if (!treeData || treeData.length === 0) return [];
    const exam = treeData[0];
    if (!exam || !exam.subjects) return [];

    return exam.subjects.map((subject) => ({
      ...buildNode(subject),
      units: (subject.units || []).map((unit) => ({
        ...buildNode(unit),
        chapters: (unit.chapters || []).map((chapter) => ({
          ...buildNode(chapter),
          topics: (chapter.topics || []).map((topic) => buildNode(topic)),
        })),
      })),
    }));
  }, []);

  /* -------------------- load tree with dedupe & cache -------------------- */
  const loadTree = useCallback(
    async (examId) => {
      if (!examId) {
        setTree([]);
        setTreeLoading(false);
        setError("");
        return;
      }

      if (treeCacheRef.current.has(examId)) {
        setTree(treeCacheRef.current.get(examId));
        setTreeLoading(false);
        setError("");
        return;
      }

      if (treeLoadingRef.current.has(examId)) return;

      treeLoadingRef.current.add(examId);
      setTreeLoading(true);
      setError("");

      try {
        const key = `tree-${examId}`;
        if (pendingApiRequestsRef.current.has(key)) {
          const existing = pendingApiRequestsRef.current.get(key);
          try {
            await existing;
          } catch {}
          if (treeCacheRef.current.has(examId)) {
            setTree(treeCacheRef.current.get(examId));
            setTreeLoading(false);
            setError("");
            treeLoadingRef.current.delete(examId);
            return;
          }
        }

        const promise = fetchTree({ examId, status: "active" });
        pendingApiRequestsRef.current.set(key, promise);

        const treeData = await promise;
        pendingApiRequestsRef.current.delete(key);

        if (!treeData || treeData.length === 0) {
          setError("No navigation data available for this exam.");
          setTree([]);
          setTreeLoading(false);
          treeLoadingRef.current.delete(examId);
          return;
        }

        const transformed = transformTreeData(treeData);
        if (transformed.length === 0) {
          setError("No subjects found for this exam.");
          setTree([]);
        } else {
          treeCacheRef.current.set(examId, transformed);
          setTree(transformed);
          setError("");
        }
      } catch (err) {
        logger.error("loadTree error", {
          message: err?.message,
          stack: err?.stack,
          examId,
        });
        pendingApiRequestsRef.current.delete(`tree-${examId}`);
        setError("Unable to load sidebar content.");
        setTree([]);
      } finally {
        setTreeLoading(false);
        treeLoadingRef.current.delete(examId);
      }
    },
    [transformTreeData]
  );

  /* -------------------- lifecycle -------------------- */
  useEffect(() => {
    loadExams();
    const interval = setInterval(() => loadExams(true), 2 * 60 * 1000);
    const onFocus = () => loadExams(true);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadExams]);

  // set active exam id from path or default
  useEffect(() => {
    if (!exams.length) return;
    const matched = findByIdOrSlug(exams, examSlugFromPath) || exams[0] || null;
    if (matched?._id && matched._id !== activeExamId)
      setActiveExamId(matched._id);
    else if (!matched && activeExamId && examSlugFromPath)
      setActiveExamId(null);
  }, [exams, examSlugFromPath, activeExamId]);

  // load tree when activeExamId changes
  useEffect(() => {
    if (!activeExamId) {
      setTree([]);
      setTreeLoading(false);
      setError("");
      setOpenSubjectId(null);
      setOpenUnitId(null);
      setOpenChapterId(null);
      return;
    }

    setOpenSubjectId(null);
    setOpenUnitId(null);
    setOpenChapterId(null);

    loadTree(activeExamId);
  }, [activeExamId, loadTree]);

  // debounced query filtered tree
  const normalizedQuery = debouncedQuery.trim().toLowerCase();
  const filteredTree = useMemo(() => {
    if (!normalizedQuery) return tree;
    const match = (t) => t && t.toLowerCase().includes(normalizedQuery);

    return tree
      .map((subject) => {
        const subjectMatches = match(subject.name);
        const units = (subject.units || [])
          .map((u) => {
            const um = subjectMatches || match(u.name);
            const chapters = (u.chapters || [])
              .map((c) => {
                const cm = um || match(c.name);
                const topics = (c.topics || []).filter((t) =>
                  cm ? true : match(t.name)
                );
                if (cm || topics.length) return { ...c, topics };
                return null;
              })
              .filter(Boolean);
            if (um || chapters.length) return { ...u, chapters };
            return null;
          })
          .filter(Boolean);
        if (subjectMatches || units.length) return { ...subject, units };
        return null;
      })
      .filter(Boolean);
  }, [tree, normalizedQuery]);

  // auto-open based on path
  useEffect(() => {
    if (!filteredTree.length || normalizedQuery) return;

    if (subjectSlugFromPath) {
      filteredTree.forEach((subject) => {
        if (subject.slug === subjectSlugFromPath) {
          setOpenSubjectId(subject.id);

          if (unitSlugFromPath) {
            subject.units.forEach((unit) => {
              if (unit.slug === unitSlugFromPath) {
                setOpenUnitId(unit.id);

                if (chapterSlugFromPath) {
                  unit.chapters.forEach((chapter) => {
                    if (chapter.slug === chapterSlugFromPath)
                      setOpenChapterId(chapter.id);
                  });
                } else if (topicSlugFromPath) {
                  unit.chapters.forEach((chapter) => {
                    const topicExists = chapter.topics.some(
                      (t) => t.slug === topicSlugFromPath
                    );
                    if (topicExists) setOpenChapterId(chapter.id);
                  });
                }
              }
            });
          }
        }
      });
    } else {
      const first = filteredTree[0];
      if (first) {
        setOpenSubjectId(first.id);
        if (first.units.length > 0) {
          const fu = first.units[0];
          setOpenUnitId(fu.id);
          if (fu.chapters.length > 0) setOpenChapterId(fu.chapters[0].id);
        }
      }
    }
  }, [
    filteredTree,
    subjectSlugFromPath,
    unitSlugFromPath,
    chapterSlugFromPath,
    topicSlugFromPath,
    normalizedQuery,
  ]);

  // pick list to render
  const listToRender = filteredTree.length ? filteredTree : tree;

  // auto-scroll active item into view when sidebar mounts or path changes
  useEffect(() => {
    if (!activeItemRef.current || !sidebarBodyRef.current || normalizedQuery)
      return;

    // Small delay to ensure DOM is updated after collapsible animations
    const timeoutId = setTimeout(() => {
      if (activeItemRef.current && sidebarBodyRef.current) {
        activeItemRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    filteredTree,
    tree,
    openSubjectId,
    openUnitId,
    openChapterId,
    subjectSlugFromPath,
    unitSlugFromPath,
    chapterSlugFromPath,
    topicSlugFromPath,
    normalizedQuery,
  ]);

  // render helpers
  const renderLoading = () => (
    <div className="px-4 py-6 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-4 rounded-lg bg-gray-200 animate-pulse" />
      ))}
    </div>
  );

  const renderEmpty = () => (
    <div className="px-4 py-6 text-sm text-gray-600 text-center">
      {activeExam
        ? "No navigation data available for this exam."
        : "Select an exam to view its content."}
    </div>
  );

  // accordion toggles (ensure single open where appropriate)
  const toggleSubject = useCallback((subjectId) => {
    setOpenSubjectId((prev) => (prev === subjectId ? null : subjectId));
    setOpenUnitId(null);
    setOpenChapterId(null);
  }, []);

  const toggleUnit = useCallback((unitId, subjectId) => {
    setOpenSubjectId(subjectId);
    setOpenUnitId((prev) => (prev === unitId ? null : unitId));
    setOpenChapterId(null);
  }, []);

  const toggleChapter = useCallback((chapterId, subjectId, unitId) => {
    setOpenSubjectId(subjectId);
    setOpenUnitId(unitId);
    setOpenChapterId((prev) => (prev === chapterId ? null : chapterId));
  }, []);

  // mobile handlers
  const openSidebarMobile = useCallback(() => setSidebarOpen(true), []);
  const closeSidebarMobile = useCallback(() => {
    setSidebarOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  return (
    <>
      {/* Mobile open button */}
      {!sidebarOpen && (
        <button
          className="fixed top-[74px] md:top-[106px] left-4 z-50 lg:hidden bg-blue-600 text-white p-2.5 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          onClick={openSidebarMobile}
          aria-label="Open sidebar"
        >
          <FaBars size={18} />
        </button>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={closeSidebarMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } lg:flex lg:flex-col top-[70px] md:top-[102px] h-[calc(100vh-70px)] md:h-[calc(100vh-102px)]`}
        role="complementary"
        aria-label="Exam navigation sidebar"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-4 py-4 shrink-0">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Navigation
              </h2>
              {onClose && (
                <button
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors lg:hidden"
                  onClick={closeSidebarMobile}
                >
                  Close
                </button>
              )}
            </div>

            {/* Exam dropdown */}
            <div className="mb-4">
              <ExamDropdown
                exams={exams}
                activeExamId={activeExamId}
                onSelect={(exam) => {
                  setActiveExamId(exam._id);
                  const slug = exam.slug || createSlug(exam.name);
                  router.push(`/${slug}`);
                }}
              />
            </div>

            {/* Search */}
            {tree.length > 0 && (
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Search
                </label>
                <div className="relative">
                  <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    aria-label="Search subjects, units, chapters, and topics"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Body — Y-scroll only */}
          <div
            ref={sidebarBodyRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-4 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            {treeLoading && renderLoading()}

            {!treeLoading && error && (
              <div className="px-4 py-6 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            {!treeLoading &&
              !error &&
              listToRender.length === 0 &&
              renderEmpty()}

            {!treeLoading && !error && listToRender.length > 0 && (
              <div className="space-y-2">
                {listToRender.map((subject) => {
                  const isActiveSubject =
                    subject.slug && subject.slug === subjectSlugFromPath;
                  const isOpenSubject = openSubjectId === subject.id;

                  return (
                    <div
                      key={subject.id}
                      className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden"
                      ref={isActiveSubject ? activeItemRef : null}
                    >
                      <div
                        className={`flex items-center justify-between gap-3 px-4 py-3 ${
                          isActiveSubject
                            ? "bg-blue-600"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <button
                          onClick={() => navigateTo([subject.slug])}
                          className={`flex-1 text-left text-sm font-semibold min-w-0 ${
                            isActiveSubject ? "text-white" : "text-gray-900"
                          }`}
                        >
                          <TextEllipsis
                            maxW="max-w-[200px]"
                            className={isActiveSubject ? "text-white" : ""}
                          >
                            {subject.name}
                          </TextEllipsis>
                        </button>

                        {subject.units.length > 0 && (
                          <button
                            onClick={() => toggleSubject(subject.id)}
                            aria-label={
                              isOpenSubject
                                ? "Collapse subject"
                                : "Expand subject"
                            }
                            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                              isActiveSubject
                                ? "text-white hover:bg-blue-700"
                                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <FaChevronRight
                              className={`h-3 w-3 transition-transform duration-200 ${
                                isOpenSubject ? "rotate-90" : "rotate-0"
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      <Collapsible isOpen={isOpenSubject}>
                        <div
                          id={`subject-${subject.id}`}
                          className="border-t border-gray-200 bg-gray-50 px-4 py-2 space-y-1"
                        >
                          {(subject.units || []).map((unit) => {
                            const isActiveUnit =
                              isActiveSubject && unit.slug === unitSlugFromPath;
                            const isOpenUnit = openUnitId === unit.id;

                            return (
                              <div
                                key={unit.id}
                                className="rounded-lg transition-colors"
                                ref={isActiveUnit ? activeItemRef : null}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    onClick={() =>
                                      navigateTo([subject.slug, unit.slug])
                                    }
                                    className={`flex-1 text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors min-w-0 ${
                                      isActiveUnit
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                  >
                                    <TextEllipsis
                                      maxW="max-w-[180px]"
                                      className={
                                        isActiveUnit ? "text-blue-700" : ""
                                      }
                                    >
                                      {unit.name}
                                    </TextEllipsis>
                                  </button>

                                  {unit.chapters.length > 0 && (
                                    <button
                                      onClick={() =>
                                        toggleUnit(unit.id, subject.id)
                                      }
                                      aria-label={
                                        isOpenUnit
                                          ? "Collapse unit"
                                          : "Expand unit"
                                      }
                                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                                        isActiveUnit
                                          ? "text-blue-600 hover:bg-blue-100"
                                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                      }`}
                                    >
                                      <FaChevronRight
                                        className={`h-3 w-3 transition-transform duration-200 ${
                                          isOpenUnit ? "rotate-90" : "rotate-0"
                                        }`}
                                      />
                                    </button>
                                  )}
                                </div>

                                <Collapsible isOpen={isOpenUnit}>
                                  <div
                                    id={`unit-${unit.id}`}
                                    className="mt-1 ml-3 space-y-1 border-l-2 border-gray-200 pl-3"
                                  >
                                    {(unit.chapters || []).map((chapter) => {
                                      const isActiveChapter =
                                        isActiveUnit &&
                                        chapter.slug === chapterSlugFromPath;
                                      const isOpenChapter =
                                        openChapterId === chapter.id;

                                      return (
                                        <div
                                          key={chapter.id}
                                          ref={
                                            isActiveChapter
                                              ? activeItemRef
                                              : null
                                          }
                                          className="space-y-1"
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <button
                                              onClick={() =>
                                                navigateTo([
                                                  subject.slug,
                                                  unit.slug,
                                                  chapter.slug,
                                                ])
                                              }
                                              className={`flex-1 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors min-w-0 ${
                                                isActiveChapter
                                                  ? "bg-blue-50 text-blue-700"
                                                  : "text-gray-600 hover:bg-gray-100"
                                              }`}
                                            >
                                              <TextEllipsis
                                                maxW="max-w-[160px]"
                                                className={
                                                  isActiveChapter
                                                    ? "text-blue-700"
                                                    : ""
                                                }
                                              >
                                                {chapter.name}
                                              </TextEllipsis>
                                            </button>

                                            {chapter.topics.length > 0 && (
                                              <button
                                                onClick={() =>
                                                  toggleChapter(
                                                    chapter.id,
                                                    subject.id,
                                                    unit.id
                                                  )
                                                }
                                                aria-label={
                                                  isOpenChapter
                                                    ? "Collapse chapter"
                                                    : "Expand chapter"
                                                }
                                                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                                                  isActiveChapter
                                                    ? "text-blue-600 hover:bg-blue-100"
                                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                                }`}
                                              >
                                                <FaChevronRight
                                                  className={`h-3 w-3 transition-transform duration-200 ${
                                                    isOpenChapter
                                                      ? "rotate-90"
                                                      : "rotate-0"
                                                  }`}
                                                />
                                              </button>
                                            )}
                                          </div>

                                          <Collapsible isOpen={isOpenChapter}>
                                            <div
                                              id={`chapter-${chapter.id}`}
                                              className="mt-1 ml-3 space-y-0.5 border-l-2 border-gray-200 pl-3"
                                            >
                                              {(chapter.topics || []).map(
                                                (topic) => {
                                                  const isTopicActive =
                                                    isActiveChapter &&
                                                    topic.slug ===
                                                      topicSlugFromPath;
                                                  return (
                                                    <div
                                                      key={topic.id}
                                                      ref={
                                                        isTopicActive
                                                          ? activeItemRef
                                                          : null
                                                      }
                                                    >
                                                      <button
                                                        onClick={() =>
                                                          navigateTo([
                                                            subject.slug,
                                                            unit.slug,
                                                            chapter.slug,
                                                            topic.slug,
                                                          ])
                                                        }
                                                        className={`w-full rounded-lg px-3 py-1.5 text-left text-xs font-normal transition-colors ${
                                                          isTopicActive
                                                            ? "bg-blue-600 text-white"
                                                            : "text-gray-600 hover:bg-gray-100"
                                                        }`}
                                                      >
                                                        <TextEllipsis
                                                          maxW="max-w-[140px]"
                                                          className={
                                                            isTopicActive
                                                              ? "text-white"
                                                              : ""
                                                          }
                                                        >
                                                          {topic.name}
                                                        </TextEllipsis>
                                                      </button>
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </Collapsible>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </Collapsible>
                              </div>
                            );
                          })}
                        </div>
                      </Collapsible>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

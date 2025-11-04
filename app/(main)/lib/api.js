import api from "@/lib/api";

// Fetch all active exams
export const fetchExams = async () => {
  try {
    const response = await api.get("/exam");
    if (response.data.success) {
      // Filter only active exams
      return response.data.data.filter((exam) => exam.status === "active");
    }
    return [];
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
};

// Fetch exam by ID or name
export const fetchExamById = async (examId) => {
  try {
    // Try by ID first
    const response = await api.get(`/exam/${examId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    // If not found by ID, try fetching all and finding by name
    try {
      const exams = await fetchExams();
      const examIdLower = examId?.toLowerCase();
      return (
        exams.find(
          (exam) =>
            exam._id === examId ||
            exam.name?.toLowerCase() === examIdLower ||
            exam.name?.toLowerCase().replace(/\s+/g, "-") === examIdLower
        ) || null
      );
    } catch (err) {
      console.error("Error fetching exam:", err);
      return null;
    }
  }
};

// Fetch subjects by exam ID
export const fetchSubjectsByExam = async (examId) => {
  try {
    const response = await api.get("/subject");
    if (response.data.success) {
      const allSubjects = response.data.data;
      // Filter by examId and active status
      const filteredSubjects = allSubjects.filter(
        (subject) =>
          (subject.examId?._id === examId ||
            subject.examId === examId ||
            subject.examId?.name?.toLowerCase() === examId?.toLowerCase()) &&
          subject.status === "active"
      );
      // Sort by orderNumber
      return filteredSubjects.sort(
        (a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
};

// Fetch subject by ID
export const fetchSubjectById = async (subjectId) => {
  try {
    const response = await api.get(`/subject/${subjectId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching subject:", error);
    return null;
  }
};

// Fetch units by subject ID and exam ID
export const fetchUnitsBySubject = async (subjectId, examId) => {
  try {
    const response = await api.get(
      `/unit?subjectId=${subjectId}${examId ? `&examId=${examId}` : ""}`
    );
    if (response.data.success) {
      // Filter only active units
      const filteredUnits = response.data.data.filter(
        (unit) => unit.status === "active"
      );
      // Sort by orderNumber
      return filteredUnits.sort(
        (a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching units:", error);
    return [];
  }
};

// Fetch chapters by unit ID
export const fetchChaptersByUnit = async (unitId) => {
  try {
    const response = await api.get(`/chapter?unitId=${unitId}`);
    if (response.data.success) {
      // Filter only active chapters
      const filteredChapters = response.data.data.filter(
        (chapter) => chapter.status === "active"
      );
      // Sort by orderNumber
      return filteredChapters.sort(
        (a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }
};

// Fetch chapters by subject ID
export const fetchChaptersBySubject = async (subjectId, examId) => {
  try {
    let url = `/chapter?subjectId=${subjectId}`;
    if (examId) {
      url += `&examId=${examId}`;
    }
    const response = await api.get(url);
    if (response.data.success) {
      // Filter only active chapters
      return response.data.data.filter(
        (chapter) => chapter.status === "active"
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching chapters by subject:", error);
    return [];
  }
};

// Fetch all chapters for a subject (through units)
export const fetchAllChaptersForSubject = async (subjectId, examId) => {
  try {
    // First fetch units for this subject
    const units = await fetchUnitsBySubject(subjectId, examId);

    // Then fetch chapters for each unit
    const allChapters = [];
    for (const unit of units) {
      const chapters = await fetchChaptersByUnit(unit._id);
      allChapters.push(...chapters);
    }

    // Sort by orderNumber
    return allChapters.sort(
      (a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)
    );
  } catch (error) {
    console.error("Error fetching all chapters for subject:", error);
    return [];
  }
};

// Fetch unit by ID or name
export const fetchUnitById = async (unitId) => {
  try {
    // Try by ID first
    const response = await api.get(`/unit/${unitId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    // If not found by ID, try fetching all and finding by name
    try {
      const units = await fetchUnitsBySubject(null, null);
      const unitIdLower = unitId?.toLowerCase();
      return (
        units.find(
          (unit) =>
            unit._id === unitId ||
            unit.name?.toLowerCase() === unitIdLower ||
            unit.name?.toLowerCase().replace(/\s+/g, "-") === unitIdLower
        ) || null
      );
    } catch (err) {
      console.error("Error fetching unit:", err);
      return null;
    }
  }
};

// Fetch chapters by unit ID (for direct access)
export const fetchChapterById = async (chapterId) => {
  try {
    const response = await api.get(`/chapter/${chapterId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return null;
  }
};

// Fetch topics by chapter ID
export const fetchTopicsByChapter = async (chapterId) => {
  try {
    const response = await api.get(`/topic?chapterId=${chapterId}`);
    if (response.data.success) {
      // Filter only active topics
      const filteredTopics = response.data.data.filter(
        (topic) => topic.status === "active"
      );
      // Sort by orderNumber
      return filteredTopics.sort(
        (a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching topics:", error);
    return [];
  }
};

// Fetch topic by ID
export const fetchTopicById = async (topicId) => {
  try {
    const response = await api.get(`/topic/${topicId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching topic:", error);
    return null;
  }
};

// Fetch subtopics by topic ID
export const fetchSubTopicsByTopic = async (topicId) => {
  try {
    const response = await api.get(`/subtopic?topicId=${topicId}`);
    if (response.data.success) {
      // Filter only active subtopics
      const filteredSubTopics = response.data.data.filter(
        (sub) => sub.status === "active"
      );
      // Sort by orderNumber
      return filteredSubTopics.sort(
        (a, b) => (a.orderNumber || 0) - (b.orderNumber || 0)
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching subtopics:", error);
    return [];
  }
};

// Fetch subtopic by ID
export const fetchSubTopicById = async (subTopicId) => {
  try {
    const response = await api.get(`/subtopic/${subTopicId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching subtopic:", error);
    return null;
  }
};

// Helper function to create slug from name
export const createSlug = (name) => {
  return (
    name
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || ""
  );
};

// Helper function to find by slug
export const findByIdOrSlug = (items, idOrSlug) => {
  if (!items || !idOrSlug) return null;
  const slug = createSlug(idOrSlug);
  return (
    items.find(
      (item) =>
        item._id === idOrSlug ||
        createSlug(item.name) === slug ||
        item.name?.toLowerCase() === idOrSlug.toLowerCase()
    ) || null
  );
};

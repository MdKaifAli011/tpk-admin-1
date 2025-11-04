import { FaCog, FaSyringe, FaUniversity, FaLightbulb } from "react-icons/fa";

export const examCategories = [
  {
    id: "jee",
    name: "JEE",
    status: "Active",
    bgColor: "bg-yellow-400",
    gradient: "from-yellow-400 to-yellow-500",
    imageIcon: <FaCog className="text-4xl md:text-5xl text-gray-700" />,
    title: "JEE Exam Preparation",
    services: [
      "JEE Prep Courses",
      "NRIs Admission & Help",
      "NRI Quota Application",
      "JEE Prep Resources",
      "JEE Analysis Session",
    ],
    link: "/jee",
  },
  {
    id: "neet",
    name: "NEET",
    status: "Active",
    bgColor: "bg-purple-300",
    gradient: "from-purple-300 to-purple-400",
    imageIcon: <FaSyringe className="text-4xl md:text-5xl text-white" />,
    title: "NEET Exam Preparation",
    services: [
      "NEET Prep Courses",
      "NRIs Admission & Help",
      "NRI Quota Application",
      "NEET Prep Resources",
      "NEET Analysis Session",
    ],
    link: "/neet",
  },
  {
    id: "sat",
    name: "SAT",
    status: "Active",
    bgColor: "bg-pink-200",
    gradient: "from-pink-200 to-pink-300",
    imageIcon: <FaUniversity className="text-4xl md:text-5xl text-gray-700" />,
    title: "SAT Exam Preparation",
    services: [
      "SAT Prep Courses",
      "College Shortlisting",
      "Scholarship Help",
      "Rush Reports",
      "SAT Analysis Session",
    ],
    link: "/sat",
  },
  {
    id: "ib",
    name: "IB",
    status: "Active",
    bgColor: "bg-blue-300",
    gradient: "from-blue-300 to-blue-400",
    imageIcon: <FaLightbulb className="text-4xl md:text-5xl text-yellow-400" />,
    title: "IB Exam Preparation",
    services: [
      "IB Prep Courses",
      "MYP & DP Courses",
      "Exam Compatibility",
      "IB Prep Resources",
      "IB Analysis Session",
    ],
    link: "/ib",
  },
];

export const getExamById = (examId) => {
  return examCategories.find(
    (exam) => exam.id.toLowerCase() === examId.toLowerCase()
  );
};

// Get all active exams
export const getActiveExams = () => {
  return examCategories.filter(
    (exam) => exam.status?.toLowerCase() === "active"
  );
};

// Get exam names for active exams
export const getActiveExamNames = () => {
  return getActiveExams().map((exam) => exam.name);
};

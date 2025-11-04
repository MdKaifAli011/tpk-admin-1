// Dynamic exam subjects, categories (chapters), and topics data
export const examSubjectsData = {
  NEET: {
    biology: {
      name: "BIOLOGY",
      categories: {
        diversity: {
          name: "Diversity in Living World",
          topics: [
            "The Living World",
            "Biological Classification",
            "Plant Kingdom",
            "Animal Kingdom",
          ],
        },
        structural: {
          name: "Structural Organisation",
          topics: [
            "Morphology of Flowering Plants",
            "Anatomy of Flowering Plants",
          ],
        },
        cell: {
          name: "Cell Structure and Function",
          topics: [
            "Cell: The Unit of Life",
            "Biomolecules",
            "Cell Cycle and Cell Division",
          ],
        },
        plantPhysiology: {
          name: "Plant Physiology",
          topics: [
            "Transport in Plants",
            "Mineral Nutrition",
            "Photosynthesis",
            "Respiration in Plants",
            "Plant Growth and Development",
          ],
        },
        humanPhysiology: {
          name: "Human Physiology",
          topics: [
            "Digestion and Absorption",
            "Breathing and Exchange of Gases",
            "Body Fluids and Circulation",
            "Excretory Products",
            "Locomotion and Movement",
            "Neural Control and Coordination",
            "Chemical Coordination and Integration",
          ],
        },
        reproduction: {
          name: "Reproduction",
          topics: [
            "Reproduction in Organisms",
            "Sexual Reproduction in Flowering Plants",
            "Human Reproduction",
            "Reproductive Health",
          ],
        },
        genetics: {
          name: "Genetics and Evolution",
          topics: [
            "Principles of Inheritance",
            "Molecular Basis of Inheritance",
            "Evolution",
          ],
        },
        biotechnology: {
          name: "Biology and Human Welfare",
          topics: [
            "Human Health and Disease",
            "Strategies for Enhancement in Food Production",
            "Microbes in Human Welfare",
          ],
        },
        ecology: {
          name: "Biotechnology and Its Applications",
          topics: [
            "Organisms and Populations",
            "Ecosystem",
            "Biodiversity and Conservation",
            "Environmental Issues",
          ],
        },
      },
    },
    physics: {
      name: "PHYSICS",
      categories: {
        mechanics: {
          name: "Mechanics",
          topics: [
            "Units and Measurements",
            "Motion in a Straight Line",
            "Motion in a Plane",
            "Laws of Motion",
            "Work, Energy and Power",
          ],
        },
        thermodynamics: {
          name: "Thermodynamics",
          topics: [
            "Thermodynamics",
            "Kinetic Theory",
            "Oscillations and Waves",
          ],
        },
      },
    },
    chemistry: {
      name: "CHEMISTRY",
      categories: {
        physical: {
          name: "Physical Chemistry",
          topics: [
            "Some Basic Concepts of Chemistry",
            "Structure of Atom",
            "Classification of Elements",
          ],
        },
        organic: {
          name: "Organic Chemistry",
          topics: [
            "Organic Chemistry - Basic Principles",
            "Hydrocarbons",
            "Environmental Chemistry",
          ],
        },
      },
    },
  },
  JEE: {
    physics: {
      name: "PHYSICS",
      categories: {
        mechanics: {
          name: "Mechanics",
          topics: [
            "Kinematics",
            "Laws of Motion",
            "Work, Energy and Power",
            "Rotational Motion",
            "Gravitation",
          ],
        },
        thermodynamics: {
          name: "Thermodynamics & Waves",
          topics: ["Thermodynamics", "Kinetic Theory", "Oscillations", "Waves"],
        },
        electrodynamics: {
          name: "Electrodynamics",
          topics: [
            "Electrostatics",
            "Current Electricity",
            "Magnetic Effects",
            "Electromagnetic Induction",
          ],
        },
      },
    },
    chemistry: {
      name: "CHEMISTRY",
      categories: {
        physical: {
          name: "Physical Chemistry",
          topics: [
            "Basic Concepts",
            "Atomic Structure",
            "Chemical Bonding",
            "Thermodynamics",
            "Equilibrium",
          ],
        },
        organic: {
          name: "Organic Chemistry",
          topics: [
            "Basic Principles",
            "Hydrocarbons",
            "Organic Compounds",
            "Biomolecules",
          ],
        },
        inorganic: {
          name: "Inorganic Chemistry",
          topics: [
            "Periodic Table",
            "s-Block Elements",
            "p-Block Elements",
            "d and f Block Elements",
          ],
        },
      },
    },
    mathematics: {
      name: "MATHEMATICS",
      categories: {
        algebra: {
          name: "Algebra",
          topics: [
            "Complex Numbers",
            "Quadratic Equations",
            "Sequences and Series",
            "Permutations and Combinations",
          ],
        },
        calculus: {
          name: "Calculus",
          topics: [
            "Limits",
            "Continuity",
            "Differentiation",
            "Integration",
            "Differential Equations",
          ],
        },
      },
    },
  },
  SAT: {
    math: {
      name: "MATH",
      categories: {
        algebra: {
          name: "Algebra",
          topics: [
            "Linear Equations",
            "Quadratic Equations",
            "Systems of Equations",
            "Inequalities",
          ],
        },
        advanced: {
          name: "Advanced Math",
          topics: [
            "Polynomials",
            "Radical and Rational Expressions",
            "Exponential Functions",
          ],
        },
        geometry: {
          name: "Geometry & Trigonometry",
          topics: ["Area and Volume", "Triangles", "Circles", "Trigonometry"],
        },
      },
    },
    english: {
      name: "ENGLISH",
      categories: {
        reading: {
          name: "Reading & Writing",
          topics: [
            "Reading Comprehension",
            "Grammar and Usage",
            "Vocabulary",
            "Essay Writing",
          ],
        },
      },
    },
  },
  IB: {
    biology: {
      name: "BIOLOGY",
      categories: {
        cells: {
          name: "Cell Biology",
          topics: [
            "Introduction to Cells",
            "Membrane Structure",
            "Metabolism",
            "Cell Respiration",
            "Photosynthesis",
          ],
        },
        molecular: {
          name: "Molecular Biology",
          topics: [
            "DNA Structure",
            "Replication",
            "Transcription and Translation",
            "Cell Division",
          ],
        },
        genetics: {
          name: "Genetics",
          topics: [
            "Mendelian Genetics",
            "Genetic Engineering",
            "Biotechnology",
          ],
        },
      },
    },
    chemistry: {
      name: "CHEMISTRY",
      categories: {
        stoichiometry: {
          name: "Stoichiometry",
          topics: [
            "Stoichiometric Relationships",
            "Atomic Structure",
            "Periodicity",
          ],
        },
        bonding: {
          name: "Chemical Bonding",
          topics: [
            "Ionic Bonding",
            "Covalent Bonding",
            "Intermolecular Forces",
          ],
        },
      },
    },
    physics: {
      name: "PHYSICS",
      categories: {
        mechanics: {
          name: "Mechanics",
          topics: [
            "Measurements and Uncertainties",
            "Mechanics",
            "Thermal Physics",
          ],
        },
        waves: {
          name: "Waves",
          topics: ["Oscillations", "Wave Phenomena", "Electromagnetic Waves"],
        },
      },
    },
  },
};

// Get subjects for a specific exam
export const getSubjectsByExam = (examName) => {
  return examSubjectsData[examName?.toUpperCase()] || examSubjectsData.NEET;
};

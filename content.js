const siteContent = {
  stats: [
    { value: "15+", label: "Years of teaching experience" },
    { value: "25+", label: "Research publications" },
    { value: "7", label: "Patents" }
  ],

  researchInterests: [
    {
      icon: "AI",
      title: "Machine Learning",
      description: "Applied machine learning, predictive modelling, data analytics and explainable artificial intelligence."
    },
    {
      icon: "CV",
      title: "Computer Vision",
      description: "Object detection, image segmentation, visual measurement and intelligent image analysis."
    },
    {
      icon: "XR",
      title: "AR & VR",
      description: "Immersive learning, augmented reality, virtual reality, Unity development and extended reality."
    },
    {
      icon: "CR",
      title: "Cognitive Radio Networks",
      description: "Cognitive radio ad hoc networks, intelligent communication and resource-aware networking."
    }
  ],

  publications: [],

  studentSupervision: [],

  downloadAccess: {
    password: "GBU2026",
    rememberForSession: true
  },

  // CSV FALLBACK: downloads.csv is the main resource list.
  // These entries are used only when CSV loading is unavailable (for example, file:// preview).

  activities: [],

  projects: []
};

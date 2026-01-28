const RESOURCES = {
  careerPaths: [
    {
      id: 1,
      title: "Software Development",
      description: "Build applications, websites, and software systems",
      skills: ["Programming", "Problem Solving", "Logical Thinking"],
      education: "Computer Science, Software Engineering, or self-taught",
      averageSalary: "$80,000 - $150,000",
      resources: [
        "FreeCodeCamp.org",
        "CS50 by Harvard",
        "The Odin Project"
      ]
    },
    {
      id: 2,
      title: "Data Science",
      description: "Analyze data to extract insights and drive decisions",
      skills: ["Statistics", "Python/R", "Machine Learning"],
      education: "Statistics, Mathematics, Computer Science",
      averageSalary: "$90,000 - $160,000",
      resources: [
        "Kaggle Learn",
        "DataCamp",
        "Google Data Analytics Certificate"
      ]
    },
    {
      id: 3,
      title: "UX/UI Design",
      description: "Design user-friendly digital experiences",
      skills: ["Creativity", "Empathy", "Design Tools (Figma)"],
      education: "Design, HCI, or portfolio-based",
      averageSalary: "$70,000 - $130,000",
      resources: [
        "Google UX Design Certificate",
        "Interaction Design Foundation",
        "Daily UI Challenge"
      ]
    },
    {
      id: 4,
      title: "Digital Marketing",
      description: "Promote products and brands online",
      skills: ["Communication", "Analytics", "Creativity"],
      education: "Marketing, Communications, Business",
      averageSalary: "$50,000 - $100,000",
      resources: [
        "Google Digital Garage",
        "HubSpot Academy",
        "Meta Blueprint"
      ]
    },
    {
      id: 5,
      title: "Product Management",
      description: "Guide product development from concept to launch",
      skills: ["Leadership", "Strategy", "Communication"],
      education: "Business, Engineering, or diverse backgrounds",
      averageSalary: "$100,000 - $180,000",
      resources: [
        "Product School",
        "Reforge",
        "Mind the Product"
      ]
    }
  ],
  learningPaths: [
    {
      id: 1,
      title: "Getting Started with Tech",
      steps: [
        "Learn the basics of programming (Python or JavaScript)",
        "Build small projects",
        "Join online communities (GitHub, Stack Overflow)",
        "Create a portfolio",
        "Apply for internships or entry-level positions"
      ]
    },
    {
      id: 2,
      title: "Career Change Strategy",
      steps: [
        "Identify transferable skills",
        "Research target career thoroughly",
        "Gain relevant certifications or skills",
        "Network with professionals in the field",
        "Start with freelance or part-time projects",
        "Update resume and LinkedIn profile"
      ]
    }
  ],
  skillDevelopment: [
    {
      category: "Technical Skills",
      resources: [
        { name: "Coursera", url: "https://www.coursera.org", type: "Online Courses" },
        { name: "Udemy", url: "https://www.udemy.com", type: "Online Courses" },
        { name: "LinkedIn Learning", url: "https://www.linkedin.com/learning", type: "Professional Development" }
      ]
    },
    {
      category: "Soft Skills",
      resources: [
        { name: "Toastmasters", url: "https://www.toastmasters.org", type: "Public Speaking" },
        { name: "Dale Carnegie", url: "https://www.dalecarnegie.com", type: "Leadership" },
        { name: "MindTools", url: "https://www.mindtools.com", type: "Management Skills" }
      ]
    }
  ]
};

exports.getAllResources = async (req, res) => {
  res.json(RESOURCES);
};

exports.getCareerPaths = async (req, res) => {
  res.json({ careerPaths: RESOURCES.careerPaths });
};

exports.getLearningPaths = async (req, res) => {
  res.json({ learningPaths: RESOURCES.learningPaths });
};

exports.getSkillResources = async (req, res) => {
  res.json({ skillDevelopment: RESOURCES.skillDevelopment });
};
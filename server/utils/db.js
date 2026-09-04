const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const INITIAL_POSTS = [
  {
    id: "post-1",
    title: "Mastering Modern Web Architecture: HTML5, CSS3, and ES6+",
    slug: "mastering-modern-web-architecture",
    excerpt: "Explore the core foundational pillars of front-end development, responsive layouts, modular CSS architectures, and dynamic user interfaces.",
    content: `<p>Web development has undergone a massive transformation in recent years. With HTML5 semantic structures, advanced CSS3 capabilities like Grid and Flexbox, and modern JavaScript standards, building application interfaces is more expressive than ever.</p>
    <h2>Key Components of Modern Web Apps</h2>
    <p>Designing modern user experiences demands clarity, performance, and responsive design systems. By leveraging CSS custom properties, component-driven layouts, and modular state management, developers can craft rich applications without heavy external frameworks.</p>
    <blockquote>"Great front-end development is where clean code meets stunning visual aesthetics."</blockquote>
    <p>Start with solid semantic tags like <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, and <code>&lt;article&gt;</code>, then construct custom CSS tokens for scalable color palettes and fluid typography.</p>`,
    category: "Web Dev",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    author: {
      id: "usr_demo",
      name: "Pranav Sharma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    publishedAt: "2026-09-04",
    readTime: "5 min read",
    status: "published",
    tags: ["Web Dev", "HTML5", "CSS3"],
    views: 1420,
    likes: 384,
    comments: [
      { id: "c1", author: "Alex Rivers", text: "This article is super insightful! Love the breakdown of CSS variables.", date: "2 hours ago" },
      { id: "c2", author: "Sarah Lin", text: "Very clear explanation of semantic HTML structures.", date: "5 hours ago" }
    ]
  },
  {
    id: "post-2",
    title: "Designing Glassmorphic & Cyberpunk UI Systems",
    slug: "designing-glassmorphic-cyberpunk-ui",
    excerpt: "Learn how to combine dark modes, backdrop blur filters, glowing neon borders, and dynamic hover animations for high-impact visual design.",
    content: `<p>Glassmorphism and cyber-inspired UI designs create immersive digital experiences. Through strategic use of translucency, ambient background gradients, and micro-interactions, interfaces come to life.</p>`,
    category: "Design",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    author: {
      id: "usr_maya",
      name: "Maya Vance",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
    },
    publishedAt: "2026-09-03",
    readTime: "4 min read",
    status: "published",
    tags: ["UI/UX", "Glassmorphism"],
    views: 980,
    likes: 256,
    comments: []
  },
  {
    id: "post-3",
    title: "Building Intelligent Web Applications with Generative AI APIs",
    slug: "building-intelligent-web-applications-ai",
    excerpt: "A beginner-friendly guide to integrating intelligent AI subagents, context retrieval systems, and real-time interaction flows into web interfaces.",
    content: `<p>Generative AI tools are reshaping how developers construct features. From automatic text summarization to automated content creation, AI APIs provide exciting capabilities for front-end engineers.</p>`,
    category: "AI",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    author: {
      id: "usr_david",
      name: "David Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    publishedAt: "2026-09-02",
    readTime: "7 min read",
    status: "published",
    tags: ["AI", "API"],
    views: 2150,
    likes: 512,
    comments: []
  }
];

function readData(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return defaultData;
  }
}

function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  getPosts: () => readData(POSTS_FILE, INITIAL_POSTS),
  savePosts: (posts) => writeData(POSTS_FILE, posts),
  getUsers: () => readData(USERS_FILE, []),
  saveUsers: (users) => writeData(USERS_FILE, users)
};

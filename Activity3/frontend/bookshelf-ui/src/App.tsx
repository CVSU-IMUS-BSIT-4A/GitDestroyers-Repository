import { useState, useEffect } from "react";
import Books from "./Books";
import Authors from "./Authors";
import Categories from "./Categories";
import ManageBooks from "./ManageBooks";
import {
  Settings,
  User,
  Tag,
  Library,
} from "lucide-react";

export default function App() {
  const [tab, setTab] = useState<
    "books" | "authors" | "categories" | "manage"
  >("books");
  const [theme, setTheme] = useState<'dark' | 'light'>(() => 
    matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('theme-light');
    else root.classList.remove('theme-light');
    root.style.transition = 'background-color .3s ease, color .3s ease';
  }, [theme]);

  const tabs = [
    { id: "books", label: "Books", icon: <Library size={18} /> },
    { id: "manage", label: "Manage Books", icon: <Settings size={18} /> },
    { id: "authors", label: "Authors", icon: <User size={18} /> },
    { id: "categories", label: "Categories", icon: <Tag size={18} /> },
  ] as const;

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="title">Bookshelf</h1>
          <div className="pill">Digital library management</div>
        </div>
        <div className="row">
          <button className="button" onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </div>

      <nav className="nav">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`nav-button ${active ? 'active' : ''}`}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </nav>

      <main>
        {tab === "books" && <Books />}
        {tab === "manage" && <ManageBooks />}
        {tab === "authors" && <Authors />}
        {tab === "categories" && <Categories />}
      </main>
    </div>
  );
}

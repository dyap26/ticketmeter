import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  className?: string;
  defaultValue?: string;
  onSearch?: (q: string) => void;
  autoFocus?: boolean;
}

export function SearchBar({ defaultValue = "", onSearch, autoFocus }: Props) {
  const [value, setValue] = useState(defaultValue);
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (onSearch) onSearch(q);
    else navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submit} style={{ position: "relative" }}>
      <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "var(--c-muted)", pointerEvents: "none" }} />
      <input
        ref={ref}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search events, teams, artists..."
        autoFocus={autoFocus}
        style={{
          width: "100%",
          height: 42,
          background: "var(--c-surf)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 4,
          padding: "0 40px 0 38px",
          fontFamily: "'Barlow', sans-serif",
          fontSize: "0.9rem",
          color: "var(--c-text)",
          outline: "none",
          transition: "border-color 0.12s",
        }}
        onFocus={e => e.currentTarget.style.borderColor = "rgba(184,255,0,0.4)"}
        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"}
      />
      {value && (
        <button
          type="button"
          onClick={() => { setValue(""); if (onSearch) onSearch(""); ref.current?.focus(); }}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--c-muted)", display: "flex", padding: 2 }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      )}
    </form>
  );
}

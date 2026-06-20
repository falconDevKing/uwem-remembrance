"use client";

import { useState, useRef, useEffect } from "react";

interface Country {
  flag: string;
  code: string;
  name: string;
  digits: number;
}

const COUNTRIES: Country[] = [
  { flag: "\u{1F1F3}\u{1F1EC}", code: "+234", name: "Nigeria", digits: 10 },
  { flag: "\u{1F1EC}\u{1F1ED}", code: "+233", name: "Ghana", digits: 9 },
  { flag: "\u{1F1EC}\u{1F1E7}", code: "+44", name: "United Kingdom", digits: 10 },
  { flag: "\u{1F1FA}\u{1F1F8}", code: "+1", name: "United States", digits: 10 },
  { flag: "\u{1F1E8}\u{1F1E6}", code: "+1", name: "Canada", digits: 10 },
  { flag: "\u{1F1FF}\u{1F1E6}", code: "+27", name: "South Africa", digits: 9 },
  { flag: "\u{1F1F0}\u{1F1EA}", code: "+254", name: "Kenya", digits: 9 },
  { flag: "\u{1F1EE}\u{1F1EA}", code: "+353", name: "Ireland", digits: 9 },
  { flag: "\u{1F1E9}\u{1F1EA}", code: "+49", name: "Germany", digits: 11 },
  { flag: "\u{1F1EB}\u{1F1F7}", code: "+33", name: "France", digits: 9 },
];

const OTHER_OPTION = { flag: "\u{1F30D}", code: "", name: "Other", digits: 0 };

function trimLeadingZero(value: string): string {
  return value.startsWith("0") ? value.slice(1) : value;
}

export default function PhoneInput({
  name,
  defaultValue,
  required,
  placeholder = "Phone number",
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isOther, setIsOther] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const parsed = parseDefault(defaultValue);
  const [selected, setSelected] = useState<Country>(parsed.country);
  const [number, setNumber] = useState(parsed.local);

  function parseDefault(value?: string): {
    country: Country;
    local: string;
  } {
    if (!value) return { country: COUNTRIES[0], local: "" };
    for (const c of COUNTRIES) {
      if (value.startsWith(c.code)) {
        return { country: c, local: value.slice(c.code.length) };
      }
    }
    return { country: COUNTRIES[0], local: value };
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmed = trimLeadingZero(number.replace(/\D/g, ""));
  const fullValue = isOther ? number : trimmed ? `${selected.code}${trimmed}` : "";
  const expectedDigits = selected.digits;
  const showWarning =
    !isOther && trimmed.length > 0 && expectedDigits > 0 && trimmed.length !== expectedDigits;

  const filtered = COUNTRIES.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <input type="hidden" name={name} value={fullValue} />
      <div className="flex">
        {!isOther && (
          <button
            type="button"
            onClick={() => {
              setOpen(!open);
              setSearch("");
            }}
            className="flex items-center gap-1 rounded-l-lg border border-r-0 border-border bg-background px-2.5 py-3 text-sm transition-colors hover:bg-border/50"
          >
            <span>{selected.flag}</span>
            <span className="text-xs text-muted">{selected.code}</span>
            <svg
              className={`h-3 w-3 text-muted transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        )}
        <input
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required={required}
          placeholder={isOther ? "+XXX..." : placeholder}
          className={`flex-1 border border-border bg-white px-4 py-3 text-foreground placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 ${
            isOther ? "rounded-lg" : "rounded-r-lg"
          }`}
        />
      </div>

      {showWarning && (
        <p className="mt-1 text-xs text-amber-600">
          Expected {expectedDigits} digits for {selected.name}
        </p>
      )}

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-card shadow-lg">
          <div className="border-b border-border p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              autoFocus
              className="w-full rounded border border-border bg-white px-3 py-1.5 text-sm placeholder:text-muted/60 focus:border-gold focus:outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.map((c) => (
              <button
                key={`${c.code}-${c.name}`}
                type="button"
                onClick={() => {
                  setSelected(c);
                  setIsOther(false);
                  setOpen(false);
                  setSearch("");
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-background"
              >
                <span>{c.flag}</span>
                <span className="w-12 text-xs text-muted">{c.code}</span>
                <span className="text-foreground">{c.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setIsOther(true);
                setOpen(false);
                setSearch("");
              }}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm hover:bg-background"
            >
              <span>{OTHER_OPTION.flag}</span>
              <span className="text-foreground">{OTHER_OPTION.name}</span>
              <span className="ml-auto text-xs text-muted">
                Type full number
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

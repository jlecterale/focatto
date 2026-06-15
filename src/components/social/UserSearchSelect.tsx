"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MagnifyingGlass, X, User } from "@phosphor-icons/react";
import { searchUsers } from "../../lib/socialService";
import type { TaggedUser } from "../../lib/roles";

interface UserSearchSelectProps {
  selectedUsers: TaggedUser[];
  onChange: (users: TaggedUser[]) => void;
  excludeUserId?: string;
}

export default function UserSearchSelect({
  selectedUsers,
  onChange,
  excludeUserId,
}: UserSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<
    Array<{ uid: string; displayName: string; photoURL: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const handleSearch = useCallback(
    (term: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (term.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const users = await searchUsers(term, excludeUserId);
          // Filtra utilizadores já selecionados
          const filtered = users.filter(
            (u) => !selectedUsers.some((s) => s.userId === u.uid)
          );
          setResults(filtered);
          setShowDropdown(filtered.length > 0);
        } catch (err) {
          console.error("Erro ao buscar utilizadores:", err);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [excludeUserId, selectedUsers]
  );

  useEffect(() => {
    handleSearch(searchTerm);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm, handleSearch]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user: {
    uid: string;
    displayName: string;
    photoURL: string;
  }) => {
    if (selectedUsers.length >= 10) return;
    const tagged: TaggedUser = {
      userId: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL || null,
    };
    onChange([...selectedUsers, tagged]);
    setSearchTerm("");
    setResults([]);
    setShowDropdown(false);
  };

  const handleRemove = (userId: string) => {
    onChange(selectedUsers.filter((u) => u.userId !== userId));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input de busca */}
      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          placeholder="Buscar pessoas para marcar..."
          className="input-field pl-9 pr-4 text-sm"
          disabled={selectedUsers.length >= 10}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-surface-500 border-t-accent" />
          </div>
        )}
      </div>

      {/* Dropdown de resultados */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full glass rounded-xl overflow-hidden shadow-2xl animate-scale-in max-h-[200px] overflow-y-auto scrollbar-thin">
          {results.map((user) => (
            <button
              key={user.uid}
              type="button"
              onClick={() => handleSelect(user)}
              className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-white/10"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-surface-700 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-surface-400" />
                </div>
              )}
              <span className="text-sm text-surface-100 truncate">
                {user.displayName}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Chips dos selecionados */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map((user) => (
            <span
              key={user.userId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ef7c2c]/10 border border-[#ef7c2c]/20 text-xs text-surface-100 animate-scale-in"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-4 w-4 rounded-full object-cover"
                />
              ) : (
                <User size={12} className="text-surface-300" />
              )}
              <span className="max-w-[100px] truncate">
                {user.displayName}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(user.userId)}
                className="text-surface-400 hover:text-red-400 transition-colors cursor-pointer ml-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <span className="text-[10px] text-surface-500 self-center">
            {selectedUsers.length}/10
          </span>
        </div>
      )}
    </div>
  );
}

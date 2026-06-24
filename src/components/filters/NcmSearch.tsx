import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { comexstat } from "@/services/comexstat";
import { motion, AnimatePresence } from "framer-motion";

interface NcmSearchProps {
  value: string;
  onChange: (ncm: string) => void;
  placeholder?: string;
}

const NcmSearch = ({ value, onChange, placeholder = "Buscar NCM..." }: NcmSearchProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.length < 2) {
        setSuggestions([]);
        setShow(false);
        return;
      }
      setLoading(true);
      try {
        const data = await comexstat.searchNCM(value);
        setSuggestions(data?.slice(0, 10) || []);
        setShow(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShow(true)}
          placeholder={placeholder}
          className="rounded-xl h-10 pl-10 border-slate-200 text-sm"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-600" />}
      </div>
      <AnimatePresence>
        {show && suggestions.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
          >
            {suggestions.map((s: any, i: number) => (
              <button
                key={i}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0"
                onClick={() => {
                  onChange(s.code || s.codigo || '');
                  setShow(false);
                }}
              >
                <Badge className="bg-blue-100 text-blue-700 border-none font-mono text-xs">
                  {s.code || s.codigo}
                </Badge>
                <span className="text-sm text-slate-700 truncate">{s.description || s.descricao || s.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NcmSearch;
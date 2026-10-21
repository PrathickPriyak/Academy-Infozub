"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function KnowledgeSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) {
          params.set("q", query.trim());
        }
        router.push(params.size > 0 ? `/infozub-admin/knowledge?${params}` : "/infozub-admin/knowledge");
      }}
    >
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search indexed knowledge"
        aria-label="Search indexed knowledge"
      />
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}

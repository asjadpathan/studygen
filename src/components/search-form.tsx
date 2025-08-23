
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function SearchForm({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Card>
        <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    type="search"
                    name="search"
                    placeholder="e.g., Quantum Physics, The French Revolution..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-grow"
                />
                <Button type="submit" disabled={!query.trim()}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            </form>
        </CardContent>
    </Card>
  );
}

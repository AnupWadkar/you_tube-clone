import SearchResult from "@/components/SearchResult";
import { useRouter } from "next/router";

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;

  // ✅ This is the fix – ensure q is always a string
  const searchQuery = typeof q === "string" ? q : "";

  return (
    <div className="flex-1 p-4">
      <div className="max-w-6xl">
        {searchQuery && (
          <div className="mb-6">
            <h1 className="text-xl font-medium mb-4">
              Search results for "{searchQuery}"
            </h1>
          </div>
        )}
        <SearchResult query={searchQuery} />
      </div>
    </div>
  );
}
import SearchResult from "@/components/SearchResult";
import { useRouter } from "next/router";

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;

  return (
    <div className="flex-1 p-4">
      <div className="max-w-6xl">
        {q && (
          <div className="mb-6">
            <h1 className="text-xl font-medium mb-4">
              Search results for "{q}"
            </h1>
          </div>
        )}
        {/* ✅ FIX: Use type assertion to handle string | string[] */}
        <SearchResult query={(q as string) || ""} />
      </div>
    </div>
  );
}

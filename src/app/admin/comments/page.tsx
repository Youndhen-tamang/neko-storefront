"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCommentThread } from "@/components/admin/comment-thread";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductComment, api } from "@/lib/api";

export default function CommentsPage() {
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  function load(nextQ = q) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    const query = params.toString();
    setLoading(true);
    api<{ comments: ProductComment[] }>(`/api/engagement${query ? `?${query}` : ""}`, { auth: true })
      .then((data) => setComments(data.comments))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminShell>
      <div>
        <h1 className="font-serif text-4xl">Likes & comments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comments require a valid invoice number. Replies stay nested under the original comment.
        </p>
      </div>
      <form
        className="mt-6 flex gap-3 rounded-xl border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <Input
          placeholder="Search comments, invoices, authors, or products"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : (
          <AdminCommentThread comments={comments} onDeleted={() => load()} showProduct />
        )}
      </div>
    </AdminShell>
  );
}

"use client";

import { ProductComment, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminCommentThread({
  comments,
  onDeleted,
  showProduct = false,
  showAgency = false,
}: {
  comments: ProductComment[];
  onDeleted: () => void;
  showProduct?: boolean;
  showAgency?: boolean;
}) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet.</p>;
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <AdminCommentCard
          key={comment.id}
          comment={comment}
          onDeleted={onDeleted}
          showProduct={showProduct}
          showAgency={showAgency}
        />
      ))}
    </div>
  );
}

function AdminCommentCard({
  comment,
  onDeleted,
  showProduct,
  showAgency,
}: {
  comment: ProductComment;
  onDeleted: () => void;
  showProduct: boolean;
  showAgency: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{comment.author_name}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
              {comment.invoice_number ? ` · ${comment.invoice_number}` : ""}
              {showProduct && comment.product_name ? ` · ${comment.product_name}` : ""}
              {showAgency && comment.agency_name ? ` · ${comment.agency_name}` : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (!window.confirm("Delete this comment and its replies?")) return;
              try {
                await api(`/api/engagement/comments/${comment.id}`, { method: "DELETE", auth: true });
                onDeleted();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not delete comment");
              }
            }}
          >
            Delete
          </Button>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{comment.body}</p>
      </div>
      {comment.replies.length > 0 && (
        <div className="ml-4 space-y-3 border-l pl-4 sm:ml-6">
          {comment.replies.map((reply) => (
            <AdminCommentCard
              key={reply.id}
              comment={reply}
              onDeleted={onDeleted}
              showProduct={showProduct}
              showAgency={showAgency}
            />
          ))}
        </div>
      )}
    </div>
  );
}

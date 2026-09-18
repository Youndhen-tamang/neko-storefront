"use client";

import { Heart } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductComment, ProductEngagement, api } from "@/lib/api";
import {
  getSavedCommentName,
  getSavedInvoiceNumber,
  getShopSessionId,
  saveCommentName,
  saveInvoiceNumber,
} from "@/lib/session";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function CommentItem({
  comment,
  remainingComments,
  onReply,
}: {
  comment: ProductComment;
  remainingComments: number;
  onReply: (parentId: string, body: string, invoiceNumber: string, authorName: string) => Promise<void>;
}) {
  const [replying, setReplying] = useState(false);
  const [body, setBody] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(getSavedInvoiceNumber());
  const [authorName, setAuthorName] = useState(getSavedCommentName());
  const [saving, setSaving] = useState(false);

  async function submitReply(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onReply(comment.id, body, invoiceNumber, authorName);
      setBody("");
      setReplying(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium">{comment.author_name}</p>
          <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{comment.body}</p>
        {remainingComments > 0 && (
          <button
            type="button"
            className="mt-3 text-xs text-primary"
            onClick={() => setReplying((open) => !open)}
          >
            {replying ? "Cancel reply" : "Reply"}
          </button>
        )}
        {replying && (
          <form className="mt-4 space-y-3 border-t pt-4" onSubmit={submitReply}>
            <Input
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
            <Input
              placeholder="Invoice number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
            <Textarea
              className="min-h-[90px]"
              placeholder="Write a reply"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
            <Button type="submit" size="sm" disabled={saving || !body.trim() || !invoiceNumber.trim()}>
              {saving ? "Posting..." : "Post reply"}
            </Button>
          </form>
        )}
      </div>
      {comment.replies.length > 0 && (
        <div className="ml-4 space-y-3 border-l pl-4 sm:ml-6">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              remainingComments={remainingComments}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductSocial({ productId }: { productId: string }) {
  const [engagement, setEngagement] = useState<ProductEngagement | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);

  function load() {
    const sessionId = getShopSessionId();
    return api<{ engagement: ProductEngagement }>(`/api/engagement/public/${productId}`, {
      sessionId,
    }).then((data) => setEngagement(data.engagement));
  }

  useEffect(() => {
    setAuthorName(getSavedCommentName());
    setInvoiceNumber(getSavedInvoiceNumber());
    load().catch((error) => toast.error(error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function toggleLike() {
    setLiking(true);
    try {
      const result = await api<{ liked: boolean; likeCount: number }>(
        `/api/engagement/public/${productId}/like`,
        {
          method: "POST",
          sessionId: getShopSessionId(),
          body: JSON.stringify({ sessionId: getShopSessionId() }),
        }
      );
      setEngagement((current) =>
        current
          ? { ...current, liked: result.liked, likeCount: result.likeCount }
          : current
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update like");
    } finally {
      setLiking(false);
    }
  }

  async function postComment(parentId: string | undefined, nextBody: string, invoice: string, name: string) {
    const result = await api<{ remainingComments: number }>(`/api/engagement/public/${productId}/comments`, {
      method: "POST",
      sessionId: getShopSessionId(),
      body: JSON.stringify({
        sessionId: getShopSessionId(),
        invoiceNumber: invoice,
        authorName: name,
        body: nextBody,
        parentId,
      }),
    });
    saveInvoiceNumber(invoice);
    if (name.trim()) saveCommentName(name);
    toast.success(parentId ? "Reply posted" : "Comment posted");
    await load();
    return result;
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await postComment(undefined, body, invoiceNumber, authorName);
      setBody("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not post comment");
    } finally {
      setSaving(false);
    }
  }

  if (!engagement) return null;

  return (
    <section className="mt-12 border-t pt-10">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          variant={engagement.liked ? "default" : "outline"}
          onClick={toggleLike}
          disabled={liking}
        >
          <Heart className={`h-4 w-4 ${engagement.liked ? "fill-current" : ""}`} />
          {engagement.liked ? "Liked" : "Like"} · {engagement.likeCount}
        </Button>
        <p className="text-sm text-muted-foreground">
          {engagement.commentCount} comment{engagement.commentCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-8 max-w-2xl">
        <h2 className="font-serif text-3xl">Comments</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter a valid invoice number from this store to comment. This session can post up to 3 comments on
          this product.
        </p>

        {engagement.remainingComments > 0 ? (
          <form className="mt-6 space-y-4 rounded-2xl border bg-card p-5" onSubmit={submitComment}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice number</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-STORE-1001"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comment</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share what you thought of this product"
                required
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {engagement.remainingComments} comment{engagement.remainingComments === 1 ? "" : "s"} left
                this session
              </p>
              <Button type="submit" disabled={saving || !body.trim() || !invoiceNumber.trim()}>
                {saving ? "Posting..." : "Post comment"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-6 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            This session has already posted 3 comments on this product.
          </p>
        )}

        <div className="mt-8 space-y-4">
          {engagement.comments.length === 0 && (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to share feedback.</p>
          )}
          {engagement.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              remainingComments={engagement.remainingComments}
              onReply={async (parentId, replyBody, invoice, name) => {
                try {
                  await postComment(parentId, replyBody, invoice, name);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Could not post reply");
                  throw error;
                }
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

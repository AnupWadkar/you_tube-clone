import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
}

export default function Comments({ videoId }: { videoId: string }) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name || "Anonymous",
      });
      if (res.data.comment) {
        const newCommentObj: Comment = {
          _id: Date.now().toString(),
          videoid: videoId,
          userid: user._id,
          commentbody: newComment,
          usercommented: user.name || "Anonymous",
          commentedon: new Date().toISOString(),
        };
        setComments([newCommentObj, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Submit comment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    try {
      const res = await axiosInstance.post(`/comment/editcomment/${editingId}`, {
        commentbody: editText,
      });
      if (res.data) {
        setComments((prev) =>
          prev.map((c) => (c._id === editingId ? { ...c, commentbody: editText } : c))
        );
        setEditingId(null);
        setEditText("");
      }
    } catch (error) {
      console.error("Update comment error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error("Delete comment error:", error);
    }
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setNewComment("")} disabled={!newComment.trim()}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!newComment.trim() || isSubmitting}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{comment.usercommented?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.usercommented}</span>
                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>
                {editingId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                    <div className="flex gap-2 justify-end">
                      <Button onClick={handleUpdate} disabled={!editText.trim()}>
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm">{comment.commentbody}</p>
                    {comment.userid === user?._id && (
                      <div className="flex gap-2 mt-2 text-sm text-gray-500">
                        <button onClick={() => handleEdit(comment)}>Edit</button>
                        <button onClick={() => handleDelete(comment._id)}>Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
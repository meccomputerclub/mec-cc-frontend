"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  MessageSquare, RefreshCw, ArrowLeft, Send,
  Mail, MailOpen, Trash2, Clock, User, Reply,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ReplyItem {
  _id: string;
  body: string;
  repliedByName: string;
  sentAt: string;
}

interface ContactMessage {
  _id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  isRead: boolean;
  replies: ReplyItem[];
  createdAt: string;
}

const API = `${API_BASE_URL}/api/contact-messages`;

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API, { withCredentials: true });
      setMessages(res.data.data || []);
    } catch {
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  // Open a message — mark as read automatically
  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    setReplyBody("");
    setReplyError(null);
    if (!msg.isRead) {
      try {
        await axios.patch(`${API}/${msg._id}/read`, {}, { withCredentials: true });
        setMessages((prev) =>
          prev.map((m) => m._id === msg._id ? { ...m, isRead: true } : m)
        );
        setSelected((prev) => prev ? { ...prev, isRead: true } : prev);
      } catch { /* silent */ }
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyBody.trim()) return;
    setSending(true);
    setReplyError(null);
    try {
      const res = await axios.post(
        `${API}/${selected._id}/reply`,
        { body: replyBody.trim() },
        { withCredentials: true }
      );
      const updated: ContactMessage = res.data.data;
      setSelected(updated);
      setMessages((prev) => prev.map((m) => m._id === updated._id ? updated : m));
      setReplyBody("");
    } catch (err) {
      setReplyError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to send reply."
          : "Failed to send reply."
      );
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API}/${id}`, { withCredentials: true });
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (selected?._id === id) setSelected(null);
      setDeleteConfirm(null);
    } catch { alert("Delete failed."); }
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.isRead;
    if (filter === "read") return m.isRead;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchMessages}
          className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  // ── Detail view ──────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="space-y-4 max-w-3xl">
        {/* Back */}
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
        >
          <ArrowLeft size={16} /> Back to messages
        </button>

        {/* Message card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                  {selected.subject}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <User size={13} /> {selected.senderName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} />
                    <a href={`mailto:${selected.senderEmail}`}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                      {selected.senderEmail}
                    </a>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {new Date(selected.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Delete */}
              {deleteConfirm === selected._id ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleDelete(selected._id)}
                    className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                    Confirm Delete
                  </button>
                  <button onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(selected._id)}
                  className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  title="Delete message">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Original message body */}
          <div className="p-5">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {selected.body}
            </p>
          </div>

          {/* Replies thread */}
          {(selected.replies?.length ?? 0) > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800">
              <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/10">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Reply size={13} /> {selected.replies?.length ?? 0} {(selected.replies?.length ?? 0) === 1 ? "Reply" : "Replies"}
                </p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {(selected.replies ?? []).map((reply) => (
                  <div key={reply._id} className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                        <User size={13} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {reply.repliedByName}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(reply.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Admin Reply
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed pl-9">
                      {reply.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply form */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/30">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Reply size={15} />
              {(selected.replies?.length ?? 0) > 0 ? "Send Another Reply" : "Reply to this message"}
            </h4>
            <form onSubmit={handleReply} className="space-y-3">
              <textarea
                ref={replyRef}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={`Write your reply to ${selected.senderName}…`}
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-y"
              />
              {replyError && (
                <p className="text-xs text-red-500">{replyError}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Reply will be emailed to <strong>{selected.senderEmail}</strong>
                </p>
                <button
                  type="submit"
                  disabled={sending || !replyBody.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-text-primary hover:bg-surface-inverse text-white border border-border-default rounded-xl font-semibold text-sm transition disabled:opacity-60 shadow-[4px_4px_0px_0px_var(--border-default)]"
                >
                  <Send size={14} />
                  {sending ? "Sending…" : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-blue-500" size={28} />
            Contact Messages
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-600 text-white">
                {unreadCount} new
              </span>
            )}
          </h2>
        </div>
        <button onClick={fetchMessages}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition self-start sm:self-auto"
          title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(["all", "unread", "read"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition capitalize ${filter === f
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
            {f}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          {filter === "unread" ? "No unread messages." : filter === "read" ? "No read messages." : "No messages yet."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg) => (
            <button
              key={msg._id}
              onClick={() => openMessage(msg)}
              className={`w-full text-left rounded-xl border transition-all hover:shadow-sm ${!msg.isRead
                  ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                }`}
            >
              <div className="p-4 flex items-start gap-3">
                {/* Read/unread icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {msg.isRead
                    ? <MailOpen size={18} className="text-gray-400" />
                    : <Mail size={18} className="text-blue-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm truncate ${!msg.isRead ? "font-semibold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300"}`}>
                      {msg.subject}
                    </p>
                    {!msg.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                    {(msg.replies?.length ?? 0) > 0 && (
                      <span className="flex-shrink-0 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded-full">
                        <Reply size={10} /> {msg.replies.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {msg.senderName} · {msg.senderEmail}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{msg.body}</p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

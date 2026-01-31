import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  ArrowDown,
  Building2,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Filter,
  Info,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  User,
  Video,
} from "lucide-react";

type ConversationMember = Database["public"]["Tables"]["conversation_members"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type ConversationListItem = {
  id: string;
  company: string;
  contact: string;
  role?: string | null;
  location?: string | null;
  lastMessage?: MessageRow | null;
  unreadCount: number;
  otherMember?: ConversationMember | null;
  selfMember?: ConversationMember | null;
  profile?: ProfileRow | null;
  updatedAt: string;
};

type ChatMessage = {
  id: string;
  direction: "incoming" | "outgoing";
  body: string;
  time: string;
  status?: "sent" | "read" | "pending";
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
};

const statusStyles = {
  active: "bg-emerald-500",
  offline: "bg-slate-400",
  typing: "bg-amber-500",
};

const typingWindowMs = 8000;

const getShortTime = (timestamp: string | null | undefined, nowLabel: string) => {
  if (!timestamp) return "";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  if (Number.isNaN(diffMs)) return "";
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return nowLabel;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
};

const isTypingActive = (lastTypingAt?: string | null) => {
  if (!lastTypingAt) return false;
  return Date.now() - new Date(lastTypingAt).getTime() <= typingWindowMs;
};

export default function BusinessChat() {
  const { i18n, t } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messageRows, setMessageRows] = useState<MessageRow[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [quickActionsExpanded, setQuickActionsExpanded] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const typingActiveRef = useRef(false);
  const activeIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user?.id]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [activeId, conversations]
  );

  const activePartner = activeConversation?.profile ?? null;
  const nowLabel = t("businessChat.now");
  const requestedConversationId = searchParams.get("conversation");

  const unreadTotal = useMemo(
    () => conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    [conversations]
  );

  const quickActions = useMemo(
    () => [
      t("businessChat.quickActions.shareDeck"),
      t("businessChat.quickActions.requestMoq"),
      t("businessChat.quickActions.scheduleCall"),
    ],
    [t]
  );

  const activeMessages = useMemo(() => {
    const otherReadAt = activeConversation?.otherMember?.last_read_at;
    const sortedMessages = messageRows
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return sortedMessages.map((message, index): ChatMessage => {
      const isOutgoing = message.sender_id === user?.id;
      let status: ChatMessage["status"];
      if (isOutgoing) {
        status = otherReadAt && new Date(message.created_at) <= new Date(otherReadAt) ? "read" : "sent";
      }

      const prevMessage = sortedMessages[index - 1];
      const nextMessage = sortedMessages[index + 1];
      const currentDirection = isOutgoing ? "outgoing" : "incoming";
      const prevDirection = prevMessage ? (prevMessage.sender_id === user?.id ? "outgoing" : "incoming") : null;
      const nextDirection = nextMessage ? (nextMessage.sender_id === user?.id ? "outgoing" : "incoming") : null;

      const isFirstInGroup = prevDirection !== currentDirection;
      const isLastInGroup = nextDirection !== currentDirection;

      return {
        id: message.id,
        direction: currentDirection,
        body: message.body,
        time: getShortTime(message.created_at, nowLabel),
        status,
        isFirstInGroup,
        isLastInGroup,
      };
    });
  }, [messageRows, activeConversation?.otherMember?.last_read_at, nowLabel, user?.id]);

  const contactLine = useMemo(() => {
    if (!activeConversation) return "";
    if (activeConversation.role) {
      return `${activeConversation.contact} · ${activeConversation.role}`;
    }
    return activeConversation.contact;
  }, [activeConversation]);

  const partnerSummary = useMemo(() => {
    if (!activePartner) return "";
    return [activePartner.company, activePartner.email].filter(Boolean).join(" · ");
  }, [activePartner]);

  const scrollToBottom = (smooth = false) => {
    const scrollElement = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (scrollElement) {
      if (smooth) {
        scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior: "smooth" });
      } else {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const handleScroll = () => {
    const scrollElement = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (scrollElement) {
      const isNearBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 160);
      textarea.style.height = `${Math.max(newHeight, 44)}px`;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, activeId]);

  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [activeId]);

  const loadConversations = async () => {
    if (!user) return;
    setIsLoadingConversations(true);
    try {
      const { data: selfMemberships, error: selfError } = await supabase
        .from("conversation_members")
        .select("*")
        .eq("user_id", user.id);

      if (selfError) throw selfError;

      if (!selfMemberships || selfMemberships.length === 0) {
        setConversations([]);
        setActiveId(null);
        setMessageRows([]);
        return;
      }

      const conversationIds = selfMemberships.map((member) => member.conversation_id);

      const { data: otherMemberships, error: otherError } = await supabase
        .from("conversation_members")
        .select("*")
        .in("conversation_id", conversationIds)
        .neq("user_id", user.id);

      if (otherError) throw otherError;

      const otherUserIds = otherMemberships?.map((member) => member.user_id) ?? [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, company, email")
        .in("user_id", otherUserIds);

      if (profileError) throw profileError;

      const { data: conversationRows, error: conversationError } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (conversationError) throw conversationError;

      const lastMessages = await Promise.all(
        (conversationRows ?? []).map(async (conversation) => {
          const { data } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", conversation.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return { conversationId: conversation.id, message: data?.[0] ?? null };
        })
      );

      const unreadCounts = await Promise.all(
        (conversationRows ?? []).map(async (conversation) => {
          const selfMember = selfMemberships.find(
            (member) => member.conversation_id === conversation.id
          );
          let query = supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", conversation.id)
            .neq("sender_id", user.id);

          if (selfMember?.last_read_at) {
            query = query.gt("created_at", selfMember.last_read_at);
          }

          const { count } = await query;
          return { conversationId: conversation.id, count: count ?? 0 };
        })
      );

      const lastMessageMap = new Map(
        lastMessages.map((entry) => [entry.conversationId, entry.message])
      );
      const unreadCountMap = new Map(
        unreadCounts.map((entry) => [entry.conversationId, entry.count])
      );

      const list = (conversationRows ?? []).map((conversation) => {
        const otherMember = otherMemberships?.find(
          (member) => member.conversation_id === conversation.id
        );
        const profile = profiles?.find((item) => item.user_id === otherMember?.user_id) ?? null;
        const contactName = [profile?.first_name, profile?.last_name]
          .filter(Boolean)
          .join(" ");
        const contact = contactName || profile?.email || t("businessChat.partnerFallback");
        const company = profile?.company || contact;

        return {
          id: conversation.id,
          company,
          contact,
          role: null,
          location: null,
          lastMessage: lastMessageMap.get(conversation.id) ?? null,
          unreadCount: unreadCountMap.get(conversation.id) ?? 0,
          otherMember: otherMember ?? null,
          selfMember: selfMemberships.find(
            (member) => member.conversation_id === conversation.id
          ) ?? null,
          profile,
          updatedAt: conversation.updated_at,
        } satisfies ConversationListItem;
      });

      setConversations(list);
      setActiveId((current) => {
        if (requestedConversationId && list.some((item) => item.id === requestedConversationId)) {
          return requestedConversationId;
        }
        if (current && list.some((item) => item.id === current)) {
          return current;
        }
        return list[0]?.id ?? null;
      });
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast({
        title: t("chat.errorTitle"),
        description: t("chat.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;
    setIsLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessageRows(data ?? []);
      await supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId });
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )
      );
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast({
        title: t("chat.errorTitle"),
        description: t("chat.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleIncomingMessage = (message: MessageRow) => {
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== message.conversation_id) return conversation;
        const isOwnMessage = message.sender_id === userIdRef.current;
        const isActiveConversation = activeIdRef.current === conversation.id;
        const incrementUnread = !isOwnMessage && !isActiveConversation;
        return {
          ...conversation,
          lastMessage: message,
          updatedAt: message.created_at,
          unreadCount: incrementUnread ? conversation.unreadCount + 1 : conversation.unreadCount,
        };
      })
    );

    if (activeIdRef.current === message.conversation_id) {
      setMessageRows((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev;
        return [...prev, message];
      });

      if (message.sender_id !== userIdRef.current) {
        supabase.rpc("mark_conversation_read", { p_conversation_id: message.conversation_id });
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === message.conversation_id
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )
        );
      }
    }
  };

  const handleMemberUpdate = (member: ConversationMember) => {
    setConversations((prev) =>
      prev.map((conversation) => {
        if (conversation.id !== member.conversation_id) return conversation;
        if (member.user_id === userIdRef.current) {
          return { ...conversation, selfMember: member };
        }
        return { ...conversation, otherMember: member };
      })
    );
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeId || !user) return;

    setIsSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: activeId,
        sender_id: user.id,
        body: messageInput.trim(),
      });

      if (error) throw error;

      setMessageInput("");
      typingActiveRef.current = false;
      await supabase.rpc("set_typing_status", {
        p_conversation_id: activeId,
        p_is_typing: false,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: t("chat.errorTitle"),
        description: t("chat.errorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageChange = (value: string) => {
    setMessageInput(value);
    if (!activeId) return;

    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      supabase.rpc("set_typing_status", {
        p_conversation_id: activeId,
        p_is_typing: true,
      });
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      typingActiveRef.current = false;
      supabase.rpc("set_typing_status", {
        p_conversation_id: activeId,
        p_is_typing: false,
      });
    }, 1200);
  };

  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user?.id]);

  useEffect(() => {
    if (!requestedConversationId) return;
    if (conversations.some((conversation) => conversation.id === requestedConversationId)) {
      setActiveId(requestedConversationId);
    }
  }, [requestedConversationId, conversations]);

  useEffect(() => {
    if (!activeId) {
      setMessageRows([]);
      return;
    }

    loadMessages(activeId);

    return () => {
      if (!activeId) return;
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      typingActiveRef.current = false;
      supabase.rpc("set_typing_status", {
        p_conversation_id: activeId,
        p_is_typing: false,
      });
    };
  }, [activeId]);

  useEffect(() => {
    if (!user || conversations.length === 0) return;

    const channels = conversations.map((conversation) => {
      const channel = supabase.channel(`chat-${conversation.id}`);
      channel.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => handleIncomingMessage(payload.new as MessageRow)
      );
      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_members",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => handleMemberUpdate(payload.new as ConversationMember)
      );
      channel.subscribe();
      return channel;
    });

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [conversations, user?.id]);

  const conversationStatus = (conversation: ConversationListItem) => {
    if (isTypingActive(conversation.otherMember?.last_typing_at)) return "typing";
    return "active";
  };

  const highlightItems: string[] = [];
  const opportunityItems: string[] = [];
  const sharedFiles: string[] = [];

  return (
    <DashboardLayout language={localePrefix}>
      <div className="flex h-[calc(100svh-140px)] flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("businessChat.pageTitle")}</h1>
            <p className="text-muted-foreground">
              {t("businessChat.pageSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {t("businessChat.filters")}
            </Button>
            <Button
              variant="cta"
              size="sm"
              className="gap-2"
              onClick={() => {
                toast({
                  title: t("businessChat.newChatToastTitle"),
                  description: t("businessChat.newChatToastDescription"),
                });
                navigate(`/${localePrefix}/partner-search`);
              }}
            >
              <Plus className="h-4 w-4" />
              {t("businessChat.newChatButton")}
            </Button>
          </div>
        </div>

        <div className="grid flex-1 min-h-0 grid-cols-1 gap-6">
          <Card className="bg-card/80 border-border shadow-soft flex h-full min-h-0 flex-col overflow-hidden">
            <div className="flex h-full flex-1 min-h-0">
              <aside
                className={cn(
                  "relative flex h-full flex-col border-r border-border bg-background/60 transition-all duration-300",
                  isSidebarCollapsed ? "w-16" : "w-[320px]"
                )}
              >
                <div
                  className={cn(
                    "flex flex-col h-full transition-all duration-300",
                    isSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                  )}
                >
                  <div className="space-y-4 px-5 pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{t("businessChat.conversationsTitle")}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {t("businessChat.activeCount", { count: conversations.length })}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsSidebarCollapsed(true)}
                          aria-label={t("businessChat.aria.collapseConversations")}
                        >
                          <PanelLeftClose className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <Label htmlFor="message-search" className="sr-only">
                        {t("businessChat.searchLabel")}
                      </Label>
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="message-search"
                        placeholder={t("businessChat.searchPlaceholder")}
                        className="pl-9"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm">{t("businessChat.filterAll")}</Button>
                      <Button variant="ghost" size="sm">{t("businessChat.filterUnread")}</Button>
                      <Button variant="ghost" size="sm">{t("businessChat.filterPinned")}</Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="px-4 pb-4 pt-3 flex-1 min-h-0">
                    <ScrollArea className="h-full">
                      <div className="space-y-2 pr-4">
                        {isLoadingConversations && (
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="rounded-xl border border-border bg-background/70 px-3 py-3">
                                <div className="flex items-start gap-3">
                                  <Skeleton className="h-10 w-10 rounded-full" />
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <Skeleton className="h-4 w-24" />
                                      <Skeleton className="h-3 w-8" />
                                    </div>
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-full" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {!isLoadingConversations && conversations.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                              <MessageCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {t("businessChat.noConversations")}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => navigate(`/${localePrefix}/partner-search`)}
                            >
                              <Plus className="h-4 w-4" />
                              {t("businessChat.findPartners") || "Find partners"}
                            </Button>
                          </div>
                        )}
                        {conversations.map((conversation) => (
                          <button
                            key={conversation.id}
                            type="button"
                            onClick={() => setActiveId(conversation.id)}
                            className={cn(
                              "w-full text-left rounded-xl border px-3 py-3 transition-colors duration-200 cursor-pointer",
                              activeId === conversation.id
                                ? "bg-primary/10 border-primary/30"
                                : "bg-background/70 border-border hover:bg-muted/50"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {conversation.company.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span
                                  className={cn(
                                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                                    statusStyles[conversationStatus(conversation)]
                                  )}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-sm truncate">{conversation.company}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {getShortTime(
                                      conversation.lastMessage?.created_at || conversation.updatedAt,
                                      nowLabel
                                    )}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {conversation.contact}
                                </p>
                                <p className="text-sm text-foreground/80 mt-1 line-clamp-2">
                                  {conversation.lastMessage?.body || t("businessChat.noMessages")}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {conversation.unreadCount > 0 && (
                                    <Badge className="bg-primary text-primary-foreground text-xs">
                                      {t("businessChat.newBadge", { count: conversation.unreadCount })}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                {isSidebarCollapsed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-between py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSidebarCollapsed(false)}
                      aria-label={t("businessChat.aria.expandConversations")}
                    >
                      <PanelLeftOpen className="h-4 w-4" />
                    </Button>
                    <div className="flex flex-col items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      {unreadTotal > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          {t("businessChat.newBadge", { count: unreadTotal })}
                        </Badge>
                      )}
                    </div>
                    <div className="h-6" />
                  </div>
                )}
              </aside>

              <div className="flex flex-1 min-w-0 flex-col">
                <div className="border-b border-border bg-background/70 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {(activeConversation?.company || t("businessChat.partnerFallback"))
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {activeConversation?.company || t("businessChat.partnerFallback")}
                        </CardTitle>
                        {contactLine && (
                          <p className="text-xs text-muted-foreground">
                            {contactLine}
                          </p>
                        )}
                        {activeConversation?.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {activeConversation.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" aria-label={t("businessChat.aria.startVoiceCall")}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={t("businessChat.aria.startVideoCall")}>
                        <Video className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={t("businessChat.aria.openPartnerOverview")}>
                            <Info className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader className="text-left">
                            <DialogTitle>{t("businessChat.partnerOverviewTitle")}</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-5">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                  <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{t("businessChat.verifiedPartner")}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {t("businessChat.averageRating", { rating: "--" })}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-border bg-background/80 p-4">
                                <p className="text-sm text-muted-foreground mb-2">{t("businessChat.about")}</p>
                                <p className="text-sm leading-relaxed">
                                  {partnerSummary || t("businessChat.partnerDetailsFallback")}
                                </p>
                              </div>

                              {highlightItems.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Star className="h-4 w-4 text-primary" />
                                    {t("businessChat.highlights")}
                                  </div>
                                  <div className="space-y-2">
                                    {highlightItems.map((item) => (
                                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        {item}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {opportunityItems.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Tag className="h-4 w-4 text-primary" />
                                    {t("businessChat.opportunities")}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {opportunityItems.map((item) => (
                                      <Badge key={item} variant="secondary" className="bg-secondary/70">
                                        {item}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="space-y-5">
                              {sharedFiles.length > 0 && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="h-4 w-4 text-primary" />
                                    {t("businessChat.sharedFiles")}
                                  </div>
                                  <div className="space-y-2">
                                    {sharedFiles.map((file) => (
                                      <div
                                        key={file}
                                        className="flex items-center justify-between rounded-lg border border-border bg-background/80 px-3 py-2 text-sm"
                                      >
                                        <span className="truncate">{file}</span>
                                        <Button variant="ghost" size="sm" className="gap-1">
                                          {t("businessChat.viewFile")}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="rounded-2xl border border-border bg-gradient-secondary p-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">
                                      {t("businessChat.recommendedNextStep")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {t("businessChat.recommendationCopy")}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                  <Button variant="glass" size="sm" className="gap-2">
                                    <FileText className="h-4 w-4" />
                                    {t("businessChat.draftOffer")}
                                  </Button>
                                  <Button variant="ghost" size="sm">{t("businessChat.dismiss")}</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" aria-label={t("businessChat.aria.moreOptions")}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 min-h-0 flex-col relative">
                  <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
                    <div className="py-6 space-y-5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Separator className="flex-1" />
                        {t("businessChat.today")}
                        <Separator className="flex-1" />
                      </div>

                      {isLoadingMessages && (
                        <div className="space-y-4">
                          <div className="flex gap-2 justify-start">
                            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                            <div className="space-y-1">
                              <Skeleton className="h-16 w-48 rounded-2xl rounded-bl-lg" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <div className="space-y-1 flex flex-col items-end">
                              <Skeleton className="h-10 w-36 rounded-2xl rounded-br-lg" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                          </div>
                          <div className="flex gap-2 justify-start">
                            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                            <div className="space-y-1">
                              <Skeleton className="h-12 w-56 rounded-2xl rounded-bl-lg" />
                              <Skeleton className="h-3 w-12" />
                            </div>
                          </div>
                        </div>
                      )}

                      {!isLoadingMessages && activeMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <MessageCircle className="h-8 w-8 text-primary/60" />
                          </div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            {t("businessChat.emptyTitle") || "Start the conversation"}
                          </p>
                          <p className="text-sm text-muted-foreground max-w-[240px]">
                            {t("businessChat.emptyPrompt")}
                          </p>
                        </div>
                      )}

                      {activeMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-2",
                            message.direction === "outgoing" ? "justify-end" : "justify-start",
                            !message.isFirstInGroup && "mt-0.5",
                            message.isFirstInGroup && "mt-4 first:mt-0"
                          )}
                        >
                          {message.direction === "incoming" && (
                            <div className={cn("h-8 w-8 flex-shrink-0", !message.isFirstInGroup && "invisible")}>
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          )}
                          <div className="max-w-[72%] flex flex-col">
                            <div
                              className={cn(
                                "px-4 py-2.5 text-sm leading-relaxed",
                                message.direction === "outgoing"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background border border-border",
                                message.isFirstInGroup && message.isLastInGroup && "rounded-2xl",
                                message.isFirstInGroup && !message.isLastInGroup && (
                                  message.direction === "outgoing"
                                    ? "rounded-2xl rounded-br-lg"
                                    : "rounded-2xl rounded-bl-lg"
                                ),
                                !message.isFirstInGroup && message.isLastInGroup && (
                                  message.direction === "outgoing"
                                    ? "rounded-2xl rounded-tr-lg"
                                    : "rounded-2xl rounded-tl-lg"
                                ),
                                !message.isFirstInGroup && !message.isLastInGroup && (
                                  message.direction === "outgoing"
                                    ? "rounded-l-2xl rounded-r-lg"
                                    : "rounded-r-2xl rounded-l-lg"
                                )
                              )}
                            >
                              {message.body}
                            </div>
                            {message.isLastInGroup && (
                              <div
                                className={cn(
                                  "mt-1 flex items-center gap-1.5 text-xs text-muted-foreground",
                                  message.direction === "outgoing" ? "justify-end" : "justify-start"
                                )}
                              >
                                <span>{message.time}</span>
                                {message.direction === "outgoing" && message.status && (
                                  <span className="flex items-center">
                                    {message.status === "pending" && (
                                      <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                                    )}
                                    {message.status === "sent" && (
                                      <Check className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                    {message.status === "read" && (
                                      <CheckCheck className="h-3.5 w-3.5 text-primary" />
                                    )}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {message.direction === "outgoing" && (
                            <div className={cn("h-8 w-8 flex-shrink-0", !message.isFirstInGroup && "invisible")}>
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {activeConversation && isTypingActive(activeConversation.otherMember?.last_typing_at) && (
                        <div className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div className="rounded-2xl bg-background border border-border px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                            <span className="flex gap-1 items-center">
                              <span className="h-2 w-2 rounded-full bg-primary/60 motion-safe:animate-bounce [animation-delay:0ms]" />
                              <span className="h-2 w-2 rounded-full bg-primary/60 motion-safe:animate-bounce [animation-delay:150ms]" />
                              <span className="h-2 w-2 rounded-full bg-primary/60 motion-safe:animate-bounce [animation-delay:300ms]" />
                            </span>
                            <span className="ml-1">
                              {t("businessChat.typingIndicator", {
                                name: activeConversation.contact || t("businessChat.partnerFallback"),
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {showScrollButton && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-24 right-8 z-10 h-9 w-9 rounded-full shadow-lg animate-in fade-in-0 zoom-in-95 duration-200"
                      onClick={() => scrollToBottom(true)}
                      aria-label={t("businessChat.aria.scrollToBottom") || "Scroll to bottom"}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="border-t border-border bg-background/90 p-4">
                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => setQuickActionsExpanded(!quickActionsExpanded)}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{t("businessChat.quickActionsLabel") || "Quick actions"}</span>
                        {quickActionsExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {quickActionsExpanded && (
                        <div className="flex flex-wrap gap-2 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                          {quickActions.map((item) => (
                            <Button key={item} variant="outline" size="sm" className="gap-2 h-8 text-xs">
                              <Sparkles className="h-3.5 w-3.5" />
                              {item}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="message-editor" className="sr-only">
                        {t("businessChat.messageLabel")}
                      </Label>
                      <Textarea
                        ref={textareaRef}
                        id="message-editor"
                        value={messageInput}
                        onChange={(event) => {
                          handleMessageChange(event.target.value);
                          autoResizeTextarea();
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={t("businessChat.messagePlaceholder")}
                        className="min-h-[44px] max-h-[160px] resize-none transition-[height] duration-100"
                        disabled={!activeConversation || isSending}
                        rows={1}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={t("businessChat.aria.attachFile")}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={t("businessChat.aria.createTask")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={t("businessChat.aria.scheduleMeeting")}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <span className="hidden sm:inline-flex text-xs text-muted-foreground ml-2">
                            <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd>
                            <span className="mx-1">{t("businessChat.toSend") || "to send"}</span>
                          </span>
                        </div>
                        <Button
                          variant="cta"
                          className="gap-2"
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim() || !activeConversation || isSending}
                        >
                          <Send className="h-4 w-4" />
                          {t("businessChat.sendMessage")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

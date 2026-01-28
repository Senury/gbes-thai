import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Calendar,
  CheckCircle2,
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

type Conversation = {
  id: string;
  company: string;
  contact: string;
  role: string;
  location: string;
  lastMessage: string;
  time: string;
  unread: number;
  tags: string[];
  status: "active" | "offline" | "typing";
  matchScore: string;
  rating: string;
};

type ChatMessage = {
  id: string;
  direction: "incoming" | "outgoing";
  body: string;
  time: string;
  status?: "sent" | "read" | "pending";
};

const conversations: Conversation[] = [
  {
    id: "kyoto-robotics",
    company: "Kyoto Robotics",
    contact: "Aiko Tanaka",
    role: "Head of Partnerships",
    location: "Osaka, JP",
    lastMessage: "We can allocate 500 units for Q2 with priority shipping.",
    time: "2m",
    unread: 2,
    tags: ["Automation", "OEM"],
    status: "typing",
    matchScore: "96%",
    rating: "4.9",
  },
  {
    id: "siam-logistics",
    company: "Siam Logistics",
    contact: "Nattapong R.",
    role: "BD Director",
    location: "Bangkok, TH",
    lastMessage: "Could you share your preferred Incoterms?",
    time: "1h",
    unread: 0,
    tags: ["Freight", "SEA"],
    status: "active",
    matchScore: "92%",
    rating: "4.7",
  },
  {
    id: "luna-packaging",
    company: "Luna Packaging",
    contact: "Marisol V.",
    role: "Sales Lead",
    location: "Monterrey, MX",
    lastMessage: "Our eco line meets EU standards, ready to quote.",
    time: "4h",
    unread: 1,
    tags: ["Packaging", "Eco"],
    status: "offline",
    matchScore: "88%",
    rating: "4.8",
  },
  {
    id: "northwind",
    company: "Northwind Components",
    contact: "Chris Morgan",
    role: "Supply Manager",
    location: "Seattle, US",
    lastMessage: "We reviewed your MOQ and can proceed next week.",
    time: "Yesterday",
    unread: 0,
    tags: ["Electronics", "B2B"],
    status: "offline",
    matchScore: "90%",
    rating: "4.6",
  },
];

const conversationMessages: Record<string, ChatMessage[]> = {
  "kyoto-robotics": [
    {
      id: "kr-1",
      direction: "incoming",
      body: "Thanks for the detailed spec sheet. We can align on the 3-axis configuration.",
      time: "09:12",
    },
    {
      id: "kr-2",
      direction: "outgoing",
      body: "Great. Could you confirm lead times for the first 250 units?",
      time: "09:13",
      status: "read",
    },
    {
      id: "kr-3",
      direction: "incoming",
      body: "Standard lead time is 6 weeks. Expedited batches can be 4 weeks with a 6% surcharge.",
      time: "09:16",
    },
    {
      id: "kr-4",
      direction: "outgoing",
      body: "Understood. Please draft a proposal with both timelines and pricing tiers.",
      time: "09:18",
      status: "sent",
    },
  ],
  "siam-logistics": [
    {
      id: "sl-1",
      direction: "incoming",
      body: "We can offer DDP or FOB depending on the shipment size. Which lane are you targeting?",
      time: "08:34",
    },
    {
      id: "sl-2",
      direction: "outgoing",
      body: "Initially Bangkok → Ho Chi Minh, with a monthly volume of 8-10 containers.",
      time: "08:39",
      status: "read",
    },
  ],
  "luna-packaging": [
    {
      id: "lp-1",
      direction: "incoming",
      body: "Happy to share our compliance documents. Do you need FSC or ISO 14001?",
      time: "06:45",
    },
    {
      id: "lp-2",
      direction: "outgoing",
      body: "Both would be ideal. Please include pricing for 50k and 100k units.",
      time: "06:47",
      status: "sent",
    },
  ],
  northwind: [
    {
      id: "nw-1",
      direction: "incoming",
      body: "We are aligned on the MOQ. Can we finalize the service agreement this week?",
      time: "Yesterday",
    },
    {
      id: "nw-2",
      direction: "outgoing",
      body: "Yes, sending the latest draft now.",
      time: "Yesterday",
      status: "read",
    },
  ],
};

const conversationDetails = {
  "kyoto-robotics": {
    about:
      "Advanced robotics manufacturer focused on precision assembly lines for electronics and medical devices.",
    highlights: [
      "Verified exporter",
      "ISO 9001 certified",
      "Ships to 18 countries",
    ],
    opportunities: ["Joint distribution", "Custom modules", "After-sales support"],
    files: [
      "Pricing_KR_Q2.pdf",
      "Service_Tiers.xlsx",
      "Tech_Specs_3Axis.pdf",
    ],
  },
  "siam-logistics": {
    about:
      "SEA & air freight partner with dedicated compliance teams for ASEAN corridors.",
    highlights: ["Customs brokerage", "Cold chain", "24/7 tracking"],
    opportunities: ["Preferred carrier", "Volume rebates"],
    files: ["Lane_Rates_2026.pdf", "SLA_Template.docx"],
  },
  "luna-packaging": {
    about: "Sustainable packaging supplier with strong EU and APAC distribution.",
    highlights: ["Eco line", "Rapid prototyping", "EU compliance"],
    opportunities: ["Private label", "Bulk discounts"],
    files: ["Compliance_Report.pdf", "Eco_Line_Catalog.pdf"],
  },
  northwind: {
    about: "Electronics component distributor with nationwide warehouse coverage.",
    highlights: ["Fast lead times", "Engineering support"],
    opportunities: ["Exclusive region", "Joint marketing"],
    files: ["Agreement_Draft.pdf"],
  },
};

const statusStyles = {
  active: "bg-emerald-500",
  offline: "bg-slate-400",
  typing: "bg-amber-500",
};

export default function BusinessChat() {
  const { i18n, t } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [activeId]
  );

  const activeMessages = conversationMessages[activeId] ?? [];
  const activeDetails = conversationDetails[activeId as keyof typeof conversationDetails];
  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.unread, 0);
  const quickActions = [
    t("businessChat.quickActions.shareDeck"),
    t("businessChat.quickActions.requestMoq"),
    t("businessChat.quickActions.scheduleCall"),
  ];

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
                                    statusStyles[conversation.status]
                                  )}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-sm truncate">{conversation.company}</p>
                                  <span className="text-xs text-muted-foreground">{conversation.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {conversation.contact} · {conversation.role}
                                </p>
                                <p className="text-sm text-foreground/80 mt-1 line-clamp-2">
                                  {conversation.lastMessage}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  {conversation.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="bg-secondary/60 text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {conversation.unread > 0 && (
                                    <Badge className="bg-primary text-primary-foreground text-xs">
                                      {t("businessChat.newBadge", { count: conversation.unread })}
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
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {t("businessChat.newBadge", { count: unreadTotal })}
                      </Badge>
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
                          {activeConversation?.company.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{activeConversation?.company}</CardTitle>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activeConversation?.contact} · {activeConversation?.role}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {activeConversation?.location}
                        </p>
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
                                    {t("businessChat.averageRating", { rating: activeConversation?.rating ?? "--" })}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-border bg-background/80 p-4">
                                <p className="text-sm text-muted-foreground mb-2">{t("businessChat.about")}</p>
                                <p className="text-sm leading-relaxed">
                                  {activeDetails?.about ?? t("businessChat.partnerDetailsFallback")}
                                </p>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <Star className="h-4 w-4 text-primary" />
                                  {t("businessChat.highlights")}
                                </div>
                                <div className="space-y-2">
                                  {activeDetails?.highlights?.map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <Tag className="h-4 w-4 text-primary" />
                                  {t("businessChat.opportunities")}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {activeDetails?.opportunities?.map((item) => (
                                    <Badge key={item} variant="secondary" className="bg-secondary/70">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-5">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <FileText className="h-4 w-4 text-primary" />
                                  {t("businessChat.sharedFiles")}
                                </div>
                                <div className="space-y-2">
                                  {activeDetails?.files?.map((file) => (
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

                <div className="flex flex-1 min-h-0 flex-col">
                  <ScrollArea className="flex-1 px-6">
                    <div className="py-6 space-y-5">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Separator className="flex-1" />
                        {t("businessChat.today")}
                        <Separator className="flex-1" />
                      </div>

                      {activeMessages.length === 0 && (
                        <div className="rounded-2xl border border-border bg-background/80 px-4 py-5 text-center text-muted-foreground text-sm">
                          {t("businessChat.emptyPrompt")}
                        </div>
                      )}

                      {activeMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            message.direction === "outgoing" ? "justify-end" : "justify-start"
                          )}
                        >
                          {message.direction === "incoming" && (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div className="max-w-[72%]">
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                message.direction === "outgoing"
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-background border border-border rounded-bl-md"
                              )}
                            >
                              {message.body}
                            </div>
                            <div
                              className={cn(
                                "mt-1 flex items-center gap-2 text-xs text-muted-foreground",
                                message.direction === "outgoing" ? "justify-end" : "justify-start"
                              )}
                            >
                              <span>{message.time}</span>
                              {message.direction === "outgoing" && message.status && (
                                <span className="flex items-center gap-1">
                                  {message.status === "pending" && <Clock className="h-3 w-3" />}
                                  {message.status === "sent" && <CheckCircle2 className="h-3 w-3" />}
                                  {message.status === "read" && (
                                    <CheckCircle2 className="h-3 w-3 text-primary" />
                                  )}
                                  {message.status}
                                </span>
                              )}
                            </div>
                          </div>
                          {message.direction === "outgoing" && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}

                      {activeConversation?.status === "typing" && (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                        <div className="rounded-2xl bg-background border border-border px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                          <span className="flex gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 motion-safe:animate-pulse" />
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 motion-safe:animate-pulse" />
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 motion-safe:animate-pulse" />
                          </span>
                          {t("businessChat.typingIndicator", {
                            name: activeConversation?.contact ?? t("businessChat.partnerFallback"),
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="border-t border-border bg-background/90 p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickActions.map((item) => (
                      <Button key={item} variant="secondary" size="sm" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        {item}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="message-editor" className="sr-only">
                      {t("businessChat.messageLabel")}
                    </Label>
                    <Textarea
                      id="message-editor"
                      placeholder={t("businessChat.messagePlaceholder")}
                      className="min-h-[90px] resize-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" aria-label={t("businessChat.aria.attachFile")}>
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={t("businessChat.aria.createTask")}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label={t("businessChat.aria.scheduleMeeting")}>
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="cta" className="gap-2">
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

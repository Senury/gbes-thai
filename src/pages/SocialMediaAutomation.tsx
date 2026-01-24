import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, X, Facebook, Instagram, Linkedin, Send, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import PageShell from "@/components/PageShell";

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
}

const SocialMediaAutomation = () => {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === "ja" ? "ja" : i18n.language === "th" ? "th" : "en";
  const [postContent, setPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [zapierWebhook, setZapierWebhook] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const { toast } = useToast();

  const platforms = [
    { id: "twitter", name: "X", icon: X, color: "text-black dark:text-white" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
  ];

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleTwitterPost = async () => {
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      // This would call your Twitter edge function
      const fetchPromise = fetch('/api/twitter-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweet: postContent })
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      if (response.ok) {
        toast({
          title: t("social.toasts.successTitle"),
          description: t("social.toasts.twitterSuccess"),
        });
      } else {
        throw new Error('Twitter API error');
      }
    } catch (error) {
      console.error('Twitter post error:', error);
      toast({
        title: t("social.toasts.errorTitle"),
        description: t("social.toasts.twitterError"),
        variant: "destructive",
      });
    }
  };

  const handleZapierTrigger = async () => {
    if (!zapierWebhook) {
      toast({
        title: t("social.toasts.errorTitle"),
        description: t("social.toasts.webhookRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a timeout promise for Zapier requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Zapier request timeout')), 15000)
      );

      const fetchPromise = fetch(zapierWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          content: postContent,
          platforms: selectedPlatforms,
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });

      await Promise.race([fetchPromise, timeoutPromise]);

      toast({
        title: t("social.toasts.zapierSentTitle"),
        description: t("social.toasts.zapierSentDescription"),
      });
    } catch (error) {
      console.error("Zapier webhook error:", error);
      toast({
        title: t("social.toasts.errorTitle"),
        description: error.message.includes('timeout') ? 
          t("social.toasts.zapierTimeout") : 
          t("social.toasts.zapierError"),
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!postContent.trim()) {
      toast({
        title: t("social.toasts.errorTitle"),
        description: t("social.toasts.contentRequired"),
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: t("social.toasts.errorTitle"),
        description: t("social.toasts.platformRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Handle Twitter posting if selected
      if (selectedPlatforms.includes("twitter")) {
        await handleTwitterPost();
      }

      // Handle other platforms via Zapier if webhook is provided
      if (selectedPlatforms.some(p => p !== "twitter") && zapierWebhook) {
        await handleZapierTrigger();
      }

      // Add to posts list
      const newPost: SocialPost = {
        id: Date.now().toString(),
        content: postContent,
        platforms: selectedPlatforms,
        scheduledTime: scheduleType === "schedule" ? `${scheduledDate} ${scheduledTime}` : undefined,
        status: scheduleType === "now" ? "published" : "scheduled",
        createdAt: new Date().toISOString(),
      };

      setPosts(prev => [newPost, ...prev]);
      
      // Reset form
      setPostContent("");
      setSelectedPlatforms([]);
      
      toast({
        title: t("social.toasts.successTitle"),
        description: scheduleType === "now" ? t("social.toasts.posted") : t("social.toasts.scheduled"),
      });
    } catch (error) {
      console.error("Post submission error:", error);
      toast({
        title: t("social.toasts.errorTitle"),
        description: t("social.toasts.postError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <PageShell className="container mx-auto px-4 py-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <section className="rounded-3xl border border-border bg-hero-surface px-6 py-10 md:px-10 md:py-12 mb-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs text-foreground mb-4">
                  <Zap className="h-4 w-4 text-primary" />
                  {t("social.heroBadge")}
                </div>
                <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
                  {t("social.title")}
                </h1>
                <p className="text-base md:text-lg text-muted-foreground">
                  {t("social.subtitle")}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                  <div className="text-xs">{t("social.selectedLabel")}</div>
                  <div className="text-lg font-semibold text-foreground">{selectedPlatforms.length} {t("social.countUnit")}</div>
                </div>
                <div className="rounded-2xl border border-border bg-background/80 px-4 py-3">
                  <div className="text-xs">{t("social.createdLabel")}</div>
                  <div className="text-lg font-semibold text-foreground">{posts.length} {t("social.postsUnit")}</div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
            {/* Post Creation */}
            <Card className="border-border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5" />
                  {t("social.newPostTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="content">{t("social.contentLabel")}</Label>
                  <Textarea
                    id="content"
                    placeholder={t("social.contentPlaceholder")}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("social.characterCount", { count: postContent.length })}
                  </p>
                </div>

                <div>
                  <Label>{t("social.platformLabel")}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatforms.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => handlePlatformToggle(platform.id)}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-background/70 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${platform.color}`} />
                            {platform.name}
                          </span>
                          <Checkbox
                            id={platform.id}
                            checked={isSelected}
                            onCheckedChange={() => handlePlatformToggle(platform.id)}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t("social.scheduleLabel")}</Label>
                    <Select value={scheduleType} onValueChange={setScheduleType}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">{t("social.scheduleNow")}</SelectItem>
                        <SelectItem value="schedule">{t("social.scheduleLater")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {scheduleType === "schedule" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="date">{t("social.dateLabel")}</Label>
                        <Input
                          id="date"
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">{t("social.timeLabel")}</Label>
                        <Input
                          id="time"
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  variant="cta"
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? t("social.posting") : scheduleType === "now" ? t("social.postNow") : t("social.schedule")}
                </Button>
              </CardContent>
            </Card>

            {/* Zapier Integration */}
            <Card className="border-border bg-card/80 h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5" />
                  {t("social.zapierTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label htmlFor="webhook">{t("social.zapierWebhookLabel")}</Label>
                  <Input
                    id="webhook"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={zapierWebhook}
                    onChange={(e) => setZapierWebhook(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("social.zapierNote")}
                  </p>
                </div>

                <div className="bg-muted/40 p-4 rounded-xl border border-border">
                  <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{t("social.zapierStepsTitle")}</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>{t("social.zapierSteps.0")}</li>
                    <li>{t("social.zapierSteps.1")}</li>
                    <li>{t("social.zapierSteps.2")}</li>
                    <li>{t("social.zapierSteps.3")}</li>
                    <li>{t("social.zapierSteps.4")}</li>
                    <li>{t("social.zapierSteps.5")}</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Posts History */}
          {posts.length > 0 && (
            <Card className="mt-8 border-border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  {t("social.historyTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-border rounded-xl p-4 bg-background/70">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString(localePrefix === "ja" ? "ja-JP" : localePrefix === "th" ? "th-TH" : "en-US")}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status === 'published' ? t("social.status.published") :
                           post.status === 'scheduled' ? t("social.status.scheduled") : t("social.status.draft")}
                        </span>
                      </div>
                      <p className="mb-3 text-sm">{post.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.platforms.map((platformId) => {
                          const platform = platforms.find(p => p.id === platformId);
                          if (!platform) return null;
                          const Icon = platform.icon;
                          return (
                            <div key={platformId} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Icon className={`h-4 w-4 ${platform.color}`} />
                              {platform.name}
                            </div>
                          );
                        })}
                      </div>
                      {post.scheduledTime && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {t("social.scheduledLabel", { time: post.scheduledTime })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageShell>
      <Footer />
    </div>
  );
};

export default SocialMediaAutomation;

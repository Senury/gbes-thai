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

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime?: string;
  status: 'draft' | 'scheduled' | 'published';
  createdAt: string;
}

const SocialMediaAutomation = () => {
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
          title: "成功",
          description: "Xに投稿しました",
        });
      } else {
        throw new Error('Twitter API error');
      }
    } catch (error) {
      console.error('Twitter post error:', error);
      toast({
        title: "エラー",
        description: "X投稿に失敗しました（API未実装またはタイムアウト）",
        variant: "destructive",
      });
    }
  };

  const handleZapierTrigger = async () => {
    if (!zapierWebhook) {
      toast({
        title: "エラー",
        description: "ZapierのWebhook URLを入力してください",
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
        title: "リクエスト送信完了",
        description: "Zapierにリクエストをしました。Zapの履歴をご確認ください。",
      });
    } catch (error) {
      console.error("Zapier webhook error:", error);
      toast({
        title: "エラー",
        description: error.message.includes('timeout') ? 
          "Zapierリクエストがタイムアウトしました" : 
          "Zapierとの連携に失敗しました",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!postContent.trim()) {
      toast({
        title: "エラー",
        description: "投稿内容を入力してください",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "エラー",
        description: "投稿するプラットフォームを選択してください",
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
        title: "成功",
        description: scheduleType === "now" ? "投稿しました" : "投稿をスケジュールしました",
      });
    } catch (error) {
      console.error("Post submission error:", error);
      toast({
        title: "エラー",
        description: "投稿に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              ソーシャルメディア自動化
            </h1>
            <p className="text-xl text-muted-foreground">
              企業情報を効率的に複数のソーシャルメディアに配信
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Post Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  新規投稿作成
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">投稿内容</Label>
                  <Textarea
                    id="content"
                    placeholder="投稿内容を入力してください..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {postContent.length}/280文字
                  </p>
                </div>

                <div>
                  <Label>投稿プラットフォーム</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <div key={platform.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform.id}
                            checked={selectedPlatforms.includes(platform.id)}
                            onCheckedChange={() => handlePlatformToggle(platform.id)}
                          />
                          <Label 
                            htmlFor={platform.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Icon className={`h-4 w-4 ${platform.color}`} />
                            {platform.name}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>投稿タイミング</Label>
                  <Select value={scheduleType} onValueChange={setScheduleType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">今すぐ投稿</SelectItem>
                      <SelectItem value="schedule">日時を指定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduleType === "schedule" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="date">日付</Label>
                      <Input
                        id="date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">時刻</Label>
                      <Input
                        id="time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "投稿中..." : scheduleType === "now" ? "投稿する" : "スケジュール"}
                </Button>
              </CardContent>
            </Card>

            {/* Zapier Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Zapier連携設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="webhook">Zapier Webhook URL</Label>
                  <Input
                    id="webhook"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={zapierWebhook}
                    onChange={(e) => setZapierWebhook(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Facebook、Instagram、LinkedInへの投稿にはZapier連携が必要です
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Zapier設定手順:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Zapierアカウントを作成</li>
                    <li>新しいZapを作成</li>
                    <li>トリガーに「Webhooks by Zapier」を選択</li>
                    <li>「Catch Hook」を選択</li>
                    <li>提供されたWebhook URLをここに入力</li>
                    <li>アクションで各SNSプラットフォームを設定</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Posts History */}
          {posts.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  投稿履歴
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString('ja-JP')}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status === 'published' ? '投稿済み' :
                           post.status === 'scheduled' ? 'スケジュール済み' : '下書き'}
                        </span>
                      </div>
                      <p className="mb-2">{post.content}</p>
                      <div className="flex gap-2">
                        {post.platforms.map((platformId) => {
                          const platform = platforms.find(p => p.id === platformId);
                          if (!platform) return null;
                          const Icon = platform.icon;
                          return (
                            <div key={platformId} className="flex items-center gap-1 text-sm">
                              <Icon className={`h-4 w-4 ${platform.color}`} />
                              {platform.name}
                            </div>
                          );
                        })}
                      </div>
                      {post.scheduledTime && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4 inline mr-1" />
                          予定: {post.scheduledTime}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SocialMediaAutomation;
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
import Navigation from "@/components/en/Navigation";

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
          title: "Success",
          description: "Posted to X successfully",
        });
      } else {
        throw new Error('Twitter API error');
      }
    } catch (error) {
      console.error('Twitter post error:', error);
      toast({
        title: "Error",
        description: "Failed to post to X (API not implemented or timeout)",
        variant: "destructive",
      });
    }
  };

  const handleZapierTrigger = async () => {
    if (!zapierWebhook) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
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
        title: "Request Sent",
        description: "The request was sent to Zapier. Please check your Zap's history to confirm it was triggered.",
      });
    } catch (error) {
      console.error("Zapier webhook error:", error);
      toast({
        title: "Error",
        description: error.message.includes('timeout') ? 
          "Zapier request timed out" : 
          "Failed to trigger the Zapier webhook",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter post content",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
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
        title: "Success",
        description: scheduleType === "now" ? "Post published successfully" : "Post scheduled successfully",
      });
    } catch (error) {
      console.error("Post submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit post",
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
              Social Media Automation
            </h1>
            <p className="text-xl text-muted-foreground">
              Efficiently distribute company information across multiple social media platforms
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Post Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Create New Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">Post Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your post content..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {postContent.length}/280 characters
                  </p>
                </div>

                <div>
                  <Label>Select Platforms</Label>
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
                  <Label>Publishing Schedule</Label>
                  <Select value={scheduleType} onValueChange={setScheduleType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Post Now</SelectItem>
                      <SelectItem value="schedule">Schedule for Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduleType === "schedule" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
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
                  {isLoading ? "Publishing..." : scheduleType === "now" ? "Publish Now" : "Schedule Post"}
                </Button>
              </CardContent>
            </Card>

            {/* Zapier Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Zapier Integration
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
                    Required for posting to Facebook, Instagram, and LinkedIn
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Zapier Setup Instructions:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Create a Zapier account</li>
                    <li>Create a new Zap</li>
                    <li>Select "Webhooks by Zapier" as trigger</li>
                    <li>Choose "Catch Hook" option</li>
                    <li>Copy the provided webhook URL here</li>
                    <li>Set up actions for each social media platform</li>
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
                  Post History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status === 'published' ? 'Published' :
                           post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
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
                          Scheduled: {post.scheduledTime}
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
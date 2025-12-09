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
import Navigation from "@/components/th/Navigation";

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

  const handleSubmit = async () => {
    if (!postContent.trim()) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกเนื้อหาโพสต์",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณาเลือกอย่างน้อยหนึ่งแพลตฟอร์ม",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newPost: SocialPost = {
        id: Date.now().toString(),
        content: postContent,
        platforms: selectedPlatforms,
        scheduledTime: scheduleType === "schedule" ? `${scheduledDate} ${scheduledTime}` : undefined,
        status: scheduleType === "now" ? "published" : "scheduled",
        createdAt: new Date().toISOString(),
      };

      setPosts(prev => [newPost, ...prev]);
      
      setPostContent("");
      setSelectedPlatforms([]);
      
      toast({
        title: "สำเร็จ",
        description: scheduleType === "now" ? "เผยแพร่โพสต์เรียบร้อย" : "ตั้งเวลาโพสต์เรียบร้อย",
      });
    } catch (error) {
      console.error("Post submission error:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถส่งโพสต์ได้",
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
              ระบบอัตโนมัติโซเชียลมีเดีย
            </h1>
            <p className="text-xl text-muted-foreground">
              กระจายข้อมูลบริษัทไปยังหลายแพลตฟอร์มโซเชียลมีเดียอย่างมีประสิทธิภาพ
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Post Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  สร้างโพสต์ใหม่
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="content">เนื้อหาโพสต์</Label>
                  <Textarea
                    id="content"
                    placeholder="กรอกเนื้อหาโพสต์ของคุณ..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {postContent.length}/280 ตัวอักษร
                  </p>
                </div>

                <div>
                  <Label>เลือกแพลตฟอร์ม</Label>
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
                  <Label>กำหนดการเผยแพร่</Label>
                  <Select value={scheduleType} onValueChange={setScheduleType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">โพสต์ทันที</SelectItem>
                      <SelectItem value="schedule">ตั้งเวลาไว้</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {scheduleType === "schedule" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="date">วันที่</Label>
                      <Input
                        id="date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">เวลา</Label>
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
                  {isLoading ? "กำลังเผยแพร่..." : scheduleType === "now" ? "เผยแพร่ทันที" : "ตั้งเวลาโพสต์"}
                </Button>
              </CardContent>
            </Card>

            {/* Zapier Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  การเชื่อมต่อ Zapier
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
                    จำเป็นสำหรับการโพสต์ไปยัง Facebook, Instagram และ LinkedIn
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">คำแนะนำการตั้งค่า Zapier:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>สร้างบัญชี Zapier</li>
                    <li>สร้าง Zap ใหม่</li>
                    <li>เลือก "Webhooks by Zapier" เป็นทริกเกอร์</li>
                    <li>เลือกตัวเลือก "Catch Hook"</li>
                    <li>คัดลอก webhook URL ที่ได้รับมาวางที่นี่</li>
                    <li>ตั้งค่าการดำเนินการสำหรับแต่ละแพลตฟอร์มโซเชียลมีเดีย</li>
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
                  ประวัติโพสต์
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleString('th-TH')}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {post.status === 'published' ? 'เผยแพร่แล้ว' :
                           post.status === 'scheduled' ? 'ตั้งเวลาไว้' : 'ฉบับร่าง'}
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
                          ตั้งเวลา: {post.scheduledTime}
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

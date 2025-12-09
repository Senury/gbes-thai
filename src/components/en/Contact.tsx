import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      info: "support@gbes.com",
      description: "Send us an email anytime"
    },
    {
      icon: Phone,
      title: "Phone",
      info: "+81-3-1234-5678",
      description: "Mon-Fri from 9am to 6pm JST"
    },
    {
      icon: MapPin,
      title: "Office",
      info: "Tokyo, Japan",
      description: "Visit our headquarters"
    }
  ];

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to expand your business globally? Contact us today and let's discuss how GBES can help you succeed in international markets.
          </p>
          <p className="text-sm text-primary/70 mt-4 max-w-2xl mx-auto">
            *Please note: You must be logged in and registered to use the contact features.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    First Name
                  </label>
                  <Input id="firstName" placeholder="Your first name" />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    Last Name
                  </label>
                  <Input id="lastName" placeholder="Your last name" />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input id="email" type="email" placeholder="your.email@example.com" />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your business and international expansion goals..." 
                  rows={6}
                />
              </div>
              
              <Button size="lg" className="w-full">
                Send Message
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            {contactInfo.map((contact, index) => (
              <Card key={index} className="bg-card border-border hover:bg-card/80 hover:border-primary/20 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <contact.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{contact.title}</CardTitle>
                      <p className="text-foreground font-medium">{contact.info}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{contact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
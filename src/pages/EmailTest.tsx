import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import TestEmailFunctions from "@/components/TestEmailFunctions";

const EmailTest = () => {
  console.log('EmailTest component is rendering');
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Email System Test
            </h1>
            <p className="text-xl text-muted-foreground">
              Test all email notifications to ensure they're working correctly
            </p>
          </div>
          
          <TestEmailFunctions />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmailTest;
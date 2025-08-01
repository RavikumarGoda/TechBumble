
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Linkedin, Instagram, Github } from 'lucide-react';

interface AboutProps {
  onClose: () => void;
}

const About = ({ onClose }: AboutProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gray-900 border-gray-700 w-full max-w-md mx-4 relative">
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-white text-xl">About TechBumble</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Developer Info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Ravi Kumar Reddy Goda</h3>
            <p className="text-gray-400 text-sm">Computer Science Undergraduate</p>
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-4">
            <a
              href="https://www.linkedin.com/in/ravi-kumar-reddy-goda/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/_ravi_.kumar_/?next=%2F"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-400 hover:text-pink-300 transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://github.com/RavikumarGoda"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>
          
          {/* App Features */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-center">TechBumble Features</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-tech-electric rounded-full mt-2 flex-shrink-0"></div>
                <p>AI-powered question generation tailored to your preferred topics and difficulty levels</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-tech-electric rounded-full mt-2 flex-shrink-0"></div>
                <p>Interactive swipe-based learning experience for DSA, System Design, and HR questions</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-tech-electric rounded-full mt-2 flex-shrink-0"></div>
                <p>Smart explanations and code solutions generated on-demand for better understanding</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-tech-electric rounded-full mt-2 flex-shrink-0"></div>
                <p>Save your favorite questions and track your learning progress</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-tech-electric rounded-full mt-2 flex-shrink-0"></div>
                <p>Company-specific question filtering for targeted interview preparation</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button
              onClick={onClose}
              className="bg-tech-electric hover:bg-tech-electric/90 text-black font-semibold px-6 py-2"
            >
              Got it!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;

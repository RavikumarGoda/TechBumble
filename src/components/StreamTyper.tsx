import React, { useState, useEffect, useRef } from 'react';

interface StreamTyperProps {
  text: string;
  speed?: number; // ms per character
  className?: string;
}

const StreamTyper: React.FC<StreamTyperProps> = ({ text, speed = 10, className = '' }) => {
  const [displayedText, setDisplayedText] = useState('');
  const textRef = useRef(text);
  const displayedRef = useRef('');
  const [isTyping, setIsTyping] = useState(false);

  // When text updates, we just record the new target text.
  useEffect(() => {
    textRef.current = text;
    // If the target text is longer than what we currently display, ensure we are typing.
    if (text.length > displayedRef.current.length && !isTyping) {
      setIsTyping(true);
    }
  }, [text, isTyping]);

  useEffect(() => {
    if (!isTyping) return;

    const intervalId = setInterval(() => {
      const currentLen = displayedRef.current.length;
      const targetLen = textRef.current.length;

      if (currentLen < targetLen) {
        // Add a chunk of characters if we're falling too far behind to keep it smooth but fast
        const diff = targetLen - currentLen;
        const charsToAdd = diff > 50 ? 3 : diff > 20 ? 2 : 1; // Speed up if large chunk arrives
        
        const nextChars = textRef.current.substring(currentLen, currentLen + charsToAdd);
        displayedRef.current += nextChars;
        setDisplayedText(displayedRef.current);
      } else {
        setIsTyping(false);
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [isTyping, speed]);

  // Reset if text clears completely (e.g. new explanation requested)
  useEffect(() => {
    if (text === '') {
      setDisplayedText('');
      displayedRef.current = '';
      setIsTyping(false);
    }
  }, [text]);

  return (
    <div className={className}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-tech-electric animate-pulse align-middle" />
      )}
    </div>
  );
};

export default StreamTyper;

import { Dot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="justify-left flex space-x-1">
      <div className="rounded-full bg-muted p-1 flex">
        <div className="flex -space-x-2.5">
          <Dot className="h-5 w-5 animate-typing-dot-bounce text-primary" />
          <Dot className="h-5 w-5 animate-typing-dot-bounce [animation-delay:90ms] text-primary" />
          <Dot className="h-5 w-5 animate-typing-dot-bounce [animation-delay:180ms] text-primary" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

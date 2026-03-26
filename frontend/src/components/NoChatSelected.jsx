import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageSquare, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const NoChatSelected = () => {
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hi! Ask me anything and I will reply with a structured answer.",
      structuredOutput: null,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const historyEndRef = useRef(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  const handleAskAI = async (event) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      toast.error("Please enter a prompt first");
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmedPrompt,
      structuredOutput: null,
    };

    setHistory((prev) => [...prev, userMessage]);
    setPrompt("");

    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/ai/chat", {
        prompt: trimmedPrompt,
        provider: "groq",
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.data.reply,
        structuredOutput: response.data.structuredOutput || null,
      };

      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to contact AI service. Try again later.";
      toast.error(message);
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: "I could not process that request right now.",
          structuredOutput: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptKeyDown = (event) => {
    if (event.nativeEvent?.isComposing) return;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && prompt.trim()) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  };

  return (
    <div className="w-full h-full bg-base-100/50 p-3 md:p-5">
      <div className="h-full rounded-2xl border border-base-300 bg-base-100 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-base-300 flex items-center gap-2">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Maitri</h3>
            <p className="text-xs text-base-content/60">Powered by Llama</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content"
                }`}
              >
                <div className="text-[11px] uppercase tracking-wide opacity-70 mb-1">
                  {message.role === "user" ? "You" : "AI"}
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {message.role === "assistant" && message.structuredOutput && (
                  <div className="mt-3 pt-3 border-t border-base-300/60 space-y-2">
                    {message.structuredOutput.highlights?.length > 0 && (
                      <ul className="text-xs space-y-1 list-disc pl-4">
                        {message.structuredOutput.highlights.map(
                          (item, index) => (
                            <li key={`${message.id}-h-${index}`}>{item}</li>
                          ),
                        )}
                      </ul>
                    )}
                    {message.structuredOutput.nextStep && (
                      <p className="text-xs opacity-80">
                        <span className="font-semibold">Next:</span>{" "}
                        {message.structuredOutput.nextStep}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-base-200 rounded-2xl p-3 flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={historyEndRef} />
        </div>

        <form
          onSubmit={handleAskAI}
          className="p-3 md:p-4 border-t border-base-300"
        >
          <div className="flex gap-2 items-end">
            <textarea
              className="textarea textarea-bordered w-full min-h-20 max-h-36"
              placeholder="Type your prompt here..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handlePromptKeyDown}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Bot className="size-4" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-xs text-base-content/60 mt-2">
            Responses are structured with answer, highlights, and a next step.
          </p>
        </form>
      </div>
    </div>
  );
};

export default NoChatSelected;

import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const escapeTemplateBraces = (value) =>
  value.replaceAll("{", "{{").replaceAll("}", "}}");

const buildGroqModel = (modelName) =>
  new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: modelName || process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxRetries: 2,
  });

const fewShotExamples = [
  {
    input: "Give me 3 quick tips to improve coding productivity.",
    output: {
      answer:
        "Use short focused sprints, automate repetitive setup, and review your work in small increments.",
      highlights: [
        "Work in 25-45 minute focused blocks",
        "Automate linting/formatting/test commands",
        "Commit small changes frequently",
      ],
      nextStep:
        "Pick one repetitive task today and automate it with an npm script.",
    },
  },
  {
    input: "Explain JWT in very simple words.",
    output: {
      answer:
        "JWT is a signed token that proves who you are after login, so the server can trust your requests.",
      highlights: [
        "Created after successful login",
        "Sent by client on later requests",
        "Server verifies signature before allowing access",
      ],
      nextStep: "Use HTTP-only cookies for storing JWT in web apps.",
    },
  },
];

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    [
      "You are a helpful AI assistant for a chat application.",
      "Respond ONLY as valid JSON with this exact schema:",
      escapeTemplateBraces(
        '{"answer":"string","highlights":["string"],"nextStep":"string"}',
      ),
      "Rules:",
      "- Keep answer concise and clear.",
      "- highlights should contain 2 to 4 bullet-like strings.",
      "- nextStep should be one practical action.",
      "- Do not include markdown or code fences.",
    ].join("\n"),
  ],
  ...fewShotExamples.flatMap((example) => [
    ["human", `User prompt: ${example.input}`],
    ["ai", escapeTemplateBraces(JSON.stringify(example.output))],
  ]),
  ["human", "User prompt: {userPrompt}"],
]);

const parseStructuredOutput = (rawText) => {
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      answer: parsed.answer || "",
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      nextStep: parsed.nextStep || "",
    };
  } catch {
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
        return {
          answer: parsed.answer || "",
          highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
          nextStep: parsed.nextStep || "",
        };
      } catch {
        return {
          answer: rawText,
          highlights: [],
          nextStep: "",
        };
      }
    }

    return {
      answer: rawText,
      highlights: [],
      nextStep: "",
    };
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { prompt, model } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res
        .status(500)
        .json({ message: "GROQ_API_KEY is not configured" });
    }

    const llm = buildGroqModel(model);
    const messages = await promptTemplate.formatMessages({
      userPrompt: prompt.trim(),
    });

    const aiMsg = await llm.invoke(messages);
    const rawContent =
      typeof aiMsg.content === "string"
        ? aiMsg.content
        : JSON.stringify(aiMsg.content);
    const structuredOutput = parseStructuredOutput(rawContent);

    return res.status(200).json({
      reply: structuredOutput.answer,
      structuredOutput,
      provider: "groq",
    });
  } catch (error) {
    console.log("Error in chatWithAI controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

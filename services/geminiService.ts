import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-pro";

const callGemini = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            return `Error: ${error.message}`;
        }
        return "An unknown error occurred while contacting the AI.";
    }
};

export const generateConfig = (userPrompt: string): Promise<string> => {
    const prompt = `You are an expert Cisco DevNetOps engineer. Your task is to generate a complete 'show running-config' output for a Cisco IOS device based on the user's request. The output should be syntactically correct and ready to be used. Only output the configuration text inside a single code block. Do not add any explanation before or after the code block.

User Request:
---
${userPrompt}
---`;
    return callGemini(prompt);
};

export const analyzeConfig = (config: string): Promise<string> => {
    const prompt = `You are an expert Cisco DevNetOps engineer specializing in network security and best practices. Analyze the following Cisco IOS 'running-config'. Provide a clear, concise summary of its purpose. Then, identify any potential security vulnerabilities, misconfigurations, or areas for improvement. Format your analysis using Markdown for readability with headings for 'Summary', 'Security Analysis', and 'Recommendations'.

Configuration to Analyze:
---
${config}
---`;
    return callGemini(prompt);
};

export const diffConfigs = (configA: string, configB: string): Promise<string> => {
    const prompt = `You are an expert Cisco DevNetOps engineer. Compare the two following Cisco IOS configurations ('Old Config' and 'New Config'). Instead of a line-by-line diff, provide a high-level, human-readable summary of the changes. Categorize the changes into 'Added', 'Removed', and 'Modified' sections using Markdown headings. Explain the functional impact of these changes.

Old Config:
---
${configA}
---

New Config:
---
${configB}
---`;
    return callGemini(prompt);
};

export const translateCommand = (command: string): Promise<string> => {
    const prompt = `You are an expert Cisco DevNetOps engineer. Translate the user's natural language request into the specific, correct Cisco IOS commands required to achieve the task. Output only the commands inside a single code block. Do not include any explanations or surrounding text. Assume the user is already in configuration mode (\`conf t\`).

User Request:
---
${command}
---`;
    return callGemini(prompt);
};
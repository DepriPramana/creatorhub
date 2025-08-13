import { GoogleGenAI, Type } from "@google/genai";

// Pesan kesalahan spesifik yang dapat diperiksa oleh UI.
export const API_KEY_ERROR_MESSAGE = "Kunci API Google AI tidak dikonfigurasi. Harap atur kunci Anda di menu pengaturan (ikon roda gigi).";

/**
 * Mendapatkan klien Gemini AI.
 * Ini membaca kunci API dari localStorage.
 * @throws {Error} jika kunci API tidak ditemukan.
 */
const getAiClient = () => {
  const apiKey = localStorage.getItem('google-api-key');
  
  if (!apiKey) {
    throw new Error(API_KEY_ERROR_MESSAGE);
  }
  return new GoogleGenAI({ apiKey });
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  const data = await base64EncodedDataPromise;
  return {
    inlineData: { data, mimeType: file.type },
  };
};


// --- Code Explainer ---
const codeExplainerSystemInstruction = `You are an expert code reviewer and teacher. Your goal is to explain code snippets in a way that is easy for other developers to understand. 
- Use clear and concise language.
- Break down complex parts into simple steps.
- Use markdown for formatting, including bullet points for lists and backticks for inline code. Do not use markdown code blocks (\`\`\`) as the entire output will be rendered in a pre-formatted block.`;

export const explainCodeStream = async (
  code: string,
  onChunk: (chunk: string) => void
) => {
  const ai = getAiClient(); // Akan melempar jika tidak ada kunci
  const contents = `Please explain the following code snippet:\n\n${code}`;
    
  const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: codeExplainerSystemInstruction,
      }
  });

  for await (const chunk of response) {
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
};

// --- Prompt Generator ---
export interface PromptGenerationParams {
  concept: string;
  file?: File;
  style: string;
  aspectRatio: string;
  duration: string;
}

export const generatePrompts = async (params: PromptGenerationParams): Promise<{ imagePrompt: string; videoPrompt: string; }> => {
  const ai = getAiClient(); // Akan melempar jika tidak ada kunci
  const { concept, file, style, aspectRatio, duration } = params;
  
  const promptGeneratorSystemInstruction = `You are a world-class prompt engineer for generative AI models. Your task is to take a user's simple concept OR a provided image and expand it into two separate, but related, highly detailed and effective prompts: one for image generation and one for video generation.

**Core Relationship:**
The video prompt's primary purpose is to **animate the static scene** created by the image prompt. First, conceptualize the detailed image prompt. Then, create a video prompt that brings that exact scene to life with movement, action, and transitions, while maintaining the same core subject, environment, and style. The video prompt should explicitly state its goal is to animate the image.

**Source of Inspiration:**
- If an image is provided, base the prompts on the image's content, style, and composition. The user's text concept should be ignored.
- If only a text concept is provided, use that as the basis for the prompts.

You MUST incorporate the user's specific requirements for style, aspect ratio, and duration into the final prompts.

**Image Prompt Rules:**
-   The image prompt will define the static scene.
-   Format as a single, dense paragraph.
-   Be highly descriptive, focusing on visual details, lighting, and composition.
-   Incorporate the specified Art Style and Image Aspect Ratio.

**Video Prompt Rules:**
-   This prompt will animate the scene from the image prompt.
-   Use Markdown for formatting: use double asterisks for bolding (**text**) and a single asterisk followed by a space for unordered list items (* item).
-   Structure the prompt with bolded section titles on new lines (e.g., **Subject:**, **Action:**, **Style & Mood:**).
-   Use bullet points for sub-details where appropriate. Do not nest bullet points.

**Output Format:**
-   You MUST return the output as a single, valid JSON object with two string keys: "imagePrompt" and "videoPrompt".
-   Do not include any other text, explanations, or markdown formatting outside of the JSON object itself.`;

  let userPrompt: string;
  let contents: any; // Can be string or object

  if (file) {
      const imagePart = await fileToGenerativePart(file);
      userPrompt = `Analyze the provided image and generate prompts based on the following details:
      - Art Style: "${style}"
      - Image Aspect Ratio: "${aspectRatio}"
      - Video Duration: "${duration} seconds"`;
      contents = { parts: [imagePart, { text: userPrompt }] };
  } else {
      userPrompt = `Generate prompts based on the following details:
      - Concept: "${concept}"
      - Art Style: "${style}"
      - Image Aspect Ratio: "${aspectRatio}"
      - Video Duration: "${duration} seconds"`;
      contents = userPrompt;
  }


  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      systemInstruction: promptGeneratorSystemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          imagePrompt: {
            type: Type.STRING,
            description: "A detailed prompt for a text-to-image model, formatted as a single dense paragraph."
          },
          videoPrompt: {
            type: Type.STRING,
            description: "A detailed prompt for a text-to-video model, formatted with Markdown (bolding and bullet points), that animates the image prompt's scene."
          }
        },
        required: ["imagePrompt", "videoPrompt"]
      }
    }
  });

  const jsonString = response.text;
  if (!jsonString) {
    throw new Error("API mengembalikan respons kosong.");
  }
  return JSON.parse(jsonString);
};

// --- Metadata Generator ---
export interface MetadataSettings {
  titleLength: number;
  keywordCount: number;
  descriptionLength: number;
  keywordFormat: 'Single Only' | 'Double Only' | 'Mixed';
  includeKeywords: string;
  excludeKeywords: string;
}

export interface MetadataResult {
  title: string;
  keywords: string[];
  description: string;
  modelName: string;
}

export const generateMetadata = async (
  file: File,
  settings: MetadataSettings,
  model: { id: string, name: string }
): Promise<MetadataResult> => {
  const ai = getAiClient();
  const imagePart = await fileToGenerativePart(file);

  const systemInstruction = `You are an expert AI assistant specializing in generating high-quality metadata for stock photography and digital assets. Your task is to analyze an image and produce a compelling title, a set of relevant keywords, and a detailed description based on the user's specific requirements.

**Instructions:**
1.  **Analyze the Image:** Carefully examine the image content, including subjects, setting, colors, mood, and potential concepts.
2.  **Generate Title:** Create a concise, descriptive title. The title should be approximately ${settings.titleLength} characters long.
3.  **Generate Keywords:** Produce a list of approximately ${settings.keywordCount} keywords. 
    - The keywords must be highly relevant to the image.
    - Adhere to the specified Keyword Format: "${settings.keywordFormat}".
    - 'Single Only' means each keyword must be a single word.
    - 'Double Only' means each keyword should be a two-word phrase.
    - 'Mixed' means you can use a combination of single and multi-word keywords.
    ${settings.includeKeywords ? `- You MUST include keywords related to: "${settings.includeKeywords}".` : ''}
    ${settings.excludeKeywords ? `- You MUST NOT include keywords related to: "${settings.excludeKeywords}".` : ''}
4.  **Generate Description:** Write a detailed description of the image. The description should be approximately ${settings.descriptionLength} characters long.

**Output Format:**
- You MUST return a single, valid JSON object with three keys: "title", "keywords" (an array of strings), and "description".
- Do not include any other text, explanations, or markdown formatting outside of the JSON object itself.`;
  
  const textPart = { text: "Generate metadata for the provided image based on my system instructions." };

  const response = await ai.models.generateContent({
    model: model.id,
    contents: { parts: [imagePart, textPart] },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The generated title for the image." },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of generated keywords." },
          description: { type: Type.STRING, description: "The generated description for the image." },
        },
        required: ["title", "keywords", "description"],
      }
    }
  });

  const jsonString = response.text;
  if (!jsonString) {
    throw new Error("API mengembalikan respons kosong.");
  }
  const parsedJson = JSON.parse(jsonString) as Omit<MetadataResult, 'modelName'>;
  return { ...parsedJson, modelName: model.name };
};

// --- Social Media Post Generator ---
export interface SocialMediaPostParams {
  topic: string;
  platform: 'Twitter/X' | 'LinkedIn' | 'Facebook' | 'Instagram';
  tone: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
}

export const generateSocialMediaPost = async (params: SocialMediaPostParams): Promise<string> => {
    const ai = getAiClient();
    const { topic, platform, tone, includeHashtags, includeEmojis } = params;

    const systemInstruction = `You are an expert social media manager. Your task is to generate a compelling social media post based on user-defined parameters.

**Instructions:**
1.  **Analyze the User's Topic:** Understand the core message and goal of the user's topic: "${topic}".
2.  **Adhere to Platform Constraints:**
    -   **Platform:** ${platform}. This is the most important constraint.
    -   **Twitter/X:** Be concise and impactful, strictly under 280 characters.
    -   **LinkedIn:** Use a professional and structured tone. Use line breaks for readability. Ideal for career, tech, and business topics.
    -   **Facebook:** Use a conversational and engaging tone. Can be slightly longer than Twitter.
    -   **Instagram:** Write a caption that is visually oriented and encourages engagement. Ask questions.
3.  **Apply Tone of Voice:** The tone must be "${tone}".
4.  **Hashtags:** ${includeHashtags ? 'Include relevant and popular hashtags. For Twitter and Instagram, place them at the end. For LinkedIn, integrate them naturally or at the end.' : 'Do not include any hashtags.'}
5.  **Emojis:** ${includeEmojis ? 'Include a few relevant emojis to increase engagement.' : 'Do not include any emojis.'}

**Output:**
-   You MUST return only the text content of the post.
-   Do not include any other text, explanations, titles, or markdown formatting like quotes or code blocks.
-   The output should be a single block of text ready to be copied and pasted.`;

    const userPrompt = `Generate a social media post for me.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
        }
    });

    const postText = response.text;
    if (!postText) {
      throw new Error("API mengembalikan respons kosong.");
    }
    return postText.trim();
};

// --- Unix Command Generator ---
export const generateUnixCommand = async (taskDescription: string): Promise<{ command: string; explanation: string; }> => {
  const ai = getAiClient();
  
  const systemInstruction = `You are an expert in Unix/Linux shell commands. Your task is to take a user's description of a task and provide the most appropriate and efficient shell command to accomplish it.

**Instructions:**
1.  **Analyze the User's Task:** Carefully understand the user's goal from their description: "${taskDescription}".
2.  **Provide the Command:** Generate the single, most accurate shell command.
3.  **Provide a Brief Explanation:** Write a concise, one or two-sentence explanation of what the command does and how it works.
4.  **Safety First:** If the described task is potentially destructive (e.g., involves 'rm -rf /' or other dangerous operations), instead of providing the command, your command should be an 'echo' statement warning the user, and the explanation should describe the potential danger.

**Output Format:**
- You MUST return a single, valid JSON object with two string keys: "command" and "explanation".
- Do not include any other text, notes, or markdown formatting outside of the JSON object itself.`;

  const userPrompt = `Generate the Unix command for the following task: "${taskDescription}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          command: {
            type: Type.STRING,
            description: "The generated Unix/Linux shell command."
          },
          explanation: {
            type: Type.STRING,
            description: "A brief, one or two-sentence explanation of the command."
          }
        },
        required: ["command", "explanation"]
      }
    }
  });

  const jsonString = response.text;
  if (!jsonString) {
    throw new Error("API mengembalikan respons kosong.");
  }
  return JSON.parse(jsonString);
};

// --- Viral Video Generator ---

export interface ViralTitleParams {
  count: number;
  duration: number;
  country: string;
  category: string;
  niche: string;
}

export interface ViralTitleResponse {
    titles: string[];
    analysis: {
        rank: number;
        title: string;
        recommendation: string;
    }[];
}

export const generateViralTitles = async (params: ViralTitleParams): Promise<ViralTitleResponse> => {
  const ai = getAiClient();
  const { count, duration, country, category, niche } = params;
  
  const systemInstruction = `**Role:** You are an expert YouTube content strategist specializing in viral short-form videos (${duration} seconds) for the ${country} market.

**Task:** Generate ${count} highly viral video titles focused on the **"${category}"** category, specifically about **"${niche}"**. All output text, including titles and analysis, MUST be in the primary language spoken in **${country}**.

**Output Format:** You MUST return a single, valid JSON object with two keys: "titles" (an array of all ${count} generated titles as strings) and "analysis" (an array of objects for the top 3 titles, where each object has "rank" (number), "title" (string), and "recommendation" (string, a detailed explanation in the language of ${country} of why the title is viral, covering YouTube algorithms, power words, CTR prediction, and emotional sentiment)).

**Constraints:**
-   All text, including titles and recommendations, must be in the language of the target country (${country}).
-   Focus on creating curiosity, urgency, or strong emotional reactions.
-   Keep titles concise and impactful.`;
    
  const userPrompt = `Generate titles for me.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `An array of ${count} generated video titles.`
          },
          analysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    rank: { type: Type.INTEGER, description: "The rank of the title." },
                    title: { type: Type.STRING, description: "The viral title." },
                    recommendation: { type: Type.STRING, description: "The detailed analysis for virality." }
                },
                required: ["rank", "title", "recommendation"]
            },
            description: "An analysis of the top 3 viral titles."
          }
        },
        required: ["titles", "analysis"]
      }
    }
  });
  
  const jsonString = response.text;
  if (!jsonString) {
    throw new Error("API mengembalikan respons kosong.");
  }
  return JSON.parse(jsonString);
};

export interface VideoNarrativeParams {
  title: string;
  duration: number;
  country: string;
}

export interface VideoNarrativeResponse {
  hook: string;
  konflik1: string;
  konflik2: string;
  twist: string;
  konflik3: string;
  closing: string;
  production_notes: string;
}

export const createVideoNarrative = async (params: VideoNarrativeParams): Promise<VideoNarrativeResponse> => {
    const ai = getAiClient();
    const { title, duration, country } = params;

    const systemInstruction = `**Role:** You are a seasoned screenwriter and short-form video expert for the ${country} market.

**Task:** Create a compelling ${duration}-second video narrative script for the title: **"${title}"**. The entire output, including all script parts and notes, MUST be in the primary language spoken in **${country}**.

**Script Structure Requirements:**
-   **HOOK (0:00-0:05):** A captivating opening that grabs attention immediately.
-   **KONFLIK 1 (0:05-0:20):** Introduce the first layer of conflict or tension.
-   **KONFLIK 2 (0:20-0:35):** Escalate the conflict.
-   **TWIST (0:35-0:45):** Introduce an unexpected plot twist.
-   **KONFLIK 3 (0:45-0:55):** Show the consequences of the twist.
-   **CLOSING (0:55-${duration}):** A concluding thought or call to action.
-   **PRODUCTION NOTES:** At the end, include a concise "Production Notes for ${duration} seconds" section.

**Output Format:** You MUST return a single, valid JSON object with keys "hook", "konflik1", "konflik2", "twist", "konflik3", "closing", and "production_notes". Each key's value should be the corresponding text for that script section, written in the language of ${country}.`;
    
    const userPrompt = `Create a narrative for the title: "${title}"`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    hook: { type: Type.STRING },
                    konflik1: { type: Type.STRING },
                    konflik2: { type: Type.STRING },
                    twist: { type: Type.STRING },
                    konflik3: { type: Type.STRING },
                    closing: { type: Type.STRING },
                    production_notes: { type: Type.STRING }
                },
                required: ["hook", "konflik1", "konflik2", "twist", "konflik3", "closing", "production_notes"]
            }
        }
    });
    
    const jsonString = response.text;
    if (!jsonString) {
      throw new Error("API mengembalikan respons kosong.");
    }
    return JSON.parse(jsonString);
};

export interface ProductionAsset {
  segment_name: string;
  timestamp: string;
  narrator_script: string;
  text_to_image_prompt: string;
  image_to_video_prompt: string;
}

export const generateProductionAssets = async (narrative: VideoNarrativeResponse, title: string, country: string): Promise<ProductionAsset[]> => {
    const ai = getAiClient();
    const narrativeString = Object.entries(narrative)
        .filter(([key]) => key !== 'production_notes')
        .map(([key, value]) => `**${key.toUpperCase()}**: ${value}`)
        .join('\n\n');

    const systemInstruction = `**Role:** You are an AI creative director specializing in converting video scripts into prompts for AI image/video tools (like Google Imagen, Midjourney, RunwayML).

**Task:** For the provided video script for the title "${title}", break down each segment and generate specific prompts for visual and motion assets. The input script is in the primary language of ${country}.

**Input Script:**
${narrativeString}

**Output Format:** You MUST return a single, valid JSON array of objects. Each object represents a script segment and must have the following string keys: "segment_name" (e.g., "HOOK"), "timestamp" (e.g., "Seconds 0-5", translated to the language of ${country}), "narrator_script" (The narration text, which MUST be identical to the input script for that segment), "text_to_image_prompt" (A detailed prompt for an image generator, **in English**), and "image_to_video_prompt" (A detailed prompt for an animation/video generator, **in English**).

**Constraints:**
-   \`text_to_image_prompt\` and \`image_to_video_prompt\` must be in ENGLISH.
-   \`narrator_script\` must be in the language of ${country} and match the input.
-   \`timestamp\` must be in the language of ${country}.
-   Image/video prompts must be highly descriptive, focusing on mood, lighting, and composition.
-   Video prompts should include camera movement, animation, and duration.
-   Timestamps must correspond to a 60-second video structure.
`;

    const userPrompt = `Generate production assets for the provided script.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        segment_name: { type: Type.STRING },
                        timestamp: { type: Type.STRING },
                        narrator_script: { type: Type.STRING },
                        text_to_image_prompt: { type: Type.STRING },
                        image_to_video_prompt: { type: Type.STRING }
                    },
                    required: ["segment_name", "timestamp", "narrator_script", "text_to_image_prompt", "image_to_video_prompt"]
                }
            }
        }
    });

    const jsonString = response.text;
    if (!jsonString) {
      throw new Error("API mengembalikan respons kosong.");
    }
    return JSON.parse(jsonString);
};

export interface ThumbnailDesignResponse {
  analysis: {
    clickable: string;
    emotional: string;
    visual: string;
    optimized: string;
  };
  prompt: string;
  notes: {
    iteration: string;
    ab_testing: string;
    adjust: string;
  };
}

export const generateThumbnailDesign = async (title: string, country: string): Promise<ThumbnailDesignResponse> => {
    const ai = getAiClient();
    
    const systemInstruction = `**Role:** You are a top-tier YouTube thumbnail designer and AI prompt engineer.

**Task:** Generate a comprehensive prompt for an AI image generator (e.g., Midjourney, Google Imagen) to create a highly viral YouTube thumbnail for the video titled: **"${title}"**. The video is for the ${country} market. Also provide analysis and notes.

**Output Format:** You MUST return a single, valid JSON object with three keys:
1.  **"analysis"**: An object with string keys "clickable", "emotional", "visual", and "optimized". The value for each key should be an explanation, in the language of ${country}, of how the thumbnail prompt achieves that goal.
2.  **"prompt"**: A single, detailed string containing the complete prompt for the AI image generator. This prompt MUST be in **English**.
3.  **"notes"**: An object with string keys "iteration", "ab_testing", and "adjust", providing actionable advice for the user, in the language of ${country}.`;

    const userPrompt = `Generate thumbnail design for the title: "${title}"`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    analysis: {
                        type: Type.OBJECT,
                        properties: {
                            clickable: { type: Type.STRING },
                            emotional: { type: Type.STRING },
                            visual: { type: Type.STRING },
                            optimized: { type: Type.STRING }
                        },
                        required: ["clickable", "emotional", "visual", "optimized"]
                    },
                    prompt: { type: Type.STRING },
                    notes: {
                        type: Type.OBJECT,
                        properties: {
                            iteration: { type: Type.STRING },
                            ab_testing: { type: Type.STRING },
                            adjust: { type: Type.STRING }
                        },
                        required: ["iteration", "ab_testing", "adjust"]
                    }
                },
                required: ["analysis", "prompt", "notes"]
            }
        }
    });

    const jsonString = response.text;
    if (!jsonString) {
      throw new Error("API mengembalikan respons kosong.");
    }
    return JSON.parse(jsonString);
};
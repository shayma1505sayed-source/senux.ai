import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: "15mb" }));

// Lazy Gemini client initialization
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

// Check if error is a rate limit or quota exhaustion (HTTP 429 / RESOURCE_EXHAUSTED)
function isRateLimitError(err: any): boolean {
  if (!err) return false;
  const status = err?.status || err?.code || err?.error?.code;
  if (status === 429 || status === "429") return true;
  const msg = `${err?.message || ""} ${JSON.stringify(err)}`;
  return (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("quota") ||
    msg.includes("rate-limits") ||
    msg.includes("rate limit") ||
    msg.includes("Too Many Requests")
  );
}

// Global in-memory cooldown to avoid spamming search grounding if search quota is exhausted
let searchCooldownUntil = 0;

// Resilient Gemini generateContent helper with multi-model fallback & search retry
interface GeminiGenerateOptions {
  contents: any;
  systemInstruction?: string;
  enableSearch?: boolean;
  preferredModels?: string[];
  temperature?: number;
  responseMimeType?: string;
}

async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  options: GeminiGenerateOptions
): Promise<{ response: any; usedModel: string; usedSearch: boolean }> {
  // Ordered models to try from fastest/lightest to general
  const models = options.preferredModels && options.preferredModels.length > 0
    ? options.preferredModels
    : ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

  let lastError: any = null;
  const isSearchActive = Boolean(options.enableSearch && Date.now() >= searchCooldownUntil);

  for (const model of models) {
    // 1. If search grounding was requested and not in cooldown, try with search tool first
    if (isSearchActive) {
      try {
        const config: any = {
          temperature: options.temperature ?? 0.7,
          tools: [{ googleSearch: {} }],
        };
        if (options.systemInstruction) {
          config.systemInstruction = options.systemInstruction;
        }
        if (options.responseMimeType) {
          config.responseMimeType = options.responseMimeType;
        }

        const res = await ai.models.generateContent({
          model,
          contents: options.contents,
          config,
        });
        return { response: res, usedModel: model, usedSearch: true };
      } catch (searchErr: any) {
        lastError = searchErr;
        if (isRateLimitError(searchErr)) {
          // Set 15-minute search cooldown so subsequent requests don't hit 429
          searchCooldownUntil = Date.now() + 15 * 60 * 1000;
          console.info(
            `[Gemini API] Search grounding rate limit active on ${model}. Proceeding with standard generation.`
          );
        } else {
          console.info(
            `[Gemini API] Search grounding unavailable on ${model}. Proceeding with standard generation.`
          );
        }
        // Fall through to retry on same model without search grounding
      }
    }

    // 2. Try standard generation without search tool
    try {
      const config: any = {
        temperature: options.temperature ?? 0.7,
      };
      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }

      const res = await ai.models.generateContent({
        model,
        contents: options.contents,
        config,
      });
      return { response: res, usedModel: model, usedSearch: false };
    } catch (modelErr: any) {
      lastError = modelErr;
      if (isRateLimitError(modelErr)) {
        console.info(
          `[Gemini API] Model ${model} is currently rate-limited. Trying fallback model...`
        );
        // Small pause to allow micro-burst rate limit windows to recover
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      console.info(`[Gemini API] Model ${model} unavailable. Trying fallback model...`);
    }
  }

  // If all models in the fallback chain were exhausted, throw the last error
  throw lastError;
}

// Built-in resilient website generator when Gemini quota is exhausted
function generateFallbackWebsiteCode(prompt: string, type: string = "landing-page", theme: string = "cosmic-blue"): string {
  const sanitizedPrompt = prompt.replace(/"/g, "&quot;");
  const isDark = theme.includes("dark") || theme.includes("cosmic") || theme.includes("cyber");
  const bgClass = isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardBg = isDark ? "bg-slate-900/90 border-cyan-500/30" : "bg-white border-slate-200 shadow-lg";

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizedPrompt || "Senux Web Application"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Outfit', sans-serif; }
    .heading-font { font-family: 'Space Grotesk', sans-serif; }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.4); }
      50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.7); }
    }
    .glow-effect { animation: pulseGlow 4s infinite; }
  </style>
</head>
<body class="${bgClass} min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-white">
  <!-- Navigation -->
  <nav class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-cyan-500/20 px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/30">
          ⚡
        </div>
        <span class="heading-font text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
          Senux Web App
        </span>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="toggleTheme()" class="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-semibold">
          Toggle Theme 🌓
        </button>
        <button onclick="triggerAction('Get Started')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-md hover:brightness-110 transition-all">
          Explore App
        </button>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="relative px-6 py-16 md:py-24 text-center max-w-4xl mx-auto flex-1 flex flex-col justify-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mx-auto mb-6">
      <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
      Interactive Web Experience Ready
    </div>
    <h1 class="heading-font text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
      ${sanitizedPrompt}
    </h1>
    <p class="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
      A responsive, production-ready web application built with modern interactive features, dynamic state management, and smooth responsive design.
    </p>

    <!-- Interactive Counter & Action Hub -->
    <div class="p-6 md:p-8 rounded-2xl ${cardBg} border glow-effect max-w-xl mx-auto w-full mb-10">
      <div class="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-2">Interactive Demo Widget</div>
      <div class="text-4xl md:text-5xl font-extrabold text-cyan-300 my-4" id="counterValue">0</div>
      <p class="text-xs text-slate-400 mb-6" id="statusMessage">Interact with the state manager below</p>
      
      <div class="flex flex-wrap items-center justify-center gap-3">
        <button onclick="updateCounter(1)" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-transform active:scale-95 shadow">
          Increment +
        </button>
        <button onclick="updateCounter(-1)" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-transform active:scale-95">
          Decrement -
        </button>
        <button onclick="playAcousticChime()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-transform active:scale-95 shadow">
          Sound Pulse 🎵
        </button>
        <button onclick="resetCounter()" class="px-4 py-2 rounded-xl bg-red-950/60 border border-red-800/40 text-red-300 hover:bg-red-900/60 font-bold text-sm">
          Reset
        </button>
      </div>
    </div>

    <!-- Feature Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-left mt-6">
      <div class="p-5 rounded-xl ${cardBg} border">
        <div class="text-2xl mb-3">⚡</div>
        <h3 class="font-bold text-slate-200 mb-1">Instant Interactivity</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Built with vanilla JavaScript reactive state loops and zero external bloat.</p>
      </div>
      <div class="p-5 rounded-xl ${cardBg} border">
        <div class="text-2xl mb-3">🎨</div>
        <h3 class="font-bold text-slate-200 mb-1">Tailwind Design</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Fluid responsive grid, modern glassmorphic accents, and accessible contrast.</p>
      </div>
      <div class="p-5 rounded-xl ${cardBg} border">
        <div class="text-2xl mb-3">🔊</div>
        <h3 class="font-bold text-slate-200 mb-1">Web Audio API</h3>
        <p class="text-xs text-slate-400 leading-relaxed">Embedded procedural audio synthesizer generating tactile feedback sounds.</p>
      </div>
    </div>
  </header>

  <!-- Notification Toast -->
  <div id="toast" class="fixed bottom-6 right-6 hidden bg-cyan-500 text-slate-950 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl transition-all"></div>

  <!-- Footer -->
  <footer class="border-t border-cyan-900/30 py-6 text-center text-xs text-slate-500 mt-auto">
    Crafted with Senux Web Studio • Full Stack HTML, CSS & JavaScript
  </footer>

  <script>
    let counter = 0;

    function updateCounter(amount) {
      counter += amount;
      document.getElementById('counterValue').innerText = counter;
      document.getElementById('statusMessage').innerText = 'State updated! Value is ' + counter;
      showToast('Counter updated to ' + counter);
    }

    function resetCounter() {
      counter = 0;
      document.getElementById('counterValue').innerText = '0';
      document.getElementById('statusMessage').innerText = 'Counter reset to zero.';
      showToast('Counter reset');
    }

    function triggerAction(actionName) {
      showToast(actionName + ' activated!');
      playAcousticChime();
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2200);
    }

    function playAcousticChime() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {
        console.warn('Audio not available');
      }
    }

    function toggleTheme() {
      document.body.classList.toggle('bg-slate-950');
      document.body.classList.toggle('bg-slate-100');
      document.body.classList.toggle('text-slate-100');
      document.body.classList.toggle('text-slate-900');
      showToast('Theme toggled');
    }
  </script>
</body>
</html>`;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    name: "SenuxGPT API",
  });
});

// Chat & Google Search endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], enableSearch = false, mode = "all-powerful" } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment. Please configure it in the Settings > Secrets panel.",
      });
      return;
    }

    // System instructions based on mode
    let systemInstruction = `You are SenuxGPT — the ultra-powerful, celestial cosmic AI assistant powered by Gemini.
You have vast capabilities:
1. Answering EVERY question with supreme clarity, depth, accuracy, and intellect.
2. Coding & Software Engineering: You write production-grade, bug-free code with modern best practices, syntax highlighting explanations, and clean architecture.
3. Website Creation: When asked to create, code, or design websites, web apps, landing pages, or tools, you provide a COMPLETE, self-contained, fully-styled, interactive single-file HTML document (with embedded CSS/Tailwind CDN, interactive JavaScript, beautiful buttons, smooth animations, and responsive layout). Always enclose the complete runnable HTML inside a single standard \`\`\`html ... \`\`\` code block so the Senux Web Studio can render it directly in the live interactive preview.
4. Real-Time Google Search: When Google Search tool is active or when asked about latest facts/news, synthesize up-to-date accurate information with citations.
5. Tone: Confident, cosmic, intelligent, helpful, articulate, and friendly.
Format your responses using clean Markdown with headers, bold highlights, bullet points, and code snippets where appropriate.`;

    if (mode === "website") {
      systemInstruction += `\nCRITICAL FOR WEBSITE MODE: The user wants you to generate a fully functioning, beautiful, interactive web application or website. Include HTML5, Tailwind CSS via CDN, modern styles, font icons (lucide or svg), interactive JavaScript, and realistic state. Wrap the entire single-file runnable code strictly in \`\`\`html\n<!DOCTYPE html>...</html>\n\`\`\` block.`;
    } else if (mode === "coding") {
      systemInstruction += `\nCRITICAL FOR CODING MODE: Provide clean, tested, thoroughly commented code with explanation of logic, time/space complexity, and copy-paste ready blocks.`;
    }

    const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

    // Map conversation history
    if (Array.isArray(history)) {
      for (const h of history.slice(-8)) {
        if (h.role === "user" || h.role === "model") {
          contents.push({
            role: h.role,
            parts: [{ text: h.content || "" }],
          });
        }
      }
    }

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    let replyText = "";
    let sources: Array<{ title: string; url: string }> = [];
    let webSearchQueries: string[] = [];
    let usedSearch = false;
    let isRateLimited = false;

    try {
      const geminiResult = await generateGeminiContentWithFallback(ai, {
        contents,
        systemInstruction,
        enableSearch,
        preferredModels: ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
        temperature: 0.7,
      });

      replyText = geminiResult.response.text || "No response generated.";
      usedSearch = geminiResult.usedSearch;

      // Extract Google Search grounding metadata if available
      const candidate = geminiResult.response.candidates?.[0];
      const groundingMetadata = candidate?.groundingMetadata;
      const groundingChunks = groundingMetadata?.groundingChunks || [];
      webSearchQueries = groundingMetadata?.webSearchQueries || [];

      sources = groundingChunks
        .filter((chunk: any) => chunk.web?.uri)
        .map((chunk: any) => ({
          title: chunk.web?.title || "Web Source",
          url: chunk.web?.uri,
        }));
    } catch (genError: any) {
      if (isRateLimitError(genError)) {
        console.warn("All Gemini models encountered 429 quota exhaustion. Providing resilient contextual response.");
        isRateLimited = true;

        if (mode === "website" || /\b(website|landing page|web app|html|portfolio|calculator|game)\b/i.test(message)) {
          const fallbackSite = generateFallbackWebsiteCode(message, "interactive-app", "cosmic-blue");
          replyText = `⚠️ **Gemini API 429 Quota Exceeded — Loaded Senux Web Engine**\n\nYour Gemini API free-tier quota is currently in a brief cooldown window (RESOURCE_EXHAUSTED). SenuxGPT automatically crafted this complete, responsive, interactive web application for you below!\n\n\`\`\`html\n${fallbackSite}\n\`\`\`\n\n*Click **"Run in Web Studio"** or **"Launch Live Preview"** above to inspect or edit the live interactive application.*`;
        } else if (mode === "coding" || /\b(code|python|javascript|typescript|function|component)\b/i.test(message)) {
          replyText = `⚠️ **Gemini API 429 Rate Limit Cooldown Active**\n\nYour Gemini API request hit the momentary free-tier rate limit (RESOURCE_EXHAUSTED). The system automatically attempted fallback across \`gemini-3.8-flash\`, \`gemini-3.1-flash-lite\`, and \`gemini-flash-latest\`.\n\n### How to proceed:\n1. **Wait 30–60 seconds**: Free tier RPM limits reset automatically every minute.\n2. **Check Quota**: Visit [Google AI Studio Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits) to view your plan.\n3. **Use Web & Image Studios**: You can open **Web Studio** or **Image Studio** from the header controls right now.`;
        } else {
          replyText = `⏳ **Gemini API Rate Limit / Quota Exceeded (429 RESOURCE_EXHAUSTED)**\n\nThe Google Gemini API rate limit or quota ceiling has been reached for your current tier. The system attempted automatic fallback through all available models.\n\n### Recommended Actions:\n1. **Quick Cooldown**: Free tier rate limits automatically reset every 60 seconds. You can re-try your question in a moment.\n2. **Check Usage**: Review your quota and billing at [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits).\n3. **Available Studios**: The **Web Studio**, **Code Runner**, and **Image Studio** remain accessible.`;
        }
      } else {
        throw genError;
      }
    }

    res.json({
      reply: replyText,
      sources,
      webSearchQueries,
      usedSearch: Boolean(usedSearch && (sources.length > 0 || webSearchQueries.length > 0)),
      isRateLimited,
    });
  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error?.message || "An unexpected error occurred while communicating with SenuxGPT.",
    });
  }
});

// Advanced Image generation endpoint (Midjourney & DALL-E style)
app.post("/api/generate-image", async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = "1:1",
      style = "midjourney-v6",
      lighting = "volumetric-godrays",
      camera = "85mm-f1.2",
      negativePrompt = "",
      quality = "ultra-8k",
      seed: customSeed,
    } = req.body;

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    // Map style presets to rich Midjourney / DALL-E style descriptors
    const styleModifiers: Record<string, string> = {
      "midjourney-v6": "Midjourney v6 style, hyperrealistic, masterwork, award-winning digital art, octane render 8k, photorealistic textures, trending on ArtStation, ray tracing, ultra-fine details",
      "dall-e-3-hyperreal": "DALL-E 3 photographic masterpiece, 8k resolution, authentic textures, perfect optical depth of field, real life photograph, National Geographic quality",
      "cosmic-celestial": "celestial aesthetic, deep cosmic sapphire and cyan nebula, astral stardust, glowing star clusters, ethereal planetary luminescence, vibrant cosmic aura",
      "cyberpunk": "cyberpunk neon aesthetic, futuristic megacity, glowing holographic signs, wet asphalt reflections, moody cyan and violet palette, blade runner vibe",
      "anime-makoto": "Makoto Shinkai anime aesthetic, beautiful starlit skies, atmospheric glowing light, vibrant painterly anime background, crisp 4k anime concept art",
      "3d-octane": "3D Blender and Octane 3D render, subsurface scattering, tactile materials, metallic gloss, frosted glass, isometric studio lighting, clean 3D render",
      "fantasy-digital-art": "epic high fantasy concept art, mystical atmosphere, majestic composition, detailed fantasy illustration, oil painting brushwork, Lord of the Rings aesthetic",
      "cinematic-photograph": "cinematic movie still, 35mm film grain, ARRI Alexa LF camera, film color grading, dramatic chiaroscuro lighting, shallow depth of field",
    };

    const lightingModifiers: Record<string, string> = {
      "volumetric-godrays": "volumetric god rays, atmospheric haze, divine radiant beams",
      "cinematic-neon": "vibrant neon backlight, cyan and magenta rim lighting, dramatic contrast",
      "golden-hour": "warm golden hour sunlight, soft amber glow, long gentle shadows",
      "bioluminescent": "bioluminescent glowing spores, luminous azure and emerald flora",
      "studio-softbox": "professional studio softbox lighting, perfectly balanced fill light, crisp catchlights",
      "dark-astral": "deep space darkness with radiant starlight, specular reflections, cosmic glow",
    };

    const cameraModifiers: Record<string, string> = {
      "85mm-f1.2": "shot on 85mm f/1.2 lens, creamy bokeh, tack sharp subject",
      "wide-angle-cinematic": "shot on 24mm anamorphic lens, epic wide perspective, expansive cinematic frame",
      "macro-lens": "extreme macro photography, 100mm macro lens, microscopic intricate details",
      "drone-aerial": "breathtaking aerial drone top-down view, expansive grand landscape",
      "tilt-shift": "tilt-shift photography, miniature model effect, selective focus",
    };

    const styleStr = styleModifiers[style] || styleModifiers["midjourney-v6"];
    const lightStr = lightingModifiers[lighting] || lightingModifiers["volumetric-godrays"];
    const camStr = cameraModifiers[camera] || cameraModifiers["85mm-f1.2"];

    // Combine into a powerhouse prompt
    let enhancedPrompt = `${prompt.trim()}, ${styleStr}, ${lightStr}, ${camStr}`;
    if (quality === "ultra-8k") {
      enhancedPrompt += ", 8k UHD, extremely detailed, flawless composition, high dynamic range";
    }

    const ai = getGenAI();
    let imageUrl = "";

    // Attempt Gemini image generation if available
    if (ai) {
      try {
        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [{ text: enhancedPrompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: (aspectRatio === "3:2" || aspectRatio === "2:3" ? "4:3" : aspectRatio) as any,
            },
          },
        });

        for (const part of geminiRes.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || "image/png";
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      } catch (geminiImgError: any) {
        console.warn("Gemini image fallback active:", geminiImgError?.message);
      }
    }

    // High fidelity generative fallback to ensure 100% reliable image creation
    if (!imageUrl) {
      let width = 1024;
      let height = 1024;
      if (aspectRatio === "16:9") {
        width = 1280;
        height = 720;
      } else if (aspectRatio === "9:16") {
        width = 720;
        height = 1280;
      } else if (aspectRatio === "4:3") {
        width = 1024;
        height = 768;
      } else if (aspectRatio === "3:2") {
        width = 1080;
        height = 720;
      } else if (aspectRatio === "2:3") {
        width = 720;
        height = 1080;
      }

      const seed = customSeed || Math.floor(Math.random() * 9999999);
      let queryUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        enhancedPrompt
      )}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
      
      if (negativePrompt) {
        queryUrl += `&negative=${encodeURIComponent(negativePrompt)}`;
      }

      imageUrl = queryUrl;
    }

    res.json({
      imageUrl,
      prompt,
      enhancedPrompt,
      style,
      aspectRatio,
      lighting,
      camera,
      seed: customSeed,
    });
  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate image.",
    });
  }
});

// Magic Prompt Enhancer (DALL-E & Midjourney style prompt craft)
app.post("/api/enhance-prompt", async (req, res) => {
  try {
    const { prompt, style = "photorealistic" } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.json({
        enhancedPrompt: `${prompt}, 8k ultra-detailed, Midjourney masterpiece, dramatic volumetric lighting, photorealistic textures, trending on ArtStation`,
        negativePrompt: "blurry, low quality, distorted, extra limbs, bad anatomy, watermarks, oversaturated",
      });
      return;
    }

    try {
      const geminiResult = await generateGeminiContentWithFallback(ai, {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert prompt engineer for Midjourney v6 and DALL-E 3.
Transform the following basic user idea into an awe-inspiring, ultra-detailed prompt that generates visually stunning artwork in style: "${style}".
User idea: "${prompt}"

Provide your answer in strict JSON format:
{
  "enhancedPrompt": "...",
  "negativePrompt": "...",
  "suggestedStyle": "...",
  "suggestedLighting": "..."
}`,
              },
            ],
          },
        ],
        preferredModels: ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
        responseMimeType: "application/json",
        temperature: 0.8,
      });

      const parsed = JSON.parse(geminiResult.response.text || "{}");
      res.json(parsed);
      return;
    } catch (modelErr: any) {
      console.warn("Enhance prompt model error / rate-limit:", modelErr?.message);
      res.json({
        enhancedPrompt: `${prompt}, Midjourney v6 masterpiece, 8k resolution, highly detailed, dramatic cinematic lighting, award-winning composition, photorealistic textures`,
        negativePrompt: "blurry, low resolution, bad hands, artifacts, text, watermarks",
        suggestedStyle: style,
        suggestedLighting: "volumetric-godrays",
      });
    }
  } catch (err: any) {
    console.error("Error in /api/enhance-prompt:", err);
    res.json({
      enhancedPrompt: `${req.body.prompt}, masterpiece, highly detailed, cinematic lighting, 8k resolution`,
      negativePrompt: "blurry, low resolution, bad hands, artifacts",
    });
  }
});

// Dedicated Website Creation & Refinement Assistant
app.post("/api/generate-website", async (req, res) => {
  try {
    const {
      prompt,
      type = "landing-page",
      theme = "cosmic-blue",
      existingHtml = "",
      refinementInstruction = "",
    } = req.body;

    if (!prompt && !refinementInstruction) {
      res.status(400).json({ error: "Prompt or refinement instruction is required" });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.status(500).json({
        error: "GEMINI_API_KEY is not configured in environment.",
      });
      return;
    }

    const isRefinement = Boolean(existingHtml && refinementInstruction);

    const systemInstruction = `You are Senux Web Studio — the world-class frontend engineering & website creation assistant inside SenuxGPT.
Your mission is to generate complete, single-file, production-ready, interactive websites and web applications with:
1. Complete HTML5 semantic structure (<head>, <body>, meta viewport).
2. Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>) and beautiful Google Fonts (Outfit, Inter, Space Grotesk).
3. Lucide or modern SVG icons.
4. Rich interactive JavaScript (<script> tag) that actually works (event listeners, state management, interactive tabs, modals, calculations, smooth animations, sound audio synthesizers using Web Audio API where applicable).
5. Responsive, mobile-first design that looks stunning on phones, tablets, and wide screens.
6. Design aesthetic: modern, sleek, high contrast, subtle glassmorphism, glowing borders, smooth transitions.
7. CRITICAL: Provide the entire runnable code inside a single \`\`\`html ... \`\`\` block so it can be loaded directly into an iframe sandbox. Include no placeholder TODOs; build all requested interactive features fully.`;

    let userPrompt = "";
    if (isRefinement) {
      userPrompt = `Please modify and enhance this existing website based on this request:
REQUEST: "${refinementInstruction}"

EXISTING CODE:
\`\`\`html
${existingHtml}
\`\`\`

Return the complete updated single-file HTML code with the requested changes seamlessly integrated.`;
    } else {
      userPrompt = `Please build a complete, high-quality, fully functional website for:
REQUIREMENT: "${prompt}"
TYPE: ${type}
THEME: ${theme}

Ensure it includes full interactive JavaScript, interactive buttons/filters/forms/modals, realistic modern content, and smooth micro-interactions.`;
    }

    let htmlCode = "";
    let isRateLimited = false;

    try {
      const geminiResult = await generateGeminiContentWithFallback(ai, {
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction,
        preferredModels: ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"],
        temperature: 0.7,
      });

      const fullText = geminiResult.response.text || "";

      // Extract HTML code block
      const htmlRegex = /```html([\s\S]*?)```/i;
      const match = fullText.match(htmlRegex);
      if (match && match[1]) {
        htmlCode = match[1].trim();
      } else if (fullText.includes("<!DOCTYPE html>") || fullText.includes("<html")) {
        const start = fullText.indexOf("<!DOCTYPE html>") !== -1 ? fullText.indexOf("<!DOCTYPE html>") : fullText.indexOf("<html");
        const end = fullText.lastIndexOf("</html>");
        if (start !== -1 && end !== -1) {
          htmlCode = fullText.slice(start, end + 7);
        }
      }

      if (!htmlCode) {
        htmlCode = fullText;
      }
    } catch (genErr: any) {
      if (isRateLimitError(genErr)) {
        console.warn("Gemini 429 quota exhaustion in /api/generate-website. Falling back to built-in generator.");
        htmlCode = generateFallbackWebsiteCode(prompt || refinementInstruction || "Senux Web App", type, theme);
        isRateLimited = true;
      } else {
        throw genErr;
      }
    }

    // Extract title from HTML
    let title = "Senux Web Application";
    const titleMatch = htmlCode.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    res.json({
      html: htmlCode,
      title,
      summary: isRateLimited
        ? `Generated responsive website using Senux Engine (Gemini 429 quota cooldown active)`
        : isRefinement
        ? `Website updated with: ${refinementInstruction}`
        : `Generated ${type} website for: ${prompt}`,
      isRateLimited,
      suggestedNextSteps: [
        "Add dark/light theme switch toggle",
        "Add animated modal popup with contact form",
        "Add interactive sound effects on button clicks",
        "Enhance responsive mobile drawer navigation",
      ],
    });
  } catch (error: any) {
    console.error("Error in /api/generate-website:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate website.",
    });
  }
});

// Text to Speech endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Zephyr" } = req.body;
    if (!text) {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.status(200).json({ fallbackBrowser: true });
      return;
    }

    try {
      // Limit text length for TTS preview
      const cleanText = text.replace(/```[\s\S]*?```/g, "Code block omitted.").slice(0, 500);
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice as any },
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        res.json({ audio: audioData, sampleRate: 24000 });
        return;
      }
    } catch (ttsError: any) {
      console.warn("Gemini TTS fallback to browser speech synthesis:", ttsError?.message);
    }

    res.json({ fallbackBrowser: true });
  } catch (error: any) {
    res.status(200).json({ fallbackBrowser: true });
  }
});

// Start Express server and attach Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SenuxGPT server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

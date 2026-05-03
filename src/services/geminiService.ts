import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface RoutingResult {
  category: string;
  department: string;
  urgency: "low" | "medium" | "high" | "critical";
  analysis: string;
  nextSteps: string[];
  isFraud: boolean;
  fraudReason?: string;
  actions: {
    phone?: string;
    office?: string;
    website?: string;
    app?: string;
  };
}

export async function analyzeProblem(
  problemDescription: string, 
  language: string = 'English', 
  customCategories?: string[],
  urgencyRules?: { keyword: string, urgency: string }[]
): Promise<RoutingResult> {
  if (!problemDescription) throw new Error("Problem description is required");

  const categoryContext = customCategories?.length 
    ? `Use these specific local categories if applicable: ${customCategories.join(', ')}.` 
    : '';
    
  const urgencyContext = urgencyRules?.length
    ? `IMPORTANT: The authorities have defined specific urgency overrides for keywords. If you detect these keywords, apply the corresponding urgency:
       ${urgencyRules.map(r => `"${r.keyword}" -> ${r.urgency}`).join(', ')}. Otherwise, use your best judgment.`
    : '';

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [{
        text: `Analyze the following problem and route it to the correct service or authority. 
        Focus strictly on Karnataka, India, specifically Mysuru or Bangalore if applicable.
        
        The user has selected the preferred language: ${language}. 
        The final "analysis" and "nextSteps" MUST be in ${language}.
        
        ${categoryContext}
        ${urgencyContext}

        FRAUD DETECTION PROTOCOL:
        Assess if the input is:
        1. SPAM: Random text, keyboard smashing, or gibberish.
        2. MALICIOUS: Threats, hate speech, or harassment directed at officials or the system.
        3. UNRELATED: Commercial ads, personal blog posts, or things that are clearly not civic or public issues.
        Set "isFraud" to true if any match, and provide a "fraudReason".
        
        Route to specific departments like:
        - Power: BESCOM (Bangalore), CESC (Mysuru)
        - Water: BWSSB (Bangalore), MCC/Vani Vilas Water Works (Mysuru)
        - Police: 100/112 (Namma 100)
        - Transport: KSRTC, BMTC
        - Civic: BBMP (Bangalore), MCC (Mysuru)
        - Others: AHARA (PDS/Ration), Health (KSRTC/Namma Clinic), Passport Seva, Aadhaar/UIDAI.
        
        Provide the 4 specific action metrics: Contact Number (Phone), Office/Location, Website, and Mobile App (if exists).
        
        CRITICAL:
        - Handle multiple issues in one query if present.
        - Detect and support local languages (Kannada, Hindi, etc.).
        
        Problem: ${problemDescription}`
      }]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          department: { type: Type.STRING },
          urgency: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] },
          analysis: { type: Type.STRING },
          nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          isFraud: { type: Type.BOOLEAN },
          fraudReason: { type: Type.STRING, description: "Description of why it is fraudulent, if isFraud is true" },
          actions: {
            type: Type.OBJECT,
            properties: {
              phone: { type: Type.STRING, description: "Official helpline or contact number" },
              office: { type: Type.STRING, description: "Office address or Google Maps search query" },
              website: { type: Type.STRING, description: "Official government portal URL" },
              app: { type: Type.STRING, description: "Name of the official mobile app if any" }
            }
          }
        },
        required: ["category", "department", "urgency", "analysis", "nextSteps", "isFraud", "actions"]
      },
      systemInstruction: "You are RouteAssist, a civic AI expert for Karnataka, India. You identify the exact government department responsible for any public issue and provide the correct helplines (like 1912 for CESC/BESCOM, 100 for Police, etc.). Always be helpful and prioritize safety."
    }
  });

  try {
    const textValue = response.text || "{}";
    const data = JSON.parse(textValue);
    return data as RoutingResult;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Could not analyze your problem at this time.");
  }
}

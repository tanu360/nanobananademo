const API_BASE = "https://nanobanana.aikit.club";
const API_KEY = "dummy-key";

export interface GenerateParams {
  prompt: string;
  model?: string;
  n?: number;
  size?: string;
  sampleImageSize?: "1K" | "2K";
  quality?: string;
  enhance_prompt?: boolean;
  negative_prompt?: string;
  seed?: number;
  response_format?: "url" | "b64_json";
}

export interface EditParams {
  prompt: string;
  image: string;
  response_format?: "url" | "b64_json";
}

export interface UpscaleParams {
  image: string;
  upscale_factor?: "x2" | "x3" | "x4";
  response_format?: "url" | "b64_json";
}

export interface ImageData {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

export interface ImageResponse {
  created: number;
  data: ImageData[];
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelList {
  object: string;
  data: Model[];
}

export async function generateImage(params: GenerateParams): Promise<ImageResponse> {
  const response = await fetch(`${API_BASE}/v1/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate image");
  }

  return response.json();
}

export async function editImage(params: EditParams): Promise<ImageResponse> {
  const response = await fetch(`${API_BASE}/v1/images/edits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to edit image");
  }

  return response.json();
}

export async function upscaleImage(params: UpscaleParams): Promise<ImageResponse> {
  const response = await fetch(`${API_BASE}/v1/images/upscale`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to upscale image");
  }

  return response.json();
}

export async function listModels(): Promise<ModelList> {
  const response = await fetch(`${API_BASE}/v1/models`, {
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to fetch models");
  }

  return response.json();
}

export const MODELS = [
  { id: "nano-banana", name: "Nano Banana", description: "Default model" },
  { id: "imagen-4.0-ultra-generate-001", name: "Imagen 4.0 Ultra", description: "Highest quality" },
  { id: "imagen-4.0-generate-001", name: "Imagen 4.0", description: "High quality" },
  { id: "imagen-4.0-fast-generate-001", name: "Imagen 4.0 Fast", description: "Fast generation" },
  { id: "imagen-3.0-generate-002", name: "Imagen 3.0 v2", description: "Stable quality" },
  { id: "imagen-3.0-generate-001", name: "Imagen 3.0 v1", description: "Classic model" },
  { id: "imagen-3.0-fast-generate-001", name: "Imagen 3.0 Fast", description: "Quick results" },
];

export const SIZES = [
  "1024x1024",
  "1536x1024",
  "1024x1536",
  "512x512",
  "768x768",
];

export const ASPECT_RATIOS = [
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
];

export const QUALITY_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Mid" },
  { value: "high", label: "High" },
  { value: "hd", label: "HD (2K)" },
];

export const UPSCALE_FACTORS = [
  { value: "x2", label: "2x" },
  { value: "x3", label: "3x" },
  { value: "x4", label: "4x" },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface AnalyzeResponse {
  model_id: string;
  image_panel: Record<string, any>;
  analysis_panel: Record<string, any>;
  explainability?: Record<string, any>;
  raw?: any;
}

export async function analyzeImageRequest(file: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `API request failed with status ${response.status}`);
  }

  return (await response.json()) as AnalyzeResponse;
}

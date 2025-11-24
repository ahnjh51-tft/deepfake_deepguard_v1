import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Scan, CheckCircle, XCircle, Loader2, Maximize2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";
import { analyzeImageRequest, AnalyzeResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useHistoryData } from "@/context/HistoryContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const MODEL_NAME = "ELA + RandomForest";
const MODEL_ID = "ela_rf";

interface DetectionResult {
  label: string;
  confidence: number;
  realPercent: number;
  fakePercent: number;
  isFake?: boolean;
  analysisPanel?: Record<string, any>;
  rawResponse?: AnalyzeResponse;
}

const DetectionTab = () => {
  const { user } = useAuth();
  const { addEntry } = useHistoryData();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [explainability, setExplainability] = useState<Record<string, any> | null>(null);
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(0.5);
  const { toast } = useToast();

  const viewImages = useMemo(
    () =>
      [
        { src: explainability?.original_with_boxes, title: "疑わしい領域（原画像）" },
        { src: explainability?.ela_heatmap, title: "ELAヒートマップ" },
        { src: explainability?.ela_with_boxes, title: "ELA＋疑わしい領域" },
      ].filter((item) => item.src),
    [explainability]
  );

  const handleImageSelect = useCallback((file: File | null, previewUrl: string | null) => {
    setUploadedFile(file);
    setPreviewImage(previewUrl);
  }, []);

  const mapResponseToResult = (response: AnalyzeResponse): DetectionResult => {
    const panel = response.analysis_panel || {};
    const isFake = typeof panel.is_fake === "boolean" ? panel.is_fake : undefined;
    const verdictText = (panel.verdict || panel.label || "").toString().toLowerCase();

    let label = "判定結果";
    if (typeof isFake === "boolean") {
      label = isFake ? "偽物" : "本物";
    } else if (verdictText.includes("fake")) {
      label = "偽物";
    } else if (verdictText.includes("real")) {
      label = "本物";
    } else if (verdictText.includes("suspicion") || verdictText.includes("high")) {
      label = "偽物の疑い";
    } else if (verdictText.includes("low")) {
      label = "本物の可能性";
    } else if (panel.label) {
      label = panel.label;
    }

    let confidence = 0;
    let realPercent = 0;
    let fakePercent = 0;
    if (typeof panel.fake_probability === "number") {
      confidence = panel.fake_probability * 100;
      fakePercent = confidence;
      realPercent = 100 - confidence;
    } else if (typeof panel.confidence === "number") {
      const val: number = panel.confidence;
      confidence = val <= 1 ? val * 100 : val;
    } else if (typeof panel.score === "number") {
      confidence = panel.score;
    }

    const extractPercentages = (source: Record<string, unknown> | undefined) => {
      if (!source) return false;
      const real = Number(source.real ?? 0);
      const fake = Number(source.fake ?? 0);
      if (real === 0 && fake === 0) return false;
      if (real <= 1 && fake <= 1) {
        realPercent = real * 100;
        fakePercent = fake * 100;
      } else {
        realPercent = real;
        fakePercent = fake;
      }
      return true;
    };

    if (!extractPercentages(panel.probabilities)) {
      extractPercentages(panel.scores);
    }
    if (realPercent === 0 && fakePercent === 0) {
      fakePercent = confidence || 0;
      realPercent = 100 - fakePercent;
    }
    confidence = Math.max(0, Math.min(100, confidence || 0));
    realPercent = Math.max(0, Math.min(100, realPercent));
    fakePercent = Math.max(0, Math.min(100, fakePercent));

    return {
      label,
      confidence,
      realPercent,
      fakePercent,
      isFake,
      analysisPanel: panel,
      rawResponse: response,
    };
  };

  const handleDetect = async () => {
    if (!uploadedFile) {
      toast({
        title: "エラー",
        description: "画像をアップロードしてください",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);
    setResult(null);

    try {
      const response = await analyzeImageRequest(uploadedFile);
      const mapped = mapResponseToResult(response);
      setResult(mapped);
      setExplainability(response.explainability || null);
      addEntry({
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: user?.email ?? "unknown",
        modelId: MODEL_ID,
        modelName: MODEL_NAME,
        resultLabel: mapped.label,
        confidence: mapped.confidence,
        previewDataUrl: response.image_panel?.preview_data_url ?? previewImage,
        originalWithBoxes: response.explainability?.original_with_boxes ?? null,
        elaHeatmap: response.explainability?.ela_heatmap ?? null,
        elaWithBoxes: response.explainability?.ela_with_boxes ?? null,
        rawResponse: response,
      });
      toast({
        title: "検出完了",
        description: `結果: ${mapped.label}\n本物: ${mapped.realPercent.toFixed(1)}%\n偽物: ${mapped.fakePercent.toFixed(1)}%`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "検出に失敗しました",
        description: error instanceof Error ? error.message : "サーバーエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Section */}
      <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
        <CardHeader className="bg-intel-pale-blue/20 border-b border-intel-pale-blue/40">
          <CardTitle className="flex items-center gap-2 text-intel-dark-blue">
            <Upload className="w-6 h-6" />
            画像アップロード
          </CardTitle>
          <CardDescription className="text-foreground/70">
            検証する画像を選択してください
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-6 pt-6">{/* ... keep existing code */}
          <ImageUpload onImageSelect={handleImageSelect} />

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground/70">検出モデル</label>
            <Select value={MODEL_ID} disabled>
              <SelectTrigger className="border-intel-pale-blue/60 focus:border-intel-medium-blue focus:ring-intel-medium-blue">
                <SelectValue placeholder={MODEL_NAME} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MODEL_ID}>{MODEL_NAME}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleDetect}
            disabled={!uploadedFile || isDetecting}
            className="w-full bg-intel-medium-blue hover:bg-intel-dark-blue text-white font-medium"
            size="lg"
          >
            {isDetecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                検出中...
              </>
            ) : (
              <>
                <Scan className="mr-2 h-4 w-4" />
                検出開始
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
        <CardHeader className="bg-intel-pale-blue/20 border-b border-intel-pale-blue/40">
          <CardTitle className="text-intel-dark-blue">分析結果</CardTitle>
          <CardDescription className="text-foreground/70">AIによる判定結果</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">{/* ... keep existing code */}
          {!result && !isDetecting && (
            <div className="flex items-center justify-center h-64 text-foreground/40">
              <div className="text-center space-y-2">
                <Scan className="w-12 h-12 mx-auto opacity-50" />
                <p>画像をアップロードして検出を開始してください</p>
              </div>
            </div>
          )}

          {isDetecting && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 mx-auto text-intel-medium-blue animate-spin" />
                <p className="text-intel-medium-blue font-medium">AI分析中...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div
                className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 ${
                  result.label === "本物"
                    ? "bg-intel-deep-teal/10 border-intel-deep-teal/60"
                    : "bg-[#BC3D41]/10 border-[#BC3D41]/60"
                }`}
              >
                {result.label === "本物" ? (
                  <CheckCircle className="w-8 h-8 text-intel-deep-teal" />
                ) : (
                  <XCircle className="w-8 h-8 text-[#BC3D41]" />
                )}
                <div>
                  <p className={`text-2xl font-bold ${result.label === "本物" ? "text-intel-deep-teal" : "text-[#BC3D41]"}`}>{result.label}</p>
                  <p className="text-sm text-foreground/60">本物: {result.realPercent.toFixed(1)}%</p>
                  <p className="text-sm text-foreground/60">偽物: {result.fakePercent.toFixed(1)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">使用モデル</span>
                  <span className="font-medium text-intel-medium-blue">
                    {MODEL_NAME}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">検出時刻</span>
                  <span className="font-medium text-intel-medium-blue">{new Date().toLocaleString("ja-JP")}</span>
                </div>
              </div>

              <div className="h-3 bg-intel-pale-blue/20 rounded-full overflow-hidden border border-intel-pale-blue/60">
                <div
                  className={`h-full transition-all duration-500 ${
                    result.label === "本物" ? "bg-intel-deep-teal" : "bg-[#BC3D41]"
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, result.fakePercent))}%` }}
                />
              </div>

              {explainability && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { src: explainability.original_with_boxes, title: "疑わしい領域（原画像）" },
                    { src: explainability.ela_heatmap, title: "ELAヒートマップ" },
                    { src: explainability.ela_with_boxes, title: "ELA＋疑わしい領域" },
                  ]
                    .filter((item) => item.src)
                    .map((item) => (
                      <div
                        key={item.title}
                        className="border border-intel-pale-blue/60 rounded-lg overflow-hidden bg-white shadow-sm cursor-zoom-in"
                        onClick={() => {
                          setZoom(0.5);
                          const idx = viewImages.findIndex((v) => v.src === item.src && v.title === item.title);
                          setEnlargedIndex(idx >= 0 ? idx : 0);
                        }}
                      >
                        <div className="p-2 text-sm font-medium text-foreground/70 flex items-center justify-between">
                          <span>{item.title}</span>
                          <Maximize2 className="w-4 h-4 text-foreground/50" />
                        </div>
                        <img
                          src={item.src as string}
                          alt={item.title}
                          className="w-full h-48 object-contain bg-white"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={enlargedIndex !== null}
        onOpenChange={(open) => {
          if (!open) setEnlargedIndex(null);
        }}
      >
        <DialogContent className="max-w-6xl">
          {enlargedIndex !== null && viewImages[enlargedIndex] && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{viewImages[enlargedIndex].title}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEnlargedIndex((idx) =>
                        idx === null ? null : (idx - 1 + viewImages.length) % viewImages.length
                      )
                    }
                  >
                    ◀
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>
                    ー
                  </Button>
                  <span className="w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                  <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
                    ＋
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>
                    リセット
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEnlargedIndex((idx) =>
                        idx === null ? null : (idx + 1) % viewImages.length
                      )
                    }
                  >
                    ▶
                  </Button>
                </div>
              </div>
              <div className="overflow-auto max-h-[80vh] border border-border rounded-md bg-white p-2">
                <img
                  src={viewImages[enlargedIndex].src as string}
                  alt={viewImages[enlargedIndex].title}
                  style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetectionTab;

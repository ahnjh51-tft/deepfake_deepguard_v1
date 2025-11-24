import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lightbulb, Upload } from "lucide-react";
import ImageUpload from "./ImageUpload";

const VisualizationTab = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Section */}
      <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
        <CardHeader className="bg-intel-pale-blue/20 border-b border-intel-pale-blue/40">
          <CardTitle className="flex items-center gap-2 text-intel-dark-blue">
            <Upload className="w-6 h-6" />
            画像アップロード
          </CardTitle>
          <CardDescription className="text-foreground/70">可視化する画像を選択してください</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ImageUpload onImageSelect={(_, preview) => setUploadedImage(preview)} />
        </CardContent>
      </Card>

      {/* Visualization Section */}
      <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
        <CardHeader className="bg-intel-pale-blue/20 border-b border-intel-pale-blue/40">
          <CardTitle className="flex items-center gap-2 text-intel-dark-blue">
            <Lightbulb className="w-6 h-6" />
            どのように検出するか
          </CardTitle>
          <CardDescription className="text-foreground/70">モデルの特徴マップ可視化</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">{/* ... keep existing code */}
          {uploadedImage ? (
            <>
              <div className="relative rounded-lg overflow-hidden border-2 border-intel-pale-blue/60">
                <img src={uploadedImage} alt="Analysis" className="w-full h-64 object-contain" />
                {showOverlay && (
                  <div className="absolute inset-0 bg-intel-medium-blue/20 pointer-events-none">
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-40">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className="border border-intel-medium-blue/50"
                          style={{
                            backgroundColor:
                              Math.random() > 0.5 ? "rgba(7,115,196,0.2)" : "rgba(21,184,252,0.15)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setShowOverlay(!showOverlay)}
                variant="outline"
                className="w-full border-intel-medium-blue/40 text-intel-medium-blue hover:bg-intel-pale-blue/20"
              >
                {showOverlay ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    オーバーレイを非表示
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    オーバーレイを表示
                  </>
                )}
              </Button>

              <div className="space-y-3 p-4 rounded-lg bg-intel-pale-blue/20 border border-intel-medium-blue/30">
                <h4 className="font-medium text-sm text-intel-medium-blue">検出の仕組み</h4>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-intel-medium-blue mt-1.5 flex-shrink-0" />
                    <span>濃い青色の領域：AIが本物と判断した部分</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-intel-bright-cyan mt-1.5 flex-shrink-0" />
                    <span>明るい青色の領域：疑わしい特徴が検出された部分</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-intel-dark-blue mt-1.5 flex-shrink-0" />
                    <span>グリッド：モデルが分析した特徴マップ</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-foreground/40 border-2 border-dashed border-intel-pale-blue/60 rounded-lg">
              <div className="text-center space-y-2">
                <Lightbulb className="w-12 h-12 mx-auto opacity-50" />
                <p>画像をアップロードして可視化を開始</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualizationTab;

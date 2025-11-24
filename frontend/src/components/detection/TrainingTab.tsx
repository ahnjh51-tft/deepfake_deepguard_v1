import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Brain, Play, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TrainingTab = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [epochs, setEpochs] = useState("10");
  const [batchSize, setBatchSize] = useState("32");
  const [learningRate, setLearningRate] = useState("0.001");
  const { toast } = useToast();

  const handleTrain = () => {
    setIsTraining(true);
    setTrainingProgress(0);

    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          toast({
            title: "訓練完了",
            description: "モデルの訓練が正常に完了しました",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Training Configuration */}
      <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
        <CardHeader className="bg-intel-pale-blue/20 border-b border-intel-pale-blue/40">
          <CardTitle className="flex items-center gap-2 text-intel-dark-blue">
            <Brain className="w-6 h-6" />
            訓練設定
          </CardTitle>
          <CardDescription className="text-foreground/70">ディープラーニングモデル v2 の訓練パラメータ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">{/* ... keep existing code */}
          <div className="space-y-2">
            <Label htmlFor="epochs" className="text-foreground/70">
              エポック数
            </Label>
            <Input
              id="epochs"
              type="number"
              value={epochs}
              onChange={(e) => setEpochs(e.target.value)}
              className="border-intel-pale-blue/60 focus:border-intel-medium-blue focus:ring-intel-medium-blue"
              disabled={isTraining}
            />
            <p className="text-xs text-foreground/60">訓練の繰り返し回数（推奨: 10-50）</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch-size" className="text-foreground/70">
              バッチサイズ
            </Label>
            <Input
              id="batch-size"
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
              className="border-intel-pale-blue/60 focus:border-intel-medium-blue focus:ring-intel-medium-blue"
              disabled={isTraining}
            />
            <p className="text-xs text-foreground/60">一度に処理する画像数（推奨: 16-64）</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="learning-rate" className="text-foreground/70">
              学習率
            </Label>
            <Input
              id="learning-rate"
              type="number"
              step="0.0001"
              value={learningRate}
              onChange={(e) => setLearningRate(e.target.value)}
              className="border-intel-pale-blue/60 focus:border-intel-medium-blue focus:ring-intel-medium-blue"
              disabled={isTraining}
            />
            <p className="text-xs text-foreground/60">モデルの学習速度（推奨: 0.0001-0.01）</p>
          </div>

          <div className="p-4 rounded-lg bg-intel-pale-blue/20 border border-intel-medium-blue/30">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-intel-medium-blue flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-intel-medium-blue">データソース</p>
                <p className="text-xs text-foreground/60">
                  Supabaseから画像とメタデータを自動的に読み込みます
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleTrain}
            disabled={isTraining}
            className="w-full bg-intel-medium-blue hover:bg-intel-dark-blue text-white font-medium"
            size="lg"
          >
            {isTraining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                訓練中...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                訓練開始
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Training Progress */}
      <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
        <CardHeader className="bg-intel-pale-blue/20 border-b border-intel-pale-blue/40">
          <CardTitle className="text-intel-dark-blue">訓練進捗</CardTitle>
          <CardDescription className="text-foreground/70">リアルタイムの訓練状況</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">{/* ... keep existing code */}
          {!isTraining && trainingProgress === 0 ? (
            <div className="flex items-center justify-center h-64 text-foreground/40">
              <div className="text-center space-y-2">
                <Brain className="w-12 h-12 mx-auto opacity-50" />
                <p>訓練パラメータを設定して開始してください</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">進捗</span>
                  <span className="font-medium text-intel-medium-blue">{trainingProgress}%</span>
                </div>
                <Progress value={trainingProgress} className="h-3" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-intel-pale-blue/20 border border-intel-pale-blue/60">
                  <span className="text-sm text-foreground/60">現在のエポック</span>
                  <span className="font-medium text-intel-medium-blue">
                    {Math.floor((trainingProgress / 100) * parseInt(epochs))} / {epochs}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-intel-pale-blue/20 border border-intel-pale-blue/60">
                  <span className="text-sm text-foreground/60">バッチサイズ</span>
                  <span className="font-medium text-intel-medium-blue">{batchSize}</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-intel-pale-blue/20 border border-intel-pale-blue/60">
                  <span className="text-sm text-foreground/60">学習率</span>
                  <span className="font-medium text-intel-medium-blue">{learningRate}</span>
                </div>
              </div>

              {trainingProgress === 100 && (
                <div className="p-4 rounded-lg bg-intel-deep-teal/10 border border-intel-deep-teal/60">
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-5 h-5 text-intel-deep-teal flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-intel-deep-teal">訓練完了</p>
                      <p className="text-xs text-foreground/60">
                        モデルが更新され、検出タブで使用可能になりました
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingTab;

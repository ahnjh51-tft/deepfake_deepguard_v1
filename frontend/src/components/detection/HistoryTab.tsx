import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, TrendingUp, CheckCircle, XCircle, BarChart3, Download, Maximize2 } from "lucide-react";
import { useHistoryData } from "@/context/HistoryContext";
import { useAuth } from "@/context/AuthContext";

type TimeRange = "daily" | "weekly" | "monthly";

const HistoryTab = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const { history } = useHistoryData();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [selectedEntry, setSelectedEntry] = useState<typeof history[number] | null>(null);

  const fallbackThumbnail =
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop";

  const stats = useMemo(() => {
    const total = history.length;
    const real = history.filter((entry) => entry.resultLabel.includes("本物")).length;
    const fake = total - real;
    return { total, real, fake };
  }, [history]);

  const realPercentage = stats.total > 0 ? (stats.real / stats.total) * 100 : 0;

  const buildCsv = () => {
    const header = ["timestamp", "user_id", "model", "result", "confidence"];
    const rows = history.map((entry) => [
      entry.timestamp,
      entry.userId,
      entry.modelName,
      entry.resultLabel,
      entry.confidence.toFixed(2),
    ]);
    return [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
  };

  const buildJson = () => {
    return JSON.stringify(
      history.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        user_id: entry.userId,
        model: entry.modelName,
        result: entry.resultLabel,
        confidence: entry.confidence,
      })),
      null,
      2
    );
  };

  const triggerDownload = (payload: string, filename: string, mime: string) => {
    const blob = new Blob([payload], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!history.length) return;
    triggerDownload(buildCsv(), `deepguard_history_${Date.now()}.csv`, "text/csv;charset=utf-8;");
  };

  const handleExportJson = () => {
    if (!history.length) return;
    triggerDownload(buildJson(), `deepguard_history_${Date.now()}.json`, "application/json;charset=utf-8;");
  };

  return (
    <>
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
          <CardHeader className="pb-3 bg-intel-pale-blue/20">
            <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-intel-medium-blue" />
              総検出数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-intel-medium-blue">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
          <CardHeader className="pb-3 bg-intel-pale-blue/20">
            <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-intel-deep-teal" />
              本物の割合
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-intel-deep-teal">{realPercentage.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
          <CardHeader className="pb-3 bg-intel-pale-blue/20">
            <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-intel-dark-blue" />
              偽物の割合
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-intel-dark-blue">
              {(100 - realPercentage).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
        <CardHeader className="bg-intel-pale-blue/20 border-b border-intel-pale-blue/40">
          <CardTitle className="flex items-center gap-2 text-intel-dark-blue">
            <Calendar className="w-5 h-5" />
            期間フィルター
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-full md:w-64 border-intel-pale-blue/60 focus:border-intel-medium-blue focus:ring-intel-medium-blue">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">日次</SelectItem>
              <SelectItem value="weekly">週次</SelectItem>
              <SelectItem value="monthly">月次</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* History List */}
      <Card className="border-2 border-intel-pale-blue/60 bg-white shadow-card">
        <CardHeader className="bg-intel-pale-blue/20 border-b border-intel-pale-blue/40">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-intel-dark-blue">
                <TrendingUp className="w-5 h-5" />
                検出履歴
              </CardTitle>
              <CardDescription className="text-foreground/70">過去の検出結果一覧</CardDescription>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-intel-medium-blue text-intel-medium-blue hover:bg-intel-pale-blue/20"
                  onClick={handleExportCsv}
                  disabled={!history.length}
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-intel-medium-blue text-intel-medium-blue hover:bg-intel-pale-blue/20"
                  onClick={handleExportJson}
                  disabled={!history.length}
                >
                  <Download className="w-4 h-4 mr-2" />
                  JSON
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {history.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-foreground/50">
              検出履歴がまだありません。
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-intel-pale-blue/60 hover:border-intel-medium-blue/60 hover:bg-intel-pale-blue/10 transition-all cursor-pointer"
                  onClick={() => setSelectedEntry(item)}
                >
                  <img
                    src={item.previewDataUrl || fallbackThumbnail}
                    alt="Thumbnail"
                    className="w-16 h-16 rounded-lg object-cover border-2 border-intel-pale-blue/60"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.resultLabel.includes("本物") ? (
                        <CheckCircle className="w-4 h-4 text-intel-deep-teal flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-intel-dark-blue flex-shrink-0" />
                      )}
                      <span
                        className={`font-medium ${
                          item.resultLabel.includes("本物")
                            ? "text-intel-deep-teal"
                            : "text-intel-dark-blue"
                        } truncate`}
                      >
                        {item.resultLabel}
                      </span>
                      <span className="text-sm text-foreground/60">({item.confidence.toFixed(1)}%)</span>
                    </div>
                    <p className="text-sm text-foreground/70 truncate">{item.modelName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-foreground/60">
                      {new Date(item.timestamp).toLocaleDateString("ja-JP")}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {new Date(item.timestamp).toLocaleTimeString("ja-JP")}
                  </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-5xl">
          {selectedEntry && (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold mb-1">{selectedEntry.resultLabel}</div>
                <div className="text-sm text-foreground/60">
                  {new Date(selectedEntry.timestamp).toLocaleString("ja-JP")} ・ {selectedEntry.modelName}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { src: selectedEntry.originalWithBoxes, title: "疑わしい領域（原画像）" },
                  { src: selectedEntry.elaHeatmap, title: "ELAヒートマップ" },
                  { src: selectedEntry.elaWithBoxes, title: "ELA＋疑わしい領域" },
                ]
                  .filter((img) => img.src)
                  .map((img) => (
                    <div
                      key={img.title}
                      className="border border-intel-pale-blue/60 rounded-lg overflow-hidden bg-white shadow-sm"
                    >
                      <div className="p-2 text-sm font-medium text-foreground/70 flex items-center gap-2">
                        <Maximize2 className="w-4 h-4 text-foreground/50" />
                        <span>{img.title}</span>
                      </div>
                      <img src={img.src as string} alt={img.title} className="w-full h-48 object-contain bg-white" />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HistoryTab;

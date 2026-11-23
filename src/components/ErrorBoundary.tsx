import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Download } from 'lucide-react';
import { exportAllData, resetAllDataToDefault } from '../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled runtime error in POS application:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleEmergencyExport = () => {
    try {
      const data = exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cy-coffee-emergency-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Gagal membuat backup darurat: ' + (e instanceof Error ? e.message : 'Error'));
    }
  };

  private handleEmergencyReset = () => {
    if (confirm('Apakah Anda yakin ingin me-reset aplikasi ke kondisi awal? Seluruh menu dan setting akan dikembalikan ke default.')) {
      this.handleEmergencyExport();
      resetAllDataToDefault();
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-2xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Terjadi Kendala pada Aplikasi
              </h1>
              <p className="text-sm text-stone-400 leading-relaxed">
                Sistem mendeteksi galat tak terduga. Data transaksi dan menu Anda tetap tersimpan aman di peramban.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-stone-950/80 border border-stone-800 rounded-lg p-3 text-left">
                <p className="text-xs font-mono text-red-400 truncate">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition active:scale-[0.98] shadow-lg shadow-emerald-900/30"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang Aplikasi
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={this.handleEmergencyExport}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-xl text-xs font-medium transition active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Cadangkan JSON
                </button>
                <button
                  onClick={this.handleEmergencyReset}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/50 rounded-xl text-xs font-medium transition active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset ke Default
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-500">
              CY Coffee POS System • Zero Runtime Crash Recovery
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

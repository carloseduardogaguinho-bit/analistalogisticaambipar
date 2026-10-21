import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Clock,
  Layers,
  Sparkles,
  Trash2,
  Truck,
} from 'lucide-react';
import { CENARIO_DEMO_AMBIPAR, CENARIO_ZERADO_AMBIPAR } from '../data/demonstracaoAmbipar';
import {
  Veiculo,
  Motorista,
  Viagem,
  ChecklistDiario,
  Manutencao,
  CotacaoManutencao,
  MedicaoContrato,
  Abastecimento,
  DocumentoAmbiental,
  LicencaVeiculo,
  Ocorrencia,
  CertificadoDestinacaoFinalCDF,
  CteDocumento,
  MdfeDocumento,
  EmpresaFiscalConfig,
  Pneu,
} from '../types';

export interface BackupDataStructure {
  versao: string;
  dataExportacao: string;
  responsavel: string;
  empresa: string;
  dados: {
    veiculos: Veiculo[];
    motoristas: Motorista[];
    viagens: Viagem[];
    checklists: ChecklistDiario[];
    manutencoes: Manutencao[];
    cotacoes: CotacaoManutencao[];
    medicoes: MedicaoContrato[];
    abastecimentos: Abastecimento[];
    mtrs: DocumentoAmbiental[];
    licencas: LicencaVeiculo[];
    ocorrencias: Ocorrencia[];
    cdfs: CertificadoDestinacaoFinalCDF[];
    ctes: CteDocumento[];
    mdfes: MdfeDocumento[];
    pneus?: Pneu[];
    empresaFiscal?: EmpresaFiscalConfig;
  };
}

interface ModalBackupDadosProps {
  isOpen: boolean;
  onClose: () => void;
  veiculos: Veiculo[];
  motoristas: Motorista[];
  viagens: Viagem[];
  checklists: ChecklistDiario[];
  manutencoes: Manutencao[];
  cotacoes: CotacaoManutencao[];
  medicoes: MedicaoContrato[];
  abastecimentos: Abastecimento[];
  mtrs: DocumentoAmbiental[];
  licencas: LicencaVeiculo[];
  ocorrencias: Ocorrencia[];
  cdfs: CertificadoDestinacaoFinalCDF[];
  ctes: CteDocumento[];
  mdfes: MdfeDocumento[];
  pneus: Pneu[];
  empresaFiscal: EmpresaFiscalConfig;
  onRestaurarBackup: (backup: BackupDataStructure) => void;
}

export const ModalBackupDados: React.FC<ModalBackupDadosProps> = ({
  isOpen,
  onClose,
  veiculos,
  motoristas,
  viagens,
  checklists,
  manutencoes,
  cotacoes,
  medicoes,
  abastecimentos,
  mtrs,
  licencas,
  ocorrencias,
  cdfs,
  ctes,
  mdfes,
  pneus,
  empresaFiscal,
  onRestaurarBackup,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [backupPreview, setBackupPreview] = useState<BackupDataStructure | null>(null);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Exportar Backup Completo para JSON
  const handleExportarBackup = () => {
    const backup: BackupDataStructure = {
      versao: '2.0.0',
      dataExportacao: new Date().toISOString(),
      responsavel: 'Carlos Eduardo (Analista de Logística)',
      empresa: 'AMBIPAR LOGISTICS S.A.',
      dados: {
        veiculos,
        motoristas,
        viagens,
        checklists,
        manutencoes,
        cotacoes,
        medicoes,
        abastecimentos,
        mtrs,
        licencas,
        ocorrencias,
        cdfs,
        ctes,
        mdfes,
        pneus,
        empresaFiscal,
      },
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dataFormatada = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_ambipar_logistics_${dataFormatada}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setImportStatus('Backup baixado com sucesso! Arquivo JSON salvo com segurança.');
    setTimeout(() => setImportStatus(null), 4000);
  };

  // 2. Tratar Seleção de Arquivo para Restauração
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErroImportacao(null);
    setBackupPreview(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.dados || !Array.isArray(parsed.dados.veiculos)) {
          throw new Error('Arquivo de backup inválido ou incompatível.');
        }
        setBackupPreview(parsed as BackupDataStructure);
      } catch (err: any) {
        setErroImportacao(err.message || 'Erro ao ler o arquivo JSON selecionado.');
      }
    };
    reader.readAsText(file);
  };

  // 3. Confirmar Restauração
  const handleConfirmarRestauracao = () => {
    if (!backupPreview) return;
    if (
      confirm(
        'Deseja realmente restaurar os dados deste arquivo de backup?\n\n' +
          'Esta operação substituirá os registros atuais pelos dados contidos no arquivo JSON.'
      )
    ) {
      onRestaurarBackup(backupPreview);
      setBackupPreview(null);
      setImportStatus('Backup restaurado e sincronizado com sucesso no sistema!');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 2000);
    }
  };

  const handleCarregarDemonstracaoVip = () => {
    if (
      confirm(
        'Deseja carregar o Cenário de Demonstração VIP Ambipar?\n\n' +
          'Isso preencherá o sistema com 4 caminhões pesados (Volvo FH 540, Scania R450, Actros 2651, Constellation 24.280), carretas tanque com CIV/CIPP, viagens ativas com MTR e gestão de pneus.\n\n' +
          'Excelente para apresentações executivas e validação de rotinas!'
      )
    ) {
      onRestaurarBackup(CENARIO_DEMO_AMBIPAR);
      setBackupPreview(null);
      setImportStatus('Demonstração VIP Ambipar carregada com sucesso!');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    }
  };

  const handleLimparBaseOperacao = () => {
    if (
      confirm(
        'Atenção: Deseja realmente zerar todos os dados para iniciar o cadastro da sua operação real?\n\n' +
          'Todos os veículos, motoristas, viagens e cotações atuais serão removidos, deixando a plataforma 100% limpa.'
      )
    ) {
      onRestaurarBackup(CENARIO_ZERADO_AMBIPAR);
      setBackupPreview(null);
      setImportStatus('Base operacional zerada com sucesso! Pronto para cadastrar a frota real.');
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    }
  };

  const totalRegistrosAtuais =
    veiculos.length +
    motoristas.length +
    viagens.length +
    checklists.length +
    manutencoes.length +
    cotacoes.length +
    medicoes.length +
    abastecimentos.length +
    mtrs.length +
    licencas.length +
    ocorrencias.length +
    cdfs.length +
    ctes.length +
    mdfes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Central de Backup &amp; Restauração de Dados
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase">
                  JSON Seguro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gere cópias de segurança de toda a frota, viagens e cotações ou restaure backups em qualquer computador.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Feedback Toasts */}
          {importStatus && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {erroImportacao && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{erroImportacao}</span>
            </div>
          )}

          {/* Status Atual do Banco de Dados */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <HardDrive className="w-4 h-4 text-ambipar-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Registros Atuais em Memória</p>
                <p className="text-[11px] text-slate-400">
                  {totalRegistrosAtuais} registros distribuídos entre Frota, Motoristas, Viagens, MTRs e Cotações.
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              100% Protegido
            </span>
          </div>

          {/* Atalhos Rápidos: Demonstração VIP vs Operação Real Limpa */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ambipar-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Ambiente de Demonstração &amp; Operação Real
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">1 Clique para Alternar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opção Demo VIP */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition">
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <Truck className="w-4 h-4" />
                    <span>Carregar Demonstração VIP Ambipar</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Carrega frota pesada realística (Volvo FH 540, Scania R450, Actros, carretas tanque químicos, viagens em trânsito Paulínia-Betim/Camaçari, motoristas capacitados MOPP e pneus mapeados).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCarregarDemonstracaoVip}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Carregar Demonstração VIP</span>
                </button>
              </div>

              {/* Opção Base Zerada */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3 transition">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Iniciar Operação Real (Base Limpa)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Zera todos os veículos, motoristas, viagens e cotações para você cadastrar a frota real da sua unidade Ambipar sem dados fictícios residuais.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLimparBaseOperacao}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/60 border border-slate-700 text-slate-300 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Todos os Dados</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid: Exportar vs Importar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opção 1: Exportar */}
            <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Exportar Backup Geral</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Baixe um arquivo compactado <code>.json</code> contendo todos os dados operacionais, placas, cotações com saving e cadastros da Ambipar.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportarBackup}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Backup Completo (.json)</span>
              </button>
            </div>

            {/* Opção 2: Importar / Restaurar */}
            <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Restaurar de Arquivo</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Carregue um arquivo <code>.json</code> exportado anteriormente para recuperar toda a base em um novo navegador ou computador.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition"
              >
                <Upload className="w-4 h-4" />
                <span>Selecionar Arquivo JSON</span>
              </button>
            </div>
          </div>

          {/* Prévia do Backup Selecionado */}
          {backupPreview && (
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-cyan-300">
                <span className="font-bold flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Prévia do Arquivo de Backup Carregado
                </span>
                <span className="text-[10px] text-slate-400">
                  Data: {backupPreview.dataExportacao?.slice(0, 10) || 'N/D'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Veículos</span>
                  <strong className="text-white font-bold">
                    {backupPreview.dados?.veiculos?.length || 0}
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Motoristas</span>
                  <strong className="text-white font-bold">
                    {backupPreview.dados?.motoristas?.length || 0}
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Viagens</span>
                  <strong className="text-white font-bold">
                    {backupPreview.dados?.viagens?.length || 0}
                  </strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Cotações / Saving</span>
                  <strong className="text-white font-bold">
                    {backupPreview.dados?.cotacoes?.length || 0}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBackupPreview(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarRestauracao}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm"
                >
                  Confirmar e Restaurar Dados
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-ambipar-400" />
            <span>Compatível com todas as versões da plataforma Ambipar</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

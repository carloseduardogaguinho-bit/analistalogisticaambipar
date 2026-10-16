import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Viagem } from '../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Table
} from 'lucide-react';
import { formatNumber, formatCurrency } from '../utils/formatters';

interface ImportadorViewProps {
  viagens: Viagem[];
  onImportViagens: (novasViagens: Viagem[]) => void;
}

export const ImportadorView: React.FC<ImportadorViewProps> = ({
  viagens,
  onImportViagens,
}) => {
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccessMessage('');
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setErrorMessage('A planilha selecionada está vazia.');
          return;
        }

        setParsedRows(data);
      } catch (err) {
        setErrorMessage('Erro ao ler arquivo. Certifique-se de que é um Excel (.xlsx/.xls) ou CSV válido.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    const novas: Viagem[] = parsedRows.map((row: any, idx) => {
      return {
        id: `imp-${Date.now()}-${idx}`,
        codigoViagem: row['Codigo'] || row['Código'] || row['Viagem'] || `AMB-IMP-${Math.floor(1000 + Math.random() * 9000)}`,
        cliente: row['Cliente'] || row['Cliente Gerador'] || 'Cliente Importado',
        origem: row['Origem'] || 'Base Origem',
        destino: row['Destino'] || 'Destino Ambipar',
        baseOperacional: row['Base'] || 'Base Operacional',
        motorista: row['Motorista'] || 'Motorista a designar',
        placaCavalo: row['Placa'] || row['Placa Cavalo'] || 'IMP-0000',
        tipoEquipamento: (row['Equipamento'] as any) || 'Roll-on / Roll-off',
        classeResiduo: (row['Classe'] as any) || 'Classe I - Perigoso (Inflamável / Tóxico)',
        pesoToneladas: Number(row['Peso'] || row['Toneladas'] || 15),
        distanciaKm: Number(row['Km'] || row['Distancia'] || 50),
        dataSaidaPrevista: row['Saida'] || new Date().toISOString().slice(0, 16).replace('T', ' '),
        dataChegadaPrevista: row['Chegada'] || new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16).replace('T', ' '),
        status: (row['Status'] as any) || 'Em Trânsito',
        numeroMTR: row['MTR'] || `MTR-SINIR-${Math.floor(100000 + Math.random() * 900000)}`,
        numeroCTe: row['CTe'] || `352610-${Math.floor(100000 + Math.random() * 900000)}`,
        tipoCombustivel: (row['Combustivel'] as any) || 'HVO (Diesel Verde)',
        custoTotal: Number(row['Custo'] || 1500),
        observacoes: row['Obs'] || 'Importado via planilha Excel',
      };
    });

    onImportViagens(novas);
    setSuccessMessage(`${novas.length} viagens foram importadas com sucesso para o sistema!`);
    setParsedRows([]);
  };

  const handleExportCurrentData = () => {
    const exportData = viagens.map((v) => ({
      'Código Viagem': v.codigoViagem,
      'Cliente': v.cliente,
      'Origem': v.origem,
      'Destino': v.destino,
      'Base Operacional': v.baseOperacional,
      'Motorista': v.motorista,
      'Placa Cavalo': v.placaCavalo,
      'Equipamento': v.tipoEquipamento,
      'Classe Resíduo': v.classeResiduo,
      'Peso (Ton)': v.pesoToneladas,
      'Distância (Km)': v.distanciaKm,
      'Status': v.status,
      'MTR SINIR': v.numeroMTR,
      'CT-e': v.numeroCTe,
      'Combustível': v.tipoCombustivel,
      'Custo Total (R$)': v.custoTotal,
      'Observações': v.observacoes,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Viagens Ambipar');
    XLSX.writeFile(wb, `Ambipar_Relatorio_Logistica_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Codigo': 'AMB-SP-2026-9901',
        'Cliente': 'Exemplo Quimica SA',
        'Origem': 'Paulínia - SP',
        'Destino': 'Ambipar Nova Odessa - SP',
        'Motorista': 'João Silva',
        'Placa': 'BRA-1A23',
        'Equipamento': 'Carreta Tanque Inox',
        'Classe': 'Classe I - Perigoso (Inflamável / Tóxico)',
        'Peso': 22.5,
        'Km': 45,
        'Status': 'Em Trânsito',
        'MTR': 'MTR-SINIR-123456',
        'CTe': '352610-123456',
        'Combustivel': 'HVO (Diesel Verde)',
        'Custo': 1800,
        'Obs': 'Exemplo de carga'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    XLSX.writeFile(wb, 'Modelo_Importacao_Ambipar.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
          <span>Central de Integração & Importador de Planilhas (Excel / CSV)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Facilidade para o analista: importe relatórios diários de rastreadores ou exporte relatórios consolidados em formato Excel (.xlsx).
        </p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Import Upload */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
              <Upload className="w-4 h-4" />
              <span>Importar Planilha Externa</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arraste ou selecione a planilha de programação do cliente ou relatório do rastreador (Autotrac, Sascar, OnixSat, SAP, etc).
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 text-center transition cursor-pointer relative bg-slate-950/40">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileSpreadsheet className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white">
              {fileName ? fileName : 'Clique ou solte o arquivo Excel/CSV aqui'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Formatos suportados: .xlsx, .xls, .csv</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleDownloadTemplate}
              className="text-xs text-slate-400 hover:text-cyan-300 underline font-medium"
            >
              Baixar modelo padrão de planilha
            </button>
          </div>
        </div>

        {/* Card 2: Export Data */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
              <Download className="w-4 h-4" />
              <span>Exportar Dados em Excel (.xlsx)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exporte instantaneamente todas as {viagens.length} viagens cadastradas no sistema com todas as colunas operacionais, ambientais e financeiras.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Registros totais:</span>
              <strong className="text-white">{viagens.length} viagens</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Volume consolidado:</span>
              <strong className="text-white">{formatNumber(viagens.reduce((acc, v) => acc + v.pesoToneladas, 0))} t</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Custo total computado:</span>
              <strong className="text-white">{formatCurrency(viagens.reduce((acc, v) => acc + v.custoTotal, 0))}</strong>
            </div>
          </div>

          <button
            onClick={handleExportCurrentData}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Planilha Excel Completa</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preview Table of Uploaded Data */}
      {parsedRows.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">
                Pré-visualização dos Dados ({parsedRows.length} linhas detectadas)
              </h3>
            </div>
            <button
              onClick={handleConfirmImport}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
            >
              <FileCheck className="w-4 h-4" />
              <span>Confirmar e Importar {parsedRows.length} Viagens</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold sticky top-0">
                  {Object.keys(parsedRows[0] || {}).slice(0, 8).map((k) => (
                    <th key={k} className="py-2.5 px-3 whitespace-nowrap">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {parsedRows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    {Object.values(row).slice(0, 8).map((v: any, cidx) => (
                      <td key={cidx} className="py-2 px-3 text-slate-300 truncate max-w-xs">{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 10 && (
            <p className="text-[11px] text-slate-500 text-center">
              Mostrando as 10 primeiras linhas de {parsedRows.length}.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

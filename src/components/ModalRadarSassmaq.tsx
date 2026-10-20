import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Truck,
  User,
  MessageCircle,
  FileText,
  Filter,
  Printer,
  ChevronRight,
  Gauge,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Veiculo, Motorista } from '../types';

interface ModalRadarSassmaqProps {
  isOpen: boolean;
  onClose: () => void;
  veiculos: Veiculo[];
  motoristas: Motorista[];
  onNavigateToTab?: (tab: any) => void;
}

export type SeveridadeAlertaSassmaq = 'Critico' | 'Atencao' | 'Conforme';

export interface ItemAuditoriaSassmaq {
  id: string;
  categoria: 'Motorista' | 'Veículo';
  entidadeId: string;
  entidadeNome: string;
  entidadeSubtitulo?: string;
  documentoTipo: string;
  identificadorDocumento?: string;
  dataValidade?: string;
  diasRestantes?: number;
  odometroAtual?: number;
  odometroMeta?: number;
  kmRestantes?: number;
  severidade: SeveridadeAlertaSassmaq;
  descricaoProblema: string;
  telefoneContato?: string;
}

export const ModalRadarSassmaq: React.FC<ModalRadarSassmaqProps> = ({
  isOpen,
  onClose,
  veiculos,
  motoristas,
  onNavigateToTab,
}) => {
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [termoBusca, setTermoBusca] = useState('');

  // Data de referência de hoje para cálculo
  const hoje = useMemo(() => new Date(), []);

  // Calcular diferença de dias
  const calcularDiasRestantes = (dataStr?: string): number | null => {
    if (!dataStr) return null;
    try {
      const parts = dataStr.split('-');
      if (parts.length !== 3) return null;
      const dataAlvo = new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
      );
      const diffTime = dataAlvo.getTime() - hoje.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  // Avaliar todos os itens da frota e motoristas
  const itensAuditados: ItemAuditoriaSassmaq[] = useMemo(() => {
    const list: ItemAuditoriaSassmaq[] = [];

    // 1. Auditoria dos Motoristas
    motoristas.forEach((m) => {
      // CNH
      const diasCnh = calcularDiasRestantes(m.validadeCnh);
      if (diasCnh !== null) {
        list.push({
          id: `m-cnh-${m.id}`,
          categoria: 'Motorista',
          entidadeId: m.id,
          entidadeNome: m.nome,
          entidadeSubtitulo: `CPF: ${m.cpf} &middot; Base: ${m.baseOperacional}`,
          documentoTipo: `CNH Categoria ${m.categoriaCnh}`,
          identificadorDocumento: m.cnh,
          dataValidade: m.validadeCnh,
          diasRestantes: diasCnh,
          severidade: diasCnh < 0 ? 'Critico' : diasCnh <= 30 ? 'Atencao' : 'Conforme',
          descricaoProblema:
            diasCnh < 0
              ? `CNH VENCIDA há ${Math.abs(diasCnh)} dia(s)! Bloqueio de direção obrigatório.`
              : diasCnh <= 30
              ? `CNH expira em ${diasCnh} dia(s). Exige renovação médica no Detran.`
              : `CNH regular (válida por mais ${diasCnh} dias).`,
          telefoneContato: m.telefone,
        });
      }

      // MOPP (Produtos Perigosos)
      if (m.validadeMopp) {
        const diasMopp = calcularDiasRestantes(m.validadeMopp);
        if (diasMopp !== null) {
          list.push({
            id: `m-mopp-${m.id}`,
            categoria: 'Motorista',
            entidadeId: m.id,
            entidadeNome: m.nome,
            entidadeSubtitulo: `CPF: ${m.cpf}`,
            documentoTipo: 'Curso MOPP (Produtos Perigosos)',
            dataValidade: m.validadeMopp,
            diasRestantes: diasMopp,
            severidade: diasMopp < 0 ? 'Critico' : diasMopp <= 30 ? 'Atencao' : 'Conforme',
            descricaoProblema:
              diasMopp < 0
                ? `Certificação MOPP VENCIDA há ${Math.abs(diasMopp)} dia(s)! Impedimento de carga química Classe I.`
                : diasMopp <= 30
                ? `MOPP expira em ${diasMopp} dia(s). Agendar reciclagem SEST/SENAT.`
                : `MOPP regular e ativo (${diasMopp} dias restantes).`,
            telefoneContato: m.telefone,
          });
        }
      }

      // Exame Toxicológico
      if (m.validadeToxico) {
        const diasToxico = calcularDiasRestantes(m.validadeToxico);
        if (diasToxico !== null) {
          list.push({
            id: `m-tox-${m.id}`,
            categoria: 'Motorista',
            entidadeId: m.id,
            entidadeNome: m.nome,
            entidadeSubtitulo: `CPF: ${m.cpf}`,
            documentoTipo: 'Exame Toxicológico Periódico',
            dataValidade: m.validadeToxico,
            diasRestantes: diasToxico,
            severidade: diasToxico < 0 ? 'Critico' : diasToxico <= 30 ? 'Atencao' : 'Conforme',
            descricaoProblema:
              diasToxico < 0
                ? `Toxicológico VENCIDO há ${Math.abs(diasToxico)} dia(s)! Infração gravíssima Art. 165-B do CTB.`
                : diasToxico <= 30
                ? `Toxicológico expira em ${diasToxico} dia(s). Encaminhar ao laboratório conveniado.`
                : `Exame Toxicológico regular (${diasToxico} dias).`,
            telefoneContato: m.telefone,
          });
        }
      }

      // ASO (Saúde Ocupacional)
      if (m.validadeAso) {
        const diasAso = calcularDiasRestantes(m.validadeAso);
        if (diasAso !== null) {
          list.push({
            id: `m-aso-${m.id}`,
            categoria: 'Motorista',
            entidadeId: m.id,
            entidadeNome: m.nome,
            entidadeSubtitulo: `CPF: ${m.cpf}`,
            documentoTipo: 'ASO - Atestado de Saúde Ocupacional',
            dataValidade: m.validadeAso,
            diasRestantes: diasAso,
            severidade: diasAso < 0 ? 'Critico' : diasAso <= 30 ? 'Atencao' : 'Conforme',
            descricaoProblema:
              diasAso < 0
                ? `ASO VENCIDO há ${Math.abs(diasAso)} dia(s)! Inconformidade NR-07 / Medicina do Trabalho.`
                : diasAso <= 30
                ? `ASO vence em ${diasAso} dia(s). Agendar periódico.`
                : `ASO ocupacional em dia.`,
            telefoneContato: m.telefone,
          });
        }
      }
    });

    // 2. Auditoria dos Veículos da Frota
    veiculos.forEach((v) => {
      // CIV (Certificado de Inspeção Veicular)
      if (v.validadeCiv) {
        const diasCiv = calcularDiasRestantes(v.validadeCiv);
        if (diasCiv !== null) {
          list.push({
            id: `v-civ-${v.id}`,
            categoria: 'Veículo',
            entidadeId: v.id,
            entidadeNome: `${v.placa} - ${v.modelo}`,
            entidadeSubtitulo: `Equipamento: ${v.tipoEquipamento} &middot; Base: ${v.baseOperacional}`,
            documentoTipo: 'CIV - Inspeção Veicular (Inmetro)',
            identificadorDocumento: v.numeroCiv,
            dataValidade: v.validadeCiv,
            diasRestantes: diasCiv,
            severidade: diasCiv < 0 ? 'Critico' : diasCiv <= 30 ? 'Atencao' : 'Conforme',
            descricaoProblema:
              diasCiv < 0
                ? `Laudo CIV VENCIDO há ${Math.abs(diasCiv)} dia(s)! Veículo retido para produtos perigosos.`
                : diasCiv <= 30
                ? `CIV expira em ${diasCiv} dia(s). Agendar inspeção no Organismo Credenciado Inmetro (OIA).`
                : `CIV regular (${diasCiv} dias).`,
          });
        }
      }

      // CIPP (Produtos Perigosos a Granel)
      if (v.validadeCipp) {
        const diasCipp = calcularDiasRestantes(v.validadeCipp);
        if (diasCipp !== null) {
          list.push({
            id: `v-cipp-${v.id}`,
            categoria: 'Veículo',
            entidadeId: v.id,
            entidadeNome: `${v.placa} - ${v.modelo}`,
            entidadeSubtitulo: `Tanque/Caçamba: ${v.materialTanque || 'Granel'}`,
            documentoTipo: 'CIPP - Inspeção Produtos Perigosos',
            identificadorDocumento: v.numeroCipp,
            dataValidade: v.validadeCipp,
            diasRestantes: diasCipp,
            severidade: diasCipp < 0 ? 'Critico' : diasCipp <= 30 ? 'Atencao' : 'Conforme',
            descricaoProblema:
              diasCipp < 0
                ? `Laudo CIPP VENCIDO há ${Math.abs(diasCipp)} dia(s)! Bloqueio de carregamento no polo químico.`
                : diasCipp <= 30
                ? `CIPP expira em ${diasCipp} dia(s). Realizar ensaio de estanqueidade.`
                : `CIPP regular (${diasCipp} dias).`,
          });
        }
      }

      // Cronotacógrafo
      if (v.validadeCronotacografo) {
        const diasTaco = calcularDiasRestantes(v.validadeCronotacografo);
        if (diasTaco !== null) {
          list.push({
            id: `v-taco-${v.id}`,
            categoria: 'Veículo',
            entidadeId: v.id,
            entidadeNome: `${v.placa} - ${v.modelo}`,
            entidadeSubtitulo: `Chassi: ${v.chassi || 'N/D'}`,
            documentoTipo: 'Ensaio Metrológico Cronotacógrafo',
            identificadorDocumento: v.numeroCronotacografo,
            dataValidade: v.validadeCronotacografo,
            diasRestantes: diasTaco,
            severidade: diasTaco < 0 ? 'Critico' : diasTaco <= 30 ? 'Atencao' : 'Conforme',
            descricaoProblema:
              diasTaco < 0
                ? `Certificado de Cronotacógrafo VENCIDO há ${Math.abs(diasTaco)} dia(s)! Multa gravíssima PRF.`
                : diasTaco <= 30
                ? `Cronotacógrafo expira em ${diasTaco} dia(s). Agendar selagem e ensaio em posto autorizado.`
                : `Cronotacógrafo regular (${diasTaco} dias).`,
          });
        }
      }

      // Licença Ambiental de Transporte (CETESB / IBAMA)
      if (v.validadeLicencaAmbiental) {
        const diasLic = calcularDiasRestantes(v.validadeLicencaAmbiental);
        if (diasLic !== null) {
          list.push({
            id: `v-lic-${v.id}`,
            categoria: 'Veículo',
            entidadeId: v.id,
            entidadeNome: `${v.placa} - ${v.modelo}`,
            entidadeSubtitulo: `Órgão: CETESB / IBAMA`,
            documentoTipo: 'Licença Ambiental de Transporte de Resíduos',
            identificadorDocumento: v.licencaAmbientalTransporte,
            dataValidade: v.validadeLicencaAmbiental,
            diasRestantes: diasLic,
            severidade: diasLic < 0 ? 'Critico' : diasLic <= 45 ? 'Atencao' : 'Conforme',
            descricaoProblema:
              diasLic < 0
                ? `Licença Ambiental VENCIDA! Risco de apreensão imediata de carga e sanção CETESB.`
                : diasLic <= 45
                ? `Licença Ambiental expira em ${diasLic} dia(s). Protocolar renovação no órgão ambiental.`
                : `Licença Ambiental regular (${diasLic} dias).`,
          });
        }
      }

      // Revisão Preventiva por Odômetro (Km)
      if (v.proximaRevisaoKm && v.odometroAtualKm) {
        const kmFaltantes = v.proximaRevisaoKm - v.odometroAtualKm;
        const severidadeKm: SeveridadeAlertaSassmaq =
          kmFaltantes <= 0 ? 'Critico' : kmFaltantes <= 2500 ? 'Atencao' : 'Conforme';

        list.push({
          id: `v-rev-${v.id}`,
          categoria: 'Veículo',
          entidadeId: v.id,
          entidadeNome: `${v.placa} - ${v.modelo}`,
          entidadeSubtitulo: `Odômetro: ${v.odometroAtualKm.toLocaleString('pt-BR')} km`,
          documentoTipo: 'Manutenção Preventiva de Odômetro',
          odometroAtual: v.odometroAtualKm,
          odometroMeta: v.proximaRevisaoKm,
          kmRestantes: kmFaltantes,
          severidade: severidadeKm,
          descricaoProblema:
            kmFaltantes <= 0
              ? `REVISÃO ULTRAPASSADA por ${Math.abs(kmFaltantes).toLocaleString(
                  'pt-BR'
                )} km! Enviar imediatamente para oficina credenciada.`
              : kmFaltantes <= 2500
              ? `Faltam apenas ${kmFaltantes.toLocaleString(
                  'pt-BR'
                )} km para a próxima revisão preventiva. Abrir cotação.`
              : `Manutenção preventiva em dia (restam ${kmFaltantes.toLocaleString('pt-BR')} km).`,
        });
      }
    });

    return list;
  }, [motoristas, veiculos, hoje]);

  // Estatísticas do Radar
  const totalAuditado = itensAuditados.length;
  const criticosCount = itensAuditados.filter((i) => i.severidade === 'Critico').length;
  const atencaoCount = itensAuditados.filter((i) => i.severidade === 'Atencao').length;
  const conformesCount = itensAuditados.filter((i) => i.severidade === 'Conforme').length;

  const scoreSassmaq =
    totalAuditado > 0 ? Math.round((conformesCount / totalAuditado) * 100) : 100;

  // Filtragem dos itens exibidos
  const itensFiltrados = itensAuditados.filter((item) => {
    // Filtro de severidade
    if (filtroSeveridade === 'criticos' && item.severidade !== 'Critico') return false;
    if (filtroSeveridade === 'atencao' && item.severidade !== 'Atencao') return false;
    if (filtroSeveridade === 'conformes' && item.severidade !== 'Conforme') return false;
    if (filtroSeveridade === 'pendencias' && item.severidade === 'Conforme') return false;

    // Filtro de categoria
    if (filtroCategoria === 'motoristas' && item.categoria !== 'Motorista') return false;
    if (filtroCategoria === 'veiculos' && item.categoria !== 'Veículo') return false;

    // Termo de busca
    if (termoBusca) {
      const q = termoBusca.toLowerCase();
      return (
        item.entidadeNome.toLowerCase().includes(q) ||
        item.documentoTipo.toLowerCase().includes(q) ||
        (item.identificadorDocumento &&
          item.identificadorDocumento.toLowerCase().includes(q)) ||
        item.descricaoProblema.toLowerCase().includes(q)
      );
    }

    return true;
  });

  if (!isOpen) return null;

  const handleEnviarNotificacaoWhatsapp = (item: ItemAuditoriaSassmaq) => {
    const tel = item.telefoneContato?.replace(/\D/g, '') || '';
    const texto = encodeURIComponent(
      `*AMBIPAR LOGISTICS - ALERTA OPERACIONAL DE REGULARIZAÇÃO SASSMAQ*\n\n` +
        `Olá *${item.entidadeNome}*,\n\n` +
        `Informamos que consta pendência em seu cadastro operacional de transporte:\n` +
        `📋 *Documento:* ${item.documentoTipo}\n` +
        `📅 *Validade Registrada:* ${item.dataValidade || 'N/D'}\n` +
        `⚠️ *Situação:* ${item.descricaoProblema}\n\n` +
        `Por favor, compareça ao ambulatório ou envie a guia de renovação atualizada à Central de Logística para regularização de sua escala de viagens.\n\n` +
        `_Atenciosamente, Gestão de Frota & SASSMAQ Ambipar._`
    );

    const url = tel
      ? `https://api.whatsapp.com/send?phone=55${tel}&text=${texto}`
      : `https://api.whatsapp.com/send?text=${texto}`;

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Radar SASSMAQ 360° &middot; Auditoria de Validades e Conformidade
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  ANTT / Inmetro / CETESB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Monitoramento contínuo de CNHs, MOPP, laudos CIV/CIPP de produtos perigosos, cronotacógrafos e revisões da frota Ambipar.
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

        {/* Top KPI Cards & Score SASSMAQ */}
        <div className="p-6 bg-slate-950/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
          {/* Card Score Geral */}
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Score SASSMAQ
              </p>
              <h4
                className={`text-2xl font-black ${
                  scoreSassmaq >= 90
                    ? 'text-emerald-400'
                    : scoreSassmaq >= 75
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {scoreSassmaq}%
              </h4>
              <p className="text-[10px] text-slate-500">
                {scoreSassmaq >= 90 ? 'Grau Auditável A+' : 'Requer Tratativa'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 flex items-center justify-center font-black text-xs text-slate-300">
              <Gauge className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Card Críticos / Vencidos */}
          <button
            onClick={() => setFiltroSeveridade('criticos')}
            className={`p-3.5 rounded-xl border text-left transition ${
              filtroSeveridade === 'criticos'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-rose-950/20 border-rose-900/40 hover:border-rose-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                Vencidos (Críticos)
              </p>
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
            <h4 className="text-2xl font-black text-rose-400 mt-1">{criticosCount}</h4>
            <p className="text-[10px] text-rose-300/80">Bloqueio Operacional Imediato</p>
          </button>

          {/* Card Atenção (< 30 dias) */}
          <button
            onClick={() => setFiltroSeveridade('atencao')}
            className={`p-3.5 rounded-xl border text-left transition ${
              filtroSeveridade === 'atencao'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-amber-950/20 border-amber-900/40 hover:border-amber-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                A Vencer (&le; 30d)
              </p>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="text-2xl font-black text-amber-400 mt-1">{atencaoCount}</h4>
            <p className="text-[10px] text-amber-300/80">Janela de Agendamento</p>
          </button>

          {/* Card Conformes */}
          <button
            onClick={() => setFiltroSeveridade('conformes')}
            className={`p-3.5 rounded-xl border text-left transition ${
              filtroSeveridade === 'conformes'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                100% Conformes
              </p>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-2xl font-black text-emerald-400 mt-1">{conformesCount}</h4>
            <p className="text-[10px] text-emerald-300/80">Sem pendências técnicas</p>
          </button>

          {/* Card Total Auditado */}
          <button
            onClick={() => setFiltroSeveridade('todos')}
            className={`p-3.5 rounded-xl border text-left transition ${
              filtroSeveridade === 'todos'
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Auditado
              </p>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <h4 className="text-2xl font-black text-white mt-1">{totalAuditado}</h4>
            <p className="text-[10px] text-slate-500">Itens monitorados em tempo real</p>
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filtrar por:
            </span>
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setFiltroCategoria('todos')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filtroCategoria === 'todos'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({totalAuditado})
              </button>
              <button
                type="button"
                onClick={() => setFiltroCategoria('motoristas')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                  filtroCategoria === 'motoristas'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3 h-3" />
                Motoristas
              </button>
              <button
                type="button"
                onClick={() => setFiltroCategoria('veiculos')}
                className={`px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 ${
                  filtroCategoria === 'veiculos'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-3 h-3" />
                Veículos / Reboques
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Buscar por motorista, placa, laudo ou documento..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Lista de Itens Auditados */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {itensFiltrados.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
              <p className="font-semibold text-slate-300">
                Nenhuma inconformidade encontrada com os filtros selecionados!
              </p>
              <p className="text-xs text-slate-500 mt-1">
                A frota e os motoristas atendem plenamente aos critérios SASSMAQ configurados.
              </p>
            </div>
          ) : (
            itensFiltrados.map((item) => {
              const isCritico = item.severidade === 'Critico';
              const isAtencao = item.severidade === 'Atencao';
              const isConforme = item.severidade === 'Conforme';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCritico
                      ? 'bg-rose-950/20 border-rose-800/50 hover:border-rose-700'
                      : isAtencao
                      ? 'bg-amber-950/20 border-amber-800/50 hover:border-amber-700'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Informações da Entidade e Documento */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        item.categoria === 'Motorista'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {item.categoria === 'Motorista' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Truck className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">
                          {item.entidadeNome}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            isCritico
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : isAtencao
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {isCritico ? 'Vencido' : isAtencao ? 'Atenção (30d)' : 'Conforme'}
                        </span>
                      </div>

                      {item.entidadeSubtitulo && (
                        <p
                          className="text-xs text-slate-400 mt-0.5"
                          dangerouslySetInnerHTML={{ __html: item.entidadeSubtitulo }}
                        />
                      )}

                      <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                        <span className="font-semibold text-slate-300">
                          {item.documentoTipo}
                        </span>
                        {item.identificadorDocumento && (
                          <span className="text-slate-500 font-mono text-[11px]">
                            Nº {item.identificadorDocumento}
                          </span>
                        )}
                        {item.dataValidade && (
                          <span className="flex items-center gap-1 text-slate-400 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            Vence em: {item.dataValidade}
                          </span>
                        )}
                        {item.odometroMeta && (
                          <span className="flex items-center gap-1 text-slate-400 font-medium">
                            <Gauge className="w-3.5 h-3.5 text-slate-500" />
                            Meta: {item.odometroMeta.toLocaleString('pt-BR')} km
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs mt-1 font-medium ${
                          isCritico
                            ? 'text-rose-400'
                            : isAtencao
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.descricaoProblema}
                      </p>
                    </div>
                  </div>

                  {/* Ações Rápidas por Item */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {item.categoria === 'Motorista' && (isCritico || isAtencao) && (
                      <button
                        type="button"
                        onClick={() => handleEnviarNotificacaoWhatsapp(item)}
                        title="Enviar notificação formal de convocação via WhatsApp"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Avisar no WhatsApp</span>
                      </button>
                    )}

                    {item.categoria === 'Veículo' && (isCritico || isAtencao) && onNavigateToTab && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToTab('cotacoes');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <Gauge className="w-3.5 h-3.5" />
                        <span>Abrir Cotação / Manutenção</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer com Auditoria e Botão de Fechar */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Auditoria SASSMAQ / ISO 14001 ativa em tempo real</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Relatório</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
            >
              Concluir Revisão
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

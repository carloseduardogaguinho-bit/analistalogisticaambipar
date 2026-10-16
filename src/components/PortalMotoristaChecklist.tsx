import React, { useState, useEffect } from 'react';
import { ChecklistDiario, Veiculo, Motorista, NivelTanque, SeveridadeAvaria } from '../types';
import {
  ClipboardCheck,
  Truck,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  LogOut,
  Calendar,
  Clock,
  Gauge,
  Flame,
  FileText,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface PortalMotoristaChecklistProps {
  veiculos: Veiculo[];
  motoristas: Motorista[];
  checklists: ChecklistDiario[];
  onAddChecklist: (checklist: ChecklistDiario) => void;
  onExitPortal?: () => void;
}

export const PortalMotoristaChecklist: React.FC<PortalMotoristaChecklistProps> = ({
  veiculos,
  motoristas,
  checklists,
  onAddChecklist,
  onExitPortal,
}) => {
  // Step: 'login' | 'select_tipo' | 'form_inicial' | 'form_final' | 'sucesso'
  const [step, setStep] = useState<'login' | 'select_tipo' | 'form_inicial' | 'form_final' | 'sucesso'>('login');

  // Login State
  const [cpfInput, setCpfInput] = useState('');
  const [motoristaLogado, setMotoristaLogado] = useState<Motorista | null>(null);
  const [nomeMotoristaManual, setNomeMotoristaManual] = useState('');
  const [placaSelecionada, setPlacaSelecionada] = useState('');

  // Checklist Inicial Aberto Hoje para este motorista/veículo
  const [jornadaAtiva, setJornadaAtiva] = useState<ChecklistDiario | null>(null);
  const [ultimoChecklistCriado, setUltimoChecklistCriado] = useState<ChecklistDiario | null>(null);

  // Form State: Checklist Inicial (Pré-Jornada)
  const [inicialData, setInicialData] = useState({
    kmInicial: 50000,
    nivelCombustivel: 'Cheio (100%)' as NivelTanque,
    nivelArla32: 'Normal (>50%)' as 'Normal (>50%)' | 'Atenção (<25%)' | 'Crítico',
    pneusPressaoEEstado: true,
    freiosEstacionamentoEServico: true,
    luzesESinalizacao: true,
    extintoresPQSValidade: true,
    kitEmergenciaAmbipar: true,
    vazamentoFluidos: true,
    documentacaoMTRCIVCIPP: true,
    tacografoDiscoOuDigital: true,
    episObrigatorios: true,
    niveisOleoRadiador: true,
    limpezaCabine: true,
    // Avarias Iniciais
    possuiAvarias: false,
    descricaoAvarias: '',
    localAvaria: 'Parachoque / Dianteira',
    severidadeAvaria: 'Leve (Apenas Visual/Estética)' as SeveridadeAvaria,
    observacoes: '',
  });

  // Form State: Checklist Final (Retorno à Base / Fim de Jornada)
  const [finalData, setFinalData] = useState({
    kmFinal: 50250,
    nivelCombustivel: '3/4' as NivelTanque,
    nivelArla32: 'Normal (>50%)' as 'Normal (>50%)' | 'Atenção (<25%)' | 'Crítico',
    pneusEstadoRetorno: true,
    freiosEstadoRetorno: true,
    residuosDescarregados: true,
    kitEmergenciaIntacto: true,
    limpezaFinal: true,
    // Avarias no Retorno
    avariasRetornoDetectadas: false,
    descricaoAvariasRetorno: '',
    localAvariaRetorno: 'Lataria / Lateral',
    severidadeAvariaRetorno: 'Leve (Apenas Visual/Estética)' as SeveridadeAvaria,
    observacoes: '',
  });

  // Formatação automática de CPF: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) {
      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
      v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCpfInput(v);
  };

  // Verificar se há sessão de motorista salva no localStorage do dispositivo
  useEffect(() => {
    try {
      const savedCpf = localStorage.getItem('ambipar_motorista_sessao_cpf');
      const savedNome = localStorage.getItem('ambipar_motorista_sessao_nome');
      const savedPlaca = localStorage.getItem('ambipar_motorista_sessao_placa');
      if (savedCpf) {
        setCpfInput(savedCpf);
        const mot = motoristas.find((m) => m.cpf.replace(/\D/g, '') === savedCpf.replace(/\D/g, ''));
        if (mot) {
          setMotoristaLogado(mot);
          setNomeMotoristaManual(mot.nome);
          setPlacaSelecionada(savedPlaca || mot.veiculoFixoPlaca || veiculos[0]?.placa || '');
          setStep('select_tipo');
        } else if (savedNome) {
          setNomeMotoristaManual(savedNome);
          setPlacaSelecionada(savedPlaca || veiculos[0]?.placa || '');
          setStep('select_tipo');
        }
      }
    } catch (e) {
      console.log('Nenhuma sessão anterior encontrada');
    }
  }, [motoristas, veiculos]);

  // Verificar se há checklist inicial hoje para a placa e motorista
  useEffect(() => {
    if ((motoristaLogado?.nome || nomeMotoristaManual) && placaSelecionada) {
      const nome = motoristaLogado?.nome || nomeMotoristaManual;
      const hoje = new Date().toISOString().slice(0, 10);
      
      const abertoHoje = checklists.find(
        (c) =>
          c.tipoInspecao === 'Saída para Viagem' &&
          c.veiculoPlaca === placaSelecionada &&
          (c.motoristaNome.toLowerCase() === nome.toLowerCase() || (c.motoristaCpf && c.motoristaCpf.replace(/\D/g, '') === cpfInput.replace(/\D/g, ''))) &&
          c.dataHora.startsWith(hoje) &&
          c.statusJornada !== 'Jornada Concluída'
      );

      if (abertoHoje) {
        setJornadaAtiva(abertoHoje);
        // Preenche o km inicial como base para o km final
        setFinalData((prev) => ({
          ...prev,
          kmFinal: abertoHoje.kmInicial + 100,
        }));
      } else {
        setJornadaAtiva(null);
      }

      // Atualiza km inicial sugerido a partir do odômetro do veículo
      const v = veiculos.find((veic) => veic.placa === placaSelecionada);
      if (v && v.odometroAtualKm) {
        setInicialData((prev) => ({ ...prev, kmInicial: v.odometroAtualKm }));
      }
    }
  }, [motoristaLogado, nomeMotoristaManual, placaSelecionada, checklists, veiculos, cpfInput]);

  // Login com CPF
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpfInput.replace(/\D/g, '');
    if (cleanCpf.length < 11) {
      alert('Por favor, informe um CPF válido com 11 dígitos.');
      return;
    }

    const mot = motoristas.find((m) => m.cpf.replace(/\D/g, '') === cleanCpf);
    if (mot) {
      setMotoristaLogado(mot);
      setNomeMotoristaManual(mot.nome);
      setPlacaSelecionada(mot.veiculoFixoPlaca || veiculos[0]?.placa || '');
      localStorage.setItem('ambipar_motorista_sessao_cpf', cpfInput);
      localStorage.setItem('ambipar_motorista_sessao_nome', mot.nome);
      if (mot.veiculoFixoPlaca) localStorage.setItem('ambipar_motorista_sessao_placa', mot.veiculoFixoPlaca);
      setStep('select_tipo');
    } else {
      // Motorista novo / não cadastrado
      const nomeDigitado = prompt(
        'CPF não localizado no cadastro de frotas. Informe seu Nome Completo para liberar o checklist:',
        nomeMotoristaManual || ''
      );
      if (nomeDigitado && nomeDigitado.trim().length > 2) {
        setNomeMotoristaManual(nomeDigitado.trim());
        setPlacaSelecionada(veiculos[0]?.placa || '');
        localStorage.setItem('ambipar_motorista_sessao_cpf', cpfInput);
        localStorage.setItem('ambipar_motorista_sessao_nome', nomeDigitado.trim());
        setStep('select_tipo');
      } else {
        alert('Nome obrigatório para registro do operador.');
      }
    }
  };

  // Logout / Trocar Motorista
  const handleLogout = () => {
    localStorage.removeItem('ambipar_motorista_sessao_cpf');
    localStorage.removeItem('ambipar_motorista_sessao_nome');
    localStorage.removeItem('ambipar_motorista_sessao_placa');
    setMotoristaLogado(null);
    setNomeMotoristaManual('');
    setCpfInput('');
    setStep('login');
  };

  // Enviar Checklist Inicial (Saída)
  const handleSubmitInicial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placaSelecionada) {
      alert('Selecione a placa do veículo.');
      return;
    }

    // Validação de itens críticos
    const falhaCritica =
      !inicialData.freiosEstacionamentoEServico ||
      !inicialData.vazamentoFluidos ||
      !inicialData.kitEmergenciaAmbipar ||
      !inicialData.extintoresPQSValidade;

    const falhaLeve =
      !inicialData.pneusPressaoEEstado ||
      !inicialData.luzesESinalizacao ||
      !inicialData.documentacaoMTRCIVCIPP ||
      !inicialData.tacografoDiscoOuDigital ||
      !inicialData.episObrigatorios ||
      (inicialData.possuiAvarias && inicialData.severidadeAvaria?.includes('Crítica'));

    let resultado: ChecklistDiario['resultado'] = 'Aprovado - Liberado';
    if (falhaCritica || (inicialData.possuiAvarias && inicialData.severidadeAvaria?.includes('Crítica'))) {
      resultado = 'Reprovado - Bloqueado';
    } else if (falhaLeve || inicialData.possuiAvarias) {
      resultado = 'Aprovado com Restrição Leve';
    }

    const jornadaId = `jornada-${Date.now()}`;
    const newChk: ChecklistDiario = {
      id: `chk-ini-${Date.now()}`,
      jornadaId,
      dataHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
      veiculoPlaca: placaSelecionada,
      motoristaNome: motoristaLogado?.nome || nomeMotoristaManual || 'Motorista Operacional',
      motoristaCpf: cpfInput,
      motoristaTelefone: motoristaLogado?.telefone,
      tipoInspecao: 'Saída para Viagem',
      kmInicial: Number(inicialData.kmInicial) || 0,
      pneusPressaoEEstado: inicialData.pneusPressaoEEstado,
      freiosEstacionamentoEServico: inicialData.freiosEstacionamentoEServico,
      luzesESinalizacao: inicialData.luzesESinalizacao,
      extintoresPQSValidade: inicialData.extintoresPQSValidade,
      kitEmergenciaAmbipar: inicialData.kitEmergenciaAmbipar,
      vazamentoFluidos: inicialData.vazamentoFluidos,
      documentacaoMTRCIVCIPP: inicialData.documentacaoMTRCIVCIPP,
      tacografoDiscoOuDigital: inicialData.tacografoDiscoOuDigital,
      episObrigatorios: inicialData.episObrigatorios,
      niveisOleoRadiador: inicialData.niveisOleoRadiador,
      limpezaCabine: inicialData.limpezaCabine,
      nivelCombustivel: inicialData.nivelCombustivel,
      nivelArla32: inicialData.nivelArla32,
      possuiAvarias: inicialData.possuiAvarias,
      descricaoAvarias: inicialData.possuiAvarias ? inicialData.descricaoAvarias : 'Nenhuma avaria prévia identificada',
      localAvaria: inicialData.possuiAvarias ? inicialData.localAvaria : undefined,
      severidadeAvaria: inicialData.possuiAvarias ? inicialData.severidadeAvaria : 'Nenhuma',
      resultado,
      observacoes: inicialData.observacoes,
      statusJornada: 'Em Jornada',
      assinaturaDigitalMotorista: `${motoristaLogado?.nome || nomeMotoristaManual} (CPF: ${cpfInput})`,
    };

    onAddChecklist(newChk);
    setUltimoChecklistCriado(newChk);
    setJornadaAtiva(newChk);
    localStorage.setItem('ambipar_motorista_sessao_placa', placaSelecionada);
    setStep('sucesso');
  };

  // Enviar Checklist Final (Retorno à Base)
  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placaSelecionada) {
      alert('Selecione a placa do veículo.');
      return;
    }

    const kmIni = jornadaAtiva?.kmInicial || 50000;
    const kmFim = Number(finalData.kmFinal) || kmIni;
    if (kmFim < kmIni) {
      alert(`O Km Final (${kmFim}) não pode ser menor que o Km Inicial da jornada (${kmIni}). Verifique o hodômetro.`);
      return;
    }

    const kmPercorrido = kmFim - kmIni;

    // Critérios de aprovação do retorno
    let resultado: ChecklistDiario['resultado'] = 'Aprovado - Liberado';
    if (finalData.avariasRetornoDetectadas && finalData.severidadeAvariaRetorno?.includes('Crítica')) {
      resultado = 'Reprovado - Bloqueado';
    } else if (finalData.avariasRetornoDetectadas || !finalData.pneusEstadoRetorno || !finalData.freiosEstadoRetorno) {
      resultado = 'Aprovado com Restrição Leve';
    }

    const newChkFinal: ChecklistDiario = {
      id: `chk-fim-${Date.now()}`,
      jornadaId: jornadaAtiva?.jornadaId || `jornada-${Date.now()}`,
      dataHora: new Date().toISOString().slice(0, 16).replace('T', ' '),
      dataHoraRetorno: new Date().toISOString().slice(0, 16).replace('T', ' '),
      veiculoPlaca: placaSelecionada,
      motoristaNome: motoristaLogado?.nome || nomeMotoristaManual || 'Motorista Operacional',
      motoristaCpf: cpfInput,
      tipoInspecao: 'Retorno à Base',
      kmInicial: kmIni,
      kmFinal: kmFim,
      kmPercorrido,
      pneusPressaoEEstado: finalData.pneusEstadoRetorno,
      freiosEstacionamentoEServico: finalData.freiosEstadoRetorno,
      luzesESinalizacao: true,
      extintoresPQSValidade: true,
      kitEmergenciaAmbipar: finalData.kitEmergenciaIntacto,
      vazamentoFluidos: true,
      documentacaoMTRCIVCIPP: true,
      tacografoDiscoOuDigital: true,
      limpezaCabine: finalData.limpezaFinal,
      nivelCombustivel: finalData.nivelCombustivel,
      nivelArla32: finalData.nivelArla32,
      // Avarias do retorno
      avariasRetornoDetectadas: finalData.avariasRetornoDetectadas,
      descricaoAvariasRetorno: finalData.avariasRetornoDetectadas ? finalData.descricaoAvariasRetorno : 'Nenhuma avaria ou incidente ocorrido durante o percurso',
      localAvariaRetorno: finalData.avariasRetornoDetectadas ? finalData.localAvariaRetorno : undefined,
      severidadeAvariaRetorno: finalData.avariasRetornoDetectadas ? finalData.severidadeAvariaRetorno : 'Nenhuma',
      resultado,
      observacoes: finalData.observacoes,
      statusJornada: 'Jornada Concluída',
      assinaturaDigitalMotorista: `${motoristaLogado?.nome || nomeMotoristaManual} (CPF: ${cpfInput})`,
    };

    onAddChecklist(newChkFinal);
    setUltimoChecklistCriado(newChkFinal);
    setJornadaAtiva(null);
    setStep('sucesso');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header Mobile-First */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ambipar-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-ambipar-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-ambipar-400">
                Portal do Motorista Ambipar
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                Checklist Diário Operacional
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step !== 'login' && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition"
                title="Sair / Trocar de Motorista"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trocar CPF</span>
              </button>
            )}

            {onExitPortal && (
              <button
                onClick={onExitPortal}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-medium border border-slate-700 transition"
              >
                Voltar à Central
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-xl mx-auto w-full p-4 sm:p-6 flex flex-col justify-center">
        {/* =========================================================
            PASSO 1: LOGIN POR CPF
            ========================================================= */}
        {step === 'login' && (
          <div className="space-y-6 my-auto">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-ambipar-400 flex items-center justify-center mx-auto shadow-xl">
                <Truck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Identificação do Condutor
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Digite seu CPF cadastrado para iniciar ou finalizar o checklist diário obrigatório de segurança da Ambipar.
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  CPF do Motorista
                </label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={cpfInput}
                  onChange={handleCpfChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-base sm:text-lg text-white font-mono tracking-widest text-center focus:outline-none focus:border-ambipar-500 transition shadow-inner"
                  autoFocus
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block text-center">
                  Exigência SASSMAQ • Procedimento Operacional Padrão Ambipar
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-ambipar-500/20 active:scale-[0.98] transition"
              >
                <span>Acessar Checklists</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center">
              <span className="text-[11px] text-slate-500">
                Central de Monitoramento & Emergências Químicas: <strong className="text-slate-400">0800 117 2020</strong>
              </span>
            </div>
          </div>
        )}

        {/* =========================================================
            PASSO 2: ESCOLHA DA ETAPA (INICIAL OU FINAL)
            ========================================================= */}
        {step === 'select_tipo' && (
          <div className="space-y-5 my-auto">
            {/* Card do Motorista Identificado */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ambipar-500/10 text-ambipar-400 flex items-center justify-center border border-ambipar-500/20 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-slate-400">CPF: {cpfInput}</div>
                  <h3 className="font-bold text-white text-sm">{motoristaLogado?.nome || nomeMotoristaManual}</h3>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>MOPP & SASSMAQ Ativos</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Trocar
              </button>
            </div>

            {/* Seleção de Veículo */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-ambipar-400" />
                <span>Selecione a Placa do Veículo Operacional:</span>
              </label>
              <select
                value={placaSelecionada}
                onChange={(e) => setPlacaSelecionada(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-ambipar-500"
              >
                {veiculos.map((v) => (
                  <option key={v.id} value={v.placa}>
                    {v.placa} - {v.modelo} ({v.tipoEquipamento})
                  </option>
                ))}
              </select>
            </div>

            {/* Status da Jornada Hoje */}
            {jornadaAtiva ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">Jornada Ativa em Andamento</span>
                </div>
                <p className="text-xs text-slate-300">
                  Você iniciou a saída com a placa <strong className="text-white font-mono">{jornadaAtiva.veiculoPlaca}</strong> às {jornadaAtiva.dataHora} com Km Inicial {formatNumber(jornadaAtiva.kmInicial)}.
                </p>
              </div>
            ) : null}

            {/* Botões de Ação para as duas inspeções */}
            <div className="grid grid-cols-1 gap-3">
              {/* Opção 1: Checklist Inicial (Pré-Jornada) */}
              <button
                onClick={() => setStep('form_inicial')}
                className="p-5 rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-ambipar-500 text-left transition flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ambipar-500/10 text-ambipar-400 border border-ambipar-500/20 uppercase font-mono">
                      1º Momento Obrigatório
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-ambipar-400 transition">
                    Checklist Inicial (Pré-Jornada / Saída)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Realizar antes de ligar o veículo: inspeção de pneus, freios, kit químico e registro de avarias prévias.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-ambipar-500 group-hover:text-slate-950 flex items-center justify-center shrink-0 ml-3 transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>

              {/* Opção 2: Checklist Final (Retorno) */}
              <button
                onClick={() => setStep('form_final')}
                className={`p-5 rounded-2xl border-2 text-left transition flex items-center justify-between group active:scale-[0.99] ${
                  jornadaAtiva
                    ? 'bg-gradient-to-r from-slate-900 to-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900 border-slate-800 hover:border-emerald-500'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                      2º Momento Obrigatório
                    </span>
                    {jornadaAtiva && (
                      <span className="text-[10px] font-bold text-amber-400 animate-pulse">
                        ● Aguardando Fechamento
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                    Checklist Final (Retorno à Base / Fim de Turno)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Realizar ao encerrar o dia: km final, cálculo de km rodados, integridade do veículo e avarias no trajeto.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center shrink-0 ml-3 transition">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            PASSO 3: FORMULÁRIO DO CHECKLIST INICIAL (PRÉ-JORNADA)
            ========================================================= */}
        {step === 'form_inicial' && (
          <div className="space-y-5 my-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                onClick={() => setStep('select_tipo')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <span className="text-[11px] font-mono font-bold text-ambipar-400 bg-ambipar-500/10 px-2 py-0.5 rounded border border-ambipar-500/20">
                Placa: {placaSelecionada}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Checklist Inicial (Pré-Jornada)</h2>
              <p className="text-xs text-slate-400">
                Inspeção preventiva obrigatória antes da partida do veículo.
              </p>
            </div>

            <form onSubmit={handleSubmitInicial} className="space-y-4 text-xs">
              {/* Odômetro e Combustível */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-ambipar-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" />
                  1. Odômetro & Níveis Iniciais
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Km Inicial no Painel *</label>
                    <input
                      type="number"
                      required
                      value={inicialData.kmInicial}
                      onChange={(e) => setInicialData({ ...inicialData, kmInicial: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-base font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Nível de Combustível</label>
                    <select
                      value={inicialData.nivelCombustivel}
                      onChange={(e) => setInicialData({ ...inicialData, nivelCombustivel: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                    >
                      <option value="Cheio (100%)">Cheio (100%)</option>
                      <option value="3/4">3/4 Tanque</option>
                      <option value="1/2">1/2 Meio Tanque</option>
                      <option value="1/4">1/4 Tanque</option>
                      <option value="Reserva">Reserva</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Itens de Segurança Obrigatórios */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  2. Itens de Segurança & SASSMAQ (Toque para validar)
                </span>

                {[
                  { key: 'pneusPressaoEEstado', label: '1. Pneus calibrados, sulcos > 1.6mm e estepe operante' },
                  { key: 'freiosEstacionamentoEServico', label: '2. Freios de serviço e estacionamento (Crítico)' },
                  { key: 'luzesESinalizacao', label: '3. Luzes, faróis, setas e alerta sonoro de ré' },
                  { key: 'vazamentoFluidos', label: '4. Isenção total de vazamentos sob o motor/chassi' },
                  { key: 'extintoresPQSValidade', label: '5. Extintor PQS com carga válida e lacre intacto' },
                  { key: 'kitEmergenciaAmbipar', label: '6. Kit Químico Ambipar Response completo a bordo' },
                  { key: 'tacografoDiscoOuDigital', label: '7. Tacógrafo com disco/fita ativa e lacre' },
                  { key: 'episObrigatorios', label: '8. EPIs completos (Capacete, óculos, luvas, botas, máscara)' },
                  { key: 'documentacaoMTRCIVCIPP', label: '9. Documentos de porte obrigatório (CRLV, MTR, CIV, CIPP)' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition active:scale-[0.99]"
                  >
                    <span className="text-slate-300 font-medium text-xs pr-2">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean((inicialData as any)[item.key])}
                      onChange={(e) => setInicialData({ ...inicialData, [item.key]: e.target.checked })}
                      className="w-5 h-5 rounded text-ambipar-500 focus:ring-ambipar-500 bg-slate-800 border-slate-700 accent-ambipar-500"
                    />
                  </label>
                ))}
              </div>

              {/* CAMPO DE AVARIAS INICIAIS */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  3. Inspeção Visual de Avarias Pré-Existentes
                </span>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold text-xs">
                    O veículo possui alguma avaria pré-existente (risco, amassado, parabrisa trincado, lanterna avariada)? *
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInicialData({ ...inicialData, possuiAvarias: false })}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition ${
                        !inicialData.possuiAvarias
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      ✓ 100% Sem Avarias
                    </button>

                    <button
                      type="button"
                      onClick={() => setInicialData({ ...inicialData, possuiAvarias: true })}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition ${
                        inicialData.possuiAvarias
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      ⚠ Possui Avaria Prévia
                    </button>
                  </div>
                </div>

                {inicialData.possuiAvarias && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Local da Avaria</label>
                        <select
                          value={inicialData.localAvaria}
                          onChange={(e) => setInicialData({ ...inicialData, localAvaria: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          <option value="Parachoque / Dianteira">Parachoque / Dianteira</option>
                          <option value="Lateral Direita">Lateral Direita</option>
                          <option value="Lateral Esquerda">Lateral Esquerda</option>
                          <option value="Traseira / Lanternas">Traseira / Lanternas</option>
                          <option value="Cabine / Parabrisa">Cabine / Parabrisa</option>
                          <option value="Tanque / Implemento">Tanque / Implemento</option>
                          <option value="Pneus / Rodas">Pneus / Rodas</option>
                          <option value="Retrovisores">Retrovisores</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Severidade da Avaria</label>
                        <select
                          value={inicialData.severidadeAvaria}
                          onChange={(e) => setInicialData({ ...inicialData, severidadeAvaria: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          <option value="Leve (Apenas Visual/Estética)">Leve (Apenas Visual/Estética)</option>
                          <option value="Média (Requer Atenção em Breve)">Média (Requer Atenção em Breve)</option>
                          <option value="Crítica / Grave (Bloqueia Veículo)">Crítica / Grave (Bloqueia Veículo)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Descrição Detalhada das Avarias Identificadas *
                      </label>
                      <textarea
                        rows={3}
                        required={inicialData.possuiAvarias}
                        placeholder="Ex: Pequeno risco de 10cm na porta direita, farol auxiliar esquerdo com lente trincada..."
                        value={inicialData.descricaoAvarias}
                        onChange={(e) => setInicialData({ ...inicialData, descricaoAvarias: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observações Gerais</label>
                <textarea
                  rows={2}
                  placeholder="Alguma observação adicional antes do despacho..."
                  value={inicialData.observacoes}
                  onChange={(e) => setInicialData({ ...inicialData, observacoes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-ambipar-500/20 active:scale-[0.98] transition mt-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRMAR & ENVIAR CHECKLIST INICIAL</span>
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            PASSO 4: FORMULÁRIO DO CHECKLIST FINAL (RETORNO / FIM DE TURNO)
            ========================================================= */}
        {step === 'form_final' && (
          <div className="space-y-5 my-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                onClick={() => setStep('select_tipo')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Placa: {placaSelecionada}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Checklist Final (Retorno à Base / Fim de Jornada)</h2>
              <p className="text-xs text-slate-400">
                Encerramento diário: registro do hodômetro final, cálculo de km rodados e relato de avarias na rota.
              </p>
            </div>

            <form onSubmit={handleSubmitFinal} className="space-y-4 text-xs">
              {/* Odômetro Final e Cálculo de KM */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" />
                  1. Odômetro Final & Km Rodados
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Km Final no Painel *</label>
                    <input
                      type="number"
                      required
                      value={finalData.kmFinal}
                      onChange={(e) => setFinalData({ ...finalData, kmFinal: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-base font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Km Inicial Registrado</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-400 font-mono font-bold">
                      {jornadaAtiva?.kmInicial ? `${formatNumber(jornadaAtiva.kmInicial)} km` : '50.000 km'}
                    </div>
                  </div>
                </div>

                {/* Cálculo Dinâmico de Quilômetros Percorridos */}
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Distância Total Percorrida na Jornada:</span>
                  <span className="text-base font-mono font-black text-emerald-400">
                    {formatNumber(Math.max(0, finalData.kmFinal - (jornadaAtiva?.kmInicial || 50000)))} KM
                  </span>
                </div>
              </div>

              {/* Inspeção do Encerramento */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  2. Condições de Encerramento do Veículo
                </span>

                {[
                  { key: 'pneusEstadoRetorno', label: '1. Pneus intactos após a viagem (sem cortes ou furos)' },
                  { key: 'freiosEstadoRetorno', label: '2. Freios e sistema de ar funcionando perfeitamente' },
                  { key: 'residuosDescarregados', label: '3. Resíduos descarregados no destinador e MTR baixado' },
                  { key: 'kitEmergenciaIntacto', label: '4. Kit Químico Ambipar intacto (sem materiais faltantes)' },
                  { key: 'limpezaFinal', label: '5. Cabine limpa e livre de resíduos ou lixo' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition active:scale-[0.99]"
                  >
                    <span className="text-slate-300 font-medium text-xs pr-2">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean((finalData as any)[item.key])}
                      onChange={(e) => setFinalData({ ...finalData, [item.key]: e.target.checked })}
                      className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700 accent-emerald-500"
                    />
                  </label>
                ))}
              </div>

              {/* CAMPO DE AVARIAS NO FIM DA JORNADA */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  3. Relato de Avarias & Incidentes no Fim da Jornada
                </span>

                <div className="space-y-2">
                  <label className="block text-slate-300 font-semibold text-xs">
                    Houve alguma avaria, impacto, dano ou incidente ocorrido durante a rota de hoje? *
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFinalData({ ...finalData, avariasRetornoDetectadas: false })}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition ${
                        !finalData.avariasRetornoDetectadas
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      ✓ Sem Danos / Veículo Intacto
                    </button>

                    <button
                      type="button"
                      onClick={() => setFinalData({ ...finalData, avariasRetornoDetectadas: true })}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition ${
                        finalData.avariasRetornoDetectadas
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      ⚠ Ocorreu Avaria na Viagem
                    </button>
                  </div>
                </div>

                {finalData.avariasRetornoDetectadas && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Local da Avaria Ocorrida</label>
                        <select
                          value={finalData.localAvariaRetorno}
                          onChange={(e) => setFinalData({ ...finalData, localAvariaRetorno: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          <option value="Parachoque / Dianteira">Parachoque / Dianteira</option>
                          <option value="Lateral Direita">Lateral Direita</option>
                          <option value="Lateral Esquerda">Lateral Esquerda</option>
                          <option value="Traseira / Lanterna">Traseira / Lanterna</option>
                          <option value="Pneu com Furo / Corte">Pneu com Furo / Corte</option>
                          <option value="Vidro / Retrovisor">Vidro / Retrovisor</option>
                          <option value="Mecânica / Vazamento">Mecânica / Vazamento</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 font-semibold mb-1">Severidade do Dano</label>
                        <select
                          value={finalData.severidadeAvariaRetorno}
                          onChange={(e) => setFinalData({ ...finalData, severidadeAvariaRetorno: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          <option value="Leve (Apenas Visual/Estética)">Leve (Apenas Visual/Estética)</option>
                          <option value="Média (Requer Atenção em Breve)">Média (Requer Atenção em Breve)</option>
                          <option value="Crítica / Grave (Bloqueia Veículo)">Crítica / Grave (Bloqueia Veículo)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">
                        Relato do Ocorrido / Descrição da Avaria *
                      </label>
                      <textarea
                        rows={3}
                        required={finalData.avariasRetornoDetectadas}
                        placeholder="Descreva onde e como ocorreu o dano durante a viagem..."
                        value={finalData.descricaoAvariasRetorno}
                        onChange={(e) => setFinalData({ ...finalData, descricaoAvariasRetorno: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      ></textarea>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observações Finais de Encerramento</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais para a equipe de tráfego..."
                  value={finalData.observacoes}
                  onChange={(e) => setFinalData({ ...finalData, observacoes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition mt-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRMAR & ENVIAR CHECKLIST FINAL</span>
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            PASSO 5: TELA DE SUCESSO & PROTOCOLO DO MOTORISTA
            ========================================================= */}
        {step === 'sucesso' && ultimoChecklistCriado && (
          <div className="space-y-6 my-auto text-center animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Checklist Enviado com Sucesso!
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                As informações foram sincronizadas e registradas na Central Operacional da Ambipar Logistics.
              </p>
            </div>

            {/* Crachá Digital de Confirmação */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-left space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Protocolo de Envio:</span>
                <span className="font-mono text-xs font-bold text-emerald-400">{ultimoChecklistCriado.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Tipo:</span>
                  <strong className="text-white">{ultimoChecklistCriado.tipoInspecao}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Veículo:</span>
                  <strong className="font-mono text-ambipar-400">{ultimoChecklistCriado.veiculoPlaca}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Condutor:</span>
                  <span className="text-slate-300 truncate block">{ultimoChecklistCriado.motoristaNome}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Resultado:</span>
                  <span className="font-bold text-emerald-400">{ultimoChecklistCriado.resultado}</span>
                </div>
              </div>

              {ultimoCheckloadAvariasResumo(ultimoChecklistCriado)}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setStep('select_tipo')}
                className="w-full py-3.5 rounded-2xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs shadow-lg transition"
              >
                Voltar ao Menu Principal
              </button>

              {onExitPortal && (
                <button
                  onClick={onExitPortal}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs border border-slate-800 transition"
                >
                  Fechar Portal do Motorista
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Mobile */}
      <footer className="bg-slate-950 border-t border-slate-900 py-3 text-center text-[10px] text-slate-600">
        Ambipar Logistics • Sistema Integrado de Gestão SASSMAQ & ESG
      </footer>
    </div>
  );
};

// Helper visual para avarias no recibo
function ultimoCheckloadAvariasResumo(chk: ChecklistDiario) {
  if (chk.possuiAvarias && chk.tipoInspecao === 'Saída para Viagem') {
    return (
      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
        <span className="font-bold uppercase tracking-wider block text-[10px]">Avaria Inicial Registrada:</span>
        <p className="text-slate-300">{chk.descricaoAvarias}</p>
      </div>
    );
  }

  if (chk.avariasRetornoDetectadas && chk.tipoInspecao === 'Retorno à Base') {
    return (
      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-1">
        <span className="font-bold uppercase tracking-wider block text-[10px]">Avaria no Retorno Notificada:</span>
        <p className="text-slate-300">{chk.descricaoAvariasRetorno}</p>
      </div>
    );
  }

  return (
    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-[11px] text-center font-semibold">
      ✓ Sem avarias relatadas na inspeção
    </div>
  );
}

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
  Info,
  Users,
  HardHat,
  Plus,
  Edit3,
  Check,
  Fuel
} from 'lucide-react';
import { formatNumber, getNowLocalBR, getTodayLocalBR } from '../utils/formatters';

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
}) => {
  // Step: 'login' | 'select_tipo' | 'form_inicial' | 'form_final' | 'sucesso'
  const [step, setStep] = useState<'login' | 'select_tipo' | 'form_inicial' | 'form_final' | 'sucesso'>('login');

  // Identificação do Motorista Principal
  const [cpfInput, setCpfInput] = useState('');
  const [motoristaLogado, setMotoristaLogado] = useState<Motorista | null>(null);
  const [nomeMotoristaManual, setNomeMotoristaManual] = useState('');

  // Identificação e Composição do Veículo
  const [modoCavalo, setModoCavalo] = useState<'selecionar' | 'digitar'>('selecionar');
  const [placaCavalo, setPlacaCavalo] = useState<string>('');
  const [modoCarreta, setModoCarreta] = useState<'sem_carreta' | 'selecionar' | 'digitar'>('sem_carreta');
  const [placaCarreta, setPlacaCarreta] = useState<string>('');

  // Tripulação Adicional
  const [modoSegundoMotorista, setModoSegundoMotorista] = useState<'sem_segundo' | 'selecionar' | 'digitar'>('sem_segundo');
  const [segundoMotoristaNome, setSegundoMotoristaNome] = useState<string>('');
  const [segundoMotoristaCpf, setSegundoMotoristaCpf] = useState<string>('');

  const [modoAjudante, setModoAjudante] = useState<'sem_ajudante' | 'selecionar' | 'digitar'>('sem_ajudante');
  const [ajudanteNome, setAjudanteNome] = useState<string>('');
  const [ajudanteCpf, setAjudanteCpf] = useState<string>('');

  // Checklist Inicial Aberto Hoje para este veículo
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
  const formatCpf = (val: string) => {
    let v = val.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 9) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (v.length > 6) {
      return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (v.length > 3) {
      return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    return v;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpfInput(formatCpf(e.target.value));
  };

  // Verificar se há sessão de motorista salva no dispositivo
  useEffect(() => {
    try {
      const savedCpf = localStorage.getItem('ambipar_motorista_sessao_cpf');
      const savedNome = localStorage.getItem('ambipar_motorista_sessao_nome');
      const savedPlaca = localStorage.getItem('ambipar_motorista_sessao_placa');
      const savedCarreta = localStorage.getItem('ambipar_motorista_sessao_carreta');

      if (savedCpf) {
        setCpfInput(savedCpf);
        const mot = motoristas.find((m) => m.cpf.replace(/\D/g, '') === savedCpf.replace(/\D/g, ''));
        if (mot) {
          setMotoristaLogado(mot);
          setNomeMotoristaManual(mot.nome);
          const p = savedPlaca || mot.veiculoFixoPlaca || veiculos[0]?.placa || '';
          setPlacaCavalo(p);
          if (savedCarreta) {
            setPlacaCarreta(savedCarreta);
            setModoCarreta('digitar');
          }
          setStep('select_tipo');
        } else if (savedNome) {
          setNomeMotoristaManual(savedNome);
          const p = savedPlaca || veiculos[0]?.placa || '';
          setPlacaCavalo(p);
          if (savedCarreta) {
            setPlacaCarreta(savedCarreta);
            setModoCarreta('digitar');
          }
          setStep('select_tipo');
        }
      } else if (veiculos.length > 0 && !placaCavalo) {
        setPlacaCavalo(veiculos[0].placa);
      }
    } catch (e) {
      console.log('Nenhuma sessão anterior encontrada');
    }
  }, [motoristas, veiculos]);

  // Se veículos chegarem e placaCavalo ainda estiver vazia, sugerir o primeiro
  useEffect(() => {
    if (!placaCavalo && veiculos.length > 0) {
      setPlacaCavalo(veiculos[0].placa);
    }
  }, [veiculos, placaCavalo]);

  // Verificar se há jornada inicial aberta hoje para este veículo/motorista
  useEffect(() => {
    if ((motoristaLogado?.nome || nomeMotoristaManual) && placaCavalo) {
      const hoje = getTodayLocalBR();
      const cleanCpf = cpfInput.replace(/\D/g, '');
      const normPlaca = (p?: string) => (p || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const placaCavaloNorm = normPlaca(placaCavalo);

      const abertoHoje = checklists.find(
        (c) =>
          c.tipoInspecao === 'Saída para Viagem' &&
          normPlaca(c.veiculoPlaca) === placaCavaloNorm &&
          c.dataHora.startsWith(hoje) &&
          c.statusJornada !== 'Jornada Concluída' &&
          (cleanCpf === '' || !c.motoristaCpf || c.motoristaCpf.replace(/\D/g, '') === cleanCpf)
      );

      if (abertoHoje) {
        setJornadaAtiva(abertoHoje);
        if (abertoHoje.placaCarreta && !placaCarreta) {
          setPlacaCarreta(abertoHoje.placaCarreta);
          setModoCarreta('digitar');
        }
        if (abertoHoje.segundoMotoristaNome && !segundoMotoristaNome) {
          setSegundoMotoristaNome(abertoHoje.segundoMotoristaNome);
          setSegundoMotoristaCpf(abertoHoje.segundoMotoristaCpf || '');
          setModoSegundoMotorista('digitar');
        }
        if (abertoHoje.ajudanteNome && !ajudanteNome) {
          setAjudanteNome(abertoHoje.ajudanteNome);
          setAjudanteCpf(abertoHoje.ajudanteCpf || '');
          setModoAjudante('digitar');
        }

        setFinalData((prev) => ({
          ...prev,
          kmFinal: abertoHoje.kmInicial + 100,
        }));
      } else {
        setJornadaAtiva(null);
      }

      // Atualiza km inicial sugerido a partir do odômetro do veículo caso exista
      const v = veiculos.find((veic) => normPlaca(veic.placa) === placaCavaloNorm);
      if (v && v.odometroAtualKm) {
        setInicialData((prev) => ({ ...prev, kmInicial: v.odometroAtualKm }));
      }
    }
  }, [motoristaLogado, nomeMotoristaManual, placaCavalo, checklists, veiculos, cpfInput]);

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
      const defaultPlaca = mot.veiculoFixoPlaca || veiculos[0]?.placa || '';
      if (defaultPlaca && !placaCavalo) {
        setPlacaCavalo(defaultPlaca);
      }
      localStorage.setItem('ambipar_motorista_sessao_cpf', cpfInput);
      localStorage.setItem('ambipar_motorista_sessao_nome', mot.nome);
      if (defaultPlaca) localStorage.setItem('ambipar_motorista_sessao_placa', defaultPlaca);
      setStep('select_tipo');
    } else {
      // Motorista não encontrado previamente no cadastro
      const nomeDigitado = prompt(
        'CPF não cadastrado previamente na base. Digite seu Nome Completo para liberar o acesso ao Checklist:',
        nomeMotoristaManual || ''
      );
      if (nomeDigitado && nomeDigitado.trim().length > 2) {
        setNomeMotoristaManual(nomeDigitado.trim());
        const defaultPlaca = veiculos[0]?.placa || '';
        if (defaultPlaca && !placaCavalo) {
          setPlacaCavalo(defaultPlaca);
        }
        localStorage.setItem('ambipar_motorista_sessao_cpf', cpfInput);
        localStorage.setItem('ambipar_motorista_sessao_nome', nomeDigitado.trim());
        setStep('select_tipo');
      } else {
        alert('Nome obrigatório para registro e rastreabilidade da inspeção.');
      }
    }
  };

  // Logout / Trocar de Motorista
  const handleLogout = () => {
    localStorage.removeItem('ambipar_motorista_sessao_cpf');
    localStorage.removeItem('ambipar_motorista_sessao_nome');
    localStorage.removeItem('ambipar_motorista_sessao_placa');
    localStorage.removeItem('ambipar_motorista_sessao_carreta');
    setMotoristaLogado(null);
    setNomeMotoristaManual('');
    setCpfInput('');
    setStep('login');
  };

  // Enviar Checklist Inicial (Saída)
  const handleSubmitInicial = (e: React.FormEvent) => {
    e.preventDefault();
    const placaFinal = placaCavalo.trim().toUpperCase();
    if (!placaFinal) {
      alert('Por favor, informe a Placa do Veículo Principal (Cavalo / Caminhão).');
      return;
    }

    // Validação de itens críticos SASSMAQ
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
      dataHora: getNowLocalBR(),
      veiculoPlaca: placaFinal,
      placaCarreta: modoCarreta !== 'sem_carreta' && placaCarreta.trim() ? placaCarreta.trim().toUpperCase() : undefined,
      motoristaNome: motoristaLogado?.nome || nomeMotoristaManual || 'Motorista Operacional',
      motoristaCpf: cpfInput,
      motoristaTelefone: motoristaLogado?.telefone,
      segundoMotoristaNome: modoSegundoMotorista !== 'sem_segundo' && segundoMotoristaNome.trim() ? segundoMotoristaNome.trim() : undefined,
      segundoMotoristaCpf: modoSegundoMotorista !== 'sem_segundo' && segundoMotoristaCpf.trim() ? segundoMotoristaCpf.trim() : undefined,
      ajudanteNome: modoAjudante !== 'sem_ajudante' && ajudanteNome.trim() ? ajudanteNome.trim() : undefined,
      ajudanteCpf: modoAjudante !== 'sem_ajudante' && ajudanteCpf.trim() ? ajudanteCpf.trim() : undefined,
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
    localStorage.setItem('ambipar_motorista_sessao_placa', placaFinal);
    if (newChk.placaCarreta) localStorage.setItem('ambipar_motorista_sessao_carreta', newChk.placaCarreta);
    setStep('sucesso');
  };

  // Enviar Checklist Final (Retorno à Base)
  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    const placaFinal = placaCavalo.trim().toUpperCase();
    if (!placaFinal) {
      alert('Por favor, informe a Placa do Veículo Principal (Cavalo / Caminhão).');
      return;
    }

    const kmIni = jornadaAtiva?.kmInicial || 50000;
    const kmFim = Number(finalData.kmFinal) || kmIni;
    if (kmFim < kmIni) {
      alert(`O Km Final (${kmFim}) não pode ser menor que o Km Inicial da jornada (${kmIni}). Verifique o hodômetro no painel.`);
      return;
    }

    const kmPercorrido = kmFim - kmIni;

    // Critérios de aprovação do encerramento
    let resultado: ChecklistDiario['resultado'] = 'Aprovado - Liberado';
    if (finalData.avariasRetornoDetectadas && finalData.severidadeAvariaRetorno?.includes('Crítica')) {
      resultado = 'Reprovado - Bloqueado';
    } else if (finalData.avariasRetornoDetectadas || !finalData.pneusEstadoRetorno || !finalData.freiosEstadoRetorno) {
      resultado = 'Aprovado com Restrição Leve';
    }

    const newChkFinal: ChecklistDiario = {
      id: `chk-fim-${Date.now()}`,
      jornadaId: jornadaAtiva?.jornadaId || `jornada-${Date.now()}`,
      dataHora: getNowLocalBR(),
      dataHoraRetorno: getNowLocalBR(),
      veiculoPlaca: placaFinal,
      placaCarreta: modoCarreta !== 'sem_carreta' && placaCarreta.trim() ? placaCarreta.trim().toUpperCase() : (jornadaAtiva?.placaCarreta || undefined),
      motoristaNome: motoristaLogado?.nome || nomeMotoristaManual || 'Motorista Operacional',
      motoristaCpf: cpfInput,
      segundoMotoristaNome: modoSegundoMotorista !== 'sem_segundo' && segundoMotoristaNome.trim() ? segundoMotoristaNome.trim() : (jornadaAtiva?.segundoMotoristaNome || undefined),
      segundoMotoristaCpf: modoSegundoMotorista !== 'sem_segundo' && segundoMotoristaCpf.trim() ? segundoMotoristaCpf.trim() : (jornadaAtiva?.segundoMotoristaCpf || undefined),
      ajudanteNome: modoAjudante !== 'sem_ajudante' && ajudanteNome.trim() ? ajudanteNome.trim() : (jornadaAtiva?.ajudanteNome || undefined),
      ajudanteCpf: modoAjudante !== 'sem_ajudante' && ajudanteCpf.trim() ? ajudanteCpf.trim() : (jornadaAtiva?.ajudanteCpf || undefined),
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

  // Motoristas filtrados para seleção de 2º motorista e ajudante
  const segundosMotoristasCadastrados = motoristas.filter(
    (m) => m.cpf.replace(/\D/g, '') !== cpfInput.replace(/\D/g, '')
  );
  const ajudantesCadastrados = motoristas.filter(
    (m) => m.funcao === 'Ajudante Operacional / Transbordo' || m.categoriaCnh === 'Não Aplicável (Ajudante)'
  );

  return (
    <div className="h-full bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-ambipar-500 selection:text-slate-950 overflow-y-auto">
      {/* Top Header Mobile-First - 100% Autônomo e Seguro */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ambipar-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-md shadow-ambipar-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-ambipar-400">
                Ambipar Logistics • Operação
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                Portal do Motorista & Checklists
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step !== 'login' && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition"
                title="Sair / Trocar de Motorista"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-400" />
                <span>Sair / Trocar CPF</span>
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
                Digite seu CPF para iniciar a jornada, realizar a inspeção preventiva obrigatória de saída e registrar o retorno.
              </p>
            </div>

            <form onSubmit={handleLogin} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  CPF do Motorista (11 Dígitos)
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
                  Procedimento Operacional Padrão • SASSMAQ • Ambipar Response
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-ambipar-500/20 active:scale-[0.98] transition"
              >
                <span>Acessar Meus Checklists</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center space-y-1">
              <span className="text-[11px] text-slate-500 block">
                Central de Monitoramento & Emergências Químicas Ambipar:
              </span>
              <strong className="text-ambipar-400 font-mono text-xs">0800 117 2020 / 0800 777 0728</strong>
            </div>
          </div>
        )}

        {/* =========================================================
            PASSO 2: SELEÇÃO DE VEÍCULO, TRIPULAÇÃO E ETAPA
            ========================================================= */}
        {step === 'select_tipo' && (
          <div className="space-y-5 my-auto">
            {/* Card do Motorista Conectado */}
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
                    <span>Habilitado & Sincronizado</span>
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

            {/* SELEÇÃO E CONFIGURAÇÃO DA FROTA / VEÍCULO / TRIPULAÇÃO */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-ambipar-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>Equipamento & Tripulação da Viagem</span>
                </span>
                <span className="text-[10px] text-slate-500">Obrigatório ANTT</span>
              </div>

              {/* 1. VEÍCULO PRINCIPAL / CAVALO MECÂNICO */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <span>Placa do Cavalo Mecânico / Caminhão *</span>
                  </label>
                  <div className="flex items-center text-[10px] gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setModoCavalo('selecionar')}
                      className={`px-2 py-0.5 rounded ${modoCavalo === 'selecionar' ? 'bg-ambipar-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      Frota Cadastrada
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoCavalo('digitar')}
                      className={`px-2 py-0.5 rounded ${modoCavalo === 'digitar' ? 'bg-ambipar-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      Digitar Outra Placa
                    </button>
                  </div>
                </div>

                {modoCavalo === 'selecionar' && veiculos.length > 0 ? (
                  <select
                    value={placaCavalo}
                    onChange={(e) => setPlacaCavalo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-ambipar-500"
                  >
                    {veiculos.map((v) => (
                      <option key={v.id} value={v.placa}>
                        {v.placa} - {v.modelo} ({v.tipoEquipamento})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Ex: BRA2E19 ou ABC-1234"
                    value={placaCavalo}
                    onChange={(e) => setPlacaCavalo(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono font-bold uppercase focus:outline-none focus:border-ambipar-500"
                  />
                )}
              </div>

              {/* 2. PLACA DA CARRETA / SEMIRREBOQUE */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Carreta / Semirreboque / Tanque (Opcional):
                  </label>
                  <div className="flex items-center text-[10px] gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => { setModoCarreta('sem_carreta'); setPlacaCarreta(''); }}
                      className={`px-2 py-0.5 rounded ${modoCarreta === 'sem_carreta' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Sem Carreta (Toco/Truck)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoCarreta('digitar')}
                      className={`px-2 py-0.5 rounded ${modoCarreta === 'digitar' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      Informar Carreta
                    </button>
                  </div>
                </div>

                {modoCarreta === 'digitar' && (
                  <input
                    type="text"
                    placeholder="Placa da Carreta (Ex: REB-9081 ou BXZ1A23)"
                    value={placaCarreta}
                    onChange={(e) => setPlacaCarreta(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                  />
                )}
              </div>

              {/* 3. SEGUNDO MOTORISTA (REVEZAMENTO) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>2º Motorista (Revezamento / Dupla):</span>
                  </label>
                  <div className="flex items-center text-[10px] gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => { setModoSegundoMotorista('sem_segundo'); setSegundoMotoristaNome(''); setSegundoMotoristaCpf(''); }}
                      className={`px-2 py-0.5 rounded ${modoSegundoMotorista === 'sem_segundo' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Individual
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoSegundoMotorista('selecionar')}
                      className={`px-2 py-0.5 rounded ${modoSegundoMotorista === 'selecionar' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Cadastrado
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoSegundoMotorista('digitar')}
                      className={`px-2 py-0.5 rounded ${modoSegundoMotorista === 'digitar' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Avulso
                    </button>
                  </div>
                </div>

                {modoSegundoMotorista === 'selecionar' && (
                  <select
                    value={segundoMotoristaNome}
                    onChange={(e) => {
                      const sel = motoristas.find((m) => m.nome === e.target.value);
                      setSegundoMotoristaNome(e.target.value);
                      if (sel) setSegundoMotoristaCpf(sel.cpf);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">Selecione o 2º Motorista da lista...</option>
                    {segundosMotoristasCadastrados.map((m) => (
                      <option key={m.id} value={m.nome}>
                        {m.nome} ({m.funcao || 'Motorista'} - CPF: {m.cpf})
                      </option>
                    ))}
                  </select>
                )}

                {modoSegundoMotorista === 'digitar' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nome Completo do 2º Motorista"
                      value={segundoMotoristaNome}
                      onChange={(e) => setSegundoMotoristaNome(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="CPF do 2º Motorista"
                      value={segundoMotoristaCpf}
                      onChange={(e) => setSegundoMotoristaCpf(formatCpf(e.target.value))}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                )}
              </div>

              {/* 4. AJUDANTE OPERACIONAL */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <HardHat className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ajudante Operacional / Transbordo:</span>
                  </label>
                  <div className="flex items-center text-[10px] gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => { setModoAjudante('sem_ajudante'); setAjudanteNome(''); setAjudanteCpf(''); }}
                      className={`px-2 py-0.5 rounded ${modoAjudante === 'sem_ajudante' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Sem Ajudante
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoAjudante('selecionar')}
                      className={`px-2 py-0.5 rounded ${modoAjudante === 'selecionar' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      Cadastrado
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoAjudante('digitar')}
                      className={`px-2 py-0.5 rounded ${modoAjudante === 'digitar' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                    >
                      Avulso
                    </button>
                  </div>
                </div>

                {modoAjudante === 'selecionar' && (
                  <select
                    value={ajudanteNome}
                    onChange={(e) => {
                      const sel = motoristas.find((m) => m.nome === e.target.value);
                      setAjudanteNome(e.target.value);
                      if (sel) setAjudanteCpf(sel.cpf);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">Selecione o Ajudante da lista...</option>
                    {(ajudantesCadastrados.length > 0 ? ajudantesCadastrados : motoristas).map((m) => (
                      <option key={m.id} value={m.nome}>
                        {m.nome} (CPF: {m.cpf})
                      </option>
                    ))}
                  </select>
                )}

                {modoAjudante === 'digitar' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nome Completo do Ajudante"
                      value={ajudanteNome}
                      onChange={(e) => setAjudanteNome(e.target.value)}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="CPF do Ajudante"
                      value={ajudanteCpf}
                      onChange={(e) => setAjudanteCpf(formatCpf(e.target.value))}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Status da Jornada em Aberto */}
            {jornadaAtiva && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 animate-pulse">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">Jornada Ativa em Andamento</span>
                </div>
                <p className="text-xs text-slate-300">
                  Você iniciou a saída com a placa <strong className="text-white font-mono">{jornadaAtiva.veiculoPlaca}</strong> às {jornadaAtiva.dataHora} com Km Inicial {formatNumber(jornadaAtiva.kmInicial)}.
                </p>
              </div>
            )}

            {/* Botões de Ação para as duas inspeções */}
            <div className="grid grid-cols-1 gap-3">
              {/* Opção 1: Checklist Inicial (Pré-Jornada) */}
              <button
                onClick={() => {
                  if (!placaCavalo.trim()) {
                    alert('Informe a placa do veículo antes de prosseguir.');
                    return;
                  }
                  setStep('form_inicial');
                }}
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
                onClick={() => {
                  if (!placaCavalo.trim()) {
                    alert('Informe a placa do veículo antes de prosseguir.');
                    return;
                  }
                  setStep('form_final');
                }}
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-ambipar-400 bg-ambipar-500/10 px-2 py-0.5 rounded border border-ambipar-500/20">
                  Cavalo: {placaCavalo || 'N/I'}
                </span>
                {placaCarreta && (
                  <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Carreta: {placaCarreta}
                  </span>
                )}
              </div>
            </div>

            {/* Painel Resumo de Veículo e Tripulação */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-ambipar-400" />
                  <span>Composição da Viagem</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStep('select_tipo')}
                  className="text-[11px] text-ambipar-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Modificar Veículo/Tripulação</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>Condutor: <strong className="text-white">{motoristaLogado?.nome || nomeMotoristaManual}</strong></div>
                <div>Cavalo: <strong className="font-mono text-ambipar-400">{placaCavalo}</strong></div>
                {placaCarreta ? (
                  <div>Carreta: <strong className="font-mono text-cyan-400">{placaCarreta}</strong></div>
                ) : (
                  <div>Carreta: <span className="text-slate-500">Sem Carreta</span></div>
                )}
                {segundoMotoristaNome ? (
                  <div>2º Condutor: <strong className="text-purple-300">{segundoMotoristaNome}</strong></div>
                ) : null}
                {ajudanteNome ? (
                  <div>Ajudante: <strong className="text-amber-300">{ajudanteNome}</strong></div>
                ) : null}
              </div>
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Cavalo: {placaCavalo}
                </span>
                {placaCarreta && (
                  <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Carreta: {placaCarreta}
                  </span>
                )}
              </div>
            </div>

            {/* Painel Resumo de Veículo e Tripulação */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Composição da Viagem</span>
                </span>
                <button
                  type="button"
                  onClick={() => setStep('select_tipo')}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Modificar Veículo/Tripulação</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div>Condutor: <strong className="text-white">{motoristaLogado?.nome || nomeMotoristaManual}</strong></div>
                <div>Cavalo: <strong className="font-mono text-emerald-400">{placaCavalo}</strong></div>
                {placaCarreta ? (
                  <div>Carreta: <strong className="font-mono text-cyan-400">{placaCarreta}</strong></div>
                ) : (
                  <div>Carreta: <span className="text-slate-500">Sem Carreta</span></div>
                )}
                {segundoMotoristaNome ? (
                  <div>2º Condutor: <strong className="text-purple-300">{segundoMotoristaNome}</strong></div>
                ) : null}
                {ajudanteNome ? (
                  <div>Ajudante: <strong className="text-amber-300">{ajudanteNome}</strong></div>
                ) : null}
              </div>
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

              {/* Níveis Finais */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Fuel className="w-4 h-4" />
                  2. Nível de Combustível no Retorno
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Nível de Combustível</label>
                    <select
                      value={finalData.nivelCombustivel}
                      onChange={(e) => setFinalData({ ...finalData, nivelCombustivel: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                    >
                      <option value="Cheio (100%)">Cheio (100%)</option>
                      <option value="3/4">3/4 Tanque</option>
                      <option value="1/2">1/2 Meio Tanque</option>
                      <option value="1/4">1/4 Tanque</option>
                      <option value="Reserva">Reserva</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Nível de Arla 32</label>
                    <select
                      value={finalData.nivelArla32}
                      onChange={(e) => setFinalData({ ...finalData, nivelArla32: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                    >
                      <option value="Normal (>50%)">Normal (&gt;50%)</option>
                      <option value="Atenção (<25%)">Atenção (&lt;25%)</option>
                      <option value="Crítico">Crítico</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Inspeção do Encerramento */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  3. Condições de Encerramento do Veículo
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
                  4. Relato de Avarias & Incidentes no Fim da Jornada
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
                  <span className="text-[10px] text-slate-500 uppercase block">Cavalo Mecânico:</span>
                  <strong className="font-mono text-ambipar-400">{ultimoChecklistCriado.veiculoPlaca}</strong>
                </div>
                {ultimoChecklistCriado.placaCarreta && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Carreta / Tanque:</span>
                    <strong className="font-mono text-cyan-400">{ultimoChecklistCriado.placaCarreta}</strong>
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Condutor:</span>
                  <span className="text-slate-300 truncate block">{ultimoChecklistCriado.motoristaNome}</span>
                </div>
                {ultimoChecklistCriado.segundoMotoristaNome && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">2º Condutor:</span>
                    <span className="text-purple-300 truncate block">{ultimoChecklistCriado.segundoMotoristaNome}</span>
                  </div>
                )}
                {ultimoChecklistCriado.ajudanteNome && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Ajudante:</span>
                    <span className="text-amber-300 truncate block">{ultimoChecklistCriado.ajudanteNome}</span>
                  </div>
                )}
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

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs border border-slate-800 transition"
              >
                Encerrar Sessão do Motorista
              </button>
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

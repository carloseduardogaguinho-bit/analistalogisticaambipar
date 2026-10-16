import React from 'react';
import { CteDocumento, EmpresaFiscalConfig } from '../types';
import { Printer, Download, X, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { formatarChaveAcesso, formatarCnpj, gerarXmlCte } from '../utils/fiscalUtils';

interface DacteModalProps {
  cte: CteDocumento | null;
  empresa: EmpresaFiscalConfig;
  onClose: () => void;
}

export const DacteModal: React.FC<DacteModalProps> = ({ cte, empresa, onClose }) => {
  if (!cte) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const xmlContent = gerarXmlCte(cte, empresa);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${cte.chaveAcesso}-cte.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ambipar-400">
              Visualizador de DACTE &middot; SEFAZ Modelo 57
            </span>
            <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
              CT-e Nº {cte.numeroCte} (Série {cte.serie})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadXml}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar XML</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-ambipar-500/20 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir DACTE (PDF)</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official DACTE Sheet */}
        <div className="p-6 overflow-y-auto bg-white text-black font-sans text-[11px] leading-tight print:p-0 print:overflow-visible">
          {/* Canhoto de Entrega */}
          <div className="border border-black p-2 mb-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-[10px]">
                  DECLARAMOS QUE RECEBEMOS OS PRODUTOS/SERVIÇOS CONSTANTES DO CONHECIMENTO DE TRANSPORTE INDICADO AO LADO
                </p>
                <div className="grid grid-cols-3 gap-2 mt-4 text-[9px]">
                  <div>DATA DO RECEBIMENTO: ____/____/________</div>
                  <div className="col-span-2">NOME E ASSINATURA DO RECEBEDOR: _____________________________________________</div>
                </div>
              </div>
              <div className="border-l border-black pl-3 text-right shrink-0">
                <span className="font-black text-sm block">CT-e</span>
                <span className="font-mono text-xs block font-bold">Nº {cte.numeroCte}</span>
                <span className="text-[9px] block">SÉRIE: {cte.serie}</span>
              </div>
            </div>
          </div>

          {/* DACTE Header */}
          <div className="border border-black grid grid-cols-12 mb-2">
            {/* Emitente Ambipar */}
            <div className="col-span-5 p-2 border-r border-black flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-black text-emerald-800 tracking-tighter">AMBIPAR</span>
                  <span className="text-[10px] font-bold uppercase">{empresa.nomeFantasia}</span>
                </div>
                <p className="font-bold text-[10px] uppercase">{empresa.razaoSocial}</p>
                <p className="text-[9px]">{empresa.logradouro}, {empresa.numero} - {empresa.bairro}</p>
                <p className="text-[9px]">{empresa.municipio} - {empresa.uf} &middot; CEP: {empresa.cep}</p>
                <p className="text-[9px]">FONE: {empresa.telefone}</p>
              </div>
              <div className="pt-2 border-t border-dotted border-gray-400 mt-2 text-[9px]">
                <p><strong>CNPJ:</strong> {formatarCnpj(empresa.cnpj)}</p>
                <p><strong>INSCRIÇÃO ESTADUAL:</strong> {empresa.inscricaoEstadual}</p>
                <p><strong>RNTRC:</strong> {empresa.rntrc}</p>
              </div>
            </div>

            {/* DACTE Identificação */}
            <div className="col-span-3 p-2 border-r border-black text-center flex flex-col justify-between">
              <div>
                <h1 className="font-black text-base tracking-tight">DACTE</h1>
                <p className="text-[9px] leading-tight">Documento Auxiliar do Conhecimento de Transporte Eletrônico</p>
              </div>
              <div className="py-2 border-y border-black my-1 text-left text-[9px]">
                <p><strong>MODAL:</strong> RODOVIÁRIO</p>
                <p><strong>MODELO:</strong> 57</p>
                <p><strong>SÉRIE:</strong> {cte.serie}</p>
                <p><strong>NÚMERO:</strong> {cte.numeroCte}</p>
                <p><strong>DATA EMISSÃO:</strong> {cte.dataEmissao}</p>
              </div>
              <div className="text-[8px] uppercase font-bold text-gray-700">
                {cte.ambiente}
              </div>
            </div>

            {/* Chave de Acesso e Código de Barras */}
            <div className="col-span-4 p-2 flex flex-col justify-between">
              {/* Fake barcode simulation */}
              <div className="h-10 bg-slate-200 border border-slate-400 flex items-center justify-center font-mono text-[9px] tracking-widest overflow-hidden">
                |||||| | |||| |||||||| |||| ||| ||||||| |||||||| ||||| ||||||
              </div>
              <div className="text-center my-1">
                <span className="text-[8px] font-bold block uppercase text-gray-600">CHAVE DE ACESSO DE 44 DÍGITOS</span>
                <span className="font-mono text-[10px] font-black tracking-tight block">
                  {formatarChaveAcesso(cte.chaveAcesso)}
                </span>
              </div>
              <div className="p-1.5 bg-gray-100 border border-gray-300 text-[8px] rounded">
                Consulta de autenticidade no portal nacional do CT-e www.cte.fazenda.gov.br ou no site da SEFAZ autorizadora.
              </div>
              <div className="pt-1 text-[9px] border-t border-gray-300 mt-1">
                <strong>PROTOCOLO AUTORIZAÇÃO:</strong> {cte.protocoloAutorizacao || '135260098124590'} - {cte.dataAutorizacao || cte.dataEmissao}
              </div>
            </div>
          </div>

          {/* CFOP e Natureza */}
          <div className="border border-black grid grid-cols-12 mb-2 p-1.5 text-[9px]">
            <div className="col-span-8">
              <strong>NATUREZA DA OPERAÇÃO:</strong> PRESTAÇÃO DE SERVIÇO DE TRANSPORTE DE RESÍDUOS AMBIPAR
            </div>
            <div className="col-span-2">
              <strong>CFOP:</strong> {cte.cfop}
            </div>
            <div className="col-span-2">
              <strong>INÍCIO:</strong> {cte.remetenteUf} &rarr; <strong>FIM:</strong> {cte.destinatarioUf}
            </div>
          </div>

          {/* Tomador do Serviço */}
          <div className="border border-black p-1.5 mb-2 bg-gray-50 text-[9px]">
            <strong>TOMADOR DO SERVIÇO:</strong> {cte.tomadorServico.toUpperCase()} ({cte.tomadorServico === 'Remetente' ? cte.remetenteNome : cte.destinatarioNome})
          </div>

          {/* Remetente & Destinatário */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="border border-black p-2 space-y-0.5 text-[9px]">
              <span className="font-bold text-[10px] block border-b border-black pb-0.5 uppercase">REMETENTE (ORIGEM)</span>
              <p><strong>NOME:</strong> {cte.remetenteNome}</p>
              <p><strong>ENDEREÇO:</strong> {cte.remetenteEndereco}</p>
              <p><strong>MUNICÍPIO:</strong> {cte.remetenteMunicipio} - {cte.remetenteUf}</p>
              <p><strong>CNPJ:</strong> {cte.remetenteCnpj} &middot; <strong>IE:</strong> {cte.remetenteIe}</p>
            </div>

            <div className="border border-black p-2 space-y-0.5 text-[9px]">
              <span className="font-bold text-[10px] block border-b border-black pb-0.5 uppercase">DESTINATÁRIO (DESTINO)</span>
              <p><strong>NOME:</strong> {cte.destinatarioNome}</p>
              <p><strong>ENDEREÇO:</strong> {cte.destinatarioEndereco}</p>
              <p><strong>MUNICÍPIO:</strong> {cte.destinatarioMunicipio} - {cte.destinatarioUf}</p>
              <p><strong>CNPJ:</strong> {cte.destinatarioCnpj} &middot; <strong>IE:</strong> {cte.destinatarioIe}</p>
            </div>
          </div>

          {/* Valores da Prestação e Impostos */}
          <div className="border border-black mb-2 text-[9px]">
            <div className="bg-gray-100 p-1 border-b border-black font-bold uppercase">
              COMPONENTES DO VALOR DA PRESTAÇÃO E TRIBUTAÇÃO
            </div>
            <div className="grid grid-cols-6 p-2 gap-2 border-b border-gray-300">
              <div>
                <span className="text-[8px] text-gray-600 block">FRETE PESO</span>
                <strong>{formatCurrency(cte.valorFretePeso)}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">PEDÁGIO</span>
                <strong>{formatCurrency(cte.valorPedagio)}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">GRIS / RISCO</span>
                <strong>{formatCurrency(cte.valorGris)}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">OUTROS</span>
                <strong>{formatCurrency(cte.valorOutros)}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">TOTAL FRETE</span>
                <strong className="text-emerald-700 text-[11px]">{formatCurrency(cte.valorTotalServico)}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">VALOR A RECEBER</span>
                <strong className="text-[11px]">{formatCurrency(cte.valorTotalServico)}</strong>
              </div>
            </div>
            <div className="grid grid-cols-4 p-2 gap-2 bg-gray-50 text-[9px]">
              <div>
                <span className="text-[8px] text-gray-600 block">SITUAÇÃO TRIBUTÁRIA</span>
                <strong>00 - TRIBUTADA INTEGRALMENTE</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">BASE DE CÁLCULO ICMS</span>
                <strong>{formatCurrency(cte.valorTotalServico)}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">ALÍQUOTA ICMS</span>
                <strong>{cte.aliquotaIcms.toFixed(2)}%</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">VALOR DO ICMS</span>
                <strong>{formatCurrency(cte.valorIcms)}</strong>
              </div>
            </div>
          </div>

          {/* Dados da Carga & Documentos Vinculados */}
          <div className="border border-black mb-2 text-[9px]">
            <div className="bg-gray-100 p-1 border-b border-black font-bold uppercase">
              INFORMAÇÕES DA CARGA & DOCUMENTOS VINCULADOS
            </div>
            <div className="grid grid-cols-4 p-2 gap-2 border-b border-gray-300">
              <div className="col-span-2">
                <span className="text-[8px] text-gray-600 block">PRODUTO PREDOMINANTE</span>
                <strong>{cte.produtoPredominante}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">PESO BRUTO</span>
                <strong>{formatNumber(cte.pesoBrutoKg, 1)} kg</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">VALOR AVERBADO CARGA</span>
                <strong>{formatCurrency(cte.valorCargaAverbada)}</strong>
              </div>
            </div>

            <div className="p-2 space-y-1 bg-gray-50">
              <p><strong>CHAVE DE ACESSO DA NF-E DA CARGA:</strong> <span className="font-mono">{cte.numeroNfeCarga}</span></p>
              {cte.numeroMtrVinculado && (
                <p><strong>MANIFESTO DE TRANSPORTE DE RESÍDUOS (MTR SINIR):</strong> <span className="font-mono text-emerald-800 font-bold">{cte.numeroMtrVinculado}</span></p>
              )}
            </div>
          </div>

          {/* Dados do Veículo e Motorista (Modal Rodoviário) */}
          <div className="border border-black mb-2 text-[9px]">
            <div className="bg-gray-100 p-1 border-b border-black font-bold uppercase">
              DADOS DO MODAL RODOVIÁRIO DE CARGA (ANTT)
            </div>
            <div className="grid grid-cols-4 p-2 gap-2">
              <div>
                <span className="text-[8px] text-gray-600 block">RNTRC DA EMPRESA</span>
                <strong className="font-mono">{empresa.rntrc}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">PLACA CAVALO / TRATOR</span>
                <strong className="font-mono text-[10px]">{cte.placaTracao}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">PLACA CARRETA / REBOQUE</span>
                <strong className="font-mono text-[10px]">{cte.placaReboque || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">CONDUTOR / MOTORISTA</span>
                <strong>{cte.motoristaNome}</strong>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="border border-black p-2 text-[8px] leading-relaxed">
            <span className="font-bold block uppercase text-gray-700">OBSERVAÇÕES FISCAIS & LEGAIS:</span>
            <p>{cte.observacoesFiscais}</p>
            <p className="mt-1 font-mono text-[7px] text-gray-500">
              EMITIDO EM AMBIENTE {cte.ambiente.toUpperCase()} &middot; REGIME TRIBUTÁRIO NORMAL &middot; AUTORIZADO SEFAZ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

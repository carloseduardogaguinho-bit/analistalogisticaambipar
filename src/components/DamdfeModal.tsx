import React from 'react';
import { MdfeDocumento, EmpresaFiscalConfig } from '../types';
import { Printer, Download, X } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { formatarChaveAcesso, formatarCnpj, gerarXmlMdfe } from '../utils/fiscalUtils';

interface DamdfeModalProps {
  mdfe: MdfeDocumento | null;
  empresa: EmpresaFiscalConfig;
  onClose: () => void;
}

export const DamdfeModal: React.FC<DamdfeModalProps> = ({ mdfe, empresa, onClose }) => {
  if (!mdfe) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    const xmlContent = gerarXmlMdfe(mdfe, empresa);
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${mdfe.chaveAcesso}-mdfe.xml`);
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
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Visualizador de DAMDFE &middot; SEFAZ Modelo 58
            </span>
            <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
              MDF-e Nº {mdfe.numeroMdfe} (Série {mdfe.serie})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadXml}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar XML MDF-e</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-ambipar-500 hover:bg-ambipar-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-ambipar-500/20 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir DAMDFE (PDF)</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official DAMDFE Sheet (A4) */}
        <div className="p-6 overflow-y-auto bg-white text-black font-sans text-[11px] leading-tight print:p-0 print:overflow-visible">
          {/* DAMDFE Header */}
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

            {/* DAMDFE Identificação */}
            <div className="col-span-3 p-2 border-r border-black text-center flex flex-col justify-between">
              <div>
                <h1 className="font-black text-base tracking-tight">DAMDFE</h1>
                <p className="text-[9px] leading-tight">Documento Auxiliar do Manifesto Eletrônico de Documentos Fiscais</p>
              </div>
              <div className="py-2 border-y border-black my-1 text-left text-[9px]">
                <p><strong>MODELO:</strong> 58</p>
                <p><strong>SÉRIE:</strong> {mdfe.serie}</p>
                <p><strong>NÚMERO:</strong> {mdfe.numeroMdfe}</p>
                <p><strong>EMISSÃO:</strong> {mdfe.dataEmissao}</p>
              </div>
              <div className="text-[8px] uppercase font-bold text-gray-700">
                {empresa.ambienteSefaz}
              </div>
            </div>

            {/* Chave de Acesso e Código de Barras */}
            <div className="col-span-4 p-2 flex flex-col justify-between">
              <div className="h-10 bg-slate-200 border border-slate-400 flex items-center justify-center font-mono text-[9px] tracking-widest overflow-hidden">
                |||||||| ||| |||||| |||||||| |||| ||| ||||||| |||||||| ||||| ||||||
              </div>
              <div className="text-center my-1">
                <span className="text-[8px] font-bold block uppercase text-gray-600">CHAVE DE ACESSO DO MDF-E</span>
                <span className="font-mono text-[10px] font-black tracking-tight block">
                  {formatarChaveAcesso(mdfe.chaveAcesso)}
                </span>
              </div>
              <div className="p-1.5 bg-gray-100 border border-gray-300 text-[8px] rounded">
                Consulta de autenticidade no portal nacional do MDF-e www.mdfe.fazenda.gov.br ou no site da SEFAZ autorizadora.
              </div>
              <div className="pt-1 text-[9px] border-t border-gray-300 mt-1">
                <strong>PROTOCOLO AUTORIZAÇÃO:</strong> {mdfe.protocoloAutorizacao || '135260089987654'} - {mdfe.dataEmissao}
              </div>
            </div>
          </div>

          {/* Dados do Percurso */}
          <div className="border border-black grid grid-cols-12 mb-2 p-1.5 text-[9px] bg-gray-50">
            <div className="col-span-6 border-r border-gray-300 pr-2">
              <span className="text-[8px] text-gray-600 block font-bold">CARREGAMENTO (ORIGEM)</span>
              <strong>UF: {mdfe.ufCarregamento}</strong> &middot; Município: {mdfe.municipioCarregamento}
            </div>
            <div className="col-span-6 pl-2">
              <span className="text-[8px] text-gray-600 block font-bold">DESCARREGAMENTO (DESTINO)</span>
              <strong>UF: {mdfe.ufDescarregamento}</strong> &middot; Município: {mdfe.municipioDescarregamento}
            </div>
          </div>

          {/* Dados do Modal Rodoviário & ANTT */}
          <div className="border border-black mb-2 text-[9px]">
            <div className="bg-gray-100 p-1 border-b border-black font-bold uppercase">
              MODAL RODOVIÁRIO DE CARGA & IDENTIFICAÇÃO DO CONDUTOR
            </div>
            <div className="grid grid-cols-4 p-2 gap-2 border-b border-gray-300">
              <div>
                <span className="text-[8px] text-gray-600 block">RNTRC DO EMITENTE</span>
                <strong className="font-mono">{mdfe.rntrc || empresa.rntrc}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">PLACA DO VEÍCULO (TRAÇÃO)</span>
                <strong className="font-mono text-[10px]">{mdfe.placaVeiculo}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">CIOT</span>
                <strong className="font-mono">{mdfe.ciot || 'NÃO APLICÁVEL'}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">STATUS FISCAL</span>
                <strong className="text-emerald-700">{mdfe.status.toUpperCase()}</strong>
              </div>
            </div>
            <div className="p-2 grid grid-cols-2 gap-2 bg-gray-50">
              <div>
                <span className="text-[8px] text-gray-600 block">NOME DO CONDUTOR</span>
                <strong>{mdfe.motoristaNome}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">CPF DO CONDUTOR</span>
                <strong className="font-mono">{mdfe.motoristaCpf}</strong>
              </div>
            </div>
          </div>

          {/* Dados do Seguro Obrigatório (RCTR-C) */}
          <div className="border border-black mb-2 text-[9px]">
            <div className="bg-gray-100 p-1 border-b border-black font-bold uppercase">
              DADOS DO SEGURO DE CARGA (RCTR-C / RCF-DC)
            </div>
            <div className="grid grid-cols-3 p-2 gap-2">
              <div>
                <span className="text-[8px] text-gray-600 block">RESPONSÁVEL PELO SEGURO</span>
                <strong>1 - EMITENTE DO MDF-E</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">SEGURADORA</span>
                <strong>{mdfe.seguradoraNome || 'Porto Seguro Cargas S.A.'}</strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block">NÚMERO DA APÓLICE</span>
                <strong className="font-mono">{mdfe.seguradoraApolice || 'APOL-AMB-2026-99'}</strong>
              </div>
            </div>
          </div>

          {/* Totais do Manifesto */}
          <div className="border border-black mb-2 text-[9px]">
            <div className="bg-gray-100 p-1 border-b border-black font-bold uppercase">
              TOTALIZADORES DA CARGA ACOBERTADA NO MANIFESTO
            </div>
            <div className="grid grid-cols-3 p-2 gap-2 text-center bg-gray-50">
              <div className="border-r border-gray-300">
                <span className="text-[8px] text-gray-600 block font-bold">QUANTIDADE DE CT-E</span>
                <strong className="text-base font-black">{mdfe.quantidadeCtes}</strong>
              </div>
              <div className="border-r border-gray-300">
                <span className="text-[8px] text-gray-600 block font-bold">PESO BRUTO TOTAL</span>
                <strong className="text-base font-black">
                  {formatNumber(mdfe.pesoBrutoTotalKg / 1000, 2)} t ({formatNumber(mdfe.pesoBrutoTotalKg, 0)} kg)
                </strong>
              </div>
              <div>
                <span className="text-[8px] text-gray-600 block font-bold">VALOR TOTAL DAS CARGAS</span>
                <strong className="text-base font-black text-emerald-800">
                  {formatCurrency(mdfe.valorTotalCargas)}
                </strong>
              </div>
            </div>
          </div>

          {/* Relação de Conhecimentos Eletrônicos (CT-e) Vinculados */}
          <div className="border border-black mb-2 text-[9px]">
            <div className="bg-gray-100 p-1 border-b border-black font-bold uppercase flex justify-between items-center">
              <span>DOCUMENTOS FISCAIS VINCULADOS (CHAVES DE ACESSO DO CT-E)</span>
              <span className="text-[8px] text-gray-600">{mdfe.ctesChaves.length} Conhecimento(s)</span>
            </div>
            <div className="p-2 space-y-1">
              {mdfe.ctesChaves.length === 0 ? (
                <p className="text-gray-500 italic">Nenhuma chave de CT-e informada.</p>
              ) : (
                mdfe.ctesChaves.map((chave, idx) => (
                  <div key={idx} className="flex items-center justify-between font-mono text-[9px] bg-gray-100 px-2 py-1 rounded">
                    <span><strong>CT-e {idx + 1}:</strong> {formatarChaveAcesso(chave)}</span>
                    <span className="text-emerald-700 font-bold">ACOBERTADO</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Observações e Rodapé Legal */}
          <div className="border border-black p-2 text-[8px] leading-relaxed">
            <span className="font-bold block uppercase text-gray-700">OBSERVAÇÕES & DISPOSIÇÕES LEGAIS:</span>
            <p>
              MANIFESTO ELETRÔNICO DE DOCUMENTOS FISCAIS EMITIDO EM CONFORMIDADE COM O AJUSTE SINIEF 21/10 E LEGISLAÇÃO APLICÁVEL DA ANTT.
              OBRIGATÓRIO O ENCERRAMENTO DESTE MANIFESTO APÓS A DESCARGA DA MERCADORIA NO DESTINO.
            </p>
            <div className="mt-4 pt-2 border-t border-gray-300 flex justify-between items-center text-[8px]">
              <div>DATA/HORA DA CONSULTA: {new Date().toLocaleString('pt-BR')}</div>
              <div>ASSINATURA DO CONDUTOR: _________________________________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

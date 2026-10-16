import JSZip from 'jszip';
import { CteDocumento, MdfeDocumento, EmpresaFiscalConfig } from '../types';
import { gerarXmlCte, gerarXmlMdfe } from './fiscalUtils';

/**
 * Cria pacote compactado .ZIP contendo todos os XMLs de CT-e e MDF-e
 * formatados para importação em lote no Emissor Gratuito do SEBRAE / SEFAZ.
 */
export const gerarPacoteZipSebrae = async (
  ctes: CteDocumento[],
  mdfes: MdfeDocumento[],
  empresa: EmpresaFiscalConfig
): Promise<Blob> => {
  const zip = new JSZip();

  // Pasta para Conhecimentos de Transporte (CT-e)
  const cteFolder = zip.folder('CTe_Para_Emissor_Sebrae');
  if (cteFolder) {
    ctes.forEach((cte) => {
      const xml = gerarXmlCte(cte, empresa);
      cteFolder.file(`${cte.chaveAcesso}-cte.xml`, xml);
    });
  }

  // Pasta para Manifestos Eletrônicos (MDF-e)
  const mdfeFolder = zip.folder('MDFe_Para_Emissor_Sebrae');
  if (mdfeFolder) {
    mdfes.forEach((mdfe) => {
      const xml = gerarXmlMdfe(mdfe, empresa);
      mdfeFolder.file(`${mdfe.chaveAcesso}-mdfe.xml`, xml);
    });
  }

  // Instruções oficiais para o Analista de Logística da Ambipar
  const instrucoes = `======================================================================
AMBIPAR LOGISTICS - PACOTE DE EMISSÃO GRATUITA SEBRAE / SEFAZ
======================================================================
Data de Geração: ${new Date().toLocaleString('pt-BR')}
Total de CT-es inclusos: ${ctes.length}
Total de MDF-es inclusos: ${mdfes.length}

COMO IMPORTAR E TRANSMITIR NO EMISSOR GRATUITO DO SEBRAE:
1. Abra o Emissor Gratuito do SEBRAE (versão CT-e 4.00 ou MDF-e 3.00) no seu computador.
2. Certifique-se de que o Certificado Digital A1 ou A3 da Ambipar está conectado.
3. No menu superior, clique em "Conhecimento" (ou "Manifesto") -> "Importar".
4. Selecione os arquivos .xml da pasta correspondente deste arquivo .ZIP.
5. Clique em "Assinar com Certificado Digital" e depois em "Transmitir para a SEFAZ".
6. Pronto! A SEFAZ homologará o documento oficial em segundos.
7. Para atualizar o nosso sistema: volte ao Portal Fiscal da Ambipar, clique em
   "Importar Retorno SEFAZ" e selecione o XML autorizado exportado pelo SEBRAE.
======================================================================`;

  zip.file('INSTRUCOES_DE_IMPORTACAO_SEBRAE.txt', instrucoes);

  return await zip.generateAsync({ type: 'blob' });
};

export interface ParsedSefazXml {
  tipo: 'cte' | 'mdfe' | 'desconhecido';
  chaveAcesso: string;
  numeroDoc: string;
  serie: string;
  protocoloAutorizacao: string;
  dataAutorizacao: string;
  cStat: string;
  xMotivo: string;
  valorTotal?: number;
  pesoKg?: number;
  emitenteCnpj?: string;
  remetenteNome?: string;
  destinatarioNome?: string;
}

/**
 * Faz o parse automático do XML de retorno da SEFAZ / SEBRAE (distCTeProc ou mdfeProc)
 * extraindo protocolo, chave, data e status oficial.
 */
export const parseXmlRetornoSefaz = (xmlContent: string): ParsedSefazXml => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

  // Detecta se é CT-e
  const isCte = xmlContent.includes('<CTe') || xmlContent.includes('cteProc') || xmlContent.includes('infCte');
  // Detecta se é MDF-e
  const isMdfe = xmlContent.includes('<MDFe') || xmlContent.includes('mdfeProc') || xmlContent.includes('infMDFe');

  const tipo: 'cte' | 'mdfe' | 'desconhecido' = isCte ? 'cte' : isMdfe ? 'mdfe' : 'desconhecido';

  // Chave de Acesso
  let chaveAcesso = '';
  const chCteElem = xmlDoc.querySelector('chCTe') || xmlDoc.querySelector('chMDFe');
  if (chCteElem && chCteElem.textContent) {
    chaveAcesso = chCteElem.textContent.trim();
  } else {
    const infDocElem = xmlDoc.querySelector('infCte') || xmlDoc.querySelector('infMDFe');
    if (infDocElem) {
      const idAttr = infDocElem.getAttribute('Id') || '';
      chaveAcesso = idAttr.replace(/\D/g, '');
    }
  }

  // Protocolo
  const nProtElem = xmlDoc.querySelector('nProt');
  const protocoloAutorizacao = nProtElem?.textContent?.trim() || '';

  // Data de Autorização
  const dhRecbtoElem = xmlDoc.querySelector('dhRecbto');
  const dataAutorizacao = dhRecbtoElem?.textContent?.trim() || new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Status cStat & xMotivo
  const cStatElem = xmlDoc.querySelector('cStat');
  const cStat = cStatElem?.textContent?.trim() || '100';

  const xMotivoElem = xmlDoc.querySelector('xMotivo');
  const xMotivo = xMotivoElem?.textContent?.trim() || 'Autorizado o uso';

  // Número e Série
  const nDocElem = xmlDoc.querySelector('nCT') || xmlDoc.querySelector('nMDF');
  const numeroDoc = nDocElem?.textContent?.trim() || '';

  const serieElem = xmlDoc.querySelector('serie');
  const serie = serieElem?.textContent?.trim() || '1';

  // Valores
  const vTPrestElem = xmlDoc.querySelector('vTPrest') || xmlDoc.querySelector('vCarga');
  const valorTotal = vTPrestElem?.textContent ? parseFloat(vTPrestElem.textContent) : undefined;

  const qCargaElem = xmlDoc.querySelector('qCarga');
  const pesoKg = qCargaElem?.textContent ? parseFloat(qCargaElem.textContent) : undefined;

  // Remetente & Destinatário
  const xNomeRemElem = xmlDoc.querySelector('rem xNome');
  const remetenteNome = xNomeRemElem?.textContent?.trim();

  const xNomeDestElem = xmlDoc.querySelector('dest xNome');
  const destinatarioNome = xNomeDestElem?.textContent?.trim();

  return {
    tipo,
    chaveAcesso,
    numeroDoc,
    serie,
    protocoloAutorizacao,
    dataAutorizacao,
    cStat,
    xMotivo,
    valorTotal,
    pesoKg,
    remetenteNome,
    destinatarioNome,
  };
};

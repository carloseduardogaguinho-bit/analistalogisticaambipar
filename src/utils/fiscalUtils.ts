import { CteDocumento, EmpresaFiscalConfig } from '../types';

/**
 * Calcula o Dígito Verificador (DV) Módulo 11 padrão SEFAZ para chave de 43 dígitos
 */
export const calcularDvModulo11 = (chave43: string): number => {
  let soma = 0;
  let peso = 2;

  for (let i = chave43.length - 1; i >= 0; i--) {
    soma += parseInt(chave43.charAt(i), 10) * peso;
    peso++;
    if (peso > 9) peso = 2;
  }

  const resto = soma % 11;
  const dv = 11 - resto;
  return dv === 0 || dv === 10 || dv === 11 ? 0 : dv;
};

/**
 * Gera chave de acesso de 44 dígitos oficial padrão SEFAZ para CT-e (Modelo 57)
 */
export const gerarChaveAcessoCte = (
  uf: string,
  cnpjEmitente: string,
  serie: string,
  numeroCte: string,
  tipoEmissao = '1' // 1 = Normal
): string => {
  const ufCodeMap: Record<string, string> = {
    SP: '35',
    MG: '31',
    RJ: '33',
    BA: '29',
    PR: '41',
    RS: '43',
    SC: '42',
    ES: '32',
    PE: '26',
  };

  const cUF = ufCodeMap[uf.toUpperCase()] || '35';
  const now = new Date();
  const aa = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const aamm = `${aa}${mm}`;

  const cleanCnpj = cnpjEmitente.replace(/\D/g, '').padStart(14, '0');
  const mod = '57'; // CT-e
  const ser = serie.replace(/\D/g, '').padStart(3, '0');
  const nCT = numeroCte.replace(/\D/g, '').padStart(9, '0');
  const tpEmis = tipoEmissao;
  const cCT = String(Math.floor(10000000 + Math.random() * 90000000)); // Código aleatório 8 dígitos

  const chave43 = `${cUF}${aamm}${cleanCnpj}${mod}${ser}${nCT}${tpEmis}${cCT}`;
  const cDV = calcularDvModulo11(chave43);

  return `${chave43}${cDV}`;
};

/**
 * Formata Chave de Acesso em grupos de 4 dígitos para visualização no DACTE
 */
export const formatarChaveAcesso = (chave: string): string => {
  if (!chave || chave.length !== 44) return chave;
  return chave.replace(/(\d{4})/g, '$1 ').trim();
};

/**
 * Formata CNPJ (00.000.000/0000-00)
 */
export const formatarCnpj = (cnpj: string): string => {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

/**
 * Gera XML do CT-e no padrão SEFAZ (distCTeProc)
 */
export const gerarXmlCte = (cte: CteDocumento, empresa: EmpresaFiscalConfig): string => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cteProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/cte">
  <CTe xmlns="http://www.portalfiscal.inf.br/cte">
    <infCte versao="4.00" Id="CTe${cte.chaveAcesso}">
      <ide>
        <cUF>35</cUF>
        <cCT>${cte.chaveAcesso.slice(35, 43)}</cCT>
        <CFOP>${cte.cfop}</CFOP>
        <natOp>PRESTACAO SERVICO TRANSPORTE RESIDUOS</natOp>
        <mod>57</mod>
        <serie>${cte.serie}</serie>
        <nCT>${cte.numeroCte}</nCT>
        <dhEmi>${new Date().toISOString()}</dhEmi>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>${cte.chaveAcesso.slice(-1)}</cDV>
        <tpAmb>${cte.ambiente.includes('Produção') ? '1' : '2'}</tpAmb>
        <tpCTe>0</tpCTe>
        <procEmi>0</procEmi>
        <verProc>Ambipar Logistics v1.0</verProc>
        <cMunIni>3536505</cMunIni>
        <xMunIni>${cte.remetenteMunicipio}</xMunIni>
        <UFIni>${cte.remetenteUf}</UFIni>
        <cMunFim>3533403</cMunFim>
        <xMunFim>${cte.destinatarioMunicipio}</xMunFim>
        <UFFim>${cte.destinatarioUf}</UFFim>
        <retira>1</retira>
      </ide>
      <emit>
        <CNPJ>${empresa.cnpj.replace(/\D/g, '')}</CNPJ>
        <IE>${empresa.inscricaoEstadual.replace(/\D/g, '')}</IE>
        <xNome>${empresa.razaoSocial}</xNome>
        <xFant>${empresa.nomeFantasia}</xFant>
        <enderEmit>
          <xLgr>${empresa.logradouro}</xLgr>
          <nro>${empresa.numero}</nro>
          <xBairro>${empresa.bairro}</xBairro>
          <cMun>3536505</cMun>
          <xMun>${empresa.municipio}</xMun>
          <CEP>${empresa.cep.replace(/\D/g, '')}</CEP>
          <UF>${empresa.uf}</UF>
        </enderEmit>
      </emit>
      <rem>
        <CNPJ>${cte.remetenteCnpj.replace(/\D/g, '')}</CNPJ>
        <IE>${cte.remetenteIe.replace(/\D/g, '')}</IE>
        <xNome>${cte.remetenteNome}</xNome>
        <enderReme>
          <xLgr>${cte.remetenteEndereco}</xLgr>
          <nro>SN</nro>
          <xMun>${cte.remetenteMunicipio}</xMun>
          <UF>${cte.remetenteUf}</UF>
        </enderReme>
      </rem>
      <dest>
        <CNPJ>${cte.destinatarioCnpj.replace(/\D/g, '')}</CNPJ>
        <IE>${cte.destinatarioIe.replace(/\D/g, '')}</IE>
        <xNome>${cte.destinatarioNome}</xNome>
        <enderDest>
          <xLgr>${cte.destinatarioEndereco}</xLgr>
          <nro>SN</nro>
          <xMun>${cte.destinatarioMunicipio}</xMun>
          <UF>${cte.destinatarioUf}</UF>
        </enderDest>
      </dest>
      <vPrest>
        <vTPrest>${cte.valorTotalServico.toFixed(2)}</vTPrest>
        <vRec>${cte.valorTotalServico.toFixed(2)}</vRec>
        <Comp>
          <xNome>FRETE PESO</xNome>
          <vComp>${cte.valorFretePeso.toFixed(2)}</vComp>
        </Comp>
        <Comp>
          <xNome>PEDAGIO</xNome>
          <vComp>${cte.valorPedagio.toFixed(2)}</vComp>
        </Comp>
        <Comp>
          <xNome>GRIS / RISCO</xNome>
          <vComp>${cte.valorGris.toFixed(2)}</vComp>
        </Comp>
      </vPrest>
      <imp>
        <ICMS>
          <ICMS00>
            <CST>00</CST>
            <vBC>${cte.valorTotalServico.toFixed(2)}</vBC>
            <pICMS>${cte.aliquotaIcms.toFixed(2)}</pICMS>
            <vICMS>${cte.valorIcms.toFixed(2)}</vICMS>
          </ICMS00>
        </ICMS>
      </imp>
      <infCTeNorm>
        <infCarga>
          <vCarga>${cte.valorCargaAverbada.toFixed(2)}</vCarga>
          <proPred>${cte.produtoPredominante}</proPred>
          <infQ>
            <cUnid>01</cUnid>
            <tpMed>PESO BRUTO</tpMed>
            <qCarga>${cte.pesoBrutoKg.toFixed(4)}</qCarga>
          </infQ>
        </infCarga>
        <infDoc>
          <infNFe>
            <chave>${cte.numeroNfeCarga.replace(/\s+/g, '')}</chave>
          </infNFe>
        </infDoc>
        <infModal versaoModal="4.00">
          <rodo>
            <RNTRC>${empresa.rntrc}</RNTRC>
            <veic>
              <placa>${cte.placaTracao}</placa>
              <UF>${empresa.uf}</UF>
            </veic>
            <moto>
              <xNome>${cte.motoristaNome}</xNome>
              <CPF>${cte.motoristaCpf.replace(/\D/g, '')}</CPF>
            </moto>
          </rodo>
        </infModal>
      </infCTeNorm>
    </infCte>
  </CTe>
  <protCTe versao="4.00">
    <infProt>
      <tpAmb>${cte.ambiente.includes('Produção') ? '1' : '2'}</tpAmb>
      <verAplic>SP_PL_CTe_400</verAplic>
      <chCTe>${cte.chaveAcesso}</chCTe>
      <dhRecbto>${cte.dataAutorizacao || new Date().toISOString()}</dhRecbto>
      <nProt>${cte.protocoloAutorizacao || '135260089123456'}</nProt>
      <digVal>4jL0zXk8P3+wFvH4=</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso do CT-e</xMotivo>
    </infProt>
  </protCTe>
</cteProc>`;

  return xml;
};

import { TipoCombustivel } from '../types';

// Fatores de emissão médios (kg CO2e por km rodado para veículos pesados / médios de carga)
const EMISSION_FACTORS: Record<TipoCombustivel, number> = {
  'Diesel S10': 0.88,
  'Biodiesel B20': 0.74,
  'GNV': 0.65,
  'HVO (Diesel Verde)': 0.13, // 85% de redução vs diesel fóssil
  '100% Elétrico': 0.04,     // Matriz elétrica brasileira limpa
};

const BASELINE_DIESEL = 0.88;

export interface EsgCalculation {
  co2EmitidoKg: number;
  co2EvitadoKg: number;
  reducaoPercent: number;
}

export const calculateEsgMetrics = (distanciaKm: number, combustivel: TipoCombustivel): EsgCalculation => {
  const emissionPerKm = EMISSION_FACTORS[combustivel] ?? BASELINE_DIESEL;
  const co2EmitidoKg = distanciaKm * emissionPerKm;
  const baselineEmitido = distanciaKm * BASELINE_DIESEL;
  const co2EvitadoKg = Math.max(0, baselineEmitido - co2EmitidoKg);
  const reducaoPercent = baselineEmitido > 0 ? (co2EvitadoKg / baselineEmitido) * 100 : 0;

  return {
    co2EmitidoKg: Math.round(co2EmitidoKg * 10) / 10,
    co2EvitadoKg: Math.round(co2EvitadoKg * 10) / 10,
    reducaoPercent: Math.round(reducaoPercent),
  };
};

export const getCombustivelColor = (combustivel: TipoCombustivel): string => {
  switch (combustivel) {
    case '100% Elétrico':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'HVO (Diesel Verde)':
      return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
    case 'GNV':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    case 'Biodiesel B20':
      return 'bg-lime-500/20 text-lime-300 border-lime-500/40';
    case 'Diesel S10':
    default:
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  }
};

export interface WlSpectrum {
  left: string;
  right: string;
  category?: string;
}

export const WL_SPECTRUMS: WlSpectrum[] = [
  // Temperature / Physical
  { left: 'CHAUD', right: 'FROID', category: 'Physique' },
  { left: 'LÉGER', right: 'LOURD', category: 'Physique' },
  { left: 'GRAND', right: 'PETIT', category: 'Physique' },
  { left: 'RAPIDE', right: 'LENT', category: 'Physique' },
  { left: 'DOUX', right: 'RUGUEUX', category: 'Physique' },
  { left: 'BRILLANT', right: 'TERNE', category: 'Physique' },
  { left: 'BRUYANT', right: 'SILENCIEUX', category: 'Physique' },
  { left: 'SOLIDE', right: 'LIQUIDE', category: 'Physique' },

  // Value / Quality
  { left: 'PAS CHER', right: 'CHER', category: 'Valeur' },
  { left: 'INUTILE', right: 'INDISPENSABLE', category: 'Valeur' },
  { left: 'FAIBLE', right: 'PUISSANT', category: 'Valeur' },
  { left: 'SIMPLE', right: 'COMPLEXE', category: 'Valeur' },
  { left: 'MAUVAIS FILM', right: 'CHEF-D\'ŒUVRE', category: 'Valeur' },
  { left: 'MAUVAISE IDÉE', right: 'BONNE IDÉE', category: 'Valeur' },
  { left: 'INVISIBLE', right: 'VISIBLE', category: 'Valeur' },
  { left: 'PASSÉ DE MODE', right: 'TENDANCE', category: 'Valeur' },

  // Society / Culture
  { left: 'OBSCUR', right: 'POPULAIRE', category: 'Culture' },
  { left: 'RÉEL', right: 'FICTIF', category: 'Culture' },
  { left: 'SÉRIEUX', right: 'DRÔLE', category: 'Culture' },
  { left: 'VIEUX', right: 'MODERNE', category: 'Culture' },
  { left: 'NATUREL', right: 'ARTIFICIEL', category: 'Culture' },
  { left: 'LOCAL', right: 'MONDIAL', category: 'Culture' },
  { left: 'CLASSIQUE', right: 'ORIGINAL', category: 'Culture' },
  { left: 'FORMEL', right: 'DÉCONTRACTÉ', category: 'Culture' },

  // Morality / Emotion
  { left: 'SÛRE', right: 'DANGEREUSE', category: 'Émotion' },
  { left: 'ENNUYEUX', right: 'EXCITANT', category: 'Émotion' },
  { left: 'TRISTE', right: 'JOYEUX', category: 'Émotion' },
  { left: 'STRESSANT', right: 'RELAXANT', category: 'Émotion' },
  { left: 'HONNÊTE', right: 'MALHONNÊTE', category: 'Émotion' },
  { left: 'COURAGEUX', right: 'LÂCHE', category: 'Émotion' },
  { left: 'ALTRUISTE', right: 'ÉGOÏSTE', category: 'Émotion' },
  { left: 'NORMAL', right: 'BIZARRE', category: 'Émotion' },

  // Food / Nature
  { left: 'SUCRÉ', right: 'SALÉ', category: 'Goût' },
  { left: 'CUIT', right: 'CRU', category: 'Goût' },
  { left: 'VÉGÉTARIEN', right: 'CARNÉ', category: 'Goût' },
  { left: 'DOUX', right: 'PIMENTÉ', category: 'Goût' },
  { left: 'FRAIS', right: 'SÉCHÉ', category: 'Goût' },
  { left: 'SAUVAGE', right: 'CULTIVÉ', category: 'Nature' },
  { left: 'TERRESTRE', right: 'AQUATIQUE', category: 'Nature' },
  { left: 'NUIT', right: 'JOUR', category: 'Nature' },

  // Abstract
  { left: 'FUTURISTE', right: 'RÉTRO', category: 'Abstrait' },
  { left: 'COMMUN', right: 'RARE', category: 'Abstrait' },
  { left: 'PRÉVISIBLE', right: 'IMPRÉVISIBLE', category: 'Abstrait' },
  { left: 'RATIONNEL', right: 'INTUITIF', category: 'Abstrait' },
  { left: 'INDIVIDUEL', right: 'COLLECTIF', category: 'Abstrait' },
  { left: 'ABSTRAIT', right: 'CONCRET', category: 'Abstrait' },
  { left: 'NUMÉRIQUE', right: 'ANALOGIQUE', category: 'Abstrait' },
  { left: 'LUXE', right: 'BASIQUE', category: 'Abstrait' },
  { left: 'SILENCIEUX', right: 'EXPRESSIF', category: 'Abstrait' },
  { left: 'SOLITAIRE', right: 'FESTIF', category: 'Abstrait' },
];

export function getRandomSpectrum(exclude?: WlSpectrum): WlSpectrum {
  const available = exclude
    ? WL_SPECTRUMS.filter((s) => s.left !== exclude.left)
    : WL_SPECTRUMS;
  return available[Math.floor(Math.random() * available.length)];
}

export const climateQuestionBank = [
  {
    id: "clarity",
    text: "Tengo claridad sobre lo que se espera de mi trabajo.",
    dimension: "claridad",
    required: true,
    type: "scale" as const,
  },
  {
    id: "recognition",
    text: "Siento que mi trabajo es valorado por mi equipo o liderazgo.",
    dimension: "reconocimiento",
    required: true,
    type: "scale" as const,
  },
  {
    id: "workload",
    text: "La carga de trabajo es manejable en mi dia a dia.",
    dimension: "carga",
    required: true,
    type: "scale" as const,
  },
  {
    id: "collaboration",
    text: "En mi equipo existe colaboracion y apoyo cuando lo necesito.",
    dimension: "colaboracion",
    required: true,
    type: "scale" as const,
  },
  {
    id: "wellbeing",
    text: "Hoy siento que mi bienestar importa dentro de la empresa.",
    dimension: "bienestar",
    required: true,
    type: "scale" as const,
  },
] as const;

export const climateScaleOptions = [1, 2, 3, 4, 5] as const;

export const climateScaleLabels: Record<number, string> = {
  1: "Muy en desacuerdo",
  2: "En desacuerdo",
  3: "Neutral",
  4: "De acuerdo",
  5: "Muy de acuerdo",
};

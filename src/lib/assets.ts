export type BackgroundId = 'mañana' | 'atardecer' | 'noche'
export type ChairId = '1' | '2' | '3'

export function assetPath(path: string): string {
  return encodeURI(path)
}

export const ASSETS = {
  backgrounds: {
    mañana: assetPath('/assets/fondos/fondo mañana.png'),
    atardecer: assetPath('/assets/fondos/fondo atardecer.png'),
    noche: assetPath('/assets/fondos/fondo noche.png'),
  } satisfies Record<BackgroundId, string>,
  clouds: {
    nube1: assetPath('/assets/clouds/nube 1.png'),
    nube2: assetPath('/assets/clouds/nube 2.png'),
  },
  loading: {
    start: assetPath('/assets/loading/Animacion inicio.png'),
  },
  main: {
    hills: assetPath('/assets/main/claro 1.png'),
    chairs: {
      '1': assetPath('/assets/main/silla 1.png'),
      '2': assetPath('/assets/main/silla 2.png'),
      '3': assetPath('/assets/main/silla 3.png'),
    } satisfies Record<ChairId, string>,
  },
  estanco: {
    base: assetPath('/assets/estanco/estanco.jpeg'),
    piedra: assetPath('/assets/estanco/piedra.png'),
  },
  tree: {
    base: assetPath('/assets/arbol/arbol arbol.png'),
    dentroFlor: assetPath('/assets/arbol/dentro-flor.png'),
    flor: {
      amarilla: assetPath('/assets/arbol/flor amarilla.png'),
      azul: assetPath('/assets/arbol/flor azul.png'),
      morada: assetPath('/assets/arbol/flor morada.png'),
      naranja: assetPath('/assets/arbol/flor naranja.png'),
      rosa: assetPath('/assets/arbol/flor rosa.png'),
      verdeOscura: assetPath('/assets/arbol/flor verde oscura.png'),
    },
  },
} as const

export type FlowerColor = keyof typeof ASSETS.tree.flor

export const FLOWER_HEX_COLORS: Record<FlowerColor, string> = {
  amarilla: '#FFF9C4',
  rosa: '#FFB1EC',
  morada: '#E1BEE7',
  verdeOscura: '#B2DFDB',
  naranja: '#FFCCBC',
  azul: '#B3E5FC',
}


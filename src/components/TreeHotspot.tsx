import { ASSETS } from '../lib/assets'

export function TreeHotspot({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="treeButton" onClick={onClick} aria-label="Abrir árbol">
      <img className="treeButton__img" src={ASSETS.tree.mainTree} alt="Árbol" decoding="async" loading="lazy" />
    </button>
  )
}


# CTA BUTTONS - UTILISATION GUIDE

Ce guide montre les différentes façons d'utiliser les composants CTA (Call-To-Action).

## 📦 Composants Disponibles

### 1. **CTAButtons** (LES DEUX BOUTONS ENSEMBLE)
- Fichier: `components/CTAButtons.tsx`
- Affiche: GET YOUR ONLYPOINT$ + PLAY THE SLOT côte à côte

### 2. **GetOnlyPointsButton** (BOUTON ACHAT SEUL)
- Fichier: `components/GetOnlyPointsButton.tsx`
- Affiche: GET YOUR ONLYPOINT$ uniquement

### 3. **PlayTheSlotButton** (BOUTON SLOTS SEUL)
- Fichier: `components/PlayTheSlotButton.tsx`
- Affiche: PLAY THE SLOT uniquement

---

## 🎯 EXEMPLES D'UTILISATION

### ✅ OPTION 1: Les deux boutons ensemble (CTA complète)

```tsx
import { CTAButtons } from '@/components/CTAButtons';

export default function MyPage() {
  return (
    <main>
      <h1>Bienvenue</h1>
      <CTAButtons />
    </main>
  );
}
```

---

### ✅ OPTION 2: GET YOUR ONLYPOINT$ seul

```tsx
import { GetOnlyPointsButton } from '@/components/GetOnlyPointsButton';

export default function MyPage() {
  return (
    <main>
      <h1>Achète des points</h1>
      <GetOnlyPointsButton />
    </main>
  );
}
```

---

### ✅ OPTION 3: PLAY THE SLOT seul

```tsx
import { PlayTheSlotButton } from '@/components/PlayTheSlotButton';

export default function MyPage() {
  return (
    <main>
      <h1>Joue aux slots</h1>
      <PlayTheSlotButton />
    </main>
  );
}
```

---

### ✅ OPTION 4: Les deux boutons ensemble MAIS avec layout personnalisé

```tsx
import { GetOnlyPointsButton } from '@/components/GetOnlyPointsButton';
import { PlayTheSlotButton } from '@/components/PlayTheSlotButton';

export default function MyPage() {
  return (
    <main>
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-2xl">
        <GetOnlyPointsButton />
        <PlayTheSlotButton />
      </div>
    </main>
  );
}
```

---

### ✅ OPTION 5: Dans un container/section spécifique

```tsx
import { CTAButtons } from '@/components/CTAButtons';

export default function MyPage() {
  return (
    <main className="min-h-screen bg-dark">
      <section className="py-20 px-4">
        <h1>Sections spéciale</h1>
        <div className="my-12">
          <CTAButtons />
        </div>
      </section>
    </main>
  );
}
```

---

### ✅ OPTION 6: Avec div wrapper personnalisé

```tsx
import { GetOnlyPointsButton } from '@/components/GetOnlyPointsButton';

export default function MyPage() {
  return (
    <main>
      <div className="flex items-center justify-center my-16">
        <div className="max-w-sm">
          <GetOnlyPointsButton />
        </div>
      </div>
    </main>
  );
}
```

---

### ✅ OPTION 7: Vertical (un par-dessus l'autre)

```tsx
import { GetOnlyPointsButton } from '@/components/GetOnlyPointsButton';
import { PlayTheSlotButton } from '@/components/PlayTheSlotButton';

export default function MyPage() {
  return (
    <main>
      <div className="flex flex-col gap-8 max-w-2xl">
        <GetOnlyPointsButton />
        <PlayTheSlotButton />
      </div>
    </main>
  );
}
```

---

### ✅ OPTION 8: Avec spacing personnalisé

```tsx
import { CTAButtons } from '@/components/CTAButtons';

export default function MyPage() {
  return (
    <main>
      <section className="py-32">
        <CTAButtons />
      </section>
    </main>
  );
}
```

---

### ✅ OPTION 9: Dans une card/modal

```tsx
import { CTAButtons } from '@/components/CTAButtons';

export default function MyPage() {
  return (
    <main>
      <div className="neon-border-yellow glass rounded-3xl p-8 md:p-12">
        <h2 className="text-4xl font-black mb-12 text-center">Choisis ton chemin</h2>
        <CTAButtons />
      </div>
    </main>
  );
}
```

---

### ✅ OPTION 10: Seul bouton avec texte autour

```tsx
import { PlayTheSlotButton } from '@/components/PlayTheSlotButton';

export default function MyPage() {
  return (
    <main>
      <h1 className="mb-8">Tu veux gagner des points?</h1>
      <div className="max-w-sm mx-auto">
        <PlayTheSlotButton />
      </div>
      <p className="text-center mt-8">Essaie gratuitement chaque jour!</p>
    </main>
  );
}
```

---

## 🎨 VARIATIONS POSSIBLES

Tu peux combiner les composants de **n'importe quelle façon**:
- ✅ Seul le bouton GET
- ✅ Seul le bouton PLAY
- ✅ Les deux ensemble (grid)
- ✅ Les deux verticalement
- ✅ Avec du texte avant/après
- ✅ Dans des containers spécifiques
- ✅ Avec des espacements personnalisés
- ✅ Dans des cards/modals

Les composants sont 100% **réutilisables et flexibles**! 🚀

# 🎨 Guide Design - Interface Edgy Arty Bold

## 📋 Vue d'ensemble

Votre interface a été redesignée avec:
- **Thème Sombre**: Gradient bleu noir (`#050710` → `#1a1f3a`)
- **Couleurs Néon**: Jaune (`#FFFF00`), Rose (`#FF006E`), Bleu (`#00D9FF`)
- **Effets Visuels**: Transparence, glow, dégradés, animations
- **Design Progressive**: Prêt pour images et vidéos

---

## 🎬 Comment ajouter des images & vidéos

### 1. **Images d'arrière-plan (Hero Sections)**

```tsx
// Dans shop/page.tsx - Ajouter une image hero
<div className="relative overflow-hidden rounded-3xl h-96 mb-12">
  {/* Image Background */}
  <div 
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/images/hero-banner.jpg')",
    }}
  >
    {/* Dark overlay avec transparence */}
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
  </div>

  {/* Contenu par-dessus */}
  <div className="relative z-10 py-12 px-8 text-center">
    <h2 className="text-5xl font-black gradient-text">VOTRE TITRE</h2>
  </div>
</div>
```

### 2. **Vidéos Embarquées (Background Video)**

```tsx
<div className="relative overflow-hidden rounded-3xl h-96 mb-12">
  {/* Vidéo Background */}
  <video
    autoPlay
    muted
    loop
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/videos/background.mp4" type="video/mp4" />
  </video>

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/50"></div>

  {/* Contenu */}
  <div className="relative z-10 py-12 px-8 text-center">
    <h2 className="text-5xl font-black gradient-text">TITRE AVEC VIDÉO</h2>
  </div>
</div>
```

### 3. **Galerie d'Images (Package Cards avec images)**

```tsx
{/* Dans la boucle des packages */}
<div key={pkg.id} className="neon-border-yellow glass-dark rounded-3xl overflow-hidden group">
  {/* Image du package */}
  <div className="relative h-48 overflow-hidden">
    <img
      src={`/images/package-${idx}.jpg`}
      alt={pkg.name}
      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
    />
    {/* Overlay gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-darker"></div>
  </div>

  {/* Contenu */}
  <div className="p-8">
    <h3 className="text-2xl font-black mb-6 glow-yellow">{pkg.name}</h3>
    {/* ... reste du contenu */}
  </div>
</div>
```

### 4. **Vidéo en Plein Écran (Modal/Featured)**

```tsx
<div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
  <div className="neon-border-yellow glass-dark rounded-3xl p-8 max-w-4xl w-full">
    <button 
      className="absolute top-4 right-4 text-neon-yellow text-xl"
      onClick={() => setShowVideo(false)}
    >
      ✕
    </button>
    
    <video
      width="100%"
      height="auto"
      controls
      autoPlay
      className="rounded-2xl"
    >
      <source src="/videos/presentation.mp4" type="video/mp4" />
    </video>
  </div>
</div>
```

---

## 🎨 Classes CSS Disponibles

### Effets Neon
```tsx
<div className="glow-yellow">Texte avec glow jaune</div>
<div className="glow-pink">Texte avec glow rose</div>
<div className="glow-blue">Texte avec glow bleu</div>
```

### Glass Effects
```tsx
<div className="glass">Verre normal (semi-transparent)</div>
<div className="glass-dark">Verre sombre (plus opaque)</div>
```

### Neon Borders
```tsx
<div className="neon-border">Bordure jaune</div>
<div className="neon-border-pink">Bordure rose</div>
<div className="neon-border-blue">Bordure bleu</div>
```

### Boutons
```tsx
<button className="btn-neon">Jaune</button>
<button className="btn-pink">Rose</button>
<button className="btn-blue">Bleu</button>
<button className="btn-yellow">Jaune alternatif</button>
```

### Text
```tsx
<h1 className="gradient-text">Texte dégradé multicolore</h1>
```

---

## 📁 Structure des Images/Vidéos Recommandée

```
public/
├── images/
│   ├── hero-banner.jpg (1920x1080)
│   ├── package-starter.jpg (800x600)
│   ├── package-pro.jpg (800x600)
│   └── package-premium.jpg (800x600)
└── videos/
    ├── background.mp4 (optimisé web)
    └── presentation.mp4
```

---

## 🎯 Conseils de Design

### Couleurs à Utiliser Ensemble
- **Neon Yellow + Dark Navy**: Maximum contrast, énergie
- **Neon Pink + Dark Navy**: Stylé, moderne
- **Neon Blue + Dark Navy**: Tech, cool
- **All Three**: Créatif, punk

### Animations Recommandées
```css
/* Hover scale avec glow */
.card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(255, 255, 0, 0.6);
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 2s infinite;
}
```

### Dégradés Personnalisés
```tsx
{/* Gradient text personnalisé */}
<span className="bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue bg-clip-text text-transparent">
  Texte coloré
</span>

{/* Gradient line */}
<div className="h-1 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue"></div>
```

---

## 📸 Exemples d'Utilisation

### Hero avec Vidéo Background
```tsx
<section className="relative h-96 rounded-3xl overflow-hidden mb-12">
  <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover">
    <source src="/videos/bg.mp4" type="video/mp4" />
  </video>
  <div className="absolute inset-0 bg-gradient-to-r from-dark-darker via-transparent to-dark-darker"></div>
  <div className="relative z-10 h-full flex items-center justify-center">
    <h1 className="text-6xl font-black gradient-text">PREMIUM ACCESS</h1>
  </div>
</section>
```

### Card avec Image et Overlay
```tsx
<div className="neon-border-yellow glass-dark rounded-3xl overflow-hidden group">
  <div className="relative h-40 overflow-hidden">
    <img src="/img.jpg" className="w-full group-hover:scale-125 transition duration-300" />
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition"></div>
  </div>
  <div className="p-6">
    <h3 className="text-2xl font-black glow-yellow">TITRE</h3>
  </div>
</div>
```

---

## 🚀 Déploiement

Le design est **production-ready** et compile sans erreurs. 

Pour ajouter images/vidéos:
1. Placez-les dans `/public`
2. Références-les avec `/path/to/file`
3. Optimisez pour le web (JPG pour images, MP4/WebM pour vidéos)
4. Build local puis push vers Vercel

**Build Command**: `npm run build` ✅
**Status**: Production Ready 🟢

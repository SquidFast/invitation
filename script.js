/* ==========================================================================
   SCRIPT — Invitation au bal
   Sections : 1) Configuration  2) Compte à rebours  3) Bouton "Non" fuyant
              4) Passage à la page de confirmation  5) Confettis
              6) Enveloppe  7) Lettre dépliable
   ========================================================================== */

/* ==========================================================================
   1) CONFIGURATION — à personnaliser
   ========================================================================== */

// 📅 Date et heure du bal (format : 'AAAA-MM-JJTHH:MM:SS')
// -> Remplace cette date par la vraie date du bal.
const DATE_DU_BAL = new Date('2026-07-03T19:30:00');

// 💬 Petites phrases qui s'affichent sur le bouton "Non" à chaque fois
// qu'il est évité. Libre à toi de les modifier.
const PHRASES_BOUTON_NON = [
  'Non',
  'Tu es sûre ?',
  'Pourquoi ?',
  "Tu m'aimes plus...",
  "Tu préféres Juliette c'es ça ?",
  "Bon d'accors, j'arrête...",
  'Ou pas !',
  "Mais pourquoi tu t'obstine ? 😔"
];

/* ==========================================================================
   2) COMPTE À REBOURS
   ========================================================================== */

function mettreAJourCompteARebours() {
  const maintenant = new Date().getTime();
  const ecart = DATE_DU_BAL.getTime() - maintenant;

  const elJours = document.getElementById('days');
  const elHeures = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSecondes = document.getElementById('seconds');

  if (ecart <= 0) {
    // Le jour J est arrivé (ou passé) : on affiche simplement des zéros.
    elJours.textContent = '00';
    elHeures.textContent = '00';
    elMinutes.textContent = '00';
    elSecondes.textContent = '00';
    return;
  }

  const jours = Math.floor(ecart / (1000 * 60 * 60 * 24));
  const heures = Math.floor((ecart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ecart % (1000 * 60 * 60)) / (1000 * 60));
  const secondes = Math.floor((ecart % (1000 * 60)) / 1000);

  // padStart pour garder toujours 2 chiffres (ex : "07" au lieu de "7")
  elJours.textContent = String(jours).padStart(2, '0');
  elHeures.textContent = String(heures).padStart(2, '0');
  elMinutes.textContent = String(minutes).padStart(2, '0');
  elSecondes.textContent = String(secondes).padStart(2, '0');
}

mettreAJourCompteARebours();
setInterval(mettreAJourCompteARebours, 1000);

/* ==========================================================================
   3) BOUTON "NON" QUI FUIT + BOUTON "OUI" QUI GRANDIT
   ========================================================================== */

const boutonOui = document.getElementById('yes-btn');
const boutonNon = document.getElementById('no-btn');

let nombreEsquives = 0;
let boutonNonDetache = false;
const SCALE_MAX = 1.9; // taille maximale que peut atteindre le bouton "Oui"

function deplacerBoutonNon() {
  // Important : on déplace le bouton directement dans <body> au tout premier
  // déclenchement. Sans ça, "position: fixed" se positionnerait par rapport
  // à ".buttons-container" (qui garde un transform figé après son animation
  // d'apparition) au lieu de se positionner par rapport à l'écran entier,
  // ce qui le faisait sortir du champ visible.
  if (!boutonNonDetache) {
    document.body.appendChild(boutonNon);
    boutonNonDetache = true;
  }

  // On rend le bouton "fixed" dès le premier déplacement pour qu'il
  // puisse se balader librement sur tout l'écran.
  boutonNon.classList.add('is-dodging');

  // Dimensions du bouton et de la fenêtre, pour ne jamais sortir de l'écran.
  const marge = 16;
  const largeurBouton = boutonNon.offsetWidth;
  const hauteurBouton = boutonNon.offsetHeight;
  const largeurMax = window.innerWidth - largeurBouton - marge;
  const hauteurMax = window.innerHeight - hauteurBouton - marge;

  const nouveauLeft = Math.max(marge, Math.random() * largeurMax);
  const nouveauTop = Math.max(marge, Math.random() * hauteurMax);

  boutonNon.style.left = `${nouveauLeft}px`;
  boutonNon.style.top = `${nouveauTop}px`;

  // On fait grandir le bouton "Oui" un peu plus à chaque esquive,
  // jusqu'à une taille maximale pour rester lisible.
  nombreEsquives++;
  const nouvelleEchelle = Math.min(1 + nombreEsquives * 0.09, SCALE_MAX);
  boutonOui.style.setProperty('--yes-scale', nouvelleEchelle);

  // On change le texte du bouton "Non" pour ajouter une touche d'humour.
  const indexPhrase = Math.min(nombreEsquives, PHRASES_BOUTON_NON.length - 1);
  boutonNon.textContent = PHRASES_BOUTON_NON[indexPhrase];
}

// Sur ordinateur : le survol suffit à faire fuir le bouton.
boutonNon.addEventListener('mouseenter', deplacerBoutonNon);

// Sur mobile/tablette (pas de survol) : on intercepte le tout premier
// contact tactile pour déplacer le bouton avant que le clic ne s'exécute.
boutonNon.addEventListener('touchstart', (evenement) => {
  evenement.preventDefault();
  deplacerBoutonNon();
}, { passive: false });

// Filet de sécurité : si jamais un clic atteint quand même le bouton
// (ex : navigation au clavier), il s'échappe au lieu de déclencher une action.
boutonNon.addEventListener('click', (evenement) => {
  evenement.preventDefault();
  deplacerBoutonNon();
});

/* ==========================================================================
   4) CLIC SUR "OUI" -> PASSAGE À LA PAGE DE CONFIRMATION
   ========================================================================== */

const pageInvitation = document.getElementById('invitation-page');
const pageConfirmation = document.getElementById('confirmation-page');

boutonOui.addEventListener('click', () => {
  pageInvitation.classList.remove('page--active');
  pageConfirmation.classList.add('page--active');

  // Le bouton "Non" a été déplacé directement dans <body> pour pouvoir fuir
  // librement (voir deplacerBoutonNon). Il ne fait donc plus partie de la
  // page d'invitation et resterait visible par-dessus la page de
  // confirmation si on ne le cachait pas explicitement ici.
  boutonNon.style.display = 'none';

  // On laisse la transition de fondu démarrer, puis on lance les confettis.
  setTimeout(lancerConfettis, 250);
});

/* ==========================================================================
   5) CONFETTIS (canvas, aucune librairie externe)
   ========================================================================== */

const canvasConfettis = document.getElementById('confetti-canvas');
const contexte = canvasConfettis.getContext('2d');

function redimensionnerCanvas() {
  canvasConfettis.width = window.innerWidth;
  canvasConfettis.height = window.innerHeight;
}
redimensionnerCanvas();
window.addEventListener('resize', redimensionnerCanvas);

// Palette de confettis assortie au thème noir / or / bleu nuit.
const COULEURS_CONFETTIS = ['#d4af37', '#f1d98a', '#ffffff', '#1b2658', '#f7f0e1'];

let particulesConfettis = [];
let animationConfettisEnCours = false;

function creerParticule() {
  return {
    x: Math.random() * canvasConfettis.width,
    y: -20 - Math.random() * canvasConfettis.height * 0.3,
    taille: 5 + Math.random() * 6,
    couleur: COULEURS_CONFETTIS[Math.floor(Math.random() * COULEURS_CONFETTIS.length)],
    vitesseY: 2 + Math.random() * 3,
    vitesseX: -1.5 + Math.random() * 3,
    rotation: Math.random() * 360,
    vitesseRotation: -6 + Math.random() * 12,
    opacite: 1
  };
}

function lancerConfettis() {
  // Génère une grosse salve de particules.
  const nouvellesParticules = Array.from({ length: 160 }, creerParticule);
  particulesConfettis = particulesConfettis.concat(nouvellesParticules);

  if (!animationConfettisEnCours) {
    animationConfettisEnCours = true;
    requestAnimationFrame(animerConfettis);
  }
}

function animerConfettis() {
  contexte.clearRect(0, 0, canvasConfettis.width, canvasConfettis.height);

  particulesConfettis.forEach((p) => {
    p.x += p.vitesseX;
    p.y += p.vitesseY;
    p.rotation += p.vitesseRotation;

    // Les particules commencent à s'estomper après avoir bien rempli l'écran.
    if (p.y > canvasConfettis.height * 0.6) {
      p.opacite -= 0.012;
    }

    contexte.save();
    contexte.translate(p.x, p.y);
    contexte.rotate((p.rotation * Math.PI) / 180);
    contexte.globalAlpha = Math.max(p.opacite, 0);
    contexte.fillStyle = p.couleur;
    contexte.fillRect(-p.taille / 2, -p.taille / 2, p.taille, p.taille * 0.6);
    contexte.restore();
  });

  // On retire les particules sorties de l'écran ou totalement transparentes.
  particulesConfettis = particulesConfettis.filter(
    (p) => p.opacite > 0 && p.y < canvasConfettis.height + 40
  );

  if (particulesConfettis.length > 0) {
    requestAnimationFrame(animerConfettis);
  } else {
    animationConfettisEnCours = false;
  }
}

/* ==========================================================================
   6) ENVELOPPE INTERACTIVE
   ========================================================================== */

const enveloppe = document.getElementById('envelope');
const indiceEnveloppe = document.getElementById('envelope-instruction');

function ouvrirEnveloppe() {
  enveloppe.classList.add('is-open');
  indiceEnveloppe.textContent = 'Clique sur la lettre pour la déplier';
}

enveloppe.addEventListener('click', () => {
  if (!enveloppe.classList.contains('is-open')) {
    // Premier clic : on ouvre simplement l'enveloppe.
    ouvrirEnveloppe();
  } else {
    // Deuxième clic (l'enveloppe est déjà ouverte) : on déplie la lettre.
    ouvrirLettre();
  }
});

// Accessibilité clavier : Entrée ou Espace déclenchent la même action que le clic.
enveloppe.addEventListener('keydown', (evenement) => {
  if (evenement.key === 'Enter' || evenement.key === ' ') {
    evenement.preventDefault();
    enveloppe.click();
  }
});

/* ==========================================================================
   7) LETTRE DÉPLIABLE EN GRAND
   ========================================================================== */

const overlayLettre = document.getElementById('letter-overlay');
const boutonFermerLettre = document.getElementById('close-letter');

function ouvrirLettre() {
  overlayLettre.classList.add('is-active');
}

function fermerLettre() {
  overlayLettre.classList.remove('is-active');
}

boutonFermerLettre.addEventListener('click', fermerLettre);

// On peut aussi fermer en cliquant en dehors de la lettre (sur le fond sombre).
overlayLettre.addEventListener('click', (evenement) => {
  if (evenement.target === overlayLettre) {
    fermerLettre();
  }
});

// Fermeture avec la touche Échap, pour le confort clavier.
document.addEventListener('keydown', (evenement) => {
  if (evenement.key === 'Escape' && overlayLettre.classList.contains('is-active')) {
    fermerLettre();
  }
});

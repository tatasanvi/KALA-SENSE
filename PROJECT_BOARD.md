# KALA SENSE — Pilotage du hackathon

Dernière mise à jour : 28 octobre 2026  
Orchestration : Codex (`/root`)  
Échéance de soumission : 4 novembre 2026, 21 h ET (**5 novembre, 2 h à Lomé**)

## Objectif de livraison

Une démo publique et reproductible qui prend un enregistrement autorisé, le transcrit avec Meta Voice Transcribe, fait ressortir des constats avec citations et temps associés via Muse Spark, puis laisse un superviseur accepter ou rejeter chaque analyse. La vidéo de soumission doit durer 3 minutes et montrer uniquement le nouveau travail du hackathon.

## Tableau de suivi

| ID | Mini-tâche | Responsable | Statut | Dépend de | Résultat attendu |
|---|---|---|---|---|---|
| P0 | Cadrer le problème, le public et les règles du concours | Codex + utilisateur | Terminé | — | Service client en contexte africain, thème « Build for Your World »; travail hackathon isolé |
| P1 | Créer le socle neuf et le parcours d’analyse | Codex | Terminé | P0 | Interface locale, serveur privé, transcription, analyse structurée et revue humaine |
| P2 | Normaliser les fichiers audio côté navigateur | Codex | Terminé | P1 | Conversion des formats décodables vers WAV mono PCM 16 bits / 24 kHz |
| P3 | Durcir l’API Meta : preuves, rôles, langues, injection, multipart et jeton de session | Agent `meta_api_audit` | Terminé | P1 | Transcription temporaire en mémoire, preuves revalidées, analyse liée à un jeton opaque |
| P4 | Corriger le parcours frontend et la revue superviseur | Agent `frontend_review` + Codex | Terminé | P1, P2, P3 | Labels neutres, preuves horodatées, accessibilité, suivi de session, jeton opaque et erreurs réessayables |
| P5 | Écrire le script de démo de 3 minutes | Agent `product_demo_review` | Terminé | P0, P1 | Script chronométré, parcours réel + repli synthétique explicitement marqué |
| P6 | Configurer la clé Meta dans l’environnement local | Utilisateur | En attente utilisateur | Créer/récupérer une clé API | Appels Meta activés; ne jamais envoyer la clé dans le chat ou le dépôt |
| P7 | Faire fonctionner un appel de bout en bout avec audio autorisé | Codex + utilisateur | À faire | P6, fichier compatible | Transcription, analyse Muse Spark, citations et décisions visibles |
| P8 | Intégrer et revoir les changements des agents | Codex | Terminé | P3–P5 | Backend, interface, confidentialité et script relus ensemble; jeton d’analyse aligné bout en bout |
| P9 | Choisir la piste et confirmer la liste de l’équipe | Utilisateur | Terminé | — | Indie Developer, solo; contributeur : SANVI TATA MARC ANTOINE |
| P10 | Préparer le déploiement Node et le dépôt public isolé | Agent `product_demo_review` + Codex | En cours | P8, P9 | Node natif choisi; configuration Render locale prête, aucun service public créé |
| P11 | Préparer le script et enregistrer la démo de 3 minutes | Codex + utilisateur | À faire | P7–P10 | Vidéo courte, démonstration réelle, aucune statistique présentée comme mesurée sans preuve |
| P12 | Contrôler la soumission et soumettre sur la plateforme | Utilisateur (soumissionnaire) + Codex (préparation) | À faire | P10, P11 | Liens publics vérifiés et membres ajoutés avant l’échéance |

## Vue rapide

- **Terminé :** 8 mini-tâches (P0–P5, P8–P9)
- **En cours :** préparation du déploiement Node/Render et du dépôt public isolé (P10)
- **À faire / attente utilisateur :** clé API (P6), appel réel (P7), vidéo et soumission (P11–P12)
- **Prochain jalon :** ajouter la clé localement, puis obtenir une analyse réelle de bout en bout.

## Décisions / actions attendues de l’utilisateur

1. Ajouter la clé Meta Model API au fichier local `.env` (`MODEL_API_KEY=...`), qui est exclu du dépôt. Ne pas la coller ici.
2. Node natif choisi par l’utilisateur pour conserver les appels jusqu’à 10 minutes. La configuration Render Free est prête localement; aucun service ni déploiement public n’a été créé.
3. Sélectionner l’enregistrement autorisé dans le navigateur au moment de la démo; aucun audio n’est ajouté au dépôt.

## Risques suivis

- Les fichiers d’appels sont envoyés à Meta pour transcription; n’utiliser que des enregistrements avec les droits et consentements nécessaires.
- Le score et la confiance affichés sont des estimations générées par modèle, pas des mesures calibrées. Le superviseur reste décisionnaire.
- Les locuteurs `A` et `B` sont des étiquettes de session, pas des identités vérifiées.
- L’exemple intégré est synthétique et ses sorties illustratives ne doivent jamais être présentées comme des résultats réels.
- Le prototype local n’a pas encore fait l’objet d’une validation par appel réel avec la clé du participant.
- Render Free peut mettre le service en veille après 15 minutes sans trafic; il faut le réveiller avant une démonstration. Le service gratuit utilise un système de fichiers éphémère et l’état en mémoire peut disparaître lors d’un redémarrage ou d’une mise en veille.
- Limites du plan Render Free : 0,1 CPU / 512 Mo de mémoire, 750 heures d’instance par espace de travail et par mois, veille après 15 minutes sans trafic et réveil pouvant prendre environ une minute. Les limites mensuelles de bande passante sortante et de minutes de build s’appliquent également. Ce plan convient à une démo/preview, pas à un service de production.
- Les plafonds d’appels sont par processus et peuvent repartir après redémarrage; ils limitent les appels accidentels sans garantir une limite de facturation globale.
- L’installation Node par défaut est 18.14.1; un runtime Codex Node 24.22.1 est également présent, tandis que la configuration Render cible 22.22.x. Il faut valider le parcours sur la version de déploiement avant publication.
- Configuration Render alignée : `.node-version` fixe Node 22.22.0 et `package.json` limite le moteur à `>=22.22.0 <23.0.0`; le serveur écoute sur `0.0.0.0:$PORT`. `MODEL_API_KEY` est déclaré en `sync: false` : saisir le secret lors de la création initiale du Blueprint, puis le gérer dans les paramètres Render.
- Le dépôt Git local est maintenant initialisé dans KALA-SENSE (`main`, aucun commit); il n’inclut donc pas la racine personnelle `C:/Users/NotoriosBiig`. Vérifier `.gitignore` et les fichiers ignorés avant tout commit ou publication.
- Après transcription, le serveur conserve le texte et les tours en mémoire pendant au plus 15 minutes, puis les supprime au lancement de l’analyse; le README et l’interface doivent refléter cette limite.
- Le tableau de bord antérieur reste exclu du matériel de soumission, sauf si les apports pré-hackathon sont explicitement identifiés et que seuls les ajouts du hackathon sont présentés.

## Journal

### 28 octobre 2026

- Initialisation de la vue d’orchestration et des tâches avec dépendances.
- Démarrage de trois audits sans chevauchement de fichiers : API Meta, critères de concours et UX.
- Le prototype local existant sert de base de travail; l’app n’a pas encore été reliée à la clé Meta du participant.
- L’utilisateur confirme la piste Indie Developer, une participation solo et la disponibilité d’un audio autorisé.
- Nom de contributeur confirmé par l’utilisateur : SANVI TATA MARC ANTOINE.
- Les agents ont reçu des tâches d’implémentation cloisonnées par fichier : backend Meta (`server.mjs`), interface (`public/app.js`, `public/index.html`) et script (`DEMO_SCRIPT.md`).
- Le script de 3 minutes et les correctifs backend/frontend sont rédigés. L’utilisateur choisit Node natif; Render Free est retenu et sa configuration locale est préparée (`render.yaml`, `.node-version`). Aucun service public n’est créé.
- Dépôt local isolé initialisé dans le seul dossier KALA-SENSE; aucun commit ni dépôt distant public pour l’instant.
- L’utilisateur confirme que la clé API n’est pas encore configurée; le champ doit être renseigné localement.
- Vérification locale sans afficher de secret : `.env` existe, mais `MODEL_API_KEY` est toujours vide ou absent; P6 et P7 restent donc en attente.
- Revue de sécurité : l’analyse réelle exige désormais le jeton opaque retourné à l’import; le frontend le transmet dans le même parcours, l’exemple synthétique fixe reste sans jeton.
- Serveur local redémarré sur le port 3000 avec le runtime Node 24.22.1 fourni par Codex; l’aperçu navigateur a été mis en file d’ouverture. Ce n’est pas encore une validation avec la version Render 22.22.x ni un appel Meta réel.
- Les corrections frontend signalent le nombre de constats écartés faute de preuve unique; l’import peut être relancé après erreur avec avertissement de consommation possible de crédits, et se désactive après succès.

# Little Victories — Tic-Tac-Toe

A polished, responsive Tic-Tac-Toe game for two local players or a player facing the computer. Choose your symbol, personalize player names, and keep a scoreboard across visits—all without a server or build step.

## Features

- Player vs Player and Player vs Computer modes
- Easy, Medium, and unbeatable Hard computer opponents
- Choose to play as X or O; the computer opens automatically when it is X
- Customizable player names and persistent win/draw scores
- New-round and separate score-reset controls
- Light and dark themes, with system-preference detection on first visit
- Optional synthesized sound effects, off by default
- Winning-cell highlights, turn announcements, and subtle win celebration
- Responsive layout and keyboard navigation, including arrow-key board movement
- Runs locally and on GitHub Pages with no required external services

## Screenshot

Add a screenshot of the running game to the repository (for example, `screenshots/game.png`) and replace this placeholder with:

```markdown
![Little Victories Tic-Tac-Toe screenshot](screenshots/game.png)
```

## Live demo

https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/

## Technologies

- Semantic HTML5
- CSS with custom properties, responsive layouts, and reduced-motion support
- Vanilla JavaScript (including Minimax and the Web Audio API)
- `localStorage` for scores and preferences, with graceful in-memory operation when storage is unavailable

No framework, package manager, build process, backend, or external game engine is required. System fonts are used so the game does not depend on network-loaded assets.

## Project structure

```text
.
├── index.html    # Accessible game markup
├── style.css     # Themes, responsive layout, and animations
├── script.js     # Game state, AI, persistence, and interactions
├── README.md     # Project and deployment guide
├── LICENSE       # MIT License
└── .gitignore
```

## Run locally

1. Download or clone this repository.
2. Open `index.html` directly in a modern browser.

For a local HTTP preview, run `python3 -m http.server 8000` from the project directory and open `http://localhost:8000`. Python is only an optional preview server; it is not required by the game.

## Deploy with GitHub Pages

1. Create a public repository on GitHub and push these project files to its default branch (usually `main`).
2. Open the repository on GitHub and select **Settings**.
3. In the left sidebar, select **Pages** under **Code and automation**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Select the default branch (for example, `main`) and the `/(root)` folder, then select **Save**.
6. Wait for the Pages deployment to finish. The published URL appears on the same Pages settings screen and follows `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
7. Replace the live-demo placeholder above with that URL.

GitHub Pages serves `index.html` directly; no workflow, compilation, or repository-specific base-path configuration is needed.

## Computer difficulty

- **Easy:** chooses a random open square most of the time; occasionally uses the strategic Minimax choice.
- **Medium:** mixes random moves with strategic Minimax moves for a more varied opponent.
- **Hard:** uses Minimax on every turn, choosing an optimal move. It cannot be beaten when it is played correctly; the best possible result against it is a draw.

## Accessibility

- Semantic sections, labels, real buttons, and native form controls
- Visible focus states and arrow-key navigation through the 3×3 board
- Screen-reader labels for board cells and a live announcement for turns and results
- State is communicated with text and symbols as well as color
- Touch-friendly controls, responsive sizing, and reduced-motion support
- Theme colors are selected for legible text in both modes

## Testing checklist

- [ ] Player vs Player can complete wins and draws
- [ ] Easy and Medium make a mix of random and strategic legal moves
- [ ] Hard cannot be beaten; try both X and O assignments
- [ ] Computer makes the opening move when assigned X
- [ ] All eight winning lines are detected and highlighted
- [ ] Draws are detected only on a full board without a winner
- [ ] Occupied cells and finished rounds reject further moves
- [ ] Scores update, survive refresh, and remain when starting another round
- [ ] Reset scores clears only the scores
- [ ] Names, mode, difficulty, symbol, theme, and sound preference survive refresh
- [ ] Keyboard tab/arrow/enter navigation and screen-reader status announcements work
- [ ] Layout remains usable at 320px width and on tablet/desktop
- [ ] Light/dark themes, system theme detection, and reduced motion work
- [ ] Game works with browser storage and audio unavailable
- [ ] Browser console has no errors and the game works offline without dependencies

## Known limitations

- Scores and preferences are stored only in the current browser and device; they do not sync across browsers.
- Web Audio availability and playback can depend on browser permissions. Sound is optional and starts muted.
- Easy and Medium intentionally include random moves, so they are not guaranteed to play optimally.

## Future improvements

- Add optional match-length settings and a match history
- Add localization and more color themes
- Add automated browser-based regression tests

## Contributing

Bug reports and focused improvements are welcome. Open an issue describing the behavior or enhancement, then submit a pull request with a concise explanation and steps to verify it. Keep the project dependency-free and test keyboard use, mobile layout, and both themes when changing the interface.

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for the full text.

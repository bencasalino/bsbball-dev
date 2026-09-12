const appContainer = document.getElementById('app');

const navigationItems = [
  { path: '/', label: 'League' },
  { path: '/seasons', label: 'Seasons' },
  { path: '/trophy-case', label: 'Trophy Case' },
  { path: '/hall-of-fame', label: 'Hall of Fame' },
  { path: '/record-book', label: 'Record Book' },
  { path: '/goat', label: 'GOAT Rankings' },
  { path: '/career-trajectories', label: 'Careers' },
  { path: '/seasons/20', label: 'Season 20' },
];

const leaderColumns = [
  { key: 'team_logo', label: 'Logo', type: 'text', defaultDirection: 'asc' },
  { key: 'name', label: 'Manager', type: 'text', defaultDirection: 'asc' },
  { key: 'est_year', label: 'EST.', type: 'number', defaultDirection: 'desc' },
  { key: 'seasons_played', label: 'Seasons', type: 'number', defaultDirection: 'desc' },
  { key: 'games_played', label: 'GP', type: 'number', defaultDirection: 'desc' },
  { key: 'wins', label: 'Wins', type: 'number', defaultDirection: 'desc' },
  { key: 'losses', label: 'Losses', type: 'number', defaultDirection: 'desc' },
  { key: 'winning_percentage', label: 'Winning %', type: 'number', defaultDirection: 'desc' },
  { key: 'playoff_appearances', label: 'Playoffs', type: 'number', defaultDirection: 'desc' },
  { key: 'finals', label: 'Finals', type: 'number', defaultDirection: 'desc' },
  { key: 'championships', label: 'Championships', type: 'number', defaultDirection: 'desc' },
];

const activeManagerNames = new Set([
  'Jonathan Hennke',
  'Ben Casalino',
  'Adam Bernert',
  'Rafa Soto',
]);

const state = {
  leadersSort: {
    key: 'wins',
    direction: 'desc',
  },
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shortenManagerName(name) {
  return String(name ?? '').replace(/^Jonathan\b/, 'Jon');
}

function formatPercentage(value) {
  const truncatedPercent = Math.trunc(Number(value || 0) * 1000) / 10;
  return `${truncatedPercent.toFixed(1)}%`;
}

function formatJoinOrder(value) {
  if (value == null) {
    return '—';
  }
  return `#${String(value).padStart(3, '0')}`;
}

function formatEstYear(value) {
  if (value == null) {
    return '—';
  }
  const year = Number(value);
  return `<span class="est-year-pill est-year-pill--${year}">${year}</span>`;
}

function formatRecord(wins, losses, ties = 0) {
  if (ties) {
    return `${wins}-${losses}-${ties}`;
  }
  return `${wins}-${losses}`;
}

function getLeaderColumn(columnKey) {
  return leaderColumns.find((column) => column.key === columnKey) || leaderColumns[0];
}

function compareLeaderValues(leftValue, rightValue, column) {
  if (column.type === 'text') {
    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), undefined, { sensitivity: 'base' });
  }

  const leftIsMissing = leftValue == null;
  const rightIsMissing = rightValue == null;
  if (leftIsMissing && rightIsMissing) return 0;
  if (leftIsMissing) return 1;
  if (rightIsMissing) return -1;
  return Number(leftValue) - Number(rightValue);
}

function sortLeaderRows(rows) {
  const activeColumn = getLeaderColumn(state.leadersSort.key);
  const directionMultiplier = state.leadersSort.direction === 'asc' ? 1 : -1;

  return [...rows].sort((left, right) => {
    const primaryComparison = compareLeaderValues(left[activeColumn.key], right[activeColumn.key], activeColumn);
    if (primaryComparison !== 0) {
      return primaryComparison * directionMultiplier;
    }

    const secondaryText = compareLeaderValues(left.name, right.name, getLeaderColumn('name'));
    if (secondaryText !== 0) {
      return secondaryText;
    }

    return compareLeaderValues(left.wins, right.wins, getLeaderColumn('wins')) * -1;
  });
}

function getLeaderSortIndicator(columnKey) {
  if (state.leadersSort.key !== columnKey) {
    return '↕';
  }

  return state.leadersSort.direction === 'asc' ? '↑' : '↓';
}

function setLeaderSort(columnKey) {
  if (state.leadersSort.key === columnKey) {
    state.leadersSort.direction = state.leadersSort.direction === 'asc' ? 'desc' : 'asc';
    return;
  }

  const column = getLeaderColumn(columnKey);
  state.leadersSort = {
    key: columnKey,
    direction: column.defaultDirection,
  };
}

function pluralize(count, noun) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
  }
  return response.json();
}

function setActiveNavigation() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('[data-route]').forEach((linkElement) => {
    const href = linkElement.getAttribute('href');
    const isActive = href === '/'
      ? currentPath === '/'
      : currentPath === href;
    linkElement.classList.toggle('is-active', isActive);
  });
}

function navigate(path) {
  if (window.location.pathname === path) {
    renderRoute();
    return;
  }
  window.history.pushState({}, '', path);
  renderRoute();
}

function renderLoading() {
  appContainer.innerHTML = '<section class="page-card"><p class="text-muted mb-0">Loading league data…</p></section>';
}

function renderError(message) {
  appContainer.innerHTML = `
    <section class="page-card page-card--narrow">
      <p class="page-eyebrow">Something went wrong</p>
      <h2 class="page-title">Unable to load this page</h2>
      <p class="page-copy mb-0">${escapeHtml(message)}</p>
    </section>
  `;
}

function renderLeagueHome(summary) {
  const highlightMarkup = summary.highlights.map((item) => `
    <li class="stat-list__item">
      <span class="stat-list__label">${escapeHtml(item.label)}</span>
      <strong class="stat-list__value">${escapeHtml(item.value)}</strong>
    </li>
  `).join('');

  const featureCards = [
    { path: '/leaders', icon: '📊', title: 'League Leaders', copy: 'Scan every manager across wins, titles, awards, and playoff success.' },
    { path: '/seasons', icon: '📅', title: 'Seasons', copy: 'Browse league history year by year and drill into each season table.' },
    { path: '/trophy-case', icon: '<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i>', title: 'Trophy Case', copy: 'See who has the banners, the awards, and the bragging rights.' },
    { path: '/hall-of-fame', icon: '🏛️', title: 'Hall of Fame', copy: 'Celebrate the managers and league legends that shaped the competition.' },
    { path: '/record-book', icon: '📖', title: 'Record Book', copy: 'Track the biggest career marks and single-season highs.' },
  ].map((card) => `
    <a class="feature-card" href="${card.path}" data-route>
      <span class="feature-card__icon">${card.icon}</span>
      <div>
        <h3 class="feature-card__title">${card.title}</h3>
        <p class="feature-card__copy mb-0">${card.copy}</p>
      </div>
    </a>
  `).join('');

  const recentChampion = summary.recentChampion
    ? `${summary.recentChampion.name}`
    : 'No champion recorded yet';

  const featuredSeasonMarkup = summary.featuredSeasons.map((season) => `
    <a class="season-teaser" href="/seasons/${season.season_id}" data-route>
      <div>
        <p class="season-teaser__label">Season ${season.season_number}</p>
        <h3 class="season-teaser__title">${escapeHtml(String(season.year))}</h3>
      </div>
      <div class="season-teaser__meta">
        <span>${escapeHtml(season.champion_name || 'Champion TBD')}</span>
        <span>${escapeHtml(season.winning_record || 'No results yet')}</span>
      </div>
    </a>
  `).join('');

  appContainer.innerHTML = `
    <section class="hero-card">
      <div class="hero-card__content">
        <p class="page-eyebrow">League Home</p>
        <h2 class="page-title">A living history of the BS Basketball League.</h2>
        <p class="page-copy">Track every banner, leaderboard, season table, and all-time mark using the existing league database and dummy history as the foundation.</p>
      </div>
      <div class="hero-card__stats">
        <div class="summary-card">
          <span class="summary-card__label">Latest Season</span>
          <strong class="summary-card__value">Season ${escapeHtml(summary.latestSeason.season_number)}</strong>
          <span class="summary-card__meta">${escapeHtml(String(summary.latestSeason.year))}</span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">Managers</span>
          <strong class="summary-card__value">${summary.managerCount}</strong>
          <span class="summary-card__meta">active and former managers</span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">Seasons</span>
          <strong class="summary-card__value">${summary.seasonCount}</strong>
          <span class="summary-card__meta">league years on file</span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">Championships</span>
          <strong class="summary-card__value">${summary.totalChampionships}</strong>
          <span class="summary-card__meta">awarded banners</span>
        </div>
      </div>
    </section>

    <section class="content-grid mt-4">
      <article class="page-card">
        <p class="page-eyebrow">Headline</p>
        <h3 class="section-title">Recent Champion</h3>
        <p class="headline-stat">${escapeHtml(recentChampion)}</p>
        <p class="page-copy mb-0">The homepage stays focused on league storylines instead of admin tools, so this section can later grow into news, featured seasons, or dynasty snapshots.</p>
      </article>
      <article class="page-card">
        <p class="page-eyebrow">All-Time Notes</p>
        <h3 class="section-title">Interesting Stats</h3>
        <ul class="stat-list">${highlightMarkup}</ul>
      </article>
    </section>

    <section class="page-card mt-4">
      <div class="section-heading">
        <div>
          <p class="page-eyebrow">Explore</p>
          <h3 class="section-title">League Sections</h3>
        </div>
      </div>
      <div class="feature-grid">${featureCards}</div>
    </section>

    <section class="page-card mt-4">
      <div class="section-heading">
        <div>
          <p class="page-eyebrow">Season Watch</p>
          <h3 class="section-title">Recent Seasons</h3>
        </div>
      </div>
      <div class="season-teaser-grid">${featuredSeasonMarkup}</div>
    </section>
  `;
}

function renderLeadersTableRows(rows) {
  const maxWins = Math.max(...rows.map((row) => row.wins), 1);
  const maxLosses = Math.max(...rows.map((row) => row.losses), 1);
  const progressCell = (value, maximum, label, variant = '') => {
    const progress = Math.min(100, Math.max(0, (value / maximum) * 100));
    return `<span class="leader-progress ${variant}" style="--progress: ${progress}%" aria-label="${label}: ${value}"><span class="leader-progress__value">${value}</span></span>`;
  };
  const percentageCell = (value) => `<span class="leader-progress" style="--progress: ${Math.min(100, Math.max(0, Number(value) * 100))}%" aria-label="Winning percentage: ${formatPercentage(value)}"><span class="leader-progress__value">${formatPercentage(value)}</span></span>`;
  return rows.map((row) => `
    <tr>
      <td>
        <span class="team-logo" style="--team-color-1: ${escapeHtml(row.team_color_1)}; --team-color-2: ${escapeHtml(row.team_color_2)}" title="${escapeHtml(row.team_logo)}">
          <i class="${escapeHtml(row.team_logo)}" aria-hidden="true"></i>
        </span>
      </td>
      <td>
        <strong>${escapeHtml(row.name)}</strong>
        ${row.active && activeManagerNames.has(row.name) ? '<span class="manager-active-dot" title="Active manager" aria-label="Active manager"></span>' : ''}
      </td>
      <td>${formatEstYear(row.est_year)}</td>
      <td>${row.seasons_played}</td>
      <td>${row.games_played}</td>
      <td>${progressCell(row.wins, maxWins, 'Wins')}</td>
      <td>${progressCell(row.losses, maxLosses, 'Losses', 'leader-progress--losses')}</td>
      <td>${percentageCell(row.winning_percentage)}</td>
      <td>${row.playoff_appearances}</td>
      <td>${row.finals}</td>
      <td><span class="leader-championships" aria-label="${row.championships} championships">${row.championships}<span aria-hidden="true">${'<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold"></i>'.repeat(row.championships)}</span></span></td>
    </tr>
  `).join('');
}

function renderLeaders(leaders) {
  const sortedRows = sortLeaderRows(leaders);
  appContainer.innerHTML = `
    <section class="page-card">
      <div class="section-heading section-heading--stack-mobile">
        <div>
          <p class="page-eyebrow">League Leaders</p>
          <h2 class="page-title"><i class="fa-solid fa-chart-simple" aria-hidden="true"></i> All-time Manager Stats</h2>
        </div>
        <div class="text-md-end">
          <p class="sort-helper mb-1">Click any column header to sort it.</p>
          <p class="sort-helper mb-0"><span class="manager-active-dot" style="margin-left: 0; margin-right: 0.35rem;" aria-hidden="true"></span>Managers with a green dot are active for the upcoming season</p>
        </div>
      </div>
      <div class="table-shell mt-4">
        <table class="table data-table align-middle mb-0">
          <thead>
            <tr>
              ${leaderColumns.map((column) => `
                <th>
                  <button
                    type="button"
                    class="table-sort-button ${state.leadersSort.key === column.key ? 'is-active' : ''}"
                    data-leader-sort="${column.key}"
                    aria-label="Sort by ${column.label} ${state.leadersSort.key === column.key ? state.leadersSort.direction : column.defaultDirection}"
                  >
                    <span>${column.label}</span>
                    <span class="table-sort-indicator">${getLeaderSortIndicator(column.key)}</span>
                  </button>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>${renderLeadersTableRows(sortedRows)}</tbody>
        </table>
      </div>
    </section>
  `;

  document.querySelectorAll('[data-leader-sort]').forEach((buttonElement) => {
    buttonElement.addEventListener('click', () => {
      setLeaderSort(buttonElement.getAttribute('data-leader-sort'));
      renderLeaders(leaders);
    });
  });
}

function renderSeasonsList(seasons) {
  const maxFinishers = Math.max(...seasons.map((season) => season.finishers.length), 0);
  const renderFinisher = (finisher) => finisher
    ? `<span class="season-finisher"><span class="team-logo" style="--team-color-1: ${escapeHtml(finisher.team_color_1)}; --team-color-2: ${escapeHtml(finisher.team_color_2)}" title="${escapeHtml(finisher.team_logo)}"><i class="${escapeHtml(finisher.team_logo)}" aria-hidden="true"></i></span><small>${escapeHtml(shortenManagerName(finisher.manager_name).split(' ')[0])}</small></span>`
    : '—';
  const finishTable = `
    <div class="table-shell season-finish-table-wrap">
      <table class="table data-table season-finish-table align-middle mb-0">
        <thead><tr><th>Season</th>${Array.from({ length: maxFinishers }, (_, index) => `<th>${index + 1}</th>`).join('')}</tr></thead>
        <tbody>${seasons.map((season) => {
          const isSeason20 = season.season_number === 20;
          return `<tr><th scope="row">S${season.season_number} · ${escapeHtml(String(season.year))}</th>${Array.from({ length: maxFinishers }, (_, index) => `<td>${isSeason20 ? '—' : renderFinisher(season.finishers[index])}</td>`).join('')}</tr>`;
        }).join('')}</tbody>
      </table>
    </div>
  `;
  const seasonCards = seasons.map((season) => {
    const isSeason20 = season.season_number === 20;
    const top3 = isSeason20 ? [] : (season.finishers || []).slice(0, 3);
    const champion = isSeason20 ? 'TBD' : (top3[0] ? escapeHtml(shortenManagerName(top3[0].manager_name)) : 'TBD');
    const championLogo = (!isSeason20 && top3[0])
      ? `<span class="team-logo season-card__champion-logo" style="--team-color-1: ${escapeHtml(top3[0].team_color_1)}; --team-color-2: ${escapeHtml(top3[0].team_color_2)}" title="${escapeHtml(top3[0].manager_name)}"><i class="${escapeHtml(top3[0].team_logo)}" aria-hidden="true"></i></span><small class="season-card__champion-name">${champion}</small>`
      : '';

    return `
      <a class="season-card" href="/seasons/${season.season_id}" data-route>
        <div class="season-card__col season-card__col--left">
          <p class="season-card__label">Season ${season.season_number}</p>
          <h3 class="season-card__title"><span class="est-year-pill est-year-pill--${season.year}">${escapeHtml(String(season.year))}</span></h3>
          <span class="season-card__count">${pluralize(season.manager_count, 'manager')}</span>
        </div>
        <div class="season-card__col season-card__col--middle">
          <div class="season-card__summary">
            <div><strong><i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i> Champion</strong> ${champion}</div>
            <div><strong>Winning Record</strong> ${isSeason20 ? 'Open' : escapeHtml(season.winning_record || 'No results yet')}</div>
          </div>
        </div>
        <div class="season-card__col season-card__col--champion-logo">${championLogo}</div>
      </a>
    `;
  }).join('');

  appContainer.innerHTML = `
    <section class="page-card">
      <p class="page-eyebrow">Season History</p>
      <h3 class="section-title mt-4">Season Finishes</h3>
      ${finishTable}
      <div class="season-card-grid mt-4">${seasonCards}</div>
    </section>
  `;
}

function renderSeasonDetail(detail) {
  const isSeason20 = detail.season.season_number === 20;
  const rows = detail.standings.length
    ? detail.standings.map((row) => `
      <tr>
        <td>${isSeason20 ? '—' : (row.regular_season_rank || '—')}</td>
        <td><span class="team-logo" style="--team-color-1: ${escapeHtml(row.team_color_1)}; --team-color-2: ${escapeHtml(row.team_color_2)}" title="${escapeHtml(row.manager_name)}"><i class="${escapeHtml(row.team_logo)}" aria-hidden="true"></i></span></td>
        <td><strong>${escapeHtml(shortenManagerName(row.manager_name))}</strong></td>
        <td>${formatRecord(row.wins, row.losses, row.ties)}</td>
        <td>${isSeason20 ? 'No' : (row.playoffs_made ? 'Yes' : 'No')}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="5" class="text-center text-muted py-4">No season results have been added yet for this year.</td></tr>';

  appContainer.innerHTML = `
    <section class="page-card">
      <a class="back-link" href="/seasons" data-route>← Back to Seasons</a>
      <div class="section-heading mt-3">
        <div>
          <p class="page-eyebrow">Season Detail</p>
          <h2 class="page-title">Season ${detail.season.season_number} · ${escapeHtml(String(detail.season.year))}</h2>
          <p class="page-copy mb-0">Champion: ${escapeHtml(detail.champion ? shortenManagerName(detail.champion.name) : 'TBD')} · ${pluralize(detail.manager_count, 'manager')} recorded</p>
        </div>
      </div>
      <div class="table-shell mt-4">
        <table class="table data-table align-middle mb-0">
          <thead>
            <tr>
              <th>Rank</th>
              <th aria-label="Team logo"></th>
              <th>Manager</th>
              <th>Record</th>
              <th>${isSeason20 ? 'Paid' : 'Playoffs'}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function formatOrdinal(value) {
  if (value == null) return '—';
  const suffix = value % 100 >= 11 && value % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[value % 10] || 'th');
  return `${value}${suffix}`;
}

function playoffLabel(season) {
  if (!season.playoffs_made) return 'Did Not Make Playoffs';
  if (season.playoff_finish === 1) return 'Champion';
  if (season.playoff_finish === 2) return 'Runner-Up';
  if (season.playoff_finish === 3) return 'Third Place';
  return 'Playoff Appearance';
}

function playoffLabelWithIcon(season) {
  const icons = {
    1: '<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i>',
    2: '<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i>',
    3: '<i class="fa-solid fa-medal trophy-icon trophy-icon--bronze" aria-hidden="true"></i>',
  };
  return `${icons[season.playoff_finish] || ''} ${escapeHtml(playoffLabel(season))}`.trim();
}

function renderCareerTrajectoryChart(manager, seasons) {
  const config = { label: 'Regular Season Finish', value: (season) => season.regular_season_finish, format: formatOrdinal, invert: true };
  const points = seasons.filter((season) => config.value(season) != null);
  if (!points.length) return `<div class="trajectory-chart__empty">No ${config.label.toLowerCase()} data is available.</div>`;
  const width = 900;
  const height = 350;
  const padding = { top: 28, right: 28, bottom: 48, left: 52 };
  const values = points.map(config.value);
  let minimum = Math.min(...values);
  let maximum = Math.max(...values);
  if (minimum === maximum) {
    minimum = Math.max(0, minimum - 1);
    maximum += 1;
  }
  const x = (index) => padding.left + (index * (width - padding.left - padding.right)) / Math.max(points.length - 1, 1);
  const y = (value) => {
    const normalized = (value - minimum) / (maximum - minimum);
    return padding.top + (config.invert ? normalized : 1 - normalized) * (height - padding.top - padding.bottom);
  };
  const tickValues = Array.from({ length: 5 }, (_, index) => minimum + ((maximum - minimum) * index) / 4);
  const line = points.map((season, index) => `${x(index)},${y(config.value(season))}`).join(' ');
  return `
    <div class="trajectory-chart" role="img" aria-label="${escapeHtml(manager.name)} career ${config.label} chart">
      <div class="trajectory-chart__label">${config.label}</div>
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
        ${tickValues.map((value) => `<g><line x1="${padding.left}" x2="${width - padding.right}" y1="${y(value)}" y2="${y(value)}" class="trajectory-chart__grid"/><text x="${padding.left - 10}" y="${y(value) + 4}" text-anchor="end" class="trajectory-chart__axis">${escapeHtml(config.format(Math.round(value)))}</text></g>`).join('')}
        <polyline points="${line}" class="trajectory-chart__line" />
        ${points.map((season, index) => `<g class="trajectory-chart__point"><circle cx="${x(index)}" cy="${y(config.value(season))}" r="5"/><title>Season ${season.season_number} · ${season.year}\n${manager.name}\n${config.label}: ${config.format(config.value(season))}\nRecord: ${formatRecord(season.wins, season.losses, season.ties)}</title><text x="${x(index)}" y="${height - 16}" text-anchor="middle" class="trajectory-chart__axis">${season.year}</text></g>`).join('')}
      </svg>
    </div>
  `;
}

function renderCareerTrajectories(managers, trajectory = null) {
  const managerPicker = `<div class="trajectory-picker" aria-label="Select manager">${managers.map((item) => `<button type="button" class="trajectory-picker__item ${trajectory && item.manager_id === trajectory.manager.manager_id ? 'is-selected' : ''}" data-trajectory-manager="${item.manager_id}"><span class="team-logo" style="--team-color-1: ${escapeHtml(item.team_color_1)}; --team-color-2: ${escapeHtml(item.team_color_2)}"><i class="${escapeHtml(item.team_logo)}" aria-hidden="true"></i></span><span>${escapeHtml(shortenManagerName(item.name).split(' ')[0])}</span></button>`).join('')}</div>`;
  if (!trajectory) {
    appContainer.innerHTML = `
      <section class="page-card trajectory-page">
        <p class="page-eyebrow"><i class="fa-solid fa-chart-line" aria-hidden="true"></i> Careers</p>
        <h2 class="page-title">Careers</h2>
        <p class="page-copy">Explore how every manager's career has changed from season to season.</p>
        <h3 class="section-title mt-4">Select Manager</h3>
        ${managerPicker}
      </section>
    `;
  } else {
  const { manager, career_summary: summary, seasons, highlights, streaks } = trajectory;
  const bestSeason = highlights.best_season;
  const improvement = highlights.biggest_improvement;
  const summaryStats = [
    ['<i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Seasons Played', summary.seasons], ['<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i> Championships', summary.championships], ['<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i> Finals', summary.finals], ['<i class="fa-solid fa-bookmark" aria-hidden="true"></i> Playoff Appearances', summary.playoffs],
    ['<i class="fa-solid fa-award" aria-hidden="true"></i> Regular-Season Wins', summary.wins], ['<i class="fa-solid fa-chart-line" aria-hidden="true"></i> Career Win %', formatPercentage(summary.winning_percentage)], ['<i class="fa-solid fa-crown" aria-hidden="true"></i> Best Regular Season', formatOrdinal(summary.best_regular_season_finish)], ['<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i> Best Playoff Finish', summary.best_playoff_finish ? playoffLabel({ playoffs_made: true, playoff_finish: summary.best_playoff_finish }) : '—'],
    ['<span aria-hidden="true">🐐</span> Current GOAT Rank', summary.goat_rank ? `#${summary.goat_rank}` : '—'], ['<span aria-hidden="true">🐐</span> Current GOAT Score', summary.goat_score.toLocaleString()],
  ];
  const highlightsList = [
    summary.championships ? `<li><i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i> ${summary.championships}× Champion</li>` : '',
    streaks.playoff_streak.length ? `<li><i class="fa-solid fa-fire" aria-hidden="true"></i> Longest Playoff Streak: ${pluralize(streaks.playoff_streak.length, 'season')}</li>` : '',
    summary.best_regular_season_finish ? `<li><i class="fa-solid fa-medal" aria-hidden="true"></i> Best Regular Season: ${formatOrdinal(summary.best_regular_season_finish)}</li>` : '',
    bestSeason ? `<li><i class="fa-solid fa-chart-line" aria-hidden="true"></i> Best Single-Season Record: ${formatRecord(bestSeason.wins, bestSeason.losses, bestSeason.ties)}</li>` : '',
    improvement ? `<li><i class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i> Biggest Improvement: S${improvement.from} to S${improvement.to} (+${improvement.change} wins)</li>` : '',
  ].filter(Boolean).join('');
  appContainer.innerHTML = `
    <section class="page-card trajectory-page">
      <p class="page-eyebrow"><i class="fa-solid fa-chart-line" aria-hidden="true"></i> Careers</p>
      <h2 class="page-title">Careers</h2>
      <p class="page-copy">Explore how every manager's career has changed from season to season.</p>
      <h3 class="section-title mt-4">Select Manager</h3>
      ${managerPicker}
      <div class="trajectory-manager mt-4"><span class="team-logo" style="--team-color-1: ${escapeHtml(manager.team_color_1)}; --team-color-2: ${escapeHtml(manager.team_color_2)}"><i class="${escapeHtml(manager.team_logo)}" aria-hidden="true"></i></span><h3 class="section-title">${escapeHtml(shortenManagerName(manager.name))}</h3></div>
      <div id="trajectory-chart">${renderCareerTrajectoryChart(manager, seasons)}</div>
      <div class="trajectory-summary">${summaryStats.map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('')}</div>
      <div class="trajectory-highlights"><h3 class="section-title">Career Highlights</h3><ul>${highlightsList}</ul></div>
      <h3 class="section-title mt-4">Career Timeline</h3>
      <div class="table-shell mt-3"><table class="table data-table align-middle mb-0"><thead><tr><th>Season</th><th>Year</th><th>Regular Season</th><th>Record</th><th>Win %</th><th>Playoff Finish</th><th>GOAT Points</th><th>Cumulative GOAT</th></tr></thead><tbody>${seasons.map((season) => `<tr><td><a href="/seasons/${season.season_id}" data-route>S${season.season_number}</a></td><td>${season.year}</td><td>${formatOrdinal(season.regular_season_finish)}</td><td>${formatRecord(season.wins, season.losses, season.ties)}</td><td>${formatPercentage(season.winning_percentage)}</td><td>${playoffLabelWithIcon(season)}</td><td>${season.goat_points_earned >= 0 ? '+' : ''}${season.goat_points_earned}</td><td>${season.cumulative_goat_score}</td></tr>`).join('')}</tbody></table></div>
    </section>
  `;
  }
  document.querySelectorAll('[data-trajectory-manager]').forEach((button) => {
    button.addEventListener('click', async () => renderCareerTrajectories(managers, await fetchJson(`/api/career-trajectories/${button.dataset.trajectoryManager}`)));
  });
}

function renderTrophyCase(data) {
  const hallRequirementRows = [
    { icon: '<i class="fa-solid fa-calendar-check" aria-hidden="true"></i>', label: '10 Seasons', text: 'Finish at least 10 seasons in the league.' },
    { icon: '<i class="fa-solid fa-chart-line" aria-hidden="true"></i>', label: '100 Wins', text: 'Reach 100 career regular-season wins.' },
    { icon: '<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i>', label: 'Title', text: 'Win at least one league championship.' },
    { icon: '<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i>', label: 'Top 3', text: 'Record five top-three season finishes overall.' },
  ];
  const trophyCards = data.trophyCases.filter((entry) => entry.championships.length > 0 || entry.season_awards.some((award) => ['RUNNER_UP', 'THIRD_PLACE'].includes(award.award_type))).map((entry) => {
    const championshipList = entry.championships.length
      ? `<ul class="trophy-list">${entry.championships.map((award) => `<li><i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i> Season ${award.season_number} ${formatEstYear(award.year)}</li>`).join('')}</ul>`
      : '';
    const runnerUpAwards = entry.season_awards.filter((award) => award.award_type === 'RUNNER_UP');
    const thirdPlaceAwards = entry.season_awards.filter((award) => award.award_type === 'THIRD_PLACE');
    const totalTrophies = entry.championships.length + runnerUpAwards.length + thirdPlaceAwards.length;
    const championshipShelf = [
      '<span class="trophy-shelf__item trophy-shelf__item--championship"><i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i></span>'.repeat(entry.championships.length),
    ].join('');
    const podiumShelf = [
      '<span class="trophy-shelf__item trophy-shelf__item--finals"><i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i></span>'.repeat(runnerUpAwards.length),
      '<span class="trophy-shelf__item trophy-shelf__item--third"><i class="fa-solid fa-medal trophy-icon trophy-icon--bronze" aria-hidden="true"></i></span>'.repeat(thirdPlaceAwards.length),
    ].join('');
    const seasonAwards = entry.season_awards.filter((award) => !['CHAMPIONSHIP', 'BEST_REGULAR_SEASON', 'PLAYOFF_APPEARANCE'].includes(award.award_type)).map((award) => {
      const icon = {
        RUNNER_UP: '<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i>',
        THIRD_PLACE: '<i class="fa-solid fa-medal trophy-icon trophy-icon--bronze" aria-hidden="true"></i>',
        PLAYOFF_APPEARANCE: '<i class="fa-solid fa-bookmark" aria-hidden="true"></i>',
        BEST_REGULAR_SEASON: '📈',
        LAST_PLACE: '<i class="fa-solid fa-poo trophy-icon trophy-icon--poo" aria-hidden="true"></i>',
      }[award.award_type] || '';
      const displayName = award.award_type === 'RUNNER_UP' ? 'Finalist' : award.award_name;
      return `<li class="${award.award_type === 'LAST_PLACE' ? 'achievement-negative' : ''}">${icon} ${escapeHtml(displayName)} S${award.season_number} ${formatEstYear(award.year)}</li>`;
    }).join('');
    const awards = `${championshipList}${seasonAwards ? `<ul class="trophy-list">${seasonAwards}</ul>` : ''}`;
    const { statistics, hall_of_fame: hallOfFame } = entry.career;
    const requirements = hallOfFame.requirements;
    const progressBox = (label, requirement) => {
      const progress = Math.min(100, Math.max(0, (requirement.current / requirement.required) * 100));
      return `<div class="hall-progress-item"><span class="hall-progress-box ${requirement.complete ? 'hall-progress-box--complete' : ''}" style="--progress: ${progress}%" title="${label}" aria-label="${label}: ${requirement.current} / ${requirement.required}">${requirement.current} / ${requirement.required}</span><span class="hall-progress-label">${label}</span></div>`;
    };

    return `
      <article class="trophy-card">
        <div class="trophy-card__manager">
          <span class="team-logo" style="--team-color-1: ${escapeHtml(entry.team_color_1)}; --team-color-2: ${escapeHtml(entry.team_color_2)}" title="${escapeHtml(entry.team_logo)}">
            <i class="${escapeHtml(entry.team_logo)}" aria-hidden="true"></i>
          </span>
          <h3 class="section-title mb-2">${escapeHtml(entry.name)}${entry.active ? '<span class="manager-active-dot" title="Active manager" aria-label="Active manager"></span>' : ''}</h3>
        </div>
        <span class="trophy-card__total">${totalTrophies} ${totalTrophies === 1 ? 'Trophy' : 'Trophies'}</span>
        <p class="trophy-icons trophy-icons--championships">${championshipShelf || '<span class="trophy-shelf__empty">—</span>'}</p>
        <p class="trophy-icons trophy-icons--podium">${podiumShelf || '<span class="trophy-shelf__empty">—</span>'}</p>
        ${awards ? `<div class="trophy-card__block"><h4 class="trophy-card__heading">Awards</h4>${awards}</div>` : ''}
        <dl class="trophy-card__stats">
          <div class="trophy-card__stats-row">
            <div><dt>Year Joined</dt><dd>${entry.joined_year ? `<span class="est-year-pill est-year-pill--${entry.joined_year}">${entry.joined_year}</span>` : '—'}</dd></div>
            <div><dt><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Seasons Completed</dt><dd>${statistics.seasons}</dd></div>
          </div>
          <div class="trophy-card__stats-row">
            <div><dt><i class="fa-solid fa-chart-line" aria-hidden="true"></i> Career Record</dt><dd>${statistics.wins}–${statistics.losses}</dd></div>
            <div><dt><i class="fa-solid fa-chart-line" aria-hidden="true"></i> Win %</dt><dd>${formatPercentage(statistics.winning_percentage)}</dd></div>
          </div>
        </dl>
        <div class="trophy-card__block trophy-card__block--hall-of-fame">
          <h4 class="trophy-card__heading">Hall of Fame <button type="button" class="hall-info-button" data-trophy-hall-info-modal aria-label="Hall of Fame requirements"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></button></h4>
          <p class="hall-status ${hallOfFame.eligible ? 'hall-status--eligible' : ''}">${hallOfFame.eligible ? `<i class="fa-solid fa-gem hall-status__gem" aria-hidden="true"></i> CLASS OF ${hallOfFame.inducted_year}` : '<i class="fa-solid fa-lock" aria-hidden="true"></i> NOT ELIGIBLE'}</p>
          <div class="hall-progress-grid">
            ${progressBox('Seasons', requirements.seasons)}
            ${progressBox('Wins', requirements.wins)}
            ${progressBox('Titles', requirements.championships)}
            ${progressBox('Top 3', requirements.top3Finishes)}
          </div>
        </div>
      </article>
    `;
  }).join('');

  appContainer.innerHTML = `
    <section class="page-card">
      <p class="page-eyebrow">Trophy Case</p>
      <h2 class="page-title">Trophy Case</h2>
      <div class="trophy-grid mt-4">${trophyCards}</div>
    </section>
    <div class="hall-info-modal" id="trophy-hall-info-modal" hidden>
      <div class="hall-info-modal__backdrop" data-close-trophy-hall-info></div>
      <div class="hall-info-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="trophy-hall-info-title">
        <div class="hall-info-modal__header">
          <h3 id="trophy-hall-info-title">Hall of Fame Requirements</h3>
          <button type="button" class="hall-info-modal__close" data-close-trophy-hall-info aria-label="Close Hall of Fame info">×</button>
        </div>
        <div class="hall-info-modal__body">
          <p class="hall-info-modal__copy">A manager becomes eligible when they check any of the Hall of Fame milestones below across their career.</p>
          <table class="hall-info-modal__table">
            <thead><tr><th>Icon</th><th>Requirement</th><th>What it means</th></tr></thead>
            <tbody>${hallRequirementRows.map((row) => `<tr><td>${row.icon}</td><td>${row.label}</td><td>${row.text}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const hallInfoModal = document.getElementById('trophy-hall-info-modal');
  document.querySelectorAll('[data-trophy-hall-info-modal]').forEach((button) => {
    button.addEventListener('click', () => {
      hallInfoModal.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });
  document.querySelectorAll('[data-close-trophy-hall-info]').forEach((button) => {
    button.addEventListener('click', () => {
      hallInfoModal.hidden = true;
      document.body.style.overflow = '';
    });
  });
}

function renderHallOfFame(data) {
  const getCompletedCount = (entry) => Object.values(entry.career.hall_of_fame.requirements).filter((requirement) => requirement.complete).length;
  const getProgressScore = (entry) => {
    const requirements = entry.career.hall_of_fame.requirements;
    return Object.values(requirements).reduce((total, requirement) => total + Math.min(1, requirement.current / requirement.required), 0);
  };
  const sortManagers = (left, right) => getCompletedCount(right) - getCompletedCount(left)
    || getProgressScore(right) - getProgressScore(left)
    || right.career.statistics.wins - left.career.statistics.wins
    || left.name.localeCompare(right.name);
  const renderRow = (member, includeStatus) => {
    const requirements = member.career.hall_of_fame.requirements;
    const completedCategories = Object.values(requirements).filter((requirement) => requirement.complete).length;
    const progressCell = (label, requirement) => {
      const progress = Math.min(100, Math.max(0, (requirement.current / requirement.required) * 100));
      return `<span class="hall-table__progress" style="--progress: ${progress}%" title="${label}">${requirement.current} / ${requirement.required}</span>`;
    };
    return `
    <tr>
      ${includeStatus ? `<td><span class="hall-table__status hall-table__status--in">CLASS OF ${member.career.hall_of_fame.inducted_year}</span></td>` : ''}
      <td><span class="hall-table__manager"><span class="team-logo" style="--team-color-1: ${escapeHtml(member.team_color_1)}; --team-color-2: ${escapeHtml(member.team_color_2)}" title="${escapeHtml(member.team_logo)}"><i class="${escapeHtml(member.team_logo)}" aria-hidden="true"></i></span><strong>${escapeHtml(member.name)}${member.active ? '<span class="manager-active-dot" title="Active manager" aria-label="Active manager"></span>' : ''}</strong></span></td>
      <td>${progressCell('Seasons', requirements.seasons)}</td>
      <td>${progressCell('Wins', requirements.wins)}</td>
      <td>${progressCell('Titles', requirements.championships)}</td>
      <td>${progressCell('Top 3', requirements.top3Finishes)}</td>
      ${includeStatus ? `<td><span class="hall-table__crowns" aria-label="${completedCategories} completed requirements">${'<i class="fa-solid fa-gem" aria-hidden="true"></i>'.repeat(completedCategories)}</span></td>` : ''}
    </tr>
  `;
  };
  const hallMembers = data.trophyCases.filter((entry) => entry.career.hall_of_fame.eligible).sort(sortManagers);
  const remainingManagers = data.trophyCases.filter((entry) => !entry.career.hall_of_fame.eligible).sort(sortManagers);
  const renderTable = (managers, includeStatus) => `
    <div class="table-shell mt-3">
      <table class="table data-table hall-table align-middle mb-0">
        <thead><tr>${includeStatus ? '<th>Status</th>' : ''}<th>Manager</th><th>Seasons</th><th>Wins</th><th>Titles</th><th>Top 3</th>${includeStatus ? '<th>Crowns</th>' : ''}</tr></thead>
        <tbody>${managers.map((manager) => renderRow(manager, includeStatus)).join('')}</tbody>
      </table>
    </div>
  `;

  const hallRequirementRows = [
    { icon: '<i class="fa-solid fa-calendar-check" aria-hidden="true"></i>', label: '10 Seasons', text: 'Finish at least 10 seasons in the league.' },
    { icon: '<i class="fa-solid fa-chart-line" aria-hidden="true"></i>', label: '100 Wins', text: 'Reach 100 career regular-season wins.' },
    { icon: '<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i>', label: 'Title', text: 'Win at least one league championship.' },
    { icon: '<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i>', label: 'Top 3', text: 'Record five top-three season finishes overall.' },
  ];

  appContainer.innerHTML = `
    <section class="page-card hall-page">
      <p class="page-eyebrow"><i class="fa-solid fa-gem" aria-hidden="true"></i> Hall of Fame <button type="button" class="hall-info-button" data-hall-info-modal aria-label="Hall of Fame requirements"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></button></p>
      ${renderTable(hallMembers, true)}
      <h3 class="section-title mt-4">Not Yet Eligible</h3>
      ${renderTable(remainingManagers, false)}
    </section>

    <div class="hall-info-modal" id="hall-info-modal" hidden>
      <div class="hall-info-modal__backdrop" data-close-hall-info></div>
      <div class="hall-info-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="hall-info-title">
        <div class="hall-info-modal__header">
          <h3 id="hall-info-title">Hall of Fame Requirements</h3>
          <button type="button" class="hall-info-modal__close" data-close-hall-info aria-label="Close Hall of Fame info">×</button>
        </div>
        <div class="hall-info-modal__body">
          <p class="hall-info-modal__copy">A manager becomes eligible when they check any of the Hall of Fame milestones below across their career.</p>
          <table class="hall-info-modal__table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Requirement</th>
                <th>What it means</th>
              </tr>
            </thead>
            <tbody>
              ${hallRequirementRows.map((row) => `
                <tr>
                  <td>${row.icon}</td>
                  <td>${row.label}</td>
                  <td>${row.text}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const hallInfoButton = document.querySelector('[data-hall-info-modal]');
  const hallInfoModal = document.getElementById('hall-info-modal');
  const hallInfoClosers = document.querySelectorAll('[data-close-hall-info]');

  if (hallInfoButton && hallInfoModal) {
    hallInfoButton.addEventListener('click', () => {
      hallInfoModal.hidden = false;
      document.body.style.overflow = 'hidden';
    });

    hallInfoClosers.forEach((closer) => {
      closer.addEventListener('click', () => {
        hallInfoModal.hidden = true;
        document.body.style.overflow = '';
      });
    });

    hallInfoModal.addEventListener('click', (event) => {
      if (event.target === hallInfoModal) {
        hallInfoModal.hidden = true;
        document.body.style.overflow = '';
      }
    });
  }
}

function renderRecordBook(data) {
  const recordCategoryIcon = (category) => {
    const icons = {
      championships: '<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i>',
      wins: '<i class="fa-solid fa-chart-line" aria-hidden="true"></i>',
      winning_percentage: '<i class="fa-solid fa-chart-line" aria-hidden="true"></i>',
      playoffs: '<i class="fa-solid fa-bookmark" aria-hidden="true"></i>',
      finals: '<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i>',
      runner_ups: '<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i>',
      third_places: '<i class="fa-solid fa-medal trophy-icon trophy-icon--bronze" aria-hidden="true"></i>',
      best_regular_seasons: '<i class="fa-solid fa-chart-line" aria-hidden="true"></i>',
      last_places: '<i class="fa-solid fa-poo trophy-icon trophy-icon--poo" aria-hidden="true"></i>',
      seasons_played: '<i class="fa-solid fa-calendar-check" aria-hidden="true"></i>',
      most_wins: '<i class="fa-solid fa-chart-line" aria-hidden="true"></i>',
      best_winning_percentage: '<i class="fa-solid fa-chart-line" aria-hidden="true"></i>',
      biggest_improvement: '<i class="fa-solid fa-arrow-trend-up" aria-hidden="true"></i>',
      biggest_collapse: '<i class="fa-solid fa-arrow-trend-down" aria-hidden="true"></i>',
    };
    return icons[category.key] || '';
  };
  const renderSeasonRankingTable = (title, records, isWorst = false) => `
    <article class="record-card record-card--ranking">
      <h3 class="section-title">${title}</h3>
      <div class="table-shell">
        <table class="table data-table record-ranking-table align-middle mb-0">
          <thead><tr><th>#</th><th>Manager</th><th>Season</th><th>Record</th><th>Outcome</th></tr></thead>
          <tbody>${records.map((record, index) => `<tr><td>${index + 1}</td><td><strong>${escapeHtml(record.manager_name)}</strong></td><td>S${record.season_number} (${record.year})</td><td>${record.wins}-${record.losses}</td><td>${escapeHtml(isWorst ? (record.is_last_place ? 'Last Place' : `${formatOrdinal(record.regular_season_rank)} Place`) : record.outcome)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </article>
  `;
  const renderCategory = (category) => `
    <article class="record-card record-card--category">
      <h3 class="section-title">${recordCategoryIcon(category)} ${escapeHtml(category.label)}</h3>
      <ol class="record-ranking-list">
        ${category.records.map((record) => `<li><span class="record-ranking__manager">${record.team_logo ? `<span class="team-logo" style="--team-color-1: ${escapeHtml(record.team_color_1)}; --team-color-2: ${escapeHtml(record.team_color_2)}" title="${escapeHtml(record.manager_name)}"><i class="${escapeHtml(record.team_logo)}" aria-hidden="true"></i></span>` : ''}<span><strong>${escapeHtml(record.manager_name)}</strong><small>${escapeHtml(record.detail || '')}</small></span></span><strong class="${category.key === 'championships' ? 'record-ranking__value--plain' : ''}">${escapeHtml(String(record.value))}</strong></li>`).join('')}
      </ol>
    </article>
  `;
  const renderCategoryPanel = (key, categories) => `<div class="record-tab-panel ${key === 'singleSeason' ? 'record-tab-panel--active' : ''}" data-record-panel="${key}">${key === 'singleSeason' ? `<div class="record-grid record-grid--rankings">${renderSeasonRankingTable('Top 20 Best Seasons', data.topBestSeasons)}${renderSeasonRankingTable('Top 20 Worst Seasons', data.topWorstSeasons, true)}</div>` : ''}<div class="record-grid record-grid--categories">${categories.map(renderCategory).join('')}</div></div>`;

  appContainer.innerHTML = `
    <section class="page-card">
      <p class="page-eyebrow">Record Book</p>
      <div class="record-tabs mt-4" role="tablist" aria-label="Record Book views">
        <button class="record-tab record-tab--active" type="button" data-record-tab="singleSeason">Single Season</button>
        <button class="record-tab" type="button" data-record-tab="playoffs">Playoffs</button>
      </div>
      ${renderCategoryPanel('singleSeason', data.recordBookCategories.singleSeason)}
      ${renderCategoryPanel('playoffs', data.recordBookCategories.playoffs)}
    </section>
  `;
  document.querySelectorAll('[data-record-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-record-tab]').forEach((tab) => tab.classList.toggle('record-tab--active', tab === button));
      document.querySelectorAll('[data-record-panel]').forEach((panel) => panel.classList.toggle('record-tab-panel--active', panel.getAttribute('data-record-panel') === button.getAttribute('data-record-tab')));
    });
  });
}

function renderGoat(data) {
  const rows = data.rankings.map((entry) => {
    const breakdown = entry.breakdown;
    return `
      <tr>
        <td><strong>${entry.rank}</strong></td>
        <td><span class="hall-table__manager"><span class="team-logo" style="--team-color-1: ${escapeHtml(entry.team_color_1)}; --team-color-2: ${escapeHtml(entry.team_color_2)}"><i class="${escapeHtml(entry.team_logo)}" aria-hidden="true"></i></span><strong>${escapeHtml(entry.name)}</strong></span></td>
        <td><strong class="goat-score">${entry.goatScore}</strong></td>
        <td>${entry.points.championships}</td><td>${entry.points.runner_ups}</td><td>${entry.points.third_places}</td>
        <td>${entry.points.best_regular_seasons}</td><td>${entry.points.playoff_appearances}</td><td>${entry.points.regular_season_wins}</td><td>${entry.points.seasons_played}</td>
      </tr>
    `;
  }).join('');
  const top2 = data.rankings.slice(0, 2).map((entry, index) => `
    <article class="goat-podium-card goat-podium-card--${entry.rank}">
      <span class="goat-podium-rank">${['<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i>', '<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i>'][index]} #${entry.rank}</span>
      <h3 class="section-title">${escapeHtml(entry.name)}</h3>
      <strong class="goat-podium-score">${entry.goatScore.toLocaleString()}</strong>
      <span>GOAT Score</span>
    </article>
  `).join('');
  const sub3 = data.rankings.slice(2, 5).map((entry, index) => `
    <article class="goat-podium-card goat-podium-card--${entry.rank}">
      <span class="goat-podium-rank">${['<i class="fa-solid fa-medal trophy-icon trophy-icon--bronze" aria-hidden="true"></i>', '<i class="fa-solid fa-star text-warning" aria-hidden="true"></i>', '<i class="fa-solid fa-star text-warning" aria-hidden="true"></i>'][index]} #${entry.rank}</span>
      <h3 class="section-title">${escapeHtml(entry.name)}</h3>
      <strong class="goat-podium-score">${entry.goatScore.toLocaleString()}</strong>
      <span>GOAT Score</span>
    </article>
  `).join('');
  const weightRows = [
    ['<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i>', 'Championship', data.weights.championships], ['<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i>', 'Finals / Runner-Up', data.weights.runner_ups], ['<i class="fa-solid fa-medal trophy-icon trophy-icon--bronze" aria-hidden="true"></i>', '3rd', data.weights.third_places],
    ['<i class="fa-solid fa-crown" aria-hidden="true"></i>', 'Best Regular Season', data.weights.best_regular_seasons], ['<i class="fa-solid fa-bookmark" aria-hidden="true"></i>', 'Playoffs', data.weights.playoff_appearances], ['<i class="fa-solid fa-award" aria-hidden="true"></i>', 'Week Win', data.weights.regular_season_wins], ['<i class="fa-solid fa-basketball" aria-hidden="true"></i>', 'Season Played', data.weights.seasons_played], ['<i class="fa-solid fa-poo" aria-hidden="true"></i>', 'Last Place', data.weights.last_places],
  ].map(([icon, label, points]) => `<tr><td>${icon}</td><td>${label}</td><td>${points > 0 ? '+' : ''}${points}</td></tr>`).join('');
  const legendItems = [
    ['<i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i>', 'Titles', data.weights.championships], ['<i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i>', 'Finals', data.weights.runner_ups], ['<i class="fa-solid fa-medal trophy-icon trophy-icon--bronze" aria-hidden="true"></i>', '3rd', data.weights.third_places],
    ['<i class="fa-solid fa-crown" aria-hidden="true"></i>', 'Best Regular Season', data.weights.best_regular_seasons], ['<i class="fa-solid fa-bookmark" aria-hidden="true"></i>', 'Playoffs', data.weights.playoff_appearances], ['<i class="fa-solid fa-award" aria-hidden="true"></i>', 'Week Win', data.weights.regular_season_wins], ['<i class="fa-solid fa-basketball" aria-hidden="true"></i>', 'Season', data.weights.seasons_played], ['<i class="fa-solid fa-poo" aria-hidden="true"></i>', 'Last Place', data.weights.last_places],
  ].map(([icon, label, points]) => `<span class="goat-legend__item"><span>${icon}</span><strong>${points > 0 ? '+' : ''}${points}</strong><small>${label}</small></span>`).join('');

  appContainer.innerHTML = `
    <section class="page-card goat-page">
      <p class="page-eyebrow">All-Time</p>
      <h2 class="page-title">🐐 BS Basketball GOAT Rankings</h2>
      <p class="page-copy">The greatest managers in BS Basketball history, ranked by the official GOAT Score.</p>
      <p class="page-copy">The GOAT Score measures championships, playoff success, regular-season dominance and longevity.</p>
      <div class="goat-legend" aria-label="GOAT scoring formula">${legendItems}</div>
      <div class="goat-podium-grid mt-4">
        <div class="goat-podium-row goat-podium-row--top">${top2}</div>
        <div class="goat-podium-row goat-podium-row--sub">${sub3}</div>
      </div>
      <div class="table-shell mt-4">
        <table class="table data-table goat-table align-middle mb-0">
          <thead><tr><th>Rank</th><th>Manager</th><th>GOAT Score</th><th><i class="fa-solid fa-trophy trophy-icon trophy-icon--gold" aria-hidden="true"></i></th><th><i class="fa-solid fa-medal trophy-icon trophy-icon--silver" aria-hidden="true"></i></th><th><i class="fa-solid fa-medal trophy-icon trophy-icon--bronze" aria-hidden="true"></i></th><th><i class="fa-solid fa-crown" aria-hidden="true"></i></th><th>Playoff Pts</th><th>Win PTS</th><th>Seasons PTS</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="goat-formula mt-4">
        <h3 class="section-title">How the GOAT Score Works</h3>
        <table class="table data-table goat-formula-table align-middle mb-0"><tbody>${weightRows}</tbody></table>
        <p class="page-copy mt-3 mb-0"><strong>GOAT Score</strong> = Championships × 100 + Runner-Ups × 45 + 3rd × 30 + Best Regular Seasons × 35 + Playoffs × 15 + Week Wins × 5 + Seasons Played × 10 − Last Places × 25</p>
      </div>
    </section>
  `;
}

async function renderRoute() {
  setActiveNavigation();
  renderLoading();

  try {
    const path = window.location.pathname;

    if (path === '/' || path === '/leaders') {
      const leaders = await fetchJson('/api/leaders');
      renderLeaders(leaders);
      return;
    }

    if (path === '/seasons') {
      const seasons = await fetchJson('/api/seasons');
      renderSeasonsList(seasons);
      return;
    }

    if (/^\/seasons\/\d+$/.test(path)) {
      const seasonId = path.split('/')[2];
      const detail = await fetchJson(`/api/seasons/${seasonId}`);
      renderSeasonDetail(detail);
      return;
    }

    if (path === '/trophy-case') {
      const trophyCase = await fetchJson('/api/trophy-case');
      renderTrophyCase(trophyCase);
      return;
    }

    if (path === '/hall-of-fame') {
      const trophyCase = await fetchJson('/api/trophy-case');
      renderHallOfFame(trophyCase);
      return;
    }

    if (path === '/record-book') {
      const recordBook = await fetchJson('/api/record-book');
      renderRecordBook(recordBook);
      return;
    }

    if (path === '/goat') {
      const goat = await fetchJson('/api/goat');
      renderGoat(goat);
      return;
    }

    if (path === '/career-trajectories') {
      const managers = await fetchJson('/api/managers');
      renderCareerTrajectories(managers.sort((left, right) => left.name.localeCompare(right.name)));
      return;
    }

    renderError('The page you requested does not exist yet.');
  } catch (error) {
    renderError(error.message || 'Unknown error');
  }
}

document.addEventListener('click', (event) => {
  const routeLink = event.target.closest('[data-route]');
  if (!routeLink) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(routeLink.getAttribute('href'));
});

window.addEventListener('popstate', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);

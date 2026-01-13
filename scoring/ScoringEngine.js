/**
 * DraftFC Advanced Scoring Engine
 * 
 * The 5 Pillars of Victory:
 * 1. Power Score (30%) - Raw football quality
 * 2. Tactical Score (20%) - Position matching and formation
 * 3. Chemistry Score (20%) - Team links and synergy
 * 4. Balance Score (15%) - Squad structure
 * 5. Manager IQ Score (15%) - Budget efficiency and smart drafting
 */

// Score Weights
const SCORE_WEIGHTS = {
  power: 0.30,
  tactical: 0.20,
  chemistry: 0.20,
  balance: 0.15,
  managerIQ: 0.15
};

// Position Groups
const POSITION_GROUPS = {
  GK: ['GK'],
  DEF: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  MID: ['CDM', 'CM', 'CAM', 'LM', 'RM'],
  FWD: ['LW', 'RW', 'ST', 'CF', 'LF', 'RF']
};

// Position Compatibility (for tactical scoring)
const POSITION_COMPATIBILITY = {
  GK: { natural: ['GK'], secondary: [], penalty: -20 },
  CB: { natural: ['CB'], secondary: ['CDM', 'RB', 'LB'], penalty: -8 },
  LB: { natural: ['LB'], secondary: ['LWB', 'LM', 'CB'], penalty: -6 },
  RB: { natural: ['RB'], secondary: ['RWB', 'RM', 'CB'], penalty: -6 },
  CDM: { natural: ['CDM'], secondary: ['CM', 'CB'], penalty: -5 },
  CM: { natural: ['CM'], secondary: ['CDM', 'CAM', 'LM', 'RM'], penalty: -4 },
  CAM: { natural: ['CAM'], secondary: ['CM', 'LW', 'RW', 'ST'], penalty: -4 },
  LM: { natural: ['LM'], secondary: ['LW', 'LB', 'CM'], penalty: -4 },
  RM: { natural: ['RM'], secondary: ['RW', 'RB', 'CM'], penalty: -4 },
  LW: { natural: ['LW'], secondary: ['LM', 'ST', 'CAM'], penalty: -5 },
  RW: { natural: ['RW'], secondary: ['RM', 'ST', 'CAM'], penalty: -5 },
  ST: { natural: ['ST', 'CF'], secondary: ['CAM', 'LW', 'RW'], penalty: -6 }
};

// Available Formations
const FORMATIONS = [
  { name: '4-3-3', displayName: '4-3-3', structure: '4-3-3', positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW'] },
  { name: '4-4-2', displayName: '4-4-2', structure: '4-4-2', positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'] },
  { name: '4-2-3-1', displayName: '4-2-3-1', structure: '4-2-3-1', positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'LM', 'CAM', 'RM', 'ST'] },
  { name: '3-5-2', displayName: '3-5-2', structure: '3-5-2', positions: ['GK', 'CB', 'CB', 'CB', 'LM', 'CDM', 'CM', 'CM', 'RM', 'ST', 'ST'] },
  { name: '4-1-4-1', displayName: '4-1-4-1', structure: '4-1-4-1', positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'LM', 'CM', 'CM', 'RM', 'ST'] },
  { name: '5-3-2', displayName: '5-3-2', structure: '5-3-2', positions: ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'ST', 'ST'] },
  { name: '4-3-2-1', displayName: '4-3-2-1', structure: '4-3-2-1', positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'RW', 'ST'] },
];

// All known positions for parsing
const ALL_POSITIONS = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF', 'LF', 'RF'];

/**
 * Parse alternate positions from various formats
 * Handles: ["CDMCAM"], ["CDM", "CAM"], "CDMCAM", etc.
 */
function parseAltPositions(altPositions) {
  if (!altPositions || !Array.isArray(altPositions)) return [];
  
  const parsed = [];
  
  altPositions.forEach(pos => {
    if (typeof pos !== 'string') return;
    
    // If it's already a valid single position
    if (ALL_POSITIONS.includes(pos)) {
      parsed.push(pos);
      return;
    }
    
    // Parse combined string like "CDMCAM" or "LMCAM"
    let remaining = pos.toUpperCase();
    
    // Sort positions by length (longer first) to match correctly
    const sortedPositions = [...ALL_POSITIONS].sort((a, b) => b.length - a.length);
    
    while (remaining.length > 0) {
      let found = false;
      for (const position of sortedPositions) {
        if (remaining.startsWith(position)) {
          parsed.push(position);
          remaining = remaining.slice(position.length);
          found = true;
          break;
        }
      }
      if (!found) {
        // Skip unknown character
        remaining = remaining.slice(1);
      }
    }
  });
  
  // Remove duplicates
  return [...new Set(parsed)];
}

/**
 * Get all positions a player can play (main + alternates)
 */
function getAllPlayerPositions(player) {
  const positions = [player.position];
  const altPos = parseAltPositions(player.altPositions);
  return [...new Set([...positions, ...altPos])];
}

/**
 * Get position group for a position
 */
function getPositionGroup(position) {
  for (const [group, positions] of Object.entries(POSITION_GROUPS)) {
    if (positions.includes(position)) return group;
  }
  return 'MID'; // Default fallback
}

/**
 * ============================================
 * SQUAD VALIDATION
 * ============================================
 */
function validateSquad(players) {
  const validation = {
    isValid: false,
    hasElevenPlayers: false,
    hasGoalkeeper: false,
    hasMinDefenders: false,
    hasMinMidfielders: false,
    hasMinForwards: false,
    errors: [],
    positionCounts: { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  };

  // Count positions
  players.forEach(player => {
    const group = getPositionGroup(player.position);
    validation.positionCounts[group]++;
  });

  // Check 11 players
  validation.hasElevenPlayers = players.length === 11;
  if (!validation.hasElevenPlayers) {
    validation.errors.push(`Squad has ${players.length} players, needs exactly 11`);
  }

  // Check goalkeeper
  validation.hasGoalkeeper = validation.positionCounts.GK >= 1;
  if (!validation.hasGoalkeeper) {
    validation.errors.push('Squad needs at least 1 Goalkeeper');
  }

  // Check defenders (minimum 3)
  validation.hasMinDefenders = validation.positionCounts.DEF >= 3;
  if (!validation.hasMinDefenders) {
    validation.errors.push(`Squad has ${validation.positionCounts.DEF} defenders, needs at least 3`);
  }

  // Check midfielders (minimum 2)
  validation.hasMinMidfielders = validation.positionCounts.MID >= 2;
  if (!validation.hasMinMidfielders) {
    validation.errors.push(`Squad has ${validation.positionCounts.MID} midfielders, needs at least 2`);
  }

  // Check forwards (minimum 1)
  validation.hasMinForwards = validation.positionCounts.FWD >= 1;
  if (!validation.hasMinForwards) {
    validation.errors.push(`Squad has ${validation.positionCounts.FWD} forwards, needs at least 1`);
  }

  // Final validation
  validation.isValid = validation.hasElevenPlayers && 
                       validation.hasGoalkeeper && 
                       validation.hasMinDefenders && 
                       validation.hasMinMidfielders && 
                       validation.hasMinForwards;

  return validation;
}

/**
 * ============================================
 * POWER SCORE (30%)
 * ============================================
 * Raw football quality based on ratings and key stats
 */
function calculatePowerScore(players) {
  if (players.length === 0) {
    return { total: 0, avgOverall: 0, keyStatsAvg: 0, superstarBonus: 0, legendaryBonus: 0, details: {} };
  }

  // Average overall rating
  const avgOverall = players.reduce((sum, p) => sum + p.rating, 0) / players.length;

  // Calculate key stats by position
  let keyStatsSum = 0;
  let attackPower = 0, midfieldControl = 0, defensiveSolidity = 0, goalkeepingQuality = 0;
  let attackCount = 0, midCount = 0, defCount = 0, gkCount = 0;

  players.forEach(player => {
    const stats = player.overallStats || {};
    const group = getPositionGroup(player.position);

    if (group === 'FWD') {
      // Attackers: pace, shooting, dribbling
      const keyStats = (stats.paceOverall || 0) * 0.3 + 
                       (stats.shootingOverall || 0) * 0.5 + 
                       (stats.dribblingOverall || 0) * 0.2;
      keyStatsSum += keyStats;
      attackPower += keyStats;
      attackCount++;
    } else if (group === 'MID') {
      // Midfielders: passing, dribbling, physical
      const keyStats = (stats.passingOverall || 0) * 0.4 + 
                       (stats.dribblingOverall || 0) * 0.3 + 
                       (stats.physicalOverall || 0) * 0.3;
      keyStatsSum += keyStats;
      midfieldControl += keyStats;
      midCount++;
    } else if (group === 'DEF') {
      // Defenders: defending, physical, pace
      const keyStats = (stats.defendingOverall || 0) * 0.5 + 
                       (stats.physicalOverall || 0) * 0.3 + 
                       (stats.paceOverall || 0) * 0.2;
      keyStatsSum += keyStats;
      defensiveSolidity += keyStats;
      defCount++;
    } else if (group === 'GK') {
      // GK: use overall rating as proxy
      keyStatsSum += player.rating;
      goalkeepingQuality += player.rating;
      gkCount++;
    }
  });

  const keyStatsAvg = keyStatsSum / players.length;

  // Superstar bonus (players 90+)
  const superstars = players.filter(p => p.rating >= 90);
  const superstarBonus = superstars.length * 3; // +3 per 90+ player

  // Legendary bonus
  const legendaries = players.filter(p => p.rarity === 'legendary');
  const legendaryBonus = legendaries.length * 2; // +2 per legendary

  // Calculate total power score (0-100)
  const basePower = avgOverall * 0.6 + keyStatsAvg * 0.3;
  const bonuses = superstarBonus + legendaryBonus;
  const total = Math.min(100, basePower * 1.1 + bonuses);

  return {
    total: Math.round(total * 10) / 10,
    avgOverall: Math.round(avgOverall * 10) / 10,
    keyStatsAvg: Math.round(keyStatsAvg * 10) / 10,
    superstarBonus,
    legendaryBonus,
    details: {
      attackPower: attackCount > 0 ? Math.round(attackPower / attackCount) : 0,
      midfieldControl: midCount > 0 ? Math.round(midfieldControl / midCount) : 0,
      defensiveSolidity: defCount > 0 ? Math.round(defensiveSolidity / defCount) : 0,
      goalkeepingQuality: gkCount > 0 ? Math.round(goalkeepingQuality / gkCount) : 0
    }
  };
}

/**
 * ============================================
 * TACTICAL SCORE (20%)
 * ============================================
 * How well players match their positions and formation
 * Now properly uses altPositions for better tactical flexibility
 */
function calculateTacticalScore(players, formation) {
  if (players.length === 0) {
    return { total: 0, naturalPositions: 0, secondaryPositions: 0, outOfPosition: 0, formationFit: 0, roleBalance: 0, details: { positionMatches: [], penalties: [], playerPositions: [] } };
  }

  let naturalPositions = 0;
  let secondaryPositions = 0;
  let outOfPosition = 0;
  const positionMatches = [];
  const penalties = [];
  const playerPositions = []; // Track all player position capabilities

  // Check each player against formation positions
  const formationPositions = [...formation.positions];
  const assignedPlayers = [];

  // Build player position info for UI
  players.forEach(player => {
    const parsedAltPos = parseAltPositions(player.altPositions);
    const allPositions = getAllPlayerPositions(player);
    playerPositions.push({
      playerId: player._id,
      playerName: player.name,
      mainPosition: player.position,
      altPositions: parsedAltPos,
      allPositions: allPositions
    });
  });

  // First pass: assign natural positions (main position matches formation slot)
  players.forEach(player => {
    const playerPos = player.position;

    // Check if player can fill any formation slot with their main position
    const naturalIdx = formationPositions.findIndex(fp => fp === playerPos);
    if (naturalIdx !== -1) {
      naturalPositions++;
      positionMatches.push({ 
        player: player.name, 
        position: playerPos, 
        assignedPosition: playerPos,
        type: 'natural',
        bonus: 10 
      });
      formationPositions.splice(naturalIdx, 1);
      assignedPlayers.push(player._id);
    }
  });

  // Second pass: assign using alternate positions
  players.forEach(player => {
    if (assignedPlayers.includes(player._id)) return;

    const parsedAltPos = parseAltPositions(player.altPositions);
    
    // Check if any of the player's alt positions match remaining formation slots
    for (const altPos of parsedAltPos) {
      const altIdx = formationPositions.findIndex(fp => fp === altPos);
      if (altIdx !== -1) {
        secondaryPositions++;
        positionMatches.push({ 
          player: player.name, 
          position: player.position,
          assignedPosition: altPos,
          type: 'alternate',
          bonus: 8 // Higher bonus for actual alternate positions
        });
        formationPositions.splice(altIdx, 1);
        assignedPlayers.push(player._id);
        return;
      }
    }
  });

  // Third pass: assign using position compatibility (nearby positions)
  players.forEach(player => {
    if (assignedPlayers.includes(player._id)) return;

    const playerPos = player.position;
    const compat = POSITION_COMPATIBILITY[playerPos] || { natural: [], secondary: [], penalty: -5 };

    // Check compatible positions
    const compatIdx = formationPositions.findIndex(fp => compat.secondary.includes(fp));

    if (compatIdx !== -1) {
      secondaryPositions++;
      positionMatches.push({ 
        player: player.name, 
        position: playerPos,
        assignedPosition: formationPositions[compatIdx],
        type: 'compatible',
        bonus: 5 
      });
      formationPositions.splice(compatIdx, 1);
      assignedPlayers.push(player._id);
    }
  });

  // Fourth pass: remaining players are out of position
  players.forEach(player => {
    if (!assignedPlayers.includes(player._id)) {
      outOfPosition++;
      const compat = POSITION_COMPATIBILITY[player.position] || { penalty: -5 };
      penalties.push({ 
        player: player.name, 
        mainPosition: player.position,
        issue: 'Out of position - no suitable slot', 
        penalty: compat.penalty 
      });
    }
  });

  // Calculate formation fit (0-100)
  const formationFit = Math.max(0, 100 - (outOfPosition * 15));

  // Role balance: check critical roles
  let roleBalance = 100;
  const positionCounts = {};
  players.forEach(p => {
    positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
  });

  // Penalties for role imbalances
  if (!positionCounts['GK']) {
    roleBalance -= 30;
    penalties.push({ player: 'Team', issue: 'No Goalkeeper', penalty: -30 });
  }
  if (!positionCounts['ST'] && !positionCounts['CF']) {
    roleBalance -= 15;
    penalties.push({ player: 'Team', issue: 'No natural striker', penalty: -15 });
  }
  if (!positionCounts['CB'] || positionCounts['CB'] < 2) {
    roleBalance -= 10;
    penalties.push({ player: 'Team', issue: 'Insufficient center-backs', penalty: -10 });
  }

  // Calculate total
  const positionScore = naturalPositions * 10 + secondaryPositions * 6;
  const penaltySum = penalties.reduce((sum, p) => sum + p.penalty, 0);
  const total = Math.max(0, Math.min(100, (positionScore / players.length) * 10 + formationFit * 0.3 + roleBalance * 0.2 + penaltySum));

  return {
    total: Math.round(Math.max(0, total) * 10) / 10,
    naturalPositions,
    secondaryPositions,
    outOfPosition,
    formationFit: Math.round(formationFit),
    roleBalance: Math.round(roleBalance),
    details: { positionMatches, penalties }
  };
}

/**
 * ============================================
 * CHEMISTRY SCORE (20%)
 * ============================================
 * Team links and synergy between players
 */
function calculateChemistryScore(players) {
  if (players.length < 2) {
    return { total: 0, clubLinks: 0, leagueLinks: 0, nationLinks: 0, playstyleBonus: 0, lineLinks: 0, details: { links: [], strongLinks: 0, weakLinks: 0 } };
  }

  const links = [];
  let clubLinks = 0;
  let leagueLinks = 0;
  let nationLinks = 0;
  let strongLinks = 0;
  let weakLinks = 0;

  // Compare all player pairs
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const p1 = players[i];
      const p2 = players[j];

      let linkBonus = 0;
      const linkTypes = [];

      // Club link (+4)
      if (p1.club && p2.club && p1.club === p2.club) {
        clubLinks++;
        linkBonus += 4;
        linkTypes.push('club');
      }

      // League link (+2)
      if (p1.league && p2.league && p1.league === p2.league) {
        leagueLinks++;
        linkBonus += 2;
        linkTypes.push('league');
      }

      // Nation link (+2)
      if (p1.nation && p2.nation && p1.nation === p2.nation) {
        nationLinks++;
        linkBonus += 2;
        linkTypes.push('nation');
      }

      if (linkBonus > 0) {
        links.push({
          player1: p1.name,
          player2: p2.name,
          type: linkTypes.join('+'),
          bonus: linkBonus
        });

        if (linkBonus >= 6) strongLinks++;
        else weakLinks++;
      }
    }
  }

  // Line links (DEF-MID, MID-ATK connections)
  let lineLinks = 0;
  const defenders = players.filter(p => getPositionGroup(p.position) === 'DEF');
  const midfielders = players.filter(p => getPositionGroup(p.position) === 'MID');
  const forwards = players.filter(p => getPositionGroup(p.position) === 'FWD');

  // Check DEF-MID links
  defenders.forEach(def => {
    midfielders.forEach(mid => {
      if ((def.club && mid.club && def.club === mid.club) ||
          (def.nation && mid.nation && def.nation === mid.nation)) {
        lineLinks++;
      }
    });
  });

  // Check MID-FWD links
  midfielders.forEach(mid => {
    forwards.forEach(fwd => {
      if ((mid.club && fwd.club && mid.club === fwd.club) ||
          (mid.nation && fwd.nation && mid.nation === fwd.nation)) {
        lineLinks++;
      }
    });
  });

  // Playstyle bonus based on rarity mix
  const rarities = players.map(p => p.rarity);
  const legendaryCount = rarities.filter(r => r === 'legendary').length;
  const epicCount = rarities.filter(r => r === 'epic').length;
  const playstyleBonus = Math.min(15, legendaryCount * 3 + epicCount * 1.5);

  // Calculate total (0-100)
  const maxPossibleLinks = (players.length * (players.length - 1)) / 2;
  const linkScore = links.length > 0 ? (links.reduce((sum, l) => sum + l.bonus, 0) / maxPossibleLinks) * 30 : 0;
  const lineScore = Math.min(20, lineLinks * 2);
  const total = Math.min(100, linkScore + lineScore + playstyleBonus + strongLinks * 3);

  return {
    total: Math.round(total * 10) / 10,
    clubLinks,
    leagueLinks,
    nationLinks,
    playstyleBonus: Math.round(playstyleBonus),
    lineLinks,
    details: { links, strongLinks, weakLinks }
  };
}

/**
 * ============================================
 * BALANCE SCORE (15%)
 * ============================================
 * Squad structure and coverage
 */
function calculateBalanceScore(players) {
  if (players.length === 0) {
    return { total: 0, positionCoverage: 0, wingBalance: 0, ageDistribution: 0, depthScore: 0, details: {} };
  }

  const penalties = [];
  let positionCoverage = 100;
  let wingBalance = 100;
  let ageDistribution = 100;
  let depthScore = 100;

  // Position counts
  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  players.forEach(p => {
    counts[getPositionGroup(p.position)]++;
  });

  // Position coverage penalties
  if (counts.GK === 0) {
    positionCoverage -= 40;
    penalties.push({ issue: 'No Goalkeeper', penalty: -40 });
  }
  if (counts.DEF < 3) {
    const deficit = 3 - counts.DEF;
    positionCoverage -= deficit * 15;
    penalties.push({ issue: `Only ${counts.DEF} defenders`, penalty: deficit * -15 });
  }
  if (counts.MID < 2) {
    const deficit = 2 - counts.MID;
    positionCoverage -= deficit * 10;
    penalties.push({ issue: `Only ${counts.MID} midfielders`, penalty: deficit * -10 });
  }
  if (counts.FWD < 1) {
    positionCoverage -= 20;
    penalties.push({ issue: 'No forwards', penalty: -20 });
  }
  if (counts.FWD > 5) {
    const excess = counts.FWD - 5;
    positionCoverage -= excess * 5;
    penalties.push({ issue: `Too many forwards (${counts.FWD})`, penalty: excess * -5 });
  }

  // Wing balance (left/right coverage)
  const leftSide = players.filter(p => ['LB', 'LM', 'LW', 'LWB'].includes(p.position)).length;
  const rightSide = players.filter(p => ['RB', 'RM', 'RW', 'RWB'].includes(p.position)).length;
  
  if (leftSide === 0) {
    wingBalance -= 15;
    penalties.push({ issue: 'No left-side players', penalty: -15 });
  }
  if (rightSide === 0) {
    wingBalance -= 15;
    penalties.push({ issue: 'No right-side players', penalty: -15 });
  }
  const wingDiff = Math.abs(leftSide - rightSide);
  if (wingDiff > 2) {
    wingBalance -= (wingDiff - 2) * 5;
  }

  // Age distribution
  const ages = players.map(p => p.age || 25);
  const avgAge = ages.reduce((a, b) => a + b, 0) / ages.length;
  const youngPlayers = ages.filter(a => a < 24).length;
  const veteranPlayers = ages.filter(a => a > 32).length;

  if (avgAge > 31) {
    ageDistribution -= 10;
    penalties.push({ issue: 'Squad too old', penalty: -10 });
  }
  if (youngPlayers === 0 && players.length >= 11) {
    ageDistribution -= 5;
  }

  // Depth score based on squad size
  if (players.length < 11) {
    depthScore = (players.length / 11) * 100;
    penalties.push({ issue: `Incomplete squad (${players.length}/11)`, penalty: -((11 - players.length) * 8) });
  }

  // Calculate total
  const total = (positionCoverage * 0.4 + wingBalance * 0.2 + ageDistribution * 0.15 + depthScore * 0.25);

  return {
    total: Math.round(Math.max(0, total) * 10) / 10,
    positionCoverage: Math.round(Math.max(0, positionCoverage)),
    wingBalance: Math.round(Math.max(0, wingBalance)),
    ageDistribution: Math.round(Math.max(0, ageDistribution)),
    depthScore: Math.round(Math.max(0, depthScore)),
    details: {
      hasGK: counts.GK > 0,
      defenderCount: counts.DEF,
      midfielderCount: counts.MID,
      forwardCount: counts.FWD,
      leftSideCount: leftSide,
      rightSideCount: rightSide,
      avgAge: Math.round(avgAge * 10) / 10,
      penalties
    }
  };
}

/**
 * ============================================
 * MANAGER IQ SCORE (15%)
 * ============================================
 * Budget efficiency and smart drafting
 */
function calculateManagerIQScore(players, soldPlayers, playerId, startingBudget) {
  // Get player's purchases
  const purchases = soldPlayers.filter(sp => sp.buyerId === playerId);
  const totalSpent = purchases.reduce((sum, p) => sum + p.price, 0);
  const remainingBudget = startingBudget - totalSpent;

  if (purchases.length === 0) {
    return {
      total: 0,
      budgetEfficiency: 0,
      stealBids: 0,
      squadCompletion: 0,
      riskManagement: 0,
      details: {
        totalSpent: 0,
        remainingBudget: startingBudget,
        avgPricePerPlayer: 0,
        bestValueSigning: null,
        worstValueSigning: null,
        earlySpending: 0,
        lateSpending: 0
      }
    };
  }

  // Budget efficiency: Power per dollar
  const powerScore = calculatePowerScore(players);
  const budgetEfficiency = totalSpent > 0 ? (powerScore.total / (totalSpent / 1000000)) * 10 : 0;

  // Steal bids: players bought significantly below their "value"
  let stealBids = 0;
  let bestValue = null;
  let worstValue = null;

  purchases.forEach(purchase => {
    const expectedPrice = purchase.player.basePrice * 1000000;
    const actualPrice = purchase.price;
    const valueRatio = expectedPrice / actualPrice;

    const valueEntry = {
      player: purchase.player.name,
      price: actualPrice,
      value: Math.round(valueRatio * 100) / 100
    };

    if (valueRatio > 1.5) {
      stealBids += 5; // Great steal
    } else if (valueRatio > 1.2) {
      stealBids += 3; // Good value
    } else if (valueRatio < 0.6) {
      stealBids -= 3; // Overpaid significantly
    }

    if (!bestValue || valueRatio > bestValue.value) {
      bestValue = valueEntry;
    }
    if (!worstValue || valueRatio < worstValue.value) {
      worstValue = valueEntry;
    }
  });

  // Squad completion: bonus for getting 11 players
  let squadCompletion = 0;
  if (players.length >= 11) {
    squadCompletion = 30;
    // Extra bonus for completing early
    if (purchases.length <= 15) {
      squadCompletion += 10;
    }
  } else {
    squadCompletion = (players.length / 11) * 25;
  }

  // Risk management: balanced spending
  let riskManagement = 50;
  const avgPricePerPlayer = totalSpent / purchases.length;
  const priceVariance = purchases.reduce((sum, p) => {
    return sum + Math.pow(p.price - avgPricePerPlayer, 2);
  }, 0) / purchases.length;
  const priceStdDev = Math.sqrt(priceVariance);

  // Reward balanced spending
  const coefficientOfVariation = avgPricePerPlayer > 0 ? priceStdDev / avgPricePerPlayer : 0;
  if (coefficientOfVariation < 0.5) {
    riskManagement += 20; // Very balanced
  } else if (coefficientOfVariation < 1) {
    riskManagement += 10; // Somewhat balanced
  } else if (coefficientOfVariation > 2) {
    riskManagement -= 15; // Very risky spending
  }

  // Penalize if spent almost all budget
  const budgetUsage = totalSpent / startingBudget;
  if (budgetUsage > 0.95 && players.length < 11) {
    riskManagement -= 20;
  }
  if (remainingBudget > startingBudget * 0.3 && players.length < 11) {
    riskManagement -= 10; // Underspent but incomplete
  }

  // Calculate spending distribution
  const midPoint = Math.floor(purchases.length / 2);
  const earlyPurchases = purchases.slice(0, midPoint);
  const latePurchases = purchases.slice(midPoint);
  const earlySpending = earlyPurchases.reduce((sum, p) => sum + p.price, 0);
  const lateSpending = latePurchases.reduce((sum, p) => sum + p.price, 0);
  const earlyPercent = totalSpent > 0 ? (earlySpending / totalSpent) * 100 : 0;
  const latePercent = totalSpent > 0 ? (lateSpending / totalSpent) * 100 : 0;

  // Calculate total
  const total = Math.min(100, 
    budgetEfficiency * 0.3 + 
    stealBids + 
    squadCompletion + 
    riskManagement * 0.4
  );

  return {
    total: Math.round(Math.max(0, total) * 10) / 10,
    budgetEfficiency: Math.round(budgetEfficiency * 10) / 10,
    stealBids: Math.round(stealBids),
    squadCompletion: Math.round(squadCompletion),
    riskManagement: Math.round(riskManagement),
    details: {
      totalSpent,
      remainingBudget,
      avgPricePerPlayer: Math.round(avgPricePerPlayer),
      bestValueSigning: bestValue,
      worstValueSigning: worstValue,
      earlySpending: Math.round(earlyPercent),
      lateSpending: Math.round(latePercent)
    }
  };
}

/**
 * ============================================
 * FORMATION SELECTION
 * ============================================
 * Auto-select best formation based on squad
 */
function selectBestFormation(players) {
  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  players.forEach(p => {
    counts[getPositionGroup(p.position)]++;
  });

  // Select formation based on player distribution
  if (counts.DEF >= 5) {
    return FORMATIONS.find(f => f.name === '5-3-2') || FORMATIONS[0];
  }
  if (counts.FWD >= 3) {
    return FORMATIONS.find(f => f.name === '4-3-3') || FORMATIONS[0];
  }
  if (counts.MID >= 5) {
    return FORMATIONS.find(f => f.name === '3-5-2') || FORMATIONS[0];
  }
  if (counts.FWD >= 2 && counts.MID >= 4) {
    return FORMATIONS.find(f => f.name === '4-4-2') || FORMATIONS[0];
  }
  
  // Default to 4-3-3
  return FORMATIONS.find(f => f.name === '4-3-3') || FORMATIONS[0];
}

/**
 * ============================================
 * MAIN ANALYSIS FUNCTION
 * ============================================
 */
function analyzeTeam(player, soldPlayers, startingBudget) {
  const squad = player.squad || [];
  
  // Validation
  const validation = validateSquad(squad);
  
  // Select formation
  const formation = selectBestFormation(squad);
  
  // Calculate all 5 pillars
  const power = calculatePowerScore(squad);
  const tactical = calculateTacticalScore(squad, formation);
  const chemistry = calculateChemistryScore(squad);
  const balance = calculateBalanceScore(squad);
  const managerIQ = calculateManagerIQScore(squad, soldPlayers, player.id, startingBudget);
  
  // Calculate final weighted score
  let finalScore = 0;
  
  if (validation.isValid) {
    finalScore = 
      power.total * SCORE_WEIGHTS.power +
      tactical.total * SCORE_WEIGHTS.tactical +
      chemistry.total * SCORE_WEIGHTS.chemistry +
      balance.total * SCORE_WEIGHTS.balance +
      managerIQ.total * SCORE_WEIGHTS.managerIQ;
  } else {
    // Invalid squad gets massive penalty
    finalScore = Math.max(0, (
      power.total * SCORE_WEIGHTS.power +
      tactical.total * SCORE_WEIGHTS.tactical +
      chemistry.total * SCORE_WEIGHTS.chemistry +
      balance.total * SCORE_WEIGHTS.balance +
      managerIQ.total * SCORE_WEIGHTS.managerIQ
    ) * 0.3); // 70% penalty for invalid squad
  }

  // Find MVP (highest rated player)
  const mvp = squad.length > 0 ? 
    squad.reduce((best, p) => p.rating > best.rating ? p : best, squad[0]) : 
    null;

  // Find best tactical choice (natural position + high rating)
  const bestTacticalChoice = squad.length > 0 ?
    squad.reduce((best, p) => {
      const tacBonus = tactical.details.positionMatches.find(m => m.player === p.name)?.bonus || 0;
      const bestTacBonus = tactical.details.positionMatches.find(m => m.player === best.name)?.bonus || 0;
      return tacBonus > bestTacBonus ? p : best;
    }, squad[0]) :
    null;

  // Best value signing
  const bestValueSigning = managerIQ.details.bestValueSigning ?
    squad.find(p => p.name === managerIQ.details.bestValueSigning.player) :
    null;

  return {
    playerId: player.id,
    playerName: player.name,
    squad,
    validation,
    power,
    tactical,
    chemistry,
    balance,
    managerIQ,
    finalScore: Math.round(finalScore * 10) / 10,
    formation,
    mvp,
    bestTacticalChoice,
    bestValueSigning
  };
}

/**
 * ============================================
 * CALCULATE GAME RESULT
 * ============================================
 */
function calculateGameResult(room) {
  const player1 = room.players[0];
  const player2 = room.players[1];
  const startingBudget = room.settings.startingBudget;
  const soldPlayers = room.soldPlayers || [];

  // Analyze both teams
  const analysis1 = analyzeTeam(player1, soldPlayers, startingBudget);
  const analysis2 = analyzeTeam(player2, soldPlayers, startingBudget);

  // Determine winner
  let winner, loser, winnerAnalysis, loserAnalysis;
  let winByDefault = false;

  // Check for invalid squads
  if (!analysis1.validation.isValid && !analysis2.validation.isValid) {
    // Both invalid - higher partial score wins
    if (analysis1.finalScore >= analysis2.finalScore) {
      winner = player1; loser = player2;
      winnerAnalysis = analysis1; loserAnalysis = analysis2;
    } else {
      winner = player2; loser = player1;
      winnerAnalysis = analysis2; loserAnalysis = analysis1;
    }
  } else if (!analysis1.validation.isValid) {
    // Player 1 invalid - Player 2 wins
    winner = player2; loser = player1;
    winnerAnalysis = analysis2; loserAnalysis = analysis1;
    winByDefault = true;
  } else if (!analysis2.validation.isValid) {
    // Player 2 invalid - Player 1 wins
    winner = player1; loser = player2;
    winnerAnalysis = analysis1; loserAnalysis = analysis2;
    winByDefault = true;
  } else {
    // Both valid - higher score wins
    if (analysis1.finalScore >= analysis2.finalScore) {
      winner = player1; loser = player2;
      winnerAnalysis = analysis1; loserAnalysis = analysis2;
    } else {
      winner = player2; loser = player1;
      winnerAnalysis = analysis2; loserAnalysis = analysis1;
    }
  }

  // Find closest and dominant pillars
  const pillarDiffs = [
    { name: 'Power', diff: Math.abs(winnerAnalysis.power.total - loserAnalysis.power.total), winnerScore: winnerAnalysis.power.total },
    { name: 'Tactical', diff: Math.abs(winnerAnalysis.tactical.total - loserAnalysis.tactical.total), winnerScore: winnerAnalysis.tactical.total },
    { name: 'Chemistry', diff: Math.abs(winnerAnalysis.chemistry.total - loserAnalysis.chemistry.total), winnerScore: winnerAnalysis.chemistry.total },
    { name: 'Balance', diff: Math.abs(winnerAnalysis.balance.total - loserAnalysis.balance.total), winnerScore: winnerAnalysis.balance.total },
    { name: 'Manager IQ', diff: Math.abs(winnerAnalysis.managerIQ.total - loserAnalysis.managerIQ.total), winnerScore: winnerAnalysis.managerIQ.total }
  ];

  const closestPillar = pillarDiffs.reduce((min, p) => p.diff < min.diff ? p : min, pillarDiffs[0]).name;
  const dominantPillar = pillarDiffs.reduce((max, p) => p.diff > max.diff ? p : max, pillarDiffs[0]).name;

  // Build legacy breakdown for compatibility
  const buildLegacyBreakdown = (analysis) => ({
    averageRating: analysis.power.avgOverall,
    ratingScore: analysis.power.total * 0.5,
    positionBalance: analysis.balance.total,
    positionScore: analysis.tactical.total * 0.5,
    synergy: analysis.chemistry.total,
    synergyScore: analysis.chemistry.total * 0.5
  });

  // Build team scores
  const winnerScore = {
    playerId: winner.id,
    playerName: winner.name,
    totalScore: winnerAnalysis.finalScore,
    breakdown: buildLegacyBreakdown(winnerAnalysis),
    analysis: winnerAnalysis,
    squad: winner.squad,
    formation: winnerAnalysis.formation
  };

  const loserScore = {
    playerId: loser.id,
    playerName: loser.name,
    totalScore: loserAnalysis.finalScore,
    breakdown: buildLegacyBreakdown(loserAnalysis),
    analysis: loserAnalysis,
    squad: loser.squad,
    formation: loserAnalysis.formation
  };

  // Build radar comparison
  const radarComparison = {
    categories: ['Power', 'Tactical', 'Chemistry', 'Balance', 'Manager IQ'],
    winnerValues: [
      winnerAnalysis.power.total,
      winnerAnalysis.tactical.total,
      winnerAnalysis.chemistry.total,
      winnerAnalysis.balance.total,
      winnerAnalysis.managerIQ.total
    ],
    loserValues: [
      loserAnalysis.power.total,
      loserAnalysis.tactical.total,
      loserAnalysis.chemistry.total,
      loserAnalysis.balance.total,
      loserAnalysis.managerIQ.total
    ]
  };

  return {
    winner,
    loser,
    winnerScore,
    loserScore,
    scoreDifference: Math.round((winnerAnalysis.finalScore - loserAnalysis.finalScore) * 10) / 10,
    mvp: winnerAnalysis.mvp,
    bestTacticalChoice: winnerAnalysis.bestTacticalChoice,
    bestValueSigning: winnerAnalysis.bestValueSigning,
    matchSummary: {
      winnerValidSquad: winnerAnalysis.validation.isValid,
      loserValidSquad: loserAnalysis.validation.isValid,
      winByDefault,
      closestPillar,
      dominantPillar
    },
    radarComparison
  };
}

module.exports = {
  validateSquad,
  calculatePowerScore,
  calculateTacticalScore,
  calculateChemistryScore,
  calculateBalanceScore,
  calculateManagerIQScore,
  analyzeTeam,
  calculateGameResult,
  selectBestFormation,
  SCORE_WEIGHTS,
  FORMATIONS,
  POSITION_GROUPS,
  ALL_POSITIONS,
  getPositionGroup,
  parseAltPositions,
  getAllPlayerPositions
};

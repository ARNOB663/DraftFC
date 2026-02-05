/**
 * Seed Script for Football Auction Game
 * Run with: node scripts/seed-players.mjs
 * 
 * This adds sample players to MongoDB for the AI match to work
 */

import { MongoClient } from 'mongodb';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Load .env
try {
    const envPath = join(process.cwd(), '.env');
    if (existsSync(envPath)) {
        readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
            const m = line.match(/^([^#=]+)=(.*)$/);
            if (m) process.env[m[1].trim()] = m[2].trim();
        });
    }
} catch (_) { }

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
}

// Sample players data with proper distribution
const SAMPLE_PLAYERS = [
    // Goalkeepers (3)
    { name: 'Thibaut Courtois', position: 'GK', rating: 89, age: 31, nation: 'Belgium', club: 'Real Madrid', league: 'La Liga', rarity: 'rare', basePrice: 45, altPositions: [] },
    { name: 'Alisson Becker', position: 'GK', rating: 89, age: 30, nation: 'Brazil', club: 'Liverpool', league: 'Premier League', rarity: 'rare', basePrice: 45, altPositions: [] },
    { name: 'Marc-André ter Stegen', position: 'GK', rating: 88, age: 31, nation: 'Germany', club: 'Barcelona', league: 'La Liga', rarity: 'rare', basePrice: 40, altPositions: [] },

    // Center Backs (6)
    { name: 'Virgil van Dijk', position: 'CB', rating: 90, age: 32, nation: 'Netherlands', club: 'Liverpool', league: 'Premier League', rarity: 'epic', basePrice: 55, altPositions: [] },
    { name: 'Rúben Dias', position: 'CB', rating: 88, age: 26, nation: 'Portugal', club: 'Manchester City', league: 'Premier League', rarity: 'rare', basePrice: 45, altPositions: [] },
    { name: 'Antonio Rüdiger', position: 'CB', rating: 87, age: 30, nation: 'Germany', club: 'Real Madrid', league: 'La Liga', rarity: 'rare', basePrice: 40, altPositions: [] },
    { name: 'Marquinhos', position: 'CB', rating: 87, age: 29, nation: 'Brazil', club: 'PSG', league: 'Ligue 1', rarity: 'rare', basePrice: 40, altPositions: ['CDM'] },
    { name: 'William Saliba', position: 'CB', rating: 86, age: 22, nation: 'France', club: 'Arsenal', league: 'Premier League', rarity: 'rare', basePrice: 38, altPositions: [] },
    { name: 'Kim Min-jae', position: 'CB', rating: 86, age: 27, nation: 'South Korea', club: 'Bayern Munich', league: 'Bundesliga', rarity: 'rare', basePrice: 38, altPositions: [] },

    // Left Backs (3)
    { name: 'Alphonso Davies', position: 'LB', rating: 85, age: 23, nation: 'Canada', club: 'Bayern Munich', league: 'Bundesliga', rarity: 'rare', basePrice: 35, altPositions: ['LM', 'LW'] },
    { name: 'Theo Hernández', position: 'LB', rating: 86, age: 26, nation: 'France', club: 'AC Milan', league: 'Serie A', rarity: 'rare', basePrice: 38, altPositions: ['LWB'] },
    { name: 'Andrew Robertson', position: 'LB', rating: 85, age: 29, nation: 'Scotland', club: 'Liverpool', league: 'Premier League', rarity: 'rare', basePrice: 35, altPositions: ['LWB'] },

    // Right Backs (3)
    { name: 'Trent Alexander-Arnold', position: 'RB', rating: 87, age: 25, nation: 'England', club: 'Liverpool', league: 'Premier League', rarity: 'rare', basePrice: 42, altPositions: ['CM'] },
    { name: 'Achraf Hakimi', position: 'RB', rating: 85, age: 25, nation: 'Morocco', club: 'PSG', league: 'Ligue 1', rarity: 'rare', basePrice: 36, altPositions: ['RWB', 'RM'] },
    { name: 'Kyle Walker', position: 'RB', rating: 84, age: 33, nation: 'England', club: 'Manchester City', league: 'Premier League', rarity: 'rare', basePrice: 30, altPositions: ['CB'] },

    // Defensive Midfielders (3)
    { name: 'Casemiro', position: 'CDM', rating: 87, age: 31, nation: 'Brazil', club: 'Manchester United', league: 'Premier League', rarity: 'rare', basePrice: 40, altPositions: ['CM'] },
    { name: 'Rodri', position: 'CDM', rating: 90, age: 27, nation: 'Spain', club: 'Manchester City', league: 'Premier League', rarity: 'epic', basePrice: 55, altPositions: ['CM'] },
    { name: 'Aurélien Tchouaméni', position: 'CDM', rating: 85, age: 24, nation: 'France', club: 'Real Madrid', league: 'La Liga', rarity: 'rare', basePrice: 36, altPositions: ['CM', 'CB'] },

    // Central Midfielders (6)
    { name: 'Kevin De Bruyne', position: 'CM', rating: 91, age: 32, nation: 'Belgium', club: 'Manchester City', league: 'Premier League', rarity: 'legendary', basePrice: 70, altPositions: ['CAM'] },
    { name: 'Luka Modrić', position: 'CM', rating: 87, age: 38, nation: 'Croatia', club: 'Real Madrid', league: 'La Liga', rarity: 'rare', basePrice: 35, altPositions: ['CAM'] },
    { name: 'Jude Bellingham', position: 'CM', rating: 90, age: 20, nation: 'England', club: 'Real Madrid', league: 'La Liga', rarity: 'epic', basePrice: 65, altPositions: ['CAM'] },
    { name: 'Bruno Fernandes', position: 'CM', rating: 88, age: 29, nation: 'Portugal', club: 'Manchester United', league: 'Premier League', rarity: 'rare', basePrice: 45, altPositions: ['CAM'] },
    { name: 'Federico Valverde', position: 'CM', rating: 87, age: 25, nation: 'Uruguay', club: 'Real Madrid', league: 'La Liga', rarity: 'rare', basePrice: 42, altPositions: ['RM', 'CDM'] },
    { name: 'Pedri', position: 'CM', rating: 87, age: 21, nation: 'Spain', club: 'Barcelona', league: 'La Liga', rarity: 'rare', basePrice: 42, altPositions: ['CAM'] },

    // Attacking Midfielders (3)
    { name: 'Martin Ødegaard', position: 'CAM', rating: 88, age: 25, nation: 'Norway', club: 'Arsenal', league: 'Premier League', rarity: 'rare', basePrice: 45, altPositions: ['CM'] },
    { name: 'Cole Palmer', position: 'CAM', rating: 86, age: 22, nation: 'England', club: 'Chelsea', league: 'Premier League', rarity: 'rare', basePrice: 40, altPositions: ['RW'] },
    { name: 'Jamal Musiala', position: 'CAM', rating: 87, age: 21, nation: 'Germany', club: 'Bayern Munich', league: 'Bundesliga', rarity: 'rare', basePrice: 42, altPositions: ['LW', 'CM'] },

    // Left/Right Midfielders (4)
    { name: 'Bukayo Saka', position: 'RM', rating: 88, age: 22, nation: 'England', club: 'Arsenal', league: 'Premier League', rarity: 'rare', basePrice: 45, altPositions: ['RW', 'LW'] },
    { name: 'Phil Foden', position: 'LM', rating: 88, age: 24, nation: 'England', club: 'Manchester City', league: 'Premier League', rarity: 'rare', basePrice: 45, altPositions: ['LW', 'CAM'] },
    { name: 'Leroy Sané', position: 'LM', rating: 85, age: 28, nation: 'Germany', club: 'Bayern Munich', league: 'Bundesliga', rarity: 'rare', basePrice: 36, altPositions: ['LW', 'RW'] },
    { name: 'Bernardo Silva', position: 'RM', rating: 88, age: 29, nation: 'Portugal', club: 'Manchester City', league: 'Premier League', rarity: 'rare', basePrice: 45, altPositions: ['CAM', 'CM'] },

    // Left Wingers (3)
    { name: 'Vinícius Júnior', position: 'LW', rating: 92, age: 24, nation: 'Brazil', club: 'Real Madrid', league: 'La Liga', rarity: 'legendary', basePrice: 85, altPositions: ['RW', 'ST'] },
    { name: 'Rafael Leão', position: 'LW', rating: 86, age: 24, nation: 'Portugal', club: 'AC Milan', league: 'Serie A', rarity: 'rare', basePrice: 40, altPositions: ['ST'] },
    { name: 'Marcus Rashford', position: 'LW', rating: 84, age: 26, nation: 'England', club: 'Manchester United', league: 'Premier League', rarity: 'rare', basePrice: 32, altPositions: ['ST'] },

    // Right Wingers (3)
    { name: 'Mohamed Salah', position: 'RW', rating: 89, age: 31, nation: 'Egypt', club: 'Liverpool', league: 'Premier League', rarity: 'epic', basePrice: 50, altPositions: ['ST'] },
    { name: 'Ousmane Dembélé', position: 'RW', rating: 86, age: 27, nation: 'France', club: 'PSG', league: 'Ligue 1', rarity: 'rare', basePrice: 38, altPositions: ['LW'] },
    { name: 'Khvicha Kvaratskhelia', position: 'RW', rating: 86, age: 23, nation: 'Georgia', club: 'Napoli', league: 'Serie A', rarity: 'rare', basePrice: 38, altPositions: ['LW'] },

    // Strikers (6)
    { name: 'Erling Haaland', position: 'ST', rating: 91, age: 24, nation: 'Norway', club: 'Manchester City', league: 'Premier League', rarity: 'legendary', basePrice: 90, altPositions: [] },
    { name: 'Kylian Mbappé', position: 'ST', rating: 91, age: 25, nation: 'France', club: 'Real Madrid', league: 'La Liga', rarity: 'legendary', basePrice: 95, altPositions: ['LW', 'RW'] },
    { name: 'Harry Kane', position: 'ST', rating: 90, age: 30, nation: 'England', club: 'Bayern Munich', league: 'Bundesliga', rarity: 'epic', basePrice: 60, altPositions: [] },
    { name: 'Lautaro Martínez', position: 'ST', rating: 88, age: 26, nation: 'Argentina', club: 'Inter Milan', league: 'Serie A', rarity: 'rare', basePrice: 48, altPositions: ['CF'] },
    { name: 'Victor Osimhen', position: 'ST', rating: 87, age: 25, nation: 'Nigeria', club: 'Napoli', league: 'Serie A', rarity: 'rare', basePrice: 42, altPositions: [] },
    { name: 'Darwin Núñez', position: 'ST', rating: 84, age: 25, nation: 'Uruguay', club: 'Liverpool', league: 'Premier League', rarity: 'rare', basePrice: 32, altPositions: ['LW'] },
];

// Generate stats based on position and rating
function generateOverallStats(player) {
    const rating = player.rating;
    const position = player.position;
    const variance = () => Math.floor(Math.random() * 10) - 5;

    const baseStats = {
        paceOverall: Math.min(99, Math.max(40, rating - 5 + variance())),
        shootingOverall: Math.min(99, Math.max(40, rating - 8 + variance())),
        passingOverall: Math.min(99, Math.max(40, rating - 5 + variance())),
        dribblingOverall: Math.min(99, Math.max(40, rating - 5 + variance())),
        defendingOverall: Math.min(99, Math.max(40, rating - 15 + variance())),
        physicalOverall: Math.min(99, Math.max(40, rating - 8 + variance())),
    };

    // Adjust stats based on position
    if (position === 'GK') {
        baseStats.shootingOverall = 15 + variance();
        baseStats.defendingOverall = rating - 3 + variance();
        baseStats.paceOverall = 40 + variance();
    } else if (['CB', 'LB', 'RB'].includes(position)) {
        baseStats.defendingOverall = rating - 2 + variance();
        baseStats.shootingOverall = 50 + variance();
    } else if (['CDM', 'CM'].includes(position)) {
        baseStats.passingOverall = rating - 2 + variance();
    } else if (['CAM', 'LM', 'RM'].includes(position)) {
        baseStats.dribblingOverall = rating - 2 + variance();
        baseStats.passingOverall = rating - 3 + variance();
    } else if (['LW', 'RW', 'ST'].includes(position)) {
        baseStats.paceOverall = rating + variance();
        baseStats.shootingOverall = rating - 2 + variance();
        baseStats.dribblingOverall = rating - 2 + variance();
        baseStats.defendingOverall = 35 + variance();
    }

    return baseStats;
}

// Generate image URLs (using placeholders)
function generateImages(player, index) {
    return {
        playerFace: `https://i.pravatar.cc/256?u=${player.name.replace(/\s/g, '')}_${index}`,
        nationFlag: `https://flagcdn.com/w40/${getCountryCode(player.nation)}.png`,
        clubBadge: `https://picsum.photos/seed/${player.club.replace(/\s/g, '')}/50`,
        leagueLogo: `https://picsum.photos/seed/${player.league.replace(/\s/g, '')}/50`,
    };
}

function getCountryCode(nation) {
    const codes = {
        'Belgium': 'be', 'Brazil': 'br', 'Germany': 'de', 'Netherlands': 'nl', 'Portugal': 'pt',
        'France': 'fr', 'South Korea': 'kr', 'Canada': 'ca', 'Scotland': 'gb-sct', 'England': 'gb-eng',
        'Morocco': 'ma', 'Spain': 'es', 'Croatia': 'hr', 'Uruguay': 'uy', 'Norway': 'no',
        'Egypt': 'eg', 'Georgia': 'ge', 'Argentina': 'ar', 'Nigeria': 'ng'
    };
    return codes[nation] || 'un';
}

async function seedPlayers() {
    console.log('🌱 Seeding players to MongoDB...\n');

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db();
        const collection = db.collection('players');

        // Check existing count
        const existingCount = await collection.countDocuments();
        console.log(`📊 Current players in database: ${existingCount}`);

        if (existingCount > 0) {
            console.log('⚠️  Database already has players. Skipping seed to avoid duplicates.');
            console.log('💡 To re-seed, run: node scripts/seed-players.mjs --force\n');

            if (!process.argv.includes('--force')) {
                await client.close();
                return;
            }

            console.log('🔄 --force flag detected. Clearing existing players...');
            await collection.deleteMany({});
        }

        // Prepare players with generated data
        const playersToInsert = SAMPLE_PLAYERS.map((player, index) => ({
            _id: `player_${player.name.replace(/\s/g, '_').toLowerCase()}_${index}`,
            ...player,
            version: 'FUT 25',
            overallStats: generateOverallStats(player),
            images: generateImages(player, index),
        }));

        // Insert all players
        const result = await collection.insertMany(playersToInsert);
        console.log(`\n✅ Successfully inserted ${result.insertedCount} players!\n`);

        // Show position distribution
        const distribution = {};
        SAMPLE_PLAYERS.forEach(p => {
            distribution[p.position] = (distribution[p.position] || 0) + 1;
        });
        console.log('📊 Position distribution:');
        Object.entries(distribution).sort().forEach(([pos, count]) => {
            console.log(`   ${pos}: ${count} players`);
        });

        console.log('\n🎮 You can now start an AI match!\n');

    } catch (error) {
        console.error('❌ Error seeding players:', error.message);
    } finally {
        await client.close();
    }
}

seedPlayers();

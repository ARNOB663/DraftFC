import { NextResponse } from 'next/server';

// Simple generator for an "official" players list used by the UI.
// Uses public placeholder image hosts (i.pravatar.cc) for unique faces.
const NAMES = [
  'Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappé', 'Erling Haaland', 'Kevin De Bruyne',
  'Mohamed Salah', 'Jude Bellingham', 'Vinícius Júnior', 'Harry Kane', 'Neymar Jr',
  'Luka Modrić', 'Sergio Ramos', 'Manuel Neuer', 'Karim Benzema', 'Robert Lewandowski',
  'Antoine Griezmann', 'Paul Pogba', 'Romelu Lukaku', 'Luis Suárez', 'Sadio Mané',
  'Raheem Sterling', 'Trent Alexander-Arnold', 'Virgil van Dijk', 'Joshua Kimmich', 'Bruno Fernandes',
  'Frenkie de Jong', 'Phil Foden', 'Bernardo Silva', 'Heung-min Son', 'Riyad Mahrez'
];

const POSITIONS = ['GK','CB','LB','RB','LWB','RWB','CDM','CM','CAM','LM','RM','LW','RW','ST','CF'];
const COUNTRIES = ['ar','pt','fr','no','be','eg','gb','br','de','es','it','nl','se','kr','ma'];

export async function GET() {
  const players = Array.from({ length: 36 }).map((_, i) => {
    const id = `official_${i + 1}`;
    const name = NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length)}` : '');
    const position = POSITIONS[i % POSITIONS.length];
    const rating = Math.max(60, 95 - Math.floor(i / 2));
    const nation = COUNTRIES[i % COUNTRIES.length];

    return {
      _id: id,
      name,
      position,
      rating,
      age: 20 + (i % 15),
      version: 'OFFICIAL',
      images: {
        playerFace: `https://i.pravatar.cc/256?u=${encodeURIComponent(id)}`,
        nationFlag: `https://flagcdn.com/w20/${nation}.png`,
        clubBadge: `https://via.placeholder.com/50?text=${encodeURIComponent(name.split(' ')[0])}`,
      },
      overallStats: {
        paceOverall: 70 + (i % 20),
        shootingOverall: 65 + (i % 30),
        passingOverall: 65 + (i % 25),
        dribblingOverall: 65 + (i % 25),
        defendingOverall: 40 + (i % 45),
        physicalOverall: 60 + (i % 30),
      },
      basePrice: (rating * 1000000),
      rarity: i < 8 ? 'legendary' : i < 20 ? 'epic' : 'rare',
    };
  });

  return NextResponse.json(players);
}

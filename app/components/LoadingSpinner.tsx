'use client';

import { useState, useEffect } from 'react';

const proverbs = [
  "A journey of a thousand miles begins with a single step",
  "The best time to plant a tree was 20 years ago. The second best time is now",
  "Every cloud has a silver lining",
  "Where there's a will, there's a way",
  "Actions speak louder than words",
  "Knowledge is power",
  "Fortune favors the bold",
  "Patience is a virtue",
  "Practice makes perfect",
  "Time and tide wait for no one",
  "Don't put all your eggs in one basket",
  "You can't judge a book by its cover",
  "The pen is mightier than the sword",
  "When in Rome, do as the Romans do",
  "The early bird catches the worm",
  "Birds of a feather flock together",
  "A picture is worth a thousand words",
  "A stitch in time saves nine",
  "Necessity is the mother of invention",
  "All that glitters is not gold",
  "Too many cooks spoil the broth",
  "You can't have your cake and eat it too",
  "Rome wasn't built in a day",
  "Better late than never",
  "Two wrongs don't make a right",
  "The grass is always greener on the other side",
  "Beggars can't be choosers",
  "Don't count your chickens before they hatch",
  "If it ain't broke, don't fix it",
  "The apple doesn't fall far from the tree",
  "Pride comes before a fall",
  "You can lead a horse to water, but you can't make it drink",
  "There's no smoke without fire",
  "It takes two to tango",
  "The road to hell is paved with good intentions",
  "A rolling stone gathers no moss",
  "First things first",
  "Look before you leap",
  "Better safe than sorry",
  "Strike while the iron is hot",
  "A penny saved is a penny earned",
  "You reap what you sow",
  "Curiosity killed the cat",
  "Honesty is the best policy",
  "Don't bite the hand that feeds you",
  "A friend in need is a friend indeed",
  "All good things come to those who wait",
  "Don't put off until tomorrow what you can do today",
  "Blood is thicker than water",
  "When the going gets tough, the tough get going",
  "Two heads are better than one",
  "The squeaky wheel gets the grease",
  "There's no place like home",
  "Beauty is in the eye of the beholder",
  "Absence makes the heart grow fonder",
  "You can't teach an old dog new tricks",
  "Let sleeping dogs lie",
  "The devil is in the details",
  "It's no use crying over spilled milk",
  "One man's trash is another man's treasure",
  "Easy come, easy go",
  "Many hands make light work",
  "Keep your friends close and your enemies closer",
  "A chain is only as strong as its weakest link",
  "Still waters run deep",
  "Good things come in small packages",
  "Don't bite off more than you can chew",
  "The darkest hour is just before dawn",
  "Out of sight, out of mind",
  "Laughter is the best medicine",
  "Hope for the best, prepare for the worst",
  "The bigger they are, the harder they fall",
  "Slow and steady wins the race",
  "Those who live in glass houses shouldn't throw stones",
  "A bird in the hand is worth two in the bush",
  "Great minds think alike",
  "A leopard can't change its spots",
  "It's better to give than to receive",
  "An apple a day keeps the doctor away",
  "Don't look a gift horse in the mouth",
  "The early bird catches the worm",
  "You can't make an omelet without breaking eggs",
  "A watched pot never boils",
  "Money talks",
  "Haste makes waste",
  "Clothes make the man",
  "The customer is always right",
  "Tomorrow is another day",
  "It's the thought that counts",
  "All's fair in love and war",
  "Necessity is the mother of invention",
  "A drowning man will clutch at a straw",
  "There are plenty of fish in the sea",
  "What goes around comes around",
  "Empty vessels make the most noise",
  "Every dog has its day",
  "Lightning never strikes twice in the same place",
  "One swallow doesn't make a summer",
  "The way to a man's heart is through his stomach",
  "The proof of the pudding is in the eating"
];

export default function LoadingSpinnerWithProverb() {
  const [currentProverb, setCurrentProverb] = useState(Math.floor(Math.random() * proverbs.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProverb((prev) => (prev + 1) % proverbs.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-6 max-w-md mx-4">
        <svg
          className="animate-spin h-12 w-12 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-center text-gray-600 animate-fade transition-opacity duration-300">
          {proverbs[currentProverb]}
        </p>
      </div>
    </div>
  );
}

export function LoadingSpinner({
  size = 'md',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-t-2 border-primary ${className}`}
      ></div>
    </div>
  );
}
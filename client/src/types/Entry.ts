export interface EnteredAcro {
  id: string;
  phrase: string;
}

export interface VotedAcro extends EnteredAcro {
  votes: number;
  isNonVoter: boolean;
  isFastest: boolean;
  isWinner: boolean;
  isWinnerVoter: boolean;
}
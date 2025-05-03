export interface EnteredAcro {
  id: string;
  acro: string;
}

export interface VotedAcro extends EnteredAcro {
  votes: number;
}
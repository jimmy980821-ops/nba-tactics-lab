import type { Point } from '../engine';
export type Movement = 'Move' | 'Dribble' | 'Screen' | 'Roll' | 'Pop' | 'Cut' | 'Chase' | 'Switch' | 'Help Defense';
export type Track = {
    player: string;
    start: number;
    end: number;
    points: Point[];
    kind: Movement;
    easing?: 'smooth' | 'linear' | 'accelerate' | 'decelerate';
};
export type BallEvent = {
    start: number;
    end: number;
    from: string;
    to: string | null;
    kind: 'Pass' | 'Shoot';
    target?: Point;
};
export type Annotation = {
    start: number;
    end: number;
    label: string;
    player?: string;
    point?: Point;
    kind: 'screen' | 'movement' | 'defense' | 'shot';
};
export type Zone = {
    start: number;
    end: number;
    center: Point;
    rx: number;
    ry: number;
    kind: 'space' | 'coverage';
    label: string;
};
export type TacticalAnalysis = {
    formation: string;
    initiator: string;
    roles: Record<string, string>;
    defense: string;
    read: string;
    keys: string[];
    failures: string[];
};
export type Scene = {
    version: 2;
    coverage: string;
    outcome: string;
    initialHandler: string;
    tracks: Track[];
    ballEvents: BallEvent[];
    annotations: Annotation[];
    zones: Zone[];
    analysis: TacticalAnalysis;
};

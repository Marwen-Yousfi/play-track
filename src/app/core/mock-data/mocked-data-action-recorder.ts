export const ACTION_TYPES = [
  { type: 'pass', label: 'Pass', icon: '⚡', pitchPosition: true },
  { type: 'duel', label: 'Duel', icon: '⚔️', pitchPosition: true },
  { type: 'defensive_action', label: 'Defensive Action', icon: '🛡️', pitchPosition: true },
  { type: 'dribbling', label: 'Dribbling', icon: '🏃', pitchPosition: true },
  { type: 'progressive_carry', label: 'Progressive Carry', icon: '💨', pitchPosition: true },
  { type: 'reception', label: 'Reception', icon: '🙌', pitchPosition: true },
  { type: 'press', label: 'Press', icon: '😤', pitchPosition: true },
  { type: 'shot', label: 'Shot', icon: '⚽', pitchPosition: true },
  { type: 'shot_direction', label: 'Shot Direction', icon: '🧭', pitchPosition: true },
  { type: 'shot_under_pressure', label: 'Shot Under Pressure', icon: '🥵', pitchPosition: true },
  { type: 'turn_over', label: 'Turn Over', icon: '🔄', pitchPosition: true },
  { type: 'foul', label: 'Foul', icon: '⚠️', pitchPosition: true },
  { type: 'sub', label: 'Substitution', icon: '🔁', pitchPosition: false },
  { type: 'free_kick', label: 'Free Kick', icon: '🎯', pitchPosition: true },
  { type: 'corner', label: 'Corner', icon: '🚩', pitchPosition: true },
  { type: 'goalkeeper_action', label: 'Goalkeeper Action', icon: '🧤', pitchPosition: true },
  { type: 'gk_distribution', label: 'GK Distribution', icon: '👐', pitchPosition: true },
  { type: 'card', label: 'Card', icon: '🟨', pitchPosition: true },
  { type: 'game_event', label: 'Game Event', icon: '⏱️', pitchPosition: false },
  { type: 'counter_attack', label: 'Counter Attack', icon: '⚡', pitchPosition: true },
  { type: 'penalty', label: 'Penalty', icon: '🥅', pitchPosition: true }
];

export const SUB_ACTION_TYPES: Record<string, { type: string; label: string; description: string; icon?: string }[]> = {
  pass: [
    { type: 'short', label: 'Short', description: 'A short-range pass typically aimed at a nearby teammate.' },
    { type: 'long', label: 'Long', description: 'A longer pass that covers more distance.' },
    { type: 'back', label: 'Back', description: 'A pass directed backward to a teammate, typically to reset or avoid pressure.' },
    { type: 'cross', label: 'Cross', description: 'A wide pass aimed to send the ball into the opponent\'s penalty box from the flanks.' },
    { type: 'deep_cross', label: 'Deep Cross', description: 'A cross delivered from inside the penalty box.' },
    { type: 'head', label: 'Head', description: 'A pass made using a header.' },
    { type: 'smart', label: 'Smart', description: 'A clever or well-weighted pass intended to unlock the defense or catch the opponent off guard.' },
    { type: 'through_ball', label: 'Through Ball', description: 'A pass aimed through the opposition\'s defensive line, often for a teammate to run onto.' },
    { type: 'deep_pass', label: 'Deep Pass', description: 'A pass played from inside the opponent’s penalty box.' },
    { type: 'switch_of_play', label: 'Switch of Play', description: 'A pass that changes the focus of the attack by switching from one side of the field to the other (right side to the left or vice versa).' },
    { type: 'final_3rd', label: 'Final 3rd', description: 'A pass into the final attacking third of the field, often aimed at setting up a shot.' },
    { type: 'throw_in', label: 'Throw In', description: 'A throw from the side-line to reintroduce the ball into play.' },
    { type: 'into_penalty', label: 'Into Penalty', description: 'A pass that enters the opponent\'s penalty box, often looking for a goal-scoring opportunity.' },
    { type: 'key_chance_creating', label: 'Key Chance-Creating', description: 'A pass that directly leads to a significant goal-scoring opportunity.' },
    { type: 'line_breaking_pass', label: 'Line-Breaking Pass', description: 'completed passes that advance the ball at least 10% closer to the opposition goal and that intersect a pair of defenders in close proximity (x-axis).' },
    { type: 'progressive', label: 'Progressive', description: 'A pass aimed at advancing the ball up the field.' }
  ],
  duel: [
    { type: 'ground', label: 'Ground', description: 'A duel contested on the ground, often for a loose ball or possession.' },
    { type: 'aerial', label: 'Aerial', description: 'A duel contested in the air, typically for a header or a high ball.' },
    { type: 'ground_2nd_ball', label: 'Ground 2nd Ball', description: 'A duel for a ball that has already been played or cleared, usually on the ground.' },
    { type: 'aerial_2nd_ball', label: 'Aerial 2nd Ball', description: 'A duel for a ball that has been cleared or headed away, contested in the air.' }
  ],
  defensive_action: [
    { type: 'clearance', label: 'Clearance', description: 'A defensive action where a player kicks the ball out of their defensive area.' },
    { type: 'interception', label: 'Interception', description: 'When a player anticipates and cuts off a pass from the opposition.' },
    { type: 'defensive_header', label: 'Defensive Header', description: 'A header made by a defender to clear or block the ball, typically from a cross or aerial threat, there was no duel here otherwise u tag it as duel but rather the defender was the only player getting the aerial ball and heading it, no opponent player going up with him.' },
    { type: 'tackle', label: 'Tackle', description: 'An attempt to take the ball away from an opponent by making contact with the ball, often on the ground.' },
    { type: 'slide_tackle', label: 'Slide Tackle', description: 'A tackle made by sliding on the ground in an effort to win possession of the ball.' },
    { type: 'block_shot', label: 'Block Shot', description: 'When a defender blocks a shot on goal.' },
    { type: 'block_cross', label: 'Block Cross', description: 'When a defender blocks a cross from the opposition.' }
  ],
  dribbling: [
    { type: 'attempt', label: 'Attempt', description: 'An attempt to dribble past an opponent (go past an opponent using skill or a clever play).' }
  ],
  progressive_carry: [
    { type: 'acceleration', label: 'Acceleration', description: 'A carry where the player accelerates while moving the ball forward (pushes the ball in front of him and runs after it).' },
    { type: 'no_acceleration', label: 'No Acceleration', description: 'A carry without significant acceleration (just walking the ball to win some ground).' }
  ],
  reception: [
    { type: 'under_pressure', label: 'Under Pressure', description: 'Receiving the ball while under pressure from an opponent.' },
    { type: 'no_pressure', label: 'No Pressure', description: 'Receiving the ball without any immediate opposition.' }
  ],
  press: [
    { type: 'pressing', label: 'Pressing', description: 'Actively applying pressure on the ball carrier.' },
    { type: 'counter_pressing', label: 'Counter Pressing', description: 'Applying immediate pressure after losing possession.' }
  ],
  shot: [
    { type: 'head', label: 'Head', description: 'A shot made using a header.' },
    { type: 'rf', label: 'RF', description: 'A shot made with the right foot.' },
    { type: 'lf', label: 'LF', description: 'A shot made with the left foot.' }
  ],
  shot_direction: [
    { type: 'bottom_right', label: 'Bottom Right', description: 'The shot is aimed toward the bottom right corner of the goal.' },
    { type: 'bottom_left', label: 'Bottom Left', description: 'The shot is aimed toward the bottom left corner of the goal.' },
    { type: 'bottom_centre', label: 'Bottom Centre', description: 'The shot is aimed at the center of the bottom part of the goal.' },
    { type: 'top_right', label: 'Top Right', description: 'The shot is aimed toward the top right corner of the goal.' },
    { type: 'top_left', label: 'Top Left', description: 'The shot is aimed toward the top left corner of the goal.' },
    { type: 'top_centre', label: 'Top Centre', description: 'The shot is aimed at the center of the top part of the goal.' },
    { type: 'mid_right', label: 'Mid right', description: 'The shot is aimed toward the middle right side of the goal.' },
    { type: 'mid_left', label: 'Mid left', description: 'The shot is aimed toward the middle left side of the goal.' },
    { type: 'mid_centre', label: 'Mid centre', description: 'The shot is aimed toward the middle center of the goal.' }
  ],
  shot_under_pressure: [
    { type: 'head', label: 'Head', description: 'A shot taken using the head under pressure.' },
    { type: 'rf', label: 'RF', description: 'A shot with the right foot under pressure.' },
    { type: 'lf', label: 'LF', description: 'A shot with the left foot under pressure.' }
  ],
  turn_over: [
    { type: 'transition', label: 'Transition', description: 'A change from one team controlling the ball to the other.' }
  ],
  foul: [
    { type: 'regular', label: 'Regular', description: 'A standard foul, usually resulting in a free kick.' },
    { type: 'aggressive', label: 'Aggressive', description: 'A foul committed with excessive force or aggression.' }
  ],
  sub: [
    { type: 'injury', label: 'Injury', description: 'Substitution made due to an injury.' },
    { type: 'tactical', label: 'Tactical', description: 'Substitution made for tactical reasons.' }
  ],
  free_kick: [
    { type: 'cross', label: 'Cross', description: 'A free kick taken with the intent to deliver a cross into the box.' },
    { type: 'long', label: 'Long', description: 'A long free kick, usually aimed to clear or switch play.' },
    { type: 'shot', label: 'Shot', description: 'A free kick aimed directly at goal.' },
    { type: 'direct', label: 'Direct', description: 'A free kick where the ball can be shot directly at goal without touching another player.' }
  ],
  corner: [
    { type: 'far_post', label: 'Far Post', description: 'A corner taken aiming at the far post.' },
    { type: 'near_post', label: 'Near Post', description: 'A corner taken aiming at the near post.' },
    { type: 'centre_box', label: 'Centre Box', description: 'A corner taken aimed at the central area of the penalty box.' },
    { type: 'short', label: 'Short', description: 'A short corner is a quick pass played to a nearby teammate.' },
    { type: 'direct_goal', label: 'Direct Goal', description: 'A corner that is taken with the intent to score directly from the corner.' }
  ],
  goalkeeper_action: [
    { type: 'through_ball_pass_against', label: 'Through Ball Pass Against', description: 'A pass made to a goalkeeper against a through ball.' },
    { type: 'shot_against', label: 'Shot Against', description: 'A shot directed toward the goalkeeper.' },
    { type: 'cross_against', label: 'Cross Against', description: 'A cross made toward the goalkeeper\'s area.' },
    { type: 'corner_against', label: 'Corner Against', description: 'A corner taken towards the goalkeeper\'s goal area.' },
    { type: 'penalty_against', label: 'Penalty Against', description: 'A penalty kick taken against the goalkeeper.' },
    { type: '1_on_1', label: '1 on 1', description: 'A direct confrontation between the goalkeeper and an attacker.' }
  ],
  gk_distribution: [
    { type: 'feet_progressive_ground', label: 'Feet Progressive Ground', description: 'A distribution made with the feet on the ground, aiming to progress the ball forward.' },
    { type: 'feet_short', label: 'Feet Short', description: 'A short pass made using the feet from the goalkeeper.' },
    { type: 'hand_progressive_long_pass', label: 'Hand Progressive Long Pass', description: 'A long distribution made with the hands to move the ball upfield.' },
    { type: 'hand_short', label: 'Hand Short', description: 'A short distribution made using the hands.' },
    { type: 'goal_kick', label: 'Goal Kick', description: 'A goal kick taken by the goalkeeper.' },
    { type: 'hand_to_final_3rd', label: 'Hand to Final 3rd', description: 'A distribution made with the hands aimed at reaching the final third.' },
    { type: 'feet_to_final_3rd', label: 'Feet to Final 3rd', description: 'A distribution made with the feet aimed at reaching the final third.' }
  ],
  card: [
    { type: 'yellow', label: 'Yellow', description: 'A yellow card.' },
    { type: 'red', label: 'Red', description: 'A red card.' }
  ],
  game_event: [
    { type: 'dead_time', label: 'Dead Time', description: 'Time when play is stopped, typically for injury or other reasons.' },
    { type: '1st_half', label: '1st Half', description: 'The first half of the match.' },
    { type: '2nd_half', label: '2nd Half', description: 'The second half of the match.' },
    { type: 'offside', label: 'Offside', description: 'A player is offside during play.' },
    { type: 'own_goal', label: 'Own Goal', description: 'A goal scored unintentionally by a teammate for the opposing team.' },
    { type: 'extra_time', label: 'Extra Time', description: 'The additional time added at the end of the 1st half or 2nd half to count for some of the dead time.' },
    { type: 'extra_time_1', label: 'Extra Time 1', description: 'The first half of extra time (The additional time added at the end of the match to break a tie during cup games).' },
    { type: 'extra_time_2', label: 'Extra Time 2', description: 'The second half of extra time.' }
  ],
  counter_attack: [
    { type: 'ball_pressing', label: 'Ball Pressing', description: 'Counter-attacking by pressing for the ball.' },
    { type: 'no_pressing', label: 'No Pressing', description: 'Counter-attacking without pressing for the ball.' }
  ],
  penalty: [
    { type: 'left_foot', label: 'Left Foot', description: 'A penalty taken with the left foot.' },
    { type: 'right_foot', label: 'Right Foot', description: 'A penalty taken with the right foot.' }
  ]
};

export const SUB_EVENTS: Record<string, { type: string; label: string; description: string }[]> = {
  pass: [
    { type: 'succ', label: 'Succ', description: 'The pass was successful.' },
    { type: 'failed', label: 'Failed', description: 'The pass was unsuccessful.' },
    { type: 'succ_under_pressure', label: 'Succ Under Pressure', description: 'The pass was successful despite pressure from the opponent.' },
    { type: 'failed_under_pressure', label: 'Failed Under Pressure', description: 'The pass was unsuccessful when there was pressure from the opposition.' },
    { type: 'primary_assist', label: 'Primary Assist', description: 'The pass directly leading to a goal.' }
  ],
  duel: [
    { type: 'won', label: 'Won', description: 'The player won the duel, gaining possession of the ball.' },
    { type: 'lost', label: 'Lost', description: 'The player lost the duel, and the opponent gained possession.' }
  ],
  defensive_action: [
    { type: 'succ', label: 'Succ', description: 'The defensive action was successful.' },
    { type: 'unsucc', label: 'Unsucc', description: 'The defensive action was unsuccessful.' }
  ],
  dribbling: [
    { type: 'succ', label: 'Succ', description: 'The dribble was successful, and the player kept possession of the ball.' },
    { type: 'unsucc', label: 'Unsucc', description: 'The dribble was unsuccessful, and the player lost possession.' }
  ],
  progressive_carry: [
    { type: 'succ', label: 'Succ', description: 'The carry was successful, and the player moved the ball forward effectively.' },
    { type: 'unsucc', label: 'Unsucc', description: 'The carry was unsuccessful, and the player lost possession or failed to progress.' }
  ],
  reception: [
    { type: 'succ', label: 'Succ', description: 'The reception was successful, and the player gained control of the ball.' },
    { type: 'missed_control', label: 'Missed Control', description: 'The player failed to control the ball, leading to a loss of possession.' }
  ],
  press: [
    { type: 'attempt', label: 'Attempt', description: 'The player made an attempt to press the opposition.' }
  ],
  shot: [
    { type: 'goal', label: 'Goal', description: 'The shot resulted in a goal.' },
    { type: 'off_target', label: 'Off Target', description: 'The shot missed the goal.' },
    { type: 'on_target', label: 'On Target', description: 'The shot was on target but did not result in a goal.' },
    { type: 'blocked', label: 'Blocked', description: 'The shot was blocked by a defender or goalkeeper.' }
  ],
  shot_direction: [
    { type: 'no_pressure', label: 'No Pressure', description: 'The shot was taken without any immediate pressure from the opposition.' },
    { type: 'under_pressure', label: 'Under Pressure', description: 'The shot was taken under pressure from the opposition.' }
  ],
  shot_under_pressure: [
    { type: 'goal', label: 'Goal', description: 'The shot resulted in a goal.' },
    { type: 'off_target', label: 'Off Target', description: 'The shot missed the goal.' },
    { type: 'on_target', label: 'On Target', description: 'The shot was on target but did not necessarily result in a goal.' },
    { type: 'blocked', label: 'Blocked', description: 'The shot was blocked by a defender or goalkeeper.' }
  ],
  turn_over: [
    { type: 'won_possession', label: 'Won Possession', description: 'The team won possession of the ball.' },
    { type: 'lost_possession', label: 'Lost Possession', description: 'The team lost possession of the ball.' },
    { type: 'counter_attack_won', label: 'Counter Attack Won', description: 'The team successfully won the ball and counterattacked.' },
    { type: 'counter_attack_against', label: 'Counter Attack Against', description: 'The team lost the ball and faced a counterattack from the opposition.' }
  ],
  foul: [
    { type: 'won', label: 'Won', description: 'The player won a free kick or penalty from the foul.' },
    { type: 'against', label: 'Against', description: 'The player committed a foul against the opponent.' },
    { type: 'penalty_won', label: 'Penalty Won', description: 'A foul that led to a penalty for the player’s team.' },
    { type: 'penalty_against', label: 'Penalty Against', description: 'A foul that led to a penalty for the opponent.' }
  ],
  sub: [
    { type: 'in', label: 'In', description: 'The player was substituted in.' },
    { type: 'out', label: 'Out', description: 'The player was substituted out.' }
  ],
  free_kick: [
    { type: 'blocked_intercepted', label: 'Blocked / Intercepted', description: 'The free kick was blocked or intercepted by a defender.' },
    { type: 'completed', label: 'Completed', description: 'The free kick was successfully delivered.' },
    { type: 'on_target', label: 'On Target', description: 'The free kick was aimed at the goal and was on target.' },
    { type: 'off_target', label: 'Off Target', description: 'The free kick missed the target.' },
    { type: 'goal', label: 'Goal', description: 'The free kick resulted in a goal.' },
    { type: 'assist', label: 'Assist', description: 'The free kick led to a goal.' },
    { type: 'failed_trajectory', label: 'Failed Trajectory', description: 'The free kick did not have the intended result and was way off target or off play.' },
    { type: 'resulted_in_shot', label: 'Resulted in Shot', description: 'The free kick led to another player taking a shot.' }
  ],
  corner: [
    { type: 'in_swing', label: 'In Swing', description: 'A corner taken with the ball curving in towards the goal.' },
    { type: 'out_swing', label: 'Out Swing', description: 'A corner taken with the ball curving away from the goal.' },
    { type: 'straight', label: 'Straight', description: 'A corner taken without any curve or bend.' }
  ],
  goalkeeper_action: [
    { type: 'goal_conceeded', label: 'Goal Conceeded', description: 'The goalkeeper allowed a goal.' },
    { type: 'catch', label: 'Catch', description: 'The goalkeeper caught the ball from a shot or cross.' },
    { type: 'hand_save', label: 'Hand Save', description: 'A save made by the goalkeeper using their hands.' },
    { type: 'feet_reflex', label: 'Feet Reflex', description: 'A reflex save made with the feet.' },
    { type: 'hit_the_bar', label: 'Hit the Bar', description: 'The ball hit the crossbar during the goalkeeper\'s attempt to save.' }
  ],
  gk_distribution: [
    { type: 'succ', label: 'Succ', description: 'The distribution was successful.' },
    { type: 'unsucc', label: 'Unsucc', description: 'The distribution was unsuccessful.' },
    { type: 'assist', label: 'Assist', description: 'The distribution led to a goal or significant play.' },
    { type: 'key_into_penalty_area', label: 'Key Into Penalty Area', description: 'The distribution led to a ball entering the opponent’s penalty area.' }
  ],
  card: [
    { type: 'against', label: 'Against', description: 'The card was shown against a player for a foul or misconduct.' }
  ],
  game_event: [
    { type: 'start', label: 'Start', description: 'The event has started.' },
    { type: 'end', label: 'End', description: 'The event has ended.' },
    { type: 'against', label: 'Against', description: 'The event occurred against the player or team.' },
    { type: 'won', label: 'Won', description: 'The event resulted in a positive outcome for the team or player.' }
  ],
  counter_attack: [
    { type: 'succ', label: 'Succ', description: 'The counter-attack was successful.' },
    { type: 'unsucc', label: 'Unsucc', description: 'The counter-attack was unsuccessful.' }
  ],
  penalty: [
    { type: 'goal', label: 'Goal', description: 'The penalty resulted in a goal.' },
    { type: 'missed', label: 'Missed', description: 'The penalty was missed by the player.' },
    { type: 'off_target', label: 'Off Target', description: 'The penalty was off target.' },
    { type: 'hit_the_bar', label: 'Hit the Bar', description: 'The penalty hit the crossbar.' }
  ]
};

